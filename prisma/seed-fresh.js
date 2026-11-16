/**
 * Fresh production-ready seed.
 *
 * This intentionally clears all operational records, then creates only the
 * admin, reception, and Madhumati logins; Madhumati's availability; and the
 * public service catalogue. It creates no clients, bookings, payments,
 * payouts, or sample consultants.
 *
 * Run with: npm run db:seed:fresh
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { newPublicConsultants } = require("./public-roster.json");

const prisma = new PrismaClient();

const additionalConsultantPasswords = {
  ananyaNair: process.env.CONSULTANT_ANANYA_NAIR_TEMP_PASSWORD,
  ananyaSaxena: process.env.CONSULTANT_ANANYA_SAXENA_TEMP_PASSWORD,
  sharayuHarpale: process.env.CONSULTANT_SHARAYU_HARPALE_TEMP_PASSWORD,
};

const services = [
  {
    name: "Individual Counselling",
    slug: "individual-counselling",
    durationMinutes: 50,
    priceMinor: 150000,
    description:
      "One-to-one counselling focused on your concerns, goals, and ongoing wellbeing.",
    tagline: "A private space to understand yourself.",
    image: "/team/office.jpg",
    suitableFor: [
      "Stress and overwhelm",
      "Emotional wellbeing",
      "Life transitions",
      "Self-understanding",
      "Ongoing support",
    ],
    availability: ["Online", "Offline"],
  },
  {
    name: "Couples & Family Therapy",
    slug: "couples-counseling",
    durationMinutes: 50,
    priceMinor: 220000,
    description:
      "Sessions for couples and families to work through conflict, communication and boundaries.",
    tagline: "Reconnect through structured, guided conversation.",
    image: "/team/office2.jpg",
    suitableFor: [
      "Relationship conflict",
      "Marital concerns",
      "Family dynamics",
      "Parenting challenges",
      "Premarital counselling",
      "Communication skills",
    ],
    availability: ["Online", "Offline"],
  },
  {
    name: "Career & Academic Counselling",
    slug: "career-academic-counselling",
    durationMinutes: 50,
    priceMinor: 140000,
    description:
      "Structured guidance for career transitions, academic stress, and decision-making clarity.",
    tagline: "Direction when the path feels unclear.",
    image: "/team/office6.jpg",
    suitableFor: [
      "Career transitions",
      "Academic stress",
      "Decision-making",
      "Young-adult identity",
      "Study-life balance",
    ],
    availability: ["Online", "Offline"],
  },
];

async function main() {
  if (
    !additionalConsultantPasswords.ananyaNair ||
    !additionalConsultantPasswords.ananyaSaxena ||
    !additionalConsultantPasswords.sharayuHarpale
  ) {
    throw new Error(
      "Set the Ananya and Sharayu temporary consultant password environment variables before running the fresh seed.",
    );
  }

  console.log("Resetting database for a fresh launch...");

  // Delete in dependency order. This seed is deliberately destructive.
  await prisma.ledgerEntry.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.emailNotification.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.paymentRecord.deleteMany({});
  await prisma.bookingStatusHistory.deleteMany({});
  await prisma.bookingSlot.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.slotBlock.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.therapistAvailability.deleteMany({});
  await prisma.commissionSetting.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.therapist.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.internshipApplication.deleteMany({});

  await prisma.commissionSetting.create({
    data: { scope: "DEFAULT", commissionBps: 3000 },
  });

  await prisma.user.create({
    data: {
      email: "admin@thebraintea.co.in",
      passwordHash: await bcrypt.hash("AdminPass123!", 10),
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      email: "reception@thebraintea.com",
      passwordHash: await bcrypt.hash("ReceptionPass123!", 10),
      role: "RECEPTIONIST",
    },
  });

  const madhumatiUser = await prisma.user.create({
    data: {
      email: "psychologist.madhumati@gmail.com",
      passwordHash: await bcrypt.hash("DrMadhumati123!", 10),
      role: "THERAPIST",
    },
  });

  const createdServices = [];
  for (const service of services) {
    createdServices.push(await prisma.service.create({ data: service }));
  }

  const madhumati = await prisma.therapist.create({
    data: {
      userId: madhumatiUser.id,
      name: "Madhumati Dhumak",
      slug: "madhumati-dhumak",
      bio: "Counselling psychologist offering compassionate, evidence-based support for individuals, couples, and families.",
      feeMinor: 180000,
      status: "APPROVED",
      isActive: true,
      photo: "/team/madhumati-dhumak.jpg",
      services: { connect: createdServices.map((service) => ({ id: service.id })) },
    },
  });

  await prisma.therapistAvailability.createMany({
    data: [1, 2, 3, 4, 5].flatMap((dayOfWeek) =>
      [9, 10, 11, 13, 14, 15, 16].map((hour) => ({
        therapistId: madhumati.id,
        dayOfWeek,
        startTime: `${String(hour).padStart(2, "0")}:00`,
        endTime: `${String(hour + 1).padStart(2, "0")}:00`,
      })),
    ),
  });

  const individualCounselling = createdServices.find(
    (service) => service.slug === "individual-counselling",
  );
  const newConsultants = [
    {
      name: "Ananya Sunil Nair",
      slug: "ananya-sunil-nair",
      email: "safespaceswithananya@gmail.com",
      photo: "/team/ananya-sunil-nair.jpg",
      password: additionalConsultantPasswords.ananyaNair,
      bio: `Ananya is a psychologist who has completed her MSc. Clinical Psychology and B.A. in Psychology, Sociology and Economics. She has completed certificate courses in art therapy and victim/emergency psychological counselling.

"I believe every client has a unique story, so I prefer to take a client-centered and integrative approach, adapting my interventions to meet their individual needs. I enjoy working with diverse populations and am committed to creating a safe, inclusive, and non-judgmental space where clients feel comfortable expressing themselves."

Apart from her passion for working as psychologist; Ananya enjoys hot masala chai, rainy weather, and is her loved ones' biggest cheerleader. She loves animals and has two fur babies of her own. You will often find her planning her next tattoo appointment or trying out lazy meal recipes at home!`,
    },
    {
      name: "Ananya Saxena",
      slug: "ananya-saxena",
      email: "ananyasaxena.psy@gmail.com",
      photo: "/team/ananya-saxena.jpg",
      password: additionalConsultantPasswords.ananyaSaxena,
      bio: `Ananya is a counselling psychologist who has completed her MSc in Counselling Psychology and B.A. in Psychology, Sociology and English. She has experience working across individual counselling spaces (online and offline), rehabilitation and clinical settings and has also done a certificate course in expressive arts therapy.

“I believe therapy works best as a collaborative process, built on trust, openness and safety so I aim to create a warm, inclusive and non-judgmental space where clients can feel comfortable to explore and understand their experiences using approaches that are tailored to their needs.”

In her time outside of work, Ananya loves all things music — listening to it, singing and playing. She also enjoys art and crafts, long naps and discovering different cuisines, especially when it involves trying something new.`,
    },
    {
      name: "Sharayu Harpale",
      slug: "sharayu-harpale",
      email: "sharayuharpale.work@gmail.com",
      photo: "/team/sharayu-harpale.jpg",
      password: additionalConsultantPasswords.sharayuHarpale,
      bio: `Clinical Psychologist

Sharayu is a Clinical Psychologist dedicated to helping individuals navigate emotional challenges, understand themselves better, and build meaningful change. She believes therapy is a space where clinical expertise meets genuine human connection, a place where you can feel heard, understood, and accepted without judgment.

Her approach is empathetic, collaborative, and evidence-based. She integrates approaches such as Cognitive Behaviour Therapy (CBT), supportive psychotherapy, and solution-focused techniques, adapting them to each individual's needs, experiences, and goals. Alongside creating a safe and supportive environment, she focuses on practical strategies that help individuals understand unhelpful patterns, develop healthier coping skills, and make sustainable changes in their everyday lives.

Her clinical experience includes counselling, case formulation, and therapeutic interventions across a range of emotional and psychological concerns. She works with individuals experiencing anxiety and stress, self-esteem concerns, relationship difficulties, grief, life transitions, and adjustment challenges, with experience working across different age groups.

She believes therapy is not about “fixing” a person, but about creating the space and support needed for growth. Her aim is to build a therapeutic relationship grounded in trust, authenticity, and compassion, while helping individuals reconnect with their strengths and move towards a life that feels more meaningful and aligned with who they are.`,
    },
    ...newPublicConsultants,
  ];

  for (const consultant of newConsultants) {
    const user =
      consultant.email && consultant.password
        ? await prisma.user.create({
            data: {
              email: consultant.email,
              passwordHash: await bcrypt.hash(consultant.password, 10),
              role: "THERAPIST",
            },
          })
        : null;
    const therapist = await prisma.therapist.create({
      data: {
        userId: user?.id ?? null,
        name: consultant.name,
        slug: consultant.slug,
        bio: consultant.bio,
        photo: consultant.photo,
        feeMinor: consultant.feeMinor ?? 150000,
        status: "APPROVED",
        isActive: true,
        services: { connect: [{ id: individualCounselling.id }] },
      },
    });
    await prisma.therapistAvailability.createMany({
      data: [1, 2, 3, 4, 5].flatMap((dayOfWeek) =>
        [9, 10, 11, 13, 14, 15, 16].map((hour) => ({
          therapistId: therapist.id,
          dayOfWeek,
          startTime: `${String(hour).padStart(2, "0")}:00`,
          endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        })),
      ),
    });
  }

  console.log("Fresh launch seed complete.");
  console.log("Consultants: 7 (the complete public practitioner roster)");
  console.log("Services: 4");
  console.log("Clients, bookings, payments, and payouts: 0");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
