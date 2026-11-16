import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import BookingWizard from "@/components/BookingWizard";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }) {
  const sParams = await searchParams;
  if (sParams.service === "assessment") redirect("/book");
  const initialService = sParams.service || "";

  // Only services that at least one approved, active consultant offers are
  // bookable — otherwise the consultant step would dead-end.
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      therapists: { some: { status: "APPROVED", isActive: true } },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceMinor: true,
      durationMinutes: true,
      description: true,
      therapists: { where: { status: "APPROVED", isActive: true }, select: { feeMinor: true, serviceRates: { select: { serviceId: true, feeMinor: true } } } },
    },
  });

  services.sort((a, b) => Number(b.slug === "free-15-minute-call") - Number(a.slug === "free-15-minute-call"));
  const bookableServices = services.map(({ therapists, ...service }) => ({ ...service, startingFeeMinor: service.slug === "free-15-minute-call" ? 0 : Math.min(...therapists.map(t => t.serviceRates.find(r => r.serviceId === service.id)?.feeMinor ?? t.feeMinor)) }));

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-28">
      <BookingWizard services={bookableServices} initialService={initialService} />
    </main>
  );
}
