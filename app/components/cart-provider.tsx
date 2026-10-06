"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, products as fallbackProducts, type Product } from "../data/products";
import type { StoreApiCart, StoreApiCartItem, StoreApiCheckout } from "@/lib/woocommerce/types";

type CartItem = {
  key?: string;
  product: Product;
  quantity: number;
  subscription?: {
    planId: number;
    planName: string;
    interval: number;
    intervalUnit: string;
    frequencyLabel: string;
    discountType: string;
    discountValue: number;
    unitTotal: number;
  };
};

type CartMode = "loading" | "woocommerce" | "fallback";

export type MercadoPagoCardPayment = {
  token: string;
  paymentMethodId: string;
  paymentTypeId: string;
  issuerId?: string;
  installments: number;
  identificationType: string;
  identificationNumber: string;
  deviceSessionId?: string;
};

export type MercadoPagoTicketPayment = {
  identificationNumber: string;
  streetName: string;
  streetNumber: string;
  neighborhood: string;
};

export type CheckoutAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  address_1: string;
  address_2: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  mode: CartMode;
  loading: boolean;
  error: string | null;
  coupons: StoreApiCart["coupons"];
  shippingRates: StoreApiCart["shipping_rates"];
  needsShipping: boolean;
  hasCalculatedShipping: boolean;
  purchaseType: "empty" | "one_time" | "subscription";
  addItem: (product: Product, quantity?: number) => void;
  addSubscription: (product: Product, planId: number, replaceExisting?: boolean) => Promise<"added" | "requires_replacement" | "unavailable">;
  increment: (slug: string) => void;
  decrement: (slug: string) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: (code: string) => Promise<boolean>;
  updateCustomer: (data: CheckoutAddress) => Promise<boolean>;
  selectShippingRate: (packageId: number, rateId: string) => Promise<boolean>;
  checkoutWithMercadoPago: (address: CheckoutAddress) => Promise<StoreApiCheckout | null>;
  checkoutWithMercadoPagoCard: (address: CheckoutAddress, card: MercadoPagoCardPayment) => Promise<StoreApiCheckout | null>;
  checkoutWithMercadoPagoPix: (address: CheckoutAddress) => Promise<StoreApiCheckout | null>;
  checkoutWithMercadoPagoTicket: (address: CheckoutAddress, ticket: MercadoPagoTicketPayment) => Promise<StoreApiCheckout | null>;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "nutzenpet-cart";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatFrequency(interval: number, unit: string) {
  const labels: Record<string, [string, string]> = {
    day: ["dia", "dias"],
    week: ["semana", "semanas"],
    month: ["mês", "meses"],
  };
  const [singular, plural] = labels[unit] ?? labels.month;
  return interval === 1 ? `A cada 1 ${singular}` : `A cada ${interval} ${plural}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>(fallbackProducts);
  const [storeCart, setStoreCart] = useState<StoreApiCart | null>(null);
  const [mode, setMode] = useState<CartMode>("loading");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const productForStoreItem = useCallback((item: StoreApiCartItem, currentCatalog: Product[]) => {
    let slug = "";
    try {
      slug = new URL(item.permalink).pathname.split("/").filter(Boolean).pop() ?? "";
    } catch {
      slug = "";
    }
    const visual = currentCatalog.find((product) => product.wooId === item.id || product.slug === slug)
      ?? getProduct(slug);
    if (!visual) return null;
    const priceValue = Number(item.prices.price) / 10 ** item.prices.currency_minor_unit;
    return {
      ...visual,
      wooId: item.id,
      sku: item.sku,
      name: item.name || visual.name,
      priceValue,
      price: formatCurrency(priceValue),
      images: item.images.length > 0 ? item.images.map((image) => image.src) : visual.images,
    };
  }, []);

  const applyStoreCart = useCallback((nextCart: StoreApiCart, currentCatalog: Product[]) => {
    setStoreCart(nextCart);
    setItems(nextCart.items.flatMap((item) => {
      const product = productForStoreItem(item, currentCatalog);
      if (!product) return [];
      const details = item.extensions?.["nutzen-subscriptions"];
      const subscription = details?.purchase_type === "subscription"
        ? {
            planId: details.plan_id ?? 0,
            planName: details.plan_name ?? "Plano Nutzen Club",
            interval: details.interval ?? 1,
            intervalUnit: details.interval_unit ?? "month",
            frequencyLabel: details.frequency_label ?? "Recorrencia programada",
            discountType: details.discount_type ?? "percentage",
            discountValue: details.discount_value ?? 0,
            unitTotal: details.unit_total ?? product.priceValue,
          }
        : undefined;
      return [{ key: item.key, product, quantity: item.quantity, subscription }];
    }));
    setMode("woocommerce");
    setError(null);
  }, [productForStoreItem]);

  const requestCart = useCallback(async (path = "cart", init?: RequestInit) => {
    const response = await fetch(`/api/store/${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as StoreApiCart | { message?: string } | null;
    if (!response.ok || !payload || !("items" in payload)) {
      throw new Error(payload && "message" in payload ? payload.message : "Não foi possível atualizar o carrinho.");
    }
    return payload;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const catalogResponse = await fetch("/api/commerce/products", { cache: "no-store" });
        const catalogPayload = await catalogResponse.json().catch(() => null) as { products?: Product[] } | null;
        const currentCatalog = catalogPayload?.products?.length ? catalogPayload.products : fallbackProducts;
        setCatalog(currentCatalog);

        const remoteCart = await requestCart();
        applyStoreCart(remoteCart, currentCatalog);
        window.localStorage.removeItem(storageKey);
        return;
      } catch {
        setMode("fallback");
        setError("Carrinho do WooCommerce indisponível. Os itens serão mantidos apenas neste navegador.");
      }

      try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as Array<{
          slug: string;
          quantity: number;
        }>;
        const restored = stored.flatMap(({ slug, quantity }) => {
          const product = getProduct(slug);
          return product && quantity > 0 ? [{ product, quantity }] : [];
        });
        setItems(restored);
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applyStoreCart, requestCart]);

  useEffect(() => {
    if (!hydrated || mode !== "fallback") return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(items.map(({ product, quantity }) => ({ slug: product.slug, quantity }))),
    );
  }, [hydrated, items, mode]);

  const value = useMemo<CartContextValue>(() => {
    const updateLocalQuantity = (slug: string, change: number) => {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.product.slug !== slug) return [item];
          const quantity = item.quantity + change;
          return quantity > 0 ? [{ ...item, quantity }] : [];
        }),
      );
    };

    const mutateWooItem = async (slug: string, change: number) => {
      const item = items.find((candidate) => candidate.product.slug === slug);
      if (mode !== "woocommerce" || !item?.key) {
        updateLocalQuantity(slug, change);
        return;
      }
      try {
        const quantity = item.quantity + change;
        const nextCart = quantity > 0
          ? await requestCart("cart/update-item", { method: "POST", body: JSON.stringify({ key: item.key, quantity }) })
          : await requestCart("cart/remove-item", { method: "POST", body: JSON.stringify({ key: item.key }) });
        applyStoreCart(nextCart, catalog);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o item.");
      }
    };

    const runCartAction = async (path: string, body: Record<string, unknown>) => {
      try {
        const nextCart = await requestCart(path, { method: "POST", body: JSON.stringify(body) });
        applyStoreCart(nextCart, catalog);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o carrinho.");
        return false;
      }
    };

    const addSubscription = async (
      product: Product,
      planId: number,
      replaceExisting = false,
    ): Promise<"added" | "requires_replacement" | "unavailable"> => {
      const connectedProduct = catalog.find((candidate) => candidate.slug === product.slug) ?? product;
      const plan = connectedProduct.subscription?.plans.find((candidate) => candidate.id === planId);
      if (!connectedProduct.subscription?.eligible || !plan) {
        setError("Este produto ainda não possui uma frequência de assinatura configurada.");
        return "unavailable";
      }

      const hasOneTimeItems = items.some((item) => !item.subscription);
      if (hasOneTimeItems && !replaceExisting) return "requires_replacement";

      setError(null);
      if (mode === "woocommerce") {
        if (!connectedProduct.wooId) {
          setError("Este produto ainda não está sincronizado com o WooCommerce.");
          return "unavailable";
        }
        try {
          if (replaceExisting) {
            for (const item of items) {
              if (item.key) await requestCart("cart/remove-item", { method: "POST", body: JSON.stringify({ key: item.key }) });
            }
          }
          const nextCart = await requestCart("cart/add-item", {
            method: "POST",
            body: JSON.stringify({
              id: connectedProduct.wooId,
              quantity: 1,
              extensions: {
                "nutzen-subscriptions": { purchase_type: "subscription", plan_id: planId },
              },
            }),
          });
          applyStoreCart(nextCart, catalog);
          return "added";
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Não foi possível iniciar a assinatura.");
          return "unavailable";
        }
      }

      const discounted = plan.discountType === "fixed"
        ? Math.max(0, connectedProduct.priceValue - plan.discountValue)
        : Math.max(0, connectedProduct.priceValue * (1 - Math.min(100, plan.discountValue) / 100));
      setItems((current) => {
        const subscriptionItem: CartItem = {
          product: { ...connectedProduct, priceValue: discounted, price: formatCurrency(discounted) },
          quantity: 1,
          subscription: {
            planId,
            planName: plan.name,
            interval: plan.interval,
            intervalUnit: plan.intervalUnit,
            frequencyLabel: formatFrequency(plan.interval, plan.intervalUnit),
            discountType: plan.discountType,
            discountValue: plan.discountValue,
            unitTotal: discounted,
          },
        };
        return replaceExisting ? [subscriptionItem] : [...current, subscriptionItem];
      });
      return "added";
    };

    const minorValue = (value: string | null | undefined, unit = 2) => Number(value ?? 0) / 10 ** unit;
    const currencyUnit = storeCart?.totals.currency_minor_unit ?? 2;

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: storeCart ? minorValue(storeCart.totals.total_items, currencyUnit) : items.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
      total: storeCart ? minorValue(storeCart.totals.total_price, currencyUnit) : items.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
      mode,
      loading: mode === "loading",
      error,
      coupons: storeCart?.coupons ?? [],
      shippingRates: storeCart?.shipping_rates ?? [],
      needsShipping: storeCart?.needs_shipping ?? items.length > 0,
      hasCalculatedShipping: storeCart?.has_calculated_shipping ?? false,
      purchaseType: items.length === 0 ? "empty" : items.some((item) => item.subscription) ? "subscription" : "one_time",
      addItem: (product, quantity = 1) => {
        const connectedProduct = catalog.find((candidate) => candidate.slug === product.slug) ?? product;
        if (mode === "woocommerce" && connectedProduct.wooId) {
          void runCartAction("cart/add-item", { id: connectedProduct.wooId, quantity });
          return;
        }
        setItems((current) => {
          const existing = current.find((item) => item.product.slug === product.slug);
          if (!existing) return [...current, { product: connectedProduct, quantity }];
          return current.map((item) =>
            item.product.slug === product.slug
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        });
      },
      addSubscription,
      increment: (slug) => { void mutateWooItem(slug, 1); },
      decrement: (slug) => { void mutateWooItem(slug, -1); },
      removeItem: (slug) => {
        const item = items.find((candidate) => candidate.product.slug === slug);
        if (mode === "woocommerce" && item?.key) {
          void runCartAction("cart/remove-item", { key: item.key });
        } else {
          setItems((current) => current.filter((candidate) => candidate.product.slug !== slug));
        }
      },
      clearCart: () => {
        if (mode === "woocommerce") {
          for (const item of items) if (item.key) void runCartAction("cart/remove-item", { key: item.key });
        } else {
          setItems([]);
        }
      },
      applyCoupon: (code) => runCartAction("cart/apply-coupon", { code }),
      removeCoupon: (code) => runCartAction("cart/remove-coupon", { code }),
      updateCustomer: (data) => runCartAction("cart/update-customer", { shipping_address: data, billing_address: data }),
      selectShippingRate: (packageId, rateId) => runCartAction("cart/select-shipping-rate", { package_id: packageId, rate_id: rateId }),
      checkoutWithMercadoPago: async (address) => {
        if (mode !== "woocommerce" || !storeCart) {
          setError("O checkout do WooCommerce não está disponível no momento.");
          return null;
        }

        const shippingAddress = {
          first_name: address.first_name,
          last_name: address.last_name,
          postcode: address.postcode,
          city: address.city,
          state: address.state,
          country: address.country,
          address_1: address.address_1,
          address_2: address.address_2,
        };
        try {
          const response = await fetch("/api/store/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              billing_address: address,
              shipping_address: shippingAddress,
              payment_method: "woo-mercado-pago-basic",
              payment_data: [
                {
                  key: "mercadopago_checkout_session[_mp_flow_id]",
                  value: crypto.randomUUID(),
                },
              ],
              expected_total: storeCart.totals.total_price,
            }),
          });
          const payload = await response.json().catch(() => null) as StoreApiCheckout | { message?: string } | null;
          if (!response.ok || !payload || !("order_id" in payload)) {
            throw new Error(payload && "message" in payload ? payload.message : "Não foi possível iniciar o pagamento.");
          }
          setError(null);
          return payload;
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Não foi possível iniciar o pagamento.");
          return null;
        }
      },
      checkoutWithMercadoPagoCard: async (address, card) => {
        if (mode !== "woocommerce" || !storeCart) {
          setError("O checkout do WooCommerce não está disponível no momento.");
          return null;
        }

        const shippingAddress = {
          first_name: address.first_name,
          last_name: address.last_name,
          postcode: address.postcode,
          city: address.city,
          state: address.state,
          country: address.country,
          address_1: address.address_1,
          address_2: address.address_2,
        };
        const amount = (Number(storeCart.totals.total_price) / 10 ** storeCart.totals.currency_minor_unit).toFixed(2);
        const paymentData = [
          ["mercadopago_custom[amount]", amount],
          ["mercadopago_custom[currency_ratio]", "1"],
          ["mercadopago_custom[payment_method_id]", card.paymentMethodId],
          ["mercadopago_custom[checkout_type]", "custom"],
          ["mercadopago_custom[token]", card.token],
          ["mercadopago_custom[installments]", String(card.installments)],
          ["mercadopago_custom[session_id]", card.deviceSessionId ?? ""],
          ["mercadopago_custom[payment_type_id]", card.paymentTypeId || "credit_card"],
          ["mercadopago_custom[doc_number]", card.identificationNumber],
          ["mercadopago_custom[doc_type]", card.identificationType],
          ["mercadopago_custom[super_token_validation]", "false"],
          ["mercadopago_custom[authorized_pseudotoken]", ""],
          ["mercadopago_checkout_session[_mp_flow_id]", crypto.randomUUID()],
        ].map(([key, value]) => ({ key, value }));

        if (card.issuerId) {
          paymentData.push({ key: "mercadopago_custom[issuer]", value: card.issuerId });
        }

        try {
          const response = await fetch("/api/store/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              billing_address: address,
              shipping_address: shippingAddress,
              payment_method: "woo-mercado-pago-custom",
              payment_data: paymentData,
              expected_total: storeCart.totals.total_price,
            }),
          });
          const payload = await response.json().catch(() => null) as StoreApiCheckout | { message?: string } | null;
          if (!response.ok || !payload || !("order_id" in payload)) {
            throw new Error(payload && "message" in payload ? payload.message : "Não foi possível processar o cartão.");
          }
          setError(null);
          return payload;
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Não foi possível processar o cartão.");
          return null;
        }
      },
      checkoutWithMercadoPagoPix: async (address) => {
        if (mode !== "woocommerce" || !storeCart) {
          setError("O checkout do WooCommerce não está disponível no momento.");
          return null;
        }

        const shippingAddress = {
          first_name: address.first_name,
          last_name: address.last_name,
          postcode: address.postcode,
          city: address.city,
          state: address.state,
          country: address.country,
          address_1: address.address_1,
          address_2: address.address_2,
        };

        try {
          const response = await fetch("/api/store/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              billing_address: address,
              shipping_address: shippingAddress,
              payment_method: "woo-mercado-pago-pix",
              payment_data: [
                {
                  key: "mercadopago_checkout_session[_mp_flow_id]",
                  value: crypto.randomUUID(),
                },
              ],
              expected_total: storeCart.totals.total_price,
            }),
          });
          const payload = await response.json().catch(() => null) as StoreApiCheckout | { message?: string } | null;
          if (!response.ok || !payload || !("order_id" in payload)) {
            throw new Error(payload && "message" in payload ? payload.message : "Não foi possível gerar o Pix.");
          }
          setError(null);
          return payload;
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Não foi possível gerar o Pix.");
          return null;
        }
      },
      checkoutWithMercadoPagoTicket: async (address, ticket) => {
        if (mode !== "woocommerce" || !storeCart) {
          setError("O checkout do WooCommerce não está disponível no momento.");
          return null;
        }

        const shippingAddress = {
          first_name: address.first_name,
          last_name: address.last_name,
          postcode: address.postcode,
          city: address.city,
          state: address.state,
          country: address.country,
          address_1: address.address_1,
          address_2: address.address_2,
        };
        const amount = (Number(storeCart.totals.total_price) / 10 ** storeCart.totals.currency_minor_unit).toFixed(2);
        const paymentData = [
          ["mercadopago_ticket[site_id]", "MLB"],
          ["mercadopago_ticket[amount]", amount],
          ["mercadopago_ticket[currency_ratio]", "1"],
          ["mercadopago_ticket[payment_method_id]", "bolbradesco"],
          ["mercadopago_ticket[doc_type]", "CPF"],
          ["mercadopago_ticket[doc_number]", ticket.identificationNumber],
          ["mercadopago_ticket[address_city]", address.city],
          ["mercadopago_ticket[address_federal_unit]", address.state],
          ["mercadopago_ticket[address_zip_code]", address.postcode],
          ["mercadopago_ticket[address_street_name]", ticket.streetName],
          ["mercadopago_ticket[address_street_number]", ticket.streetNumber],
          ["mercadopago_ticket[address_neighborhood]", ticket.neighborhood],
          ["mercadopago_ticket[address_complement]", address.address_2],
          ["mercadopago_checkout_session[_mp_flow_id]", crypto.randomUUID()],
        ].map(([key, value]) => ({ key, value }));

        try {
          const response = await fetch("/api/store/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              billing_address: address,
              shipping_address: shippingAddress,
              payment_method: "woo-mercado-pago-ticket",
              payment_data: paymentData,
              expected_total: storeCart.totals.total_price,
            }),
          });
          const payload = await response.json().catch(() => null) as StoreApiCheckout | { message?: string } | null;
          if (!response.ok || !payload || !("order_id" in payload)) {
            throw new Error(payload && "message" in payload ? payload.message : "Não foi possível gerar o boleto.");
          }
          setError(null);
          return payload;
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Não foi possível gerar o boleto.");
          return null;
        }
      },
    };
  }, [applyStoreCart, catalog, error, items, mode, requestCart, storeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
