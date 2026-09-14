"use client";

import Image from "next/image";
import { PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { products } from "../data/products";

const heroProducts = [products[1], products[0], products[2]];

export function ProductHeroSlider() {
  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveProduct((current) => (current + 1) % heroProducts.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto h-[270px] w-full max-w-[460px] sm:h-[330px] lg:h-[360px]">
      <span className="absolute inset-y-[8%] left-1/2 aspect-square -translate-x-1/2 rounded-full bg-[#F1F6E7]" aria-hidden="true" />
      <span className="absolute bottom-[4%] left-1/2 h-4 w-[62%] -translate-x-1/2 rounded-[50%] bg-black/15 blur-md" aria-hidden="true" />

      <div className="float-soft absolute inset-0 z-10">
        {heroProducts.map((product, index) => (
          <Image
            key={product.slug}
            src={product.images[1]}
            alt={product.name}
            fill
            preload={index === 0}
            sizes="(max-width: 640px) 86vw, (max-width: 1024px) 440px, 460px"
            aria-hidden={activeProduct !== index}
            className={`object-contain object-center drop-shadow-[0_22px_20px_rgba(0,0,0,.2)] transition-all duration-700 ease-in-out motion-reduce:transition-none ${activeProduct === index ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          />
        ))}
      </div>

      <span className="sonar sonar-orange absolute right-[7%] top-[8%] z-20 grid h-10 w-10 place-items-center rounded-full bg-[#FE8C05] text-white sm:h-11 sm:w-11">
        <PawPrint className="relative z-10 h-5 w-5" />
      </span>

      <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label="Selecionar produto em destaque">
        {heroProducts.map((product, index) => (
          <button
            key={product.slug}
            type="button"
            onClick={() => setActiveProduct(index)}
            aria-label={`Exibir ${product.name}`}
            aria-pressed={activeProduct === index}
            className={`h-2 rounded-full transition-all duration-300 hover:bg-[#FE8C05] ${activeProduct === index ? "w-8 bg-[#FE8C05]" : "w-2 bg-white/55"}`}
          />
        ))}
      </div>
    </div>
  );
}
