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
      "Can I do this online?"
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
      "Is it as effective as in person?",
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
      "Is it in person or online?"
    ],
    "practitioners": []
  }
} as const;

// Answers supported by the PDF and the existing clinic FAQ. Remaining clinical
// and operational answers must be confirmed rather than inferred from questions.
export const campaignFaqAnswers: Record<string, string> = {
  "What happens in the first session?": "The first session is a collaborative conversation. We get to know you, discuss what brings you to therapy and your goals, and give you space to ask questions.",
  "How many sessions will I need?": "We agree on a plan together after the first one.",
  "Can I do this online?": "Yes, online video consultations are available via Google Meet. You will need a stable internet connection and a quiet, private space.",
  "Which app do you use?": "Online sessions are conducted via Google Meet. You will need a stable internet connection and a quiet, private space.",
};
