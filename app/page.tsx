"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Leaf,
  Mail,
  PackageCheck,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { BrandButton } from "./components/brand-button";
import { FloatingMotifs } from "./components/floating-motifs";
import { ProductCard } from "./components/product-card";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { products } from "./data/products";
import { posts } from "./data/posts";
import categoryFood from "../nutzenpet-assets-individuais/categoria-alimentacao.png";
import categoryCare from "../nutzenpet-assets-individuais/categoria-higiene-cuidados.png";
import categoryTreats from "../nutzenpet-assets-individuais/categoria-petiscos.png";
import categorySupplements from "../nutzenpet-assets-individuais/categoria-suplementos.png";
import newsletterDog from "../nutzenpet-assets-individuais/newsletter-cachorro.png";
import newsletterIcon from "../nutzenpet-assets-individuais/newsletter-icon.png";

const benefits = [
  { icon: Leaf, value: "ZERO", label: "Corantes e aromatizantes" },
  { icon: Sparkles, value: "100%", label: "Antioxidantes naturais" },
  { icon: ShieldCheck, value: "ALTO", label: "Teor de proteína" },
];

const categories: Array<{
  title: string;
  description: string;
  image: StaticImageData;
  background: string;
}> = [
  {
    title: "Alimentação",
    description: "Rações completas e balanceadas para todas as idades.",
    image: categoryFood,
    background: "#EFF5DE",
  },
  {
    title: "Petiscos",
    description: "Sabores saudáveis para recompensar com amor.",
    image: categoryTreats,
    background: "#FFF0DE",
  },
  {
    title: "Suplementos",
    description: "Mais saúde e energia para o dia a dia.",
    image: categorySupplements,
    background: "#EAF3DF",
  },
  {
    title: "Higiene e cuidados",
    description: "Produtos que cuidam com carinho.",
    image: categoryCare,
    background: "#FFF1E1",
  },
];

function Eyebrow({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#67952F] ${centered ? "justify-center" : ""}`}>
      {children}
      <Heart className="h-3.5 w-3.5" />
    </p>
  );
}

