import { prisma } from "@/lib/prisma";
import { CheckoutButton } from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export async function PricingGrid() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { durationDays: "asc" },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className="relative overflow-hidden border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-cyan-400/40"
        >
          {plan.isPopular && (
            <Badge className="absolute right-4 top-4 bg-cyan-500/90">Популярный</Badge>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <p className="text-sm text-zinc-300">{plan.description}</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {formatAmount(plan.amount, plan.currency)}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton
              planId={plan.id}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              Выбрать тариф
            </CheckoutButton>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
