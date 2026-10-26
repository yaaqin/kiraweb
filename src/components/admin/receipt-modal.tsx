"use client";

import { FaPrint } from "react-icons/fa6";
import { BRAND } from "@/lib/config";
import { PAYMENT_LABELS, rupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { Modal } from "./modal";

export function ReceiptModal({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  return (
    <Modal open={!!tx} onClose={onClose} size="sm" className="print-area">
      {tx && (
        <>
          <div className="space-y-1 border-b border-dashed border-blush-200 pb-4 text-center">
            <h2 className="font-serif text-xl font-bold text-charcoal-900">{BRAND.name}</h2>
            <p className="text-[10px] text-charcoal-900/60">{BRAND.address}</p>
            <p className="text-[10px] text-charcoal-900/60">Telp/WA: {BRAND.phone}</p>
            <span className="mt-1 inline-block rounded-full bg-blush-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-blush-600">
              Nota #{tx.code}
            </span>
            <p className="text-[10px] text-charcoal-900/60">
              {new Date(tx.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
              {tx.cashier && ` · Kasir: ${tx.cashier.name}`}
            </p>
          </div>

          <div className="divide-y divide-blush-100 text-xs">
            {tx.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1.5">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span className="font-bold">{rupiah(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-dashed border-blush-200 pt-3 text-xs">
            <Row label="Subtotal" value={rupiah(tx.subtotal)} />
            {tx.discount > 0 && (
              <Row label={`Diskon (${tx.voucherCode})`} value={`- ${rupiah(tx.discount)}`} />
            )}
            <Row label="PPN 10%" value={rupiah(tx.tax)} />
            <Row label="Metode Bayar" value={PAYMENT_LABELS[tx.paymentMethod]} />
            {tx.cashReceived !== null && (
              <>
                <Row label="Uang Diterima" value={rupiah(tx.cashReceived)} />
                <Row label="Kembalian" value={rupiah(tx.cashReceived - tx.total)} />
              </>
            )}
            <div className="flex justify-between pt-1 font-serif text-sm font-bold text-blush-600">
              <span>Total Lunas</span>
              <span>{rupiah(tx.total)}</span>
            </div>
          </div>

          <div className="no-print flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl bg-blush-50 py-2 text-xs font-bold">
              Tutup
            </button>
            <button
              onClick={() => window.print()}
              className="btn-blush flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold"
            >
              <FaPrint /> Cetak Struk
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-charcoal-900/70">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
