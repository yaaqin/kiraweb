import type { BookingStatus, Category, PaymentMethod } from "./types";

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

export const BOOKING_STATUS: Record<BookingStatus, { label: string; className: string }> = {
  NEW: { label: "Baru", className: "bg-blush-100 text-blush-600" },
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-emerald-100 text-emerald-700" },
  DONE: { label: "Selesai", className: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Batal", className: "bg-red-50 text-red-600" },
};
