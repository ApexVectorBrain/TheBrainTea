/**
 * Add public team members to the operational consultant roster without
 * overwriting any consultant later edited by an administrator.
 *
 * Profiles created here intentionally have no login. Admins can add account
 * access separately after receiving a real email address from the consultant.
 */
const { PrismaClient } = require("@prisma/client");
const { newPublicConsultants } = require("./public-roster.json");

const prisma = new PrismaClient();

function fallbackAvailability() {
  return [1, 2, 3, 4, 5].flatMap((dayOfWeek) =>
    [9, 10, 11, 13, 14, 15, 16].map((hour) => ({
      dayOfWeek,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
    })),
  );
}

async function main() {
  const individual = await prisma.service.findUnique({
    where: { slug: "individual-counselling" },
    select: { id: true },
  });
  if (!individual) {
    throw new Error(
      "Individual Counselling must exist before public consultants are added.",
    );
  }

  const madhumati = await prisma.therapist.findFirst({
    where: { slug: { in: ["madhumati-dhumak", "dr-madhumati-dhumak"] } },
    include: { availability: true },
  });
  const availability = madhumati?.availability.length
    ? madhumati.availability.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
      }))
    : fallbackAvailability();

  const created = [];
  const preserved = [];
  for (const consultant of newPublicConsultants) {
    const existing = await prisma.therapist.findUnique({
      where: { slug: consultant.slug },
      select: { id: true },
    });
    if (existing) {
      preserved.push(consultant.name);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const therapist = await tx.therapist.create({
        data: {
          name: consultant.name,
          slug: consultant.slug,
          bio: consultant.bio,
          photo: consultant.photo,
          feeMinor: consultant.feeMinor,
          status: "APPROVED",
          isActive: true,
          services: { connect: [{ id: individual.id }] },
        },
      });
      await tx.therapistAvailability.createMany({
        data: availability.map((slot) => ({
          therapistId: therapist.id,
          ...slot,
        })),
      });
    });
    created.push(consultant.name);
  }

  console.log("Public consultants synchronised.", { created, preserved });
}

main()
  .catch((error) => {
    console.error("Failed to add public consultants:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
