import { useEffect } from "react";

type ShortcutMap = {
  onSearchFocus: () => void;
  onQuickAdd: () => void;
  onCommandPalette: () => void;
  onToggleFavorite: () => void;
  onEscape: () => void;
};

export function useGlobalShortcuts(map: ShortcutMap) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
        if (event.key === "Escape") {
          map.onEscape();
        }
        return;
      }
      const isMeta = event.metaKey || event.ctrlKey;

      if (event.key === "/" && !isMeta) {
        event.preventDefault();
        map.onSearchFocus();
        return;
      }

      if (event.key.toLowerCase() === "n" && !isMeta) {
        event.preventDefault();
        map.onQuickAdd();
        return;
      }

      if (event.key.toLowerCase() === "k" && event.metaKey) {
        event.preventDefault();
        map.onCommandPalette();
        return;
      }

      if (event.key.toLowerCase() === "f" && !isMeta) {
        event.preventDefault();
        map.onToggleFavorite();
        return;
      }

      if (event.key === "Escape") {
        map.onEscape();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map]);
}
