import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/bookings/route";

describe("public booking request gateway guard", () => {
  it("rejects a crafted gateway option before any database work", async () => {
    const response = await POST(
      new Request("http://localhost/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "198.51.100.42",
        },
        body: JSON.stringify({
          therapistSlug: "consultant",
          serviceSlug: "service",
          date: "2026-08-20",
          time: "11:00",
          name: "Test Client",
          email: "test@example.com",
          phone: "+919812345678",
          age: 30,
          emergencyContact: "Emergency Contact",
          gdprConsent: true,
          paymentOption: "PAY_NOW",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("Unrecognized key"),
    });
  });
});
