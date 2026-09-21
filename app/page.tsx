"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Mail,
  PackageCheck,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandButton } from "./components/brand-button";
import { FloatingMotifs } from "./components/floating-motifs";
import { OpportunityBanners } from "./components/opportunity-banners";
import { ProductCarousel } from "./components/product-carousel";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { featuredProducts } from "./data/products";
import { posts } from "./data/posts";
import carePets from "../fotos-sobre/gato-cachorro.jpg";

const benefits = [
  { icon: Leaf, value: "ZERO", label: "Corantes e aromatizantes" },
  { icon: Sparkles, value: "100%", label: "Antioxidantes naturais" },
  { icon: ShieldCheck, value: "ALTO", label: "Teor de proteína" },
];

const heroCampaigns = [
  {
    eyebrow: "Nutzen Club + kits",
    title: "Monte seu kit e cuide do seu pet",
    accent: "todos os meses.",
    description: "Combine produtos, organize a recorrência e mantenha a alimentação do seu pet sempre em dia.",
    primaryLabel: "Conhecer o clube",
    primaryHref: "/nutzen-club",
    secondaryLabel: "Montar meu kit",
    secondaryHref: "/produto#kits",
    product: featuredProducts[0],
    visual: "club" as const,
    icon: CalendarDays,
  },
  {
    eyebrow: "Nutrição que eles merecem",
    title: "Nutrição de verdade para uma vida mais",
    accent: "feliz e saudável.",
    description: "Alimentos completos e nutritivos para cães e gatos em todas as fases da vida.",
    primaryLabel: "Ver produtos",
    primaryHref: "/produto",
    secondaryLabel: "Saiba mais sobre nós",
    secondaryHref: "/sobre",
    product: featuredProducts[1],
    visual: "pets" as const,
    icon: PawPrint,
  },
  {
    eyebrow: "Novos tamanhos",
    title: "Mais opções para montar a rotina",
    accent: "do seu jeito.",
    description: "Embalagens de 1 kg e 3 kg chegam para completar as linhas e facilitar a criação do seu kit.",
    primaryLabel: "Conhecer as linhas",
    primaryHref: "/produto",
    secondaryLabel: "Ver opções de kit",
    secondaryHref: "/produto#kits",
    product: featuredProducts[2],
    visual: "sizes" as const,
    icon: PackageCheck,
  },
];

function Eyebrow({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#3E1255] ${centered ? "justify-center" : ""}`}>
      {children}
      <Heart className="h-3.5 w-3.5" />
    </p>
  );
}

