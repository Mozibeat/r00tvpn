import Link from "next/link";
import { format } from "date-fns";

import { CopyButton } from "@/components/copy-button";
import { QrCodeCard } from "@/components/qr-code-card";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getRequiredSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: { plan: true, vpnAccess: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { plan: true, payment: true },
      },
    },
  });

  if (!user) {
    return <div className="mx-auto w-full max-w-7xl px-4 py-14">Пользователь не найден</div>;
  }

  const activeSubscription = user.subscriptions.find((s) => s.status === "ACTIVE") ?? null;
  const vpnAccess = activeSubscription?.vpnAccess ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Личный кабинет</h1>
          <p className="text-zinc-400">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/pricing">Купить тариф</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Статус подписки</CardTitle></CardHeader>
          <CardContent>
            {activeSubscription ? (
              <Badge className="bg-emerald-500">ACTIVE</Badge>
            ) : (
              <Badge variant="secondary">NONE</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Дата окончания</CardTitle></CardHeader>
          <CardContent>
            {activeSubscription
              ? format(activeSubscription.expiresAt, "dd.MM.yyyy HH:mm")
              : "Нет активной подписки"}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Оплата</CardTitle></CardHeader>
          <CardContent>
            {user.orders[0]?.payment?.status ?? "Нет платежей"}
          </CardContent>
        </Card>
      </div>

      {vpnAccess ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Ваш VPN-доступ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Ключ</p>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
                  <code className="flex-1 overflow-x-auto text-xs">{vpnAccess.vpnKey}</code>
                  <CopyButton value={vpnAccess.vpnKey} />
                </div>
              </div>
              {vpnAccess.subscriptionUrl && (
                <div>
                  <p className="text-sm text-zinc-400">Subscription URL</p>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
                    <code className="flex-1 overflow-x-auto text-xs">{vpnAccess.subscriptionUrl}</code>
                    <CopyButton value={vpnAccess.subscriptionUrl} />
                  </div>
                </div>
              )}
              <p className="text-sm text-zinc-300">
                Инструкция: откройте приложение-клиент, импортируйте ключ или URL, затем включите соединение.
                Подробная инструкция доступна на странице{" "}
                <Link href="/how-to-connect" className="text-cyan-300 hover:underline">
                  «Как подключить VPN»
                </Link>.
              </p>
            </CardContent>
          </Card>
          <QrCodeCard value={vpnAccess.subscriptionUrl ?? vpnAccess.vpnKey} />
        </div>
      ) : (
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>VPN-доступ пока не выдан</CardTitle></CardHeader>
          <CardContent>
            <p className="text-zinc-300">Оплатите тариф, чтобы получить ключ и конфиг.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>История покупок</CardTitle></CardHeader>
        <CardContent>
          {user.orders.length === 0 ? (
            <p className="text-zinc-400">Покупок пока нет</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.plan.name}</TableCell>
                    <TableCell>{(order.amount / 100).toFixed(0)} {order.currency}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{format(order.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