export default function Home() {
  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="min-h-screen bg-[#fffef9] text-slate-900">
      <SiteHeader />

      <section id="inicio" className="relative overflow-hidden px-5 pb-8 pt-10 sm:px-8 sm:pt-14 lg:pb-10 lg:pt-16">
        <FloatingMotifs className="opacity-45" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative z-10 text-center lg:text-left">
            <p className="reveal-up flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#67952F] lg:justify-start">
              <Sparkles className="h-3.5 w-3.5" /> Nutrição que eles merecem
            </p>
            <h1
              className="reveal-up mx-auto mt-4 max-w-[570px] text-[40px] font-black leading-[1.06] text-slate-950 sm:text-[54px] lg:mx-0 lg:text-[58px]"
              style={{ animationDelay: "80ms" }}
            >
              Nutrição de verdade para uma vida mais <span className="text-[#67952F]">feliz e saudável.</span>
            </h1>
            <p
              className="reveal-up mx-auto mt-5 max-w-[460px] text-sm leading-6 text-slate-600 lg:mx-0"
              style={{ animationDelay: "160ms" }}
            >
              Alimentos naturais e nutritivos para cães e gatos em todas as fases da vida.
            </p>
            <div
              className="reveal-up mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: "220ms" }}
            >
              <BrandButton href="#produtos" variant="teal">Ver produtos</BrandButton>
              <BrandButton href="/sobre" variant="outline">Saiba mais sobre nós</BrandButton>
            </div>
            <div
              className="reveal-up mt-8 grid gap-3 text-left sm:grid-cols-3"
              style={{ animationDelay: "300ms" }}
            >
              {[
                [Leaf, "Ingredientes naturais e selecionados"],
                [Heart, "Feito com amor para o seu pet"],
                [Truck, "Entrega para todo o Brasil"],
              ].map(([Icon, text]) => {
                const FeatureIcon = Icon as typeof Leaf;
                return (
                  <div key={text as string} className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C9DDAA] text-[#67952F]">
                      <FeatureIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-bold leading-4 text-slate-600">{text as string}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="reveal-up relative mx-auto h-[410px] w-full max-w-[690px] sm:h-[520px]"
            style={{ animationDelay: "150ms" }}
          >
            <span className="absolute bottom-[13%] left-[5%] h-[72%] w-[64%] rounded-full bg-[#EDF5DC]" aria-hidden="true" />
            <span className="absolute bottom-[2%] left-[8%] h-4 w-[58%] rounded-[50%] bg-[#123F55]/10 blur-md" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 z-[1] h-[96%] w-[70%]">
              <Image
                src="/images/hero-pets-v3.png"
                alt="Cachorro e gato saudáveis"
                fill
                preload
                sizes="(max-width: 1024px) 65vw, 440px"
                className="object-contain object-bottom"
              />
            </div>
            <div className="float-soft absolute -bottom-[2%] right-0 z-10 h-[82%] w-[48%]">
              <Image
                src="/produtos/produto2-1.png"
                alt="Nutzen para cães adultos de raças pequenas"
                fill
                sizes="(max-width: 1024px) 44vw, 330px"
                className="object-contain object-bottom drop-shadow-[0_20px_18px_rgba(18,77,85,.16)]"
              />
            </div>
            <span className="sonar absolute right-[10%] top-[7%] z-20 grid h-11 w-11 place-items-center rounded-full bg-[#FE8C05] text-white">
              <PawPrint className="relative z-10 h-5 w-5" />
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 pt-2 sm:px-8 lg:pb-20">
        <div className="mx-auto max-w-[1240px] rounded-lg bg-[#F1F6E7] px-5 py-7 sm:px-8">
          <h2 className="text-center text-lg font-black text-slate-900">Benefícios que fazem a diferença</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-0">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={benefit.value} className={`reveal-up flex items-center justify-center gap-4 px-4 ${index > 0 ? "md:border-l md:border-[#D6E2C2]" : ""}`} style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#8DBB46] text-white">
                    <BenefitIcon className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="text-2xl font-black leading-none text-[#67952F]">{benefit.value}</p>
                    <p className="mt-1 max-w-32 text-xs font-bold leading-4 text-slate-800">{benefit.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="produtos" className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Os favoritos</Eyebrow>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Produtos em destaque</h2>
            </div>
            <BrandButton href="/produto" variant="outline">Ver todos os produtos</BrandButton>
          </div>
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Eyebrow centered>Para cada fase, uma nutrição completa</Eyebrow>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Categorias</h2>
            <span className="mx-auto mt-3 block h-0.5 w-24 bg-[#9BC55B]" />
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <article
                key={category.title}
                className="reveal-up group relative min-h-[190px] overflow-hidden rounded-lg p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ backgroundColor: category.background, animationDelay: `${index * 90}ms` }}
              >
                <div className="relative z-10 w-[50%]">
                  <h3 className="text-base font-black text-slate-950">{category.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{category.description}</p>
                  <span className="mt-7 flex items-center gap-1 text-[11px] font-black text-[#67952F]">
                    Ver categoria
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </div>
                <div className="absolute inset-y-2 right-2 w-[46%]">
                  <Image src={category.image} alt={category.title} fill loading="eager" sizes="240px" className="object-contain object-center" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
        <FloatingMotifs className="opacity-30" />
        <div className="reveal-up relative mx-auto grid max-w-[1240px] overflow-hidden rounded-lg bg-[#F1F6E7] md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr]">
          <div className="relative min-h-[270px] lg:min-h-[340px]">
            <Image src="/images/differentials-dog-v3.png" alt="Cachorro saudável" fill loading="eager" sizes="(max-width: 767px) 90vw, (max-width: 1024px) 280px, 360px" className="object-contain object-bottom" />
          </div>
          <div className="flex flex-col justify-center px-6 pb-10 pt-4 sm:px-9 md:py-10 lg:px-10 lg:py-12">
            <Eyebrow>Qualidade que você sente</Eyebrow>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Diferenciais da NutzenPet</h2>
            <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [Leaf, "Ingredientes naturais e selecionados"],
                [ShieldCheck, "Sem corantes e aromatizantes artificiais"],
                [CheckCircle2, "Alta palatabilidade e digestibilidade"],
                [Heart, "Produzido com responsabilidade e amor"],
              ].map(([Icon, text]) => {
                const DifferenceIcon = Icon as typeof Leaf;
                return (
                  <div key={text as string} className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#9BC55B] text-[#67952F]">
                      <DifferenceIcon className="h-4 w-4" />
                    </span>
                    <p className="pt-1 text-[11px] font-bold leading-4 text-slate-700">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="blog" className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Dicas para uma vida melhor</Eyebrow>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Conteúdos / Blog</h2>
            </div>
            <BrandButton href="/blog" variant="outline">Ver todos os artigos</BrandButton>
          </div>
          <div className="mt-9 grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_240px] lg:gap-6">
            {posts.slice(0, 3).map((post, index) => (
              <article key={post.title} className="reveal-up group transition-transform duration-300 hover:-translate-y-2" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative aspect-[4/3] rounded-lg shadow-[0_8px_22px_rgba(18,63,85,.12)] transition-transform duration-300 group-hover:-translate-y-1">
                  <Image src={post.image} alt={post.title} fill loading="eager" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 310px" className="rounded-lg object-cover" />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#67952F]">{post.tag}</p>
                <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{post.title}</h3>
                <p className="mt-3 text-xs leading-5 text-slate-500">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="mt-4 flex items-center gap-1 text-[11px] font-black text-[#67952F]">
                  Ler mais <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </article>
            ))}
            <aside id="representante" className="reveal-up rounded-lg bg-[#F1F6E7] p-7 md:col-span-2 lg:col-span-1" style={{ animationDelay: "300ms" }}>
              <PackageCheck className="h-8 w-8 text-[#FE8C05]" />
              <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">Seja um representante <span className="text-[#67952F]">NutzenPet</span></h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">Faça parte do nosso time e leve saúde e qualidade para mais pets.</p>
              <BrandButton href="/contato#representante" variant="teal" className="mt-7 w-full px-4">Quero representar</BrandButton>
            </aside>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F1F6E7] px-5 sm:px-8">
        <div className="mx-auto grid min-h-[190px] max-w-[1240px] items-center gap-6 py-8 md:grid-cols-[120px_0.8fr_1.2fr] lg:grid-cols-[150px_0.8fr_1.2fr_230px] lg:py-0">
          <Image src={newsletterIcon} alt="" className="hidden h-28 w-full object-contain md:block" />
          <div>
            <h2 className="text-xl font-black text-[#124D55] sm:text-2xl">Receba dicas e novidades</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Cadastre-se e fique por dentro de lançamentos, promoções e conteúdos exclusivos.</p>
          </div>
          <form onSubmit={handleNewsletter} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter" className="sr-only">Seu melhor e-mail</label>
            <div className="relative min-w-0 flex-1">
              <Mail className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="newsletter" type="email" placeholder="Seu melhor e-mail" className="h-12 w-full rounded-full bg-white pl-12 pr-5 text-sm outline-none transition-shadow duration-300 focus:shadow-lg" />
            </div>
            <button type="submit" className="group h-12 rounded-full bg-[#67952F] px-7 text-xs font-black text-white transition-all duration-300 hover:scale-[0.97] hover:bg-[#124D55] active:scale-95">
              <span>Quero receber</span>
            </button>
          </form>
          <Image src={newsletterDog} alt="Cachorro NutzenPet" className="hidden h-[190px] w-full self-end object-contain lg:block" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
