"use client";

import { useState } from "react";
import { FaMagnifyingGlass, FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import { CategoryPills, type CategoryFilter } from "@/components/admin/category-pills";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { cardClass, inputClass, labelClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { apiFetch } from "@/lib/api";
import { CATEGORIES, categoryLabel, rupiah } from "@/lib/format";
import type { CatalogItem, Category } from "@/lib/types";

export function CatalogView() {
  const toast = useToast();
  const { data: items = [], loading, error, reload } = useApiData<CatalogItem[]>("/catalog/all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  // undefined = closed, null = creating, item = editing
  const [editing, setEditing] = useState<CatalogItem | null | undefined>(undefined);

  const visible = items.filter(
    (i) =>
      (category === "ALL" || i.category === category) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function remove(item: CatalogItem) {
    if (!confirm(`Hapus "${item.name}" dari catalog?`)) return;
    try {
      await apiFetch(`/catalog/${item.id}`, { method: "DELETE" });
      toast("Item berhasil dihapus!");
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blush-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari treatment atau produk retail..."
            className="w-full rounded-xl border border-blush-200 bg-blush-50 py-2 pl-9 pr-4 text-xs focus:border-blush-400 focus:outline-none"
          />
          <FaMagnifyingGlass className="absolute left-3 top-2.5 text-xs text-blush-400" />
        </div>
        <CategoryPills value={category} onChange={setCategory} />
        <button
          onClick={() => setEditing(null)}
          className="btn-blush flex shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold"
        >
          <FaPlus /> Tambah Item
        </button>
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
              <tr>
                <th className="p-3">Item / Treatment</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Durasi</th>
                <th className="p-3">Harga</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blush-100">
              {visible.map((item) => (
                <tr key={item.id} className="transition-all hover:bg-blush-50/50">
                  <td className="p-3 font-bold text-charcoal-900">{item.name}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blush-600">
                      {categoryLabel(item.category)}
                    </span>
                  </td>
                  <td className="p-3 text-charcoal-900/70">{item.duration ?? "-"}</td>
                  <td className="p-3 font-bold text-blush-600">{rupiah(item.price)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.isAvailable ? "Aktif" : "Non-Aktif"}
                    </span>
                  </td>
                  <td className="space-x-1 whitespace-nowrap p-3 text-right">
                    <button
                      onClick={() => setEditing(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blush-50 px-2 py-1 text-[10px] font-bold hover:bg-blush-100"
                    >
                      <FaPen className="text-blush-500" /> Edit
                    </button>
                    <button
                      onClick={() => remove(item)}
                      aria-label={`Hapus ${item.name}`}
                      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-charcoal-900/40">
                    Tidak ada item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== undefined && (
        <ItemModal
          item={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ItemModal({
  item,
  onClose,
  onSaved,
}: {
  item: CatalogItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim() || null;
    const body = {
      name: text("name"),
      category: form.get("category") as Category,
      price: Number(form.get("price")),
      duration: text("duration"),
      imageUrl: text("imageUrl"),
      isAvailable: form.get("isAvailable") === "on",
    };

    setSaving(true);
    try {
      await apiFetch(item ? `/catalog/${item.id}` : "/catalog", {
        method: item ? "PATCH" : "POST",
        body,
      });
      toast("Catalog berhasil diperbarui!");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
      setSaving(false);
    }
  }

  return (
    <Modal open title={item ? "Edit Item & Harga" : "Tambah Item Baru"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className={labelClass}>Nama Item / Treatment</label>
          <input name="name" required minLength={2} defaultValue={item?.name} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Kategori</label>
            <select name="category" defaultValue={item?.category ?? "HAIRCUT"} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Estimasi Waktu</label>
            <input name="duration" placeholder="45 min" defaultValue={item?.duration ?? ""} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Harga (Rp)</label>
          <input
            name="price"
            type="number"
            required
            min={0}
            placeholder="75000"
            defaultValue={item?.price}
            className={`${inputClass} font-bold text-blush-600`}
          />
        </div>

        <div>
          <label className={labelClass}>URL Gambar (opsional, untuk produk retail)</label>
          <input name="imageUrl" type="url" placeholder="https://..." defaultValue={item?.imageUrl ?? ""} className={inputClass} />
        </div>

        <label className="flex items-center gap-2 pt-1 font-bold">
          <input name="isAvailable" type="checkbox" defaultChecked={item?.isAvailable ?? true} className="h-4 w-4 accent-blush-500" />
          Status Aktif Tersedia
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl bg-blush-50 px-4 py-2 font-bold">
            Batal
          </button>
          <button type="submit" disabled={saving} className="btn-blush rounded-xl px-5 py-2 font-bold">
            {saving ? "Menyimpan..." : "Simpan Item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
