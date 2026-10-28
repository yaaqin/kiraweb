import type { Category, PaymentMethod } from "./types";

export const rupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "HAIRCUT", label: "Haircut" },
  { value: "COLORING", label: "Coloring" },
  { value: "SMOOTHING", label: "Smoothing" },
  { value: "CREAMBATH", label: "Creambath" },
  { value: "HAIRSTYLING", label: "Styling" },
  { value: "ADDONS", label: "Add-ons" },
  { value: "RETAIL", label: "Retail" },
];

export const categoryLabel = (category: Category) =>
  CATEGORIES.find((c) => c.value === category)?.label ?? category;

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash / Tunai",
  TRANSFER: "Transfer Bank",
  QRIS: "QRIS",
};

/** Mirrors the API's pricing so the POS can preview totals; the API stays authoritative. */
export const TAX_RATE = 0.1;
export function calculateTotals(subtotal: number, discountRate: number) {
  const discount = Math.round(subtotal * discountRate);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

/** Chart-of-accounts codes for the cash accounts each payment method lands in. */
export const ACCOUNT_LABELS: Record<PaymentMethod, string> = {
  CASH: "101 - Kas Fisik Kasir",
  QRIS: "102 - Bank QRIS",
  TRANSFER: "103 - Bank Transfer",
};
