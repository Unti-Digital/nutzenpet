"use client";

import { Check, Copy, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PixActionsProps = {
  qrCode?: string;
  pending: boolean;
};

export function PixActions({ qrCode, pending }: PixActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const interval = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(interval);
  }, [pending, router]);

  async function copyQrCode() {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-3">
      {qrCode && (
        <button
          type="button"
          onClick={() => void copyQrCode()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-6 text-sm font-black text-white transition-colors hover:bg-[#CC632B]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Código copiado" : "Copiar código Pix"}
        </button>
      )}
      {pending && <p className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Aguardando a confirmação do pagamento...</p>}
    </div>
  );
}
