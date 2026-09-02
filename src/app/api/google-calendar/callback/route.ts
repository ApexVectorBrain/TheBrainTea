import { NextResponse } from "next/server";
import { recordAudit } from "@/server/audit";
import { notifyMeetingLinkRecovered } from "@/server/services/emailNotificationService";
import {
  backfillFutureBookingMeetings,
  connectGoogleCalendar,
  verifyGoogleOAuthState,
} from "@/server/services/googleCalendarService";

function redirect(
  request: Request,
  status: string,
  result?: { recovered: number; failed: number },
) {
  const destination = new URL("/therapist/profile", request.url);
  destination.searchParams.set("googleCalendar", status);
  if (result) {
    destination.searchParams.set("recovered", String(result.recovered));
    destination.searchParams.set("failed", String(result.failed));
  }
  const response = NextResponse.redirect(destination);
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
    const recovery = verified.recoverFutureAppointments
      ? await backfillFutureBookingMeetings(verified.therapistId)
      : { eligible: 0, recoveredBookingIds: [], failed: 0, failures: [] };

    await Promise.allSettled(
      recovery.recoveredBookingIds.map((bookingId) =>
        notifyMeetingLinkRecovered(bookingId),
      ),
    );
    await recordAudit({
      action: "google_calendar.reconnect_completed",
      entityType: "Therapist",
      entityId: verified.therapistId,
      detail: {
        eligible: recovery.eligible,
        recoveredBookingIds: recovery.recoveredBookingIds,
        failedBookingIds: recovery.failures.map((failure) => failure.bookingId),
      },
    }).catch((error) =>
      console.error("Could not audit Google Calendar recovery", error),
    );
    return redirect(request, "connected", {
      recovered: recovery.recoveredBookingIds.length,
      failed: recovery.failed,
    });
  } catch (error) {
    console.error("Google Calendar OAuth callback failed", error);
    return redirect(request, "failed");
  }
}
