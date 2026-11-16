const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const consultants = await prisma.therapist.findMany({ where: { status: 'APPROVED', isActive: true }, select: { id: true } });
  await prisma.service.upsert({
    where: { slug: 'free-15-minute-call' },
    create: { slug: 'free-15-minute-call', name: 'Free 15-minute call', description: 'A short introductory call to discuss how we can help.', durationMinutes: 15, priceMinor: 0, availability: ['Online'], therapists: { connect: consultants } },
    update: { durationMinutes: 15, priceMinor: 0 },
  });
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
