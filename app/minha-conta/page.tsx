"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BadgeDollarSign, Banknote, Box, CirclePause, Clock3, Copy, ExternalLink, House, Link2, LogOut, MapPin, PackageCheck, ReceiptText, RefreshCw, RotateCcw, ShoppingBag, UserRound } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

type AccountTab = "visao-geral" | "pedidos" | "assinatura" | "afiliados" | "enderecos" | "dados";
type UserData = { id: number; email: string; name: string; first_name: string; last_name: string };
type OrderData = { id: number; number: string; status: string; date: string | null; currency: string; total: string; payment_method: string };
type SubscriptionData = { id: number; product_id: number; product_name?: string; product_slug?: string; product_image?: string; product_weight?: string; plan_name?: string; quantity: number; interval_value: number; interval_unit: string; discount_type: string; discount_value: number; status: string; next_charge_date: string | null; currency?: string; unit_price?: number; subscription_total?: number };
type AffiliateData = { code: string; status: string; link: string; balances: Array<{ status: string; amount: string }>; sales_count: number; commission_count: number; referred_total: number; attribution_days: number };
type CommissionData = { id: number; order_id: number; order_number: string; product_name: string; source: string; commission_amount: string; commission_rate: string; commission_type: string; status: string; created_at: string };
type AddressData = Record<string, string>;

const accountLinks: Array<{ id: AccountTab; label: string; icon: typeof House }> = [
  { id: "visao-geral", label: "Visão geral", icon: House },
  { id: "pedidos", label: "Meus pedidos", icon: PackageCheck },
  { id: "assinatura", label: "Minha assinatura", icon: RefreshCw },
  { id: "afiliados", label: "Meus afiliados", icon: BadgeDollarSign },
  { id: "enderecos", label: "Endereços", icon: MapPin },
  { id: "dados", label: "Dados pessoais", icon: UserRound },
];

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  processing: "Em processamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  active: "Ativa",
  paused: "Pausada",
  pending_gateway: "Aguardando pagamento recorrente",
};

const brazilianStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

async function getJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

