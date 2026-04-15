import { format } from "date-fns";
import type { Metadata } from "next";

import { deactivateSubscriptionAction, extendSubscriptionAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Админка",
  description: "Панель управления пользователями, подписками и платежами RootVPN.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; status?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;

  const whereEmail = params.email
    ? { contains: params.email, mode: "insensitive" as const }
    : undefined;

  const users = await prisma.user.findMany({
    where: { email: whereEmail },
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        where: params.status ? { status: params.status as never } : undefined,
        include: { vpnAccess: true, plan: true },
      },
    },
    take: 100,
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, plan: true, payment: true },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Admin panel</h1>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3" method="GET">
            <Input
              name="email"
              defaultValue={params.email}
              placeholder="Поиск по email"
              className="max-w-xs"
            />
            <Input
              name="status"
              defaultValue={params.status}
              placeholder="ACTIVE / EXPIRED / CANCELLED"
              className="max-w-xs"
            />
            <button className="rounded-md border border-white/20 px-4 py-2">Применить</button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Пользователи и подписки</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Тариф</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>VPN ключ / UUID</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.flatMap((user) =>
                user.subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{subscription.plan.name}</TableCell>
                    <TableCell>
                      <Badge>{subscription.status}</Badge>
                    </TableCell>
                    <TableCell>{format(subscription.expiresAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs">
                      {subscription.vpnAccess?.vpnKey ?? "-"} / {subscription.vpnAccess?.uuid ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <form
                          action={async () => {
                            "use server";
                            await extendSubscriptionAction(subscription.id, 30);
                          }}
                        >
                          <button className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs">
                            +30 дней
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deactivateSubscriptionAction(subscription.id);
                          }}
                        >
                          <button className="rounded-md border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs">
                            Деактивировать
                          </button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Заказы и платежи</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заказ</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Тариф</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Order status</TableHead>
                <TableHead>Payment status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{order.user.email}</TableCell>
                  <TableCell>{order.plan.name}</TableCell>
                  <TableCell>
                    {(order.amount / 100).toFixed(0)} {order.currency}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.payment?.status ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
