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
    slug: "assessment",
    name: "Assessment",
    tagline: "A steady space to understand yourself.",
    description:
      "A structured first consultation to understand your concerns, goals, and the support that may be most helpful for you.",
    suitableFor: [
      "Understanding current concerns",
      "Choosing the right support",
      "Clarifying therapy goals",
      "Career or academic concerns",
      "Emotional wellbeing",
    ],
    availability: ["Online", "Offline"],
  },
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
    slug: "psychometric-testing-assessment",
    name: "Psychometric Testing & Assessment",
    tagline: "Clear, evidence-based answers.",
    description:
      "Structured psychological assessments that provide clarity on personality, cognitive ability, learning, and emotional-behavioral concerns.",
    suitableFor: [
      "Personality assessment",
      "Intelligence assessment",
      "Learning difficulty assessment",
      "Career assessment",
      "Emotional & behavioral assessment",
      "ADHD screening",
      "Autism screening",
      "Diagnostic psychological evaluation",
    ],
    availability: ["Offline"],
    process:
      "Each assessment includes a clear purpose, session duration, testing process, and a defined report timeline.",
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
