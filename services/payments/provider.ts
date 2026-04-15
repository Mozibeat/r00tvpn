import { env } from "@/lib/env";
import { MockPaymentProvider } from "@/services/payments/mock";
import { StripePaymentProvider } from "@/services/payments/stripe";
import type { PaymentProvider } from "@/services/payments/types";

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