export default function Home() {
  const [activeCampaign, setActiveCampaign] = useState(0);
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveCampaign((current) => (current + 1) % heroCampaigns.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setNewsletterSent(true);
  }

  function moveCampaign(direction: -1 | 1) {
    setActiveCampaign((current) => (current + direction + heroCampaigns.length) % heroCampaigns.length);
  }

  const campaign = heroCampaigns[activeCampaign];
  const CampaignIcon = campaign.icon;

  return (
    <main className="min-h-screen bg-[#fffef9] text-slate-900">
      <SiteHeader />

      <section id="inicio" className="relative bg-[#F5EFF8] px-3 pb-8 pt-4 sm:px-5 sm:pt-6 lg:pb-10">
        <FloatingMotifs className="hidden text-[#D9C7E3] opacity-70 xl:block" />
        <div className="relative mx-auto max-w-[1340px] overflow-hidden rounded-lg bg-[#3E1255] px-5 py-6 text-white shadow-[0_20px_55px_rgba(62,18,85,.16)] sm:px-8 sm:py-12 lg:py-14">
          <FloatingMotifs className="text-white opacity-10" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div key={campaign.eyebrow} className="relative z-10 text-center lg:text-left">
            <p className="reveal-up flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C7E3] lg:justify-start">
              <Sparkles className="h-3.5 w-3.5" /> {campaign.eyebrow}
            </p>
            <h1
              className="reveal-up mx-auto mt-4 max-w-[570px] text-[32px] font-black leading-[1.06] text-white sm:text-[54px] lg:mx-0 lg:text-[58px]"
              style={{ animationDelay: "80ms" }}
            >
              {campaign.title} <span className="text-[#FE8C05]">{campaign.accent}</span>
            </h1>
            <p
              className="reveal-up mx-auto mt-5 max-w-[460px] text-sm leading-6 text-white/70 lg:mx-0"
              style={{ animationDelay: "160ms" }}
            >
              {campaign.description}
            </p>
            <div
              className="reveal-up mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: "220ms" }}
            >
              <BrandButton href={campaign.primaryHref} variant="orange">{campaign.primaryLabel}</BrandButton>
              <BrandButton href={campaign.secondaryHref} variant="outline">{campaign.secondaryLabel}</BrandButton>
            </div>
          </div>

          <div
            className="reveal-up relative mx-auto h-[220px] w-full max-w-[690px] sm:h-[520px]"
            style={{ animationDelay: "150ms" }}
          >
            <div key={campaign.visual} className="reveal-up absolute inset-0" style={{ animationDuration: "620ms" }}>
              {campaign.visual === "club" && (
                <>
                  <span className="absolute bottom-[12%] left-1/2 h-[76%] w-[76%] -translate-x-1/2 rounded-full bg-white/10" aria-hidden="true" />
                  <span className="absolute bottom-[8%] left-[12%] h-4 w-[76%] rounded-[50%] bg-black/20 blur-md" aria-hidden="true" />
                  <div className="absolute inset-x-[2%] bottom-[8%] top-[3%] flex items-end justify-center">
                    {featuredProducts.map((product, index) => (
                      <div key={product.slug} className={`float-soft relative h-[84%] w-[37%] shrink-0 ${index === 0 ? "z-[1] -mr-[13%] -rotate-6" : index === 1 ? "z-[3] h-[96%]" : "z-[2] -ml-[13%] rotate-6"}`} style={{ animationDelay: `${index * 180}ms` }}>
                        <Image src={product.images[1]} alt={product.name} fill preload={index === 1} loading={index === 1 ? undefined : "eager"} sizes="(max-width: 1024px) 34vw, 250px" className="object-contain object-bottom drop-shadow-[0_20px_18px_rgba(0,0,0,.24)]" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {campaign.visual === "pets" && (
                <>
                  <span className="absolute bottom-[13%] left-[5%] h-[72%] w-[64%] rounded-full bg-white/10" aria-hidden="true" />
                  <span className="absolute bottom-[2%] left-[8%] h-4 w-[58%] rounded-[50%] bg-black/20 blur-md" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 z-[1] h-[96%] w-[70%]"><Image src="/images/hero-pets-v3.png" alt="Cachorro e gato saudáveis" fill preload sizes="(max-width: 1024px) 65vw, 440px" className="object-contain object-bottom" /></div>
                  <div className="float-soft absolute -bottom-[2%] right-0 z-10 h-[82%] w-[48%]"><Image src={campaign.product.images[1]} alt={campaign.product.name} fill loading="eager" sizes="(max-width: 1024px) 44vw, 330px" className="object-contain object-bottom drop-shadow-[0_20px_18px_rgba(0,0,0,.22)]" /></div>
                </>
              )}

              {campaign.visual === "sizes" && (
                <>
                  <span className="absolute inset-x-[4%] bottom-[10%] top-[10%] rounded-full bg-white/10" aria-hidden="true" />
                  <div className="absolute inset-x-[3%] bottom-[11%] top-[5%] grid grid-cols-3 gap-1 sm:gap-3">
                    {featuredProducts.map((product, index) => (
                      <div key={product.slug} className={`relative flex min-w-0 flex-col items-center ${index === 1 ? "sm:-translate-y-5" : ""}`}>
                        <span className="relative z-10 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white sm:text-[10px]">{index === 0 ? "1 kg" : index === 1 ? "3 kg" : "Família"}</span>
                        <div className="float-soft relative w-full flex-1"><Image src={product.images[1]} alt={`${product.name} - ${index === 0 ? "1 kg" : index === 1 ? "3 kg" : "tamanho família"}`} fill loading="eager" sizes="(max-width: 1024px) 30vw, 210px" className="object-contain object-bottom drop-shadow-[0_18px_16px_rgba(0,0,0,.24)]" /></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {campaign.visual !== "sizes" && <span className="sonar sonar-orange absolute right-[10%] top-[7%] z-20 grid h-11 w-11 place-items-center rounded-full bg-[#FE8C05] text-white"><CampaignIcon className="relative z-10 h-5 w-5" /></span>}
            <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:left-auto sm:right-[4%] sm:translate-x-0" aria-label="Controles do destaque">
              <button type="button" onClick={() => moveCampaign(-1)} aria-label="Destaque anterior" className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white text-[#3E1255] shadow-[0_8px_20px_rgba(0,0,0,.16)] transition-all duration-300 hover:scale-90 hover:bg-[#FE8C05] hover:text-white active:scale-75"><ChevronLeft className="h-5 w-5" /></button>
              <div className="flex items-center gap-1.5 px-1">
                {heroCampaigns.map((item, index) => <button key={item.eyebrow} type="button" onClick={() => setActiveCampaign(index)} aria-label={`Mostrar ${item.eyebrow}`} aria-current={activeCampaign === index} className={`h-2.5 rounded-full transition-all duration-300 ${activeCampaign === index ? "w-8 bg-[#FE8C05]" : "w-2.5 bg-white/30 hover:bg-white/60"}`} />)}
              </div>
              <button type="button" onClick={() => moveCampaign(1)} aria-label="Próximo destaque" className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white text-[#3E1255] shadow-[0_8px_20px_rgba(0,0,0,.16)] transition-all duration-300 hover:scale-90 hover:bg-[#FE8C05] hover:text-white active:scale-75"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section id="produtos" className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="reveal-up flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Os favoritos</Eyebrow>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Produtos em destaque</h2>
            </div>
            <BrandButton href="/produto" variant="outline">Ver todos os produtos</BrandButton>
          </div>
          <ProductCarousel products={featuredProducts} className="mt-7" />

        </div>
      </section>

      <section
        id="rotina"
        className="relative min-h-[520px] overflow-hidden text-white sm:min-h-[500px]"
      >
        <Image src={carePets} alt="Cachorro e gato em uma rotina de cuidado" fill quality={90} sizes="100vw" className="object-cover object-[52%_center] sm:object-[center_74%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,5,29,.98)_0%,rgba(62,18,85,.9)_70%,rgba(62,18,85,.5)_100%)] sm:bg-[linear-gradient(90deg,rgba(20,5,29,.97)_0%,rgba(62,18,85,.9)_42%,rgba(62,18,85,.28)_72%,rgba(20,5,29,.08)_100%)]" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1240px] items-center px-5 py-10 sm:min-h-[500px] sm:px-8 sm:py-14">
          <div className="reveal-up max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD39C]"><Heart className="h-4 w-4" /> Escolhas que acompanham cada fase</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Uma rotina mais simples para você. Mais cuidado para eles.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 sm:mt-5 sm:leading-7">Encontre a nutrição certa, monte seu kit e programe as próximas entregas sem perder o ritmo do seu pet.</p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <BrandButton href="/produto" variant="orange">Escolher a nutrição</BrandButton>
              <Link href="/nutzen-club" className="group flex h-12 items-center justify-center gap-3 rounded-full border-2 border-white/65 px-6 text-xs font-black text-white transition-colors duration-300 hover:bg-white hover:text-[#3E1255]">
                Conhecer o Nutzen Club <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </div>
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-2 border-t border-white/20 pt-5 text-center text-[10px] sm:mt-9 sm:gap-5 sm:text-left sm:text-xs">
              <div className="reveal-up min-w-0" style={{ animationDelay: "80ms" }}><strong className="block text-base text-[#FE8C05] sm:text-lg">3 linhas</strong><span className="leading-4 text-white/65">para cães e gatos</span></div>
              <div className="reveal-up min-w-0" style={{ animationDelay: "150ms" }}><strong className="block text-base text-[#FE8C05] sm:text-lg">1, 3 e 15 kg</strong><span className="leading-4 text-white/65">opções para a rotina</span></div>
              <div className="reveal-up min-w-0" style={{ animationDelay: "220ms" }}><strong className="block text-base text-[#FE8C05] sm:text-lg">Todo mês</strong><span className="leading-4 text-white/65">com o Nutzen Club</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-16">
        <div className="reveal-up mx-auto max-w-[1240px] rounded-lg bg-[#F5EFF8] px-3 py-6 shadow-[0_12px_38px_rgba(62,18,85,.06)] sm:px-8 sm:py-9">
          <h2 className="mx-auto max-w-[220px] text-center text-lg font-black text-slate-900 sm:max-w-none">Benefícios que fazem a diferença</h2>
          <div className="mt-6 grid grid-cols-3 gap-0 sm:mt-7">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={benefit.value} className={`reveal-up flex min-w-0 flex-col items-center justify-start gap-3 px-2 text-center md:flex-row md:justify-center md:gap-4 md:px-4 md:text-left ${index > 0 ? "border-l border-[#E2D4E9]" : ""}`} style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="sonar sonar-active sonar-purple relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#6F3B85] text-white sm:h-14 sm:w-14 md:h-16 md:w-16">
                    <BenefitIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-black leading-none text-[#3E1255] sm:text-xl md:text-2xl">{benefit.value}</p>
                    <p className="mx-auto mt-1 max-w-24 text-[10px] font-bold leading-4 text-slate-800 sm:max-w-28 sm:text-xs md:mx-0 md:max-w-32">{benefit.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <OpportunityBanners className="pt-0 sm:pt-0" />

      <section className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
        <FloatingMotifs className="opacity-30" />
        <div className="reveal-up relative mx-auto grid max-w-[1240px] overflow-hidden rounded-lg bg-[#F5EFF8] md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr]">
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
                  <div key={text as string} className="reveal-up flex items-start gap-3">
                    <span className="sonar sonar-purple relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#8A5AA0] bg-[#F5EFF8] text-[#3E1255]">
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
          <div className="reveal-up flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#3E1255]">{post.tag}</p>
                <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{post.title}</h3>
                <p className="mt-3 text-xs leading-5 text-slate-500">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="mt-4 flex items-center gap-1 text-[11px] font-black text-[#3E1255]">
                  Ler mais <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </article>
            ))}
            <aside id="representante" className="reveal-up rounded-lg bg-[#F5EFF8] p-7 md:col-span-2 lg:col-span-1" style={{ animationDelay: "300ms" }}>
              <span className="sonar sonar-orange relative grid h-11 w-11 place-items-center rounded-full bg-[#FFF0DE] text-[#FE8C05]">
                <PackageCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950">Seja um lojista parceiro <span className="text-[#3E1255]">NutzenPet</span></h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">Faça parte do nosso time e leve saúde e qualidade para mais pets.</p>
              <BrandButton href="/seja-um-lojista-parceiro" variant="orange" className="mt-7 w-full px-4">Quero ser parceiro</BrandButton>
            </aside>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F5EFF8] px-5 sm:px-8">
        <div className="reveal-up mx-auto grid min-h-[190px] max-w-[1240px] items-center gap-6 py-8 md:grid-cols-[120px_0.8fr_1.2fr] lg:grid-cols-[150px_0.8fr_1.2fr_230px] lg:py-0">
          <span className="sonar sonar-purple relative hidden h-20 w-20 place-items-center rounded-full bg-[#3E1255] text-white shadow-[0_14px_30px_rgba(62,18,85,.18)] md:grid"><Mail className="relative z-10 h-9 w-9" /></span>
          <div>
            <h2 className="text-xl font-black text-[#3E1255] sm:text-2xl">Receba dicas e novidades</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Cadastre-se e fique por dentro de lançamentos, promoções e conteúdos exclusivos.</p>
          </div>
          {newsletterSent ? (
            <div role="status" className="flex min-h-12 items-center gap-3 rounded-lg border border-[#D9C7E3] bg-white px-5 text-sm font-bold text-[#3E1255]">
              <CheckCircle2 className="h-5 w-5 text-[#FE8C05]" /> Cadastro demonstrativo realizado.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter" className="sr-only">Seu melhor e-mail</label>
              <div className="relative min-w-0 flex-1">
                <Mail className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="newsletter" required type="email" placeholder="Seu melhor e-mail" className="h-12 w-full rounded-full bg-white pl-12 pr-5 text-sm outline-none transition-shadow duration-300 focus:shadow-lg" />
              </div>
              <button type="submit" className="group h-12 rounded-full bg-[#3E1255] px-7 text-xs font-black text-white transition-all duration-300 hover:scale-[0.97] hover:bg-[#561D70] active:scale-95">
                <span>Quero receber</span>
              </button>
            </form>
          )}
          <div className="relative hidden h-[190px] w-full self-end lg:block"><Image src="/images/differentials-dog-v3.png" alt="Cachorro NutzenPet" fill sizes="230px" className="object-contain object-bottom" /></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
