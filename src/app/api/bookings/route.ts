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
  emergencyContact: z.string().min(3).max(200),
  gdprConsent: z.literal(true, {
    message: "Consent is mandatory to book a session",
  }),
}).strict();

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
