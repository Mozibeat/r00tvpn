import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { provisionVpnAccessForPaidOrder } from "@/services/subscription";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  try {
    await provisionVpnAccessForPaidOrder(order.id);
  } catch (error) {
    console.error("Mock payment provisioning failed", error);
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  return NextResponse.redirect(new URL("/checkout/success?session_id=mock", req.url));
}
