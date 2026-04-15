import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getRequiredSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
