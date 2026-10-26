"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";

type ToastKind = "success" | "error";
type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message, kind = "success") => {
    setToast({ message, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        className={`no-print fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-2xl border border-blush-300 bg-charcoal-900 px-4 py-3 text-white shadow-2xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0"
        }`}
      >
        {toast?.kind === "error" ? (
          <FaCircleExclamation className="text-lg text-red-400" />
        ) : (
          <FaCircleCheck className="text-lg text-emerald-400" />
        )}
        <span className="text-xs font-bold">{toast?.message}</span>
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
