/** Keep every active public service available both online and in person. */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const AVAILABILITY = ["Online", "Offline"];

async function main() {
  const activeServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, availability: true },
  });
  const changed = activeServices.filter(
    ({ availability }) =>
      availability.length !== AVAILABILITY.length ||
      AVAILABILITY.some((mode) => !availability.includes(mode)),
  );

  await prisma.$transaction(
    changed.map(({ id }) =>
      prisma.service.update({
        where: { id },
        data: { availability: AVAILABILITY },
      }),
    ),
  );

  console.log("Service availability synchronised.", {
    updated: changed.map(({ name }) => name),
    preserved: activeServices
      .filter(({ id }) => !changed.some((service) => service.id === id))
      .map(({ name }) => name),
  });
}

main()
  .catch((error) => {
    console.error("Failed to synchronise service availability:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
