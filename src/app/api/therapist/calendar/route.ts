import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, handleApi, requireTherapist } from "@/server/http";
import {
  clinicDateKey,
  clinicDayBounds,
  clinicDayOfWeek,
} from "@/server/clinicTime";

// Week-scoped schedule: bookings, the weekly availability template, and any
// one-off slot blocks (leave/unavailability) for the requested window.
// Defaults to the current week (Monday–Sunday) when no range is given.

function startOfWeek(d: Date): Date {
  const key = clinicDateKey(d);
  const day = clinicDayOfWeek(key)!;
  const { start } = clinicDayBounds(key)!;
  return new Date(start.getTime() - ((day + 6) % 7) * 24 * 60 * 60_000);
}

export const GET = handleApi(async (request: Request) => {
  const { therapistId } = await requireTherapist(request);
  const { searchParams } = new URL(request.url);

  const fromParam = searchParams.get("from");
  const requestedBounds = fromParam ? clinicDayBounds(fromParam) : null;
  if (fromParam && !requestedBounds) throw badRequest("Invalid week start");
  const from = requestedBounds?.start ?? startOfWeek(new Date());
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60_000 - 1);

  const [bookings, availability, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        therapistId,
        dateTime: { gte: from, lte: to },
        status: {
          in: [
            "PENDING",
            "AWAITING_PAYMENT",
            "CONFIRMED",
            "COMPLETED",
            "NO_SHOW",
          ],
        },
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { dateTime: "asc" },
    }),
    prisma.therapistAvailability.findMany({
      where: { therapistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.slotBlock.findMany({
      where: { therapistId, startAt: { lte: to }, endAt: { gte: from } },
      orderBy: { startAt: "asc" },
    }),
  ]);

  return NextResponse.json({ from, to, bookings, availability, blocks });
});
