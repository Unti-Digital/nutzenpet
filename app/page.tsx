"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PawPrint,
  Phone,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import benefitHundred from "../nutzenpet-assets-individuais/beneficio-100.png";
import benefitHigh from "../nutzenpet-assets-individuais/beneficio-alto.png";
import benefitZero from "../nutzenpet-assets-individuais/beneficio-zero.png";
import blogExercise from "../nutzenpet-assets-individuais/blog-exercicios-cachorro.png";
import blogCat from "../nutzenpet-assets-individuais/blog-gato-cuidados.png";
import blogFood from "../nutzenpet-assets-individuais/blog-racao-cachorro.png";
import categoryFood from "../nutzenpet-assets-individuais/categoria-alimentacao.png";
import categoryCare from "../nutzenpet-assets-individuais/categoria-higiene-cuidados.png";
import categoryTreats from "../nutzenpet-assets-individuais/categoria-petiscos.png";
import categorySupplements from "../nutzenpet-assets-individuais/categoria-suplementos.png";
import differenceDog from "../nutzenpet-assets-individuais/diferencial-cachorro.png";
import differenceCat from "../nutzenpet-assets-individuais/diferencial-gato.png";
import heroPets from "../nutzenpet-assets-individuais/hero-cachorro-gato.png";
import heroProducts from "../nutzenpet-assets-individuais/hero-produtos.png";
import newsletterDog from "../nutzenpet-assets-individuais/newsletter-cachorro.png";
import newsletterIcon from "../nutzenpet-assets-individuais/newsletter-icon.png";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#essencia" },
  { label: "Produtos", href: "#produtos", dropdown: true },
  { label: "Blog", href: "#blog" },
  { label: "Contato", href: "#contato" },
  { label: "Seja um representante", href: "#representante" },
];

const products: Array<{
  title: string;
  detail: string;
  price: string;
  image: StaticImageData;
  imageClass: string;
}> = [
  {
    title: "Ração Nutzenpet Gatos Adultos Salmão",
    detail: "1,5 kg",
    price: "R$ 69,90",
    image: heroProducts,
    imageClass: "object-contain scale-[1.12] translate-x-8",
  },
  {
    title: "Ração Nutzenpet Cães Adultos Frango & Arroz",
    detail: "2,5 kg",
    price: "R$ 89,90",
    image: heroProducts,
    imageClass: "object-contain scale-[1.12] -translate-x-8",
  },
  {
    title: "Ração Nutzenpet Cães Filhotes",
    detail: "2,5 kg",
    price: "R$ 89,90",
    image: categoryFood,
    imageClass: "object-cover",
  },
  {
    title: "Petiscos Nutzenpet Bifinhos de Frango",
    detail: "150 g",
    price: "R$ 29,90",
    image: categoryTreats,
    imageClass: "object-cover",
  },
  {
    title: "Suplemento Nutzenpet Ômega 3",
    detail: "60 cápsulas",
    price: "R$ 49,90",
    image: categorySupplements,
    imageClass: "object-cover",
  },
];

const categories = [
  {
    title: "Alimentação",
    description: "Rações completas e balanceadas para todas as idades.",
    image: categoryFood,
    color: "bg-[#EDF4DE]",
  },
  {
    title: "Petiscos",
    description: "Saborosos e saudáveis para recompensar com amor.",
    image: categoryTreats,
    color: "bg-[#FFF0DD]",
  },
  {
    title: "Suplementos",
    description: "Mais saúde e energia para o dia a dia.",
    image: categorySupplements,
    color: "bg-[#EDF4DE]",
  },
  {
    title: "Higiene e cuidados",
    description: "Produtos que cuidam com carinho e segurança.",
    image: categoryCare,
    color: "bg-[#FFF0DD]",
  },
];

const posts = [
  {
    tag: "Nutrição",
    title: "Como escolher a ração ideal para o seu cão",
    image: blogFood,
  },
  {
    tag: "Bem-estar",
    title: "5 dicas para manter seu gato saudável e feliz",
    image: blogCat,
  },
  {
    tag: "Comportamento",
    title: "Exercícios que fortalecem o vínculo com seu pet",
    image: blogExercise,
  },
];

