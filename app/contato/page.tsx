"use client";

import type { FormEvent } from "react";
import { CheckCircle2, Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const fieldClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#124D55] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,77,85,.1)]";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#124D55] px-5 py-16 text-white sm:px-8 sm:py-20"><FloatingMotifs className="text-[#B9DC80] opacity-45" /><div className="reveal-up relative mx-auto max-w-[1180px]"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B9DC80]">Estamos por perto</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Vamos conversar sobre o cuidado do seu pet.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Fale com a NutzenPet sobre produtos, pedidos, representação ou qualquer dúvida.</p></div></section>
      <section className="px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="reveal-up"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]">Canais de atendimento</p><h2 className="mt-3 text-3xl font-black text-[#123F55]">Escolha como falar com a gente</h2><div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {[{ icon: Phone, label: "Telefone", value: "(11) 99999-9999", href: "tel:+5511999999999" }, { icon: Mail, label: "E-mail", value: "contato@nutzenpet.com.br", href: "mailto:contato@nutzenpet.com.br" }, { icon: MessageCircle, label: "WhatsApp", value: "Envie uma mensagem", href: "https://wa.me/5511999999999" }].map((item) => { const Icon = item.icon; return <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="group flex items-center gap-4 py-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#F1F6E7] text-[#67952F] transition-all duration-300 group-hover:scale-90 group-hover:bg-[#FE8C05] group-hover:text-white"><Icon className="h-5 w-5" /></span><span><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</span><strong className="mt-1 block text-sm text-[#123F55]">{item.value}</strong></span></a>; })}
        </div><div className="mt-7 grid gap-5 text-sm text-slate-600"><span className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FE8C05]" /> São Paulo - SP</span><span className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#FE8C05]" /> Segunda a sexta, das 9h às 18h</span></div></div>
        <form onSubmit={handleSubmit} className="reveal-up rounded-lg bg-white p-6 shadow-[0_18px_50px_rgba(18,63,85,.09)] sm:p-9" style={{ animationDelay: "100ms" }}><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#CC632B]">Envie sua mensagem</p><h2 className="mt-3 text-3xl font-black text-[#123F55]">Como podemos ajudar?</h2><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-600">Nome<input required className={fieldClass} /></label><label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input required type="email" className={fieldClass} /></label><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Assunto<select className={fieldClass} defaultValue=""><option value="" disabled>Selecione</option><option>Produtos</option><option>Pedido e entrega</option><option>Quero ser representante</option><option>Outro assunto</option></select></label><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Mensagem<textarea required rows={6} className={`${fieldClass} h-auto resize-y py-3`} /></label></div>{sent ? <p role="status" className="mt-6 flex items-center gap-2 rounded-md bg-[#F1F6E7] p-4 text-sm font-bold text-[#124D55]"><CheckCircle2 className="h-5 w-5 text-[#67952F]" /> Mensagem registrada neste protótipo.</p> : <button type="submit" className="mt-6 h-13 rounded-full bg-[#FE8C05] px-8 text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">Enviar mensagem</button>}</form>
      </div></section>
      <section id="representante" className="relative overflow-hidden bg-[#F1F6E7] px-5 py-14 sm:px-8"><FloatingMotifs className="opacity-40" /><div className="relative mx-auto max-w-[1180px]"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]">Seja um representante</p><h2 className="mt-3 max-w-2xl text-3xl font-black text-[#123F55] sm:text-4xl">Leve a qualidade NutzenPet para mais famílias.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">Use o formulário acima e escolha “Quero ser representante” para iniciar uma conversa com nosso time.</p></div></section>
      <SiteFooter />
    </main>
  );
}
