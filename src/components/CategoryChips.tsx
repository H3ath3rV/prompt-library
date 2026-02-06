"use client";

import { DOMAIN_CATEGORIES } from "../lib/categories";

export default function CategoryChips({
  selected,
  counts,
  onSelect
}: {
  selected: string | null;
  counts: Record<string, number>;
  onSelect: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full border px-3 py-1 text-sm ${
          selected === null
            ? "border-ink bg-ink text-white"
            : "border-mist bg-white text-ink"
        }`}
      >
        All
      </button>
      {DOMAIN_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`rounded-full border px-3 py-1 text-sm ${
            selected === category
              ? "border-ink bg-ink text-white"
              : "border-mist bg-white text-ink"
          }`}
        >
          <span>{category}</span>
          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs text-slate">
            {counts[category] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
