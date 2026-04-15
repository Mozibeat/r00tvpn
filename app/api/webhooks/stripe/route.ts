import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/services/payments/stripe";
import { provisionVpnAccessForPaidOrder } from "@/services/subscription";

export async function POST(req: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Webhook secret не настроен" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Нет подписи webhook" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { message: "Невалидная подпись webhook" },
      { status: 400 },
    );
  }

  const existing = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing?.isProcessed) {
    return NextResponse.json({ received: true, duplicated: true });
  }

  await prisma.webhookEvent.upsert({
    where: { eventId: event.id },
    update: { payload: event as unknown as object, eventType: event.type },
    create: {
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      payload: event as unknown as object,
    },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await provisionVpnAccessForPaidOrder(orderId);
      }
    }

    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: { isProcessed: true, processedAt: new Date() },
    });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json(
      { message: "Ошибка обработки webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
