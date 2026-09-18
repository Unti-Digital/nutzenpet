"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Product } from "../data/products";
import { ProductCard } from "./product-card";

export function ProductCarousel({ products, startIndex = 0, className = "" }: { products: Product[]; startIndex?: number; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const desktopCarousel = products.length > 3;

  function getItemsPerView() {
    if (window.innerWidth >= 1024) return desktopCarousel ? 3 : products.length;
    if (window.innerWidth >= 640) return desktopCarousel ? 2 : products.length;
    return 1;
  }

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    const maxIndex = Math.max(0, products.length - getItemsPerView());
    const nextIndex = direction > 0
      ? activeIndex >= maxIndex ? 0 : activeIndex + 1
      : activeIndex <= 0 ? maxIndex : activeIndex - 1;
    const target = track.children[nextIndex] as HTMLElement | undefined;
    const first = track.children[0] as HTMLElement | undefined;

    if (target && first) {
      track.scrollTo({ left: target.offsetLeft - first.offsetLeft, behavior: "smooth" });
      setActiveIndex(nextIndex);
    }
  }

  function syncActiveIndex() {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    const origin = children[0]?.offsetLeft ?? 0;
    const nearest = children.reduce((best, child, index) => {
      const distance = Math.abs(child.offsetLeft - origin - track.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveIndex(nearest.index);
  }

  const trackLayout = desktopCarousel
    ? "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    : "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3";
  const itemLayout = desktopCarousel
    ? "min-w-full snap-start sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)]"
    : "min-w-full snap-start sm:min-w-0";

  return (
    <div className={className}>
      <div className={`mb-5 flex w-full items-center justify-between md:justify-end md:gap-2 ${desktopCarousel ? "md:flex" : "md:hidden"}`} aria-label="Controles do carrossel de produtos">
        <button type="button" onClick={() => move(-1)} aria-label="Produto anterior" className="sonar sonar-purple relative grid h-11 w-11 place-items-center rounded-full border border-[#D9C7E3] bg-white text-[#3E1255] shadow-[0_8px_20px_rgba(62,18,85,.12)] transition-all duration-300 hover:scale-90 hover:bg-[#3E1255] hover:text-white active:scale-75"><ChevronLeft className="relative z-10 h-5 w-5" /></button>
        <button type="button" onClick={() => move(1)} aria-label="Próximo produto" className="sonar sonar-purple relative grid h-11 w-11 place-items-center rounded-full border border-[#D9C7E3] bg-white text-[#3E1255] shadow-[0_8px_20px_rgba(62,18,85,.12)] transition-all duration-300 hover:scale-90 hover:bg-[#3E1255] hover:text-white active:scale-75"><ChevronRight className="relative z-10 h-5 w-5" /></button>
      </div>
      <div ref={trackRef} onScroll={syncActiveIndex} className={`gap-6 ${trackLayout}`}>
        {products.map((product, index) => (
          <div key={product.slug} className={itemLayout}>
            <ProductCard product={product} index={index + startIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
