import Image from "next/image";
import {
  CheckCircle2,
  Bird,
  Fish,
  FlaskConical,
  Heart,
  Leaf,
  PackageCheck,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Truck,
  Wheat,
} from "lucide-react";
import { BrandButton } from "../components/brand-button";
import { FloatingMotifs } from "../components/floating-motifs";
import { PhotoRotator, type RotatingPhoto } from "../components/photo-rotator";
import { ProductCarousel } from "../components/product-carousel";
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
import chickenSweetPotato from "../../ingredientes_nutzen/01_frango_batata_doce.png";
import ancestralGrains from "../../ingredientes_nutzen/02_cereais_ancestrais.png";
import selectedProteins from "../../ingredientes_nutzen/03_proteinas_selecionadas.png";
import omega from "../../ingredientes_nutzen/04_omega_3_6.png";
import mosPrebiotic from "../../ingredientes_nutzen/05_mos_prebiotico.png";
import yuccaExtract from "../../ingredientes_nutzen/06_extrato_yucca.png";

const heroPhotos: RotatingPhoto[] = [
  { src: borderCollie, alt: "Border collie saudável e atento" },
  { src: catOne, alt: "Gato siamês atento", objectPosition: "center 38%" },
  { src: rottweiler, alt: "Rottweiler saudável e feliz", objectPosition: "center 42%" },
  { src: catTwo, alt: "Gato cinza saudável", objectPosition: "center 42%" },
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

const formulaHighlights = [
  {
    icon: Bird,
    title: "Frango e batata-doce",
    description: "Uma combinação de proteínas e fibras que favorece a digestão, a energia diária e a manutenção muscular.",
    image: chickenSweetPotato,
    imageAlt: "Frango e batata-doce",
  },
  {
    icon: Wheat,
    title: "Cereais ancestrais",
    description: "Fontes de energia que ajudam a construir uma alimentação equilibrada para cães e gatos.",
    image: ancestralGrains,
    imageAlt: "Cereais ancestrais",
  },
  {
    icon: Fish,
    title: "Proteínas selecionadas",
    description: "Nutrientes importantes para músculos, disposição e manutenção de uma rotina ativa.",
    image: selectedProteins,
    imageAlt: "Peixes representando proteínas selecionadas",
  },
  {
    icon: Heart,
    title: "Ômega 3 e 6",
    description: "Ácidos graxos que contribuem para pele, pelagem, coração e articulações.",
    image: omega,
    imageAlt: "Cápsulas de ômega 3 e 6",
  },
  {
    icon: FlaskConical,
    title: "MOS (prebiótico)",
    description: "Auxilia no equilíbrio da flora intestinal e apoia a digestão e a imunidade dos pets.",
    image: mosPrebiotic,
    imageAlt: "MOS prebiótico",
  },
  {
    icon: Leaf,
    title: "Extrato de yucca",
    description: "Ingrediente que ajuda a reduzir o odor das fezes e favorece um convívio mais agradável.",
    image: yuccaExtract,
    imageAlt: "Raiz e folhas de yucca",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#3E1255]">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#3E1255] px-5 pb-10 pt-14 text-white sm:px-8 sm:pb-14 sm:pt-20">
        <FloatingMotifs className="text-[#D9C7E3] opacity-40" />
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
            <span className="absolute -left-5 top-8 h-24 w-24 rounded-full bg-[#D9C7E3]" aria-hidden="true" />
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
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E1255]" /><p className="text-sm font-bold leading-6 text-slate-700">Nutrição completa para cada fase</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E1255]" /><p className="text-sm font-bold leading-6 text-slate-700">Informação simples e transparente</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E1255]" /><p className="text-sm font-bold leading-6 text-slate-700">Respeito às necessidades dos pets</p></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E1255]" /><p className="text-sm font-bold leading-6 text-slate-700">Cuidado presente em cada detalhe</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5EFF8] px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-[1240px] gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {[
            ["3", "linhas para diferentes perfis"],
            ["9", "visuais de produtos no catálogo"],
            ["100%", "compromisso com transparência"],
            ["1", "propósito: pets mais felizes"],
          ].map(([value, label], index) => (
            <div key={label} className={`reveal-up px-5 ${index > 0 ? "lg:border-l lg:border-[#E2D4E9]" : ""}`} style={{ animationDelay: `${index * 70}ms` }}>
              <strong className="text-4xl font-black text-[#3E1255] sm:text-5xl">{value}</strong>
              <p className="mx-auto mt-2 max-w-44 text-xs font-bold leading-5 text-[#123F55]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#3E1255]"><Target className="h-4 w-4" /> O que orienta nosso trabalho</p>
            <h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Nossos pilares</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">Princípios que transformam conhecimento em uma experiência melhor para pets e famílias.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <article key={pillar.title} className="reveal-up group min-h-64 rounded-lg border border-slate-100 bg-[#fffef9] p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="sonar sonar-purple relative grid h-12 w-12 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255] transition-all duration-300 group-hover:scale-90 group-hover:bg-[#FE8C05] group-hover:text-white"><PillarIcon className="h-5 w-5" /></span>
                  <h3 className="mt-6 text-xl font-black text-[#123F55]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-16 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-[#D9C7E3] opacity-30" />
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
                  <div className="flex items-center gap-4"><span className="sonar sonar-purple relative grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#D9C7E3]"><JourneyIcon className="h-5 w-5" /></span><span className="text-xs font-black tracking-[0.18em] text-[#FE8C05]">{item.step}</span></div>
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="formula" className="relative scroll-mt-24 overflow-hidden bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <FloatingMotifs className="opacity-15" />
        <div className="relative mx-auto grid max-w-[1340px] gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-14">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <Eyebrow>A fórmula Nutzen</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">Ingredientes que trabalham juntos pelo <span className="text-[#FE8C05]">bem-estar.</span></h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">Cada componente tem um papel essencial na vitalidade, digestão e cuidado diário do seu pet. Uma nutrição equilibrada, completa e pensada para todas as fases da vida.</p>

            <div className="mt-7 grid max-w-xl grid-cols-3 divide-x divide-[#D9C7E3] border-y border-[#D9C7E3] py-5">
              <div className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:text-left"><Leaf className="h-6 w-6 shrink-0 text-[#3E1255]" /><span className="text-[9px] font-black uppercase leading-4 text-[#3E1255] sm:text-[10px]">Nutrição de verdade</span></div>
              <div className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:px-5 sm:text-left"><Heart className="h-6 w-6 shrink-0 text-[#3E1255]" /><span className="text-[9px] font-black uppercase leading-4 text-[#3E1255] sm:text-[10px]">Mais saúde todo dia</span></div>
              <div className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:px-5 sm:text-left"><PawPrint className="h-6 w-6 shrink-0 text-[#3E1255]" /><span className="text-[9px] font-black uppercase leading-4 text-[#3E1255] sm:text-[10px]">Pets mais felizes</span></div>
            </div>

            <div className="relative mt-8 min-h-[410px] overflow-hidden rounded-lg bg-white/60 sm:min-h-[510px]">
              <span className="absolute bottom-[-12%] left-[-8%] h-[78%] w-[72%] rounded-full bg-[#E2D4E9]" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 h-[78%] w-[58%] overflow-hidden rounded-tr-[42%]">
                <Image src={pitbull} alt="Cachorro saudável representando a fórmula Nutzen" fill sizes="(max-width: 640px) 58vw, 310px" className="object-cover object-[52%_38%] mix-blend-multiply" />
              </div>
              <div className="float-soft absolute bottom-[3%] right-[4%] h-[92%] w-[55%] sm:right-[7%] sm:w-[52%]">
                <Image src={products[0].images[1]} alt={products[0].name} fill sizes="(max-width: 640px) 52vw, 300px" className="object-contain drop-shadow-[0_22px_22px_rgba(62,18,85,.22)]" />
              </div>
              <p className="absolute left-5 top-5 max-w-[150px] -rotate-3 text-lg font-black leading-6 text-[#3E1255] sm:left-8 sm:top-8">Nutrição que faz bem de verdade.</p>
            </div>
          </div>

          <div className="grid content-start gap-4">
            {formulaHighlights.map(({ icon: FormulaIcon, title, description, image, imageAlt }, index) => (
              <article key={title} className="reveal-up grid min-h-[138px] grid-cols-[44px_minmax(0,1fr)_82px] items-center gap-x-3 overflow-hidden rounded-lg bg-white p-3 shadow-[0_12px_35px_rgba(62,18,85,.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(62,18,85,.11)] sm:grid-cols-[62px_1fr_150px] sm:gap-x-5 sm:p-5" style={{ animationDelay: `${index * 70}ms` }}>
                <span className="sonar sonar-purple relative grid h-11 w-11 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255] shadow-[0_8px_22px_rgba(62,18,85,.1)] sm:h-14 sm:w-14"><FormulaIcon className="relative z-10 h-5 w-5 sm:h-6 sm:w-6" /></span>
                <div><div className="flex items-center gap-3"><span className="min-w-7 text-xs font-black tracking-[0.12em] text-[#CC632B] sm:text-sm">{String(index + 1).padStart(2, "0")}</span><h3 className="text-lg font-black text-[#3E1255] sm:text-xl">{title}</h3></div><p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">{description}</p></div>
                <div className="relative h-24 overflow-hidden rounded-md bg-[#FBF8FC] sm:h-full"><Image src={image} alt={imageAlt} fill sizes="(max-width: 640px) 82px, 150px" className="object-contain" /></div>
              </article>
            ))}
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
          <ProductCarousel products={products} className="mt-8" />
        </div>
      </section>

      <section className="overflow-hidden bg-[#F5EFF8] px-5 sm:px-8">
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 py-12 md:grid-cols-[1fr_300px] md:py-0 lg:grid-cols-[1fr_390px]">
          <div className="py-2 text-center md:py-14 md:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Uma vida inteira ao lado deles</p>
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
