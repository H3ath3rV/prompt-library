"use client";

import type { ChangeEvent } from "react";

export default function SearchBar({
  value,
  onChange,
  inputRef
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-mist bg-fog px-3 py-2">
      <span className="text-sm text-slate">/</span>
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder="Search prompts, notes..."
        className="w-full bg-transparent text-sm outline-none"
      />
    </div>
  );
}
