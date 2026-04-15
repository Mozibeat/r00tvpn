import type {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Role,
  SubscriptionStatus,
} from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

export type PlanView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationDays: number;
  amount: number;
  currency: string;
  isPopular: boolean;
  features: string[];
};

export type DashboardSummary = {
  subscriptionStatus: SubscriptionStatus | "NONE";
  expiresAt: Date | null;
  vpnKey: string | null;
  accessUrl: string | null;
  subscriptionUrl: string | null;
};

export type PaymentPayload = {
  provider: PaymentProvider;
  status: PaymentStatus;
  orderStatus: OrderStatus;
  providerPaymentId?: string;
  rawPayload?: unknown;
};

export type ThreeXuiClientPayload = {
  email: string;
  expiryTime: number;
  inboundId: string;
  uuid?: string;
};
