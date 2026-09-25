"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, products as fallbackProducts, type Product } from "../data/products";
import type { StoreApiCart, StoreApiCartItem } from "@/lib/woocommerce/types";

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
  updateCustomer: (data: Record<string, string>) => Promise<boolean>;
  selectShippingRate: (packageId: number, rateId: string) => Promise<boolean>;
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
    };
  }, [applyStoreCart, catalog, error, items, mode, requestCart, storeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
