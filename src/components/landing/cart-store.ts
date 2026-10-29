"use client";

import { useSyncExternalStore } from "react";
import type { Category } from "@/lib/types";

export interface CartLine {
  id: number;
  name: string;
  price: number;
  category: Category;
  qty: number;
}

const KEY = "som_cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cart: CartLine[] | null = null;

// Storage can be unavailable (private mode, blocked site data); the cart then lives in memory only.
function read(): CartLine[] {
  if (cart) return cart;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cart = Array.isArray(parsed) ? parsed : [];
  } catch {
    cart = [];
  }
  return cart;
}

function write(next: CartLine[]) {
  cart = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Landing cart persisted in localStorage, so it survives a reload. Empty during SSR. */
export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cartActions = {
  add(item: Omit<CartLine, "qty">) {
    const prev = read();
    const found = prev.find((l) => l.id === item.id);
    write(
      found
        ? prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { ...item, qty: 1 }],
    );
  },
  changeQty(id: number, delta: number) {
    write(read().map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  },
  clear() {
    write([]);
  },
};
