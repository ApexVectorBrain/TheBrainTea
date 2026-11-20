import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Workshop } from "@/lib/workshops";

const state = vi.hoisted(() => ({ workshops: [] as Workshop[] }));
vi.mock("@/lib/workshops", () => ({ get workshops() { return state.workshops; } }));
import WorkshopsPage from "@/app/workshops/page";

const workshop: Workshop = {
  slug: "letter-writing", title: "Letters to Your Future Self",
  description: "Letters will be posted in mid-2027.",
  schedule: "Every weekend in December 2026",
  startsAt: null, feeMinor: null, seats: null,
};

describe("workshop logistics display", () => {
  it("shows unconfirmed logistics without inventing free admission, capacity or dates", () => {
    state.workshops = [workshop];
    const html = renderToStaticMarkup(React.createElement(WorkshopsPage));
    expect(html).toContain("Exact dates and times will be announced soon.");
    expect(html).toContain("Fee: please enquire on WhatsApp.");
    expect(html).toContain("Seat availability: please enquire on WhatsApp.");
    expect(html).not.toContain("<time");
    expect(html).not.toContain("₹");
    expect(html).not.toContain("Invalid Date");
    expect(html).toContain('data-workshop-name="Letters to Your Future Self"');
    expect(decodeURIComponent(html)).toContain("Please share the dates, timings, fee and seat availability.");
  });

  it("renders confirmed times in clinic time and preserves a genuine zero fee", () => {
    state.workshops = [{ ...workshop, startsAt: "2026-12-05T10:00:00+05:30", feeMinor: 0, seats: 12 }];
    const html = renderToStaticMarkup(React.createElement(WorkshopsPage));
    expect(html).toContain('dateTime="2026-12-05T10:00:00+05:30"');
    expect(html).toContain("10:00");
    expect(html).toContain("IST");
    expect(html).toContain("Capacity: 12 seats");
    expect(html).not.toContain("Fee: please enquire");
    expect(html).not.toContain("announced soon");
  });
});
