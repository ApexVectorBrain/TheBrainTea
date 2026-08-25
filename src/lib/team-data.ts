export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  photo: string;
  photoPosition?: string;
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
    role: "Counselling Psychologist",
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
    intro: [
      "Ananya takes a client-centered, integrative approach, adapting her work to each client’s story, needs, and goals. She believes that every client has an innate ability to heal and it's her duty to create a safe space to enable the client's healing and subsequent growth!",
      "She employs a client-paced, trauma informed, activity based, exploratory approach using multiple modalities as her foundation; aka, an eclectic approach. Her goal as a therapist is to help her clients' experience everything their life has to offer, to the fullest!",
    ],
  },
  {
    slug: "ananya-saxena",
    name: "Ananya Saxena",
    role: "Counselling Psychologist",
    photo: "/team/ananya-saxena.jpg",
    qualification:
      "MSc Counselling Psychology · BA Psychology, Sociology & English",
    experience:
      "Experience across counselling, rehabilitation and clinical settings",
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
    intro: [
      "Ananya believes therapy works best as a collaborative process, built on trust, openness, and safety. Her warm, inclusive, and non-judgmental practice gives clients room to explore and understand their experiences through approaches tailored to their needs.",
    ],
  },
  {
    slug: "sharayu-harpale",
    name: "Sharayu Harpale",
    role: "Counselling Psychologist",
    photo: "/team/sharayu-harpale.jpg",
    qualification: "PDCP Clinical Psychology · MA Psychology · BA Psychology",
    experience:
      "Experience in counselling, formulation and intervention",
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
    intro: [
      "Sharayu brings clinical expertise and genuine human connection together, creating a space where clients can feel heard, understood, and accepted without judgment. Her empathetic, collaborative, evidence-based approach helps people recognise unhelpful patterns, build healthier coping skills, and make meaningful, sustainable change.",
    ],
  },
  {
    slug: "gauri-ghorpade",
    name: "Gauri Ghorpade",
    role: "Counselling Psychologist",
    photo: "/team/gauri-ghorpade.png",
    photoPosition: "50% 28%",
    qualification:
      "PGDP Counselling & Psychotherapy · MSc Psychology · BSc Clinical Psychology",
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
  {
    slug: "krutika-a-sonigra",
    name: "Krutika A. Sonigra",
    role: "Counselling Psychologist",
    photo: "/team/krutika-a-sonigra.png",
    qualification:
      "PGDP Counselling Psychology · MSc Clinical Psychology · BA Psychology",
    approaches: [
      "Holistic Practice",
      "Evidence-Based Traditional Therapy",
      "Expressive Arts",
      "Relational Frameworks",
    ],
    specialisations: [
      "Anxiety",
      "Stress Management",
      "Self-Esteem",
      "Interpersonal Dynamics",
      "Personal Growth",
    ],
    intro: [
      "Krutika A. Sonigra is a psychologist, counselor, and art therapy practitioner dedicated to creating a safe, non-judgmental space where clients feel truly heard, understood, and supported. Rejecting a rigid, one-size-fits-all model, Krutika tailors each session to the individual’s unique personality, challenges, and goals.",
      "Her holistic practice integrates evidence-based traditional therapy with expressive arts and relational frameworks. This creative, multi-modal approach enables clients, both individuals and couples to process complex emotions, strengthen relationship bonds, and access deeper self-awareness beyond verbal expression. Krutika collaborates with clients across a range of focus areas, including anxiety, stress management, self-esteem, interpersonal dynamics, and personal growth.",
      "Ultimately, her mission is to equip clients with effective coping strategies and tools for sustainable emotional well-being.",
    ],
  },
  {
    slug: "shwetha-jayakrishnan",
    name: "Shwetha Jayakrishnan",
    role: "Counselling Psychologist",
    photo: "/team/shwetha-jayakrishnan.png",
    qualification: "MSc Clinical Psychology · BA Psychology",
    approaches: ["Warm", "Collaborative", "Human-Centred", "Practical Coping"],
    specialisations: [
      "Anxiety",
      "Overthinking",
      "Relationship Difficulties",
      "Emotional Overwhelm",
      "Self-Esteem Concerns",
      "Feeling Stuck",
    ],
    intro: [
      "Hello! I'm Shwetha, a mental health professional who believes that therapy doesn't have to be intimidating or overly clinical.",
      "I like to provide a space where you can simply be honest without worrying about being judged, or misunderstood.",
      "My approach is warm, collaborative and human-centered. I'd like to understand you as a person, while working towards understanding what you're going through and finding practical ways to cope, grow and feel more in control of your life.",
      "Whether it's anxiety, overthinking, relationship difficulties, emotional overwhelm, self-esteem concerns, or simply feeling stuck, I'm here to hear you out and hold your hand through the process of feeling better :)",
      "For me therapy isn't about changing who you are. It's about helping you understand yourself better and making life more easier and manageable to you.",
    ],
  },
];

export function getTeamMemberBySlug(slug: string) {
  return TEAM.find((t) => t.slug === slug);
}
