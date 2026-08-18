type NamedConsultant = {
  name: string;
  slug?: string;
};

// Booking order is a clinic preference, independent of the alphabetical
// directory order used elsewhere. Names are included as a fallback for older
// database rows whose Madhumati slug still carries the `dr-` prefix.
const BOOKING_PRIORITY = [
  [
    "madhumati-dhumak",
    "dr-madhumati-dhumak",
    "madhumati dhumak",
    "dr. madhumati dhumak",
  ],
  ["sharayu-harpale", "sharayu harpale"],
] as const;

const PORTRAIT_FRAMING: Record<
  string,
  { objectPosition: string; scale: number }
> = {
  "ananya-sunil-nair": { objectPosition: "50% 52%", scale: 1.65 },
  "sharayu-harpale": { objectPosition: "50% 48%", scale: 2 },
};

function normalized(value?: string) {
  return value?.trim().toLocaleLowerCase("en-IN") ?? "";
}

function matchesBookingPriority(
  consultant: NamedConsultant,
  aliases: readonly string[],
) {
  const identifiers = [normalized(consultant.slug), normalized(consultant.name)];
  return aliases.some((alias) => identifiers.includes(alias));
}

/** Put the clinic's preferred consultants first without reordering the rest. */
export function orderBookingConsultants<T extends NamedConsultant>(
  consultants: T[],
): T[] {
  const promotedIndexes = new Set<number>();
  const promoted = BOOKING_PRIORITY.flatMap((aliases) => {
    const index = consultants.findIndex(
      (consultant, consultantIndex) =>
        !promotedIndexes.has(consultantIndex) &&
        matchesBookingPriority(consultant, aliases),
    );

    if (index === -1) return [];
    promotedIndexes.add(index);
    return [consultants[index]];
  });

  return [
    ...promoted,
    ...consultants.filter((_, index) => !promotedIndexes.has(index)),
  ];
}

/** CSS framing for booking-card portraits that need custom focus and zoom. */
export function bookingPortraitStyle(consultant: NamedConsultant) {
  const framing = PORTRAIT_FRAMING[normalized(consultant.slug)] ?? {
    objectPosition: "50% 20%",
    scale: 1,
  };

  return {
    objectPosition: framing.objectPosition,
    transform: `scale(${framing.scale})`,
    transformOrigin: framing.objectPosition,
  };
}
