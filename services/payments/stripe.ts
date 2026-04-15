import Stripe from "stripe";

import { env } from "@/lib/env";
import type { CheckoutContext, PaymentProvider } from "@/services/payments/types";

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY не задан");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export class StripePaymentProvider implements PaymentProvider {
  async createCheckoutSession(context: CheckoutContext) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: context.user.email,
      metadata: {
        orderId: context.order.id,
        userId: context.user.id,
        planId: context.plan.id,
        durationDays: String(context.plan.durationDays),
      },
      success_url: `${env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/checkout/cancel`,
      line_items: [
        {
          price_data: {
            currency: context.plan.currency.toLowerCase(),
            unit_amount: context.plan.amount,
            product_data: {
              name: `RootVPN — ${context.plan.name}`,
              description: "Доступ к защищенной сети RootVPN",
            },
          },
          quantity: 1,
        },
      ],
    });

    if (!session.url || !session.id) {
      throw new Error("Stripe не вернул ссылку оплаты");
    }

    return {
      checkoutUrl: session.url,
      providerSessionId: session.id,
    };
  }
}
