import { NextResponse } from "next/server";
import { connectGoogleCalendar, verifyGoogleOAuthState } from "@/server/services/googleCalendarService";

function redirect(request: Request, status: string) {
  const response = NextResponse.redirect(new URL(`/therapist/profile?googleCalendar=${status}`, request.url));
  response.cookies.set("thebraintea_google_oauth", "", { path: "/api/google-calendar/callback", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providerError = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const nonce = request.headers.get("cookie")?.match(/(?:^|;\s*)thebraintea_google_oauth=([^;]+)/)?.[1];
  if (providerError || !code || !state || !nonce) return redirect(request, "failed");
  try {
    const verified = verifyGoogleOAuthState(state, decodeURIComponent(nonce));
    await connectGoogleCalendar({ code, therapistId: verified.therapistId, userId: verified.userId });
    return redirect(request, "connected");
  } catch (error) {
    console.error("Google Calendar OAuth callback failed", error);
    return redirect(request, "failed");
  }
}
