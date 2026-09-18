"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { formatCurrency, useCart } from "../components/cart-provider";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export default function CartPage() {
  const { items, itemCount, subtotal, increment, decrement, removeItem } = useCart();

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#F5EFF8] px-5 py-12 sm:px-8 sm:py-16">
        <FloatingMotifs className="opacity-60" />
        <div className="reveal-up relative mx-auto max-w-[1180px]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3E1255]">Sua seleção</p>
          <div className="mt-2 flex items-center gap-3"><ShoppingBag className="h-8 w-8 text-[#FE8C05]" /><h1 className="text-4xl font-black text-[#123F55] sm:text-5xl">Seu carrinho</h1></div>
          <p className="mt-3 text-sm text-slate-600">{itemCount === 0 ? "Sua sacola está pronta para receber produtos." : `${itemCount} ${itemCount === 1 ? "item selecionado" : "itens selecionados"}`}</p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        {items.length === 0 ? (
          <div className="reveal-up mx-auto max-w-xl py-14 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><ShoppingBag className="h-9 w-9" /></span>
            <h2 className="mt-6 text-3xl font-black text-[#123F55]">Seu carrinho está vazio</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Conheça nossas linhas e encontre a nutrição ideal para cada fase da vida do seu pet.</p>
            <Link href="/produto" className="group mt-7 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">Conhecer produtos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map(({ product, quantity }, index) => (
                <article key={product.slug} className="reveal-up grid items-center gap-5 rounded-lg bg-white p-5 shadow-[0_12px_35px_rgba(18,63,85,.07)] sm:grid-cols-[140px_1fr_auto] sm:p-6" style={{ animationDelay: `${index * 80}ms` }}>
                  <Link href={`/produto/${product.slug}`} className="relative mx-auto h-36 w-full max-w-40 sm:mx-0"><Image src={product.images[0]} alt={product.name} fill sizes="160px" className="object-contain" /></Link>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: product.accent }}>Linha Nutzen · {product.weight}</p>
                    <Link href={`/produto/${product.slug}`} className="mt-2 block text-lg font-black leading-6 text-[#123F55] transition-colors duration-300 hover:text-[#FE8C05]">{product.name}</Link>
                    <div className="mt-5 flex w-fit items-center gap-3 rounded-full bg-slate-100 px-2 py-1">
                      <button type="button" onClick={() => decrement(product.slug)} aria-label={`Diminuir quantidade de ${product.name}`} className="grid h-8 w-8 place-items-center rounded-full transition-all duration-300 hover:scale-90 hover:bg-white hover:text-[#FE8C05]"><Minus className="h-4 w-4" /></button>
                      <strong className="min-w-5 text-center text-sm">{quantity}</strong>
                      <button type="button" onClick={() => increment(product.slug)} aria-label={`Aumentar quantidade de ${product.name}`} className="grid h-8 w-8 place-items-center rounded-full transition-all duration-300 hover:scale-90 hover:bg-white hover:text-[#FE8C05]"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:block sm:text-right">
                    <strong className="text-xl font-black text-[#3E1255]">{formatCurrency(product.priceValue * quantity)}</strong>
                    <button type="button" onClick={() => removeItem(product.slug)} aria-label={`Remover ${product.name}`} className="sm:ml-auto sm:mt-6 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-all duration-300 hover:scale-90 hover:bg-orange-50 hover:text-[#CC632B]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
              <Link href="/produto" className="group inline-flex items-center gap-2 py-3 text-sm font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05]"><ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Continuar comprando</Link>
            </div>

            <aside className="h-fit rounded-lg bg-[#3E1255] p-7 text-white shadow-[0_18px_45px_rgba(62,18,85,.18)] lg:sticky lg:top-28">
              <h2 className="text-2xl font-black">Resumo do pedido</h2>
              <div className="mt-6 grid gap-4 border-b border-white/15 pb-6 text-sm">
                <div className="flex justify-between text-white/70"><span>Produtos ({itemCount})</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-white/70"><span>Entrega</span><span className="font-bold text-[#D9C7E3]">Grátis</span></div>
              </div>
              <div className="flex items-end justify-between pt-6"><strong>Total</strong><strong className="text-2xl text-[#FE8C05]">{formatCurrency(subtotal)}</strong></div>
              <Link href="/checkout" className="group mt-7 flex h-13 items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">Ir para o checkout <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link>
              <div className="mt-7 grid gap-3 border-t border-white/15 pt-6 text-xs text-white/70">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#D9C7E3]" /> Compra segura e protegida</span>
                <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#D9C7E3]" /> Entrega para todo o Brasil</span>
                <span className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#D9C7E3]" /> Pedido acompanhado por você</span>
              </div>
            </aside>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
