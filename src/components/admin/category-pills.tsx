import { CATEGORIES } from "@/lib/format";
import type { Category } from "@/lib/types";

export type CategoryFilter = Category | "ALL";

export function CategoryPills({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}) {
  const options: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "Semua" },
    ...CATEGORIES,
  ];
  return (
    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 text-[11px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full px-3 py-1 font-bold ${
            value === o.value
              ? "bg-blush-400 text-white"
              : "border border-blush-200 bg-white text-charcoal-900"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
