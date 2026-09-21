"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, MapPin, ShoppingBag, Truck, UserRound } from "lucide-react";
import { formatCurrency, useCart } from "../components/cart-provider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const fieldClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B] user-invalid:shadow-[0_0_0_3px_rgba(204,99,43,.1)]";

export default function CheckoutPage() {
  const { items, itemCount, subtotal } = useCart();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC632B]">Compra segura</p><h1 className="mt-1 text-3xl font-black text-[#123F55] sm:text-4xl">Finalizar pedido</h1></div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400"><span className="text-[#3E1255]">Carrinho</span><span>•</span><span className="text-[#3E1255]">Dados e pagamento</span><span>•</span><span>Confirmação</span></div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-[#3E1255]" /><h2 className="mt-5 text-3xl font-black text-[#123F55]">Adicione produtos primeiro</h2><p className="mt-3 text-sm leading-6 text-slate-500">Seu resumo de compra aparecerá aqui assim que você escolher os produtos.</p><Link href="/produto" className="mt-7 inline-flex h-12 items-center rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white">Ver produtos</Link></div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_390px]">
            {submitted && <div role="status" className="reveal-up flex items-center gap-3 rounded-lg border border-[#D9C7E3] bg-[#F5EFF8] p-5 text-sm font-bold text-[#3E1255] lg:col-span-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#FE8C05]" /> Dados validados neste protótipo. A confirmação será conectada ao backend.</div>}
            <div className="space-y-6">
              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8">
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><UserRound className="h-5 w-5 text-[#FE8C05]" />Dados pessoais</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Nome completo<input className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input type="email" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Telefone<input type="tel" className={fieldClass} required /></label>
                </div>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "80ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><MapPin className="h-5 w-5 text-[#FE8C05]" />Endereço de entrega</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600">CEP<input inputMode="numeric" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Cidade<input className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Endereço<input className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Número<input className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Complemento<input className={fieldClass} /></label>
                </div>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "160ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><CreditCard className="h-5 w-5 text-[#FE8C05]" />Pagamento</h2>
                <div className="mt-6 rounded-md border-2 border-[#3E1255] bg-[#F5EFF8] p-4"><label className="flex items-center gap-3 text-sm font-black text-[#3E1255]"><input type="radio" name="payment" defaultChecked className="accent-[#3E1255]" /> Cartão de crédito</label></div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Número do cartão<input inputMode="numeric" className={fieldClass} placeholder="0000 0000 0000 0000" required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Validade<input className={fieldClass} placeholder="MM/AA" required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">CVV<input inputMode="numeric" className={fieldClass} placeholder="000" required /></label>
                </div>
              </section>
              <Link href="/carrinho" className="group inline-flex items-center gap-2 text-sm font-black text-[#3E1255]"><ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Voltar ao carrinho</Link>
            </div>

            <aside className="h-fit overflow-hidden rounded-lg bg-[#123F55] text-white shadow-[0_20px_50px_rgba(18,63,85,.2)] lg:sticky lg:top-28">
              <div className="p-7"><LockKeyhole className="h-7 w-7 text-[#FE8C05]" /><h2 className="mt-4 text-2xl font-black">Resumo do pedido</h2><p className="mt-2 text-xs leading-5 text-white/60">Seus dados estão protegidos durante toda a compra.</p></div>
              <div className="max-h-[330px] divide-y divide-white/10 overflow-y-auto border-y border-white/10 px-7">
                {items.map(({ product, quantity }) => (
                  <div key={product.slug} className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-4"><div className="relative h-16 rounded-md bg-white/95"><Image src={product.images[0]} alt="" fill sizes="60px" className="object-contain p-1" /></div><div><p className="text-xs font-bold leading-4">{product.shortName}</p><p className="mt-1 text-[10px] text-white/55">Qtd. {quantity}</p></div><strong className="text-xs">{formatCurrency(product.priceValue * quantity)}</strong></div>
                ))}
              </div>
              <div className="p-7">
                <div className="grid gap-3 text-sm text-white/65">
                  <div className="flex justify-between"><span>Subtotal ({itemCount})</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Entrega</span><span className="text-[#D9C7E3]">Grátis</span></div>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-5"><strong>Total</strong><strong className="text-2xl text-[#FE8C05]">{formatCurrency(subtotal)}</strong></div>
                <div className="mt-7 grid gap-3">
                  <Link href="/carrinho" className="flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-white/70 text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:border-white hover:bg-white hover:text-[#3E1255] active:scale-95">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Conferir carrinho</span>
                  </Link>
                  <button type="submit" className="h-13 w-full rounded-full bg-[#FE8C05] text-sm font-black transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">{submitted ? "Dados conferidos" : "Confirmar pedido"}</button>
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/50"><Truck className="h-3.5 w-3.5" /> Entrega acompanhada até você</p>
              </div>
            </aside>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
