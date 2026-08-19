import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { releaseExpiredReservations } from "@/server/services/bookingService";
import { badRequest, handleApi, notFound } from "@/server/http";
import { generateSlotsForWindows } from "@/server/domain/workingHours";
import {
  clinicDayBounds,
  clinicDayOfWeek,
  formatClinicTime,
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

  const [weeklySlots, heldSlots, blocks] = await Promise.all([
    prisma.therapistAvailability.findMany({
      where: { therapistId: therapist.id, dayOfWeek },
    }),
    // BookingSlot rows are the single source of truth for live holds.
    prisma.bookingSlot.findMany({
      where: {
        therapistId: therapist.id,
        startAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { startAt: true },
    }),
    prisma.slotBlock.findMany({
      where: {
        therapistId: therapist.id,
        startAt: { lt: endOfDay },
        endAt: { gt: startOfDay },
      },
    }),
  ]);

  const heldTimes = new Set(
    heldSlots.map((s) => formatClinicTime(s.startAt)),
  );

  const availableSlots = generateSlotsForWindows(weeklySlots)
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
      const isPast = slotStart.getTime() <= Date.now();
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !heldTimes.has(slot.startTime) && !isBlocked && !isPast,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return NextResponse.json({ slots: availableSlots });
});
