import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Введите корректный email").transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Минимальная длина пароля 8 символов")
    .max(72, "Пароль слишком длинный"),
  name: z.string().min(2, "Имя слишком короткое").max(60).optional(),
});

export const loginSchema = z.object({
  email: z.email("Введите корректный email").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Введите пароль"),
});
