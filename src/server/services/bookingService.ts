import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  assertTransition,
  SLOT_HOLDING_STATUSES,
  SLOT_RELEASING_STATUSES,
  type BookingStatus,
} from "../domain/bookingStatus";
import {
  COUNSELING_SERVICE_DEFAULTS,
  type CounselingType,
} from "../domain/counselingType";
import { resolveBookingCommissionBps } from "./commissionService";
import {
  chargeIdempotencyKey,
  createCharge,
  recordChargeSuccess,
} from "./paymentService";
import { badRequest, conflict, notFound, type Session } from "../http";
import { recordAudit } from "../audit";
import {
  isGeneratedSlotStart,
  generateFreeCallSlots,
  sessionOverlapsWorkingHours,
} from "../domain/workingHours";
import { clinicDayOfWeekForDate, formatClinicTime } from "../clinicTime";
import { notifyBookingCancelled, notifyBookingCreated, notifyBookingRescheduled, notifyFeeWaivedBookingApproved } from "./emailNotificationService";
import { cancelBookingMeeting, syncBookingMeeting } from "./googleCalendarService";
import { defaultPaymentProviderName, getPaymentProvider } from "../payments/registry";

// Booking lifecycle service. All state changes flow through the domain state
// machine and are journalled to BookingStatusHistory. A public submission is
// a request, not a calendar hold; only recorded payment creates BookingSlot.

/** Minutes an unpaid AWAITING_PAYMENT reservation holds its slot. */
export const RESERVATION_TTL_MINUTES = 30;

// Neon's network round trips can exceed Prisma's 5-second interactive
// transaction default during cold starts. Booking writes remain bounded, but
// have enough time to finish their validation, audit, and slot-hold queries.
const BOOKING_TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

export interface CreateBookingInput {
  guardianName?: string; guardianPhone?: string; guardianConsent?: boolean;
  referralSource?: string; referralDoctor?: string; utmSource?: string; utmCampaign?: string; gclid?: string; fbclid?: string;
  therapistSlug: string;
  serviceSlug: string;
  dateTime: Date;
  client: {
    name: string;
    email: string;
    phone: string;
    age: number;
    emergencyContact: string;
    gdprConsent: boolean;
  };
}

/**
 * Cancel AWAITING_PAYMENT holds whose TTL lapsed, freeing their slots.
 * Runs lazily ahead of availability reads and booking writes.
 */
export async function releaseExpiredReservations(
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  const expired = await tx.booking.findMany({
    where: { status: "AWAITING_PAYMENT", expiresAt: { lt: new Date() } },
    select: { id: true, status: true },
  });
  let released = 0;
  for (const booking of expired) {
    // CAS: only cancel if the hold is STILL an expired AWAITING_PAYMENT.
    // A payment confirmation racing this sweep may have just flipped the
    // booking to CONFIRMED — an unconditional update here would clobber a
    // paid booking with CANCELLED. When the guard misses, skip: no history
    // row, no slot release.
    const cancelled = await tx.booking.updateMany({
      where: {
        id: booking.id,
        status: "AWAITING_PAYMENT",
        expiresAt: { lt: new Date() },
      },
      data: {
        status: "CANCELLED",
        cancellationReason: "Payment window expired",
        expiresAt: null,
      },
    });
    if (cancelled.count === 0) continue;
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: booking.status,
        toStatus: "CANCELLED",
        actorType: "SYSTEM",
        reason: "Reservation expired before payment",
      },
    });
    await tx.bookingSlot.deleteMany({ where: { bookingId: booking.id } });
    released++;
  }
  return released;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

