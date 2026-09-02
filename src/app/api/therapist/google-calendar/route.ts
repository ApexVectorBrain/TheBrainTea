import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { conflict, handleApi, requireTherapist } from "@/server/http";
import {
  disconnectGoogleCalendar,
  isGoogleCalendarConfigured,
  missingFutureCalendarBookingIds,
} from "@/server/services/googleCalendarService";

export const GET = handleApi(async (request: Request) => {
  const { therapistId } = await requireTherapist(request);
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { therapistId },
    select: { googleEmail: true, connectedAt: true, updatedAt: true },
  });
  const missingFutureAppointments = (
    await missingFutureCalendarBookingIds(therapistId)
  ).length;
  return NextResponse.json({
    configured: isGoogleCalendarConfigured(),
    connection,
    missingFutureAppointments,
  });
});

export const DELETE = handleApi(async (request: Request) => {
  const { therapistId } = await requireTherapist(request);
  const futureEvents = await prisma.booking.count({
    where: {
      therapistId,
      dateTime: { gt: new Date() },
      status: "CONFIRMED",
      googleCalendarEventId: { not: null },
    },
  });
  if (futureEvents > 0) {
    throw conflict(
      "Google Calendar cannot be disconnected while you have future confirmed appointments. Contact the clinic administrator to move or cancel them first.",
    );
  }
  await disconnectGoogleCalendar(therapistId);
  return NextResponse.json({ ok: true });
});
