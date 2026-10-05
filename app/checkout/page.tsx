"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, ExternalLink, LoaderCircle, LockKeyhole, MapPin, PackageCheck, ShoppingBag, Truck, UserRound } from "lucide-react";
import { formatCurrency, useCart, type CheckoutAddress, type MercadoPagoCardPayment, type MercadoPagoTicketPayment } from "../components/cart-provider";
import { MercadoPagoCardForm, type MercadoPagoCardFormHandle } from "../components/mercado-pago-card-form";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const fieldClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B]";
const mercadoPagoPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? "";
const addressFields = new Set(["full_name", "email", "phone", "postcode", "city", "state", "street_name", "street_number", "neighborhood", "address_2"]);

function getCheckoutAddress(formElement: HTMLFormElement): CheckoutAddress {
  const form = new FormData(formElement);
  const fullName = String(form.get("full_name") ?? "").trim().split(/\s+/);
  return {
    first_name: fullName.shift() ?? "",
    last_name: fullName.join(" "),
    email: String(form.get("email") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim(),
    postcode: String(form.get("postcode") ?? "").replace(/\D/g, ""),
    city: String(form.get("city") ?? "").trim(),
    state: String(form.get("state") ?? "").trim().toUpperCase(),
    country: "BR",
    address_1: [String(form.get("street_name") ?? "").trim(), String(form.get("street_number") ?? "").trim()].filter(Boolean).join(", "),
    address_2: String(form.get("address_2") ?? "").trim(),
  };
}

function getTicketPayment(formElement: HTMLFormElement): MercadoPagoTicketPayment {
  const form = new FormData(formElement);
  return {
    identificationNumber: String(form.get("boleto_document") ?? "").replace(/\D/g, ""),
    streetName: String(form.get("street_name") ?? "").trim(),
    streetNumber: String(form.get("street_number") ?? "").trim(),
    neighborhood: String(form.get("neighborhood") ?? "").trim(),
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, total, purchaseType, updateCustomer, selectShippingRate, checkoutWithMercadoPago, checkoutWithMercadoPagoCard, checkoutWithMercadoPagoTicket, shippingRates, hasCalculatedShipping, error } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const cardFormRef = useRef<MercadoPagoCardFormHandle>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ticket" | "pro">("card");
  const [cardReady, setCardReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const selectedShipping = shippingRates.flatMap((group) => group.shipping_rates).find((rate) => rate.selected);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          router.replace("/conta?retorno=%2Fcheckout");
          return;
        }
        setAuthReady(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) router.replace("/conta?retorno=%2Fcheckout");
      });
    return () => controller.abort();
  }, [router]);

  async function handleAddressUpdate() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    setSubmitting(true);
    setPaymentError(null);
    const saved = await updateCustomer(getCheckoutAddress(form));
    setSubmitted(saved);
    setSubmitting(false);
  }

  function validatePaymentPrerequisites() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return null;
    if (!submitted || !selectedShipping) {
      setPaymentError("Calcule a entrega e selecione uma modalidade antes de continuar.");
      return null;
    }
    if (!acceptedTerms) {
      setPaymentError("Confirme a política de privacidade para continuar.");
      return null;
    }
    return form;
  }

  async function handleCardPayment(card: MercadoPagoCardPayment) {
    const form = validatePaymentPrerequisites();
    if (!form) {
      setProcessingPayment(false);
      return;
    }

    const checkout = await checkoutWithMercadoPagoCard(getCheckoutAddress(form), card);
    if (!checkout?.payment_result) {
      setPaymentError("O pagamento por cartão não pôde ser processado. Tente novamente ou use o Mercado Pago.");
      setProcessingPayment(false);
      return;
    }

    const details = Object.fromEntries(checkout.payment_result.payment_details.map(({ key, value }) => [key, value]));
    if (details.three_ds_flow === "true" || details.three_ds_flow === "1") {
      setPaymentError("Seu banco solicitou uma autenticação adicional. Nesta primeira versão, escolha “Mercado Pago” abaixo para concluir com essa validação.");
      setProcessingPayment(false);
      return;
    }

    if (checkout.payment_result.payment_status === "success") {
      const status = checkout.status === "pending" || checkout.status === "on-hold" ? "pendente" : "aprovado";
      router.push(`/pedido/${status}?pedido=${checkout.order_id}`);
      return;
    }

    setPaymentError(details.message || "O cartão não foi aprovado. Confira os dados ou tente outra forma de pagamento.");
    setProcessingPayment(false);
  }

  async function handlePayment() {
    const form = validatePaymentPrerequisites();
    if (!form) return;

    setProcessingPayment(true);
    setPaymentError(null);

    if (paymentMethod === "card") {
      if (!cardFormRef.current?.submit()) {
        setPaymentError("Aguarde os campos seguros do cartão terminarem de carregar.");
        setProcessingPayment(false);
      }
      return;
    }

    if (paymentMethod === "ticket") {
      const checkout = await checkoutWithMercadoPagoTicket(getCheckoutAddress(form), getTicketPayment(form));
      if (!checkout?.payment_result || checkout.payment_result.payment_status !== "success") {
        const details = checkout?.payment_result
          ? Object.fromEntries(checkout.payment_result.payment_details.map(({ key, value }) => [key, value]))
          : {};
        setPaymentError(details.message || "O Mercado Pago não conseguiu gerar o boleto. Confira os dados e tente novamente.");
        setProcessingPayment(false);
        return;
      }
      const query = new URLSearchParams({
        pedido: String(checkout.order_id),
        chave: checkout.order_key,
        retorno: checkout.payment_result.redirect_url,
      });
      router.push(`/pedido/boleto?${query.toString()}`);
      return;
    }

    const checkout = await checkoutWithMercadoPago(getCheckoutAddress(form));
    const redirectUrl = checkout?.payment_result?.redirect_url;
    if (!checkout || !redirectUrl) {
      setPaymentError("O Mercado Pago não iniciou o pagamento. Confira se o Checkout Pro está ativo no WooCommerce.");
      setProcessingPayment(false);
      return;
    }

    try {
      const target = new URL(redirectUrl, window.location.origin);
      if (target.protocol !== "https:") throw new Error("Invalid payment redirect");
      window.location.assign(target.toString());
    } catch {
      setPaymentError("O Mercado Pago retornou um endereço de pagamento inválido.");
      setProcessingPayment(false);
    }
  }

  if (!authReady) {
    return (
      <main className="min-h-screen bg-slate-50">
        <SiteHeader />
        <section className="grid min-h-[55vh] place-items-center px-5 text-center">
          <div><LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[#3E1255]" /><p className="mt-4 text-sm font-bold text-[#123F55]">Verificando sua conta...</p></div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC632B]">Compra segura</p><h1 className="mt-1 text-3xl font-black text-[#123F55] sm:text-4xl">Dados e entrega</h1></div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400"><span className="text-[#3E1255]">Carrinho</span><span>•</span><span className="text-[#3E1255]">Dados e entrega</span><span>•</span><span>Pagamento</span></div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-[#3E1255]" /><h2 className="mt-5 text-3xl font-black text-[#123F55]">Adicione produtos primeiro</h2><p className="mt-3 text-sm leading-6 text-slate-500">Seu resumo de compra aparecerá aqui assim que você escolher os produtos.</p><Link href="/produto" className="mt-7 inline-flex h-12 items-center rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white">Ver produtos</Link></div>
        ) : (
          <form id="nutzen-checkout-form" ref={formRef} onSubmit={(event) => event.preventDefault()} onChange={(event) => {
            const fieldName = event.target instanceof HTMLInputElement ? event.target.name : "";
            if (addressFields.has(fieldName)) setSubmitted(false);
          }} className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_390px]">
            {submitted && <div role="status" className="reveal-up flex items-center gap-3 rounded-lg border border-[#D9C7E3] bg-[#F5EFF8] p-5 text-sm font-bold text-[#3E1255] lg:col-span-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#FE8C05]" /> Endereço atualizado no WooCommerce. Confira os métodos de entrega disponíveis.</div>}
            {error && <div role="alert" className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm font-bold text-[#CC632B] lg:col-span-2"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
            <div className="space-y-6">
              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8">
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><UserRound className="h-5 w-5 text-[#FE8C05]" />Dados pessoais</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Nome completo<input name="full_name" className={fieldClass} pattern=".*\s+.*" title="Informe nome e sobrenome" required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail<input name="email" type="email" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Telefone<input name="phone" type="tel" className={fieldClass} required /></label>
                </div>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "80ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><MapPin className="h-5 w-5 text-[#FE8C05]" />Endereço de entrega</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-slate-600">CEP<input name="postcode" inputMode="numeric" className={fieldClass} pattern="[0-9]{5}-?[0-9]{3}" title="Informe um CEP válido" required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Estado<input name="state" className={fieldClass} placeholder="SP" maxLength={2} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Cidade<input name="city" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Endereço<input name="street_name" className={fieldClass} placeholder="Rua ou avenida" required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Número<input name="street_number" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600">Bairro<input name="neighborhood" className={fieldClass} required /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-600 sm:col-span-2">Complemento<input name="address_2" className={fieldClass} /></label>
                </div>
                <button type="button" onClick={() => void handleAddressUpdate()} disabled={submitting} className="mt-6 h-12 rounded-full bg-[#3E1255] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#5B2674] disabled:opacity-50">{submitting ? "Consultando entrega..." : "Calcular entrega"}</button>
              </section>

              <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "160ms" }}>
                <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><Truck className="h-5 w-5 text-[#FE8C05]" />Método de entrega</h2>
                {!hasCalculatedShipping && <p className="mt-4 text-sm leading-6 text-slate-500">Preencha o endereço para consultar os métodos configurados no WooCommerce.</p>}
                {hasCalculatedShipping && shippingRates.length === 0 && <p className="mt-4 rounded-md bg-orange-50 p-4 text-sm font-bold text-[#CC632B]">Não há método de entrega disponível para este endereço.</p>}
                <div className="mt-5 grid gap-3">{shippingRates.flatMap((group) => group.shipping_rates.map((rate) => <button key={rate.rate_id} type="button" onClick={() => void selectShippingRate(group.package_id, rate.rate_id)} className={`flex items-center justify-between rounded-md border-2 p-4 text-left text-sm ${rate.selected ? "border-[#3E1255] bg-[#F5EFF8]" : "border-slate-200"}`}><span><strong className="block text-[#123F55]">{rate.name}</strong>{rate.delivery_time && <small className="text-slate-500">{rate.delivery_time}</small>}</span><strong className="text-[#3E1255]">{Number(rate.price) === 0 ? "Grátis" : formatCurrency(Number(rate.price) / 10 ** rate.currency_minor_unit)}</strong></button>))}</div>
              </section>

              {purchaseType === "subscription" ? (
                <section className="rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6 sm:p-8"><h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><PackageCheck className="h-5 w-5 text-[#FE8C05]" />Pagamento recorrente pendente</h2><p className="mt-3 text-sm leading-6 text-slate-600">A assinatura permanecerá indisponível até a homologação de cobranças recorrentes. Nenhuma renovação automática será simulada.</p></section>
              ) : (
                <section className="reveal-up rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(18,63,85,.06)] sm:p-8" style={{ animationDelay: "220ms" }}>
                  <h2 className="flex items-center gap-3 text-xl font-black text-[#123F55]"><CreditCard className="h-5 w-5 text-[#FE8C05]" />Pagamento</h2>
                  <label className={`mt-5 flex cursor-pointer items-start gap-4 rounded-md border-2 p-4 ${paymentMethod === "card" ? "border-[#3E1255] bg-[#F5EFF8]" : "border-slate-200"}`}>
                    <input type="radio" name="payment_method" value="woo-mercado-pago-custom" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="mt-1 accent-[#3E1255]" />
                    <span><strong className="block text-sm text-[#123F55]">Cartão de crédito</strong><small className="mt-1 block leading-5 text-slate-500">Preencha e conclua o pagamento sem sair do site.</small></span>
                  </label>
                  {paymentMethod === "card" && (
                    <MercadoPagoCardForm
                      ref={cardFormRef}
                      amount={total}
                      publicKey={mercadoPagoPublicKey}
                      onPayment={handleCardPayment}
                      onReadyChange={setCardReady}
                      onError={(message) => {
                        setPaymentError(message);
                        setProcessingPayment(false);
                      }}
                    />
                  )}
                  <label className={`mt-5 flex cursor-pointer items-start gap-4 rounded-md border-2 p-4 ${paymentMethod === "ticket" ? "border-[#3E1255] bg-[#F5EFF8]" : "border-slate-200"}`}>
                    <input type="radio" name="payment_method" value="woo-mercado-pago-ticket" checked={paymentMethod === "ticket"} onChange={() => setPaymentMethod("ticket")} className="mt-1 accent-[#3E1255]" />
                    <span><strong className="block text-sm text-[#123F55]">Boleto bancário</strong><small className="mt-1 block leading-5 text-slate-500">Gere o boleto diretamente no site. O vencimento será em até 3 dias.</small></span>
                  </label>
                  {paymentMethod === "ticket" && (
                    <label className="mt-4 grid gap-2 text-xs font-bold text-slate-600">
                      CPF do comprador
                      <input name="boleto_document" className={fieldClass} inputMode="numeric" pattern="[0-9.\-]{11,14}" title="Informe um CPF válido" required />
                      <small className="font-normal leading-5 text-slate-500">O CPF é obrigatório para a emissão do boleto.</small>
                    </label>
                  )}
                  <label className={`mt-5 flex cursor-pointer items-start gap-4 rounded-md border-2 p-4 ${paymentMethod === "pro" ? "border-[#3E1255] bg-[#F5EFF8]" : "border-slate-200"}`}>
                    <input type="radio" name="payment_method" value="woo-mercado-pago-basic" checked={paymentMethod === "pro"} onChange={() => setPaymentMethod("pro")} className="mt-1 accent-[#3E1255]" />
                    <span><strong className="block text-sm text-[#123F55]">Mercado Pago</strong><small className="mt-1 block leading-5 text-slate-500">Pix, boleto, saldo ou cartão no ambiente seguro do Mercado Pago. Esta opção permanece disponível como alternativa.</small></span>
                  </label>
                  <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-slate-600">
                    <input type="checkbox" name="privacy_consent" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-[#3E1255]" />
                    <span>Li e concordo com a <Link href="/politica-de-privacidade" target="_blank" className="font-black text-[#3E1255] underline">política de privacidade</Link> e autorizo o processamento dos dados necessários ao pedido.</span>
                  </label>
                  {paymentError && <div role="alert" className="mt-5 flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-[#CC632B]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{paymentError}</div>}
                </section>
              )}
              <Link href="/carrinho" className="group inline-flex items-center gap-2 text-sm font-black text-[#3E1255]"><ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Voltar ao carrinho</Link>
            </div>

            <aside className="h-fit overflow-hidden rounded-lg bg-[#123F55] text-white shadow-[0_20px_50px_rgba(18,63,85,.2)] lg:sticky lg:top-28">
              <div className="p-7"><LockKeyhole className="h-7 w-7 text-[#FE8C05]" /><h2 className="mt-4 text-2xl font-black">Resumo do pedido</h2><p className="mt-2 text-xs leading-5 text-white/60">Preços e totais são calculados pelo WooCommerce.</p></div>
              <div className="max-h-[330px] divide-y divide-white/10 overflow-y-auto border-y border-white/10 px-7">
                {items.map(({ product, quantity, subscription }) => <div key={product.slug} className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-4"><div className="relative h-16 rounded-md bg-white/95"><Image src={product.images[0]} alt="" fill sizes="60px" className="object-contain p-1" /></div><div><p className="text-xs font-bold leading-4">{product.shortName}</p><p className="mt-1 text-[10px] text-white/55">Qtd. {quantity}{subscription ? ` · ${subscription.frequencyLabel}` : ""}</p>{subscription && <span className="mt-2 inline-flex rounded-full bg-[#FE8C05] px-2 py-1 text-[9px] font-black uppercase text-white">Assinatura</span>}</div><strong className="text-xs">{formatCurrency(product.priceValue * quantity)}{subscription ? " / ciclo" : ""}</strong></div>)}
              </div>
              <div className="p-7">
                <div className="grid gap-3 text-sm text-white/65"><div className="flex justify-between"><span>Produtos ({itemCount})</span><span>Incluídos</span></div><div className="flex justify-between gap-4"><span>Entrega</span><span className="text-right text-[#D9C7E3]">{hasCalculatedShipping ? selectedShipping?.name ?? "Selecione um método" : "A calcular"}</span></div></div>
                <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-5"><strong>Total</strong><strong className="text-2xl text-[#FE8C05]">{formatCurrency(total)}</strong></div>
                {purchaseType === "subscription" && <div className="mt-5 grid gap-2 border-t border-white/15 pt-5 text-xs text-white/70"><div className="flex justify-between gap-4"><span>Total recorrente</span><strong className="text-[#FE8C05]">{formatCurrency(total)} / ciclo</strong></div><div className="flex justify-between gap-4"><span>Frequência</span><strong className="text-right text-white">{items[0]?.subscription?.frequencyLabel}</strong></div><div className="flex justify-between gap-4"><span>Primeira renovação</span><strong className="text-right text-white">Definida após o pagamento</strong></div></div>}
                <Link href="/carrinho" className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-white/70 text-sm font-black text-white transition-colors duration-300 hover:bg-white hover:text-[#3E1255]"><ShoppingBag className="h-4 w-4" />Conferir carrinho</Link>
                <button type="button" onClick={() => void handlePayment()} disabled={processingPayment || purchaseType === "subscription" || !submitted || !selectedShipping || !acceptedTerms || (paymentMethod === "card" && !cardReady)} className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-colors hover:bg-[#CC632B] disabled:cursor-not-allowed disabled:bg-slate-400">
                  {processingPayment ? <><LoaderCircle className="h-4 w-4 animate-spin" />Processando pagamento...</> : paymentMethod === "card" ? <><span>Finalizar pedido</span><LockKeyhole className="h-4 w-4" /></> : paymentMethod === "ticket" ? <><span>Gerar boleto</span><LockKeyhole className="h-4 w-4" /></> : <><span>Ir para o Mercado Pago</span><ExternalLink className="h-4 w-4" /></>}
                </button>
                {!submitted && purchaseType === "one_time" && <p className="mt-3 text-center text-[11px] leading-5 text-white/55">Calcule a entrega para liberar o pagamento.</p>}
              </div>
            </aside>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
