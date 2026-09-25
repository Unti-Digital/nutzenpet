"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeDollarSign, Banknote, BarChart3, Check, Copy, ExternalLink, LayoutDashboard, Link2, Megaphone, MousePointerClick, PackageCheck, Plus, Search, Settings, WalletCards } from "lucide-react";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

type Tab = "overview" | "links" | "campaigns" | "commissions" | "withdrawals" | "settings";
type Affiliate = { code: string; status: string; link: string; balances: Array<{ status: string; amount: string }>; sales_count: number; commission_count: number; referred_total: number; attribution_days: number; available_balance: number; minimum_withdrawal: number; pix?: PixProfile };
type Dashboard = { clicks: number; orders: number; conversion_rate: number; campaigns: number; links: number };
type Campaign = { id: number; name: string; status: string; created_at: string };
type AffiliateLink = { id: number; campaign_id: number; campaign_name?: string; product_id: number; product_name?: string; channel: string; token: string; url: string; status: string; clicks: number; orders_count: number; created_at: string };
type Commission = { id: number; order_number: string; product_name: string; source: string; commission_amount: string; status: string; created_at: string };
type Withdrawal = { id: number; ticket_number: string; amount: string; status: string; note: string; pix_snapshot_last4?: string; payment_reference?: string; paid_at?: string | null; created_at: string };
type PixProfile = { configured: boolean; type: string; masked_key: string; holder_name: string; updated_at?: string | null };
type ProductOption = { id: number; name: string; slug: string; weight: string };

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "links", label: "Meus links", icon: Link2 },
  { id: "campaigns", label: "Campanhas", icon: Megaphone },
  { id: "commissions", label: "Comissões", icon: BadgeDollarSign },
  { id: "withdrawals", label: "Saques", icon: WalletCards },
  { id: "settings", label: "Dados de recebimento", icon: Settings },
];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Não foi possível concluir a solicitação.");
  return payload;
}

