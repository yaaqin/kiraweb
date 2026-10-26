import type { SelectHTMLAttributes } from "react";
import { FaChevronDown } from "react-icons/fa6";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  /** "soft" matches admin form inputs, "white" sits on tinted panels. */
  tone?: "soft" | "white";
}

/**
 * Native <select> (keeps forms, keyboard and mobile pickers working) with the
 * browser arrow replaced by a consistently padded chevron.
 */
export function Select({ options, tone = "soft", className = "", ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...props}
        className={`w-full cursor-pointer appearance-none rounded-xl border border-blush-200 py-2.5 pl-3 pr-10 text-xs text-charcoal-900 transition-colors focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-100 disabled:cursor-not-allowed disabled:opacity-60 ${
          tone === "white" ? "bg-white" : "bg-blush-50 focus:bg-white"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FaChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-blush-400"
      />
    </div>
  );
}
