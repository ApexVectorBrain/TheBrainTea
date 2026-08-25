// Counselling-type taxonomy for admin-scheduled appointments. This module is
// the single source of truth for the five services the clinic books against
// and the canonical Service row each maps to. The booking layer resolves a type
// row (upserting the canonical one on first use) so durations, prices and the
// financial ledger all stay data-driven rather than hard-coded per booking.

export const COUNSELING_TYPES = [
  "CAREER_ACADEMIC",
  "COUPLE_FAMILY",
  "INDIVIDUAL",
] as const;

export type CounselingType = (typeof COUNSELING_TYPES)[number];

/** Human labels for admin UI / audit trails. */
export const COUNSELING_TYPE_LABELS: Record<CounselingType, string> = {
  CAREER_ACADEMIC: "Career & Academic Counselling",
  COUPLE_FAMILY: "Couples & Family Therapy",
  INDIVIDUAL: "Individual Counselling",
};

export interface CounselingServiceDefault {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceMinor: number;
  availability: ["Online", "Offline"];
}

// Canonical Service definition per counselling type. Used to upsert a stable
// Service row the first time a type is scheduled, so the catalogue always has
// a matching offering without the admin needing to seed one by hand.
export const COUNSELING_SERVICE_DEFAULTS: Record<
  CounselingType,
  CounselingServiceDefault
> = {
  CAREER_ACADEMIC: {
    slug: "career-academic-counselling",
    name: "Career & Academic Counselling",
    description:
      "Structured guidance for career transitions, academic stress and decision-making clarity.",
    durationMinutes: 50,
    priceMinor: 140000,
    availability: ["Online", "Offline"],
  },
  COUPLE_FAMILY: {
    slug: "couples-counseling",
    name: "Couples & Family Therapy",
    description:
      "Structured counselling for couples or families, guided by a consultant.",
    durationMinutes: 50,
    priceMinor: 220000,
    availability: ["Online", "Offline"],
  },
  INDIVIDUAL: {
    slug: "individual-counselling",
    name: "Individual Counselling",
    description:
      "One-to-one counselling focused on the client's concerns, goals and ongoing wellbeing.",
    durationMinutes: 50,
    priceMinor: 150000,
    availability: ["Online", "Offline"],
  },
};

export function counselingTypesForServiceSlugs(
  serviceSlugs: readonly string[],
): CounselingType[] {
  const offered = new Set(serviceSlugs);
  return COUNSELING_TYPES.filter((type) =>
    offered.has(COUNSELING_SERVICE_DEFAULTS[type].slug),
  );
}

export function isCounselingType(value: string): value is CounselingType {
  return (COUNSELING_TYPES as readonly string[]).includes(value);
}

export function counselingTypeLabel(value: string | null | undefined): string {
  if (value && isCounselingType(value)) return COUNSELING_TYPE_LABELS[value];
  return "—";
}
