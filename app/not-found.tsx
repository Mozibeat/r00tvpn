import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">404</p>
      <h1 className="text-4xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-zinc-300">
        Проверьте ссылку или вернитесь на главную страницу RootVPN.
      </p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
