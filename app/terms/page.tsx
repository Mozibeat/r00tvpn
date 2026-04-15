import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Условия использования сервиса RootVPN.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Terms of Service</h1>
      <p className="text-zinc-300">
        Используя RootVPN, вы соглашаетесь с правилами сервиса, политикой оплаты
        и корректным использованием инфраструктуры.
      </p>
      <div className="space-y-3 text-zinc-300">
        <p>1. Подписка предоставляется на оплаченный период.</p>
        <p>2. Передача учетной записи третьим лицам запрещена.</p>
        <p>3. Возвраты регулируются правилами платежного провайдера.</p>
        <p>4. Сервис может ограничить доступ при нарушении условий.</p>
      </div>
    </div>
  );
}
