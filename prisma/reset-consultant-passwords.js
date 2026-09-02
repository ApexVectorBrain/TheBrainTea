/**
 * Reset selected consultant portal passwords without touching booking,
 * payment, calendar, or client data. Passwords are supplied only through
 * the terminal environment and are never stored in this repository.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const accounts = [
  {
    name: "Ananya Sunil Nair",
    email: "safespaceswithananya@gmail.com",
    password: process.env.CONSULTANT_ANANYA_NAIR_TEMP_PASSWORD,
  },
  {
    name: "Ananya Saxena",
    email: "ananyasaxena.psy@gmail.com",
    password: process.env.CONSULTANT_ANANYA_SAXENA_TEMP_PASSWORD,
  },
  {
    name: "Sharayu Harpale",
    email: "sharayuharpale.work@gmail.com",
    password: process.env.CONSULTANT_SHARAYU_HARPALE_TEMP_PASSWORD,
  },
];

async function main() {
  for (const account of accounts) {
    if (!account.password || account.password.length < 10) {
      throw new Error(`Set a password of at least 10 characters for ${account.name}.`);
    }
  }

  const results = await prisma.$transaction(
    accounts.map((account) =>
      prisma.user.updateMany({
        where: { email: account.email, role: "THERAPIST" },
        data: { passwordHash: bcrypt.hashSync(account.password, 12) },
      }),
    ),
  );

  for (let index = 0; index < accounts.length; index++) {
    if (results[index].count !== 1) {
      throw new Error(`Expected one therapist login for ${accounts[index].email}.`);
    }
    console.log(`Password reset for ${accounts[index].name}.`);
  }
}

main()
  .catch((error) => {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
