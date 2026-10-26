"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaArrowTrendUp,
  FaBuildingColumns,
  FaCashRegister,
  FaFire,
  FaMoneyBillWave,
  FaQrcode,
  FaReceipt,
  FaScaleBalanced,
} from "react-icons/fa6";
import { cardClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { rupiah } from "@/lib/format";
import type { PaymentMethod, SalesSummary } from "@/lib/types";

const METHODS: { key: PaymentMethod; label: string; icon: IconType; color: string; bar: string }[] = [
  { key: "QRIS", label: "QRIS Instant Scan", icon: FaQrcode, color: "text-purple-500", bar: "bg-purple-500" },
  { key: "TRANSFER", label: "Bank Transfer (BCA / Mandiri)", icon: FaBuildingColumns, color: "text-blue-500", bar: "bg-blue-500" },
  { key: "CASH", label: "Cash / Tunai", icon: FaMoneyBillWave, color: "text-emerald-500", bar: "bg-emerald-500" },
];

export function SummaryView() {
  const { data, error } = useApiData<SalesSummary>("/transactions/summary");

  if (error) return <p className="text-xs font-bold text-red-500">{error}</p>;

  const orders = data?.orders ?? 0;
  const pct = (method: PaymentMethod) =>
    orders ? Math.round(((data?.paymentBreakdown[method] ?? 0) / orders) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Total Omset Hari Ini" value={rupiah(data?.revenue ?? 0)} accent footnote="Live Update" icon={FaArrowTrendUp} />
        <StatCard label="Total Transaksi" value={String(orders)} footnote="Nota Diterbitkan" icon={FaReceipt} />
        <StatCard label="Top Treatment" value={data?.topItem ?? "-"} small footnote="Paling Diminati" icon={FaFire} />
        <StatCard
          label="Rata-rata / Nota"
          value={rupiah(orders ? Math.round((data?.revenue ?? 0) / orders) : 0)}
          footnote="Nilai Transaksi"
          icon={FaScaleBalanced}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${cardClass} space-y-4 p-5 lg:col-span-2`}>
          <h3 className="font-serif text-base font-bold text-charcoal-900">Breakdown Metode Pembayaran</h3>
          <div className="space-y-3">
            {METHODS.map(({ key, label, icon: Icon, color, bar }) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-xs font-bold">
                  <span className="flex items-center">
                    <Icon className={`mr-2 ${color}`} />
                    {label}
                  </span>
                  <span>{pct(key)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-blush-200 bg-blush-50">
                  <div className={`${bar} h-full transition-all duration-500`} style={{ width: `${pct(key)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-blush-200 bg-gradient-to-br from-blush-100 to-blush-50 p-5 shadow-sm">
          <div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blush-600">
              Aksi Kasir Quick POS
            </span>
            <h3 className="mt-2 font-serif text-lg font-bold text-charcoal-900">Buat Tagihan Baru</h3>
            <p className="mt-1 text-xs text-charcoal-900/70">
              Pilih menu treatment atau produk retail salon dan cetak struk pembayaran instan.
            </p>
          </div>
          <Link
            href="/dashboard/pos"
            className="btn-blush mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider"
          >
            <FaCashRegister />
            <span>Buka Menu Kasir (POS)</span>
          </Link>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  footnote,
  icon: Icon,
  accent,
  small,
}: {
  label: string;
  value: string;
  footnote: string;
  icon: IconType;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-[9px] font-extrabold uppercase tracking-widest text-charcoal-900/50">{label}</p>
      <h3
        className={`mt-1 truncate font-serif font-bold ${small ? "text-base" : "text-xl sm:text-2xl"} ${
          accent ? "text-blush-600" : "text-charcoal-900"
        }`}
      >
        {value}
      </h3>
      <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blush-500">
        <Icon />
        {footnote}
      </p>
    </div>
  );
}
