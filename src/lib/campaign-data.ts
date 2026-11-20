export const campaigns = {
  "anxiety-counselling-pune": {
    "title": "Counselling for anxiety and overthinking in Pune",
    "line": "You don’t need the right words to start. You decide where we begin, and we work at your pace.",
    "audiences": [
      "Replaying conversations at night",
      "Sunday-evening dread before the week",
      "Worry that won’t switch off at work",
      "Feeling stuck on a decision for months"
    ],
    "questions": [
      "What happens in the first session?",
      "How many sessions will I need?",
      "Can I do sessions online?"
    ],
    "practitioners": [
      "Shwetha Jayakrishnan",
      "Sharayu Harpale",
      "Krutika A. Sonigra",
      "Gauri Ghorpade"
    ]
  },
  "couples-counselling-pune": {
    "title": "Couples and marriage counselling in Pune",
    "line": "Nobody is put on trial. Both of you get heard.",
    "audiences": [
      "The same argument in different forms",
      "Distance or silence at home",
      "Family and in-law boundaries",
      "Engaged couples preparing for marriage"
    ],
    "questions": [
      "What if my partner isn’t sure about coming?",
      "Do you take sides?",
      "Do you offer pre-marital sessions?"
    ],
    "practitioners": [
      "Krutika A. Sonigra",
      "Gauri Ghorpade",
      "Madhumati Dhumak"
    ]
  },
  "teen-counselling-pune": {
    "title": "Counselling for children and teenagers in Pune",
    "line": "A safe space for your child, and clear updates for you.",
    "audiences": [
      "Exam and board pressure",
      "Changes in sleep, mood or friendships",
      "School refusal",
      "Screen time and family conflict"
    ],
    "questions": [
      "What do you tell parents, and what stays private?",
      "Does a parent need to come to the first session?",
      "Can sessions fit around exams?"
    ],
    "practitioners": [
      "Madhumati Dhumak"
    ]
  },
  "online-counselling": {
    "title": "Online counselling with Pune psychologists",
    "line": "The same psychologists, from wherever you are. In English, Hindi and Marathi.",
    "audiences": [
      "People in other cities or abroad",
      "Busy working hours",
      "Wanting to talk in Marathi or Hindi",
      "Preferring to talk from home"
    ],
    "questions": [
      "Which app do you use?",
      "Is online counselling as effective as in-person counselling?",
      "Can I pay from outside India?"
    ],
    "practitioners": [
      "Madhumati Dhumak",
      "Ananya Sunil Nair",
      "Ananya Saxena",
      "Sharayu Harpale",
      "Gauri Ghorpade",
      "Krutika A. Sonigra",
      "Shwetha Jayakrishnan"
    ]
  },
  "career-counselling-pune": {
    "title": "Career and academic counselling in Pune",
    "line": "For students, graduates and anyone thinking about a change.",
    "audiences": [
      "Choosing a stream or course",
      "Exam results and what next",
      "Regret about a course or job",
      "Family pressure about a career"
    ],
    "questions": [
      "Do you do aptitude tests?",
      "Can parents join?",
      "Is the assessment in person or online?"
    ],
    "practitioners": []
  }
} as const;

type CampaignQuestion = (typeof campaigns)[keyof typeof campaigns]["questions"][number];

// Clinic-supplied answers, received 20 November 2026.
export const campaignFaqAnswers = {
  "What happens in the first session?": "The first session is an opportunity to understand what brings you in, your concerns, and what you'd like to work towards. There's no pressure to share everything at once.",
  "How many sessions will I need?": "There's no fixed number. We'll collaboratively decide a plan after our first session, based on your needs, goals and pace.",
  "Can I do sessions online?": "Yes! Online sessions are conducted through Google Meet. Your meeting link is shared once your appointment and payment are confirmed.",
  "What if my partner isn’t sure about coming?": "That's okay. You can begin individually to explore your concerns, and we can discuss how to approach couple sessions when both partners feel ready.",
  "Do you take sides?": "We don't take sides or assign blame. We work towards understanding each person's perspective, patterns and needs, while creating space for constructive change.",
  "Do you offer pre-marital sessions?": "Yes! Pre-marital sessions help couples explore communication, expectations, values, conflict, boundaries and life together before marriage.",
  "What do you tell parents, and what stays private?": "We respect your privacy. Information is kept confidential, with exceptions when safety concerns or legal/ethical obligations require disclosure. These boundaries are explained at the beginning.",
  "Does a parent need to come to the first session?": "Depending on your age and consent requirements, a parent or guardian may be involved initially. We also ensure you have space to speak privately.",
  "Can sessions fit around exams?": "Absolutely. We understand academic schedules and work collaboratively to find timings that suit you.",
  "Which app do you use?": "Online sessions are conducted through Google Meet. Your meeting link is shared after your slot is confirmed and payment is completed.",
  "Is online counselling as effective as in-person counselling?": "Online counselling can be effective for many concerns. Suitability depends on your needs, circumstances and the nature of support required.",
  "Can I pay from outside India?": "Yes! International payments are accepted through PhonePe using international cards, subject to payment eligibility and availability.",
  "Do you do aptitude tests?": "Yes. We offer aptitude and other psychometric assessments depending on your needs and the purpose of the assessment.",
  "Can parents join?": "Parents may be involved where appropriate, particularly for younger clients. Their involvement is discussed beforehand, keeping the individual's comfort and confidentiality in mind.",
  "Is the assessment in person or online?": "Assessments may be conducted in person or online, depending on the test, its requirements and suitability."
} satisfies Record<CampaignQuestion, string>;
