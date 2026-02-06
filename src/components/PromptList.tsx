"use client";

import type { Prompt } from "../lib/types";

export default function PromptList({
  prompts,
  selectedId,
  onSelect,
  onCopy,
  onUse
}: {
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCopy: (id: string) => void;
  onUse: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onSelect(prompt.id)}
          className={`group rounded-2xl border p-4 text-left transition hover:border-slate ${
            selectedId === prompt.id ? "border-ink bg-white" : "border-mist bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold">{prompt.title}</div>
              <div className="mt-1 text-sm text-slate line-clamp-2">{prompt.prompt_text}</div>
            </div>
            {prompt.favorite && (
              <span className="text-xs font-semibold text-amber">★</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 justify-end">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onCopy(prompt.id);
              }}
              className="rounded-full border border-mist px-3 py-1 text-xs"
            >
              Copy
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onUse(prompt.id);
              }}
              className="rounded-full border border-mist px-3 py-1 text-xs"
            >
              Use
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {prompt.category && (
              <span className="rounded-full border border-mist bg-fog px-2 py-0.5 text-xs text-ink">
                {prompt.category}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
