"use client";

import { Download } from "lucide-react";

export function BoletoActions() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-6 text-sm font-black text-white hover:bg-[#CC632B] print:hidden"
    >
      Imprimir ou salvar em PDF
      <Download className="h-4 w-4" />
    </button>
  );
}
