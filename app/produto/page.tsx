import Image from "next/image";
import { Heart, PackagePlus, Sparkles } from "lucide-react";
import { BrandButton } from "../components/brand-button";
import { FloatingMotifs } from "../components/floating-motifs";
import { ProductCarousel } from "../components/product-carousel";
import { ProductHeroSlider } from "../components/product-hero-slider";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { products } from "../data/products";

export default function ProductIndexPage() {
  const dogProducts = products.filter((product) => product.species === "dog");
  const catProducts = products.filter((product) => product.species === "cat");

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-14 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-[#D9C7E3] opacity-35" />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 md:grid-cols-[1fr_390px] lg:grid-cols-[1fr_460px]">
          <div className="reveal-up"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]"><Sparkles className="h-4 w-4" /> Nutrição para cada fase</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Conheça as linhas NutzenPet</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Fórmulas completas para acompanhar cães e gatos com sabor, equilíbrio e cuidado todos os dias.</p></div>
          <ProductHeroSlider />
        </div>
      </section>
      <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto max-w-[1240px]">
          <div className="text-center"><p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]"><Heart className="h-4 w-4" /> Escolha o cuidado ideal</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Linhas NutzenPet</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">Encontre a fórmula certa e conheça os tamanhos preparados para cada rotina.</p></div>

          <section className="mt-14" aria-labelledby="dog-line-title">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Nutrição para cães</p><h2 id="dog-line-title" className="mt-2 text-3xl font-black text-[#123F55]">Linha Cães</h2></div><span className="text-xs font-bold text-slate-500">1 kg · 3 kg · tamanhos família</span></div>
            <ProductCarousel products={dogProducts} className="mt-7" />
          </section>

          <section className="mt-16" aria-labelledby="cat-line-title">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#CC632B]">Nutrição para gatos</p><h2 id="cat-line-title" className="mt-2 text-3xl font-black text-[#123F55]">Linha Gatos</h2></div><span className="text-xs font-bold text-slate-500">1 kg · 3 kg · 10,1 kg</span></div>
            <ProductCarousel products={catProducts} startIndex={dogProducts.length} className="mt-7 md:max-w-[600px]" />
          </section>
        </div>
      </section>

      <section id="kits" className="relative overflow-hidden bg-[#F5EFF8] px-5 py-14 sm:px-8 sm:py-20">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]"><PackagePlus className="h-4 w-4" /> Novas possibilidades</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#123F55] sm:text-5xl">Monte seu kit NutzenPet.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">Combine tamanhos e produtos para organizar a alimentação do seu pet. As condições de lançamento serão apresentadas junto aos novos pacotes.</p>
            <div className="mt-6 flex flex-wrap gap-2">{["1 kg", "3 kg", "Tamanho família"].map((size) => <span key={size} className="rounded-full border border-[#D9C7E3] bg-white px-4 py-2 text-xs font-black text-[#3E1255]">{size}</span>)}</div>
            <BrandButton href="/contato" variant="orange" className="mt-8">Quero saber mais</BrandButton>
          </div>
          <div className="grid min-h-[340px] grid-cols-3 items-end gap-2 sm:min-h-[430px] sm:gap-5">
            {products.map((product, index) => <div key={product.slug} className={`relative h-[270px] sm:h-[370px] ${index === 1 ? "sm:-translate-y-8" : ""}`}><Image src={product.images[1]} alt={product.name} fill sizes="(max-width: 1024px) 30vw, 260px" className="float-soft object-contain drop-shadow-[0_18px_18px_rgba(62,18,85,.18)]" /></div>)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
