"use client";

import { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, size = "md", className = "", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${size === "sm" ? "max-w-sm" : "max-w-md"} space-y-4 rounded-3xl border border-blush-200 bg-white p-6 shadow-2xl ${className}`}
      >
        {title && (
          <div className="no-print flex items-center justify-between border-b border-blush-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">{title}</h3>
            <button onClick={onClose} aria-label="Tutup" className="text-charcoal-900/50 hover:text-charcoal-900">
              <FaXmark className="text-lg" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
