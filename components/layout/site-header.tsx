import Link from "next/link";
import { getServerSession } from "next-auth";

import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-wide text-white">
          Root<span className="text-cyan-300">VPN</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/pricing" className="transition hover:text-white">
            Тарифы
          </Link>
          <Link href="/faq" className="transition hover:text-white">
            FAQ
          </Link>
          <Link href="/how-to-connect" className="transition hover:text-white">
            Как подключить
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            Контакты
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" className="text-zinc-200 hover:text-white">
                <Link href="/dashboard">Кабинет</Link>
              </Button>
              {session.user.role === "ADMIN" && (
                <Button asChild variant="outline">
                  <Link href="/admin">Админка</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Войти</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
              >
                <Link href="/register">Начать</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
