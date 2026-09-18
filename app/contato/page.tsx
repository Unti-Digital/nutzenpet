"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { WhatsAppIcon } from "../components/whatsapp-icon";
import { contactDetails } from "../data/contact";
import representativePets from "../../fotos-extras/Seja um representante.png";

const fieldClass =
  "h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#3E1255] focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)]";

const channels = [
  { icon: Phone, label: "Telefone", value: contactDetails.phoneDisplay, href: contactDetails.phoneHref },
  { icon: Mail, label: "E-mail", value: contactDetails.email, href: contactDetails.emailHref },
  { icon: WhatsAppIcon, label: "WhatsApp", value: "Envie uma mensagem", href: contactDetails.whatsapp },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-16 text-white sm:px-8 sm:py-20">
        <FloatingMotifs className="text-[#D9C7E3] opacity-35" />
        <div className="reveal-up relative mx-auto max-w-[1180px]">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]"><MessageCircle className="h-4 w-4" /> Estamos por perto</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Vamos conversar sobre o cuidado do seu pet.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Fale com a NutzenPet sobre produtos, pedidos, assinatura, parcerias ou qualquer dúvida.</p>
        </div>
      </section>

      <section className="bg-[#F5EFF8] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
          <aside className="reveal-up grid gap-5 lg:sticky lg:top-28">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Canais de atendimento</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[#123F55]">Escolha como falar com a gente.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">Nossa equipe está disponível para orientar sua jornada com a NutzenPet.</p>
            </div>

            <div className="grid gap-3">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="group flex items-center gap-4 rounded-lg bg-white p-4 shadow-[0_10px_28px_rgba(62,18,85,.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(62,18,85,.1)]">
                  <span className="sonar sonar-purple relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255] transition-colors duration-300 group-hover:bg-[#3E1255] group-hover:text-white"><Icon className="relative z-10 h-5 w-5" /></span>
                  <span className="min-w-0"><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span><strong className="mt-1 block break-words text-sm text-[#123F55]">{value}</strong></span>
                </a>
              ))}
            </div>

            <div className="rounded-lg border border-[#D9C7E3] bg-white/60 p-5">
              <div className="flex items-start gap-3 text-sm text-slate-600"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FE8C05]" /> São Paulo - SP</div>
              <div className="mt-4 flex items-start gap-3 text-sm text-slate-600"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#FE8C05]" /> Segunda a sexta, das 9h às 18h</div>
              <div className="mt-4 flex items-start gap-3 text-sm text-slate-600"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#FE8C05]" /> Seus dados são utilizados apenas para responder ao contato.</div>
            </div>
          </aside>

          <form id="form-contato" onSubmit={handleSubmit} className="reveal-up scroll-mt-24 rounded-lg bg-white p-6 shadow-[0_18px_50px_rgba(62,18,85,.09)] sm:p-9" style={{ animationDelay: "100ms" }}>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Envie sua mensagem</p>
            <h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Como podemos ajudar?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Conte os detalhes para direcionarmos sua solicitação à equipe certa.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold text-slate-600">Nome completo<input required placeholder="Digite seu nome" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input required type="email" placeholder="seuemail@exemplo.com" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">WhatsApp<input required type="tel" placeholder="(00) 00000-0000" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">Cidade<input required placeholder="Sua cidade" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">Assunto<select required className={fieldClass} defaultValue=""><option value="" disabled>Selecione</option><option>Produtos</option><option>Pedido e entrega</option><option>Nutzen Club</option><option>Quero ser representante</option><option>Quero ser afiliado</option><option>Outro assunto</option></select></label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">Número do pedido <span className="font-normal text-slate-400">(opcional)</span><input placeholder="Ex.: NP-000123" className={fieldClass} /></label>

              <fieldset className="grid gap-3 text-xs font-bold text-slate-600 sm:col-span-2">
                <legend>Como prefere receber o retorno?</legend>
                <div className="flex min-h-12 flex-wrap items-center gap-x-6 gap-y-3 rounded-md border border-[#D9C7E3] px-4">
                  <label className="flex items-center gap-2 font-normal"><input required type="radio" name="contact-channel" value="whatsapp" className="accent-[#3E1255]" /> WhatsApp</label>
                  <label className="flex items-center gap-2 font-normal"><input required type="radio" name="contact-channel" value="email" className="accent-[#3E1255]" /> E-mail</label>
                  <label className="flex items-center gap-2 font-normal"><input required type="radio" name="contact-channel" value="telefone" className="accent-[#3E1255]" /> Telefone</label>
                </div>
              </fieldset>

              <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Mensagem<textarea required rows={6} placeholder="Escreva sua dúvida ou solicitação" className={`${fieldClass} h-auto resize-y py-3`} /></label>
              <label className="flex items-start gap-3 text-xs leading-5 text-slate-500 sm:col-span-2"><input required type="checkbox" className="mt-1 accent-[#3E1255]" /><span>Concordo com o tratamento dos meus dados conforme a <Link href="/politica-de-privacidade" className="font-bold text-[#3E1255] underline underline-offset-2">Política de Privacidade</Link>.</span></label>
            </div>

            {sent ? (
              <p role="status" className="mt-6 flex items-center gap-3 rounded-md bg-[#F5EFF8] p-4 text-sm font-bold text-[#3E1255]"><CheckCircle2 className="h-5 w-5" /> Mensagem registrada neste protótipo.</p>
            ) : (
              <button type="submit" className="group mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-8 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Enviar mensagem <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></button>
            )}
          </form>
        </div>
      </section>

      <section id="representante" className="relative overflow-hidden bg-white px-5 sm:px-8">
        <FloatingMotifs className="opacity-30" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-5 py-14 lg:grid-cols-[1fr_520px] lg:py-0">
          <div className="relative z-10 py-2 lg:py-16"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Seja um representante</p><h2 className="mt-3 max-w-2xl text-3xl font-black text-[#123F55] sm:text-4xl">Leve a qualidade NutzenPet<br />para mais famílias.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">Conheça as vantagens da parceria, as etapas e envie seu cadastro pelo canal dedicado.</p><Link href="/representante" className="group mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#3E1255] px-6 text-sm font-black text-white transition-colors duration-300 hover:bg-[#561D70]">Conhecer o programa <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div>
          <div className="reveal-up relative -mb-14 min-h-[300px] self-end sm:min-h-[350px] lg:-mb-0 lg:min-h-[410px]"><span className="absolute bottom-8 left-1/2 h-32 w-[82%] -translate-x-1/2 rounded-full bg-[#E2D4E9]" aria-hidden="true" /><Image src={representativePets} alt="Cachorro e gato convidando novos representantes" fill quality={92} sizes="(max-width: 1024px) 92vw, 520px" className="relative object-contain object-bottom drop-shadow-[0_18px_22px_rgba(62,18,85,.16)]" /></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
