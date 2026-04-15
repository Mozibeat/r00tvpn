import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Оплата отменена",
  description: "Платеж был отменен. Вы можете повторить попытку.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl px-4 py-14 sm:px-6">
      <Card className="w-full border-amber-500/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle>Оплата отменена</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-200">
            Платеж не завершен. Можете вернуться к тарифам и выбрать удобный вариант.
          </p>
          <Button asChild>
            <Link href="/pricing">Вернуться к тарифам</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
