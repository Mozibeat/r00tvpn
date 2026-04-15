"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  planId: string;
  children?: React.ReactNode;
  className?: string;
};

export function CheckoutButton({ planId, children, className }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const payload = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };
      if (response.status === 401) {
        const callback = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?callbackUrl=${callback}`;
        return;
      }

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.message ?? "Не удалось создать платеж");
      }

      window.location.href = payload.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
      type="button"
    >
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children ?? "Купить"}
    </Button>
  );
}
