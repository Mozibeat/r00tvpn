import { env } from "@/lib/env";
import { MockPaymentProvider } from "@/services/payments/mock";
import { StripePaymentProvider } from "@/services/payments/stripe";
import type { PaymentProvider } from "@/services/payments/types";
import type { PaymentProvider as PrismaPaymentProvider } from "@prisma/client";

export function getPrismaPaymentProvider(): PrismaPaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case "stripe":
      return "STRIPE";
    case "telegram":
      return "TELEGRAM";
    case "yookassa":
      return "YOOKASSA";
    case "cryptobot":
      return "CRYPTOBOT";
    case "mock":
      return "STRIPE";
    default:
      return "STRIPE";
  }
}

export function getPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case "stripe":
      return new StripePaymentProvider();
    case "mock":
      return new MockPaymentProvider();
    default:
      throw new Error(
        `Провайдер ${env.PAYMENT_PROVIDER} пока не реализован. Добавьте адаптер в services/payments/provider.ts`,
      );
  }
}
