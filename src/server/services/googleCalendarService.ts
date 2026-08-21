import crypto from "crypto";
import { prisma } from "@/lib/db";
import { decryptText, encryptText } from "@/lib/encryption";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const IDENTITY_SCOPES = "openid email";
const TIME_ZONE = "Asia/Kolkata";

type OAuthState = { therapistId: string; userId: string; nonce: string; expiresAt: number };
type GoogleTokenResponse = {
  access_token?: string; refresh_token?: string; expires_in?: number; scope?: string;
  error?: string; error_description?: string;
};

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (!clientId || !clientSecret || !baseUrl) return null;
  return { clientId, clientSecret, redirectUri: `${baseUrl}/api/google-calendar/callback` };
}

export function isGoogleCalendarConfigured(): boolean { return Boolean(config()); }

function signingKey(): Buffer {
  const value = process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY;
  if (!value) throw new Error("NEXTAUTH_SECRET or ENCRYPTION_KEY is required for Google OAuth state");
  return crypto.createHash("sha256").update(value).digest();
}
function sign(value: string): string { return crypto.createHmac("sha256", signingKey()).update(value).digest("base64url"); }
function timingSafeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createGoogleOAuthState(therapistId: string, userId: string) {
  const payload = Buffer.from(JSON.stringify({
    therapistId, userId, nonce: crypto.randomBytes(24).toString("base64url"), expiresAt: Date.now() + 10 * 60 * 1000,
  } satisfies OAuthState)).toString("base64url");
  const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
  return { state: `${payload}.${sign(payload)}`, nonce: state.nonce };
}

export function verifyGoogleOAuthState(value: string, expectedNonce: string): OAuthState {
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !timingSafeEqual(signature, sign(payload))) throw new Error("Google connection request could not be verified. Please try again.");
  let state: OAuthState;
  try { state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); }
  catch { throw new Error("Google connection request could not be read. Please try again."); }
  if (!state.therapistId || !state.userId || !state.nonce || state.expiresAt < Date.now()) throw new Error("Google connection request has expired. Please try again.");
  if (!timingSafeEqual(state.nonce, expectedNonce)) throw new Error("Google connection request did not match this browser. Please try again.");
  return state;
}

export function googleAuthorizationUrl(state: string): string {
  const settings = config();
  if (!settings) throw new Error("Google Calendar integration is not configured");
  const query = new URLSearchParams({
    client_id: settings.clientId, redirect_uri: settings.redirectUri, response_type: "code",
    scope: `${CALENDAR_SCOPE} ${IDENTITY_SCOPES}`, access_type: "offline", prompt: "consent",
    include_granted_scopes: "true", state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

async function googleToken(params: URLSearchParams): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params });
  const data = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !data.access_token) throw new Error(`Google authorization failed: ${data.error_description ?? data.error ?? response.status}`);
  return data;
}
async function googleAccountEmail(accessToken: string): Promise<string | null> {
  const response = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return null;
  return ((await response.json()) as { email?: string }).email ?? null;
}

/** Exchange the one-time code and store a consultant-owned encrypted token. */
export async function connectGoogleCalendar(input: { code: string; therapistId: string; userId: string }) {
  const settings = config();
  if (!settings) throw new Error("Google Calendar integration is not configured");
  const token = await googleToken(new URLSearchParams({ code: input.code, client_id: settings.clientId, client_secret: settings.clientSecret, redirect_uri: settings.redirectUri, grant_type: "authorization_code" }));
  if (!token.refresh_token) throw new Error("Google did not return long-term calendar access. Please disconnect this app from Google and connect again.");
  const therapist = await prisma.therapist.findFirst({ where: { id: input.therapistId, userId: input.userId } });
  if (!therapist) throw new Error("Consultant account no longer exists");
  const googleEmail = await googleAccountEmail(token.access_token!);
  const data = {
    googleEmail, encryptedRefreshToken: encryptText(token.refresh_token),
    tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
    scopes: token.scope ?? CALENDAR_SCOPE,
  };
  await prisma.googleCalendarConnection.upsert({
    where: { therapistId: therapist.id }, create: { therapistId: therapist.id, ...data },
    update: { ...data, connectedAt: new Date() },
  });
}
export async function disconnectGoogleCalendar(therapistId: string) { await prisma.googleCalendarConnection.deleteMany({ where: { therapistId } }); }

