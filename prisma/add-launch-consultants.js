/**
 * Add the clinic's launch consultants without touching clients, bookings,
 * payments, payouts, or any existing consultant records.
 *
 * This script is deliberately gated in netlify.toml. It creates each login
 * only if it does not already exist, so a successful one-time deployment can
 * never overwrite a consultant's later password change.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const INDIVIDUAL_COUNSELLING = {
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
};

const CONSULTANTS = [
  {
    name: "Ananya Sunil Nair",
    slug: "ananya-sunil-nair",
    email: "safespaceswithananya@gmail.com",
    photo: "/team/ananya-sunil-nair.jpg",
    passwordEnv: "CONSULTANT_ANANYA_NAIR_TEMP_PASSWORD",
    bio: `Ananya is a psychologist who has completed her MSc. Clinical Psychology and B.A. in Psychology, Sociology and Economics. She has completed certificate courses in art therapy and victim/emergency psychological counselling.

"I believe every client has a unique story, so I prefer to take a client-centered and integrative approach, adapting my interventions to meet their individual needs. I enjoy working with diverse populations and am committed to creating a safe, inclusive, and non-judgmental space where clients feel comfortable expressing themselves."

Apart from her passion for working as psychologist; Ananya enjoys hot masala chai, rainy weather, and is her loved ones' biggest cheerleader. She loves animals and has two fur babies of her own. You will often find her planning her next tattoo appointment or trying out lazy meal recipes at home!`,
  },
  {
    name: "Ananya Saxena",
    slug: "ananya-saxena",
    email: "ananyasaxena.psy@gmail.com",
    photo: "/team/ananya-saxena.jpg",
    passwordEnv: "CONSULTANT_ANANYA_SAXENA_TEMP_PASSWORD",
    bio: `Ananya is a counselling psychologist who has completed her MSc in Counselling Psychology and B.A. in Psychology, Sociology and English. She has experience working across individual counselling spaces (online and offline), rehabilitation and clinical settings and has also done a certificate course in expressive arts therapy.

“I believe therapy works best as a collaborative process, built on trust, openness and safety so I aim to create a warm, inclusive and non-judgmental space where clients can feel comfortable to explore and understand their experiences using approaches that are tailored to their needs.”

In her time outside of work, Ananya loves all things music — listening to it, singing and playing. She also enjoys art and crafts, long naps and discovering different cuisines, especially when it involves trying something new.`,
  },
  {
    name: "Sharayu Harpale",
    slug: "sharayu-harpale",
    email: "sharayuharpale.work@gmail.com",
    photo: "/team/sharayu-harpale.jpg",
    passwordEnv: "CONSULTANT_SHARAYU_HARPALE_TEMP_PASSWORD",
    bio: `Clinical Psychologist

Sharayu is a Clinical Psychologist dedicated to helping individuals navigate emotional challenges, understand themselves better, and build meaningful change. She believes therapy is a space where clinical expertise meets genuine human connection, a place where you can feel heard, understood, and accepted without judgment.

Her approach is empathetic, collaborative, and evidence-based. She integrates approaches such as Cognitive Behaviour Therapy (CBT), supportive psychotherapy, and solution-focused techniques, adapting them to each individual's needs, experiences, and goals. Alongside creating a safe and supportive environment, she focuses on practical strategies that help individuals understand unhelpful patterns, develop healthier coping skills, and make sustainable changes in their everyday lives.

Her clinical experience includes counselling, case formulation, and therapeutic interventions across a range of emotional and psychological concerns. She works with individuals experiencing anxiety and stress, self-esteem concerns, relationship difficulties, grief, life transitions, and adjustment challenges, with experience working across different age groups.

She believes therapy is not about “fixing” a person, but about creating the space and support needed for growth. Her aim is to build a therapeutic relationship grounded in trust, authenticity, and compassion, while helping individuals reconnect with their strengths and move towards a life that feels more meaningful and aligned with who they are.`,
  },
];

function requiredPassword(consultant) {
  const password = process.env[consultant.passwordEnv];
  if (!password || password.length < 10) {
    throw new Error(
      `Set ${consultant.passwordEnv} to a temporary password of at least 10 characters.`,
    );
  }
  return password;
}

async function userFor(consultant) {
  const existing = await prisma.user.findUnique({
    where: { email: consultant.email },
  });
  if (existing) {
    if (existing.role !== "THERAPIST") {
      throw new Error(`${consultant.email} already belongs to a non-therapist account.`);
    }
    return { user: existing, created: false };
  }

  return {
    user: await prisma.user.create({
      data: {
        email: consultant.email,
        passwordHash: await bcrypt.hash(requiredPassword(consultant), 12),
        role: "THERAPIST",
      },
    }),
    created: true,
  };
}

async function main() {
  // Validate before making any database changes.
  CONSULTANTS.forEach(requiredPassword);

  const individual = await prisma.service.upsert({
    where: { slug: INDIVIDUAL_COUNSELLING.slug },
    create: INDIVIDUAL_COUNSELLING,
    update: { isActive: true },
  });

  // The old service name was retired. Preserve every historical appointment
  // and financial record by moving its relation to the current service before
  // deleting the obsolete catalogue row.
  const retiredService = await prisma.service.findUnique({
    where: { slug: "individual-therapy" },
    include: { therapists: { select: { id: true } } },
  });
  if (retiredService) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: { serviceId: retiredService.id },
        data: { serviceId: individual.id, counselingType: "INDIVIDUAL" },
      });
      await tx.booking.updateMany({
        where: { counselingType: "INDIVIDUAL_THERAPY" },
        data: { counselingType: "INDIVIDUAL" },
      });
      if (retiredService.therapists.length) {
        await tx.service.update({
          where: { id: individual.id },
          data: { therapists: { connect: retiredService.therapists } },
        });
      }
      await tx.service.update({
        where: { id: retiredService.id },
        data: { therapists: { set: [] } },
      });
      await tx.service.delete({ where: { id: retiredService.id } });
    });
  }

  const madhumati = await prisma.therapist.findFirst({
    where: { slug: { in: ["madhumati-dhumak", "dr-madhumati-dhumak"] } },
    include: { availability: true },
  });
  const defaultAvailability = madhumati?.availability.length
    ? madhumati.availability.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
      }))
    : [1, 2, 3, 4, 5].flatMap((dayOfWeek) =>
        [9, 10, 11, 13, 14, 15, 16].map((hour) => ({
          dayOfWeek,
          startTime: `${String(hour).padStart(2, "0")}:00`,
          endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        })),
      );

  const createdNames = [];
  for (const consultant of CONSULTANTS) {
    const { user } = await userFor(consultant);
    const existing = await prisma.therapist.findUnique({
      where: { slug: consultant.slug },
    });

    if (existing && existing.userId && existing.userId !== user.id) {
      throw new Error(`${consultant.name}'s profile is already linked to another login.`);
    }

    if (existing) {
      await prisma.therapist.update({
        where: { id: existing.id },
        data: {
          userId: user.id,
          name: consultant.name,
          bio: consultant.bio,
          photo: consultant.photo,
          feeMinor: 150000,
          status: "APPROVED",
          isActive: true,
          services: { connect: [{ id: individual.id }] },
        },
      });
      continue;
    }

    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        name: consultant.name,
        slug: consultant.slug,
        bio: consultant.bio,
        photo: consultant.photo,
        feeMinor: 150000,
        status: "APPROVED",
        isActive: true,
        services: { connect: [{ id: individual.id }] },
      },
    });
    await prisma.therapistAvailability.createMany({
      data: defaultAvailability.map((slot) => ({
        therapistId: therapist.id,
        ...slot,
      })),
    });
    createdNames.push(consultant.name);
  }

  // "Everyone" means every currently active, approved consultant can be
  // selected for Individual Counselling. This leaves all existing service
  // assignments untouched.
  const activeConsultants = await prisma.therapist.findMany({
    where: { status: "APPROVED", isActive: true },
    select: { id: true },
  });
  await prisma.service.update({
    where: { id: individual.id },
    data: { therapists: { connect: activeConsultants } },
  });

  console.log("Launch consultants synchronised.", {
    created: createdNames,
    individualCounsellingConsultants: activeConsultants.length,
  });
}

main()
  .catch((error) => {
    console.error("Failed to add launch consultants:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
