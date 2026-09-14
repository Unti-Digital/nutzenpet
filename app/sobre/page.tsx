import Image from "next/image";
import {
  CheckCircle2,
  FlaskConical,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Truck,
} from "lucide-react";
import { BrandButton } from "../components/brand-button";
import { FloatingMotifs } from "../components/floating-motifs";
import { PhotoRotator, type RotatingPhoto } from "../components/photo-rotator";
import { ProductCard } from "../components/product-card";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { products } from "../data/products";
import essencePair from "../../fotos-sobre/cachorro-gato.jpg";
import essenceDog from "../../fotos-sobre/cahorro.jpg";
import essenceFriends from "../../fotos-sobre/gato-cachorro.jpg";
import borderCollie from "../../fotos-extras/border collie.png";
import pitbull from "../../fotos-extras/pitbull.png";
import rottweiler from "../../fotos-extras/rottweiler.png";
import catOne from "../../fotos-sobre/Gato-01.webp";
import catTwo from "../../fotos-sobre/Gato-02.webp";

const heroPhotos: RotatingPhoto[] = [
  { src: borderCollie, alt: "Border collie saudável e atento" },
  { src: catOne, alt: "Gato siamês atento", objectPosition: "center 38%" },
  { src: pitbull, alt: "Pitbull jovem em retrato" },
  { src: catTwo, alt: "Gato cinza saudável", objectPosition: "center 42%" },
  { src: rottweiler, alt: "Rottweiler saudável e feliz", objectPosition: "center 42%" },
  { src: essencePair, alt: "Cachorro e gato juntos", objectPosition: "center 48%" },
];

const pillars = [
  {
    icon: Leaf,
    title: "Ingredientes selecionados",
    description: "Escolhas criteriosas para oferecer nutrição equilibrada em cada porção.",
  },
  {
    icon: FlaskConical,
    title: "Conhecimento aplicado",
    description: "Fórmulas desenvolvidas com atenção às necessidades de cães e gatos.",
  },
  {
    icon: ShieldCheck,
    title: "Transparência sempre",
    description: "Informações claras para ajudar tutores a escolherem com confiança.",
  },
  {
    icon: Heart,
    title: "Cuidado verdadeiro",
    description: "Bem-estar, responsabilidade e respeito orientam todas as nossas decisões.",
  },
];