async function validateSlotWithinSchedule(
  tx: Prisma.TransactionClient,
  therapistId: string,
  dateTime: Date,
  durationMinutes: number,
  requireWorkingHours = true,
  freeCall = false,
): Promise<void> {
  if (dateTime.getTime() <= Date.now()) {
    throw badRequest("Sessions must be booked for a future time");
  }

  if (requireWorkingHours) {
    const startTime = formatClinicTime(dateTime);

    const windows = await tx.therapistAvailability.findMany({
      where: { therapistId, dayOfWeek: clinicDayOfWeekForDate(dateTime) },
      select: { startTime: true, endTime: true },
    });
    if (!(freeCall ? generateFreeCallSlots(windows).some(slot => slot.startTime === startTime) : isGeneratedSlotStart(startTime, windows)))
      throw conflict(
        "The selected time is outside the consultant's working hours",
      );
  }

  const end = new Date(dateTime.getTime() + durationMinutes * 60000);
  const block = await tx.slotBlock.findFirst({
    where: { therapistId, startAt: { lt: end }, endAt: { gt: dateTime } },
  });
  if (block)
    throw conflict("The consultant is unavailable at the selected time");
}

async function assertNoOverlappingBooking(
  tx: Prisma.TransactionClient,
  therapistId: string,
  dateTime: Date,
  durationMinutes: number,
  excludeBookingId?: string,
): Promise<void> {
  // Serialize calendar checks per consultant, then inspect active Booking
  // rows directly. This covers historical PENDING staff appointments that
  // predate BookingSlot creation as well as arbitrary-minute overlaps.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`calendar:${therapistId}`}))`;

  const end = new Date(dateTime.getTime() + durationMinutes * 60000);
  const candidates = await tx.booking.findMany({
    where: {
      therapistId,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      status: { in: SLOT_HOLDING_STATUSES },
      dateTime: {
        gt: new Date(dateTime.getTime() - 24 * 60 * 60000),
        lt: end,
      },
    },
    select: {
      dateTime: true,
      durationMinutes: true,
    },
  });
  const overlaps = candidates.some(
    (candidate) =>
      candidate.dateTime.getTime() + candidate.durationMinutes * 60000 >
      dateTime.getTime(),
  );
  if (overlaps) {
    throw conflict(
      "The consultant already has an overlapping appointment. Please pick another time.",
      "SLOT_TAKEN",
    );
  }
}

