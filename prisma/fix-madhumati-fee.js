/**
 * Non-destructively update Madhumati Dhumak's fee in an already-live database.
 * The booking wizard reads the consultant fee from the database, so changing
 * seed.js alone only fixes new databases. This script is safe to rerun: it
 * updates only Madhumati's consultant row and her individual-service prices.
 *
 * Usage: node prisma/fix-madhumati-fee.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MADHUMATI_SLUGS = ["dr-madhumati-dhumak", "madhumati-dhumak"];
const INDIVIDUAL_SERVICE_SLUGS = [
  "individual-therapy",
  "assessment",
  "individual-counselling",
];
const FEE_MINOR = 180000;

async function main() {
  const [consultant, services] = await prisma.$transaction([
    prisma.therapist.updateMany({
      where: { slug: { in: MADHUMATI_SLUGS } },
      data: { feeMinor: FEE_MINOR },
    }),
    prisma.service.updateMany({
      where: { slug: { in: INDIVIDUAL_SERVICE_SLUGS } },
      data: { priceMinor: FEE_MINOR },
    }),
  ]);

  console.log(
    `Madhumati fee updated to ₹1,800: ${consultant.count} consultant row(s), ${services.count} service row(s).`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to update Madhumati's fee:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