async function accessTokenForTherapist(therapistId: string) {
  const settings = config();
  if (!settings) throw new Error("Google Calendar integration is not configured");
  const connection = await prisma.googleCalendarConnection.findUnique({ where: { therapistId } });
  if (!connection) throw new Error("This consultant has not connected Google Calendar yet");
  const refreshToken = decryptText(connection.encryptedRefreshToken);
  if (!refreshToken) throw new Error("Stored Google Calendar access could not be read. Reconnect Google Calendar.");
  const token = await googleToken(new URLSearchParams({ client_id: settings.clientId, client_secret: settings.clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }));
  await prisma.googleCalendarConnection.update({ where: { therapistId }, data: { tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null } });
  return token.access_token!;
}
async function loadBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { client: true, therapist: true, service: true } });
  if (!booking) throw new Error("Booking not found while syncing Google Calendar");
  return booking;
}
function eventPayload(booking: Awaited<ReturnType<typeof loadBooking>>) {
  const endsAt = new Date(booking.dateTime.getTime() + booking.durationMinutes * 60000);
  return {
    summary: `The Brain Tea consultation — ${booking.client.name}`,
    description: `Consultation with ${booking.client.name}. Service: ${booking.service.name}.`,
    start: { dateTime: booking.dateTime.toISOString(), timeZone: TIME_ZONE }, end: { dateTime: endsAt.toISOString(), timeZone: TIME_ZONE },
    visibility: "private", guestsCanInviteOthers: false, guestsCanModify: false, guestsCanSeeOtherGuests: false,
  };
}

/** Create exactly one consultant-owned calendar event and Meet room per paid appointment. */
export async function ensureBookingMeeting(bookingId: string) {
  const booking = await loadBooking(bookingId);
  if (booking.meetingUrl) return booking.meetingUrl;
  const token = await accessTokenForTherapist(booking.therapistId);
  const response = await fetch(`${GOOGLE_API}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...eventPayload(booking), conferenceData: { createRequest: { requestId: `thebraintea-${booking.id}` } } }),
  });
  const event = await response.json();
  if (!response.ok || !event.hangoutLink) throw new Error(`Google Calendar event creation failed: ${event.error?.message ?? response.status}`);
  const updated = await prisma.booking.updateMany({ where: { id: booking.id, meetingUrl: null }, data: { meetingUrl: event.hangoutLink, googleCalendarEventId: event.id ?? null } });
  if (updated.count === 1) return event.hangoutLink as string;
  return (await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })).meetingUrl!;
}
export async function syncBookingMeeting(bookingId: string) {
  const booking = await loadBooking(bookingId);
  if (!booking.googleCalendarEventId) return;
  const token = await accessTokenForTherapist(booking.therapistId);
  const response = await fetch(`${GOOGLE_API}/calendars/primary/events/${encodeURIComponent(booking.googleCalendarEventId)}?conferenceDataVersion=1&sendUpdates=none`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(eventPayload(booking)),
  });
  if (!response.ok) throw new Error(`Google Calendar event update failed: ${response.status}`);
}
export async function cancelBookingMeeting(bookingId: string) {
  const booking = await loadBooking(bookingId);
  if (!booking.googleCalendarEventId) return;
  const token = await accessTokenForTherapist(booking.therapistId);
  const response = await fetch(`${GOOGLE_API}/calendars/primary/events/${encodeURIComponent(booking.googleCalendarEventId)}?sendUpdates=none`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok && response.status !== 410 && response.status !== 404) throw new Error(`Google Calendar event cancellation failed: ${response.status}`);
}
