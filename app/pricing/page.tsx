import type { Metadata } from "next";

import { PricingGrid } from "@/components/pricing-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Тарифы",
  description: "Выберите тариф RootVPN на 30, 90, 180 или 365 дней.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Тарифы RootVPN</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Все тарифы включают безлимитный трафик, высокую скорость и автоматическую
        выдачу доступа сразу после оплаты.
      </p>
      <div className="mt-10">
        <PricingGrid />
      </div>
    </div>
  );
}
