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

const prisma = new PrismaClient();

const services = [
  {
    name: "Individual Therapy",
    slug: "individual-therapy",
    durationMinutes: 50,
    priceMinor: 150000,
    description:
      "A focused, one-on-one session designed to explore personal narratives, address psychological blocks, and cultivate self-awareness.",
    tagline: "A steady space to understand yourself.",
    image: "/team/office1.jpg",
    suitableFor: [
      "Anxiety",
      "Depression",
      "Stress & burnout",
      "Self-esteem",
      "Grief & loss",
      "Emotional regulation",
    ],
    availability: ["Online", "Offline"],
  },
  {
    name: "Assessment",
    slug: "assessment",
    durationMinutes: 50,
    priceMinor: 150000,
    description:
      "A structured first consultation to understand your concerns, goals, and the support that may be most helpful for you.",
    tagline: "Clarity for your next step.",
    image: "/team/office3.jpg",
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
    name: "Couples & Family Therapy",
    slug: "couples-counseling",
    durationMinutes: 50,
    priceMinor: 220000,
    description:
      "Structured mediation to enhance relational dynamics, dismantle communication barriers, and restore intimacy for couples and families.",
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
    availability: ["Offline"],
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
      email: "madhumatidhumak@thebraintea.co.in",
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
      feeMinor: 150000,
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

  console.log("Fresh launch seed complete.");
  console.log("Consultants: 1 (Madhumati Dhumak)");
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
