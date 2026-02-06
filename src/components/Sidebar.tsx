"use client";

import type { FilterState, PromptStatus } from "../lib/types";
import { DOMAIN_CATEGORIES } from "../lib/categories";

const statuses: Array<PromptStatus | "all"> = ["all", "draft", "ready", "archived"];

export default function Sidebar({
  filters,
  categories,
  onChange
}: {
  filters: FilterState;
  categories: string[];
  onChange: (next: FilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-6 text-base">
      <div>
        <div className="text-sm uppercase tracking-wide text-slate">Filters</div>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.favoriteOnly}
              onChange={(event) =>
                onChange({ ...filters, favoriteOnly: event.target.checked })
              }
            />
            Favorites only
          </label>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as FilterState["status"]
              })
            }
            className="rounded-lg border border-mist bg-white px-2 py-1"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="text-sm uppercase tracking-wide text-slate">Categories</div>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => onChange({ ...filters, category: null })}
            className={`text-left ${filters.category === null ? "font-semibold" : ""}`}
          >
            All categories
          </button>
          {Array.from(new Set([...DOMAIN_CATEGORIES, ...categories])).map((category) => (
            <button
              key={category}
              onClick={() => onChange({ ...filters, category })}
              className={`text-left ${filters.category === category ? "font-semibold" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