const smoothButton =
  "transition-all duration-300 hover:scale-105 hover:bg-opacity-90 active:scale-95";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#inicio" aria-label="Ir para o início" className="group shrink-0">
      <span
        className={`flex items-center text-[27px] font-black leading-none sm:text-[32px] ${
          light ? "text-white" : "text-[#101817]"
        }`}
      >
        nutzen<span className="text-[#6F9E37]">pet</span>
        <PawPrint
          aria-hidden="true"
          className="ml-1 -mt-3 h-6 w-6 rotate-12 fill-[#6F9E37] text-[#6F9E37] transition-transform duration-300 group-hover:rotate-0"
        />
      </span>
      <span
        className={`mt-1 block text-[9px] font-semibold ${
          light ? "text-white/75" : "text-[#657064]"
        }`}
      >
        nutrição que eles merecem <Heart className="inline h-2.5 w-2.5 fill-[#FE8C05] text-[#FE8C05]" />
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <p className="flex items-center gap-1.5 text-sm font-bold text-[#6F9E37] max-sm:justify-center">
        {eyebrow} <Heart className="h-4 w-4" aria-hidden="true" />
      </p>
      <h2 className="mt-1 text-3xl font-black leading-tight text-[#101817] sm:text-4xl lg:text-[42px]">
        {title}
      </h2>
    </div>
  );
}

function ProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  return (
    <article
      className="group flex min-h-[425px] flex-col rounded-lg border border-[#EEE9DC] bg-white p-4 shadow-[0_12px_30px_rgba(31,48,43,0.07)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-56 overflow-hidden rounded-md bg-[#F7F7EF]">
        <Image
          src={product.image}
          alt={product.title}
          loading="eager"
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 240px"
          className={`${product.imageClass} transition-transform duration-500 group-hover:scale-[1.06]`}
        />
        <button
          type="button"
          aria-label={`Favoritar ${product.title}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#124D55] shadow-sm transition-all duration-300 hover:scale-110 hover:text-[#FE8C05] active:scale-95"
        >
          <Heart className="h-[18px] w-[18px]" />
        </button>
      </div>
      <h3 className="mt-4 min-h-12 text-sm font-bold leading-5 text-[#1C2826]">
        {product.title}
      </h3>
      <p className="mt-1 text-xs text-[#64706D]">{product.detail}</p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <strong className="text-base font-black text-[#101817]">{product.price}</strong>
        <button
          type="button"
          aria-label={`Adicionar ${product.title} à sacola`}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#F7DCA9] text-[#124D55] transition-all duration-300 hover:scale-110 hover:bg-[#FE8C05] hover:text-white active:scale-95"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#FCFBF6] font-sans text-[#101817]">
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-soft {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .fade-up { opacity: 0; animation: fade-up .75s cubic-bezier(.2,.8,.2,1) forwards; }
        .float-soft { animation: float-soft 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .float-soft { opacity: 1; animation: none; transform: none; }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-[#ECE9DF] bg-[#FCFBF6]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[82px] max-w-[1340px] items-center justify-between px-5 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1 text-[13px] font-bold transition-colors duration-300 hover:text-[#6F9E37] ${
                  index === 0 ? "text-[#6F9E37]" : "text-[#16201F]"
                }`}
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {[Search, UserRound].map((Icon, index) => (
              <button
                key={index}
                type="button"
                aria-label={index === 0 ? "Buscar" : "Minha conta"}
                className="grid h-10 w-10 place-items-center rounded-full text-[#16201F] transition-colors duration-300 hover:bg-[#EDF4DE] hover:text-[#6F9E37]"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
            <button
              type="button"
              aria-label="Abrir sacola"
              className="relative grid h-10 w-10 place-items-center rounded-full text-[#16201F] transition-colors duration-300 hover:bg-[#EDF4DE] hover:text-[#6F9E37]"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-[#6F9E37] text-[9px] font-black text-white">1</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE7CE] text-[#124D55] transition-colors duration-300 hover:bg-[#EDF4DE] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={`overflow-hidden border-t border-[#ECE9DF] bg-[#FCFBF6] transition-all duration-300 lg:hidden ${
            menuOpen ? "max-h-[430px] opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
        >
          <nav className="mx-auto grid max-w-[1340px] gap-1 px-5 py-4" aria-label="Navegação mobile">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-[#EDF4DE] hover:text-[#6F9E37]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="inicio" className="relative px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:pt-16">
        <div className="pointer-events-none absolute left-[-70px] top-20 h-44 w-44 rounded-full border border-[#DCE8C7]" />
        <div className="mx-auto grid max-w-[1340px] items-center gap-10 lg:grid-cols-[.88fr_1.12fr]">
          <div className="relative z-10 text-center lg:text-left">
            <div className="fade-up inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-[#6F9E37]">
              <PawPrint className="h-4 w-4 fill-current" /> Nutzenpet
            </div>
            <h1 className="fade-up mx-auto mt-4 max-w-[610px] text-[41px] font-black leading-[1.03] sm:text-[58px] md:text-[68px] lg:mx-0 lg:text-[72px]" style={{ animationDelay: "80ms" }}>
              Nutrição de verdade para uma vida mais <span className="text-[#6F9E37]">feliz e saudável.</span>
            </h1>
            <p className="fade-up mx-auto mt-6 max-w-[470px] text-base leading-7 text-[#4D5A57] lg:mx-0" style={{ animationDelay: "160ms" }}>
              Alimentos naturais e nutritivos para cães e gatos em todas as fases da vida.
            </p>
            <div className="fade-up mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "240ms" }}>
              <a href="#produtos" className={`inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#6F9E37] px-7 text-sm font-black text-white shadow-[0_14px_28px_rgba(75,120,31,.22)] ${smoothButton}`}>
                Ver produtos <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#essencia" className={`inline-flex h-13 items-center justify-center rounded-full border-2 border-[#6F9E37] bg-white px-7 text-sm font-black text-[#182220] ${smoothButton} hover:bg-[#F1F6E8]`}>
                Saiba mais sobre nós
              </a>
            </div>

            <div className="fade-up mt-10 grid gap-4 text-left sm:grid-cols-3" style={{ animationDelay: "320ms" }}>
              {[
                [Leaf, "Ingredientes naturais e selecionados"],
                [Heart, "Feito com amor para o seu pet"],
                [Truck, "Entrega para todo o Brasil"],
              ].map(([Icon, text]) => {
                const PerkIcon = Icon as typeof Leaf;
                return (
                  <div key={text as string} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#A9C281] text-[#6F9E37]">
                      <PerkIcon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold leading-4 text-[#384441]">{text as string}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fade-up relative mx-auto min-h-[440px] w-full max-w-[720px] sm:min-h-[560px]" style={{ animationDelay: "180ms" }}>
            <div className="absolute left-[5%] top-[3%] h-[88%] w-[74%] rounded-[46%] bg-[#EAF1D9]" />
            <div className="absolute left-0 top-[4%] z-10 h-[86%] w-[67%] overflow-hidden rounded-[46%_46%_42%_42%] shadow-[0_24px_70px_rgba(41,61,27,.16)]">
              <Image src={heroPets} alt="Cachorro e gato saudáveis" fill priority sizes="(max-width: 1024px) 72vw, 530px" className="object-cover" />
            </div>
            <div className="float-soft absolute bottom-[1%] right-0 z-20 h-[56%] w-[57%] overflow-hidden rounded-[24px] border-[7px] border-[#FCFBF6] shadow-[0_24px_60px_rgba(30,49,35,.22)] sm:right-[1%]">
              <Image src={heroProducts} alt="Rações Nutzenpet para cães e gatos" fill priority sizes="(max-width: 1024px) 55vw, 410px" className="object-cover" />
            </div>
            <Heart className="absolute right-[8%] top-[3%] h-8 w-8 rotate-12 text-[#6F9E37]" />
            <Leaf className="absolute right-[1%] top-[26%] h-8 w-8 -rotate-12 text-[#6F9E37]" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-[1340px] overflow-hidden rounded-lg bg-[#F1F6E8] px-5 py-6 shadow-[0_16px_45px_rgba(31,48,43,.07)] sm:px-8">
          <h2 className="text-center text-lg font-black">Benefícios que fazem a diferença</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[benefitZero, benefitHundred, benefitHigh].map((image, index) => (
              <div key={index} className={`group flex min-h-[170px] items-center justify-center overflow-hidden ${index > 0 ? "sm:border-l sm:border-[#D6E2C2]" : ""}`}>
                <Image src={image} alt={["Zero corantes e aromatizantes", "100% antioxidantes naturais", "Alto teor de proteína"][index]} loading="eager" className="h-[165px] w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="essencia" className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1340px] items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative mx-auto h-[390px] w-full max-w-[560px] sm:h-[470px]">
            <div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden rounded-lg bg-[#EDF4DE]">
              <Image src={differenceDog} alt="Cachorro saudável Nutzenpet" loading="eager" fill sizes="(max-width: 1024px) 80vw, 500px" className="object-cover" />
            </div>
            <div className="absolute bottom-5 right-0 h-[52%] w-[45%] overflow-hidden rounded-lg border-[6px] border-white shadow-xl">
              <Image src={differenceCat} alt="Gato saudável Nutzenpet" loading="eager" fill sizes="240px" className="object-cover" />
            </div>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#6F9E37]">Nossa essência</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#124D55] sm:text-5xl">Cuidado que começa no campo e chega à tigela</h2>
            <p className="mx-auto mt-6 max-w-[600px] text-base leading-7 text-[#5D6865] lg:mx-0">
              A NutzenPet nasceu para oferecer alimentos naturais e nutritivos, unindo ingredientes selecionados, cuidado de verdade e uma nutrição completa para pets mais felizes e saudáveis.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Ingredientes de alta qualidade", "Fórmulas pensadas para cada fase", "Sabor que eles amam", "Responsabilidade em cada escolha"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md bg-[#F7F8F1] p-3 text-left text-sm font-bold transition-colors duration-300 hover:bg-[#EDF4DE]">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6F9E37]" /> {item}
                </div>
              ))}
            </div>
            <a href="#produtos" className={`mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white shadow-[0_14px_28px_rgba(254,140,5,.22)] ${smoothButton}`}>
              Saiba mais <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="produtos" className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1340px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Os favoritos" title="Produtos em destaque" />
            <a href="#categorias" className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-[#E2DECF] px-6 text-xs font-black transition-all duration-300 hover:border-[#6F9E37] hover:bg-[#EDF4DE] active:scale-95">
              Ver todos os produtos <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product, index) => <ProductCard key={product.title} product={product} index={index} />)}
          </div>
        </div>
      </section>

      <section id="categorias" className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1340px]">
          <SectionHeading eyebrow="Para cada fase, uma nutrição completa" title="Categorias" centered />
          <span className="mx-auto mt-3 block h-1 w-24 rounded-full bg-[#6F9E37]" />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <article key={category.title} className={`group relative min-h-[220px] overflow-hidden rounded-lg p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${category.color}`}>
                <div className="relative z-10 max-w-[55%]">
                  <h3 className="text-lg font-black">{category.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#576360]">{category.description}</p>
                  <a href="#produtos" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-[#6F9E37] transition-colors duration-300 hover:text-[#124D55]">
                    Ver categoria <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="absolute bottom-0 right-0 h-[90%] w-[54%] overflow-hidden">
                  <Image src={category.image} alt={category.title} loading="eager" fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1340px] items-center overflow-hidden rounded-lg bg-[#F1F6E8] lg:grid-cols-[390px_1fr]">
          <div className="relative h-[330px] overflow-hidden lg:h-full">
            <Image src={differenceDog} alt="Qualidade que seu pet sente" loading="eager" fill sizes="(max-width: 1024px) 100vw, 390px" className="object-cover object-top" />
          </div>
          <div className="px-6 py-10 sm:px-10 lg:px-12">
            <p className="text-sm font-bold text-[#6F9E37]">Qualidade que você sente</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Diferenciais da <span className="text-[#6F9E37]">Nutzenpet</span></h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [Leaf, "Ingredientes naturais e selecionados"],
                [ShieldCheck, "Sem corantes e aromatizantes artificiais"],
                [CheckCircle2, "Alta palatabilidade e melhor digestibilidade"],
                [Heart, "Produzido com responsabilidade e amor"],
              ].map(([Icon, text]) => {
                const FeatureIcon = Icon as typeof Leaf;
                return (
                  <div key={text as string} className="group flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#9ABA6F] text-[#6F9E37] transition-colors duration-300 group-hover:bg-[#6F9E37] group-hover:text-white">
                      <FeatureIcon className="h-5 w-5" />
                    </span>
                    <p className="pt-1 text-xs font-bold leading-4">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="blog" className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1340px]">
          <div className="grid gap-6 lg:grid-cols-[1fr_250px]">
            <div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <SectionHeading eyebrow="Dicas para uma vida melhor" title="Conteúdos / Blog" />
                <a href="#blog" className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-[#E2DECF] px-6 text-xs font-black transition-all duration-300 hover:border-[#6F9E37] hover:bg-[#EDF4DE] active:scale-95">
                  Ver todos os artigos <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {posts.map((post) => (
                  <article key={post.title} className="group overflow-hidden rounded-lg border border-[#EEE9DC] bg-white shadow-[0_12px_30px_rgba(31,48,43,.07)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={post.image} alt={post.title} loading="eager" fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <span className="rounded-full bg-[#EDF4DE] px-3 py-1 text-[10px] font-black text-[#6F9E37]">{post.tag}</span>
                      <h3 className="mt-4 text-base font-black leading-5">{post.title}</h3>
                      <p className="mt-3 text-xs leading-5 text-[#65706D]">Pequenos cuidados que fazem toda a diferença na rotina e no bem-estar do seu pet.</p>
                      <a href="#blog" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#6F9E37] transition-colors duration-300 hover:text-[#124D55]">Ler mais <ArrowRight className="h-3.5 w-3.5" /></a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside id="representante" className="flex flex-col rounded-lg bg-[#EDF4DE] p-7 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              <PawPrint className="h-9 w-9 fill-[#6F9E37] text-[#6F9E37]" />
              <h3 className="mt-5 text-2xl font-black leading-tight">Seja um representante <span className="text-[#6F9E37]">Nutzenpet</span></h3>
              <p className="mt-4 text-sm leading-6 text-[#5D6865]">Faça parte do nosso time e leve saúde e qualidade para mais pets.</p>
              <a href="#contato" className={`mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#6F9E37] px-5 text-xs font-black text-white ${smoothButton}`}>
                Quero representar <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F1F6E8] px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[1340px] items-center gap-7 md:grid-cols-[.9fr_1.1fr] lg:grid-cols-[.9fr_1.25fr_270px]">
          <div className="flex items-center gap-4">
            <Image src={newsletterIcon} alt="Ícone de newsletter" loading="eager" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            <div>
              <h2 className="text-xl font-black text-[#527E27] sm:text-2xl">Receba dicas e novidades</h2>
              <p className="mt-2 text-xs leading-5 text-[#5D6865]">Fique por dentro de lançamentos, promoções e conteúdos exclusivos.</p>
            </div>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">Seu melhor e-mail</label>
            <input id="newsletter-email" type="email" placeholder="Seu melhor e-mail" className="h-13 min-w-0 flex-1 rounded-full border border-transparent bg-white px-6 text-sm outline-none transition-colors duration-300 placeholder:text-[#A2A9A5] focus:border-[#6F9E37]" />
            <button type="submit" className={`h-13 rounded-full bg-[#6F9E37] px-7 text-xs font-black text-white ${smoothButton}`}>Quero receber</button>
          </form>
          <Image src={newsletterDog} alt="Cachorro curioso" loading="eager" className="hidden h-[170px] w-full self-end object-contain lg:block" />
        </div>
      </section>

      <footer id="contato" className="bg-[#124D55] px-5 pt-12 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1340px] gap-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">Alimentos naturais e nutritivos para cães e gatos em todas as fases da vida.</p>
            <div className="mt-5 flex gap-2">
              {[Camera, MessageCircle, Play].map((Icon, index) => (
                <a key={index} href="#contato" aria-label={["Instagram", "Facebook", "YouTube"][index]} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition-colors duration-300 hover:border-[#FE8C05] hover:bg-[#FE8C05]">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black">Institucional</h3>
            <nav className="mt-4 grid gap-2 text-xs text-white/70">
              {["Sobre nós", "Seja um representante", "Política de privacidade", "Termos de uso"].map((item) => <a key={item} href="#essencia" className="transition-colors duration-300 hover:text-white">{item}</a>)}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-black">Atendimento</h3>
            <nav className="mt-4 grid gap-2 text-xs text-white/70">
              {["Central de ajuda", "Meus pedidos", "Prazo e entrega", "Fale conosco"].map((item) => <a key={item} href="#contato" className="transition-colors duration-300 hover:text-white">{item}</a>)}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-black">Contato</h3>
            <div className="mt-4 grid gap-3 text-xs text-white/70">
              <a href="tel:+5511999999999" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Phone className="h-4 w-4 text-[#FE8C05]" /> (11) 99999-9999</a>
              <a href="mailto:contato@nutzenpet.com.br" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Mail className="h-4 w-4 text-[#FE8C05]" /> contato@nutzenpet.com.br</a>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FE8C05]" /> São Paulo - SP</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1340px] flex-col justify-between gap-2 border-t border-white/10 py-5 text-[11px] text-white/60 sm:flex-row">
          <span>© 2026 Nutzenpet. Todos os direitos reservados.</span>
          <span>Desenvolvido com cuidado para pets felizes.</span>
        </div>
      </footer>
    </main>
  );
}
