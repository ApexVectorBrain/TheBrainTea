import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/server/services/bookingService";
import {
  badRequest,
  enforceRateLimit,
  handleApi,
  parseBody,
} from "@/server/http";
import { publicBookingView } from "@/server/serializers/publicBooking";
import { parseClinicDateTime } from "@/server/clinicTime";

const bookingSchema = z.object({
  therapistSlug: z.string().min(1),
  serviceSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  age: z.coerce.number().int().min(1).max(120),
  guardianName: z.string().trim().min(2).max(120).optional(),
  guardianPhone: z.string().trim().min(8).max(20).optional(),
  guardianConsent: z.boolean().optional(),
  emergencyContact: z.string().max(200).optional().default(""),
  referralSource: z.enum(["google", "social", "friend_family", "doctor", "workplace", "school", "other"]),
  referralDoctor: z.string().trim().max(120).optional(),
  utmSource: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  gclid: z.string().max(500).optional(),
  fbclid: z.string().max(500).optional(),
  gdprConsent: z.literal(true, {
    message: "Consent is mandatory to book a session",
  }),
}).strict().refine(body => body.age >= 18 || (!!body.guardianName && !!body.guardianPhone && body.guardianConsent === true), { path: ["guardianConsent"], message: "Parent or guardian name, phone and consent are required for under-18 bookings" }).refine(body => body.referralSource !== "doctor" || !!body.referralDoctor?.trim(), { path: ["referralDoctor"], message: "Please enter the doctor's name" });

export const POST = handleApi(async (request: Request) => {
  // Namespaced bucket: previously this used a bare IP key, which meant
  // internship submissions and booking creation drained the same budget.
  enforceRateLimit(
    request,
    "booking",
    5,
    60000,
    "Too many booking requests. Please wait a minute and try again.",
  );

  const body = parseBody(bookingSchema, await request.json());

  const dateTime = parseClinicDateTime(body.date, body.time);
  if (!dateTime) throw badRequest("Invalid date or time");

  const { booking, payment } = await createBooking({
    guardianName: body.guardianName, guardianPhone: body.guardianPhone, guardianConsent: body.guardianConsent,
    referralSource: body.referralSource, referralDoctor: body.referralDoctor,
    utmSource: body.utmSource, utmCampaign: body.utmCampaign, gclid: body.gclid, fbclid: body.fbclid,
    therapistSlug: body.therapistSlug,
    serviceSlug: body.serviceSlug,
    dateTime,
    client: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      age: body.age,
      emergencyContact: body.emergencyContact,
      gdprConsent: body.gdprConsent,
    },
  });
  return NextResponse.json({
    // Whitelisted view — never the raw row. Keeps commissionBps, the
    // encrypted notes blob and internal ids out of an anonymous response.
    booking: publicBookingView(booking),
    client: {
      name: booking.client.name,
      email: booking.client.email,
      phone: booking.client.phone,
    },
    payment,
  });
});
