"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QrCodeCard({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value, { width: 220 }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [value]);

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-base">QR для быстрого подключения</CardTitle>
      </CardHeader>
      <CardContent>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="VPN QR code" className="h-56 w-56 rounded-lg" />
        ) : (
          <div className="h-56 w-56 animate-pulse rounded-lg bg-zinc-800" />
        )}
      </CardContent>
    </Card>
  );
}
