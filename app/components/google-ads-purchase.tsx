"use client";

import { useEffect } from "react";

const GOOGLE_ADS_CONVERSION = "AW-17741473987/UBSsCOOdqp0dEMPR5YtC";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAdsPurchaseProps = {
  orderId: string;
  value: string;
  currency?: string;
};

export function GoogleAdsPurchase({ orderId, value, currency = "BRL" }: GoogleAdsPurchaseProps) {
  useEffect(() => {
    const amount = Number(value);
    if (!/^\d+$/.test(orderId) || !Number.isFinite(amount) || amount <= 0 || !window.gtag) return;

    const storageKey = `nutzen_google_ads_purchase_${orderId}`;
    if (window.localStorage.getItem(storageKey)) return;

    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_CONVERSION,
      value: amount,
      currency,
      transaction_id: orderId,
    });
    window.localStorage.setItem(storageKey, "1");
  }, [currency, orderId, value]);

  return null;
}
