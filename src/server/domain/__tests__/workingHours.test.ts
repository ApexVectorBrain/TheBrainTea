import { describe, expect, it } from "vitest";
import {
  generateSlots,
  generateSlotsForWindows,
  isGeneratedSlotStart,
  sessionOverlapsWorkingHours,
  workingWindowError,
} from "../workingHours";

describe("consultant working hours", () => {
  it("generates five 50-minute sessions with ten-minute gaps", () => {
    expect(generateSlots({ startTime: "11:00", endTime: "16:00" })).toEqual([
      { startTime: "11:00", endTime: "11:50" },
      { startTime: "12:00", endTime: "12:50" },
      { startTime: "13:00", endTime: "13:50" },
      { startTime: "14:00", endTime: "14:50" },
      { startTime: "15:00", endTime: "15:50" },
    ]);
  });

  it("preserves an arbitrary start-minute offset across all five sessions", () => {
    expect(generateSlots({ startTime: "11:45", endTime: "16:45" })).toEqual([
      { startTime: "11:45", endTime: "12:35" },
      { startTime: "12:45", endTime: "13:35" },
      { startTime: "13:45", endTime: "14:35" },
      { startTime: "14:45", endTime: "15:35" },
      { startTime: "15:45", endTime: "16:35" },
    ]);
  });

  it("rejects malformed, short, and overnight admin windows", () => {
    expect(
      workingWindowError({ startTime: "11:00", endTime: "15:00" }),
    ).toBeTruthy();
    expect(
      workingWindowError({ startTime: "25:00", endTime: "30:00" }),
    ).toBeTruthy();
    expect(
      workingWindowError({ startTime: "21:00", endTime: "02:00" }),
    ).toBeTruthy();
    expect(
      workingWindowError({ startTime: "11:30", endTime: "16:30" }),
    ).toBeNull();
    expect(workingWindowError({ startTime: "11:30", endTime: "16:29" })).toBe(
      "Each working day must be exactly 5 hours",
    );
  });

  it("classifies non-adjacent sessions outside the duty window as overtime", () => {
    const windows = [{ startTime: "11:45", endTime: "16:45" }];
    expect(sessionOverlapsWorkingHours("16:30", 50, windows)).toBe(true);
    expect(sessionOverlapsWorkingHours("16:45", 50, windows)).toBe(false);
    expect(sessionOverlapsWorkingHours("19:10", 50, windows)).toBe(false);
  });

  it("recognises only generated hourly starts", () => {
    const windows = [{ startTime: "11:00", endTime: "16:00" }];
    expect(isGeneratedSlotStart("14:00", windows)).toBe(true);
    expect(isGeneratedSlotStart("14:30", windows)).toBe(false);
    expect(isGeneratedSlotStart("16:00", windows)).toBe(false);
  });

  it("keeps a legacy one-row slot bookable during migration", () => {
    expect(generateSlots({ startTime: "09:00", endTime: "10:00" })).toEqual([
      { startTime: "09:00", endTime: "09:50" },
    ]);
  });

  it("normalises legacy rows to one continuous five-hour day", () => {
    expect(
      generateSlotsForWindows([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "11:00", endTime: "12:00" },
        { startTime: "16:00", endTime: "17:00" },
      ]),
    ).toEqual([
      { startTime: "09:00", endTime: "09:50" },
      { startTime: "10:00", endTime: "10:50" },
      { startTime: "11:00", endTime: "11:50" },
      { startTime: "12:00", endTime: "12:50" },
      { startTime: "13:00", endTime: "13:50" },
    ]);
  });
});
