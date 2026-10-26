"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaArrowRightFromBracket,
  FaBars,
  FaCashRegister,
  FaChartPie,
  FaReceipt,
  FaScissors,
  FaShieldHalved,
  FaUsersGear,
  FaXmark,
} from "react-icons/fa6";
import { useAuth } from "@/components/admin/auth-provider";
import { BRAND } from "@/lib/config";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: IconType;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan Sales", subtitle: "Performa omset & metode pembayaran hari ini", icon: FaChartPie },
  { href: "/dashboard/pos", label: "POS & Billing", subtitle: "Kalkulator kasir & cetak struk", icon: FaCashRegister },
  { href: "/dashboard/catalog", label: "Catalog & Harga", subtitle: "Ubah tarif treatment & produk", icon: FaScissors },
  { href: "/dashboard/transactions", label: "Riwayat Pembayaran", subtitle: "Arsip nota pembayaran", icon: FaReceipt },
  { href: "/dashboard/accounts", label: "Akun Admin", subtitle: "Kelola akses admin & kasir", icon: FaUsersGear, roles: ["SUPERADMIN"] },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (state.status === "unauthenticated") router.replace("/login");
  }, [state.status, router]);

  if (state.status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs font-bold text-charcoal-900/50">
        Memeriksa sesi...
      </div>
    );
  }

  const { user } = state;
  const nav = NAV.filter((item) => !item.roles || item.roles.includes(user.role));
  const current = NAV.find((item) => item.href === pathname) ?? NAV[0];
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="no-print z-20 flex w-full shrink-0 flex-col justify-between border-r border-blush-200 bg-white shadow-sm md:sticky md:top-0 md:h-screen md:w-64">
        <div>
          <div className="flex items-center justify-between border-b border-blush-100 p-4">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-xl font-bold text-charcoal-900">{BRAND.name}</span>
              <span className="-mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-blush-400">
                Admin & POS Manager
              </span>
            </Link>
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 text-blush-500 md:hidden" aria-label="Menu">
              {menuOpen ? <FaXmark /> : <FaBars />}
            </button>
          </div>

          <nav className={`space-y-1 p-3 text-xs font-bold ${menuOpen ? "block" : "hidden"} md:block`}>
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all ${
                  pathname === href
                    ? "bg-blush-100 text-blush-600"
                    : "text-charcoal-900/70 hover:bg-blush-50 hover:text-charcoal-900"
                }`}
              >
                <Icon className="w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className={`border-t border-blush-100 bg-blush-50/50 p-3 ${menuOpen ? "block" : "hidden"} md:block`}>
          <div className="mb-2 flex items-center gap-2.5 rounded-2xl border border-blush-200 bg-white p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-200 font-serif text-xs font-bold text-charcoal-900">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-charcoal-900">{user.name}</p>
              <p className="truncate text-[9px] text-charcoal-900/60">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
          >
            <FaArrowRightFromBracket />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-blush-200 bg-white/90 px-5 py-3 backdrop-blur-md">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900">{current.label}</h2>
            <p className="text-[11px] text-charcoal-900/60">{current.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            <FaShieldHalved />
            <span>{user.role === "SUPERADMIN" ? "Super Admin" : "Admin"}</span>
          </div>
        </header>
        <div className="space-y-6 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
