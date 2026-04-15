import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validators/checkout";
import {
  getPaymentProvider,
  getPrismaPaymentProvider,
} from "@/services/payments/provider";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Нужна авторизация" }, { status: 401 });
  }

  const rate = checkRateLimit(`checkout:${session.user.id}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов на оплату" },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Неверный planId" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: parsed.data.planId, isActive: true },
  });
  if (!plan) {
    return NextResponse.json({ message: "Тариф не найден" }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      amount: plan.amount,
      currency: plan.currency,
      status: "PENDING",
    },
  });

  const provider = getPaymentProvider();
  const paymentProvider = getPrismaPaymentProvider();
  let checkout;
  try {
    checkout = await provider.createCheckoutSession({
      order,
      plan,
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? null,
      },
    });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { status: "FAILED" },
      create: {
        userId: session.user.id,
        orderId: order.id,
        provider: paymentProvider,
        amount: plan.amount,
        currency: plan.currency,
        status: "FAILED",
      },
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не удалось создать платежную сессию",
      },
      { status: 500 },
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSession: checkout.providerSessionId },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      orderId: order.id,
      provider: paymentProvider,
      amount: plan.amount,
      currency: plan.currency,
      status: "PENDING",
      providerPaymentId: checkout.providerSessionId,
    },
  });

  return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
}
