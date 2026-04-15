import type { Order, Plan, User } from "@prisma/client";

export type CheckoutContext = {
  order: Order;
  user: Pick<User, "id" | "email" | "name">;
  plan: Pick<Plan, "id" | "name" | "durationDays" | "amount" | "currency">;
};

export type CheckoutResult = {
  checkoutUrl: string;
  providerSessionId: string;
};

export interface PaymentProvider {
  createCheckoutSession(context: CheckoutContext): Promise<CheckoutResult>;
}
