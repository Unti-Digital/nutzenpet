"use client";

import type { FormEvent } from "react";
import { Heart, LockKeyhole, LogIn, PackageCheck, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const fieldClass = "h-12 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#124D55] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,77,85,.1)]";

export default function AccountPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); }
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-20"><FloatingMotifs className="opacity-35" /><div className="relative mx-auto grid max-w-[1080px] overflow-hidden rounded-lg bg-white shadow-[0_22px_65px_rgba(18,63,85,.1)] lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative flex min-h-[390px] flex-col justify-between overflow-hidden bg-[#124D55] p-8 text-white sm:p-10"><FloatingMotifs className="text-[#B9DC80] opacity-35" /><div className="relative"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#B9DC80]"><UserRound className="h-6 w-6" /></span><p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#B9DC80]">Área do cliente</p><h1 className="mt-3 text-4xl font-black leading-tight">Tudo do seu pet em um só lugar.</h1></div><div className="relative mt-8 grid gap-4 text-sm text-white/75"><span className="flex items-center gap-3"><PackageCheck className="h-5 w-5 text-[#FE8C05]" /> Acompanhe seus pedidos</span><span className="flex items-center gap-3"><Heart className="h-5 w-5 text-[#FE8C05]" /> Salve os produtos favoritos</span><span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#FE8C05]" /> Mantenha seus dados protegidos</span></div></div>
        <form onSubmit={handleSubmit} className="reveal-up p-8 sm:p-10"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]">Bem-vindo de volta</p><h2 className="mt-3 text-3xl font-black text-[#123F55]">Acesse sua conta</h2><p className="mt-2 text-sm leading-6 text-slate-500">Consulte pedidos e atualize seus dados de entrega.</p><label className="mt-7 grid gap-2 text-xs font-bold text-slate-600">E-mail<input type="email" required className={fieldClass} /></label><label className="mt-4 grid gap-2 text-xs font-bold text-slate-600">Senha<input type="password" required className={fieldClass} /></label><div className="mt-3 flex justify-end"><button type="button" className="text-xs font-bold text-[#124D55] transition-colors duration-300 hover:text-[#FE8C05]">Esqueci minha senha</button></div><button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95"><LogIn className="h-4 w-4" /> Entrar</button><div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" /></div><button type="button" className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#124D55] text-sm font-black text-[#124D55] transition-all duration-300 hover:scale-[0.98] hover:bg-[#F1F6E7] active:scale-95"><UserPlus className="h-4 w-4" /> Criar nova conta</button><p className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Ambiente protegido</p></form>
      </div></section>
      <SiteFooter />
    </main>
  );
}