function money(value: string | number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard>({ clicks: 0, orders: 0, conversion_rate: 0, campaigns: 0, links: 0 });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [filter, setFilter] = useState("");

  async function load() {
    try {
      const me = await api<{ user: unknown }>("/api/auth/me");
      if (!me.user) throw new Error("Sessão expirada.");
      const [affiliateData, dashboardData, campaignData, linkData, commissionData, withdrawalData, productData] = await Promise.all([
        api<Affiliate>("/api/auth/affiliate"),
        api<Dashboard>("/api/auth/affiliate-dashboard"),
        api<{ items: Campaign[] }>("/api/auth/affiliate-campaigns"),
        api<{ items: AffiliateLink[] }>("/api/auth/affiliate-links"),
        api<{ items: Commission[] }>("/api/auth/commissions"),
        api<{ items: Withdrawal[] }>("/api/auth/withdrawals"),
        api<{ items: ProductOption[] }>("/api/content/products"),
      ]);
      setAffiliate(affiliateData);
      setDashboard(dashboardData);
      setCampaigns(campaignData.items);
      setLinks(linkData.items);
      setCommissions(commissionData.items);
      setWithdrawals(withdrawalData.items);
      setProducts(productData.items);
    } catch {
      router.replace("/minha-conta");
      return;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/affiliate-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name") }) });
      event.currentTarget.reset();
      setMessage("Campanha criada.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar a campanha."); }
  }

  async function createLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/affiliate-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: Number(form.get("product_id")), campaign_id: Number(form.get("campaign_id") || 0), channel: form.get("channel") }) });
      setMessage("Link rastreável criado.");
      await load();
      setTab("links");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar o link."); }
  }

  async function savePix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const pix = await api<PixProfile>("/api/auth/affiliate-pix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.get("type"), key: form.get("key"), holder_name: form.get("holder_name") }) });
      setAffiliate((current) => current ? { ...current, pix } : current);
      event.currentTarget.reset();
      setMessage("Chave PIX atualizada com segurança.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar a chave PIX."); }
  }

  async function requestWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ ticket_number: string }>("/api/auth/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(form.get("amount")), note: form.get("note") }) });
      setMessage(`Ticket ${result.ticket_number} aberto para conferência manual.`);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível solicitar o saque."); }
  }

  const visibleLinks = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("pt-BR");
    if (!query) return links;
    return links.filter((link) => `${link.product_name} ${link.campaign_name} ${link.channel}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [filter, links]);

  if (loading || !affiliate) return <main className="grid min-h-screen place-items-center bg-[#fffef9]"><p className="text-sm font-black text-[#3E1255]">Carregando painel de afiliado...</p></main>;

  const approved = Number(affiliate.available_balance || affiliate.balances.find((item) => item.status === "approved")?.amount || 0);
  const pending = Number(affiliate.balances.find((item) => item.status === "pending")?.amount || 0);
  const openWithdrawal = withdrawals.some((item) => ["requested", "in_review"].includes(item.status));

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="bg-[#3E1255] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]">Programa de afiliados</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">Painel de indicações</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Crie links por produto e campanha e acompanhe somente os resultados realmente rastreados.</p></div>
          <Link href="/minha-conta" className="flex items-center gap-2 text-xs font-black text-[#FFD39C]"><ArrowLeft className="h-4 w-4" /> Voltar à minha conta</Link>
        </div>
      </section>
      <section className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-[1240px] gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:h-fit"><select value={tab} onChange={(event) => setTab(event.target.value as Tab)} className="h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm font-bold text-[#3E1255] lg:hidden">{tabs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><nav className="hidden gap-2 lg:grid">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold transition-colors ${tab === id ? "bg-[#3E1255] text-white" : "text-slate-600 hover:bg-[#F5EFF8] hover:text-[#3E1255]"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></aside>
          <div className="min-w-0">
            {message && <p role="status" className="mb-5 rounded-md bg-[#F5EFF8] p-4 text-sm font-bold text-[#3E1255]">{message}</p>}
            {tab === "overview" && <div className="grid gap-6"><section className="grid gap-px overflow-hidden rounded-lg border border-[#E2D4E9] bg-[#E2D4E9] sm:grid-cols-2 xl:grid-cols-4"><Metric icon={MousePointerClick} label="Cliques válidos" value={String(dashboard.clicks)} /><Metric icon={PackageCheck} label="Pedidos atribuídos" value={String(dashboard.orders)} /><Metric icon={BarChart3} label="Conversão" value={`${dashboard.conversion_rate.toLocaleString("pt-BR")}%`} /><Metric icon={Banknote} label="Saldo disponível" value={money(approved)} /></section><section className="rounded-lg border border-[#E2D4E9] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3E1255]">Criação rápida</p><h2 className="mt-2 text-2xl font-black text-[#123F55]">Gerar novo link</h2></div><Link2 className="h-7 w-7 text-[#FE8C05]" /></div><LinkForm products={products} campaigns={campaigns} onSubmit={createLink} /></section><section className="grid gap-4 sm:grid-cols-2"><article className="rounded-lg bg-[#F5EFF8] p-6"><span className="text-xs text-slate-500">Comissão pendente</span><strong className="mt-2 block text-3xl text-[#3E1255]">{money(pending)}</strong></article><article className="rounded-lg bg-[#F5EFF8] p-6"><span className="text-xs text-slate-500">Links ativos</span><strong className="mt-2 block text-3xl text-[#3E1255]">{dashboard.links}</strong></article></section></div>}
            {tab === "links" && <section><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black text-[#123F55]">Meus links</h2><p className="mt-2 text-sm text-slate-500">Um produto pode ter vários links para campanhas e canais diferentes.</p></div><button type="button" onClick={() => setTab("overview")} className="flex h-11 items-center gap-2 rounded-full bg-[#FE8C05] px-5 text-xs font-black text-white"><Plus className="h-4 w-4" /> Novo link</button></div><label className="mt-5 flex h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4"><Search className="h-4 w-4 text-slate-400" /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar por produto, campanha ou canal" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><div className="mt-5 grid gap-3">{visibleLinks.length ? visibleLinks.map((link) => <LinkCard key={link.id} link={link} onCopied={() => setMessage("Link copiado.")} />) : <Empty text="Nenhum link encontrado." />}</div></section>}
            {tab === "campaigns" && <section><h2 className="text-2xl font-black text-[#123F55]">Campanhas</h2><form onSubmit={createCampaign} className="mt-5 flex flex-col gap-3 rounded-lg border border-[#E2D4E9] bg-white p-5 sm:flex-row"><input name="name" required maxLength={160} placeholder="Ex.: Instagram Setembro" className="h-12 min-w-0 flex-1 rounded-md border border-slate-200 px-4 text-sm outline-none focus:border-[#3E1255]" /><button className="h-12 rounded-full bg-[#3E1255] px-6 text-xs font-black text-white">Criar campanha</button></form><div className="mt-5 grid gap-3 sm:grid-cols-2">{campaigns.length ? campaigns.map((campaign) => <article key={campaign.id} className="rounded-lg border border-[#E2D4E9] bg-white p-5"><div className="flex items-center justify-between gap-3"><strong className="text-[#123F55]">{campaign.name}</strong><span className="rounded-full bg-[#F5EFF8] px-3 py-1 text-[9px] font-black uppercase text-[#3E1255]">{campaign.status}</span></div><p className="mt-3 text-xs text-slate-400">Criada em {new Date(campaign.created_at.replace(" ", "T") + "Z").toLocaleDateString("pt-BR")}</p></article>) : <Empty text="Crie sua primeira campanha para organizar os links." />}</div></section>}
            {tab === "commissions" && <section><h2 className="text-2xl font-black text-[#123F55]">Comissões</h2><DataTable commissions={commissions} /></section>}
            {tab === "withdrawals" && <section><h2 className="text-2xl font-black text-[#123F55]">Saques e pagamentos</h2><div className="mt-5 grid gap-5 xl:grid-cols-[.75fr_1.25fr]"><form onSubmit={requestWithdrawal} className="rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6"><p className="text-xs text-slate-500">Saldo aprovado disponível</p><strong className="mt-2 block text-3xl text-[#3E1255]">{money(approved)}</strong><label className="mt-5 grid gap-2 text-xs font-bold text-slate-600">Valor<input name="amount" type="number" required min={affiliate.minimum_withdrawal} max={approved || undefined} step="0.01" className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label><label className="mt-4 grid gap-2 text-xs font-bold text-slate-600">Observação opcional<textarea name="note" rows={3} className="rounded-md border border-[#D9C7E3] bg-white p-4" /></label><button disabled={openWithdrawal || !affiliate.pix?.configured} className="mt-4 h-12 w-full rounded-full bg-[#FE8C05] text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-45">{openWithdrawal ? "Ticket em análise" : "Solicitar saque"}</button>{!affiliate.pix?.configured && <button type="button" onClick={() => setTab("settings")} className="mt-3 w-full text-xs font-black text-[#3E1255]">Cadastrar PIX para continuar</button>}<p className="mt-4 text-xs leading-5 text-slate-500">O pagamento é manual e só aparecerá como pago após confirmação administrativa.</p></form><div className="grid content-start gap-3">{withdrawals.length ? withdrawals.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-[#3E1255]">{item.ticket_number}</strong><p className="mt-1 text-xs text-slate-400">{new Date(item.created_at.replace(" ", "T") + "Z").toLocaleDateString("pt-BR")}</p></div><strong className="text-[#123F55]">{money(item.amount)}</strong><Status value={item.status} /></div>{item.payment_reference && <p className="mt-3 text-xs text-slate-500">Referência: {item.payment_reference}</p>}</article>) : <Empty text="Nenhum saque solicitado." />}</div></div></section>}
            {tab === "settings" && <section><h2 className="text-2xl font-black text-[#123F55]">Dados de recebimento</h2>{affiliate.pix?.configured && <div className="mt-5 rounded-lg border border-[#D9C7E3] bg-[#F5EFF8] p-5"><div className="flex items-center gap-3"><Check className="h-5 w-5 text-[#3E1255]" /><strong className="text-[#123F55]">PIX cadastrado</strong></div><p className="mt-3 text-sm text-slate-600">{affiliate.pix.holder_name} · {affiliate.pix.type.toUpperCase()} · {affiliate.pix.masked_key}</p></div>}<form onSubmit={savePix} className="mt-5 grid gap-4 rounded-lg border border-[#E2D4E9] bg-white p-6 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-600">Tipo<select name="type" required className="h-12 rounded-md border border-slate-200 bg-white px-4"><option value="">Selecione</option><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="email">E-mail</option><option value="phone">Telefone</option><option value="random">Chave aleatória</option></select></label><label className="grid gap-2 text-xs font-bold text-slate-600">Titular<input name="holder_name" required className="h-12 rounded-md border border-slate-200 px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Chave PIX<input name="key" required autoComplete="off" className="h-12 rounded-md border border-slate-200 px-4" /></label><button className="h-12 rounded-full bg-[#3E1255] px-6 text-xs font-black text-white sm:w-fit">Salvar chave PIX</button><p className="self-center text-xs leading-5 text-slate-400">A chave é criptografada e não é exibida integralmente após o cadastro.</p></form></section>}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function LinkForm({ products, campaigns, onSubmit }: { products: ProductOption[]; campaigns: Campaign[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Produto<select name="product_id" required className="h-12 rounded-md border border-slate-200 bg-white px-4"><option value="">Selecione um produto publicado</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.weight}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-slate-600">Campanha<select name="campaign_id" className="h-12 rounded-md border border-slate-200 bg-white px-4"><option value="0">Sem campanha</option>{campaigns.filter((item) => item.status === "active").map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-slate-600">Canal<select name="channel" required className="h-12 rounded-md border border-slate-200 bg-white px-4"><option value="instagram">Instagram</option><option value="whatsapp">WhatsApp</option><option value="youtube">YouTube</option><option value="site">Site / blog</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option><option value="email">E-mail</option><option value="other">Outro</option></select></label><button className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#FE8C05] px-6 text-xs font-black text-white sm:col-span-2 sm:w-fit"><Plus className="h-4 w-4" /> Gerar link rastreável</button></form>;
}

function LinkCard({ link, onCopied }: { link: AffiliateLink; onCopied: () => void }) {
  async function copy() { await navigator.clipboard.writeText(link.url); onCopied(); }
  return <article className="rounded-lg border border-[#E2D4E9] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#F5EFF8] px-3 py-1 text-[9px] font-black uppercase text-[#3E1255]">{link.channel}</span>{link.campaign_name && <span className="rounded-full bg-orange-50 px-3 py-1 text-[9px] font-black uppercase text-[#CC632B]">{link.campaign_name}</span>}</div><h3 className="mt-3 font-black text-[#123F55]">{link.product_name}</h3></div><div className="flex gap-5 text-center"><div><strong className="block text-lg text-[#3E1255]">{link.clicks}</strong><span className="text-[10px] text-slate-400">cliques</span></div><div><strong className="block text-lg text-[#3E1255]">{link.orders_count}</strong><span className="text-[10px] text-slate-400">pedidos</span></div></div></div><div className="mt-4 flex gap-2"><input readOnly value={link.url} aria-label="Link rastreável" className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600" /><button type="button" onClick={() => void copy()} title="Copiar link" className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#3E1255] text-white"><Copy className="h-4 w-4" /></button><a href={link.url} target="_blank" rel="noreferrer" title="Abrir link" className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#3E1255] text-[#3E1255]"><ExternalLink className="h-4 w-4" /></a></div></article>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof LayoutDashboard; label: string; value: string }) { return <article className="bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="h-4 w-4 text-[#FE8C05]" /></div><strong className="mt-3 block text-2xl text-[#123F55]">{value}</strong></article>; }
function Empty({ text }: { text: string }) { return <div className="rounded-lg border border-dashed border-[#D9C7E3] bg-white p-8 text-center text-sm text-slate-400">{text}</div>; }
function Status({ value }: { value: string }) { const labels: Record<string, string> = { requested: "Solicitado", in_review: "Em análise", paid: "Pago", approved: "Aprovada", pending: "Pendente", reversed: "Estornada", rejected: "Rejeitado", cancelled: "Cancelado" }; const styles: Record<string, string> = { paid: "bg-green-50 text-green-700", approved: "bg-green-50 text-green-700", requested: "bg-orange-50 text-[#CC632B]", pending: "bg-orange-50 text-[#CC632B]", rejected: "bg-red-50 text-red-700", reversed: "bg-slate-100 text-slate-500", cancelled: "bg-slate-100 text-slate-500" }; return <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${styles[value] ?? "bg-[#F5EFF8] text-[#3E1255]"}`}>{labels[value] ?? value}</span>; }
function DataTable({ commissions }: { commissions: Commission[] }) { return <div className="mt-5 overflow-x-auto rounded-lg border border-[#E2D4E9] bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[.14em] text-slate-400"><th className="p-4">Pedido</th><th className="p-4">Data</th><th className="p-4">Produto</th><th className="p-4">Comissão</th><th className="p-4 text-right">Status</th></tr></thead><tbody>{commissions.length ? commissions.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-black text-[#123F55]">#{item.order_number}</td><td className="p-4 text-slate-500">{new Date(item.created_at.replace(" ", "T") + "Z").toLocaleDateString("pt-BR")}</td><td className="p-4"><strong className="block text-slate-600">{item.product_name}</strong><span className="text-xs text-slate-400">{item.source}</span></td><td className="p-4 font-black text-[#3E1255]">{money(item.commission_amount)}</td><td className="p-4 text-right"><Status value={item.status} /></td></tr>) : <tr><td colSpan={5} className="p-10 text-center text-slate-400">Nenhuma comissão registrada.</td></tr>}</tbody></table></div>; }
