"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { threeXuiService } from "@/services/threeXui";

export async function extendSubscriptionAction(subscriptionId: string, days = 30) {
  await requireAdminSession();
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { vpnAccess: true },
  });
  if (!subscription) return;

  const from = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
  const expiresAt = addDays(from, days);

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { expiresAt, status: "ACTIVE" },
  });

  if (subscription.vpnAccess) {
    await threeXuiService.updateClientExpiry({
      email: subscription.vpnAccess.email,
      inboundId: subscription.vpnAccess.inboundId,
      expiresAt,
    });
  }

  revalidatePath("/admin");
}

export async function deactivateSubscriptionAction(subscriptionId: string) {
  await requireAdminSession();
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { vpnAccess: true },
  });
  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  if (subscription.vpnAccess) {
    await threeXuiService.disableClient({
      email: subscription.vpnAccess.email,
      inboundId: subscription.vpnAccess.inboundId,
    });
    await prisma.vpnAccess.update({
      where: { id: subscription.vpnAccess.id },
      data: { isActive: false, disabledAt: new Date() },
    });
  }

  revalidatePath("/admin");
}