export async function createBooking(input: CreateBookingInput) {
  if (input.client.age < 18 && (!input.guardianName?.trim() || input.guardianName.trim().length < 2 || !input.guardianPhone?.trim() || input.guardianPhone.trim().length < 8 || input.guardianConsent !== true)) throw badRequest("Parent or guardian name, phone and consent are required for under-18 bookings");
  const providerName = defaultPaymentProviderName();
  // Manual is deliberately retained for desk-arranged payments. Every other
  // configured provider uses the secure online checkout reservation flow.
  const isFreeCall = input.serviceSlug === "free-15-minute-call";
  const requiresOnlinePayment = !isFreeCall && providerName !== "manual";
  if (requiresOnlinePayment) getPaymentProvider(providerName);

  const result = await prisma.$transaction(async (tx) => {
    await releaseExpiredReservations(tx);

    const therapist = await tx.therapist.findUnique({
      where: { slug: input.therapistSlug },
    });
    if (!therapist || !therapist.isActive || therapist.status !== "APPROVED") {
      throw notFound(
        "Consultant not found or not currently accepting bookings",
      );
    }
    const service = await tx.service.findUnique({
      where: { slug: input.serviceSlug },
      include: {
        therapists: { where: { id: therapist.id }, select: { id: true } },
      },
    });
    if (!service || !service.isActive) throw notFound("Service not found");
    // The service-first flow only ever offers consultants who provide the
    // chosen service; enforce it server-side so a crafted request can't book
    // a consultant for a service they don't offer.
    if (service.therapists.length === 0) {
      throw conflict("This consultant does not offer the selected service");
    }
    const serviceRate = await tx.therapistServiceRate.findUnique({
      where: {
        therapistId_serviceId: { therapistId: therapist.id, serviceId: service.id },
      },
      select: { feeMinor: true },
    });

    await validateSlotWithinSchedule(
      tx,
      therapist.id,
      input.dateTime,
      service.durationMinutes,
      true,
      isFreeCall,
    );
    await assertNoOverlappingBooking(
      tx,
      therapist.id,
      input.dateTime,
      service.durationMinutes,
    );

    const client = await tx.client.upsert({
      where: { email: input.client.email },
      update: {
        name: input.client.name,
        phone: input.client.phone,
        age: input.client.age,
        ...(input.client.emergencyContact ? { emergencyContact: input.client.emergencyContact } : {}),
      },
      create: { ...input.client },
    });

    const commissionBps = await resolveBookingCommissionBps(therapist, tx);
    const initialStatus: BookingStatus = isFreeCall ? "CONFIRMED" : requiresOnlinePayment
      ? "AWAITING_PAYMENT"
      : "PENDING";
    const expiresAt = requiresOnlinePayment
      ? new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000)
      : null;

    const booking = await tx.booking.create({
      data: {
        therapistId: therapist.id,
        serviceId: service.id,
        clientId: client.id,
        guardianName: input.client.age < 18 ? input.guardianName.trim() : null,
        guardianPhone: input.client.age < 18 ? input.guardianPhone.trim() : null,
        guardianConsentAt: input.client.age < 18 ? new Date() : null,
        referralSource: input.referralSource, referralDoctor: input.referralDoctor,
        utmSource: input.utmSource, utmCampaign: input.utmCampaign, gclid: input.gclid, fbclid: input.fbclid,
        dateTime: input.dateTime,
        durationMinutes: service.durationMinutes,
        // Snapshot the configured consultant/service rate. Historical
        // bookings are never rewritten when an admin changes future pricing.
        amountMinor: isFreeCall ? 0 : serviceRate?.feeMinor ?? therapist.feeMinor,
        commissionBps,
        status: initialStatus,
        paymentStatus: isFreeCall ? "PAID" : "UNPAID",
        expiresAt,
        invoiceNumber: null,
      },
    });
    // Every live booking owns a slot record, including desk-arranged/manual
    // payments. The active-booking overlap check above protects arbitrary
    // durations; this unique claim is a second concurrency guard for exact
    // start-time races.
    try {
      await tx.bookingSlot.create({
        data: {
          therapistId: therapist.id,
          startAt: input.dateTime,
          bookingId: booking.id,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw conflict(
          "That time was just reserved by another client. Please choose another slot.",
          "SLOT_TAKEN",
        );
      }
      throw error;
    }
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: null,
        toStatus: initialStatus,
        actorType: "CLIENT",
        reason: isFreeCall ? "Free introductory call booked" : requiresOnlinePayment
          ? "Online payment reservation created"
          : "Booking request submitted; client must contact admin",
      },
    });

    return { booking, client, therapist, service };
  }, BOOKING_TRANSACTION_OPTIONS);

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: result.booking.id },
    include: { client: true, therapist: true, service: true },
  });
  // This deliberately sits outside the booking transaction: email or Google
  // outages must never lose the booking request. The email journal prevents
  // duplicate delivery if a request is retried.
  if (isFreeCall) {
    await notifyFeeWaivedBookingApproved(booking.id).catch(error => console.error("Free call notification failed", error));
    return { booking, payment: null };
  }
  await notifyBookingCreated(booking.id).catch((error) =>
    console.error("Could not send booking-created notifications", booking.id, error),
  );
  if (!requiresOnlinePayment) return { booking, payment: null };

  // Gateway calls must not run inside the database transaction. If the call
  // fails, the reserved booking remains reachable on the payment-status page,
  // where the client can safely retry within its 30-minute reservation window.
  let payment: { checkoutUrl: string } | null = null;
  try {
    const charge = await createCharge({
      bookingId: booking.id,
      idempotencyKey: chargeIdempotencyKey(booking.id, 1),
      providerName,
    });
    if (
      charge.clientAction.type === "checkout" &&
      typeof charge.clientAction.payload.checkoutUrl === "string"
    ) {
      payment = { checkoutUrl: charge.clientAction.payload.checkoutUrl };
    }
  } catch (error) {
    console.error("Could not create online payment checkout", booking.id, error);
  }

  return { booking, payment };
}

