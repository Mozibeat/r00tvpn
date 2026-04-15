import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создайте аккаунт RootVPN и начните пользоваться VPN.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <RegisterForm />
      <p className="mt-4 text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-cyan-300 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
