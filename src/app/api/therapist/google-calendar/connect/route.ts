import { NextResponse } from "next/server";
import { recordAudit } from "@/server/audit";
import { requireTherapist } from "@/server/http";
import {
  createGoogleOAuthState,
  googleAuthorizationUrl,
  isGoogleCalendarConfigured,
  missingFutureCalendarBookingIds,
} from "@/server/services/googleCalendarService";

export async function GET(request: Request) {
  try {
    const { session, therapistId } = await requireTherapist(request);
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.redirect(new URL("/therapist/profile?googleCalendar=not-configured", request.url));
    }
    // The bookings themselves remain the source of truth. This immutable
    // audit snapshot records exactly which future paid appointments were
    // awaiting recovery when the consultant left for Google's consent page.
    const recoveryBookingIds = await missingFutureCalendarBookingIds(therapistId);
    await recordAudit({
      session,
      action: "google_calendar.reconnect_started",
      entityType: "Therapist",
      entityId: therapistId,
      detail: {
        recoveryBookingIds,
        recoveryCount: recoveryBookingIds.length,
      },
    });
    const { state, nonce } = createGoogleOAuthState(
      therapistId,
      session.userId,
      true,
    );
    const response = NextResponse.redirect(googleAuthorizationUrl(state));
    response.cookies.set("thebraintea_google_oauth", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/google-calendar/callback",
      maxAge: 10 * 60,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/therapist/login", request.url));
  }
}
