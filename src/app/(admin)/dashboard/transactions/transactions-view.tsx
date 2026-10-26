"use client";

import { useState } from "react";
import { FaPrint } from "react-icons/fa6";
import { ReceiptModal } from "@/components/admin/receipt-modal";
import { cardClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { PAYMENT_LABELS, rupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionsView() {
  const { data: transactions = [], loading, error } = useApiData<Transaction[]>("/transactions");
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  return (
    <div className={`${cardClass} space-y-3 p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-charcoal-900">Riwayat Struk & Pembayaran</h3>
        <span className="rounded-full border border-blush-200 bg-blush-50 px-3 py-1 text-xs font-bold text-blush-500">
          {transactions.length} Transaksi
        </span>
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
            <tr>
              <th className="p-3">ID Nota</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Kasir</th>
              <th className="p-3">Metode</th>
              <th className="p-3">Total Bayar</th>
              <th className="p-3 text-right">Cetak Ulang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-blush-50/50">
                <td className="p-3 font-bold text-blush-600">{t.code}</td>
                <td className="p-3 text-charcoal-900/70">
                  {new Date(t.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="p-3 text-charcoal-900/70">{t.cashier?.name ?? "-"}</td>
                <td className="p-3">
                  <span className="rounded bg-blush-100 px-2 py-0.5 text-[10px] font-bold text-blush-600">
                    {PAYMENT_LABELS[t.paymentMethod]}
                  </span>
                </td>
                <td className="p-3 font-bold">{rupiah(t.total)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setReceipt(t)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blush-500 hover:underline"
                  >
                    <FaPrint /> Struk
                  </button>
                </td>
              </tr>
            ))}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-charcoal-900/40">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
