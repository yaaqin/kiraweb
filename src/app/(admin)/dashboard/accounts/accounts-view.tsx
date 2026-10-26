"use client";

import { useState } from "react";
import { FaLock, FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import { useAuth } from "@/components/admin/auth-provider";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { cardClass, inputClass, labelClass } from "@/components/admin/ui";
import { useApiData } from "@/components/admin/use-api-data";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { AdminUser, Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = { SUPERADMIN: "Super Admin", ADMIN: "Admin" };
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin (POS & Catalog)" },
  { value: "SUPERADMIN", label: "Super Admin (+ Kelola Akun)" },
];

export function AccountsView() {
  const { state } = useAuth();
  if (state.user?.role !== "SUPERADMIN") {
    return (
      <div className={`${cardClass} flex flex-col items-center gap-2 p-10 text-center`}>
        <FaLock className="text-2xl text-blush-400" />
        <h3 className="font-serif text-lg font-bold">Akses Ditolak</h3>
        <p className="text-xs text-charcoal-900/60">Halaman ini hanya bisa diakses oleh Super Admin.</p>
      </div>
    );
  }
  return <AccountsManager currentUserId={state.user.id} />;
}

function AccountsManager({ currentUserId }: { currentUserId: number }) {
  const toast = useToast();
  const { data: users = [], error, reload } = useApiData<AdminUser[]>("/users");
  // undefined = closed, null = creating, user = editing
  const [editing, setEditing] = useState<AdminUser | null | undefined>(undefined);

  async function remove(user: AdminUser) {
    if (!confirm(`Hapus akun ${user.email}?`)) return;
    try {
      await apiFetch(`/users/${user.id}`, { method: "DELETE" });
      toast("Akun berhasil dihapus!");
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className={`${cardClass} space-y-3 p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-charcoal-900">Daftar Akun Admin</h3>
        <button
          onClick={() => setEditing(null)}
          className="btn-blush flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold"
        >
          <FaPlus /> Tambah Admin
        </button>
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-blush-200 bg-blush-50 text-[10px] font-bold uppercase tracking-wider text-charcoal-900/70">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-blush-50/50">
                <td className="p-3 font-bold">
                  {u.name}
                  {u.id === currentUserId && <span className="ml-1 text-[10px] font-semibold text-blush-500">(Anda)</span>}
                </td>
                <td className="p-3 text-charcoal-900/70">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      u.role === "SUPERADMIN" ? "bg-charcoal-900 text-blush-100" : "bg-blush-100 text-blush-600"
                    }`}
                  >
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.isActive ? "Aktif" : "Non-Aktif"}
                  </span>
                </td>
                <td className="space-x-1 whitespace-nowrap p-3 text-right">
                  <button
                    onClick={() => setEditing(u)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blush-50 px-2 py-1 text-[10px] font-bold hover:bg-blush-100"
                  >
                    <FaPen className="text-blush-500" /> Edit
                  </button>
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => remove(u)}
                      aria-label={`Hapus ${u.email}`}
                      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <UserModal
          user={editing}
          isSelf={editing?.id === currentUserId}
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

function UserModal({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: AdminUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const body = {
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      ...(password && { password }),
      // Own role/status can't be changed, so don't send them for self.
      ...(!isSelf && {
        role: form.get("role") as Role,
        ...(user && { isActive: form.get("isActive") === "on" }),
      }),
    };

    setSaving(true);
    try {
      await apiFetch(user ? `/users/${user.id}` : "/users", { method: user ? "PATCH" : "POST", body });
      toast(user ? "Akun berhasil diperbarui!" : "Admin baru berhasil ditambahkan!");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
      setSaving(false);
    }
  }

  return (
    <Modal open title={user ? "Edit Akun" : "Tambah Admin Baru"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className={labelClass}>Nama</label>
          <input name="name" required minLength={2} defaultValue={user?.name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" required defaultValue={user?.email} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{user ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}</label>
          <input
            name="password"
            type="password"
            minLength={8}
            required={!user}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <Select name="role" defaultValue={user?.role ?? "ADMIN"} disabled={isSelf} options={ROLE_OPTIONS} />
        </div>
        {user && !isSelf && (
          <label className="flex items-center gap-2 pt-1 font-bold">
            <input name="isActive" type="checkbox" defaultChecked={user.isActive} className="h-4 w-4 accent-blush-500" />
            Akun Aktif
          </label>
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
