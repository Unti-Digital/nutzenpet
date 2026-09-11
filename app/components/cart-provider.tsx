"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type Product } from "../data/products";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  increment: (slug: string) => void;
  decrement: (slug: string) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "nutzenpet-cart";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
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
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(items.map(({ product, quantity }) => ({ slug: product.slug, quantity }))),
    );
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const updateQuantity = (slug: string, change: number) => {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.product.slug !== slug) return [item];
          const quantity = item.quantity + change;
          return quantity > 0 ? [{ ...item, quantity }] : [];
        }),
      );
    };

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.product.priceValue * item.quantity, 0),
      addItem: (product, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((item) => item.product.slug === product.slug);
          if (!existing) return [...current, { product, quantity }];
          return current.map((item) =>
            item.product.slug === product.slug
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        });
      },
      increment: (slug) => updateQuantity(slug, 1),
      decrement: (slug) => updateQuantity(slug, -1),
      removeItem: (slug) => setItems((current) => current.filter((item) => item.product.slug !== slug)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
