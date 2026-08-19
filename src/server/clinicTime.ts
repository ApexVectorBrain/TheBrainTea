/**
 * Appointment date/time inputs are civil times at the clinic, not times in
 * whichever timezone happens to host a serverless function. India has no DST,
 * so converting the fixed UTC+05:30 offset is deterministic.
 */
const CLINIC_OFFSET_MINUTES = 5 * 60 + 30;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function parseClinicDateTime(date: string, time: string): Date | null {
  const match = DATE_RE.exec(date);
  if (!match || !TIME_RE.test(time)) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const calendarDay = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDay.getUTCFullYear() !== year ||
    calendarDay.getUTCMonth() !== month - 1 ||
    calendarDay.getUTCDate() !== day
  ) {
    return null;
  }

  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) -
      CLINIC_OFFSET_MINUTES * 60_000,
  );
}

export function clinicDayBounds(date: string): { start: Date; end: Date } | null {
  const start = parseClinicDateTime(date, "00:00");
  if (!start) return null;
  return { start, end: new Date(start.getTime() + 24 * 60 * 60_000 - 1) };
}

export function clinicDayOfWeek(date: string): number | null {
  const match = DATE_RE.exec(date);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const calendarDay = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDay.getUTCFullYear() !== year ||
    calendarDay.getUTCMonth() !== month - 1 ||
    calendarDay.getUTCDate() !== day
  ) {
    return null;
  }
  return calendarDay.getUTCDay();
}

export function clinicDayOfWeekForDate(date: Date): number {
  return new Date(
    date.getTime() + CLINIC_OFFSET_MINUTES * 60_000,
  ).getUTCDay();
}

export function formatClinicTime(date: Date): string {
  const clinicTime = new Date(
    date.getTime() + CLINIC_OFFSET_MINUTES * 60_000,
  );
  return `${String(clinicTime.getUTCHours()).padStart(2, "0")}:${String(
    clinicTime.getUTCMinutes(),
  ).padStart(2, "0")}`;
}
