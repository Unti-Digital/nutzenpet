"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CirclePause,
  CreditCard,
  Heart,
  House,
  MapPin,
  PackageCheck,
  Pencil,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { products } from "../data/products";

const subscriptionProduct = products[1];

const accountLinks = [
  { href: "#visao-geral", label: "Visão geral", icon: House },
  { href: "#pedidos", label: "Meus pedidos", icon: PackageCheck },
  { href: "#assinatura", label: "Minha assinatura", icon: RefreshCw },
  { href: "#enderecos", label: "Endereços", icon: MapPin },
  { href: "#dados", label: "Dados pessoais", icon: UserRound },
];

export default function MyAccountPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-[#E2D4E9] bg-[#F5EFF8] px-5 py-10 sm:px-8 sm:py-12">
        <FloatingMotifs className="opacity-45" />
        <div className="reveal-up relative mx-auto flex max-w-[1180px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Área do cliente</p>
            <h1 className="mt-2 text-3xl font-black text-[#123F55] sm:text-4xl">Olá, Marina</h1>
            <p className="mt-2 text-sm text-slate-600">Aqui está um resumo dos cuidados com o seu pet.</p>
          </div>
          <div className="flex items-center gap-3 sm:text-right">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#3E1255] text-white shadow-[0_8px_22px_rgba(62,18,85,.2)]"><UserRound className="h-6 w-6" /></span>
            <div><strong className="block text-sm text-[#123F55]">Marina Oliveira</strong><span className="text-xs text-slate-500">Cliente NutzenPet desde 2025</span></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
            <nav aria-label="Navegação da conta" className="flex w-full gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
              {accountLinks.map(({ href, label, icon: Icon }, index) => (
                <a key={href} href={href} className={`group flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 ${index === 0 ? "bg-[#3E1255] text-white" : "text-slate-600 hover:bg-[#F5EFF8] hover:text-[#3E1255]"}`}>
                  <Icon className={`h-4 w-4 ${index === 0 ? "text-[#D9C7E3]" : "text-[#3E1255]"}`} />
                  {label}
                </a>
              ))}
            </nav>
            <Link href="/conta" className="mt-5 hidden items-center gap-2 px-4 text-xs font-bold text-slate-400 transition-colors duration-300 hover:text-[#CC632B] lg:flex">Sair da conta <ArrowRight className="h-3.5 w-3.5" /></Link>
          </aside>

          <div className="min-w-0 space-y-8">
            <section id="visao-geral" className="scroll-mt-32">
              <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Visão geral</p><h2 className="mt-1 text-2xl font-black text-[#123F55]">Sua rotina NutzenPet</h2></div><Link href="/produto" className="group hidden items-center gap-2 text-xs font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05] sm:flex">Ver produtos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF1DF] text-[#FE8C05]"><ShoppingBag className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Último pedido</p><strong className="mt-1 block text-lg text-[#123F55]">#NP-2048</strong></article>
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF3F3] text-[#3E1255]"><RefreshCw className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Assinaturas ativas</p><strong className="mt-1 block text-lg text-[#123F55]">1 produto</strong></article>
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><CalendarDays className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Próxima entrega</p><strong className="mt-1 block text-lg text-[#123F55]">24 out. 2026</strong></article>
              </div>
            </section>

            <section id="assinatura" className="scroll-mt-32 overflow-hidden rounded-lg border border-[#E2D4E9] bg-[#F5EFF8]">
              <div className="flex flex-col gap-6 p-6 sm:p-8 xl:flex-row xl:items-center">
                <div className="relative mx-auto h-52 w-44 shrink-0 sm:h-60 sm:w-52 xl:mx-0"><Image src={subscriptionProduct.images[0]} alt={subscriptionProduct.name} fill sizes="208px" className="object-contain drop-shadow-[0_16px_16px_rgba(62,18,85,.15)]" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Minha assinatura · Nutzen Club</p><span className="rounded-full bg-[#3E1255] px-3 py-1 text-[10px] font-black uppercase text-white">Ativa</span></div>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-[#123F55]">{subscriptionProduct.name}</h2>
                  <div className="mt-5 grid gap-4 border-y border-[#E2D4E9] py-5 text-sm sm:grid-cols-3">
                    <div><span className="block text-xs text-slate-500">Quantidade</span><strong className="mt-1 block text-[#123F55]">1 embalagem</strong></div>
                    <div><span className="block text-xs text-slate-500">Frequência</span><strong className="mt-1 block text-[#123F55]">A cada 30 dias</strong></div>
                    <div><span className="block text-xs text-slate-500">Próxima entrega</span><strong className="mt-1 block text-[#123F55]">24 de outubro</strong></div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><span className="block text-xs text-slate-500">Valor da assinatura</span><strong className="text-xl text-[#3E1255]">{subscriptionProduct.price}</strong></div><div className="flex flex-wrap gap-2"><button type="button" className="rounded-full border border-[#3E1255] px-4 py-2 text-xs font-black text-[#3E1255] transition-colors duration-300 hover:bg-white">Alterar frequência</button><button type="button" className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black text-slate-500 transition-colors duration-300 hover:bg-white hover:text-[#CC632B]"><CirclePause className="h-4 w-4" /> Pausar</button></div></div>
                </div>
              </div>
            </section>

            <section id="pedidos" className="scroll-mt-32 rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Meus pedidos</p><h2 className="mt-1 text-xl font-black text-[#123F55]">Pedido mais recente</h2></div><span className="rounded-full bg-[#FFF1DF] px-3 py-1 text-[10px] font-black uppercase text-[#CC632B]">Em preparação</span></div>
              <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><span className="text-xs text-slate-500">Pedido</span><strong className="mt-1 block text-sm text-[#123F55]">#NP-2048 · 12/09/2026</strong></div><div><span className="text-xs text-slate-500">Total</span><strong className="mt-1 block text-sm text-[#123F55]">R$ 129,90</strong></div><button type="button" className="group flex items-center gap-2 text-xs font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05]">Ver detalhes <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></button></div>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <section id="enderecos" className="scroll-mt-32 rounded-lg border border-slate-200 bg-white p-6"><div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF3F3] text-[#3E1255]"><MapPin className="h-5 w-5" /></span><button type="button" aria-label="Editar endereço" className="text-slate-400 transition-colors duration-300 hover:text-[#FE8C05]"><Pencil className="h-4 w-4" /></button></div><h2 className="mt-5 text-lg font-black text-[#123F55]">Endereço principal</h2><p className="mt-3 text-sm leading-6 text-slate-500">Rua das Acácias, 245<br />Jardins · São Paulo - SP<br />CEP 01415-000</p></section>
              <section id="dados" className="scroll-mt-32 rounded-lg border border-slate-200 bg-white p-6"><div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#FFF1DF] text-[#FE8C05]"><UserRound className="h-5 w-5" /></span><button type="button" aria-label="Editar dados pessoais" className="text-slate-400 transition-colors duration-300 hover:text-[#FE8C05]"><Pencil className="h-4 w-4" /></button></div><h2 className="mt-5 text-lg font-black text-[#123F55]">Dados pessoais</h2><p className="mt-3 text-sm leading-6 text-slate-500">Marina Oliveira<br />marina@exemplo.com<br />(11) 99999-0000</p></section>
            </div>

            <section className="flex flex-col gap-4 rounded-lg bg-[#3E1255] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-center gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-[#FE8C05]"><Heart className="h-5 w-5" /></span><div><h2 className="font-black">Cuidados que acompanham seu pet</h2><p className="mt-1 text-xs text-white/65">Descubra novos produtos para complementar a rotina.</p></div></div><Link href="/produto" className="group flex shrink-0 items-center gap-2 text-xs font-black text-[#D9C7E3] transition-colors duration-300 hover:text-white">Explorar produtos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></section>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400"><CreditCard className="h-3.5 w-3.5" /> Dados demonstrativos para visualização do protótipo</div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