export default function MyAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AccountTab>("visao-geral");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [addresses, setAddresses] = useState<{ billing: AddressData; shipping: AddressData } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAccount() {
    const me = await getJson<{ user: UserData }>("/api/auth/me");
    if (!me?.user) {
      router.replace("/conta");
      return;
    }
    setUser(me.user);
    const [orderPayload, subscriptionPayload, affiliatePayload, commissionPayload, addressPayload] = await Promise.all([
      getJson<{ items: OrderData[] }>("/api/auth/orders"),
      getJson<{ items: SubscriptionData[] }>("/api/auth/subscriptions"),
      getJson<AffiliateData>("/api/auth/affiliate"),
      getJson<{ items: CommissionData[] }>("/api/auth/commissions"),
      getJson<{ billing: AddressData; shipping: AddressData }>("/api/auth/addresses"),
    ]);
    setOrders(orderPayload?.items ?? []);
    setSubscriptions(subscriptionPayload?.items ?? []);
    setAffiliate(affiliatePayload);
    setCommissions(commissionPayload?.items ?? []);
    setAddresses(addressPayload);
    setLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const requestedTab = window.location.hash.replace("#", "") as AccountTab;
      if (accountLinks.some((item) => item.id === requestedTab)) setActiveTab(requestedTab);
      void loadAccount();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    router.replace("/conta");
    router.refresh();
  }

  async function subscriptionAction(id: number, action: "pause" | "cancel" | "reactivate") {
    const response = await fetch(`/api/subscriptions/${id}/${action}`, { method: "POST" });
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    setMessage(response.ok ? "Assinatura atualizada." : payload?.message ?? "Não foi possível atualizar a assinatura.");
    if (response.ok) {
      if (action === "cancel") setActiveTab("visao-geral");
      await loadAccount();
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first_name: form.get("first_name"), last_name: form.get("last_name") }) });
    const payload = await response.json().catch(() => null) as { user?: UserData; message?: string } | null;
    if (response.ok && payload?.user) setUser(payload.user);
    setMessage(response.ok ? "Dados pessoais atualizados." : payload?.message ?? "Não foi possível salvar os dados.");
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = {
      first_name: String(form.get("first_name") ?? ""),
      last_name: String(form.get("last_name") ?? ""),
      company: String(form.get("company") ?? ""),
      address_1: String(form.get("address_1") ?? ""),
      address_2: String(form.get("address_2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      country: "BR",
      phone: String(form.get("phone") ?? ""),
      email: user?.email ?? "",
    };
    const response = await fetch("/api/auth/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipping: address, billing: address }),
    });
    const payload = await response.json().catch(() => null) as { billing?: AddressData; shipping?: AddressData; message?: string } | null;
    if (response.ok && payload?.shipping && payload.billing) setAddresses({ billing: payload.billing, shipping: payload.shipping });
    setMessage(response.ok ? "Endereço atualizado com sucesso." : payload?.message ?? "Não foi possível salvar o endereço.");
  }

  if (loading || !user) return <main className="grid min-h-screen place-items-center bg-[#fffef9]"><p className="text-sm font-black text-[#3E1255]">Carregando sua conta...</p></main>;

  const latestOrder = orders[0];
  const shipping = addresses?.shipping;
  const visibleSubscriptions = subscriptions.filter((subscription) => subscription.status !== "cancelled");
  const hasSubscription = visibleSubscriptions.length > 0;
  const visibleAccountLinks = accountLinks.filter((item) => {
    if (item.id === "assinatura") return hasSubscription;
    if (item.id === "afiliados") return affiliate !== null;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-[#E2D4E9] bg-[#F5EFF8] px-5 py-10 sm:px-8 sm:py-12">
        <FloatingMotifs className="opacity-45" />
        <div className="relative mx-auto flex max-w-[1180px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Área do cliente</p><h1 className="mt-2 text-3xl font-black text-[#123F55] sm:text-4xl">Olá, {user.first_name || user.name}</h1><p className="mt-2 text-sm text-slate-600">Acompanhe seus pedidos, dados e programas NutzenPet.</p></div>
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#3E1255] text-white"><UserRound className="h-6 w-6" /></span><div><strong className="block text-sm text-[#123F55]">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></div></div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
            <select value={activeTab} onChange={(event) => setActiveTab(event.target.value as AccountTab)} className="h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm font-bold text-[#3E1255] lg:hidden">{visibleAccountLinks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <nav className="hidden gap-2 lg:grid">{visibleAccountLinks.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold transition-colors ${activeTab === id ? "bg-[#3E1255] text-white" : "text-slate-600 hover:bg-[#F5EFF8] hover:text-[#3E1255]"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>
            <button type="button" onClick={() => void logout()} className="mt-5 hidden items-center gap-2 px-4 text-xs font-bold text-slate-400 hover:text-[#CC632B] lg:flex"><LogOut className="h-4 w-4" />Sair da conta</button>
          </aside>

          <div className="min-w-0">
            {message && <p role="status" className="mb-6 rounded-md bg-[#F5EFF8] p-4 text-sm font-bold text-[#3E1255]">{message}</p>}

            {activeTab === "visao-geral" && <section className="reveal-up"><h2 className="text-2xl font-black text-[#123F55]">Sua rotina NutzenPet</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><SummaryCard icon={PackageCheck} label="Último pedido" value={latestOrder ? `#${latestOrder.number}` : "Nenhum pedido"} />{hasSubscription && <SummaryCard icon={RefreshCw} label="Assinaturas" value={`${visibleSubscriptions.length} ${visibleSubscriptions.length === 1 ? "plano" : "planos"}`} />}{affiliate && <SummaryCard icon={BadgeDollarSign} label="Afiliado" value="Conta ativa" />}</div><Link href="/produto" className="group mt-7 inline-flex items-center gap-2 text-sm font-black text-[#3E1255]">Conhecer produtos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" /></Link></section>}

            {activeTab === "pedidos" && <section className="reveal-up"><h2 className="text-2xl font-black text-[#123F55]">Meus pedidos</h2><div className="mt-5 grid gap-3">{orders.length === 0 ? <EmptyState icon={Box} title="Nenhum pedido encontrado" text="Seus pedidos do WooCommerce aparecerão aqui." /> : orders.map((order) => <article key={order.id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><strong className="text-[#123F55]">Pedido #{order.number}</strong><p className="mt-1 text-xs text-slate-500">{order.date ? new Date(order.date).toLocaleDateString("pt-BR") : "Data indisponível"}</p></div><span className="text-sm font-bold text-[#3E1255]">R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span><span className="rounded-full bg-[#F5EFF8] px-3 py-1 text-[10px] font-black uppercase text-[#3E1255]">{statusLabels[order.status] ?? order.status}</span></article>)}</div></section>}

            {activeTab === "assinatura" && hasSubscription && <SubscriptionPanel subscriptions={visibleSubscriptions} onAction={subscriptionAction} />}

            {activeTab === "afiliados" && affiliate && <AffiliatePanel affiliate={affiliate} commissions={commissions} onMessage={setMessage} />}

            {activeTab === "enderecos" && <section className="reveal-up"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black text-[#123F55]">Endereço de entrega</h2><p className="mt-2 text-sm text-slate-500">Esses dados também serão usados para agilizar o checkout.</p></div>{shipping?.address_1 && <span className="rounded-full bg-[#F5EFF8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#3E1255]">Endereço salvo</span>}</div><form onSubmit={saveAddress} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6"><AccountField label="Nome" name="first_name" defaultValue={shipping?.first_name || user.first_name} required /><AccountField label="Sobrenome" name="last_name" defaultValue={shipping?.last_name || user.last_name} required /><AccountField label="Telefone" name="phone" defaultValue={shipping?.phone} autoComplete="tel" required /><AccountField label="Empresa (opcional)" name="company" defaultValue={shipping?.company} /><AccountField label="CEP" name="postcode" defaultValue={shipping?.postcode} autoComplete="postal-code" required /><AccountField label="Endereço" name="address_1" defaultValue={shipping?.address_1} autoComplete="street-address" required className="sm:col-span-2" /><AccountField label="Número / complemento" name="address_2" defaultValue={shipping?.address_2} className="sm:col-span-2" /><AccountField label="Cidade" name="city" defaultValue={shipping?.city} autoComplete="address-level2" required /><label className="grid gap-2 text-xs font-bold text-slate-600">Estado<select name="state" defaultValue={shipping?.state || "SP"} autoComplete="address-level1" required className="h-12 rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#3E1255]">{brazilianStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label><button type="submit" className="h-11 rounded-full bg-[#3E1255] px-6 text-xs font-black text-white transition-colors hover:bg-[#561B70] sm:col-span-2 sm:w-fit">{shipping?.address_1 ? "Atualizar endereço" : "Salvar endereço"}</button></form></section>}

            {activeTab === "dados" && <section className="reveal-up"><h2 className="text-2xl font-black text-[#123F55]">Dados pessoais</h2><form onSubmit={saveProfile} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-600">Nome<input name="first_name" defaultValue={user.first_name} className="h-12 rounded-md border border-slate-200 px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600">Sobrenome<input name="last_name" defaultValue={user.last_name} className="h-12 rounded-md border border-slate-200 px-4" /></label><label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">E-mail<input value={user.email} disabled className="h-12 rounded-md border border-slate-200 bg-slate-50 px-4 text-slate-500" /></label><button type="submit" className="h-11 rounded-full bg-[#3E1255] px-6 text-xs font-black text-white sm:w-fit">Salvar dados</button></form></section>}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function formatMoney(value: string | number | undefined, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(value ?? 0));
}

function frequencyLabel(subscription: SubscriptionData) {
  const units: Record<string, [string, string]> = { day: ["dia", "dias"], week: ["semana", "semanas"], month: ["mês", "meses"] };
  const labels = units[subscription.interval_unit] ?? [subscription.interval_unit, subscription.interval_unit];
  return `A cada ${subscription.interval_value} ${subscription.interval_value === 1 ? labels[0] : labels[1]}`;
}

function SubscriptionPanel({ subscriptions, onAction }: { subscriptions: SubscriptionData[]; onAction: (id: number, action: "pause" | "cancel" | "reactivate") => Promise<void> }) {
  return <section className="reveal-up"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Nutzen Club</p><h2 className="mt-2 text-2xl font-black text-[#123F55]">Minha assinatura</h2></div><Link href="/nutzen-club" className="hidden items-center gap-2 text-xs font-black text-[#3E1255] sm:flex">Conhecer o clube <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-5 grid gap-5">{subscriptions.map((subscription) => <article key={subscription.id} className="overflow-hidden rounded-lg border border-[#D9C7E3] bg-[#F5EFF8]"><div className="grid lg:grid-cols-[320px_minmax(0,1fr)]"><div className="relative min-h-72 overflow-hidden bg-white/55 p-8"><div className="relative mx-auto h-56 w-full max-w-[250px]"><Image src={subscription.product_image || "/logo/logo.png"} alt={subscription.product_name || "Produto da assinatura"} fill sizes="(max-width: 1024px) 70vw, 250px" className="object-contain drop-shadow-[0_16px_22px_rgba(62,18,85,.12)]" /></div>{subscription.product_slug && <Link href={`/produto/${subscription.product_slug}`} className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-2 bg-white/75 text-xs font-black text-[#3E1255] backdrop-blur-sm">Ver produto <ArrowRight className="h-4 w-4" /></Link>}</div><div className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3E1255]">{subscription.plan_name || "Plano Nutzen Club"}</p><span className="rounded-full bg-[#3E1255] px-3 py-1 text-[9px] font-black uppercase text-white">{statusLabels[subscription.status] ?? subscription.status}</span></div><h3 className="mt-3 text-2xl font-black text-[#123F55]">{subscription.product_name || `Produto #${subscription.product_id}`}</h3>{subscription.product_weight && <p className="mt-1 text-sm text-slate-500">Embalagem de {subscription.product_weight} kg</p>}</div></div><div className="mt-7 grid border-y border-[#D9C7E3] sm:grid-cols-3"><SubscriptionDatum label="Quantidade" value={`${Number(subscription.quantity)} ${Number(subscription.quantity) === 1 ? "embalagem" : "embalagens"}`} /><SubscriptionDatum label="Frequência" value={frequencyLabel(subscription)} /><SubscriptionDatum label="Próxima previsão" value={subscription.next_charge_date ? new Date(subscription.next_charge_date).toLocaleDateString("pt-BR") : "Após definição do gateway"} /></div><div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Valor previsto da assinatura</p><strong className="mt-1 block text-3xl font-black text-[#3E1255]">{formatMoney(subscription.subscription_total, subscription.currency)}</strong>{Number(subscription.discount_value) > 0 && <p className="mt-1 text-xs font-bold text-[#CC632B]">{subscription.discount_type === "percentage" ? `${subscription.discount_value}% de desconto` : `${formatMoney(subscription.discount_value, subscription.currency)} de desconto`}</p>}</div><div className="flex flex-wrap gap-2">{subscription.status === "active" && <><button type="button" onClick={() => void onAction(subscription.id, "pause")} className="flex h-11 items-center gap-2 rounded-full border-2 border-[#3E1255] px-5 text-xs font-black text-[#3E1255] transition-colors hover:bg-white"><CirclePause className="h-4 w-4" />Pausar</button><button type="button" onClick={() => void onAction(subscription.id, "cancel")} className="h-11 rounded-full px-4 text-xs font-black text-[#CC632B] transition-colors hover:bg-white">Cancelar</button></>}{subscription.status === "paused" && <button type="button" onClick={() => void onAction(subscription.id, "reactivate")} className="flex h-11 items-center gap-2 rounded-full bg-[#3E1255] px-5 text-xs font-black text-white"><RotateCcw className="h-4 w-4" />Reativar</button>}</div></div></div></div></article>)}</div></section>;
}

function SubscriptionDatum({ label, value }: { label: string; value: string }) {
  return <div className="py-4 sm:px-4 sm:first:pl-0"><span className="text-xs text-slate-500">{label}</span><strong className="mt-1 block text-sm text-[#123F55]">{value}</strong></div>;
}

function AffiliatePanel({ affiliate, commissions, onMessage }: { affiliate: AffiliateData; commissions: CommissionData[]; onMessage: (message: string) => void }) {
  const balance = (status: string) => Number(affiliate.balances.find((item) => item.status === status)?.amount ?? 0);
  const approved = balance("approved");
  const pending = balance("pending");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliate.link);
      onMessage("Link de afiliado copiado.");
    } catch {
      onMessage("Não foi possível copiar automaticamente. Selecione o link e copie manualmente.");
    }
  };

  return <section className="reveal-up overflow-hidden rounded-lg border border-[#D9C7E3] bg-white"><div className="relative overflow-hidden bg-[#3E1255] p-7 text-white sm:p-10"><FloatingMotifs className="text-white opacity-10" /><div className="relative flex flex-wrap items-end justify-between gap-6"><div><div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D9C7E3]">Programa de afiliados</p><span className="rounded-full bg-[#FE8C05] px-3 py-1 text-[9px] font-black uppercase">Conta ativa</span></div><h2 className="mt-4 text-3xl font-black">Seu painel de indicações</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Compartilhe a NutzenPet e acompanhe as comissões geradas pelas compras atribuídas ao seu código.</p></div><Link href="/afiliados" className="flex items-center gap-2 text-xs font-black text-[#FFD39C]">Regras do programa <ExternalLink className="h-4 w-4" /></Link></div></div><div className="grid border-b border-[#E2D4E9] sm:grid-cols-2 xl:grid-cols-4"><AffiliateMetric icon={Banknote} label="Comissão disponível" value={formatMoney(approved)} detail="Aprovada para recebimento" /><AffiliateMetric icon={Clock3} label="Comissão pendente" value={formatMoney(pending)} detail="Aguardando aprovação" /><AffiliateMetric icon={ShoppingBag} label="Vendas indicadas" value={String(affiliate.sales_count)} detail="Pedidos atribuídos" /><AffiliateMetric icon={ReceiptText} label="Comissões geradas" value={String(affiliate.commission_count)} detail={formatMoney(affiliate.referred_total) + " em vendas"} /></div><div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.75fr)]"><div className="p-6 sm:p-8"><div className="flex items-center gap-3"><Link2 className="h-5 w-5 text-[#3E1255]" /><h3 className="text-xl font-black text-[#123F55]">Meu link de afiliado</h3></div><p className="mt-3 text-sm leading-6 text-slate-500">Compras iniciadas por este link são atribuídas à sua conta durante o período configurado.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={affiliate.link} readOnly aria-label="Link de afiliado" className="h-12 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600" /><button type="button" onClick={() => void copyLink()} className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#3E1255] px-6 text-xs font-black text-white"><Copy className="h-4 w-4" />Copiar link</button></div><div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500"><span><strong className="text-[#123F55]">Código:</strong> {affiliate.code}</span><span><strong className="text-[#123F55]">Atribuição:</strong> {affiliate.attribution_days} dias</span><span><strong className="text-[#123F55]">Comissão:</strong> definida por produto</span></div></div><aside className="border-t border-[#E2D4E9] bg-[#F5EFF8] p-6 sm:p-8 lg:border-l lg:border-t-0"><div className="flex items-center gap-3"><Banknote className="h-5 w-5 text-[#3E1255]" /><h3 className="text-xl font-black text-[#123F55]">Recebimentos</h3></div><p className="mt-6 text-xs text-slate-500">Saldo disponível</p><strong className="mt-1 block text-3xl font-black text-[#3E1255]">{formatMoney(approved)}</strong><button type="button" disabled className="mt-6 h-11 w-full rounded-full bg-[#FE8C05] text-xs font-black text-white opacity-55">Saque indisponível</button><p className="mt-4 text-xs leading-5 text-slate-500">A solicitação será habilitada depois da definição das regras de saque e dados de recebimento.</p></aside></div><div className="border-t border-[#E2D4E9] p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3E1255]">Movimentações</p><h3 className="mt-2 text-xl font-black text-[#123F55]">Comissões recentes</h3></div><span className="text-xs font-bold text-slate-400">Dados reais do WooCommerce</span></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.14em] text-slate-400"><th className="pb-3">Pedido</th><th className="pb-3">Data</th><th className="pb-3">Origem</th><th className="pb-3">Comissão</th><th className="pb-3 text-right">Status</th></tr></thead><tbody>{commissions.length > 0 ? commissions.map((commission) => <tr key={commission.id} className="border-b border-slate-100 last:border-0"><td className="py-4 font-black text-[#123F55]">#{commission.order_number}</td><td className="py-4 text-slate-500">{new Date(commission.created_at.replace(" ", "T") + "Z").toLocaleDateString("pt-BR")}</td><td className="py-4"><strong className="block text-slate-600">{commission.source}</strong><span className="text-xs text-slate-400">{commission.product_name}</span></td><td className="py-4 font-black text-[#3E1255]">{formatMoney(commission.commission_amount)}</td><td className="py-4 text-right"><CommissionStatus status={commission.status} /></td></tr>) : <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">Nenhuma comissão registrada até o momento.</td></tr>}</tbody></table></div></div></section>;
}

function AffiliateMetric({ icon: Icon, label, value, detail }: { icon: typeof House; label: string; value: string; detail: string }) {
  return <div className="border-b border-[#E2D4E9] p-5 last:border-b-0 sm:border-r sm:p-6 sm:[&:nth-child(2)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:last:border-r-0"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-500">{label}</span><Icon className="h-4 w-4 text-[#FE8C05]" /></div><strong className="mt-4 block text-2xl font-black text-[#123F55]">{value}</strong><span className="mt-1 block text-xs text-slate-400">{detail}</span></div>;
}

function CommissionStatus({ status }: { status: string }) {
  const styles: Record<string, string> = { approved: "bg-green-50 text-green-700", pending: "bg-orange-50 text-[#CC632B]", reversed: "bg-slate-100 text-slate-500" };
  const labels: Record<string, string> = { approved: "Aprovada", pending: "Pendente", reversed: "Estornada" };
  return <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${styles[status] ?? "bg-[#F5EFF8] text-[#3E1255]"}`}>{labels[status] ?? status}</span>;
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof House; label: string; value: string }) {
  return <article className="rounded-md border border-slate-200 bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><Icon className="h-4 w-4" /></span><p className="mt-4 text-xs text-slate-500">{label}</p><strong className="mt-1 block text-lg text-[#123F55]">{value}</strong></article>;
}

function EmptyState({ icon: Icon, title, text, action }: { icon: typeof House; title: string; text: string; action?: React.ReactNode }) {
  return <div className="mt-5 rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-7"><Icon className="h-7 w-7 text-[#3E1255]" /><h3 className="mt-4 text-xl font-black text-[#123F55]">{title}</h3><p className="mt-2 text-sm text-slate-500">{text}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function AccountField({ label, name, defaultValue, required = false, autoComplete, className = "" }: { label: string; name: string; defaultValue?: string; required?: boolean; autoComplete?: string; className?: string }) {
  return <label className={`grid gap-2 text-xs font-bold text-slate-600 ${className}`}>{label}<input name={name} defaultValue={defaultValue} required={required} autoComplete={autoComplete} className="h-12 rounded-md border border-slate-200 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#3E1255]" /></label>;
}
