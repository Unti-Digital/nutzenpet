"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MercadoPagoCardPayment } from "./cart-provider";

type CardFormData = {
  token?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  issuerId?: string;
  installments?: string | number;
  identificationType?: string;
  identificationNumber?: string;
};

type CardFormInstance = {
  getCardFormData: () => CardFormData;
  unmount?: () => void;
};

type MercadoPagoInstance = {
  cardForm: (configuration: Record<string, unknown>) => CardFormInstance;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
    MP_DEVICE_SESSION_ID?: string;
  }
}

export type MercadoPagoCardFormHandle = {
  submit: () => boolean;
};

type MercadoPagoCardFormProps = {
  amount: number;
  publicKey: string;
  onPayment: (payment: MercadoPagoCardPayment) => Promise<void> | void;
  onError: (message: string) => void;
  onReadyChange?: (ready: boolean) => void;
};

const inputClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)]";
const secureFieldClass = `${inputClass} overflow-hidden [&>iframe]:h-full`;

export const MercadoPagoCardForm = forwardRef<MercadoPagoCardFormHandle, MercadoPagoCardFormProps>(function MercadoPagoCardForm(
  { amount, publicKey, onPayment, onError, onReadyChange },
  ref,
) {
  const [sdkReady, setSdkReady] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const cardFormRef = useRef<CardFormInstance | null>(null);
  const paymentTypeRef = useRef("credit_card");
  const onPaymentRef = useRef(onPayment);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onPaymentRef.current = onPayment;
    onErrorRef.current = onError;
  }, [onError, onPayment]);

  useEffect(() => {
    onReadyChange?.(formReady);
  }, [formReady, onReadyChange]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      const form = document.getElementById("nutzen-checkout-form");
      if (!(form instanceof HTMLFormElement) || !formReady) return false;
      form.requestSubmit();
      return true;
    },
  }), [formReady]);

  useEffect(() => {
    if (!sdkReady || !publicKey || !window.MercadoPago) return;

    setFormReady(false);
    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
    const fieldStyle = {
      fontSize: "14px",
      height: "48px",
      padding: "14px 16px",
      fontFamily: "Arial, sans-serif",
      placeholderColor: "#94a3b8",
      color: "#1e293b",
    };

    try {
      cardFormRef.current = mp.cardForm({
        amount: amount.toFixed(2),
        iframe: true,
        form: {
          id: "nutzen-checkout-form",
          cardNumber: {
            id: "mp-card-number",
            placeholder: "Número do cartão",
            style: fieldStyle,
            enableLuhnValidation: true,
          },
          cardholderName: {
            id: "mp-cardholder-name",
            placeholder: "Nome como aparece no cartão",
          },
          cardExpirationDate: {
            id: "mp-expiration-date",
            placeholder: "MM/AA",
            mode: "short",
            style: fieldStyle,
          },
          securityCode: {
            id: "mp-security-code",
            placeholder: "CVV",
            style: fieldStyle,
          },
          issuer: { id: "mp-issuer", placeholder: "Banco emissor" },
          installments: { id: "mp-installments", placeholder: "Parcelas" },
          identificationType: { id: "mp-identification-type" },
          identificationNumber: { id: "mp-identification-number", placeholder: "CPF do titular" },
        },
        callbacks: {
          onReady: () => setFormReady(true),
          onFormMounted: (error: { message?: string } | null) => {
            if (error) {
              onErrorRef.current("Não foi possível carregar os campos seguros do cartão.");
              return;
            }
            setFormReady(true);
          },
          onPaymentMethodsReceived: (error: unknown, methods: Array<{ payment_type_id?: string }> = []) => {
            if (!error && methods[0]?.payment_type_id) paymentTypeRef.current = methods[0].payment_type_id;
          },
          onCardTokenReceived: (error: unknown) => {
            if (error) onErrorRef.current("Confira os dados do cartão e tente novamente.");
          },
          onSubmit: (event: Event) => {
            event.preventDefault();
            const data = cardFormRef.current?.getCardFormData();
            if (!data?.token || !data.paymentMethodId || !data.installments || !data.identificationType || !data.identificationNumber) {
              onErrorRef.current("Preencha todos os dados do cartão para continuar.");
              return;
            }
            void onPaymentRef.current({
              token: data.token,
              paymentMethodId: data.paymentMethodId,
              paymentTypeId: data.paymentTypeId || paymentTypeRef.current,
              issuerId: data.issuerId,
              installments: Number(data.installments),
              identificationType: data.identificationType,
              identificationNumber: data.identificationNumber.replace(/\D/g, ""),
              deviceSessionId: window.MP_DEVICE_SESSION_ID,
            });
          },
          onError: () => onErrorRef.current("Confira os dados do cartão e tente novamente."),
        },
      });
    } catch {
      onErrorRef.current("Não foi possível iniciar o pagamento transparente.");
    }

    return () => {
      setFormReady(false);
      try {
        cardFormRef.current?.unmount?.();
      } catch {
        // The SDK may already have removed its secure iframes.
      }
      cardFormRef.current = null;
    };
  }, [amount, publicKey, sdkReady]);

  return (
    <div className="mt-5 grid gap-4">
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" onReady={() => setSdkReady(true)} />
      {!publicKey && (
        <p className="rounded-md border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-[#CC632B]">
          O pagamento por cartão dentro do site está sendo configurado. Use a opção Mercado Pago abaixo.
        </p>
      )}
      <label className="grid gap-2 text-xs font-bold text-slate-600">
        Número do cartão
        <div id="mp-card-number" className={secureFieldClass} />
      </label>
      <label className="grid gap-2 text-xs font-bold text-slate-600">
        Nome impresso no cartão
        <input id="mp-cardholder-name" className={inputClass} autoComplete="cc-name" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Validade
          <div id="mp-expiration-date" className={secureFieldClass} />
        </label>
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Código de segurança
          <div id="mp-security-code" className={secureFieldClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Banco emissor
          <select id="mp-issuer" className={inputClass}><option value="">Selecione</option></select>
        </label>
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Parcelas
          <select id="mp-installments" className={inputClass}><option value="">Selecione</option></select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          Documento
          <select id="mp-identification-type" className={inputClass}><option value="CPF">CPF</option></select>
        </label>
        <label className="grid gap-2 text-xs font-bold text-slate-600">
          CPF do titular
          <input id="mp-identification-number" className={inputClass} inputMode="numeric" autoComplete="off" />
        </label>
      </div>
      <p className="text-[11px] leading-5 text-slate-500">
        Os dados sensíveis são protegidos e tokenizados pelo Mercado Pago. A Nutzen não armazena o número nem o código de segurança do cartão.
      </p>
    </div>
  );
});
