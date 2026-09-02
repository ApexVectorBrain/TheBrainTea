import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createGoogleOAuthState,
  verifyGoogleOAuthState,
} from "../services/googleCalendarService";

describe("Google Calendar reconnect recovery state", () => {
  const previousSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "calendar-recovery-test-secret";
  });

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = previousSecret;
  });

  it("carries an authenticated recovery request through OAuth", () => {
    const request = createGoogleOAuthState("therapist-1", "user-1", true);
    const verified = verifyGoogleOAuthState(request.state, request.nonce);

    expect(verified).toMatchObject({
      therapistId: "therapist-1",
      userId: "user-1",
      recoverFutureAppointments: true,
    });
  });

  it("rejects a recovery request copied into another browser", () => {
    const request = createGoogleOAuthState("therapist-1", "user-1", true);

    expect(() =>
      verifyGoogleOAuthState(request.state, "different-browser-nonce"),
    ).toThrow("did not match this browser");
  });
});
