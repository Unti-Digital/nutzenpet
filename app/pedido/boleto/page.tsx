import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getWordPressUrl } from "@/lib/woocommerce/config";

type BoletoPageProps = {
  searchParams: Promise<{ pedido?: string; chave?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boleto gerado | Nutzen",
  robots: { index: false, follow: false },
};

function decodeAttribute(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&quot;", "\"");
}

async function getBoleto(orderId: string, orderKey: string) {
  if (!/^\d+$/.test(orderId) || !/^wc_order_[A-Za-z0-9]+$/.test(orderKey)) return null;

  const wordpressUrl = new URL(getWordPressUrl());
  const receiptUrl = new URL(`${wordpressUrl.pathname.replace(/\/$/, "")}/finalizar-compra/order-received/${orderId}/`, wordpressUrl.origin);
  receiptUrl.searchParams.set("key", orderKey);

  try {
    const response = await fetch(receiptUrl, {
      cache: "no-store",
      headers: { Accept: "text/html", "User-Agent": "NutzenCheckout/1.0" },
    });
    if (!response.ok) return { receiptUrl: receiptUrl.toString(), ticketUrl: null };

    const html = await response.text();
    const match = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (!match?.[1]) return { receiptUrl: receiptUrl.toString(), ticketUrl: null };

    const ticketUrl = new URL(decodeAttribute(match[1]), wordpressUrl.origin);
    if (ticketUrl.protocol !== "https:") return { receiptUrl: receiptUrl.toString(), ticketUrl: null };
    return { receiptUrl: receiptUrl.toString(), ticketUrl: ticketUrl.toString() };
  } catch {
    return { receiptUrl: receiptUrl.toString(), ticketUrl: null };
  }
}

export default async function BoletoPage({ searchParams }: BoletoPageProps) {
  const { pedido = "", chave = "" } = await searchParams;
  const boleto = await getBoleto(pedido, chave);

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(18,63,85,.1)] sm:p-10">
            {boleto ? (
              <>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></span>
                    <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Pedido recebido</p><h1 className="mt-1 text-3xl font-black text-[#123F55]">Seu boleto foi gerado</h1><p className="mt-2 text-sm leading-6 text-slate-600">Pedido #{pedido}. O pagamento pode levar até dois dias úteis para ser confirmado.</p></div>
                  </div>
                  {boleto.ticketUrl && <a href={boleto.ticketUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-6 text-sm font-black text-white hover:bg-[#CC632B]">Abrir para imprimir <ExternalLink className="h-4 w-4" /></a>}
                </div>

                {boleto.ticketUrl ? (
                  <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <iframe src={boleto.ticketUrl} title={`Boleto do pedido ${pedido}`} className="h-[900px] w-full" />
                  </div>
                ) : (
                  <div className="mt-8 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm text-[#8A451F]"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong className="block">O boleto foi gerado, mas a visualização ainda está carregando.</strong><a href={boleto.receiptUrl} className="mt-2 inline-flex font-black underline">Abrir os dados do pedido</a></div></div>
                )}
              </>
            ) : (
              <div className="py-8 text-center"><FileText className="mx-auto h-12 w-12 text-[#3E1255]" /><h1 className="mt-4 text-3xl font-black text-[#123F55]">Boleto não localizado</h1><p className="mt-3 text-sm text-slate-600">Confira o link recebido após a compra ou consulte seus pedidos.</p></div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-7">
              <Link href="/minha-conta" className="inline-flex h-12 items-center justify-center rounded-full bg-[#3E1255] px-6 text-sm font-black text-white">Acompanhar pedidos</Link>
              <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#3E1255] px-6 text-sm font-black text-[#3E1255]">Voltar ao início</Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
