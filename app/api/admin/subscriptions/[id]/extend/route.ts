import { addDays } from "date-fns";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { threeXuiService } from "@/services/threeXui";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = (await req.json()) as { days?: number };
  const days = Number(body.days ?? 30);

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { vpnAccess: true },
  });
  if (!subscription) {
    return NextResponse.json({ message: "Подписка не найдена" }, { status: 404 });
  }

  const from = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
  const expiresAt = addDays(from, days);

  await prisma.subscription.update({
    where: { id },
    data: { expiresAt, status: "ACTIVE" },
  });

  if (subscription.vpnAccess) {
    await threeXuiService.updateClientExpiry({
      email: subscription.vpnAccess.email,
      inboundId: subscription.vpnAccess.inboundId,
      expiresAt,
    });
  }

  return NextResponse.json({ message: "Доступ продлен", expiresAt });
}
