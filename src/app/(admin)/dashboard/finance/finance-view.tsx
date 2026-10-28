"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FaArrowTrendUp,
  FaBuildingColumns,
  FaLock,
  FaMoneyBillWave,
  FaPlus,
  FaQrcode,
  FaTrash,
} from "react-icons/fa6";
import { useAuth } from "@/components/admin/auth-provider";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { cardClass, inputClass, labelClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { ACCOUNT_LABELS, PAYMENT_LABELS, rupiah } from "@/lib/format";
import type { FinanceRange, FinanceReport, LedgerEntry, LedgerKind, PaymentMethod } from "@/lib/types";

type Tab = "kpi" | "ledger" | "cashflow" | "balance" | "petty";

const TABS: { value: Tab; label: string }[] = [
  { value: "kpi", label: "KPI Summary" },
  { value: "ledger", label: "Buku Besar" },
  { value: "cashflow", label: "Arus Kas" },
  { value: "balance", label: "Neraca" },
  { value: "petty", label: "Petty Cash" },
];

const RANGE_OPTIONS = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "all", label: "Semua Tanggal" },
];

const METHOD_OPTIONS = [
  { value: "ALL", label: "Semua Akun" },
  ...(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_LABELS[m] })),
];

const KIND_LABELS: Record<LedgerKind, string> = {
  SALE: "Omset Penjualan",
  EXPENSE: "Beban Operasional",
  PETTY_CASH: "Petty Cash",
};
const KIND_OPTIONS = [
  { value: "ALL", label: "Semua Jenis Transaksi" },
  ...(Object.keys(KIND_LABELS) as LedgerKind[]).map((k) => ({ value: k, label: KIND_LABELS[k] })),
];

const ACCOUNTS: { key: PaymentMethod; label: string; icon: IconType }[] = [
  { key: "QRIS", label: "Saldo Bank QRIS", icon: FaQrcode },
  { key: "CASH", label: "Saldo Kas Fisik (Tunai)", icon: FaMoneyBillWave },
  { key: "TRANSFER", label: "Saldo Bank Transfer", icon: FaBuildingColumns },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });

export function FinanceView() {
  const { state } = useAuth();
  if (state.user?.role !== "SUPERADMIN") {
    return (
      <div className={`${cardClass} flex flex-col items-center gap-2 p-10 text-center`}>
        <FaLock className="text-2xl text-blush-400" />
        <h3 className="font-serif text-lg font-bold">Akses Ditolak</h3>
        <p className="text-xs text-charcoal-900/60">Laporan keuangan hanya bisa diakses oleh Super Admin.</p>
      </div>
    );
  }
  return <FinanceDashboard />;
}

function FinanceDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("kpi");
  const [range, setRange] = useState<FinanceRange>("today");
  const [method, setMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [kind, setKind] = useState<LedgerKind | "ALL">("ALL");
  // undefined = closed, otherwise whether the form records petty cash
  const [expenseForm, setExpenseForm] = useState<{ petty: boolean }>();
  const { data: report, error, reload } = useApiData<FinanceReport>(`/finance/report?range=${range}`);

  const ledger = (report?.ledger ?? []).filter(
    (e) => (method === "ALL" || e.account === method) && (kind === "ALL" || e.kind === kind),
  );

  async function removeExpense(entry: LedgerEntry) {
    if (!confirm(`Hapus ${entry.ref} - ${entry.description}?`)) return;
    try {
      await apiFetch(`/finance/expenses/${entry.id}`, { method: "DELETE" });
      toast("Biaya berhasil dihapus!");
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <>
      <div className={`${cardClass} flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs font-bold">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`shrink-0 rounded-xl px-3 py-1.5 ${
                tab === t.value ? "bg-blush-400 text-white" : "text-charcoal-900/70 hover:bg-blush-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Select
            aria-label="Periode"
            value={range}
            onChange={(e) => setRange(e.target.value as FinanceRange)}
            options={RANGE_OPTIONS}
            className="sm:w-36"
          />
          <Select
            aria-label="Akun"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod | "ALL")}
            options={METHOD_OPTIONS}
            className="sm:w-36"
          />
          <Select
            aria-label="Jenis transaksi"
            value={kind}
            onChange={(e) => setKind(e.target.value as LedgerKind | "ALL")}
            options={KIND_OPTIONS}
            className="sm:w-44"
          />
          <button
            onClick={() => setExpenseForm({ petty: false })}
            className="btn-blush flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold"
          >
            <FaPlus /> Input Biaya
          </button>
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      {report && tab === "kpi" && <KpiTab report={report} />}
      {report && tab === "ledger" && <LedgerTab entries={ledger} onRemove={removeExpense} />}
      {report && tab === "cashflow" && <CashflowTab report={report} />}
      {report && tab === "balance" && <BalanceTab report={report} />}
      {report && tab === "petty" && (
        <PettyCashTab
          entries={report.ledger.filter((e) => e.kind === "PETTY_CASH")}
          onAdd={() => setExpenseForm({ petty: true })}
          onRemove={removeExpense}
        />
      )}

      {expenseForm && (
        <ExpenseModal
          petty={expenseForm.petty}
          onClose={() => setExpenseForm(undefined)}
          onSaved={() => {
            setExpenseForm(undefined);
            reload();
          }}
        />
      )}
    </>
  );
}

function KpiTab({ report }: { report: FinanceReport }) {
  const maxDay = Math.max(1, ...report.trend.flatMap((d) => [d.revenue, d.expenses]));

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className={`${cardClass} p-4`}>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-charcoal-900/50">Total Omset Penjualan</p>
          <h3 className="mt-1 truncate font-serif text-xl font-bold text-blush-600 sm:text-2xl">
            {rupiah(report.period.revenue)}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blush-500">
            <FaArrowTrendUp />
            {RANGE_OPTIONS.find((r) => r.value === report.range)?.label}
          </p>
        </div>
        {ACCOUNTS.map(({ key, label, icon: Icon }) => (
          <div key={key} className={`${cardClass} p-4`}>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-charcoal-900/50">{label}</p>
            <h3 className="mt-1 truncate font-serif text-xl font-bold text-charcoal-900 sm:text-2xl">
              {rupiah(report.balances[key])}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blush-500">
              <Icon />
              Akun {ACCOUNT_LABELS[key]}
            </p>
          </div>
        ))}
      </div>

      <div className={`${cardClass} space-y-4 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif text-base font-bold text-charcoal-900">Tren Kas Masuk & Keluar (7 Hari)</h3>
          <div className="flex items-center gap-3 text-[10px] font-bold text-charcoal-900/70">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-blush-400" /> Masuk
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-charcoal-800" /> Keluar
            </span>
          </div>
        </div>
        <div className="flex h-48 items-end gap-2 sm:gap-4">
          {report.trend.map((d) => (
            <div key={d.date} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end justify-center gap-1">
                <div
                  title={`Masuk ${rupiah(d.revenue)}`}
                  className="w-1/2 max-w-6 rounded-t-md bg-blush-400 transition-all duration-500"
                  style={{ height: `${(d.revenue / maxDay) * 100}%` }}
                />
                <div
                  title={`Keluar ${rupiah(d.expenses)}`}
                  className="w-1/2 max-w-6 rounded-t-md bg-charcoal-800 transition-all duration-500"
                  style={{ height: `${(d.expenses / maxDay) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-charcoal-900/60">
                {new Date(`${d.date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function LedgerTab({ entries, onRemove }: { entries: LedgerEntry[]; onRemove: (entry: LedgerEntry) => void }) {
  return (
    <div className={`${cardClass} space-y-3 p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-charcoal-900">Buku Besar Operasional</h3>
        <span className="rounded-full border border-blush-200 bg-blush-50 px-3 py-1 text-xs font-bold text-blush-500">
          {entries.length} Entri
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Ref</th>
              <th className="p-3">Akun</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3 text-right">Debit</th>
              <th className="p-3 text-right">Kredit</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-100">
            {entries.map((e) => (
              <tr key={`${e.kind}-${e.id}`} className="hover:bg-blush-50/50">
                <td className="whitespace-nowrap p-3 text-charcoal-900/70">{formatDate(e.date)}</td>
                <td className="whitespace-nowrap p-3 font-bold text-blush-600">{e.ref}</td>
                <td className="whitespace-nowrap p-3 font-bold">{ACCOUNT_LABELS[e.account]}</td>
                <td className="p-3">
                  <span className="mr-1.5 rounded bg-blush-100 px-2 py-0.5 text-[10px] font-bold text-blush-600">
                    {KIND_LABELS[e.kind]}
                  </span>
                  {e.description}
                </td>
                <td className="whitespace-nowrap p-3 text-right font-bold text-emerald-600">
                  {e.debit ? rupiah(e.debit) : "-"}
                </td>
                <td className="whitespace-nowrap p-3 text-right font-bold text-red-600">
                  {e.credit ? rupiah(e.credit) : "-"}
                </td>
                <td className="p-3 text-right">
                  {e.kind !== "SALE" && <RemoveButton entry={e} onRemove={onRemove} />}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-charcoal-900/40">
                  Belum ada transaksi pada periode & filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashflowTab({ report }: { report: FinanceReport }) {
  const { revenue, revenueByMethod, expenses, pettyCash } = report.period;
  const net = revenue - expenses - pettyCash;

  return (
    <div className={`${cardClass} space-y-4 p-5 text-xs`}>
      <h3 className="font-serif text-base font-bold text-charcoal-900">Laporan Arus Kas</h3>
      <div className="space-y-2 rounded-2xl border border-blush-200 bg-blush-50 p-4">
        <h4 className="border-b border-blush-200 pb-1 text-[11px] font-bold uppercase">Kas Masuk dari Customer</h4>
        {ACCOUNTS.map(({ key }) => (
          <Row key={key} label={`Via ${PAYMENT_LABELS[key]} (${ACCOUNT_LABELS[key]})`} value={rupiah(revenueByMethod[key])} />
        ))}
        <Row label="Total Penerimaan Omset" value={`+ ${rupiah(revenue)}`} tone="in" strong />
      </div>
      <div className="space-y-2 rounded-2xl border border-blush-200 bg-blush-50 p-4">
        <h4 className="border-b border-blush-200 pb-1 text-[11px] font-bold uppercase">Kas Keluar Operasional</h4>
        <Row label="Beban Operasional (Input Biaya Manual)" value={rupiah(expenses)} />
        <Row label="Petty Cash (Kas Kecil)" value={rupiah(pettyCash)} />
        <Row label="Total Pengeluaran" value={`- ${rupiah(expenses + pettyCash)}`} tone="out" strong />
      </div>
      <div className="flex justify-between rounded-2xl border border-blush-300 bg-white p-4 font-serif text-base font-bold">
        <span>Arus Kas Bersih</span>
        <span className={net < 0 ? "text-red-600" : "text-emerald-600"}>{rupiah(net)}</span>
      </div>
    </div>
  );
}

function BalanceTab({ report }: { report: FinanceReport }) {
  const totalAssets = ACCOUNTS.reduce((sum, { key }) => sum + report.balances[key], 0);

  return (
    <div className={`${cardClass} space-y-4 p-5 text-xs`}>
      <div>
        <h3 className="font-serif text-base font-bold text-charcoal-900">Laporan Neraca</h3>
        <p className="text-[11px] text-charcoal-900/60">Posisi per hari ini, tidak terpengaruh filter periode.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-blush-200 bg-blush-50 p-4">
          <h4 className="border-b border-blush-200 pb-1 text-[11px] font-bold uppercase">Aset Lancar</h4>
          {ACCOUNTS.map(({ key }) => (
            <Row key={key} label={ACCOUNT_LABELS[key]} value={rupiah(report.balances[key])} />
          ))}
          <Row label="Total Aktiva" value={rupiah(totalAssets)} strong />
        </div>
        <div className="space-y-2 rounded-2xl border border-blush-200 bg-blush-50 p-4">
          <h4 className="border-b border-blush-200 pb-1 text-[11px] font-bold uppercase">Ekuitas</h4>
          <Row label="Laba Ditahan (Omset - Beban)" value={rupiah(totalAssets)} />
          <Row label="Total Pasiva" value={rupiah(totalAssets)} strong />
        </div>
      </div>
    </div>
  );
}

function PettyCashTab({
  entries,
  onAdd,
  onRemove,
}: {
  entries: LedgerEntry[];
  onAdd: () => void;
  onRemove: (entry: LedgerEntry) => void;
}) {
  return (
    <div className={`${cardClass} space-y-3 p-4`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-base font-bold text-charcoal-900">Petty Cash (Kas Kecil)</h3>
          <p className="text-[11px] text-charcoal-900/60">Diambil dari {ACCOUNT_LABELS.CASH}</p>
        </div>
        <button onClick={onAdd} className="btn-blush flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold">
          <FaPlus /> Tambah Kas Kecil
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Keperluan</th>
              <th className="p-3">Penerima / PIC</th>
              <th className="p-3 text-right">Jumlah</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-100">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-blush-50/50">
                <td className="whitespace-nowrap p-3 text-charcoal-900/70">{formatDate(e.date)}</td>
                <td className="p-3 font-bold">{e.description}</td>
                <td className="p-3 text-charcoal-900/70">{e.pic ?? "-"}</td>
                <td className="whitespace-nowrap p-3 text-right font-bold text-red-600">{rupiah(e.credit)}</td>
                <td className="p-3 text-right">
                  <RemoveButton entry={e} onRemove={onRemove} />
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal-900/40">
                  Belum ada pengeluaran kas kecil pada periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, value, tone, strong }: { label: string; value: string; tone?: "in" | "out"; strong?: boolean }) {
  const color = tone === "in" ? "text-emerald-600" : tone === "out" ? "text-red-600" : "";
  return (
    <div className={`flex justify-between gap-3 ${strong ? "border-t border-blush-200 pt-2 font-bold" : ""}`}>
      <span>{label}</span>
      <span className={`whitespace-nowrap font-bold ${color}`}>{value}</span>
    </div>
  );
}

function RemoveButton({ entry, onRemove }: { entry: LedgerEntry; onRemove: (entry: LedgerEntry) => void }) {
  return (
    <button
      onClick={() => onRemove(entry)}
      aria-label={`Hapus ${entry.ref}`}
      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100"
    >
      <FaTrash />
    </button>
  );
}

const SOURCE_OPTIONS = [
  { value: "CASH", label: "Kas Fisik Kasir (Tunai)" },
  { value: "TRANSFER", label: "Bank Transfer BCA/Mandiri" },
  { value: "QRIS", label: "Bank QRIS" },
  { value: "PETTY", label: "Petty Cash Kas Kecil" },
];

function ExpenseModal({ petty, onClose, onSaved }: { petty: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const source = petty ? "PETTY" : String(form.get("source"));
    const body = {
      description: String(form.get("description")).trim(),
      amount: Number(form.get("amount")),
      ...(source === "PETTY" ? { isPettyCash: true, pic: String(form.get("pic") ?? "").trim() } : { account: source }),
    };

    setSaving(true);
    try {
      await apiFetch("/finance/expenses", { method: "POST", body });
      toast(source === "PETTY" ? "Kas kecil berhasil dicatat!" : "Pengeluaran berhasil dicatat!");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
      setSaving(false);
    }
  }

  return (
    <Modal open size="sm" title={petty ? "Catat Petty Cash" : "Input Biaya Manual"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className={labelClass}>{petty ? "Keperluan Pengeluaran" : "Keterangan Biaya"}</label>
          <input
            name="description"
            required
            minLength={2}
            placeholder={petty ? "Beli tissue / snack welcome drink" : "Beli shampoo refill / bayar listrik"}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Jumlah (Rp)</label>
          <input name="amount" type="number" required min={1} step={1} placeholder="100000" className={inputClass} />
        </div>
        {petty ? (
          <div>
            <label className={labelClass}>Penerima / PIC Staff</label>
            <input name="pic" placeholder="Kosongkan untuk nama Anda" className={inputClass} />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Sumber Dana / Akun</label>
            <Select name="source" defaultValue="CASH" options={SOURCE_OPTIONS} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl bg-blush-50 px-4 py-2 font-bold">
            Batal
          </button>
          <button type="submit" disabled={saving} className="btn-blush rounded-xl px-5 py-2 font-bold">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
