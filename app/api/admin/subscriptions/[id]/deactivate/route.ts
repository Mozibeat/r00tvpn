import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { threeXuiService } from "@/services/threeXui";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { vpnAccess: true },
  });
  if (!subscription) {
    return NextResponse.json({ message: "Подписка не найдена" }, { status: 404 });
  }

  await prisma.subscription.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  if (subscription.vpnAccess) {
    await threeXuiService.disableClient({
      email: subscription.vpnAccess.email,
      inboundId: subscription.vpnAccess.inboundId,
    });

    await prisma.vpnAccess.update({
      where: { id: subscription.vpnAccess.id },
      data: { isActive: false, disabledAt: new Date() },
    });
  }

  return NextResponse.json({ message: "Доступ деактивирован" });
}
