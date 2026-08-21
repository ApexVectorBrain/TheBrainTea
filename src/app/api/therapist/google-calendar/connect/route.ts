import { NextResponse } from "next/server";
import { requireTherapist } from "@/server/http";
import { createGoogleOAuthState, googleAuthorizationUrl, isGoogleCalendarConfigured } from "@/server/services/googleCalendarService";

export async function GET(request: Request) {
  try {
    const { session, therapistId } = await requireTherapist(request);
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.redirect(new URL("/therapist/profile?googleCalendar=not-configured", request.url));
    }
    const { state, nonce } = createGoogleOAuthState(therapistId, session.userId);
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
