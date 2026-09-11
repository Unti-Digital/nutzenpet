import Image from "next/image";
import { Heart, Leaf, Sparkles } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { ProductCard } from "../components/product-card";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { products } from "../data/products";

export default function ProductIndexPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#124D55] px-5 py-14 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-[#B9DC80] opacity-35" />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-[1fr_430px]">
          <div className="reveal-up"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#B9DC80]"><Sparkles className="h-4 w-4" /> Nutrição para cada fase</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Conheça as linhas NutzenPet</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Fórmulas completas para acompanhar cães e gatos com sabor, equilíbrio e cuidado todos os dias.</p></div>
          <div className="relative hidden h-72 lg:block"><span className="absolute inset-y-5 left-1/2 aspect-square -translate-x-1/2 rounded-full bg-[#F1F6E7]" /><Image src={products[1].images[0]} alt="Produto NutzenPet" fill preload sizes="430px" className="relative object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,.18)]" /></div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20"><FloatingMotifs className="opacity-20" /><div className="relative mx-auto max-w-[1240px]"><div className="text-center"><p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]"><Leaf className="h-4 w-4" /> Escolha o cuidado ideal</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Nossos produtos</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">Veja detalhes, composição e recomendações de uso de cada linha.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div><p className="mt-12 flex items-center justify-center gap-2 text-sm font-bold text-[#67952F]"><Heart className="h-4 w-4" /> Qualidade que você sente em cada porção.</p></div></section>
      <SiteFooter />
    </main>
  );
}
