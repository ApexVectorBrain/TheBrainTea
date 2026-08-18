import { describe, expect, it } from "vitest";
import {
  bookingPortraitStyle,
  orderBookingConsultants,
} from "../booking-consultants";

describe("booking consultant presentation", () => {
  it("puts Madhumati first and Sharayu second while preserving everyone else", () => {
    const consultants = [
      { name: "Ananya Saxena", slug: "ananya-saxena" },
      { name: "Gauri Ghorpade", slug: "gauri-ghorpade" },
      { name: "Sharayu Harpale", slug: "sharayu-harpale" },
      { name: "Dr. Madhumati Dhumak", slug: "dr-madhumati-dhumak" },
      { name: "Ananya Sunil Nair", slug: "ananya-sunil-nair" },
    ];

    expect(orderBookingConsultants(consultants).map(({ name }) => name)).toEqual([
      "Dr. Madhumati Dhumak",
      "Sharayu Harpale",
      "Ananya Saxena",
      "Gauri Ghorpade",
      "Ananya Sunil Nair",
    ]);
    expect(consultants[0].name).toBe("Ananya Saxena");
  });

  it("supports Madhumati's newer slug and name without a title", () => {
    const ordered = orderBookingConsultants([
      { name: "Another Consultant", slug: "another-consultant" },
      { name: "Madhumati Dhumak", slug: "madhumati-dhumak" },
      { name: "Sharayu Harpale", slug: "sharayu-harpale" },
    ]);

    expect(ordered.map(({ slug }) => slug)).toEqual([
      "madhumati-dhumak",
      "sharayu-harpale",
      "another-consultant",
    ]);
  });

  it("leaves empty and single-consultant results intact", () => {
    expect(orderBookingConsultants([])).toEqual([]);
    expect(
      orderBookingConsultants([{ name: "Only Consultant", slug: "only" }]),
    ).toEqual([{ name: "Only Consultant", slug: "only" }]);
  });

  it("keeps Sharayu second when legacy and current Madhumati rows coexist", () => {
    const ordered = orderBookingConsultants([
      { name: "Dr. Madhumati Dhumak", slug: "dr-madhumati-dhumak" },
      { name: "Madhumati Dhumak", slug: "madhumati-dhumak" },
      { name: "Sharayu Harpale", slug: "sharayu-harpale" },
      { name: "Another Consultant", slug: "another-consultant" },
    ]);

    expect(ordered.map(({ slug }) => slug)).toEqual([
      "dr-madhumati-dhumak",
      "sharayu-harpale",
      "madhumati-dhumak",
      "another-consultant",
    ]);
  });

  it("centers and tightens the two tall portraits", () => {
    expect(
      bookingPortraitStyle({
        name: "Ananya Sunil Nair",
        slug: "ananya-sunil-nair",
      }),
    ).toEqual({
      objectPosition: "50% 52%",
      transform: "scale(1.65)",
      transformOrigin: "50% 52%",
    });
    expect(
      bookingPortraitStyle({
        name: "Sharayu Harpale",
        slug: "sharayu-harpale",
      }),
    ).toEqual({
      objectPosition: "50% 48%",
      transform: "scale(2)",
      transformOrigin: "50% 48%",
    });
    expect(
      bookingPortraitStyle({ name: "Someone Else", slug: "someone-else" }),
    ).toEqual({
      objectPosition: "50% 20%",
      transform: "scale(1)",
      transformOrigin: "50% 20%",
    });
  });
});
