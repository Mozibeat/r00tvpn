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

  const adminEmail = "admin@rootvpn.local";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "RootVPN Admin",
      role: Role.ADMIN,
      passwordHash: await hash("Admin12345!", 10),
    },
  });
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
