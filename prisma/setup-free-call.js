const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const consultants = await prisma.therapist.findMany({ where: { status: 'APPROVED', isActive: true }, select: { id: true } });
  await prisma.service.updateMany({ where: { slug: 'couples-counseling' }, data: { description: 'Sessions for couples and families to work through conflict, communication and boundaries.' } });
  await prisma.service.upsert({
    where: { slug: 'free-15-minute-call' },
    create: { slug: 'free-15-minute-call', name: 'Free 10-minute discovery call', description: 'A short introductory call to discuss how we can help.', durationMinutes: 15, priceMinor: 0, availability: ['Online'], therapists: { connect: consultants } },
    update: { name: 'Free 10-minute discovery call', durationMinutes: 15, priceMinor: 0 },
  });
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
