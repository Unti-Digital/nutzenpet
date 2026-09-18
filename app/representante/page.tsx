"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Handshake,
  Heart,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  PackageCheck,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { products } from "../data/products";
import representativePets from "../../fotos-extras/Seja um representante.png";
import representativeDog from "../../fotos-extras/rottweiler.png";

const heroBenefits = [
  { icon: BadgeCheck, label: "Marca em crescimento" },
  { icon: ShieldCheck, label: "Produtos de qualidade" },
  { icon: MessageCircle, label: "Suporte comercial" },
];

const advantages = [
  {
    icon: PackageCheck,
    title: "Portfólio especializado",
    text: "Soluções de nutrição desenvolvidas para diferentes portes e necessidades de cães e gatos.",
  },
  {
    icon: BarChart3,
    title: "Novas oportunidades",
    text: "Uma marca em expansão para ampliar conversas e oportunidades no mercado pet da sua região.",
  },
  {
    icon: Handshake,
    title: "Parceria comercial",
    text: "Relacionamento próximo e suporte para orientar o desenvolvimento da sua atuação.",
  },
  {
    icon: Star,
    title: "Qualidade como diferencial",
    text: "Produtos feitos com responsabilidade, cuidado e uma proposta clara para tutores e pets.",
  },
];

const steps = [
  { icon: FileCheck2, number: "01", title: "Faça seu cadastro", text: "Preencha o formulário com seus dados profissionais e região de atuação." },
  { icon: SearchCheck, number: "02", title: "Análise do perfil", text: "A equipe avalia aderência, disponibilidade e possibilidades comerciais." },
  { icon: MessageCircle, number: "03", title: "Contato comercial", text: "Uma conversa alinha condições, formato de atuação e próximos passos." },
  { icon: CheckCircle2, number: "04", title: "Início da parceria", text: "Com a aprovação e a formalização, começa sua jornada com a NutzenPet." },
];

const regions = [
  { name: "Norte", note: "Disponibilidade sob análise" },
  { name: "Nordeste", note: "Disponibilidade sob análise" },
  { name: "Centro-Oeste", note: "Disponibilidade sob análise" },
  { name: "Sudeste", note: "Disponibilidade sob análise" },
  { name: "Sul", note: "Disponibilidade sob análise" },
];

const formBenefits = [
  { icon: Users, title: "Faça parte da marca", text: "Conecte a NutzenPet a novos públicos e mercados." },
  { icon: Heart, title: "Crescimento compartilhado", text: "Uma parceria construída com proximidade e propósito." },
  { icon: Sparkles, title: "Nutrição que transforma", text: "Mais cuidado para pets e mais valor para o mercado." },
];

const fieldClass =
  "h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#3E1255] focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)]";

