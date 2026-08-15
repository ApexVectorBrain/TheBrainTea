export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  photo: string;
  qualification: string;
  experience: string;
  approaches: string[];
  specialisations: string[];
  languages?: string[];
  fee: string;
  intro: string;
}

export const TEAM: TeamMember[] = [
  {
    slug: "madhumati-dhumak",
    name: "Madhumati Dhumak",
    role: "Founder & Lead Counselling Psychologist",
    photo: "/team/madhumati-dhumak.jpg",
    qualification:
      "PGDP Counselling Psychology · MSc Clinical Psychology · BSc Clinical Psychology",
    experience: "3+ years in clinical practice",
    approaches: [
      "Integrative & Evidence-Based Therapy",
      "Trauma-Informed Care",
      "Personalised Treatment Planning",
    ],
    specialisations: ["Anxiety & Stress", "Trauma & PTSD", "Life Transitions"],
    languages: ["English", "Hindi", "Marathi"],
    fee: "₹1,800 / session · Sliding scale available",
    intro:
      "Meaningful healing begins when people feel genuinely seen, heard, and understood. Madhumati’s approach is warm, collaborative, and deeply individualised, integrating evidence-based therapeutic approaches around each client’s needs, pace, and goals. Her work combines insight with action, helping clients understand the patterns that keep them stuck and develop healthier ways of relating to themselves and the people around them.",
  },
  {
    slug: "ananya-sunil-nair",
    name: "Ananya Sunil Nair",
    role: "Psychologist",
    photo: "/team/ananya-sunil-nair.jpg",
    qualification:
      "MSc Clinical Psychology · BA Psychology, Sociology & Economics",
    experience: "Psychologist · Art therapy and crisis counselling trained",
    approaches: [
      "Client-Centred Therapy",
      "Integrative Care",
      "Trauma-Informed Support",
    ],
    specialisations: [
      "Individual Counselling",
      "Art Therapy",
      "Crisis Counselling",
    ],
    fee: "₹1,500 / session",
    intro:
      "Every client has a unique story, so Ananya takes a client-centred and integrative approach that adapts to each person’s needs. With training in art therapy and victim and emergency psychological counselling, she is committed to creating a safe, inclusive, and non-judgmental space where clients can express themselves comfortably.",
  },
  {
    slug: "ananya-saxena",
    name: "Ananya Saxena",
    role: "Counselling Psychologist",
    photo: "/team/ananya-saxena.jpg",
    qualification:
      "MSc Counselling Psychology · BA Psychology, Sociology & English",
    experience: "Experience across counselling, rehabilitation and clinical settings",
    approaches: [
      "Collaborative Therapy",
      "Tailored Interventions",
      "Expressive Arts Therapy",
    ],
    specialisations: [
      "Individual Counselling",
      "Rehabilitation Support",
      "Expressive Arts Therapy",
    ],
    fee: "₹1,500 / session",
    intro:
      "Ananya believes therapy works best as a collaborative process, built on trust, openness, and safety. Her warm, inclusive, and non-judgmental practice gives clients room to explore and understand their experiences through approaches tailored to their needs.",
  },
  {
    slug: "sharayu-harpale",
    name: "Sharayu Harpale",
    role: "Clinical Psychologist",
    photo: "/team/sharayu-harpale.jpg",
    qualification: "Clinical Psychologist",
    experience: "Experience in assessment, counselling, formulation and intervention",
    approaches: [
      "Cognitive Behaviour Therapy",
      "Supportive Psychotherapy",
      "Solution-Focused Techniques",
    ],
    specialisations: [
      "Anxiety & Stress",
      "Relationship Difficulties",
      "Life Transitions",
    ],
    fee: "₹1,500 / session",
    intro:
      "Sharayu brings clinical expertise and genuine human connection together, creating a space where clients can feel heard, understood, and accepted without judgment. Her empathetic, collaborative, evidence-based approach helps people recognise unhelpful patterns, build healthier coping skills, and make meaningful, sustainable change.",
  },
];

export function getTeamMemberBySlug(slug: string) {
  return TEAM.find((t) => t.slug === slug);
}
