export interface Workshop {
  slug: string;
  title: string;
  description: string;
  schedule: string;
  startsAt: string | null;
  feeMinor: number | null;
  seats: number | null;
}

// Dates, prices and capacity remain unset until supplied by the clinic.
// Seats describe capacity, not live inventory. Use an ISO timestamp with +05:30
// when an exact start time is confirmed.
export const workshops: Workshop[] = [
  {
    slug: "letters-to-your-future-self",
    title: "Letters to Your Future Self",
    description:
      "Write a letter to your future self about what you have been through and what you aspire to be. We’ll seal it with wax and post it to you in mid-2027 — a reminder of your journey and hopes for the future.",
    schedule: "Every weekend in December 2026",
    startsAt: null,
    feeMinor: null,
    seats: null,
  },
  {
    slug: "vision-board-2027",
    title: "Vision Board Making for 2027",
    description:
      "End the year with a vision for the next. Create a vision board for 2027 that brings together your hopes, goals and aspirations for the year ahead.",
    schedule: "Every weekend in December 2026",
    startsAt: null,
    feeMinor: null,
    seats: null,
  },
];
