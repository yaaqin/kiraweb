"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCircleExclamation, FaEnvelope, FaLock, FaRightToBracket } from "react-icons/fa6";
import { useAuth } from "@/components/admin/auth-provider";
import { BRAND } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const { state, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state.status === "authenticated") router.replace("/dashboard");
  }, [state.status, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await login(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blush-100 via-blush-50 to-blush-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-blush-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 text-center">
          <span className="mb-2 inline-block rounded-full bg-blush-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blush-500">
            Admin Portal
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-charcoal-900">{BRAND.name}</h1>
          <p className="mt-1 text-xs text-charcoal-900/60">Sistem POS Kasir, Katalog & Penyesuaian Harga</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            <FaCircleExclamation className="text-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email Administrator" icon={<FaEnvelope />}>
            <input name="email" type="email" required autoComplete="username" placeholder="admin@styleonmotion.com" className={fieldInput} />
          </Field>
          <Field label="Password" icon={<FaLock />}>
            <input name="password" type="password" required autoComplete="current-password" placeholder="Masukkan password" className={fieldInput} />
          </Field>

          <button
            type="submit"
            disabled={submitting || state.status === "loading"}
            className="btn-blush flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider"
          >
            <FaRightToBracket />
            <span>{submitting ? "Memproses..." : "Masuk"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}

const fieldInput =
  "w-full rounded-2xl border border-blush-200 bg-blush-50/50 py-2.5 pl-10 pr-4 text-xs text-charcoal-900 transition-all focus:border-blush-400 focus:bg-white focus:outline-none";

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-charcoal-900">{label}</span>
      <span className="relative block">
        {children}
        <span className="absolute left-3.5 top-3 text-xs text-blush-400">{icon}</span>
      </span>
    </label>
  );
}
