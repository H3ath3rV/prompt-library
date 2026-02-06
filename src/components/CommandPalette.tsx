"use client";

export type PaletteAction = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
};

export default function CommandPalette({
  open,
  actions,
  onClose
}: {
  open: boolean;
  actions: PaletteAction[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24">
      <div className="w-full max-w-lg rounded-2xl border border-mist bg-white p-4 shadow-xl">
        <div className="mb-3 text-xs uppercase tracking-wide text-slate">
          Command Palette
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
              className="flex items-center justify-between rounded-xl border border-mist px-3 py-2 text-sm hover:border-ink"
            >
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="text-sm text-slate">{action.shortcut}</span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-slate"
        >
          Press esc to close
        </button>
      </div>
    </div>
  );
}
