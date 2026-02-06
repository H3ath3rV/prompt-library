"use client";

import { useState } from "react";
import type { Prompt, PromptInput } from "../lib/types";
import { DOMAIN_CATEGORIES } from "../lib/categories";

export default function PromptDetail({
  prompt,
  onSave,
  onCopy,
  onUse,
  onToggleFavorite,
  onDelete
}: {
  prompt: Prompt;
  onSave: (input: Partial<PromptInput>) => void;
  onCopy: () => void;
  onUse: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<PromptInput>>({});

  const startEdit = () => {
    setDraft({
      title: prompt.title,
      prompt_text: prompt.prompt_text,
      notes: prompt.notes ?? "",
      author: prompt.author ?? "",
      language: prompt.language ?? "",
      category: prompt.category ?? "",
      favorite: prompt.favorite,
      status: prompt.status
    });
    setEditing(true);
  };

  const save = () => {
    onSave({
      ...draft
    });
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate">Prompt</div>
          <div className="text-xl font-semibold">{prompt.title}</div>
          <div className="mt-1 text-sm text-slate">
            {prompt.status.toUpperCase()} • Last used: {prompt.last_used_at ? prompt.last_used_at.slice(0, 10) : "Never"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="rounded-full border border-mist px-3 py-1 text-sm"
          >
            {prompt.favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            onClick={onUse}
            className="rounded-full bg-ink px-3 py-1 text-sm text-white"
          >
            Use
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Prompt Text</div>
          <button
            onClick={onCopy}
            className="rounded-full border border-mist px-3 py-1 text-sm"
          >
            Copy prompt
          </button>
        </div>
        {editing ? (
          <textarea
            value={draft.prompt_text ?? ""}
            onChange={(event) => setDraft({ ...draft, prompt_text: event.target.value })}
            placeholder="Prompt text"
            className="mt-3 min-h-[180px] w-full rounded-xl border border-mist px-3 py-2 text-sm"
          />
        ) : (
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-mist bg-fog p-4 text-sm">
            {prompt.prompt_text}
          </pre>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm font-semibold">Metadata</div>
        <div className="flex gap-2">
          {!editing ? (
            <button
              onClick={startEdit}
              className="rounded-full border border-mist px-3 py-1 text-sm"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={save}
              className="rounded-full bg-ink px-3 py-1 text-sm text-white"
            >
              Save
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-full border border-rose px-3 py-1 text-sm text-rose"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={draft.title ?? ""}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Title"
            className="rounded-xl border border-mist px-3 py-2 text-sm"
          />
          <select
            value={draft.status ?? "draft"}
            onChange={(event) => setDraft({ ...draft, status: event.target.value as PromptInput["status"] })}
            className="rounded-xl border border-mist bg-white px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={draft.category ?? ""}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            className="rounded-xl border border-mist bg-white px-3 py-2 text-sm md:col-span-2"
          >
            <option value="">Category</option>
            {DOMAIN_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea
            value={draft.notes ?? ""}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            placeholder="Notes"
            className="min-h-[120px] rounded-xl border border-mist px-3 py-2 text-sm md:col-span-2"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate">Category</div>
            <div className="text-sm">{prompt.category ?? "—"}</div>
            {!prompt.category && (
              <div className="text-sm text-slate">Example: writing, image prompts</div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-slate">Notes</div>
            <div className="text-sm whitespace-pre-wrap">{prompt.notes ?? "—"}</div>
            {!prompt.notes && (
              <div className="text-sm text-slate">Example: Add your variations or usage tips</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
