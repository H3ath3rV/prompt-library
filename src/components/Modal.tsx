"use client";

import type { ReactNode } from "react";

export default function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6 pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl border border-mist bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-mist px-6 py-4">
          <div className="text-base font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full border border-mist px-3 py-1 text-base"
          >
            Close
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
