import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, QrCode } from "lucide-react";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getWordPressUrl } from "@/lib/woocommerce/config";
import { PixActions } from "./pix-actions";
import { MetaPurchase } from "../../components/meta-purchase";

type PixPageProps = {
  searchParams: Promise<{ pedido?: string; chave?: string; retorno?: string; valor?: string }>;
};

type PixReceipt = {
  status: "pending" | "approved";
  qrCode: string | null;
  qrImage: string | null;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pagamento por Pix | Nutzen",
  robots: { index: false, follow: false },
};

function decodeAttribute(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'");
}

function getReceiptUrl(orderId: string, orderKey: string, returnUrl: string) {
  const wordpressUrl = new URL(getWordPressUrl());

  try {
    const receiptUrl = new URL(returnUrl);
    const belongsToWordPress = receiptUrl.origin === wordpressUrl.origin;
    const belongsToOrder = receiptUrl.pathname.split("/").includes(orderId);
    const hasCorrectKey = receiptUrl.searchParams.get("key") === orderKey;
    if (belongsToWordPress && belongsToOrder && hasCorrectKey) return receiptUrl;
  } catch {
    // O endereço de retorno é validado antes de ser consultado pelo servidor.
  }

  return null;
}

async function getPixReceipt(orderId: string, orderKey: string, returnUrl: string): Promise<PixReceipt | null> {
  if (!/^\d+$/.test(orderId) || !/^wc_order_[A-Za-z0-9]+$/.test(orderKey)) return null;

  const receiptUrl = getReceiptUrl(orderId, orderKey, returnUrl);
  if (!receiptUrl) return null;

  try {
    const response = await fetch(receiptUrl, {
      cache: "no-store",
      headers: { Accept: "text/html", "User-Agent": "NutzenCheckout/1.0" },
    });
    if (!response.ok) return { status: "pending", qrCode: null, qrImage: null };

    const html = await response.text();
    if (/mp-pix-approved-container/i.test(html)) {
      return { status: "approved", qrCode: null, qrImage: null };
    }

    const codeMatch = html.match(/<input[^>]+id=["']mp-qr-code["'][^>]+value=["']([^"']+)["']/i);
    const imageMatch = html.match(/<img[^>]+data-cy=["']qrcode-pix["'][^>]+src=["'](data:image\/[^;]+;base64,[^"']+)["']/i);
    return {
      status: "pending",
      qrCode: codeMatch?.[1] ? decodeAttribute(codeMatch[1]) : null,
      qrImage: imageMatch?.[1] ? decodeAttribute(imageMatch[1]) : null,
    };
  } catch {
    return { status: "pending", qrCode: null, qrImage: null };
  }
}

export default async function PixPage({ searchParams }: PixPageProps) {
  const { pedido = "", chave = "", retorno = "", valor = "" } = await searchParams;
  const pix = await getPixReceipt(pedido, chave, retorno);

  return (
    <main className="min-h-screen bg-slate-50">
      {pix?.status === "approved" && <MetaPurchase orderId={pedido} value={valor} />}
      <SiteHeader />
      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(18,63,85,.1)] sm:p-10">
          {pix?.status === "approved" ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50"><CheckCircle2 className="h-10 w-10 text-emerald-600" /></span>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Pagamento aprovado</p>
              <h1 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Pix recebido com sucesso!</h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">O pagamento do pedido #{pedido} foi confirmado e o pedido já está sendo processado.</p>
            </div>
          ) : pix ? (
            <>
              <div className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F5EFF8]"><QrCode className="h-8 w-8 text-[#3E1255]" /></span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#FE8C05]">Pedido recebido</p>
                <h1 className="mt-2 text-3xl font-black text-[#123F55]">Pague seu pedido com Pix</h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Pedido #{pedido}. Abra o aplicativo do seu banco, escaneie o QR Code ou use o Pix Copia e Cola. O código vence em 30 minutos.</p>
              </div>

              {pix.qrCode && pix.qrImage ? (
                <div className="mx-auto mt-8 grid max-w-xl gap-6 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-[220px_1fr] sm:items-center">
                  <Image src={pix.qrImage} alt="QR Code para pagamento por Pix" width={220} height={220} unoptimized className="mx-auto h-[220px] w-[220px] rounded-lg bg-white p-2" />
                  <div>
                    <p className="text-sm font-black text-[#123F55]">Pix Copia e Cola</p>
                    <p className="mt-2 break-all rounded-md border border-slate-200 bg-white p-3 text-[10px] leading-4 text-slate-500">{pix.qrCode}</p>
                    <div className="mt-4"><PixActions qrCode={pix.qrCode} pending /></div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm text-[#8A451F]"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong className="block">O Pix está sendo preparado.</strong><p className="mt-2 leading-6">A página será atualizada automaticamente em alguns instantes.</p><div className="mt-3"><PixActions pending /></div></div></div>
              )}
            </>
          ) : (
            <div className="py-8 text-center"><AlertCircle className="mx-auto h-12 w-12 text-[#CC632B]" /><h1 className="mt-4 text-3xl font-black text-[#123F55]">Pix não localizado</h1><p className="mt-3 text-sm text-slate-600">Confira o link recebido após a compra ou consulte seus pedidos.</p></div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-7">
            <Link href="/minha-conta" className="inline-flex h-12 items-center justify-center rounded-full bg-[#3E1255] px-6 text-sm font-black text-white">Acompanhar pedidos</Link>
            <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#3E1255] px-6 text-sm font-black text-[#3E1255]">Voltar ao início</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
