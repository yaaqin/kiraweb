"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { useToast } from "@/components/admin/toast";
import { cardClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { BOOKING_STATUS, rupiah } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

type StatusFilter = BookingStatus | "ALL";

const STATUS_OPTIONS = (Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => ({
  value: s,
  label: BOOKING_STATUS[s].label,
}));

/** Indonesian local numbers (08...) to the international form wa.me expects (628...). */
const waNumber = (phone: string) => phone.replace(/\D/g, "").replace(/^0/, "62");

export function BookingsView() {
  const toast = useToast();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const { data: bookings = [], loading, error, reload } = useApiData<Booking[]>(
    filter === "ALL" ? "/bookings" : `/bookings?status=${filter}`,
  );

  async function setStatus(booking: Booking, status: BookingStatus) {
    try {
      await apiFetch(`/bookings/${booking.id}`, { method: "PATCH", body: { status } });
      toast(`Booking ${booking.name} → ${BOOKING_STATUS[status].label}`);
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className={`${cardClass} space-y-3 p-4`}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h3 className="font-serif text-base font-bold text-charcoal-900">Permintaan Booking dari Website</h3>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto text-[11px]">
          {([{ value: "ALL", label: "Semua" }, ...STATUS_OPTIONS] as { value: StatusFilter; label: string }[]).map((o) => (
            <button
              key={o.value}
              onClick={() => setFilter(o.value)}
              className={`shrink-0 rounded-full px-3 py-1 font-bold ${
                filter === o.value ? "bg-blush-400 text-white" : "border border-blush-200 bg-white text-charcoal-900"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
            <tr>
              <th className="p-3">Jadwal</th>
              <th className="p-3">Pelanggan</th>
              <th className="p-3">Pilihan & Catatan</th>
              <th className="p-3">Estimasi</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-100">
            {bookings.map((b) => (
              <tr key={b.id} className="align-top hover:bg-blush-50/50">
                <td className="whitespace-nowrap p-3">
                  <p className="font-bold text-charcoal-900">
                    {new Date(b.preferredDate).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "UTC" })}
                  </p>
                  <p className="text-charcoal-900/60">Pukul {b.preferredTime}</p>
                </td>
                <td className="p-3">
                  <p className="font-bold text-charcoal-900">{b.name}</p>
                  <a
                    href={`https://wa.me/${waNumber(b.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    <FaWhatsapp /> {b.phone}
                  </a>
                </td>
                <td className="max-w-xs p-3 text-charcoal-900/70">
                  {b.items.length > 0 && (
                    <ul className="mb-1 space-y-0.5">
                      {b.items.map((i) => (
                        <li key={i.name}>
                          {i.name} ({i.qty}x)
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.note && <p className="italic">“{b.note}”</p>}
                  {!b.items.length && !b.note && "-"}
                </td>
                <td className="whitespace-nowrap p-3 font-bold text-blush-600">{b.total ? rupiah(b.total) : "-"}</td>
                <td className="w-40 p-3">
                  <Select
                    aria-label={`Status booking ${b.name}`}
                    value={b.status}
                    onChange={(e) => setStatus(b, e.target.value as BookingStatus)}
                    options={STATUS_OPTIONS}
                    tone="white"
                  />
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal-900/40">
                  Belum ada booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
