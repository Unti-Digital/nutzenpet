"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "./cart-provider";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveImage((current) => (current + 1) % product.images.length),
      3200 + index * 300,
    );
    return () => window.clearInterval(timer);
  }, [index, product.images.length]);

  return (
    <article className="reveal-up group relative flex min-h-[520px] flex-col overflow-hidden rounded-lg bg-white p-5 shadow-[0_12px_35px_rgba(18,63,85,.09)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" style={{ animationDelay: `${index * 100}ms` }}>
      <button type="button" onClick={handleAddToCart} aria-label={`Adicionar ${product.name} ao carrinho`} className="sonar absolute right-7 top-7 z-20 grid h-10 w-10 place-items-center rounded-full text-white transition-all duration-300 hover:scale-90 active:scale-75" style={{ backgroundColor: product.accent }}>
        {added ? <Check className="relative z-10 h-4 w-4" /> : <ShoppingBag className="relative z-10 h-4 w-4" />}
      </button>

      <div className="relative h-[285px] w-full">
        {product.images.map((image, imageIndex) => (
          <Image
            key={image}
            src={image}
            alt={`${product.name} - vista ${imageIndex + 1}`}
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 390px"
            className={`object-contain p-5 transition-all duration-700 ${activeImage === imageIndex ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2" aria-label={`Imagem ${activeImage + 1} de ${product.images.length}`}>
        {product.images.map((image, imageIndex) => (
          <button key={image} type="button" aria-label={`Ver imagem ${imageIndex + 1}`} onClick={() => setActiveImage(imageIndex)} className={`h-1.5 rounded-full transition-all duration-300 hover:scale-90 ${activeImage === imageIndex ? "w-8" : "w-2 bg-slate-300"}`} style={activeImage === imageIndex ? { backgroundColor: product.accent } : undefined} />
        ))}
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Nutrição completa · {product.weight}</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-slate-900">{product.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{product.description}</p>
      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <strong className="text-xl font-black" style={{ color: product.accent }}>{product.price}</strong>
        <Link href={`/produto/${product.slug}`} className="group/link flex items-center gap-2 text-xs font-black text-[#124D55] transition-colors duration-300 hover:text-[#FE8C05]">
          <span>Conhecer</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-2" />
        </Link>
      </div>
    </article>
  );
}
