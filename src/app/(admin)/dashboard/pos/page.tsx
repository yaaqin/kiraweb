"use client";

import { useMemo, useState } from "react";
import {
  FaBasketShopping,
  FaBuildingColumns,
  FaCartShopping,
  FaCheckDouble,
  FaCopy,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaPlus,
  FaQrcode,
} from "react-icons/fa6";
import { CategoryPills, type CategoryFilter } from "@/components/admin/category-pills";
import { Modal } from "@/components/admin/modal";
import { ReceiptModal } from "@/components/admin/receipt-modal";
import { useToast } from "@/components/admin/toast";
import { cardClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { apiFetch } from "@/lib/api";
import { BRAND } from "@/lib/config";
import { calculateTotals, categoryLabel, PAYMENT_LABELS, rupiah } from "@/lib/format";
import type { CatalogItem, PaymentMethod, Transaction } from "@/lib/types";

const PAYMENT_ICONS = { CASH: FaMoneyBillWave, TRANSFER: FaBuildingColumns, QRIS: FaQrcode };

export default function PosPage() {
  const toast = useToast();
  const { data: catalog = [] } = useApiData<CatalogItem[]>("/catalog");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<{ code: string; rate: number } | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashReceived, setCashReceived] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const visible = catalog.filter(
    (i) =>
      (category === "ALL" || i.category === category) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );

  const lines = useMemo(
    () =>
      [...cart.entries()].flatMap(([id, qty]) => {
        const item = catalog.find((c) => c.id === id);
        return item ? [{ item, qty }] : [];
      }),
    [cart, catalog],
  );

  const totals = calculateTotals(
    lines.reduce((sum, l) => sum + l.item.price * l.qty, 0),
    voucher?.rate ?? 0,
  );
  const cash = Number(cashReceived) || 0;
  const change = cash - totals.total;

  function changeQty(id: number, delta: number) {
    setCart((prev) => {
      const next = new Map(prev);
      const qty = (next.get(id) ?? 0) + delta;
      if (qty > 0) next.set(id, qty);
      else next.delete(id);
      return next;
    });
  }

  function resetOrder() {
    setCart(new Map());
    setVoucher(null);
    setVoucherInput("");
    setCashReceived("");
  }

  async function applyVoucher() {
    if (!voucherInput.trim()) return;
    try {
      const v = await apiFetch<{ code: string; rate: number }>(
        `/transactions/vouchers/${encodeURIComponent(voucherInput.trim())}`,
      );
      setVoucher(v);
      toast(`Voucher ${v.code} (${Math.round(v.rate * 100)}%) diterapkan!`);
    } catch (e) {
      setVoucher(null);
      toast((e as Error).message, "error");
    }
  }

  function startCheckout() {
    if (!lines.length) return toast("Pilih minimal 1 treatment / produk!", "error");
    if (method === "CASH") {
      if (change < 0) return toast("Uang diterima kurang dari total!", "error");
      return submit();
    }
    setConfirming(true);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const tx = await apiFetch<Transaction>("/transactions", {
        method: "POST",
        body: {
          items: lines.map((l) => ({ catalogItemId: l.item.id, qty: l.qty })),
          paymentMethod: method,
          voucherCode: voucher?.code,
          cashReceived: method === "CASH" ? cash : undefined,
        },
      });
      setConfirming(false);
      setReceipt(tx);
      resetOrder();
      toast("Transaksi berhasil dicatat!");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast("Nomor rekening disalin!");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <div className="space-y-2 rounded-2xl border border-blush-200 bg-white p-3 shadow-sm">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari treatment atau produk..."
              className="w-full rounded-xl border border-blush-200 bg-blush-50 py-2 pl-9 pr-4 text-xs focus:border-blush-400 focus:outline-none"
            />
            <FaMagnifyingGlass className="absolute left-3 top-2.5 text-xs text-blush-400" />
          </div>
          <CategoryPills value={category} onChange={setCategory} />
        </div>

        <div className="grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => changeQty(item.id, 1)}
              className="flex flex-col justify-between space-y-2 rounded-2xl border border-blush-200 bg-white p-3 text-left shadow-sm transition-all hover:border-blush-400"
            >
              <div>
                <span className="rounded-full bg-blush-50 px-2 py-0.5 text-[9px] font-bold uppercase text-blush-500">
                  {categoryLabel(item.category)}
                </span>
                <h4 className="mt-1 text-xs font-bold leading-snug text-charcoal-900">{item.name}</h4>
                <p className="text-[10px] text-charcoal-900/60">{item.duration ?? "Retail"}</p>
              </div>
              <div className="flex w-full items-center justify-between border-t border-blush-100 pt-1">
                <span className="text-xs font-bold text-blush-600">{rupiah(item.price)}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blush-100 text-[10px] text-blush-600">
                  <FaPlus />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`${cardClass} flex flex-col justify-between space-y-4 p-4 sm:p-5 lg:col-span-5`}>
        <div>
          <div className="flex items-center justify-between border-b border-blush-100 pb-3">
            <h3 className="flex items-center font-serif text-base font-bold text-charcoal-900">
              <FaCartShopping className="mr-2 text-blush-400" /> Order Pelanggan
            </h3>
            <button onClick={resetOrder} className="text-[11px] font-bold text-red-500 hover:underline">
              Reset Order
            </button>
          </div>

          <div className="my-2 max-h-56 divide-y divide-blush-100 overflow-y-auto">
            {lines.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-900/40">
                <FaBasketShopping className="mx-auto mb-1 text-2xl" />
                <p>Belum ada item dipilih.</p>
              </div>
            ) : (
              lines.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate font-bold text-charcoal-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-blush-600">{rupiah(item.price * qty)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-blush-200 bg-blush-50 px-2 py-0.5">
                    <button onClick={() => changeQty(item.id, -1)} className="font-bold text-charcoal-900/60 hover:text-red-500">
                      -
                    </button>
                    <span className="px-1 text-xs font-bold">{qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="font-bold text-charcoal-900/60 hover:text-emerald-600">
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-blush-100 pt-3">
          <div className="flex gap-2">
            <input
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              placeholder="Kode Promo (e.g. SOH10)"
              className="flex-1 rounded-xl border border-blush-200 bg-blush-50 px-3 py-1.5 text-xs font-bold uppercase"
            />
            <button
              onClick={applyVoucher}
              className="rounded-xl border border-blush-200 bg-blush-100 px-3 py-1.5 text-xs font-bold text-blush-600 hover:bg-blush-200"
            >
              Gunakan
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-charcoal-900/70">
              <span>Subtotal</span>
              <span>{rupiah(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-600">
              <span>Diskon Promo{voucher && ` (${voucher.code})`}</span>
              <span>- {rupiah(totals.discount)}</span>
            </div>
            <div className="flex justify-between text-charcoal-900/70">
              <span>Pajak PPN (10%)</span>
              <span>{rupiah(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-blush-100 pt-1 font-serif text-base font-bold text-blush-600">
              <span>Total Pembayaran</span>
              <span>{rupiah(totals.total)}</span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold text-charcoal-900">Metode Pembayaran:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => {
                const Icon = PAYMENT_ICONS[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex flex-col items-center rounded-xl border py-2 text-[11px] font-bold ${
                      method === m
                        ? "border-blush-300 bg-blush-100 text-blush-600 shadow-sm"
                        : "border-blush-200 bg-white text-charcoal-900"
                    }`}
                  >
                    <Icon className="mb-0.5 text-xs" />
                    <span>{PAYMENT_LABELS[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {method === "CASH" && (
            <div className="space-y-1.5 rounded-2xl border border-blush-200 bg-blush-50 p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="cash" className="font-bold text-charcoal-900">
                  Uang Diterima (Rp):
                </label>
                <input
                  id="cash"
                  type="number"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="w-32 rounded-lg border border-blush-200 bg-white px-2 py-1 text-right font-bold"
                />
              </div>
              <div className="flex justify-between border-t border-blush-200/60 pt-1 font-bold">
                <span>Kembalian:</span>
                <span className={change >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {change >= 0 ? rupiah(change) : `Kurang ${rupiah(-change)}`}
                </span>
              </div>
            </div>
          )}

          {method === "TRANSFER" && (
            <div className="space-y-1 rounded-2xl border border-blush-200 bg-blush-50 p-2.5 text-xs">
              {BRAND.banks.map((b) => (
                <p key={b.bank} className="flex items-center justify-between font-bold text-blush-600">
                  <span>
                    {b.bank}: {b.display}
                  </span>
                  <button
                    onClick={() => copy(b.number)}
                    className="flex items-center gap-1 rounded border border-blush-200 bg-white px-2 py-0.5 text-[10px]"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
              ))}
              <p className="text-[10px] text-charcoal-900/60">a.n {BRAND.accountHolder}</p>
            </div>
          )}

          <button
            onClick={startCheckout}
            disabled={submitting}
            className="btn-blush flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider"
          >
            <FaCheckDouble />
            <span>Proses Pembayaran & Cetak Struk</span>
          </button>
        </div>
      </div>

      <Modal open={confirming} onClose={() => setConfirming(false)} size="sm">
        <div className="space-y-4 text-center">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-extrabold uppercase text-purple-700">
            {PAYMENT_LABELS[method]}
          </span>
          <h3 className="font-serif text-lg font-bold text-charcoal-900">Konfirmasi Pembayaran</h3>
          <p className="text-xs text-charcoal-900/60">
            Pastikan dana sebesar berikut sudah masuk sebelum menyelesaikan transaksi.
          </p>
          <p className="font-serif text-2xl font-bold text-blush-600">{rupiah(totals.total)}</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-xl bg-blush-50 py-2.5 text-xs font-bold">
              Batal
            </button>
            <button onClick={submit} disabled={submitting} className="btn-blush flex-1 rounded-xl py-2.5 text-xs font-bold">
              Pembayaran Diterima
            </button>
          </div>
        </div>
      </Modal>

      <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
