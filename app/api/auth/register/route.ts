import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`register:${forwardedFor}`, 5, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Слишком много попыток. Попробуйте через минуту." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Проверьте введенные данные", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingUser) {
    return NextResponse.json(
      { message: "Пользователь с таким email уже существует" },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
    },
    select: {
      id: true,
      email: true,
    },
  });

  return NextResponse.json(
    { message: "Регистрация успешна", user },
    { status: 201 },
  );
}
