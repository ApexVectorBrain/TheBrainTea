import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  badRequest,
  conflict,
  handleApi,
  notFound,
  parseBody,
  requireReception,
} from "@/server/http";
import { recordAudit } from "@/server/audit";
import { parseClinicDateTime } from "@/server/clinicTime";

const leaveSchema = z.object({
  therapistId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().trim().max(200).optional(),
});

// Leave is a staff-managed one-off availability block. Admins are included in
// requireReception, so this same guarded endpoint is safe for both portals.
export const GET = handleApi(async (request: Request) => {
  await requireReception(request);
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");

  const leaves = await prisma.slotBlock.findMany({
    where: {
      ...(therapistId ? { therapistId } : {}),
      endAt: { gte: new Date() },
    },
    include: { therapist: { select: { id: true, name: true } } },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ leaves });
});

export const POST = handleApi(async (request: Request) => {
  const session = await requireReception(request);
  const body = parseBody(leaveSchema, await request.json());
  const startAt = parseClinicDateTime(body.startDate, body.startTime);
  const endAt = parseClinicDateTime(body.endDate, body.endTime);
  if (!startAt || !endAt || startAt >= endAt) {
    throw badRequest("Choose a valid leave start and end time");
  }

  const therapist = await prisma.therapist.findUnique({
    where: { id: body.therapistId },
    select: { id: true, name: true },
  });
  if (!therapist) throw notFound("Consultant not found");

  // Do not quietly place a consultant on leave over an appointment that is
  // already live. Staff can reschedule or cancel that appointment first,
  // then mark the leave knowing no client has been left on an invalid slot.
  const candidates = await prisma.booking.findMany({
    where: {
      therapistId: therapist.id,
      dateTime: { lt: endAt },
      status: { in: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"] },
    },
    select: { dateTime: true, durationMinutes: true, client: { select: { name: true } } },
  });
  const conflictingBooking = candidates.find(
    (booking) =>
      booking.dateTime.getTime() + booking.durationMinutes * 60_000 >
      startAt.getTime(),
  );
  if (conflictingBooking) {
    throw conflict(
      `This overlaps an active appointment for ${conflictingBooking.client.name}. Reschedule or cancel it before marking leave.`,
      "LEAVE_CONFLICT",
    );
  }

  const leave = await prisma.slotBlock.create({
    data: {
      therapistId: therapist.id,
      startAt,
      endAt,
      reason: body.reason || "Leave",
    },
    include: { therapist: { select: { id: true, name: true } } },
  });
  await recordAudit({
    session,
    action: "staff.add_consultant_leave",
    entityType: "SlotBlock",
    entityId: leave.id,
    detail: {
      therapistId: therapist.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason: leave.reason,
    },
  });

  return NextResponse.json({ leave }, { status: 201 });
});

export const DELETE = handleApi(async (request: Request) => {
  const session = await requireReception(request);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) throw badRequest("Leave id is required");

  const leave = await prisma.slotBlock.findUnique({ where: { id } });
  if (!leave) throw notFound("Leave record not found");

  await prisma.slotBlock.delete({ where: { id } });
  await recordAudit({
    session,
    action: "staff.remove_consultant_leave",
    entityType: "SlotBlock",
    entityId: leave.id,
    detail: { therapistId: leave.therapistId },
  });
  return NextResponse.json({ message: "Leave removed" });
});
