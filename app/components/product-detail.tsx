"use client";

import Image from "next/image";
import { Check, Info, Leaf, Minus, PackageOpen, Plus, ShoppingBag, Utensils } from "lucide-react";
import { useState } from "react";
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
  const [quantity, setQuantity] = useState(1);
  const [activeInformation, setActiveInformation] = useState<InformationTab>("nutrition");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="relative h-[480px] sm:h-[620px]">
            {product.images.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={`${product.name} - imagem ${index + 1}`}
                fill
                preload={index === 0}
                sizes="(max-width: 1024px) 95vw, 620px"
                className={`object-contain p-3 transition-all duration-700 ${active === index ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-5">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagem ${index + 1}`}
                className={`relative h-20 w-20 transition-all duration-300 hover:scale-[0.96] active:scale-90 ${active === index ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-contain" />
                <span className={`absolute inset-x-3 -bottom-2 h-0.5 transition-transform duration-300 ${active === index ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: product.accent }} />
              </button>
            ))}
          </div>
        </div>

        <div className="reveal-up">
          <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: product.accent }}>Linha Nutzen · {product.weight}</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#123F55] sm:text-5xl">{product.name}</h1>
          <p className="mt-6 text-base leading-8 text-slate-600">{product.description}</p>
          <ul className="mt-7 grid gap-3">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <span className="grid h-7 w-7 place-items-center rounded-full text-white" style={{ backgroundColor: product.accent }}><Check className="h-4 w-4" /></span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex items-end justify-between border-y border-slate-200 py-6">
            <div><p className="text-xs text-slate-400">Preço sugerido</p><strong className="mt-1 block text-3xl font-black" style={{ color: product.accent }}>{product.price}</strong></div>
            <div className="flex items-center gap-4 bg-slate-100 px-3 py-2">
              <button type="button" aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-8 w-8 place-items-center transition-all duration-300 hover:scale-90 hover:text-[#FE8C05]"><Minus className="h-4 w-4" /></button>
              <span className="min-w-5 text-center font-black">{quantity}</span>
              <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => value + 1)} className="grid h-8 w-8 place-items-center transition-all duration-300 hover:scale-90 hover:text-[#FE8C05]"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <button type="button" onClick={handleAddToCart} className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">
            {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}<span>{added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}</span>
          </button>
        </div>
      </div>

      <section className="reveal-up overflow-hidden rounded-lg bg-[#F1F6E7]" aria-labelledby="product-information-title">
        <div className="px-5 pb-7 pt-9 text-center sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: product.accent }}>Conheça melhor o produto</p>
          <h2 id="product-information-title" className="mt-2 text-3xl font-black text-[#123F55] sm:text-4xl">Informações do alimento</h2>
        </div>

        <div className="flex overflow-x-auto border-y border-[#D8E4C5] bg-white/65 px-3 sm:justify-center sm:px-6" role="tablist" aria-label="Informações do produto">
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
                className={`relative flex min-h-16 shrink-0 items-center gap-2 px-4 text-xs font-black transition-all duration-300 hover:scale-[0.97] sm:px-6 ${selected ? "text-[#124D55]" : "text-slate-500 hover:text-[#124D55]"}`}
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
                <div key={item.label} className="flex items-center justify-between gap-4 bg-white px-5 py-4 shadow-[0_8px_25px_rgba(18,77,85,.06)]">
                  <span className="text-sm font-bold text-slate-600">{item.label}</span>
                  <strong className="text-sm text-[#124D55]">{item.value}</strong>
                </div>
              ))}
            </div>
          )}

          {activeInformation === "ingredients" && (
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-5 bg-white p-6 sm:p-8">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#8DBB46] text-white"><Leaf className="h-6 w-6" /></span>
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
                  {product.feedingGuide.map((row) => <div key={row.weight} className="flex justify-between gap-4 py-3 text-sm"><span className="text-slate-500">{row.weight}</span><strong className="text-[#124D55]">{row.amount}</strong></div>)}
                </div>
              </div>
            </div>
          )}

          {activeInformation === "storage" && (
            <div className="mx-auto flex max-w-3xl items-start gap-5 bg-white p-6 sm:p-8">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FE8C05] text-white"><PackageOpen className="h-6 w-6" /></span>
              <div><h3 className="text-xl font-black text-[#123F55]">Conservação e armazenamento</h3><p className="mt-3 text-sm leading-7 text-slate-600">{product.storage}</p></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