const journey = [
  {
    icon: Sprout,
    step: "01",
    title: "Seleção",
    description: "Escolhemos matérias-primas e nutrientes com critérios de qualidade.",
  },
  {
    icon: FlaskConical,
    step: "02",
    title: "Desenvolvimento",
    description: "Equilibramos sabor, digestibilidade e necessidades de cada fase da vida.",
  },
  {
    icon: PackageCheck,
    step: "03",
    title: "Qualidade",
    description: "Acompanhamos cada etapa para entregar consistência em toda embalagem.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Até a tigela",
    description: "Levamos nutrição completa para famílias e pets em todo o Brasil.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#67952F]">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#124D55] px-5 pb-10 pt-14 text-white sm:px-8 sm:pb-14 sm:pt-20">
        <FloatingMotifs className="text-[#B9DC80] opacity-40" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal-up relative z-10 text-center lg:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FE8C05]">
              Sobre a NutzenPet
            </p>
            <h1 className="mx-auto mt-4 max-w-[620px] text-4xl font-black leading-[1.08] sm:text-6xl lg:mx-0">
              Nutrição que começa no conhecimento e chega em forma de cuidado.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/70 lg:mx-0">
              Acreditamos que uma vida mais feliz começa com escolhas transparentes, alimento de qualidade e respeito pelo jeito único de cada pet.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <BrandButton href="#essencia">Conheça nossa essência</BrandButton>
              <BrandButton href="#linhas" variant="outline">Nossas linhas</BrandButton>
            </div>
          </div>

          <div className="reveal-up relative mx-auto h-[390px] w-full max-w-[560px] sm:h-[520px]" style={{ animationDelay: "120ms" }}>
            <span className="absolute -bottom-3 -right-3 h-[78%] w-[78%] rounded-lg bg-[#FE8C05]" aria-hidden="true" />
            <span className="absolute -left-5 top-8 h-24 w-24 rounded-full bg-[#B9DC80]" aria-hidden="true" />
            <PhotoRotator photos={heroPhotos} className="absolute inset-3 sm:inset-5" />
          </div>
        </div>
      </section>

      <section id="essencia" className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="reveal-up relative col-span-2 aspect-[16/9] overflow-hidden rounded-lg shadow-[0_16px_45px_rgba(18,63,85,.12)]">
              <Image
                src={essencePair}
                alt="Cachorro e gato juntos"
                fill
                quality={90}
                sizes="(max-width: 1024px) 92vw, 650px"
                className="object-cover object-center"
              />
            </div>
            <div className="reveal-up relative aspect-square overflow-hidden rounded-lg shadow-[0_12px_35px_rgba(18,63,85,.1)]" style={{ animationDelay: "80ms" }}>
              <Image
                src={essenceDog}
                alt="Cachorro saudável em retrato"
                fill
                quality={90}
                sizes="(max-width: 1024px) 45vw, 310px"
                className="object-cover object-center"
              />
            </div>
            <div className="reveal-up relative aspect-square overflow-hidden rounded-lg shadow-[0_12px_35px_rgba(18,63,85,.1)]" style={{ animationDelay: "160ms" }}>
              <Image
                src={essenceFriends}
                alt="Cachorro e gato em um momento divertido"
                fill
                quality={90}
                sizes="(max-width: 1024px) 45vw, 310px"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="reveal-up">
            <Eyebrow>Nossa essência</Eyebrow>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">
              Alimentar bem é participar de uma história inteira.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
              <p>
                A NutzenPet nasceu para aproximar ciência, cuidado e simplicidade. Desenvolvemos alimentos que acompanham cães e gatos em diferentes portes e momentos da vida, sempre pensando em quem oferece cada refeição com carinho.
              </p>
              <p>
                Da escolha dos ingredientes à comunicação da embalagem, buscamos tornar cada decisão mais clara. Queremos que tutores entendam o que estão oferecendo e sintam confiança ao cuidar de seus melhores companheiros.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#67952F]" /><p className="text-sm font-bold leading-6 text-slate-700">Nutrição completa para cada fase</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#67952F]" /><p className="text-sm font-bold leading-6 text-slate-700">Informação simples e transparente</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#67952F]" /><p className="text-sm font-bold leading-6 text-slate-700">Respeito às necessidades dos pets</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#67952F]" /><p className="text-sm font-bold leading-6 text-slate-700">Cuidado presente em cada detalhe</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F1F6E7] px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-[1240px] gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {[
            ["3", "linhas para diferentes perfis"],
            ["9", "visuais de produtos no catálogo"],
            ["100%", "compromisso com transparência"],
            ["1", "propósito: pets mais felizes"],
          ].map(([value, label], index) => (
            <div key={label} className={`reveal-up px-5 ${index > 0 ? "lg:border-l lg:border-[#D2DFC0]" : ""}`} style={{ animationDelay: `${index * 70}ms` }}>
              <strong className="text-4xl font-black text-[#67952F] sm:text-5xl">{value}</strong>
              <p className="mx-auto mt-2 max-w-44 text-xs font-bold leading-5 text-[#123F55]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#67952F]"><Target className="h-4 w-4" /> O que orienta nosso trabalho</p>
            <h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Nossos pilares</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">Princípios que transformam conhecimento em uma experiência melhor para pets e famílias.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <article key={pillar.title} className="reveal-up group min-h-64 rounded-lg border border-slate-100 bg-[#fffef9] p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="sonar sonar-green relative grid h-12 w-12 place-items-center rounded-full bg-[#F1F6E7] text-[#67952F] transition-all duration-300 group-hover:scale-90 group-hover:bg-[#FE8C05] group-hover:text-white"><PillarIcon className="h-5 w-5" /></span>
                  <h3 className="mt-6 text-xl font-black text-[#123F55]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#124D55] px-5 py-16 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-[#B9DC80] opacity-30" />
        <div className="relative mx-auto max-w-[1240px]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FE8C05]">Do campo para a tigela</p>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">Cuidado em cada etapa</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">Um caminho pensado para transformar boas escolhas em nutrição presente todos os dias.</p>
          </div>
          <div className="mt-11 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {journey.map((item, index) => {
              const JourneyIcon = item.icon;
              return (
                <div key={item.step} className={`reveal-up relative px-0 lg:px-7 ${index === 0 ? "lg:pl-0" : "lg:border-l lg:border-white/15"}`} style={{ animationDelay: `${index * 90}ms` }}>
                  <div className="flex items-center gap-4"><span className="sonar sonar-green relative grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#B9DC80]"><JourneyIcon className="h-5 w-5" /></span><span className="text-xs font-black tracking-[0.18em] text-[#FE8C05]">{item.step}</span></div>
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="linhas" className="relative overflow-hidden bg-[#fffef9] px-5 py-16 sm:px-8 sm:py-24">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto max-w-[1240px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Feitas para cada fase</Eyebrow>
              <h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-5xl">Conheça nossas linhas</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">Produtos completos para acompanhar diferentes portes, rotinas e necessidades.</p>
            </div>
            <BrandButton href="/produto" variant="outline">Ver todos os produtos</BrandButton>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F1F6E7] px-5 sm:px-8">
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 py-12 md:grid-cols-[1fr_300px] md:py-0 lg:grid-cols-[1fr_390px]">
          <div className="py-2 text-center md:py-14 md:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#67952F]">Uma vida inteira ao lado deles</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[#123F55] sm:text-4xl">Mais saúde, energia e <br />bons momentos em família.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Conte com a NutzenPet para tornar cada refeição uma parte especial da rotina.</p>
            <BrandButton href="/contato" className="mt-7">Fale com a gente</BrandButton>
          </div>
          <div className="relative h-72 self-end sm:h-80 md:h-[350px]">
            <Image src="/images/differentials-dog-v3.png" alt="Cachorro saudável e feliz" fill sizes="(max-width: 767px) 90vw, 390px" className="object-contain object-bottom" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