/**
 * Admin/consultant-driven status transition with full journalling.
 * Slot holds are released when the booking reaches a releasing status.
 */
export async function transitionBooking(input: {
  bookingId: string;
  toStatus: BookingStatus;
  session?: Session | null;
  actorType?: "ADMIN" | "RECEPTIONIST" | "THERAPIST" | "CLIENT" | "SYSTEM";
  reason?: string;
  ip?: string;
}) {
  const updated = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: input.bookingId },
      include: { slot: true },
    });
    if (!booking) throw notFound("Booking not found");

    if (
      booking.status === "PENDING" &&
      input.toStatus === "CONFIRMED" &&
      booking.paymentStatus !== "PAID"
    ) {
      throw conflict(
        "Record payment before confirming a session request. The appointment time is already reserved while it is pending.",
      );
    }

    assertTransition(booking.status, input.toStatus);

    // Rejecting a refund reinstates the booking — but not while the gateway
    // is still processing the refund; the money may already be on its way
    // back to the payer.
    if (booking.status === "REFUND_PENDING" && input.toStatus === "CONFIRMED") {
      const inflight = await tx.paymentRecord.findFirst({
        where: {
          bookingId: booking.id,
          kind: "REFUND",
          status: { in: ["CREATED", "PROCESSING"] },
        },
      });
      if (inflight) {
        throw conflict(
          "A refund is currently being processed for this booking and cannot be rejected. Wait for it to settle.",
        );
      }
    }

    const data: Prisma.BookingUpdateManyMutationInput = {
      status: input.toStatus,
    };
    if (input.toStatus === "CANCELLED") {
      data.cancellationReason = input.reason ?? "Cancelled by staff";
      data.expiresAt = null;
    }

    // CAS on the status we validated against: if a concurrent actor (e.g. a
    // payment webhook confirming this booking) moved it first, this stale
    // transition must not clobber theirs.
    const moved = await tx.booking.updateMany({
      where: { id: booking.id, status: booking.status },
      data,
    });
    if (moved.count === 0) {
      throw conflict(
        "The booking was updated concurrently — reload and try again",
      );
    }
    const updated = await tx.booking.findUniqueOrThrow({
      where: { id: booking.id },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: booking.status,
        toStatus: input.toStatus,
        actorType: input.actorType ?? input.session?.role ?? "SYSTEM",
        actorId: input.session?.userId ?? null,
        reason: input.reason ?? null,
      },
    });
    if (SLOT_RELEASING_STATUSES.includes(input.toStatus) && booking.slot) {
      await tx.bookingSlot.delete({ where: { id: booking.slot.id } });
    }
    await recordAudit(
      {
        session: input.session ?? null,
        action: `booking.${input.toStatus.toLowerCase()}`,
        entityType: "Booking",
        entityId: booking.id,
        detail: {
          from: booking.status,
          to: input.toStatus,
          reason: input.reason,
        },
        ip: input.ip,
      },
      tx,
    );
    return updated;
  });
  if (input.toStatus === "CANCELLED") {
    await cancelBookingMeeting(updated.id).catch((error) =>
      console.error("Could not cancel Google Calendar event", updated.id, error),
    );
    await notifyBookingCancelled(updated.id).catch((error) =>
      console.error("Could not send cancellation notifications", updated.id, error),
    );
  }
  return updated;
}

/**
 * Move a booking to a new slot. Staff may deliberately choose a time outside
 * the published working hours, but future-time, leave-block, and overlap
 * safeguards remain enforced atomically.
 */
