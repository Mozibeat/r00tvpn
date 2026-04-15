import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Политика конфиденциальности RootVPN.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Privacy Policy</h1>
      <p className="text-zinc-300">
        RootVPN обрабатывает только необходимые данные: email, платежные статусы
        и параметры подписки для выдачи доступа.
      </p>
      <div className="space-y-3 text-zinc-300">
        <p>1. Мы не храним историю посещенных сайтов.</p>
        <p>2. Доступ к данным ограничен административной ролью.</p>
        <p>3. Секреты и ключи хранятся только на сервере.</p>
      </div>
    </div>
  );
}
