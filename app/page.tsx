import Link from "next/link";

import { PricingGrid } from "@/components/pricing-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const benefits = [
  "Шифрование военного уровня и защита трафика 24/7",
  "Стабильные сервера с низким ping и высокой пропускной способностью",
  "Поддержка популярных протоколов и моментальное подключение",
  "Личный кабинет с ключом, QR-кодом и историей покупок",
];

const testimonials = [
  { name: "Алексей, продукт-менеджер", text: "RootVPN стал самым стабильным VPN, который я использовал за последние 3 года." },
  { name: "Марина, дизайнер", text: "Очень удобный кабинет и простое подключение на телефоне за минуту." },
  { name: "Илья, предприниматель", text: "Подключил всю команду, скорость отличная, поддержка отвечает быстро." },
];

const faqs = [
  {
    q: "Когда я получу доступ после оплаты?",
    a: "Сразу после подтверждения платежа webhook активирует подписку и выдает ключ в личном кабинете.",
  },
  {
    q: "Что будет при повторной покупке?",
    a: "Срок действия продлевается автоматически: если подписка активна, продление идет от текущей даты окончания.",
  },
  {
    q: "Есть ли ограничение по устройствам?",
    a: "Количество устройств зависит от тарифа. Детали указаны в карточках тарифов.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-14">
        <Badge className="bg-violet-500/80">Премиальный VPN-сервис</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          RootVPN — скорость, приватность и доступ без компромиссов
        </h1>
        <p className="mt-6 max-w-2xl text-zinc-300">
          Подключайтесь к защищенной сети в один клик. После оплаты доступ создается автоматически и действует ровно оплаченный период.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500">
            <Link href="/pricing">Выбрать тариф</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Начать</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Почему выбирают RootVPN</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit} className="border-white/10 bg-white/5">
              <CardContent className="p-6 text-zinc-200">{benefit}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Тарифы</h2>
            <p className="mt-2 text-zinc-300">30, 90, 180 и 365 дней. Оплата картой и мгновенная выдача доступа.</p>
          </div>
        </div>
        <PricingGrid />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Сравнение тарифов</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3">Параметр</th>
                <th className="px-4 py-3">30 дней</th>
                <th className="px-4 py-3">90 дней</th>
                <th className="px-4 py-3">180 дней</th>
                <th className="px-4 py-3">365 дней</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-t border-white/10"><td className="px-4 py-3">Устройства</td><td className="px-4 py-3">3</td><td className="px-4 py-3">5</td><td className="px-4 py-3">7</td><td className="px-4 py-3">10</td></tr>
              <tr className="border-t border-white/10"><td className="px-4 py-3">Поддержка</td><td className="px-4 py-3">24/7</td><td className="px-4 py-3">24/7</td><td className="px-4 py-3">24/7</td><td className="px-4 py-3">VIP 24/7</td></tr>
              <tr className="border-t border-white/10"><td className="px-4 py-3">Приоритет</td><td className="px-4 py-3">Стандарт</td><td className="px-4 py-3">Высокий</td><td className="px-4 py-3">Премиум</td><td className="px-4 py-3">Максимум</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Отзывы клиентов</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="border-white/10 bg-white/5">
              <CardContent className="space-y-3 p-6">
                <p className="text-zinc-200">{item.text}</p>
                <p className="text-sm text-zinc-400">{item.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <Card key={item.q} className="border-white/10 bg-white/5">
              <CardContent className="space-y-1 p-5">
                <p className="font-medium">{item.q}</p>
                <p className="text-zinc-300">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-blue-700/30 to-cyan-500/20 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-semibold">Готовы к безопасному интернету?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-200">
          Создайте аккаунт, выберите тариф и получите VPN-конфиг сразу после оплаты.
        </p>
        <Button asChild size="lg" className="mt-6 bg-white text-black hover:bg-zinc-100">
          <Link href="/register">Купить сейчас</Link>
        </Button>
      </section>
    </div>
  );
}
