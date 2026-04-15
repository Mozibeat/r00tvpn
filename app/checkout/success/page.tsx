import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Оплата успешна",
  description: "Оплата прошла успешно. Доступ к RootVPN уже создается.",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-xl px-4 py-14 sm:px-6">
      <Card className="w-full border-emerald-500/30 bg-emerald-500/10">
        <CardHeader>
          <CardTitle>Оплата успешно принята</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-200">
            Мы получили платеж и запускаем автоматическую выдачу доступа через 3x-ui.
          </p>
          {params.session_id && (
            <p className="text-xs text-zinc-300">Session: {params.session_id}</p>
          )}
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard">Перейти в кабинет</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/how-to-connect">Как подключить</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
