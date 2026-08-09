export const WORKING_WINDOW_MINUTES = 5 * 60;
export const SESSION_MINUTES = 50;
export const SLOT_INTERVAL_MINUTES = 60;

export interface WorkingWindow {
  startTime: string;
  endTime: string;
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
}

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function timeToMinutes(value: string): number | null {
  if (!TIME_RE.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** New schedules are same-day, exactly five-hour working windows. */
export function workingWindowError(window: WorkingWindow): string | null {
  const start = timeToMinutes(window.startTime);
  const end = timeToMinutes(window.endTime);
  if (start === null || end === null) return "Use a valid time in HH:MM format";
  if (end - start !== WORKING_WINDOW_MINUTES) {
    return "Each working day must be exactly 5 hours";
  }
  return null;
}

/**
 * Expands a five-hour window into five 50-minute sessions, one hour apart
 * from the exact configured start minute.
 * Legacy rows (one row per session) are returned unchanged during migration.
 */
export function generateSlots(window: WorkingWindow): GeneratedSlot[] {
  const start = timeToMinutes(window.startTime);
  const end = timeToMinutes(window.endTime);
  if (start === null || end === null || end <= start) return [];

  if (end - start === WORKING_WINDOW_MINUTES) {
    return Array.from({ length: 5 }, (_, index) => {
      const slotStart = start + index * SLOT_INTERVAL_MINUTES;
      return {
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotStart + SESSION_MINUTES),
      };
    });
  }

  // Compatibility for the old representation, which stored each slot row.
  if (end - start >= SESSION_MINUTES && end - start <= SLOT_INTERVAL_MINUTES) {
    return [
      {
        startTime: window.startTime,
        endTime: minutesToTime(start + SESSION_MINUTES),
      },
    ];
  }
  return [];
}

/**
 * Reads a day's rows as one schedule. New data contains one five-hour window;
 * legacy data contained several individual slot rows, which are migrated in
 * memory to a continuous five-hour window from the earliest valid start.
 */
export function generateSlotsForWindows(
  windows: WorkingWindow[],
): GeneratedSlot[] {
  const configuredWindow = windows.find(
    (window) => !workingWindowError(window),
  );
  if (configuredWindow) return generateSlots(configuredWindow);

  const earliestStart = windows
    .map((window) => timeToMinutes(window.startTime))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0];
  if (earliestStart === undefined || earliestStart > 18 * 60 + 59) return [];
  return generateSlots({
    startTime: minutesToTime(earliestStart),
    endTime: minutesToTime(earliestStart + WORKING_WINDOW_MINUTES),
  });
}

/** True when a proposed session touches any part of the normal duty window. */
export function sessionOverlapsWorkingHours(
  startTime: string,
  durationMinutes: number,
  windows: WorkingWindow[],
): boolean {
  const sessionStart = timeToMinutes(startTime);
  const firstSlot = generateSlotsForWindows(windows)[0];
  const windowStart = firstSlot ? timeToMinutes(firstSlot.startTime) : null;
  if (sessionStart === null || windowStart === null || durationMinutes <= 0) {
    return false;
  }
  const sessionEnd = sessionStart + durationMinutes;
  const windowEnd = windowStart + WORKING_WINDOW_MINUTES;
  return sessionStart < windowEnd && sessionEnd > windowStart;
}

export function isGeneratedSlotStart(
  startTime: string,
  windows: WorkingWindow[],
): boolean {
  return generateSlotsForWindows(windows).some(
    (slot) => slot.startTime === startTime,
  );
}
