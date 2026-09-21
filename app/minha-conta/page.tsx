"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePause,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Heart,
  House,
  Landmark,
  MapPin,
  MousePointerClick,
  PackageCheck,
  Pencil,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { featuredProducts } from "../data/products";
import affiliatePet from "../../fotos-extras/border collie.png";

const subscriptionProduct = featuredProducts[1];

const accountLinks = [
  { id: "visao-geral", label: "Visão geral", icon: House },
  { id: "pedidos", label: "Meus pedidos", icon: PackageCheck },
  { id: "assinatura", label: "Minha assinatura", icon: RefreshCw },
  { id: "afiliados", label: "Meus afiliados", icon: BadgeDollarSign },
  { id: "enderecos", label: "Endereços", icon: MapPin },
  { id: "dados", label: "Dados pessoais", icon: UserRound },
] as const;

type AccountTab = (typeof accountLinks)[number]["id"];

const affiliateLink = "https://nutzenpet.com.br/?ref=MARINA25";

const affiliateCommissions = [
  { order: "#NP-2184", date: "16/09/2026", customer: "Primeira compra", value: "R$ 38,97", status: "Aprovada" },
  { order: "#NP-2161", date: "09/09/2026", customer: "Assinatura Nutzen Club", value: "R$ 25,98", status: "Pendente" },
  { order: "#NP-2127", date: "28/08/2026", customer: "Primeira compra", value: "R$ 44,99", status: "Aprovada" },
];

