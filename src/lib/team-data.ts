export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  photo?: string;
  qualification?: string;
  experience?: string;
  approaches: string[];
  specialisations: string[];
  languages?: string[];
  fee?: string;
  intro: string[];
}

export const TEAM: TeamMember[] = [
  {
    slug: "madhumati-dhumak",
    name: "Madhumati Dhumak",
    role: "Lead Counseling Psychologist",
    photo: "/team/madhumati-dhumak.jpg",
    qualification:
      "PGDP Counseling Psychology · MSc Clinical Psychology · BSc Clinical Psychology",
    experience: "3+ years in clinical practice",
    approaches: [
      "Integrative & Evidence-Based Therapy",
      "Trauma-Informed Care",
      "Personalized Treatment Planning",
    ],
    specialisations: [
      "Adults",
      "Adolescents",
      "Anxiety",
      "Depression",
      "Relationship Challenges",
      "Trauma",
      "Emotional Regulation",
      "Life Transition",
      "Self-Esteem",
      "Grief",
      "Burnout",
      "Attachment Concerns",
      "Interpersonal Difficulties",
      "Neurodivergent Individual",
    ],
    languages: ["English", "Hindi", "Marathi"],
    fee: "₹1,800 / session · Sliding scale available",
    intro: [
      "She believes that meaningful healing begins when people feel genuinely seen, heard, and understood. Her approach is deeply individualized because no two people experience life in the same way. She integrates evidence-based therapeutic approaches to create a space that adapts to each client's unique needs, pace, and goals.",
      "Her work combines insight with action, helping clients not only understand the patterns that keep them stuck but also develop healthier ways of relating to themselves and the people around them. Above all, she strives to create a therapeutic relationship built on trust, authenticity, and compassion- where clients can safely explore, heal, and grow.",
    ],
  },
  {
    slug: "ananya-sunil-nair",
    name: "Ananya Sunil Nair",
    role: "Counseling Psychologist",
    approaches: [],
    specialisations: [],
    intro: [
      "Ananya takes a client-centered, integrative approach, adapting her work to each client’s story, needs, and goals. She believes that every client has an innate ability to heal and it's her duty to create a safe space to enable the client's healing and subsequent growth!",
      "She employs a client-paced, trauma informed, activity based, exploratory approach using multiple modalities as her foundation; aka, an eclectic approach. Her goal as a therapist is to help her clients' experience everything their life has to offer, to the fullest!",
    ],
  },
  {
    slug: "gauri-ghorpade",
    name: "Gauri Ghorpade",
    role: "Psychologist",
    photo: "/team/gauri-ghorpade.png",
    approaches: [
      "Integrative & Evidence-Based",
      "Person-Centred",
      "Trauma-Informed",
      "LGBTQ+ Affirmative",
      "CBT & REBT-Informed",
      "Strengths-Based",
    ],
    specialisations: [
      "Anxiety, Stress & Emotional Wellbeing",
      "Relationships, Self-Worth & Personal Challenges",
      "Life Transitions, Trauma & Growth",
    ],
    intro: [
      "Therapy is a space to pause, understand, grow, and find your way forward.",
      "Gauri believes there is no one-size-fits-all approach to therapy, and draws from different evidence-based approaches to meet each person where they are.",
      "Her work centres around helping individuals understand themselves better, build healthier relationships, navigate challenges, and create meaningful change in their lives.",
    ],
  },
];

export function getTeamMemberBySlug(slug: string) {
  return TEAM.find((t) => t.slug === slug);
}
