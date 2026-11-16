import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { releaseExpiredReservations } from "@/server/services/bookingService";
import { SLOT_HOLDING_STATUSES } from "@/server/domain/bookingStatus";
import { badRequest, handleApi, notFound } from "@/server/http";
import { generateSlotsForWindows, generateFreeCallSlots } from "@/server/domain/workingHours";
import {
  clinicDayBounds,
  clinicDayOfWeek,
  parseClinicDateTime,
} from "@/server/clinicTime";

export const GET = handleApi(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const therapistSlug = searchParams.get("therapist");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!therapistSlug || !dateStr) {
    throw badRequest("Missing therapist slug or date parameter");
  }

  const therapist = await prisma.therapist.findUnique({
    where: { slug: therapistSlug },
  });
  if (!therapist || !therapist.isActive || therapist.status !== "APPROVED") {
    throw notFound("Therapist not found");
  }

  const dayOfWeek = clinicDayOfWeek(dateStr);
  const bounds = clinicDayBounds(dateStr);
  if (dayOfWeek === null || !bounds) throw badRequest("Invalid date format");

  // Free any lapsed payment holds before reporting availability.
  await releaseExpiredReservations();

  const { start: startOfDay, end: endOfDay } = bounds;

  const [weeklySlots, activeBookings, blocks] = await Promise.all([
    prisma.therapistAvailability.findMany({
      where: { therapistId: therapist.id, dayOfWeek },
    }),
    // Active Booking rows also cover legacy staff appointments created before
    // every desk booking received a BookingSlot row.
    prisma.booking.findMany({
      where: {
        therapistId: therapist.id,
        status: { in: SLOT_HOLDING_STATUSES },
        dateTime: {
          gt: new Date(startOfDay.getTime() - 24 * 60 * 60000),
          lt: endOfDay,
        },
      },
      select: { dateTime: true, durationMinutes: true },
    }),
    prisma.slotBlock.findMany({
      where: {
        therapistId: therapist.id,
        startAt: { lt: endOfDay },
        endAt: { gt: startOfDay },
      },
    }),
  ]);

  const freeCall = searchParams.get("service") === "free-15-minute-call";
  const availableSlots = (freeCall ? generateFreeCallSlots(weeklySlots) : generateSlotsForWindows(weeklySlots))
    .map((slot) => ({
      ...slot,
      id: `${weeklySlots[0].id}:${slot.startTime}`,
    }))
    .map((slot) => {
      const slotStart = parseClinicDateTime(dateStr, slot.startTime)!;
      const slotEnd = parseClinicDateTime(dateStr, slot.endTime)!;
      const isBlocked = blocks.some(
        (b) => b.startAt < slotEnd && b.endAt > slotStart,
      );
      const isBooked = activeBookings.some(
        (booking) =>
          booking.dateTime < slotEnd &&
          new Date(
            booking.dateTime.getTime() + booking.durationMinutes * 60000,
          ) > slotStart,
      );
      const isPast = slotStart.getTime() <= Date.now();
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !isBooked && !isBlocked && !isPast,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return NextResponse.json({ slots: availableSlots });
});