export default function MyAccountPage() {
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>("visao-geral");

  useLayoutEffect(() => {
    const syncTabWithHash = () => {
      const hash = window.location.hash.slice(1);
      const matchingTab = accountLinks.find((item) => item.id === hash);
      if (matchingTab) setActiveTab(matchingTab.id);
    };

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  const selectTab = (tab: AccountTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  const copyAffiliateLink = async () => {
    await navigator.clipboard.writeText(affiliateLink);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2200);
  };

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
            <label className="grid gap-2 text-xs font-black text-[#123F55] lg:hidden">
              Área da minha conta
              <select
                value={activeTab}
                onChange={(event) => selectTab(event.target.value as AccountTab)}
                className="h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm font-bold text-[#3E1255] outline-none transition-shadow duration-300 focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)]"
              >
                {accountLinks.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
            <nav role="tablist" aria-label="Navegação da conta" className="hidden w-full gap-2 lg:grid">
              {accountLinks.map(({ id, label, icon: Icon }) => {
                const selected = activeTab === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    onClick={() => selectTab(id)}
                    aria-selected={selected}
                    aria-controls={id}
                    className={`group flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold transition-colors duration-300 ${selected ? "bg-[#3E1255] text-white" : "text-slate-600 hover:bg-[#F5EFF8] hover:text-[#3E1255]"}`}
                  >
                    <Icon className={`h-4 w-4 ${selected ? "text-[#D9C7E3]" : "text-[#3E1255]"}`} />
                    {label}
                  </button>
                );
              })}
            </nav>
            <Link href="/conta" className="mt-5 hidden items-center gap-2 px-4 text-xs font-bold text-slate-400 transition-colors duration-300 hover:text-[#CC632B] lg:flex">Sair da conta <ArrowRight className="h-3.5 w-3.5" /></Link>
          </aside>

          <div className="min-w-0 space-y-8">
            <section id="visao-geral" className={activeTab === "visao-geral" ? "reveal-up" : "hidden"}>
              <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Visão geral</p><h2 className="mt-1 text-2xl font-black text-[#123F55]">Sua rotina NutzenPet</h2></div><Link href="/produto" className="group hidden items-center gap-2 text-xs font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05] sm:flex">Ver produtos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF1DF] text-[#FE8C05]"><ShoppingBag className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Último pedido</p><strong className="mt-1 block text-lg text-[#123F55]">#NP-2048</strong></article>
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF3F3] text-[#3E1255]"><RefreshCw className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Assinaturas ativas</p><strong className="mt-1 block text-lg text-[#123F55]">1 produto</strong></article>
                <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><CalendarDays className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">Próxima entrega</p><strong className="mt-1 block text-lg text-[#123F55]">24 out. 2026</strong></article>
              </div>
            </section>

            <section id="assinatura" className={`${activeTab === "assinatura" ? "reveal-up" : "hidden"} overflow-hidden rounded-lg border border-[#E2D4E9] bg-[#F5EFF8]`}>
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

            <section id="afiliados" className={`${activeTab === "afiliados" ? "reveal-up" : "hidden"} overflow-hidden rounded-lg border border-[#E2D4E9] bg-white`}>
              <div className="relative overflow-hidden bg-[#3E1255] px-6 py-7 text-white sm:px-8 sm:py-9">
                <FloatingMotifs className="text-white opacity-10" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D9C7E3]">Programa de afiliados</p>
                      <span className="rounded-full bg-[#FE8C05] px-3 py-1 text-[9px] font-black uppercase text-white">Conta ativa</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">Seu painel de indicações</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Compartilhe a NutzenPet, acompanhe suas vendas e gerencie seus recebimentos em um só lugar.</p>
                  </div>
                  <Link href="/afiliados" className="group flex shrink-0 items-center gap-2 text-xs font-black text-[#FFD39C] transition-colors duration-300 hover:text-white">
                    Regras do programa <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Comissão disponível", value: "R$ 312,80", note: "Liberada para saque", icon: WalletCards, accent: "text-[#FE8C05]" },
                  { label: "Comissão pendente", value: "R$ 173,40", note: "Aguardando aprovação", icon: Clock3, accent: "text-[#3E1255]" },
                  { label: "Vendas indicadas", value: "32", note: "Neste ciclo", icon: Users, accent: "text-[#3E1255]" },
                  { label: "Taxa de conversão", value: "2,5%", note: "1.284 cliques", icon: TrendingUp, accent: "text-[#FE8C05]" },
                ].map(({ label, value, note, icon: Icon, accent }) => (
                  <div key={label} className="border-b border-slate-200 p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
                    <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-500">{label}</span><Icon className={`h-4 w-4 ${accent}`} /></div>
                    <strong className="mt-3 block text-2xl font-black text-[#123F55]">{value}</strong>
                    <span className="mt-1 block text-[10px] text-slate-400">{note}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-3"><MousePointerClick className="h-5 w-5 text-[#3E1255]" /><h3 className="font-black text-[#123F55]">Meu link de afiliado</h3></div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Use este link em suas redes e conteúdos. As compras realizadas por ele são atribuídas à sua conta.</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
                      <span className="block truncate">{affiliateLink}</span>
                    </div>
                    <button type="button" onClick={copyAffiliateLink} className="group flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#3E1255] px-5 text-xs font-black text-white transition-all duration-300 hover:bg-[#5B2674] active:scale-95">
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {linkCopied ? "Link copiado" : "Copiar link"}
                    </button>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-slate-500"><span><strong className="text-[#123F55]">Código:</strong> MARINA25</span><span><strong className="text-[#123F55]">Comissão:</strong> 10% por venda</span><span><strong className="text-[#123F55]">Cookie:</strong> 30 dias</span></div>
                </div>

                <div className="bg-[#FBF8FC] p-6 sm:p-8">
                  <div className="flex items-center gap-3"><Landmark className="h-5 w-5 text-[#3E1255]" /><h3 className="font-black text-[#123F55]">Recebimentos</h3></div>
                  <p className="mt-4 text-xs text-slate-500">Saldo disponível</p>
                  <strong className="mt-1 block text-3xl font-black text-[#3E1255]">R$ 312,80</strong>
                  <button type="button" className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[#FE8C05] px-5 text-xs font-black text-white transition-all duration-300 hover:bg-[#CC632B] active:scale-95">Solicitar saque</button>
                  <div className="mt-4 space-y-1.5 text-[10px] leading-4 text-slate-500"><p>Recebimento via Pix cadastrado</p><p>Saque mínimo de R$ 100,00</p><p>Próximo processamento: 20/09</p></div>
                </div>
              </div>

              <div className="border-t border-slate-200 px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3E1255]">Movimentações</p><h3 className="mt-1 font-black text-[#123F55]">Comissões recentes</h3></div><button type="button" className="text-xs font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05]">Ver extrato completo</button></div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.12em] text-slate-400"><th className="pb-3 font-bold">Pedido</th><th className="pb-3 font-bold">Data</th><th className="pb-3 font-bold">Origem</th><th className="pb-3 font-bold">Comissão</th><th className="pb-3 text-right font-bold">Status</th></tr></thead>
                    <tbody>{affiliateCommissions.map((commission) => <tr key={commission.order} className="border-b border-slate-100 last:border-0"><td className="py-4 font-black text-[#123F55]">{commission.order}</td><td className="py-4 text-slate-500">{commission.date}</td><td className="py-4 text-slate-500">{commission.customer}</td><td className="py-4 font-black text-[#3E1255]">{commission.value}</td><td className="py-4 text-right"><span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${commission.status === "Aprovada" ? "bg-[#EEF7E6] text-[#587A2F]" : "bg-[#FFF1DF] text-[#B45B00]"}`}>{commission.status}</span></td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="pedidos" className={`${activeTab === "pedidos" ? "reveal-up" : "hidden"} rounded-lg border border-slate-200 bg-white p-6 sm:p-8`}>
              <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Meus pedidos</p><h2 className="mt-1 text-xl font-black text-[#123F55]">Pedido mais recente</h2></div><span className="rounded-full bg-[#FFF1DF] px-3 py-1 text-[10px] font-black uppercase text-[#CC632B]">Em preparação</span></div>
              <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><span className="text-xs text-slate-500">Pedido</span><strong className="mt-1 block text-sm text-[#123F55]">#NP-2048 · 12/09/2026</strong></div><div><span className="text-xs text-slate-500">Total</span><strong className="mt-1 block text-sm text-[#123F55]">R$ 129,90</strong></div><button type="button" className="group flex items-center gap-2 text-xs font-black text-[#3E1255] transition-colors duration-300 hover:text-[#FE8C05]">Ver detalhes <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></button></div>
            </section>

            <div className={activeTab === "enderecos" || activeTab === "dados" ? "grid gap-5" : "hidden"}>
              <section id="enderecos" className={`${activeTab === "enderecos" ? "reveal-up" : "hidden"} rounded-lg border border-slate-200 bg-white p-6 sm:p-8`}><div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF3F3] text-[#3E1255]"><MapPin className="h-5 w-5" /></span><button type="button" aria-label="Editar endereço" className="text-slate-400 transition-colors duration-300 hover:text-[#FE8C05]"><Pencil className="h-4 w-4" /></button></div><h2 className="mt-5 text-lg font-black text-[#123F55]">Endereço principal</h2><p className="mt-3 text-sm leading-6 text-slate-500">Rua das Acácias, 245<br />Jardins · São Paulo - SP<br />CEP 01415-000</p></section>
              <section id="dados" className={`${activeTab === "dados" ? "reveal-up" : "hidden"} rounded-lg border border-slate-200 bg-white p-6 sm:p-8`}><div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#FFF1DF] text-[#FE8C05]"><UserRound className="h-5 w-5" /></span><button type="button" aria-label="Editar dados pessoais" className="text-slate-400 transition-colors duration-300 hover:text-[#FE8C05]"><Pencil className="h-4 w-4" /></button></div><h2 className="mt-5 text-lg font-black text-[#123F55]">Dados pessoais</h2><p className="mt-3 text-sm leading-6 text-slate-500">Marina Oliveira<br />marina@exemplo.com<br />(11) 99999-0000</p></section>
            </div>

            <section
              className={`${activeTab === "afiliados" ? "reveal-up" : "hidden"} relative min-h-[280px] overflow-hidden rounded-lg text-white`}
            >
              <Image src={affiliatePet} alt="Border collie saudável" fill quality={88} sizes="(max-width: 1024px) 100vw, 950px" className="object-cover object-[center_38%]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(62,18,85,.97)_0%,rgba(62,18,85,.9)_46%,rgba(62,18,85,.2)_78%)]" aria-hidden="true" />
              <div className="relative flex min-h-[280px] max-w-xl flex-col justify-center p-7 sm:p-9">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#FE8C05]"><Heart className="h-5 w-5" /></span>
                <h2 className="mt-5 text-2xl font-black sm:text-3xl">Cuidado que gera novas conexões.</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/75">Compartilhe seu link, ajude mais tutores a escolherem uma nutrição de qualidade e acompanhe cada resultado.</p>
                <button type="button" onClick={copyAffiliateLink} className="group mt-6 flex h-11 w-fit items-center gap-2 rounded-full bg-[#FE8C05] px-5 text-xs font-black text-white transition-all duration-300 hover:bg-[#CC632B] active:scale-95">
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? "Link copiado" : "Compartilhar meu link"}
                </button>
              </div>
            </section>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400"><CreditCard className="h-3.5 w-3.5" /> Dados demonstrativos para visualização do protótipo</div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
