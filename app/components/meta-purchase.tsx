"use client";

import { useEffect } from "react";

type MetaPurchaseProps = {
  orderId: string;
  value: string;
  currency?: string;
};

export function MetaPurchase({ orderId, value, currency = "BRL" }: MetaPurchaseProps) {
  useEffect(() => {
    const amount = Number(value);
    if (!/^\d+$/.test(orderId) || !Number.isFinite(amount) || amount <= 0) return;

    const storageKey = `nutzen_meta_purchase_${orderId}`;

    function trackPurchase() {
      if (!window.fbq || window.localStorage.getItem(storageKey)) return;

      window.fbq(
        "track",
        "Purchase",
        { value: amount, currency },
        { eventID: `nutzen-order-${orderId}` },
      );
      window.localStorage.setItem(storageKey, "1");
    }

    trackPurchase();
    window.addEventListener("meta-pixel-ready", trackPurchase);
    return () => window.removeEventListener("meta-pixel-ready", trackPurchase);
  }, [currency, orderId, value]);

  return null;
}
