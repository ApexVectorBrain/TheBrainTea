export interface ServiceContent {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  suitableFor: string[];
  availability: ("Online" | "Offline")[];
  topics?: string[];
  process?: string;
}

export const SERVICES: ServiceContent[] = [
  {
    slug: "couple-family-therapy",
    name: "Couple & Family Therapy",
    tagline: "Reconnect through structured, guided conversation.",
    description:
      "A neutral, structured space to resolve conflict, rebuild communication, and restore intimacy -- for couples and families at any stage.",
    suitableFor: [
      "Relationship conflicts",
      "Marital concerns",
      "Family dynamics",
      "Parenting challenges",
      "Premarital counselling",
      "Conflict resolution",
      "Communication skills",
    ],
    availability: ["Online", "Offline"],
  },
  {
    slug: "support-groups",
    name: "Support Groups",
    tagline: "You are not the only one carrying this.",
    description:
      "Guided group sessions that bring people with shared experiences together in a safe, facilitated setting.",
    suitableFor: [
      "Anxiety",
      "Women's mental health",
      "Caregiver support",
      "Grief",
      "Student support",
      "Young adult well-being",
    ],
    availability: ["Online", "Offline"],
  },
  {
    slug: "psychiatric-support",
    name: "Psychiatric Support",
    tagline: "Medical care, delivered with warmth.",
    description:
      "Psychiatric evaluation, medication consultation, and follow-up care, delivered in collaboration with your therapist for continuity of care.",
    suitableFor: [
      "Psychiatric evaluation",
      "Medication consultation",
      "Follow-up reviews",
      "Collaborative therapist care",
    ],
    availability: ["Online", "Offline"],
    process: "Support is provided by qualified, registered psychiatrists.",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
