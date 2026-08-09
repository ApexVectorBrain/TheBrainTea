// Counselling-type taxonomy for admin-scheduled appointments. This module is
// the single source of truth for the five services the clinic books against
// and the canonical Service row each maps to. The booking layer resolves a type
// row (upserting the canonical one on first use) so durations, prices and the
// financial ledger all stay data-driven rather than hard-coded per booking.

export const COUNSELING_TYPES = [
  "ASSESSMENT",
  "CAREER_ACADEMIC",
  "COUPLE_FAMILY",
  "INDIVIDUAL",
  "INDIVIDUAL_THERAPY",
] as const;

export type CounselingType = (typeof COUNSELING_TYPES)[number];

/** Human labels for admin UI / audit trails. */
export const COUNSELING_TYPE_LABELS: Record<CounselingType, string> = {
  ASSESSMENT: "Assessment",
  CAREER_ACADEMIC: "Career & Academic Counselling",
  COUPLE_FAMILY: "Couples & Family Therapy",
  INDIVIDUAL: "Individual Counselling",
  INDIVIDUAL_THERAPY: "Individual Therapy",
};

export interface CounselingServiceDefault {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceMinor: number;
}

// Canonical Service definition per counselling type. Used to upsert a stable
// Service row the first time a type is scheduled, so the catalogue always has
// a matching offering without the admin needing to seed one by hand.
export const COUNSELING_SERVICE_DEFAULTS: Record<
  CounselingType,
  CounselingServiceDefault
> = {
  ASSESSMENT: {
    slug: "assessment",
    name: "Assessment",
    description:
      "A structured first consultation to understand a client's concerns, goals and support needs.",
    durationMinutes: 50,
    priceMinor: 180000,
  },
  CAREER_ACADEMIC: {
    slug: "career-academic-counselling",
    name: "Career & Academic Counselling",
    description:
      "Structured guidance for career transitions, academic stress and decision-making clarity.",
    durationMinutes: 50,
    priceMinor: 140000,
  },
  COUPLE_FAMILY: {
    slug: "couples-counseling",
    name: "Couples & Family Therapy",
    description:
      "Structured counselling for couples or families, guided by a consultant.",
    durationMinutes: 50,
    priceMinor: 220000,
  },
  INDIVIDUAL: {
    slug: "individual-counselling",
    name: "Individual Counselling",
    description:
      "One-to-one counselling focused on the client's concerns, goals and ongoing wellbeing.",
    durationMinutes: 50,
    priceMinor: 180000,
  },
  INDIVIDUAL_THERAPY: {
    slug: "individual-therapy",
    name: "Individual Therapy",
    description:
      "A focused one-to-one therapy session for personal concerns and ongoing wellbeing.",
    durationMinutes: 50,
    priceMinor: 180000,
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
