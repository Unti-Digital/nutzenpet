"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, LockKeyhole, MapPin, PackageCheck, ShoppingBag, Truck, UserRound } from "lucide-react";
import { formatCurrency, useCart } from "../components/cart-provider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const fieldClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B]";

export default function CheckoutPage() {
  const { items, itemCount, total, updateCustomer, selectShippingRate, shippingRates, hasCalculatedShipping, error } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedShipping = shippingRates.flatMap((group) => group.shipping_rates).find((rate) => rate.selected);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim().split(/\s+/);
    const saved = await updateCustomer({
      first_name: fullName.shift() ?? "",
      last_name: fullName.join(" "),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? "").toUpperCase(),
      country: "BR",
      address_1: String(form.get("address_1") ?? ""),
      address_2: String(form.get("address_2") ?? ""),
    });
    setSubmitted(saved);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC632B]">Compra segura</p><h1 className="mt-1 text-3xl font-black text-[#123F55] sm:text-4xl">Dados e entrega</h1></div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400"><span className="text-[#3E1255]">Carrinho</span><span>•</span><span className="text-[#3E1255]">Dados e entrega</span><span>•</span><span>Pagamento</span></div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-[#3E1255]" /><h2 className="mt-5 text-3xl font-black text-[#123F55]">Adicione produtos primeiro</h2><p className="mt-3 text-sm leading-6 text-slate-500">Seu resumo de compra aparecerá aqui assim que você escolher os produtos.</p><Link href="/produto" className="mt-7 inline-flex h-12 items-center rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white">Ver produtos</Link></div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_390px]">
            {submitted && <div role="status" className="reveal-up flex items-center gap-3 rounded-lg border border-[#D9C7E3] bg-[#F5EFF8] p-5 text-sm font-bold text-[#3E1255] lg:col-span-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#FE8C05]" /> Endereço atualizado no WooCommerce. Confira os métodos de entrega disponíveis.</div>}
            {error && <div role="alert" className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm font-bold text-[#CC632B] lg:col-span-2"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
            <div className="space-y-6">
              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8">
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><UserRound className="h-5 w-5 text-[#FE8C05]" />Dados pessoais</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Nome completo<input name="full_name" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input name="email" type="email" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Telefone<input name="phone" type="tel" className={fieldClass} required /></label>
                </div>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "80ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><MapPin className="h-5 w-5 text-[#FE8C05]" />Endereço de entrega</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600">CEP<input name="postcode" inputMode="numeric" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Estado<input name="state" className={fieldClass} placeholder="SP" maxLength={2} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Cidade<input name="city" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Endereço e número<input name="address_1" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Complemento<input name="address_2" className={fieldClass} /></label>
                </div>
                <button type="submit" disabled={submitting} className="mt-6 h-12 rounded-full bg-[#3E1255] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#5B2674] disabled:opacity-50">{submitting ? "Consultando entrega..." : "Calcular entrega"}</button>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "160ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><Truck className="h-5 w-5 text-[#FE8C05]" />Método de entrega</h2>
                {!hasCalculatedShipping && <p className="mt-4 text-sm leading-6 text-slate-500">Preencha o endereço para consultar os métodos configurados no WooCommerce.</p>}
                {hasCalculatedShipping && shippingRates.length === 0 && <p className="mt-4 rounded-md bg-orange-50 p-4 text-sm font-bold text-[#CC632B]">Não há método de entrega disponível para este endereço.</p>}
                <div className="mt-5 grid gap-3">{shippingRates.flatMap((group) => group.shipping_rates.map((rate) => <button key={rate.rate_id} type="button" onClick={() => void selectShippingRate(group.package_id, rate.rate_id)} className={`flex items-center justify-between rounded-md border-2 p-4 text-left text-sm ${rate.selected ? "border-[#3E1255] bg-[#F5EFF8]" : "border-slate-200"}`}><span><strong className="block text-[#123F55]">{rate.name}</strong>{rate.delivery_time && <small className="text-slate-500">{rate.delivery_time}</small>}</span><strong className="text-[#3E1255]">{formatCurrency(Number(rate.price) / 10 ** rate.currency_minor_unit)}</strong></button>))}</div>
              </section>

              <section className="rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6 sm:p-8"><h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><PackageCheck className="h-5 w-5 text-[#FE8C05]" />Pagamento pendente</h2><p className="mt-3 text-sm leading-6 text-slate-600">A finalização será habilitada após a instalação e homologação de um gateway WooCommerce compatível com checkout headless. Nenhuma cobrança ou pedido pago é simulado nesta etapa.</p></section>
              <Link href="/carrinho" className="group inline-flex items-center gap-2 text-sm font-black text-[#3E1255]"><ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Voltar ao carrinho</Link>
            </div>

            <aside className="h-fit overflow-hidden rounded-lg bg-[#123F55] text-white shadow-[0_20px_50px_rgba(18,63,85,.2)] lg:sticky lg:top-28">
              <div className="p-7"><LockKeyhole className="h-7 w-7 text-[#FE8C05]" /><h2 className="mt-4 text-2xl font-black">Resumo do pedido</h2><p className="mt-2 text-xs leading-5 text-white/60">Preços e totais são calculados pelo WooCommerce.</p></div>
              <div className="max-h-[330px] divide-y divide-white/10 overflow-y-auto border-y border-white/10 px-7">
                {items.map(({ product, quantity }) => <div key={product.slug} className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-4"><div className="relative h-16 rounded-md bg-white/95"><Image src={product.images[0]} alt="" fill sizes="60px" className="object-contain p-1" /></div><div><p className="text-xs font-bold leading-4">{product.shortName}</p><p className="mt-1 text-[10px] text-white/55">Qtd. {quantity}</p></div><strong className="text-xs">{formatCurrency(product.priceValue * quantity)}</strong></div>)}
              </div>
              <div className="p-7">
                <div className="grid gap-3 text-sm text-white/65"><div className="flex justify-between"><span>Produtos ({itemCount})</span><span>Incluídos</span></div><div className="flex justify-between gap-4"><span>Entrega</span><span className="text-right text-[#D9C7E3]">{hasCalculatedShipping ? selectedShipping?.name ?? "Selecione um método" : "A calcular"}</span></div></div>
                <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-5"><strong>Total</strong><strong className="text-2xl text-[#FE8C05]">{formatCurrency(total)}</strong></div>
                <Link href="/carrinho" className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-white/70 text-sm font-black text-white transition-colors duration-300 hover:bg-white hover:text-[#3E1255]"><ShoppingBag className="h-4 w-4" />Conferir carrinho</Link>
                <button type="button" disabled className="mt-3 h-13 w-full cursor-not-allowed rounded-full bg-slate-400 text-sm font-black text-white">Pagamento ainda não configurado</button>
              </div>
            </aside>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
