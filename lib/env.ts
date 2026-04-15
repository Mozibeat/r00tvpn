import { z } from "zod";

const optionalString = () =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, z.string().optional());

const optionalUrl = () =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, z.string().url().optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(""),
  NEXTAUTH_SECRET: z.string().min(1).default("development-secret"),
  NEXTAUTH_URL: optionalUrl(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  PAYMENT_PROVIDER: z
    .enum(["stripe", "telegram", "yookassa", "cryptobot", "mock"])
    .default("stripe"),
  STRIPE_SECRET_KEY: optionalString(),
  STRIPE_WEBHOOK_SECRET: optionalString(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString(),
  THREEXUI_BASE_URL: optionalUrl(),
  THREEXUI_USERNAME: optionalString(),
  THREEXUI_PASSWORD: optionalString(),
  THREEXUI_INBOUND_ID: optionalString(),
  "3XUI_BASE_URL": optionalUrl(),
  "3XUI_USERNAME": optionalString(),
  "3XUI_PASSWORD": optionalString(),
  "3XUI_INBOUND_ID": optionalString(),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
});

export const env = envSchema.parse(process.env);