export async function rescheduleBooking(input: {
  bookingId: string;
  newDateTime: Date;
  session: Session;
  reason?: string;
  ip?: string;
}) {
  const updated = await prisma.$transaction(async (tx) => {
    await releaseExpiredReservations(tx);

    const booking = await tx.booking.findUnique({
      where: { id: input.bookingId },
      include: { slot: true },
    });
    if (!booking) throw notFound("Booking not found");
    if (
      !["PENDING", "AWAITING_PAYMENT", "CONFIRMED"].includes(booking.status)
    ) {
      throw conflict(
        `A ${booking.status.toLowerCase()} booking cannot be rescheduled`,
      );
    }

    await validateSlotWithinSchedule(
      tx,
      booking.therapistId,
      input.newDateTime,
      booking.durationMinutes,
      false,
    );

    if (booking.slot) {
      await tx.bookingSlot.delete({ where: { id: booking.slot.id } });
    }
    try {
      await assertNoOverlappingBooking(
        tx,
        booking.therapistId,
        input.newDateTime,
        booking.durationMinutes,
        booking.id,
      );
      await tx.bookingSlot.create({
        data: {
          therapistId: booking.therapistId,
          startAt: input.newDateTime,
          bookingId: booking.id,
        },
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw conflict(
          "The new time slot is no longer available",
          "SLOT_TAKEN",
        );
      }
      throw err;
    }

    const previous = booking.dateTime;
    const updated = await tx.booking.update({
      where: { id: booking.id },
      data: { dateTime: input.newDateTime },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: booking.status,
        toStatus: booking.status,
        actorType: input.session.role,
        actorId: input.session.userId,
        reason:
          input.reason ??
          `Rescheduled from ${previous.toISOString()} to ${input.newDateTime.toISOString()}`,
      },
    });
    await recordAudit(
      {
        session: input.session,
        action: "booking.reschedule",
        entityType: "Booking",
        entityId: booking.id,
        detail: {
          from: previous.toISOString(),
          to: input.newDateTime.toISOString(),
        },
        ip: input.ip,
      },
      tx,
    );
    return updated;
  });
  await syncBookingMeeting(updated.id).catch((error) =>
    console.error("Could not update Google Calendar event", updated.id, error),
  );
  await notifyBookingRescheduled(updated.id).catch((error) =>
    console.error("Could not send reschedule notifications", updated.id, error),
  );
  return updated;
}

/**
 * Resolve a counselling type to a concrete Service row, upserting the
 * canonical offering by slug the first time a type is scheduled so the
 * catalogue always carries a matching, priced, timed service.
 */
async function resolveCounselingService(
  tx: Prisma.TransactionClient,
  type: CounselingType,
) {
  const def = COUNSELING_SERVICE_DEFAULTS[type];
  return tx.service.upsert({
    where: { slug: def.slug },
    update: {},
    create: {
      name: def.name,
      description: def.description,
      durationMinutes: def.durationMinutes,
      priceMinor: def.priceMinor,
      slug: def.slug,
      isActive: true,
      availability: def.availability,
    },
  });
}

export type ScheduleClientInput =
  | { existingId: string }
  | {
      new: {
        name: string;
        email: string;
        phone: string;
        age: number;
        emergencyContact: string;
      };
    };

export interface ScheduleAdminBookingInput {
  therapistId: string;
  counselingType: CounselingType;
  dateTime: Date;
  feeMinor: number;
  paymentReceived: boolean;
  isOvertime?: boolean;
  paymentRef?: string;
  client: ScheduleClientInput;
  session: Session;
  ip?: string;
}

/**
 * Staff appointment scheduling (admin console and reception desk). Captures
 * the consultant, counselling type, date/time and fee, attaching an existing
 * or freshly-created client.
 * The booking is created PENDING and immediately holds its calendar slot,
 * even before payment is collected. The DB uniqueness guard prevents races,
 * and leave blocks are honoured. When the fee has already been collected the
 * payment is recorded through the manual provider so revenue/commission
 * ledgers stay accurate.
 *
 * Deliberately not exposed to consultants — only /api/admin and
 * /api/reception routes call this.
 */
