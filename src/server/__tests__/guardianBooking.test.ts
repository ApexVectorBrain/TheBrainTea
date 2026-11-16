import { describe, expect, it, vi } from "vitest";
vi.mock("@/server/services/bookingService", () => ({ createBooking: vi.fn() }));
import { POST } from "@/app/api/bookings/route";
import { createBooking } from "@/server/services/bookingService";
const base = { therapistSlug: "consultant", serviceSlug: "free-15-minute-call", date: "2027-01-20", time: "11:00", name: "Test Child", email: "test@example.com", phone: "9876543210", age: 17, referralSource: "google", gdprConsent: true };
describe("guardian booking boundary", () => {
  it.each([{}, { guardianName: "Parent", guardianPhone: "9876543210", guardianConsent: false }, { guardianName: "Parent", guardianConsent: true }])("rejects incomplete minor consent before database work: %j", async fields => {
    const response = await POST(new Request("http://localhost/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `198.51.100.${Object.keys(fields).length + 70}` }, body: JSON.stringify({ ...base, ...fields }) }));
    expect(response.status).toBe(400);
    expect(createBooking).not.toHaveBeenCalled();
  });
  it.each([17, 18])("accepts valid input at age %i", async age => {
    vi.mocked(createBooking).mockResolvedValueOnce({ booking: { id: "test-booking", status: "CONFIRMED", client: { name: "Test Child", email: "test@example.com", phone: "9876543210" } }, payment: null } as never);
    const guardian = age < 18 ? { guardianName: "Parent", guardianPhone: "9876543210", guardianConsent: true } : {};
    const response = await POST(new Request("http://localhost/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `198.51.100.${age}` }, body: JSON.stringify({ ...base, age, ...guardian }) }));
    expect(response.status).toBe(200);
    expect(createBooking).toHaveBeenLastCalledWith(expect.objectContaining({ client: expect.objectContaining({ age }), ...guardian }));
  });

});
