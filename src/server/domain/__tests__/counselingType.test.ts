import { describe, expect, it } from "vitest";
import {
  COUNSELING_SERVICE_DEFAULTS,
  COUNSELING_TYPES,
  counselingTypeLabel,
  counselingTypesForServiceSlugs,
  isCounselingType,
} from "../counselingType";

describe("counselingType domain", () => {
  it("recognises the supported types", () => {
    expect(isCounselingType("LEGACY_TYPE")).toBe(false);
    expect(isCounselingType("CAREER_ACADEMIC")).toBe(true);
    expect(isCounselingType("INDIVIDUAL")).toBe(true);
    expect(isCounselingType("COUPLE_FAMILY")).toBe(true);
    expect(isCounselingType("GROUP")).toBe(false);
    expect(isCounselingType("")).toBe(false);
  });

  it("labels known types and falls back for unknown/null", () => {
    expect(counselingTypeLabel("LEGACY_TYPE")).toBe("—");
    expect(counselingTypeLabel("CAREER_ACADEMIC")).toBe(
      "Career & Academic Counselling",
    );
    expect(counselingTypeLabel("INDIVIDUAL")).toBe("Individual Counselling");
    expect(counselingTypeLabel("COUPLE_FAMILY")).toBe(
      "Couples & Family Therapy",
    );
    expect(counselingTypeLabel(null)).toBe("—");
    expect(counselingTypeLabel("NONSENSE")).toBe("—");
  });

  it("maps a consultant's assigned service slugs to scheduling choices", () => {
    expect(
      counselingTypesForServiceSlugs([
        "individual-counselling",
        "unrelated-service",
      ]),
    ).toEqual(["INDIVIDUAL"]);
    expect(counselingTypesForServiceSlugs([])).toEqual([]);
  });

  it("defines a canonical, well-formed service for every type", () => {
    for (const type of COUNSELING_TYPES) {
      const def = COUNSELING_SERVICE_DEFAULTS[type];
      expect(def.slug).toMatch(/^[a-z0-9-]+$/);
      expect(def.name.length).toBeGreaterThan(0);
      expect(def.durationMinutes).toBeGreaterThan(0);
      expect(Number.isInteger(def.priceMinor)).toBe(true);
      expect(def.priceMinor).toBeGreaterThan(0);
      expect(def.availability).toEqual(["Online", "Offline"]);
    }
  });

  it("keeps canonical service slugs unique across types", () => {
    const slugs = COUNSELING_TYPES.map(
      (t) => COUNSELING_SERVICE_DEFAULTS[t].slug,
    );
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps the individual counselling fee at ₹1,500", () => {
    expect(COUNSELING_SERVICE_DEFAULTS.INDIVIDUAL.priceMinor).toBe(150000);
  });
});
