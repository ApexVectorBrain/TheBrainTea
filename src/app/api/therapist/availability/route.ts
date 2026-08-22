import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forbidden, handleApi, requireTherapist } from "@/server/http";

export const GET = handleApi(async (request: Request) => {
  const { therapistId } = await requireTherapist(request);
  const weekly = await prisma.therapistAvailability.findMany({
    where: { therapistId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ weekly });
});

// Consultants can view their admin-set weekly schedule. Leave and one-off
// availability are managed only by reception and admins.
export const PUT = handleApi(async (request: Request) => {
  await requireTherapist(request);
  throw forbidden("Weekly working hours are managed by an administrator");
});
