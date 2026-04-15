import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в личный кабинет RootVPN.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <LoginForm />
      <p className="mt-4 text-sm text-zinc-400">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-cyan-300 hover:underline">
          Зарегистрируйтесь
        </Link>
      </p>
    </div>
  );
}
