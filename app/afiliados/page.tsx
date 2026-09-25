"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, HeartHandshake, Megaphone, MousePointerClick, Send, Sparkles, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { FloatingMotifs } from "../components/floating-motifs";
import { PasswordField } from "../components/password-field";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const steps = [
  { icon: HeartHandshake, title: "Faça parte", text: "Apresente seu interesse e conte um pouco sobre o seu trabalho e sua comunidade." },
  { icon: Megaphone, title: "Compartilhe", text: "Leve conteúdo e produtos NutzenPet para pessoas que também cuidam de cães e gatos." },
  { icon: MousePointerClick, title: "Acompanhe", text: "Tenha uma experiência organizada para acompanhar sua participação no programa." },
];

export default function AffiliatesPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal }).then((response) => setLoggedIn(response.ok)).catch(() => undefined);
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setMessage(null);
    const form = new FormData(formElement);
    const response = await fetch("/api/applications/affiliate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(payload?.message ?? "Não foi possível enviar sua candidatura.");
      return;
    }
    setSent(true);
    setLoggedIn(true);
    setMessage(payload?.message ?? "Candidatura recebida para análise.");
    formElement.reset();
  }

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-16 text-white sm:px-8 sm:py-24">
        <FloatingMotifs className="text-white opacity-10" />
        <div className="relative mx-auto min-w-0 max-w-[1120px] text-center"><p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#D9C7E3] sm:text-[11px] sm:tracking-[0.2em]"><Sparkles className="h-4 w-4 shrink-0" /> Programa de Afiliados NutzenPet</p><h1 className="mx-auto mt-4 max-w-full break-words text-3xl font-black leading-tight sm:max-w-4xl sm:text-6xl">Compartilhe cuidado. Construa novas conexões.</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75">Um espaço pensado para criadores, profissionais e parceiros que desejam apresentar a NutzenPet às suas comunidades.</p><a href="#cadastro" className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Quero ser afiliado <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></a></div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1120px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Uma parceria com propósito</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Como será a jornada</h2></div><div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="reveal-up border-t-2 border-[#3E1255] pt-6" style={{ animationDelay: `${index * 100}ms` }}><span className="sonar sonar-purple relative grid h-12 w-12 place-items-center rounded-full bg-[#3E1255] text-white"><Icon className="relative z-10 h-5 w-5" /></span><h3 className="mt-5 text-xl font-black text-[#123F55]">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></article>)}</div></div></section>

      <section className="bg-[#F5EFF8] px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-2"><div><Users className="h-10 w-10 text-[#3E1255]" /><h2 className="mt-5 text-3xl font-black text-[#123F55] sm:text-4xl">Afiliado ou lojista parceiro?</h2><p className="mt-4 text-sm leading-7 text-slate-600">O programa de afiliados é voltado à divulgação e à conexão com comunidades. A parceria para lojistas atende quem deseja revender os produtos e conversar sobre atuação comercial.</p></div><div className="grid gap-4"><div className="flex items-start gap-4 bg-white p-6"><BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#3E1255]" /><div><h3 className="font-black text-[#123F55]">Quero ser afiliado</h3><p className="mt-2 text-sm leading-6 text-slate-500">Envie sua candidatura no formulário exclusivo abaixo.</p></div></div><div className="flex items-start gap-4 bg-white p-6"><BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#FE8C05]" /><div><h3 className="font-black text-[#123F55]">Quero ser lojista parceiro</h3><p className="mt-2 text-sm leading-6 text-slate-500">Conheça o canal dedicado a lojas parceiras.</p></div></div><div className="flex flex-wrap gap-3"><a href="#cadastro" className="group flex min-h-12 items-center gap-2 rounded-full bg-[#3E1255] px-6 text-sm font-black text-white">Candidatura de afiliado <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></a><Link href="/seja-um-lojista-parceiro" className="group flex min-h-12 items-center gap-2 rounded-full border-2 border-[#3E1255] px-6 text-sm font-black text-[#3E1255]">Ser lojista parceiro <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div></div></div></section>

      <section id="cadastro" className="scroll-mt-24 bg-white px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-[920px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Candidatura</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-5xl">Faça parte do programa.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">O cadastro entra como pendente e só libera o link e as comissões depois da aprovação da equipe NutzenPet.</p></div><form onSubmit={handleSubmit} className="mt-9 rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6 shadow-[0_18px_50px_rgba(62,18,85,.08)] sm:p-9"><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-600">Nome completo<input name="name" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600">E-mail da conta<input name="email" type="email" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600">WhatsApp<input name="phone" type="tel" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600">Rede social principal<input name="social" type="url" placeholder="https://" className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label>{!loggedIn && <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Crie uma senha para sua conta<PasswordField name="password" minLength={10} autoComplete="new-password" required inputClassName="h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4" /><span className="font-normal text-slate-400">Mínimo de 10 caracteres. Já possui conta? <Link href="/conta" className="font-bold text-[#3E1255]">Entre primeiro</Link>.</span></label>}<label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Conte sobre seu público e conteúdo<textarea name="audience" required rows={4} className="rounded-md border border-[#D9C7E3] bg-white p-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Experiência com o mercado pet<textarea name="experience" rows={4} className="rounded-md border border-[#D9C7E3] bg-white p-4" /></label><label className="flex items-start gap-3 text-xs leading-5 text-slate-500 sm:col-span-2"><input name="consent" value="true" required type="checkbox" className="mt-1 accent-[#3E1255]" /><span>Concordo com o tratamento dos dados conforme a <Link href="/politica-de-privacidade" className="font-bold text-[#3E1255] underline">Política de Privacidade</Link>.</span></label></div>{sent ? <p className="mt-6 flex items-center gap-3 rounded-md bg-white p-4 text-sm font-bold text-[#3E1255]"><CheckCircle2 className="h-5 w-5" />{message}</p> : <><button disabled={pending} className="group mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors hover:bg-[#CC632B] disabled:opacity-50">{pending ? "Enviando..." : "Enviar candidatura"}<Send className="h-4 w-4 transition-transform group-hover:translate-x-2" /></button>{message && <p role="alert" className="mt-4 text-sm font-bold text-[#CC632B]">{message}</p>}</>}</form></div></section>
      <SiteFooter />
    </main>
  );
}
