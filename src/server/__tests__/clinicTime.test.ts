import { describe, expect, it } from "vitest";
import {
  clinicDayBounds,
  clinicDayOfWeek,
  clinicDayOfWeekForDate,
  formatClinicTime,
  parseClinicDateTime,
} from "../clinicTime";

describe("clinic appointment time", () => {
  it("stores an India-time client slot as the corresponding UTC instant", () => {
    const slot = parseClinicDateTime("2026-08-20", "11:00");
    expect(slot?.toISOString()).toBe("2026-08-20T05:30:00.000Z");
    expect(slot && formatClinicTime(slot)).toBe("11:00");
  });

  it("uses the India calendar day for availability bounds and weekday", () => {
    const bounds = clinicDayBounds("2026-08-20");
    expect(bounds?.start.toISOString()).toBe("2026-08-19T18:30:00.000Z");
    expect(bounds?.end.toISOString()).toBe("2026-08-20T18:29:59.999Z");
    expect(clinicDayOfWeek("2026-08-20")).toBe(4);
    expect(clinicDayOfWeekForDate(parseClinicDateTime("2026-08-20", "00:15")!)).toBe(4);
  });

  it("rejects impossible calendar dates and malformed times", () => {
    expect(parseClinicDateTime("2026-02-30", "11:00")).toBeNull();
    expect(parseClinicDateTime("2026-08-20", "24:00")).toBeNull();
  });
});
