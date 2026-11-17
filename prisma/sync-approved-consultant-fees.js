/** Synchronize clinic-approved list fees in paise; never changes booking snapshots.
 * Run after roster creation. Existing paid-service overrides adopt the approved
 * consultant fee; free discovery-call overrides and assignments are preserved.
 */
const approvedFees = require("./approved-consultant-fees.json");
async function syncApprovedFees(prisma) {
  return prisma.$transaction(async tx => {
    for (const [slug, feeMinor] of Object.entries(approvedFees)) {
      await tx.therapist.updateMany({ where: { slug }, data: { feeMinor } });
      await tx.therapistServiceRate.updateMany({
        where: { therapist: { slug }, service: { slug: { not: "free-15-minute-call" } } },
        data: { feeMinor },
      });
    }
  });
}
module.exports = { syncApprovedFees };
if (require.main === module) {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  syncApprovedFees(prisma)
    .then(() => console.log("Clinic-approved consultant fees synchronized."))
    .catch(error => { console.error("Fee synchronization failed:", error.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
