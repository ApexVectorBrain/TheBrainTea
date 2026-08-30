import { describe, expect, it } from "vitest";
import { calendarEventTitle } from "../googleCalendarService";

describe("calendarEventTitle", () => {
  it("uses the client-first calendar naming template", () => {
    expect(calendarEventTitle("Asha Patel")).toBe("Asha Patel-The Brain Tea");
  });
});
