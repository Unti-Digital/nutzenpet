"use client";

import Link from "next/link";
import { CheckCircle2, PackageCheck, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PasswordField } from "./password-field";

const productLines = [
  "Cães adultos de raças médias e grandes",
  "Cães adultos de raças pequenas",
  "Gatos adultos castrados",
];

export function SubscriptionApplication() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [individualProduct, setIndividualProduct] = useState<{ slug: string; name: string; planId: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => setLoggedIn(response.ok))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("produto");
    const planId = params.get("plano");
    if (!slug) return;
    void fetch("/api/content/products", { cache: "no-store" }).then((response) => response.json()).then((payload: { items?: Array<{ slug: string; name: string }> }) => {
      const product = payload.items?.find((item) => item.slug === slug);
      if (product) setIndividualProduct({ slug, name: product.name, planId: planId ?? "" });
    }).catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const selectedLines = individualProduct ? [individualProduct.name] : form.getAll("lines").map(String);
    if (selectedLines.length === 0) {
      setMessage("Escolha pelo menos uma linha para montar o kit.");
      return;
    }

    setPending(true);
    setMessage(null);
    const details = [
      `Linhas: ${selectedLines.join(", ")}`,
      `Tamanhos: ${form.getAll("sizes").map(String).join(", ") || "a definir"}`,
      `Recorrência: ${String(form.get("frequency") ?? "a definir")}`,
      `Modalidade: ${individualProduct ? "assinatura individual" : "kit personalizado"}`,
      individualProduct ? `Produto: ${individualProduct.slug}` : "",
      individualProduct?.planId ? `Plano WooCommerce: ${individualProduct.planId}` : "",
      `Observações: ${String(form.get("notes") ?? "")}`,
    ].join("\n");
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
      message: details,
      consent: form.get("consent"),
    };
    const response = await fetch("/api/applications/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(payload?.message ?? "Não foi possível enviar sua seleção.");
      return;
    }
    setSent(true);
    setLoggedIn(true);
    setMessage("Sua seleção foi recebida. A equipe poderá preparar a assinatura quando a etapa de pagamentos estiver habilitada.");
    formElement.reset();
  }

  return (
    <section id="cadastro-club" className="scroll-mt-24 bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div><span className="grid h-12 w-12 place-items-center rounded-full bg-[#3E1255] text-white"><PackageCheck className="h-5 w-5" /></span><p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#3E1255]">{individualProduct ? "Assinatura individual" : "Monte seu kit"}</p><h2 className="mt-4 text-3xl font-black leading-tight text-[#123F55] sm:text-5xl">{individualProduct ? `Assinar ${individualProduct.name}.` : "Conte como será a rotina do seu pet."}</h2><p className="mt-5 text-sm leading-7 text-slate-600">{individualProduct ? "Esta solicitação mantém o produto escolhido separado do kit personalizado." : "Nesta etapa, registramos sua seleção e seus dados."} Nenhuma cobrança ou assinatura automática é criada antes da confirmação comercial e do gateway de pagamento.</p></div>
        <form onSubmit={handleSubmit} className="rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6 shadow-[0_18px_50px_rgba(62,18,85,.08)] sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold text-slate-600">Nome completo<input name="name" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label>
            <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail da conta<input name="email" type="email" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label>
            <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">WhatsApp<input name="phone" type="tel" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4" /></label>
            {!loggedIn && <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Crie uma senha para acompanhar a solicitação<PasswordField name="password" minLength={10} autoComplete="new-password" required inputClassName="h-12 w-full rounded-md border border-[#D9C7E3] bg-white px-4" /><span className="font-normal text-slate-400">Já possui conta? <Link href="/conta" className="font-bold text-[#3E1255]">Entre antes de continuar</Link>.</span></label>}
            {!individualProduct && <><fieldset className="sm:col-span-2"><legend className="text-xs font-bold text-slate-600">Linhas do kit</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{productLines.map((line) => <label key={line} className="flex items-start gap-3 rounded-md border border-[#D9C7E3] bg-white p-4 text-xs font-bold leading-5 text-[#123F55]"><input type="checkbox" name="lines" value={line} className="mt-1 accent-[#3E1255]" />{line}</label>)}</div></fieldset><fieldset className="sm:col-span-2"><legend className="text-xs font-bold text-slate-600">Tamanhos de interesse</legend><div className="mt-3 flex flex-wrap gap-3">{["1 kg", "3 kg", "10 kg", "15 kg"].map((size) => <label key={size} className="flex items-center gap-2 rounded-full border border-[#D9C7E3] bg-white px-4 py-2 text-xs font-bold text-[#123F55]"><input type="checkbox" name="sizes" value={size} className="accent-[#3E1255]" />{size}</label>)}</div></fieldset></>}
            {individualProduct ? <input type="hidden" name="frequency" value={`Plano WooCommerce ${individualProduct.planId}`} /> : <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Frequência desejada<select name="frequency" required className="h-12 rounded-md border border-[#D9C7E3] bg-white px-4"><option value="Mensal">Mensal</option><option value="Bimestral">Bimestral</option><option value="Trimestral">Trimestral</option></select></label>}
            <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Observações<textarea name="notes" rows={3} className="rounded-md border border-[#D9C7E3] bg-white p-4" /></label>
            <label className="flex items-start gap-3 text-xs leading-5 text-slate-500 sm:col-span-2"><input name="consent" value="true" required type="checkbox" className="mt-1 accent-[#3E1255]" /><span>Concordo com o tratamento dos dados conforme a <Link href="/politica-de-privacidade" className="font-bold text-[#3E1255] underline">Política de Privacidade</Link>.</span></label>
          </div>
          {sent ? <p className="mt-6 flex items-start gap-3 rounded-md bg-white p-4 text-sm font-bold leading-6 text-[#3E1255]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{message}</p> : <><button disabled={pending} className="group mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors hover:bg-[#CC632B] disabled:opacity-50">{pending ? "Enviando..." : "Enviar seleção do kit"}<Send className="h-4 w-4 transition-transform group-hover:translate-x-2" /></button>{message && <p role="alert" className="mt-4 text-sm font-bold text-[#CC632B]">{message}</p>}</>}
        </form>
      </div>
    </section>
  );
}
