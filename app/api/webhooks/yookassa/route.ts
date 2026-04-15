import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getYooKassaPaymentById } from "@/services/payments/yookassa";
import { provisionVpnAccessForPaidOrder } from "@/services/subscription";

type YooKassaWebhookBody = {
  event?: string;
  object?: {
    id?: string;
    status?: string;
    metadata?: Record<string, string>;
  };
};

export async function POST(req: Request) {
  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    return NextResponse.json(
      { message: "YooKassa credentials не настроены" },
      { status: 500 },
    );
  }

  const payload = (await req.json()) as YooKassaWebhookBody;
  const event = payload.event;
  const paymentId = payload.object?.id;

  if (!event || !paymentId) {
    return NextResponse.json({ message: "Некорректный webhook payload" }, { status: 400 });
  }

  if (event !== "payment.succeeded") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const eventId = `yookassa:${event}:${paymentId}`;
  const existing = await prisma.webhookEvent.findUnique({
    where: { eventId },
  });
  if (existing?.isProcessed) {
    return NextResponse.json({ received: true, duplicated: true });
  }

  await prisma.webhookEvent.upsert({
    where: { eventId },
    update: {
      eventType: event,
      payload: payload as unknown as object,
    },
    create: {
      provider: "yookassa",
      eventId,
      eventType: event,
      payload: payload as unknown as object,
    },
  });

  try {
    const payment = await getYooKassaPaymentById(paymentId);
    if (payment.status !== "succeeded" || !payment.paid) {
      return NextResponse.json(
        { message: "Платеж еще не завершен в YooKassa" },
        { status: 400 },
      );
    }

    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ message: "В metadata отсутствует orderId" }, { status: 400 });
    }

    await provisionVpnAccessForPaidOrder(orderId);
    await prisma.webhookEvent.update({
      where: { eventId },
      data: {
        isProcessed: true,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("YooKassa webhook processing error", error);
    return NextResponse.json(
      { message: "Ошибка обработки webhook YooKassa" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
