import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forbidden, handleApi, requireTherapist } from "@/server/http";

export const GET = handleApi(async (request: Request) => {
  const { therapistId } = await requireTherapist(request);
  const [weekly, blocks] = await Promise.all([
    prisma.therapistAvailability.findMany({
      where: { therapistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.slotBlock.findMany({
      where: { therapistId, endAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
    }),
  ]);
  return NextResponse.json({ weekly, blocks });
});

// Consultants can view their schedule and manage one-off leave blocks, but
// only an administrator can change recurring working hours.
export const PUT = handleApi(async (request: Request) => {
  await requireTherapist(request);
  throw forbidden("Weekly working hours are managed by an administrator");
});