export async function scheduleAdminBooking(input: ScheduleAdminBookingInput) {
  if (!Number.isInteger(input.feeMinor) || input.feeMinor < 0) {
    throw badRequest("The session fee cannot be negative");
  }
  const isFeeWaived = input.feeMinor === 0;

  const created = await prisma.$transaction(async (tx) => {
    await releaseExpiredReservations(tx);

    const therapist = await tx.therapist.findUnique({
      where: { id: input.therapistId },
      include: {
        services: { select: { slug: true } },
      },
    });
    if (!therapist) throw notFound("Consultant not found");
    if (!therapist.isActive || therapist.status !== "APPROVED") {
      throw conflict("This consultant is not currently accepting appointments");
    }

    const serviceDefinition = COUNSELING_SERVICE_DEFAULTS[input.counselingType];
    if (
      !therapist.services.some(
        (offeredService) => offeredService.slug === serviceDefinition.slug,
      )
    ) {
      throw conflict("This consultant does not offer the selected service");
    }
    const service = await resolveCounselingService(tx, input.counselingType);

    // Resolve the client: an existing record by id, or upsert a new one by
    // email so repeat clients are never duplicated.
    let clientId: string;
    if ("existingId" in input.client) {
      const existing = await tx.client.findUnique({
        where: { id: input.client.existingId },
      });
      if (!existing) throw notFound("Selected client not found");
      clientId = existing.id;
    } else {
      const c = input.client.new;
      const client = await tx.client.upsert({
        where: { email: c.email.toLowerCase() },
        update: {
          name: c.name,
          phone: c.phone,
          age: c.age,
          emergencyContact: c.emergencyContact,
        },
        create: {
          name: c.name,
          email: c.email.toLowerCase(),
          phone: c.phone,
          age: c.age,
          emergencyContact: c.emergencyContact,
          gdprConsent: true,
        },
      });
      clientId = client.id;
    }

    if (input.dateTime.getTime() <= Date.now()) {
      throw badRequest("Appointments must be scheduled for a future time");
    }
    const isOvertime = input.isOvertime === true;
    if (isOvertime && !["RECEPTIONIST", "ADMIN"].includes(input.session.role)) {
      throw badRequest("Only authorised front-desk staff can book overtime");
    }

    // Leave takes precedence over working-hours and overtime validation: for
    // any proposed time on a leave period, staff should see the reason the
    // consultant cannot be booked instead of an unrelated schedule message.
    const end = new Date(
      input.dateTime.getTime() + service.durationMinutes * 60000,
    );
    const block = await tx.slotBlock.findFirst({
      where: {
        therapistId: therapist.id,
        startAt: { lt: end },
        endAt: { gt: input.dateTime },
      },
    });
    if (block) {
      throw conflict(
        "The consultant is on a leave",
        "CONSULTANT_ON_LEAVE",
      );
    }

    const startTime = formatClinicTime(input.dateTime);
    const windows = await tx.therapistAvailability.findMany({
      where: {
        therapistId: therapist.id,
        dayOfWeek: clinicDayOfWeekForDate(input.dateTime),
      },
      select: { startTime: true, endTime: true },
    });
    const isNormalSlot = isGeneratedSlotStart(startTime, windows);
    if (!isOvertime && !isNormalSlot) {
      throw conflict(
        "That time is outside the consultant's working hours. Reception or admin may mark it as overtime.",
      );
    }
    if (isOvertime && isNormalSlot) {
      throw badRequest("This is a normal working-hours slot, not overtime");
    }
    if (
      isOvertime &&
      sessionOverlapsWorkingHours(startTime, service.durationMinutes, windows)
    ) {
      throw badRequest(
        "Overtime must be outside the consultant's five-hour working window",
      );
    }
    await assertNoOverlappingBooking(
      tx,
      therapist.id,
      input.dateTime,
      service.durationMinutes,
    );

    const commissionBps = await resolveBookingCommissionBps(therapist, tx);

    const initialStatus: BookingStatus = isFeeWaived ? "CONFIRMED" : "PENDING";
    const booking = await tx.booking.create({
      data: {
        therapistId: therapist.id,
        serviceId: service.id,
        clientId,
        dateTime: input.dateTime,
        durationMinutes: service.durationMinutes,
        isOvertime,
        amountMinor: input.feeMinor,
        commissionBps,
        counselingType: input.counselingType,
        status: initialStatus,
        // A ₹0 appointment is a staff-authorised waiver, not an amount due.
        // Mark it settled without creating a zero-value payment or ledger entry.
        paymentStatus: isFeeWaived ? "PAID" : "UNPAID",
        expiresAt: null,
      },
    });
    try {
      await tx.bookingSlot.create({
        data: {
          therapistId: therapist.id,
          startAt: input.dateTime,
          bookingId: booking.id,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw conflict(
          "The consultant already has an appointment at that time. Please choose another slot.",
          "SLOT_TAKEN",
        );
      }
      throw error;
    }
    await tx.booking.update({
      where: { id: booking.id },
      data: { invoiceNumber: null },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: null,
        toStatus: initialStatus,
        actorType: input.session.role,
        actorId: input.session.userId,
        reason: isFeeWaived
          ? isOvertime
            ? "Fee-waived overtime appointment authorised by the front desk"
            : "Fee-waived appointment authorised by staff"
          : isOvertime
          ? input.paymentReceived
            ? "Paid overtime appointment authorised by the front desk"
            : "Overtime appointment request awaiting payment"
          : input.session.role === "RECEPTIONIST"
            ? input.paymentReceived
              ? "Paid appointment scheduled at the front desk"
              : "Appointment request scheduled at the front desk"
            : input.paymentReceived
              ? "Paid appointment scheduled by admin"
              : "Appointment request scheduled by admin",
      },
    });

    await recordAudit(
      {
        session: input.session,
        action: "booking.schedule",
        entityType: "Booking",
        entityId: booking.id,
        detail: {
          therapistId: therapist.id,
          counselingType: input.counselingType,
          dateTime: input.dateTime.toISOString(),
          feeMinor: input.feeMinor,
          paymentReceived: isFeeWaived ? false : input.paymentReceived,
          feeWaived: isFeeWaived,
          isOvertime,
        },
        ip: input.ip,
      },
      tx,
    );

    return booking;
  }, BOOKING_TRANSACTION_OPTIONS);

  // Fee already collected out-of-band (cash / UPI at the clinic): record it
  // through the manual provider — pinned explicitly, because the DEFAULT
  // provider may be a real gateway and an in-person payment must never
  // create a gateway order — so the GROSS_REVENUE / commission / platform
  // ledger postings and payout maths all stay correct and idempotent.
  if (isFeeWaived) {
    await notifyFeeWaivedBookingApproved(created.id).catch((error) =>
      console.error("Could not send fee-waived appointment notifications", created.id, error),
    );
  } else if (input.paymentReceived) {
    const { record: charge } = await createCharge({
      bookingId: created.id,
      idempotencyKey: chargeIdempotencyKey(created.id, 1),
      providerName: "manual",
    });
    const providerRef = input.paymentRef?.trim() || undefined;
    await recordChargeSuccess({
      paymentRecordId: charge.id,
      providerPaymentId: providerRef ?? `manual-${created.id.slice(0, 12)}`,
      providerRef,
      actor: input.session,
    });
  }

  return prisma.booking.findUniqueOrThrow({
    where: { id: created.id },
    include: { client: true, therapist: true, service: true },
  });
}
