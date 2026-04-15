import { randomUUID } from "crypto";

import { env } from "@/lib/env";
import type { CheckoutContext, PaymentProvider } from "@/services/payments/types";

export class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(context: CheckoutContext) {
    const token = randomUUID();
    const checkoutUrl = `${env.APP_URL}/api/payments/mock/complete?orderId=${context.order.id}&token=${token}`;

    return {
      checkoutUrl,
      providerSessionId: `mock_${context.order.id}_${token}`,
    };
  }
}
