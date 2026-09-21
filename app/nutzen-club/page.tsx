import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Crown,
  Gift,
  Heart,
  Leaf,
  PackageCheck,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { BrandButton } from "../components/brand-button";
import { FloatingMotifs } from "../components/floating-motifs";
import { ProductCarousel } from "../components/product-carousel";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { featuredProducts } from "../data/products";
import clubPets from "../../public/images/hero-pets-v3.png";
import kitPets from "../../fotos-sobre/cachorro-gato.jpg";
import clubCat from "../../fotos-sobre/Gato-02.webp";

const clubBenefits = [
  { icon: Leaf, title: "Nutrição de qualidade", text: "Produtos escolhidos para acompanhar cada fase da vida." },
  { icon: Heart, title: "Mais saúde e energia", text: "Uma rotina alimentar organizada para o bem-estar do pet." },
  { icon: CalendarCheck, title: "Rotina organizada", text: "Recorrência definida de acordo com a necessidade da família." },
  { icon: Truck, title: "Comodidade para você", text: "Envios programados para reduzir preocupações do dia a dia." },
  { icon: Gift, title: "Experiência exclusiva", text: "Condições e novidades pensadas para membros do clube." },
];

const steps = [
  { icon: PackageCheck, number: "01", title: "Escolha a nutrição", text: "Selecione os produtos e tamanhos que fazem sentido para o seu pet." },
  { icon: CalendarCheck, number: "02", title: "Defina a recorrência", text: "Escolha entre entrega mensal, bimestral ou trimestral." },
  { icon: UserRound, number: "03", title: "Acompanhe pela conta", text: "Consulte o próximo ciclo e os dados da assinatura em um só lugar." },
];

const plans = [
  {
    name: "Plano mensal",
    frequency: "Entrega todo mês",
    description: "Para pets com consumo frequente e famílias que preferem ciclos mais curtos.",
    highlights: ["Rotina sempre em dia", "Ajustes entre os ciclos", "Maior frequência de entrega"],
  },
  {
    name: "Plano bimestral",
    frequency: "Entrega a cada 2 meses",
    description: "Equilíbrio entre praticidade, planejamento e reposição do alimento.",
    highlights: ["Mais comodidade", "Ideal para kits variados", "Menos preocupações na rotina"],
    featured: true,
  },
  {
    name: "Plano trimestral",
    frequency: "Entrega a cada 3 meses",
    description: "Uma opção para quem prefere planejar períodos maiores de abastecimento.",
    highlights: ["Planejamento prolongado", "Combinações em maior volume", "Gestão simplificada"],
  },
];

const accountFeatures = [
  { icon: RefreshCw, title: "Ajuste quando precisar", text: "Altere a recorrência antes do próximo ciclo." },
  { icon: PackageCheck, title: "Monte seu kit", text: "Combine produtos de acordo com a rotina do pet." },
  { icon: ShieldCheck, title: "Sem surpresas", text: "Consulte as informações da assinatura pela sua conta." },
];

const faqs = [
  { question: "Posso alterar a frequência de entrega?", answer: "Sim. A proposta do Nutzen Club permite ajustar a recorrência entre os ciclos disponíveis antes do próximo envio." },
  { question: "Posso combinar produtos diferentes no meu kit?", answer: "Sim. O kit pode reunir produtos e tamanhos disponíveis, permitindo uma composição mais adequada à rotina do seu pet." },
  { question: "Como acompanho minha assinatura?", answer: "A área Minha Conta reúne a frequência escolhida, o produto atual e as informações do próximo ciclo." },
  { question: "Posso pausar ou cancelar quando precisar?", answer: "A gestão da assinatura prevê opções de pausa e cancelamento. As condições aplicáveis são apresentadas antes da confirmação." },
  { question: "Os benefícios são iguais em todos os planos?", answer: "Cada frequência pode ter condições próprias. Os detalhes correspondentes aparecem na etapa de montagem e confirmação do kit." },
];

