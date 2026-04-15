import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Как подключить VPN",
  description: "Пошаговая инструкция по подключению RootVPN на любом устройстве.",
};

const steps = [
  "Зарегистрируйтесь и оплатите подходящий тариф.",
  "Откройте личный кабинет и скопируйте ключ или subscription URL.",
  "Установите клиент (v2rayN, v2rayNG, Streisand или другой совместимый).",
  "Импортируйте ключ/URL и включите VPN.",
];

export default function HowToConnectPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Как подключить RootVPN</h1>
      <p className="mt-3 text-zinc-300">
        Процесс занимает 2-3 минуты даже если вы подключаетесь впервые.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map((step, idx) => (
          <Card key={step} className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Шаг {idx + 1}</CardTitle>
            </CardHeader>
            <CardContent className="text-zinc-200">{step}</CardContent>
          </Card>
        ))}
      </div>
      <Button asChild className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-500">
        <Link href="/dashboard">Открыть кабинет</Link>
      </Button>
    </div>
  );
}
