import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} RootVPN. Все права защищены.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="transition hover:text-zinc-100">
            Terms of Service
          </Link>
          <Link href="/privacy" className="transition hover:text-zinc-100">
            Privacy Policy
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-100">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
