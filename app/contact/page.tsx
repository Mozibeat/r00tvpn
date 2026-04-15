import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с командой RootVPN.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Контакты</h1>
      <p className="text-zinc-300">
        Поддержка отвечает ежедневно. Если возникли вопросы по подключению или
        оплате, пишите нам:
      </p>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-200">
        <p>Email: {siteConfig.contactEmail}</p>
        <p>
          Telegram:{" "}
          <Link className="text-cyan-300 hover:underline" href={siteConfig.links.telegram}>
            {siteConfig.links.telegram}
          </Link>
        </p>
      </div>
    </div>
  );
}
