import { randomUUID } from "crypto";

import { env } from "@/lib/env";
import type { CheckoutContext, PaymentProvider } from "@/services/payments/types";

type YooKassaPayment = {
  id: string;
  status: string;
  paid?: boolean;
  metadata?: Record<string, string>;
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
};

function getYooKassaAuthHeader() {
  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    throw new Error("YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не заданы");
  }

  if (
    env.YOOKASSA_SECRET_KEY.includes("REPLACE_") ||
    !env.YOOKASSA_SECRET_KEY.startsWith("test_")
  ) {
    throw new Error("YOOKASSA_SECRET_KEY имеет невалидный формат");
  }

  const credentials = Buffer.from(
    `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`,
  ).toString("base64");

  return `Basic ${credentials}`;
}

function toYooKassaAmount(amountInCents: number) {
  return (amountInCents / 100).toFixed(2);
}

async function yookassaRequest<T>(
  path: string,
  init: RequestInit,
  idempotenceKey?: string,
) {
  const key = idempotenceKey ?? randomUUID();
  const response = await fetch(`https://api.yookassa.ru/v3${path}`, {
    ...init,
    headers: {
      Authorization: getYooKassaAuthHeader(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(key ? { "Idempotence-Key": key } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YooKassa API error ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export class YooKassaPaymentProvider implements PaymentProvider {
  async createCheckoutSession(context: CheckoutContext) {
    const payment = await yookassaRequest<YooKassaPayment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        amount: {
          value: toYooKassaAmount(context.plan.amount),
          currency: context.plan.currency,
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${env.APP_URL}/checkout/success`,
        },
        description: `RootVPN — ${context.plan.name}`,
        metadata: {
          orderId: context.order.id,
          userId: context.user.id,
          planId: context.plan.id,
          durationDays: String(context.plan.durationDays),
        },
      }),
    });

    const checkoutUrl = payment.confirmation?.confirmation_url;
    if (!checkoutUrl || !payment.id) {
      throw new Error("YooKassa не вернула confirmation_url");
    }

    return {
      checkoutUrl,
      providerSessionId: payment.id,
    };
  }
}

export async function getYooKassaPaymentById(paymentId: string) {
  return yookassaRequest<YooKassaPayment>(`/payments/${paymentId}`, {
    method: "GET",
  }, "");
}