export default function NutzenClubPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#F5EFF8] px-3 pb-8 pt-4 sm:px-5 sm:pb-12 sm:pt-6">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto max-w-[1340px] overflow-hidden rounded-lg bg-[#3E1255] text-white shadow-[0_24px_70px_rgba(62,18,85,.2)]">
          <span className="absolute -right-[10%] top-[9%] h-[80%] w-[60%] rotate-[-7deg] rounded-[42%_58%_48%_52%] bg-[#5B2374]" aria-hidden="true" />
          <div className="relative grid min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="reveal-up relative z-20 flex flex-col justify-center px-6 pb-8 pt-12 text-center sm:px-10 sm:py-16 lg:px-16 lg:text-left">
              <p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C7E3] lg:justify-start"><Crown className="h-4 w-4 text-[#FE8C05]" /> Nutzen Club</p>
              <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black leading-[1.08] sm:text-6xl lg:mx-0">Cuidado constante, de um jeito <span className="text-[#FE8C05]">mais simples.</span></h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 lg:mx-0">Receba a nutrição do seu pet na frequência ideal, monte combinações e acompanhe tudo pela sua conta.</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <BrandButton href="#como-funciona" variant="orange">Conhecer o clube</BrandButton>
                <BrandButton href="#planos" variant="outline">Ver opções de plano</BrandButton>
              </div>
            </div>

            <div className="relative min-h-[410px] self-end sm:min-h-[510px] lg:min-h-[610px]">
              <span className="absolute bottom-[8%] left-[8%] h-[70%] w-[76%] rounded-[48%_52%_42%_58%] bg-[#6D3286]" aria-hidden="true" />
              <div className="absolute bottom-[3%] left-[1%] z-10 h-[46%] w-[25%]"><Image src={featuredProducts[0].images[1]} alt={featuredProducts[0].name} fill sizes="(max-width: 640px) 100px, 180px" className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,.25)]" /></div>
              <Image src={clubPets} alt="Cachorro e gato representando o Nutzen Club" fill preload quality={92} sizes="(max-width: 1024px) 94vw, 660px" className="z-20 object-contain object-bottom drop-shadow-[0_22px_24px_rgba(0,0,0,.22)]" />
              <div className="absolute bottom-[3%] right-[1%] z-30 h-[48%] w-[24%]"><Image src={featuredProducts[2].images[1]} alt={featuredProducts[2].name} fill sizes="(max-width: 640px) 95px, 170px" className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,.25)]" /></div>
              <p className="absolute right-[7%] top-[10%] z-30 hidden max-w-[160px] rotate-[-4deg] text-center text-xl font-black leading-tight text-[#F6D9A8] sm:block">Mais saúde para hoje e para todo amanhã.</p>
            </div>
          </div>

          <div className="relative z-30 grid border-t border-white/15 bg-[#341046] sm:grid-cols-2 lg:grid-cols-4">
            {[{ icon: Truck, label: "Entrega programada" }, { icon: Settings2, label: "Rotina flexível" }, { icon: Gift, label: "Experiência exclusiva" }, { icon: Heart, label: "Mais bem-estar" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-3 border-b border-white/10 px-4 py-5 text-sm font-bold text-white/80 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0"><Icon className="h-5 w-5 text-[#FE8C05]" /> {label}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Mais que alimentação</p><h2 className="mt-4 text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">Uma rotina melhor para você e seu pet.</h2><p className="mt-5 text-sm leading-7 text-slate-600">O Nutzen Club organiza a recorrência da nutrição para trazer praticidade, cuidado e previsibilidade ao dia a dia.</p></div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {clubBenefits.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="reveal-up text-center" style={{ animationDelay: `${index * 70}ms` }}><span className="sonar sonar-purple relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><Icon className="relative z-10 h-6 w-6" /></span><h3 className="mt-5 text-sm font-black leading-5 text-[#123F55]">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative scroll-mt-24 overflow-hidden bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <FloatingMotifs className="opacity-15" />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Como funciona</p><h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Três passos para começar.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Uma jornada simples para montar uma rotina recorrente.</p></div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            <span className="absolute left-[16%] right-[16%] top-10 hidden h-px border-t border-dashed border-[#BFA9CC] md:block" aria-hidden="true" />
            {steps.map(({ icon: Icon, number, title, text }, index) => (
              <article key={number} className="reveal-up relative rounded-lg bg-white p-7 text-center shadow-[0_12px_35px_rgba(62,18,85,.07)]" style={{ animationDelay: `${index * 90}ms` }}><span className="absolute left-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[#FE8C05] text-xs font-black text-white">{number}</span><span className="sonar sonar-purple relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><Icon className="relative z-10 h-7 w-7" /></span><h3 className="mt-6 text-xl font-black text-[#123F55]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="scroll-mt-24 bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Opções de recorrência</p><h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Escolha o ritmo ideal para o seu pet.</h2><p className="mt-4 text-sm leading-7 text-slate-600">As opções organizam a frequência da assinatura. Produtos e quantidades são definidos durante a montagem do kit.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {plans.map((plan, index) => (
              <article key={plan.name} className={`reveal-up relative rounded-lg border p-7 ${plan.featured ? "border-2 border-[#FE8C05] bg-[#FFF8EF] shadow-[0_18px_45px_rgba(254,140,5,.13)]" : "border-[#D9C7E3] bg-white"}`} style={{ animationDelay: `${index * 90}ms` }}>
                {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FE8C05] px-4 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">Mais flexível</span>}
                <CalendarCheck className="h-8 w-8 text-[#3E1255]" /><p className="mt-6 text-[10px] font-black uppercase tracking-[0.14em] text-[#3E1255]">{plan.frequency}</p><h3 className="mt-2 text-2xl font-black text-[#123F55]">{plan.name}</h3><p className="mt-4 min-h-20 text-sm leading-6 text-slate-600">{plan.description}</p><div className="mt-6 grid gap-3 border-t border-[#D9C7E3] pt-6">{plan.highlights.map((highlight) => <span key={highlight} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="h-4 w-4 shrink-0 text-[#3E1255]" /> {highlight}</span>)}</div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">A disponibilidade e as condições de cada opção são apresentadas antes da confirmação da assinatura.</p>
        </div>
      </section>

      <section id="produtos-club" className="scroll-mt-24 bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Escolha sua nutrição</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-5xl">Produtos para assinar.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Combine as linhas disponíveis conforme a fase e as necessidades do seu pet.</p></div><Link href="/produto" className="group flex items-center gap-2 text-sm font-black text-[#3E1255]">Ver todas as linhas <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div><ProductCarousel products={featuredProducts} className="mt-8" /></div>
      </section>

      <section id="controle" className="relative scroll-mt-24 overflow-hidden bg-[#3E1255] px-5 py-14 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-white opacity-10" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[0.58fr_1.42fr]">
          <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-white/10"><Image src={clubCat} alt="Gato saudável em uma rotina de cuidado" fill sizes="(max-width: 1024px) 90vw, 440px" className="object-cover object-center" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]">Uma rotina que acompanha vocês</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Cuidado recorrente sem perder a flexibilidade.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">Organize o ciclo, acompanhe os próximos passos e faça ajustes quando a rotina mudar.</p><div className="mt-8 grid gap-5 sm:grid-cols-3">{accountFeatures.map(({ icon: Icon, title, text }) => <div key={title} className="border-t border-white/20 pt-5"><Icon className="h-6 w-6 text-[#FE8C05]" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-white/60">{text}</p></div>)}</div></div>
        </div>
      </section>

      <section id="kits" className="bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-lg bg-[#F5EFF8] lg:grid-cols-[0.68fr_1.32fr]">
          <div className="relative min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]"><span className="absolute bottom-0 left-[8%] h-[78%] w-[84%] rounded-t-full bg-[#E2D4E9]" aria-hidden="true" /><Image src={kitPets} alt="Cachorro e gato ao lado da nutrição escolhida" fill sizes="(max-width: 1024px) 92vw, 460px" className="object-contain object-bottom p-3 mix-blend-multiply sm:p-5" /></div>
          <div className="flex flex-col justify-center px-6 py-10 text-center sm:px-12 lg:text-left"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Seu pet, sua combinação</p><h2 className="mt-4 text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">Monte seu kit e faça parte do Nutzen Club.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">Escolha os produtos, combine tamanhos disponíveis e organize a frequência que melhor acompanha a rotina da casa.</p><BrandButton href="/produto#kits" variant="orange" className="mt-7 self-center lg:self-start">Quero montar meu kit</BrandButton></div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Dúvidas frequentes</p><h2 className="mt-4 text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">Ainda tem dúvidas?</h2><p className="mt-5 text-sm leading-7 text-slate-600">Confira as principais informações sobre a experiência Nutzen Club.</p></div>
          <div className="divide-y divide-[#D9C7E3] border-y border-[#D9C7E3]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-black text-[#123F55] marker:content-none">{faq.question}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#3E1255]"><ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" /></span></summary><p className="max-w-2xl pt-4 text-sm leading-7 text-slate-600">{faq.answer}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="sonar sonar-purple relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#3E1255] text-white"><RefreshCw className="relative z-10 h-5 w-5" /></span><div><h2 className="text-xl font-black text-[#123F55]">Sua assinatura, no seu controle.</h2><p className="mt-1 text-sm text-slate-600">Acompanhe a experiência pela área da sua conta.</p></div></div><Link href="/minha-conta#assinatura" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border-2 border-[#3E1255] px-7 text-sm font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">Ver minha assinatura <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div></section>

      <SiteFooter />
    </main>
  );
}