export default function RepresentativePage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#F5EFF8] px-3 pb-8 pt-4 sm:px-5 sm:pb-12 sm:pt-6">
        <FloatingMotifs className="opacity-20" />
        <div className="relative mx-auto max-w-[1340px] overflow-hidden rounded-lg bg-[#3E1255] text-white shadow-[0_24px_70px_rgba(62,18,85,.2)]">
          <span className="absolute -right-[8%] top-[12%] h-[72%] w-[58%] rotate-[-8deg] rounded-[42%_58%_48%_52%] bg-[#5B2374]" aria-hidden="true" />
          <div className="relative grid min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="reveal-up relative z-20 flex flex-col justify-center px-6 pb-8 pt-12 text-center sm:px-10 sm:py-16 lg:px-16 lg:text-left">
              <p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C7E3] lg:justify-start"><Handshake className="h-4 w-4" /> Oportunidade de parceria</p>
              <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black leading-[1.08] sm:text-6xl lg:mx-0">Seja um representante <span className="text-[#FE8C05]">NutzenPet.</span></h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 lg:mx-0">Leve nutrição de verdade para mais pets e desenvolva novas oportunidades com uma marca feita para cuidar.</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a href="#cadastro" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Quero representar <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></a>
                <Link href="/sobre" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">Conheça a NutzenPet <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link>
              </div>
            </div>

            <div className="relative min-h-[390px] self-end sm:min-h-[500px] lg:min-h-[610px]">
              <span className="absolute bottom-[10%] left-[10%] h-[68%] w-[70%] rounded-[50%_50%_42%_58%] bg-[#6D3286]" aria-hidden="true" />
              <Image src="/images/hero-pets-v3.png" alt="Cachorro e gato representando a parceria NutzenPet" fill preload quality={92} sizes="(max-width: 1024px) 96vw, 700px" className="z-10 object-contain object-bottom drop-shadow-[0_22px_24px_rgba(0,0,0,.24)]" />
              <div className="float-soft absolute bottom-[7%] right-[2%] z-20 h-[58%] w-[28%] min-w-[108px] sm:right-[6%] sm:w-[25%]">
                <Image src={products[0].images[1]} alt={products[0].name} fill sizes="(max-width: 640px) 120px, 190px" className="object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,.24)]" />
              </div>
              <p className="absolute right-[7%] top-[10%] z-20 hidden max-w-[130px] rotate-[-5deg] text-center text-2xl font-black leading-tight text-[#F6D9A8] sm:block">Mais cuidado. Mais histórias.</p>
            </div>
          </div>

          <div className="relative z-30 grid border-t border-white/15 bg-[#341046] sm:grid-cols-3">
            {heroBenefits.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-3 border-b border-white/10 px-5 py-5 text-sm font-bold text-white/80 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <Icon className="h-5 w-5 text-[#FE8C05]" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="marca" className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24">
        <FloatingMotifs className="opacity-15" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div className="reveal-up">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Conheça nossa marca</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">Uma marca para quem acredita em uma <span className="text-[#3E1255]">nutrição melhor.</span></h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600">A NutzenPet desenvolve produtos que unem qualidade, cuidado e nutrição para cães e gatos. Queremos ampliar nossa presença ao lado de parceiros que conhecem seus mercados e compartilham esse compromisso.</p>
            <div className="mt-8 flex max-w-2xl items-start gap-4 rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-5 sm:p-6">
              <span className="sonar sonar-purple relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#3E1255]"><Store className="relative z-10 h-5 w-5" /></span>
              <div><h3 className="font-black text-[#123F55]">Nossa proposta de parceria</h3><p className="mt-2 text-sm leading-6 text-slate-600">Construir relações comerciais consistentes, aproximando a NutzenPet de novos clientes e regiões.</p></div>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden rounded-lg bg-[#F5EFF8] sm:min-h-[520px]">
            <span className="absolute left-[12%] top-[12%] h-[56%] w-[64%] rounded-[44%_56%_52%_48%] bg-[#E2D4E9]" aria-hidden="true" />
            <Image src={representativePets} alt="Cachorro e gato celebrando uma nova parceria" fill quality={92} sizes="(max-width: 1024px) 90vw, 520px" className="object-contain object-bottom drop-shadow-[0_18px_22px_rgba(62,18,85,.14)]" />
            <div className="absolute right-5 top-5 max-w-[165px] text-right"><span className="text-sm font-black leading-5 text-[#3E1255]">Juntos por pets mais felizes.</span></div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Por que ser nosso parceiro?</p><h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Uma parceria com espaço para crescer.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Conheça os pilares que orientam a experiência da nossa rede de representantes.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="reveal-up group rounded-lg bg-white p-6 shadow-[0_12px_35px_rgba(62,18,85,.06)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(62,18,85,.12)]" style={{ animationDelay: `${index * 90}ms` }}>
                <span className="sonar sonar-purple relative grid h-14 w-14 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><Icon className="relative z-10 h-6 w-6" /></span>
                <h3 className="mt-6 text-xl font-black text-[#123F55]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Simples e direto</p><h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Seu próximo passo começa aqui.</h2><p className="mt-4 text-sm leading-7 text-slate-600">Entenda como iniciamos uma nova parceria comercial.</p></div>
          <div className="relative mt-14 grid gap-9 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <span className="absolute left-[11%] right-[11%] top-8 hidden h-px bg-[#D9C7E3] lg:block" aria-hidden="true" />
            {steps.map(({ icon: Icon, number, title, text }, index) => (
              <article key={number} className="reveal-up relative text-center" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#D9C7E3] bg-white text-[#3E1255] shadow-[0_10px_30px_rgba(62,18,85,.1)]"><Icon className="h-7 w-7" /><span className="absolute -left-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-[#3E1255] text-[10px] font-black text-white">{number}</span></div>
                <h3 className="mt-6 text-lg font-black text-[#123F55]">{title}</h3>
                <p className="mx-auto mt-3 max-w-[250px] text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-16 text-white sm:px-8 sm:py-24">
        <FloatingMotifs className="text-white opacity-10" />
        <div className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div><MapPinned className="h-10 w-10 text-[#FE8C05]" /><p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]">Onde queremos chegar</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Novos mercados.<br /><span className="text-[#FE8C05]">Novas oportunidades.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Queremos conhecer profissionais interessados em levar a NutzenPet para diferentes regiões do Brasil.</p><a href="#cadastro" className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Consultar oportunidades <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></a></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {regions.map((region, index) => (
              <div key={region.name} className={`reveal-up flex items-center gap-4 rounded-lg border border-white/15 bg-white/[0.06] p-5 ${index === regions.length - 1 ? "sm:col-span-2" : ""}`} style={{ animationDelay: `${index * 70}ms` }}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-[#FE8C05]"><MapPin className="h-5 w-5" /></span>
                <div><strong className="text-lg">{region.name}</strong><p className="mt-1 text-xs text-white/55">{region.note}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cadastro" className="scroll-mt-24 bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Faça parte da NutzenPet</p><h2 className="mt-4 text-3xl font-black text-[#123F55] sm:text-5xl">Vamos crescer juntos?</h2><p className="mt-4 text-sm leading-7 text-slate-600">Preencha seus dados para que nossa equipe conheça sua atuação e entre em contato.</p></div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-[0_18px_50px_rgba(62,18,85,.09)] sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold text-slate-600">Nome completo<input required placeholder="Digite seu nome" className={fieldClass} /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input required type="email" placeholder="seuemail@exemplo.com" className={fieldClass} /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-600">WhatsApp<input required type="tel" placeholder="(00) 00000-0000" className={fieldClass} /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-600">Cidade<input required placeholder="Sua cidade" className={fieldClass} /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-600">Estado<select required defaultValue="" className={fieldClass}><option value="" disabled>Selecione</option><option>Acre</option><option>Alagoas</option><option>Amapá</option><option>Amazonas</option><option>Bahia</option><option>Ceará</option><option>Distrito Federal</option><option>Espírito Santo</option><option>Goiás</option><option>Maranhão</option><option>Mato Grosso</option><option>Mato Grosso do Sul</option><option>Minas Gerais</option><option>Pará</option><option>Paraíba</option><option>Paraná</option><option>Pernambuco</option><option>Piauí</option><option>Rio de Janeiro</option><option>Rio Grande do Norte</option><option>Rio Grande do Sul</option><option>Rondônia</option><option>Roraima</option><option>Santa Catarina</option><option>São Paulo</option><option>Sergipe</option><option>Tocantins</option></select></label>
                <fieldset className="grid gap-3 text-xs font-bold text-slate-600"><legend>Possui experiência comercial?</legend><div className="flex min-h-12 items-center gap-6"><label className="flex items-center gap-2 font-normal"><input required type="radio" name="experience" value="sim" className="accent-[#3E1255]" /> Sim</label><label className="flex items-center gap-2 font-normal"><input required type="radio" name="experience" value="nao" className="accent-[#3E1255]" /> Não</label></div></fieldset>
                <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Conte um pouco sobre sua experiência<textarea required rows={5} placeholder="Fale sobre sua atuação profissional" className={`${fieldClass} h-auto resize-y py-3`} /></label>
                <label className="flex items-start gap-3 text-xs leading-5 text-slate-500 sm:col-span-2"><input required type="checkbox" className="mt-1 accent-[#3E1255]" /> <span>Concordo com o tratamento dos meus dados conforme a <Link href="/politica-de-privacidade" className="font-bold text-[#3E1255] underline underline-offset-2">Política de Privacidade</Link>.</span></label>
              </div>
              {sent ? (
                <p role="status" className="mt-6 flex items-center gap-3 rounded-md bg-[#F5EFF8] p-4 text-sm font-bold text-[#3E1255]"><CheckCircle2 className="h-5 w-5" /> Cadastro registrado neste protótipo.</p>
              ) : (
                <button type="submit" className="group mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Enviar candidatura <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></button>
              )}
            </form>

            <aside className="relative overflow-hidden rounded-lg bg-white p-6 shadow-[0_18px_50px_rgba(62,18,85,.08)] sm:p-8">
              <div className="grid gap-7">
                {formBenefits.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4"><span className="sonar sonar-purple relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><Icon className="relative z-10 h-5 w-5" /></span><div><h3 className="font-black text-[#123F55]">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{text}</p></div></div>
                ))}
              </div>
              <div className="relative -mx-6 -mb-6 mt-8 h-[260px] overflow-hidden sm:-mx-8 sm:-mb-8"><span className="absolute bottom-0 left-[8%] h-[75%] w-[84%] rounded-t-full bg-[#F5EFF8]" aria-hidden="true" /><Image src={representativeDog} alt="Rottweiler saudável representando uma parceria" fill sizes="(max-width: 1024px) 90vw, 360px" className="object-cover object-[center_28%] mix-blend-multiply" /></div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-9 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="sonar sonar-purple relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#3E1255] text-white"><Mail className="relative z-10 h-5 w-5" /></span><div><h2 className="text-xl font-black text-[#123F55]">Ainda tem dúvidas?</h2><p className="mt-1 text-sm text-slate-600">Fale com nosso time comercial sobre o programa de representantes.</p></div></div><Link href="/contato" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border-2 border-[#3E1255] px-7 text-sm font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">Entrar em contato <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div>
      </section>

      <SiteFooter />
    </main>
  );
}
