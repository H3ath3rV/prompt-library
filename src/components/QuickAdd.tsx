"use client";

import { useEffect, useMemo, useState } from "react";
import type { PromptInput } from "../lib/types";
import { DOMAIN_CATEGORIES } from "../lib/categories";

function suggestTitle(text: string) {
  const firstLine = text.split("\n").find((line) => line.trim().length > 0);
  return (firstLine ?? "Untitled prompt").slice(0, 80);
}

export default function QuickAdd({
  onSave,
  onCancel
}: {
  onSave: (input: PromptInput) => void;
  onCancel: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const title = useMemo(() => suggestTitle(raw), [raw]);

  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!titleInput && raw.trim().length > 0) {
      setTitleInput(title);
    }
  }, [raw, title, titleInput]);

  const handleSave = () => {
    const input: PromptInput = {
      title: titleInput.trim() || title,
      prompt_text: raw.trim(),
      notes: "",
      author: "",
      language: "",
      category: category || "",
      favorite: false,
      status: "draft"
    };

    onSave(input);
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="text-sm font-semibold">Quick Add</div>
      <div className="mt-4 grid gap-3">
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Paste raw prompt, newsletter excerpt, or creator notes..."
          className="min-h-[200px] rounded-xl border border-mist px-3 py-2 text-sm"
        />
        <input
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
          placeholder={`Suggested title: ${title}`}
          className="rounded-xl border border-mist bg-white px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-mist bg-white px-3 py-2 text-sm"
        >
          <option value="">Category (optional)</option>
          {DOMAIN_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleSave}
          className="rounded-full bg-ink px-4 py-2 text-sm text-white"
        >
          Save draft
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-mist px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
