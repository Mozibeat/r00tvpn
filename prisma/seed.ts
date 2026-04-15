import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

import { defaultPlans } from "../config/plans";

const prisma = new PrismaClient();

async function main() {
  for (const plan of defaultPlans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        durationDays: plan.durationDays,
        amount: plan.amount,
        currency: plan.currency,
        features: [...plan.features],
        isPopular: plan.isPopular,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        durationDays: plan.durationDays,
        amount: plan.amount,
        currency: plan.currency,
        features: [...plan.features],
        isPopular: plan.isPopular,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        role: Role.ADMIN,
        passwordHash: await hash(adminPassword, 10),
      },
      create: {
        email: adminEmail.toLowerCase(),
        name: "RootVPN Admin",
        role: Role.ADMIN,
        passwordHash: await hash(adminPassword, 10),
      },
    });
  } else {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD не заданы: seed не создает дефолтного админа.",
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
