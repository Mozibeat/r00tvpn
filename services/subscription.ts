import { SubscriptionStatus } from "@prisma/client";
import { addDays, isAfter } from "date-fns";

import { prisma } from "@/lib/prisma";
import { threeXuiService } from "@/services/threeXui";

function getBaseDate(existingExpiry?: Date | null) {
  const now = new Date();
  if (existingExpiry && isAfter(existingExpiry, now)) {
    return existingExpiry;
  }
  return now;
}

export async function extendVpnAccessForUser(userId: string, planId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: SubscriptionStatus.ACTIVE },
        orderBy: { expiresAt: "desc" },
        include: { vpnAccess: true, plan: true },
      },
    },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error("Тариф не найден");
  }

  const activeSubscription = user.subscriptions[0] ?? null;
  const startDate = getBaseDate(activeSubscription?.expiresAt);
  const newExpiry = addDays(startDate, plan.durationDays);

  let subscription;
  if (activeSubscription) {
    subscription = await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: {
        planId: plan.id,
        expiresAt: newExpiry,
        status: SubscriptionStatus.ACTIVE,
      },
      include: { vpnAccess: true },
    });
  } else {
    subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        startedAt: new Date(),
        expiresAt: newExpiry,
        status: SubscriptionStatus.ACTIVE,
      },
      include: { vpnAccess: true },
    });
  }

  const vpnEmail = `rootvpn-${user.id}@vpn.local`;

  if (subscription.vpnAccess) {
    await threeXuiService.updateClientExpiry({
      email: subscription.vpnAccess.email,
      inboundId: subscription.vpnAccess.inboundId,
      expiresAt: newExpiry,
    });

    await prisma.vpnAccess.update({
      where: { id: subscription.vpnAccess.id },
      data: {
        isActive: true,
        disabledAt: null,
        lastSyncedAt: new Date(),
      },
    });
  } else {
    const createdClient = await threeXuiService.createClient({
      email: vpnEmail,
      expiryTime: newExpiry.getTime(),
    });

    await prisma.vpnAccess.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        externalId: createdClient.externalId,
        email: createdClient.email,
        uuid: createdClient.uuid,
        inboundId: createdClient.inboundId,
        vpnKey: createdClient.vpnKey,
        accessUrl: createdClient.accessUrl,
        subscriptionUrl: createdClient.subscriptionUrl,
        clientConfig: createdClient.subscriptionUrl,
        lastSyncedAt: new Date(),
        isActive: true,
      },
    });
  }

  return {
    subscriptionId: subscription.id,
    expiresAt: newExpiry,
  };
}

export async function provisionVpnAccessForPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, plan: true, payment: true },
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  if (order.status === "PAID") {
    return { alreadyProcessed: true };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { status: "SUCCEEDED" },
    create: {
      orderId: order.id,
      userId: order.userId,
      provider: order.payment?.provider ?? "STRIPE",
      amount: order.amount,
      currency: order.currency,
      status: "SUCCEEDED",
    },
  });

  return extendVpnAccessForUser(order.userId, order.planId);
}
