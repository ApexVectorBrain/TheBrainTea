import crypto from "crypto";
import { prisma } from "@/lib/db";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TIME_ZONE = "Asia/Kolkata";

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function calendarConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const delegatedUser = process.env.GOOGLE_WORKSPACE_IMPERSONATED_USER?.trim() || null;
  if (!email || !privateKey || !calendarId) return null;
  return { email, privateKey, calendarId, delegatedUser };
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(calendarConfig());
}

async function accessToken() {
  const config = calendarConfig();
  if (!config) throw new Error("Google Calendar is not configured");
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: config.email,
      scope: GOOGLE_CALENDAR_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
      ...(config.delegatedUser ? { sub: config.delegatedUser } : {}),
    }),
  );
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  const assertion = `${header}.${claim}.${signer.sign(config.privateKey, "base64url")}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error(`Google authentication failed: ${result.error_description ?? result.error ?? response.status}`);
  }
  return {
    token: result.access_token as string,
    calendarId: config.calendarId,
    canInviteAttendees: Boolean(config.delegatedUser),
  };
}

/** Create and store an appointment-specific Google Meet room exactly once. */
export async function ensureBookingMeeting(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: true,
      therapist: { include: { user: { select: { email: true } } } },
      service: true,
    },
  });
  if (!booking) throw new Error("Booking not found while creating Google Meet link");
  if (booking.meetingUrl) return booking.meetingUrl;

  const { token, calendarId, canInviteAttendees } = await accessToken();
  const endAt = new Date(booking.dateTime.getTime() + booking.durationMinutes * 60000);
  const therapistEmail = booking.therapist.user?.email;
  const sendUpdates = canInviteAttendees && therapistEmail ? "all" : "none";
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=${sendUpdates}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `The Brain Tea — ${booking.service.name}`,
        description: `Private consultation for ${booking.client.name} with ${booking.therapist.name}.`,
        start: { dateTime: booking.dateTime.toISOString(), timeZone: TIME_ZONE },
        end: { dateTime: endAt.toISOString(), timeZone: TIME_ZONE },
        // Attendee invitations require a Google Workspace account with the
        // service account configured for domain-wide delegation. The client
        // receives the branded appointment email through Resend instead.
        ...(canInviteAttendees && therapistEmail
          ? {
              attendees: [{ email: therapistEmail }],
              guestsCanInviteOthers: false,
              guestsCanModify: false,
              guestsCanSeeOtherGuests: false,
            }
          : {}),
        visibility: "private",
        conferenceData: {
          createRequest: { requestId: `booking-${booking.id}` },
        },
      }),
    },
  );
  const event = await response.json();
  if (!response.ok || !event.hangoutLink) {
    throw new Error(`Google Calendar event creation failed: ${event.error?.message ?? response.status}`);
  }

  const updated = await prisma.booking.updateMany({
    where: { id: booking.id, meetingUrl: null },
    data: { meetingUrl: event.hangoutLink, googleCalendarEventId: event.id ?? null },
  });
  if (updated.count === 1) return event.hangoutLink as string;
  return (await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })).meetingUrl!;
}
