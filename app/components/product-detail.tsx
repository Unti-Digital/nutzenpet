"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, Check, Info, Leaf, Minus, PackageOpen, Plus, RefreshCw, ShoppingBag, Utensils } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { Product } from "../data/products";
import { useCart } from "./cart-provider";

type InformationTab = "nutrition" | "ingredients" | "directions" | "storage";

const informationTabs = [
  { id: "nutrition" as const, label: "Informações nutricionais", icon: Info },
  { id: "ingredients" as const, label: "Ingredientes", icon: Leaf },
  { id: "directions" as const, label: "Como usar", icon: Utensils },
  { id: "storage" as const, label: "Armazenamento", icon: PackageOpen },
];

export function ProductDetail({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [activeInformation, setActiveInformation] = useState<InformationTab>("nutrition");
  const { addItem, decrement, increment, items } = useCart();
  const cartItem = items.find((item) => item.product.slug === product.slug);
  const isInCart = Boolean(cartItem);

  function handleAddToCart() {
    if (product.availableForPurchase && !isInCart) addItem(product, 1);
  }

  return (
    <div className="space-y-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative">
          <div
            className="relative h-[480px] overflow-hidden rounded-lg border shadow-[0_18px_55px_rgba(18,63,85,.08)] sm:h-[620px]"
            style={{ backgroundColor: product.soft, borderColor: `${product.accent}1f` }}
          >
            <span className="absolute left-6 top-6 z-10 h-px w-16 opacity-40" style={{ backgroundColor: product.accent }} aria-hidden="true" />
            <Leaf className="float-soft absolute bottom-8 left-7 h-8 w-8 rotate-[-18deg] opacity-20" style={{ color: product.accent }} aria-hidden="true" />
            <Leaf className="float-soft-delayed absolute right-7 top-8 h-6 w-6 rotate-[22deg] opacity-20" style={{ color: product.accent }} aria-hidden="true" />
            <span className="absolute right-6 top-6 z-10 text-[10px] font-black tracking-[0.16em]" style={{ color: product.accent }} aria-live="polite">
              {String(active + 1).padStart(2, "0")} / {String(product.images.length).padStart(2, "0")}
            </span>
            {product.images.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={`${product.name} - imagem ${index + 1}`}
                fill
                preload={index === 0}
                sizes="(max-width: 1024px) 95vw, 620px"
                className={`object-contain p-8 transition-all duration-700 sm:p-10 ${active === index ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
              />
            ))}
          </div>
          <div className="mx-auto mt-4 flex w-fit max-w-full justify-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-3 shadow-[0_10px_30px_rgba(18,63,85,.07)] sm:gap-4 sm:px-4 md:absolute md:left-5 md:top-5 md:z-20 md:mt-0 md:flex-col md:gap-3 md:px-3 md:py-3">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagem ${index + 1}`}
                className={`relative h-16 w-16 rounded-md transition-all duration-300 hover:scale-[0.96] active:scale-90 sm:h-20 sm:w-20 ${active === index ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
                style={active === index ? { backgroundColor: product.soft } : undefined}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-contain" />
                <span className={`absolute inset-x-3 -bottom-2 h-0.5 transition-transform duration-300 ${active === index ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: product.accent }} />
              </button>
            ))}
          </div>
        </div>

        <div className="reveal-up">
          <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: product.accent }}>Linha Nutzen · {product.weight}</p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-[#123F55] sm:text-5xl">{product.name}</h2>
          <p className="mt-6 text-base leading-8 text-slate-600">{product.description}</p>
          <ul className="mt-7 grid gap-3">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <span className="sonar relative grid h-7 w-7 place-items-center rounded-full text-white" style={{ backgroundColor: product.accent, "--sonar-color": product.accent } as CSSProperties}><Check className="h-4 w-4" /></span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Escolha o tamanho</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.sizeOptions.map((option) => {
                const selected = option.slug === product.slug;
                return (
                  <Link key={option.slug} href={`/produto/${option.slug}`} aria-current={selected ? "page" : undefined} className={`relative min-w-24 rounded-md border-2 px-4 py-3 text-center text-sm font-black transition-all duration-300 ${selected ? "border-[#3E1255] bg-[#3E1255] text-white" : "border-[#D9C7E3] bg-white text-[#3E1255] hover:border-[#3E1255] hover:bg-[#F5EFF8]"}`}>
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="mt-9 flex items-end justify-between border-y border-slate-200 py-6">
            <strong className="block text-3xl font-black" style={{ color: product.accent }}>{product.price}</strong>
            {cartItem && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">No carrinho</span>
                <div className="flex items-center gap-4 bg-slate-100 px-3 py-2">
                  <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => decrement(product.slug)} className="grid h-8 w-8 place-items-center transition-all duration-300 hover:scale-90 hover:text-[#FE8C05]"><Minus className="h-4 w-4" /></button>
                  <span className="min-w-5 text-center font-black" aria-live="polite">{cartItem.quantity}</span>
                  <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => increment(product.slug)} className="grid h-8 w-8 place-items-center transition-all duration-300 hover:scale-90 hover:text-[#FE8C05]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={handleAddToCart} disabled={isInCart || !product.availableForPurchase} aria-pressed={isInCart} className="flex h-14 min-w-0 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-4 text-xs font-black text-white transition-all duration-300 enabled:hover:scale-[0.98] enabled:hover:bg-[#CC632B] enabled:active:scale-95 disabled:cursor-default disabled:bg-slate-300 sm:text-sm">
              {isInCart ? <Check className="h-5 w-5 shrink-0" /> : <ShoppingBag className="h-5 w-5 shrink-0" />}
              <span>{isInCart ? "Adicionado" : product.availableForPurchase ? "Adicionar ao carrinho" : "Preço em breve"}</span>
            </button>
            <Link href="/carrinho" className="group flex h-14 min-w-0 items-center justify-center gap-2 rounded-full border-2 border-[#3E1255] px-4 text-center text-xs font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">
              <span>Ir para o carrinho</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
            <Link href="/checkout" className="group flex h-14 min-w-0 items-center justify-center gap-2 rounded-full bg-[#3E1255] px-4 text-center text-xs font-black text-white transition-colors duration-300 hover:bg-[#123F55]">
              <span>Finalizar compra</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
          <section className="mt-5 rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-5 sm:p-6" aria-labelledby={`subscription-${product.slug}`}>
            <div className="flex items-start gap-4">
              <span className="sonar sonar-purple relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#6F3B85] text-white">
                <RefreshCw className="relative z-10 h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Nutzen Club</p>
                <h3 id={`subscription-${product.slug}`} className="mt-1 text-xl font-black leading-tight text-[#123F55]">Receba sua nutrição de forma programada.</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Mais praticidade para manter a rotina do seu pet sempre em dia.</p>
              </div>
              <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-black text-[#3E1255] sm:flex">
                <CalendarClock className="h-4 w-4 text-[#FE8C05]" /> Frequência flexível
              </span>
            </div>
            <Link href="/nutzen-club" className="group mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-6 text-sm font-black text-white transition-all duration-300 hover:scale-[0.99] hover:bg-[#CC632B] active:scale-95">
              <RefreshCw className="h-5 w-5 shrink-0" />
              <span>Assinar este produto</span>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </section>
        </div>
      </div>

      <section className="reveal-up overflow-hidden rounded-lg bg-[#F5EFF8]" aria-labelledby="product-information-title">
        <div className="px-5 pb-7 pt-9 text-center sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: product.accent }}>Conheça melhor o produto</p>
          <h2 id="product-information-title" className="mt-2 text-3xl font-black text-[#123F55] sm:text-4xl">Informações do alimento</h2>
        </div>

        <div className="flex overflow-x-auto border-y border-[#E2D4E9] bg-white/65 px-3 sm:justify-center sm:px-6" role="tablist" aria-label="Informações do produto">
          {informationTabs.map((tab) => {
            const TabIcon = tab.icon;
            const selected = activeInformation === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveInformation(tab.id)}
                className={`relative flex min-h-16 shrink-0 items-center gap-2 px-4 text-xs font-black transition-all duration-300 hover:scale-[0.97] sm:px-6 ${selected ? "text-[#3E1255]" : "text-slate-500 hover:text-[#3E1255]"}`}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
                <span className={`absolute inset-x-4 bottom-0 h-0.5 origin-left transition-transform duration-300 ${selected ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: product.accent }} />
              </button>
            );
          })}
        </div>

        <div className="min-h-[320px] px-5 py-9 sm:px-10 sm:py-12">
          {activeInformation === "nutrition" && (
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.nutrition.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 bg-white px-5 py-4 shadow-[0_8px_25px_rgba(62,18,85,.06)]">
                  <span className="text-sm font-bold text-slate-600">{item.label}</span>
                  <strong className="text-sm text-[#3E1255]">{item.value}</strong>
                </div>
              ))}
            </div>
          )}

          {activeInformation === "ingredients" && (
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-5 bg-white p-6 sm:p-8">
                <span className="sonar sonar-purple relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#6F3B85] text-white"><Leaf className="h-6 w-6" /></span>
                <div><h3 className="text-xl font-black text-[#123F55]">Ingredientes selecionados</h3><p className="mt-3 text-sm leading-7 text-slate-600">{product.ingredients}</p></div>
              </div>
            </div>
          )}

          {activeInformation === "directions" && (
            <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div><h3 className="text-xl font-black text-[#123F55]">Recomendação de uso</h3><p className="mt-3 text-sm leading-7 text-slate-600">{product.directions}</p></div>
              <div className="bg-white p-5 sm:p-6">
                <h3 className="text-sm font-black text-[#123F55]">Quantidade diária sugerida</h3>
                <div className="mt-4 divide-y divide-slate-100">
                  {product.feedingGuide.map((row) => <div key={row.weight} className="flex justify-between gap-4 py-3 text-sm"><span className="text-slate-500">{row.weight}</span><strong className="text-[#3E1255]">{row.amount}</strong></div>)}
                </div>
              </div>
            </div>
          )}

          {activeInformation === "storage" && (
            <div className="mx-auto flex max-w-3xl items-start gap-5 bg-white p-6 sm:p-8">
              <span className="sonar sonar-orange relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FE8C05] text-white"><PackageOpen className="h-6 w-6" /></span>
              <div><h3 className="text-xl font-black text-[#123F55]">Conservação e armazenamento</h3><p className="mt-3 text-sm leading-7 text-slate-600">{product.storage}</p></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
