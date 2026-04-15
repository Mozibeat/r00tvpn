import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(""),
  NEXTAUTH_SECRET: z.string().min(1).default("development-secret"),
  NEXTAUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  PAYMENT_PROVIDER: z
    .enum(["stripe", "telegram", "yookassa", "cryptobot", "mock"])
    .default("stripe"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  THREEXUI_BASE_URL: z.string().url().optional(),
  THREEXUI_USERNAME: z.string().optional(),
  THREEXUI_PASSWORD: z.string().optional(),
  THREEXUI_INBOUND_ID: z.string().optional(),
  "3XUI_BASE_URL": z.string().url().optional(),
  "3XUI_USERNAME": z.string().optional(),
  "3XUI_PASSWORD": z.string().optional(),
  "3XUI_INBOUND_ID": z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
});

export const env = envSchema.parse(process.env);
