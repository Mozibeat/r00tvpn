import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Ответы на частые вопросы о RootVPN.",
};

const entries = [
  {
    question: "Можно ли использовать RootVPN на нескольких устройствах?",
    answer:
      "Да, лимит зависит от выбранного тарифа. В среднем от 3 до 10 устройств.",
  },
  {
    question: "Как быстро активируется доступ?",
    answer:
      "Активация происходит автоматически после успешного webhook от платежного провайдера.",
  },
  {
    question: "Что делать, если не получается подключиться?",
    answer:
      "Проверьте инструкцию на странице «Как подключить VPN» и обратитесь в поддержку.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">FAQ</h1>
      <div className="mt-8 space-y-3">
        {entries.map((entry) => (
          <Card key={entry.question} className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg">{entry.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-zinc-300">{entry.answer}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
