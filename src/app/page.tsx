"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import PromptList from "../components/PromptList";
import PromptDetail from "../components/PromptDetail";
import CategoryChips from "../components/CategoryChips";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import CommandPalette from "../components/CommandPalette";
import { useGlobalShortcuts } from "../lib/shortcuts";
import type { FilterState, Prompt } from "../lib/types";
import {
  deletePrompt,
  listPrompts,
  toggleFavorite,
  updatePrompt,
  usePrompt
} from "../lib/tauri";

const defaultFilters: FilterState = {
  query: "",
  category: null,
  status: "all",
  favoriteOnly: false,
  sort: "newest"
};

const baseFilters: FilterState = {
  query: "",
  category: null,
  status: "all",
  favoriteOnly: false,
  sort: "newest"
};

export default function LibraryPage() {
  const router = useRouter();
  const [filters, setFilters] = useState(defaultFilters);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const isFiltered = Boolean(filters.query || filters.category || filters.favoriteOnly || filters.status !== "all");
  const isFilteredEmpty = isFiltered && prompts.length == 0 && allPrompts.length > 0;

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedId) ?? null,
    [prompts, selectedId]
  );

  const refresh = async () => {
    const data = await listPrompts(filters);
    setPrompts(data);
    setSelectedId((prev) => prev ?? null);
    const all = await listPrompts(baseFilters);
    setAllPrompts(all);
    const categoryList = Array.from(
      new Set(all.map((prompt) => prompt.category).filter(Boolean) as string[])
    );
    setCategories(categoryList);
    const counts: Record<string, number> = {};
    all.forEach((prompt) => {
      if (prompt.category) {
        counts[prompt.category] = (counts[prompt.category] || 0) + 1;
      }
    });
    setCategoryCounts(counts);
  };

  useEffect(() => {
    refresh();
  }, [filters]);

  useGlobalShortcuts({
    onSearchFocus: () => searchRef.current?.focus(),
    onQuickAdd: () => router.push("/new"),
    onCommandPalette: () => setPaletteOpen(true),
    onToggleFavorite: async () => {
      if (!selectedId) return;
      await toggleFavorite(selectedId);
      refresh();
    },
    onEscape: () => {
      setPaletteOpen(false);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
      setSelectedId(null);
    }
  });

  const toolbar = (
    <div className="w-full">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mist md:hidden"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-lg font-semibold whitespace-nowrap">
            <img src="/logo_symbol.png" alt="Prompt Library" className="h-7 w-auto" />
            <span className="font-semibold">Prompt Library</span>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-mist bg-fog px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="Search"
              className="w-52 bg-transparent text-sm outline-none"
            />
            <span className="rounded-full border border-mist bg-white px-2 py-0.5 text-xs text-slate">/</span>
          </div>
          <button
            onClick={() => setFilters({ ...baseFilters, sort: filters.sort })}
            className="rounded-full border border-mist px-4 py-2 text-sm"
          >
            Back to library
          </button>
          <button
            onClick={() => setFilters({ ...filters, favoriteOnly: !filters.favoriteOnly })}
            className={`rounded-full border px-4 py-2 text-sm ${filters.favoriteOnly ? "border-ink bg-ink text-white" : "border-mist bg-white"}`}
          >
            Favorites
          </button>
          <button
            onClick={() => router.push("/new")}
            className="rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            New prompt
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mist"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="mt-3 md:hidden">
          <div className="flex items-center gap-2 rounded-full border border-mist bg-fog px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none"
            />
            <span className="rounded-full border border-mist bg-white px-2 py-0.5 text-xs text-slate">/</span>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[78%] max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-mist px-4 py-3">
              <div className="flex items-center gap-2 text-base font-semibold">
                <img src="/logo_symbol.png" alt="Prompt Library" className="h-6 w-auto" />
                <span>Prompt Library</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-mist"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 px-4 py-4">
              <button
                onClick={() => {
                  setFilters({ ...baseFilters, sort: filters.sort });
                  setMobileMenuOpen(false);
                }}
                className="rounded-xl border border-mist px-4 py-3 text-left text-sm"
              >
                Back to library
              </button>
              <button
                onClick={() => {
                  setFilters({ ...filters, favoriteOnly: !filters.favoriteOnly });
                  setMobileMenuOpen(false);
                }}
                className="rounded-xl border border-mist px-4 py-3 text-left text-sm"
              >
                Favorites
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/new");
                }}
                className="rounded-xl bg-ink px-4 py-3 text-left text-sm text-white"
              >
                New prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  const paletteActions = [
    {
      id: "new",
      label: "New Prompt",
      shortcut: "n",
      onSelect: () => router.push("/new")
    },
    {
      id: "export",
      label: "Export JSON",
      shortcut: "cmd+e",
      onSelect: () => router.push("/settings")
    },
    {
      id: "import",
      label: "Import JSON",
      shortcut: "cmd+i",
      onSelect: () => router.push("/settings")
    },
    {
      id: "toggle-favorite",
      label: "Toggle Favorite",
      shortcut: "f",
      onSelect: async () => {
        if (selectedId) {
          await toggleFavorite(selectedId);
          refresh();
        }
      }
    },
    {
      id: "status-ready",
      label: "Set Status: Ready",
      onSelect: async () => {
        if (selectedId) {
          await updatePrompt(selectedId, { status: "ready" });
          refresh();
        }
      }
    },
    {
      id: "status-archived",
      label: "Set Status: Archived",
      onSelect: async () => {
        if (selectedId) {
          await updatePrompt(selectedId, { status: "archived" });
          refresh();
        }
      }
    }
  ];

  const content = prompts.length === 0 ? (
    isFilteredEmpty ? (
      <div className="flex h-full flex-col gap-6">

      <div className="rounded-2xl border border-mist bg-white p-6">
        <div className="text-3xl font-semibold">Prompt gallery</div>
        <div className="mt-2 max-w-2xl text-base text-slate">
          Collect and organize prompts from newsletters, creators, and your own experiments. Save drafts quickly and promote the ones you use most.
        </div>
      </div>
        <EmptyState
          title="No prompts match this filter"
          description="Try a different category or clear filters to return to the full library."
          action={
            <button
              onClick={() => setFilters({ ...baseFilters, sort: filters.sort })}
              className="rounded-full border border-mist px-4 py-2 text-sm"
            >
              Clear filters
            </button>
          }
        />
      </div>
    ) : (
      <div className="flex h-full flex-col gap-6">

      <div className="rounded-2xl border border-mist bg-white p-6">
        <div className="text-3xl font-semibold">Prompt gallery</div>
        <div className="mt-2 max-w-2xl text-base text-slate">
          Collect and organize prompts from newsletters, creators, and your own experiments. Save drafts quickly and promote the ones you use most.
        </div>
      </div>
        <EmptyState
          title="Capture your first prompt"
          description="Add prompts from newsletters, emails, or creators. Quick Add keeps the flow going."
          action={
            <button
              onClick={() => router.push("/new")}
              className="rounded-full bg-ink px-4 py-2 text-sm text-white"
            >
              New prompt
            </button>
          }
        />
      </div>
    )
  ) : (
    <div className="flex h-full flex-col gap-6">

      <div className="rounded-2xl border border-mist bg-white p-6">
        <div className="text-3xl font-semibold">Prompt gallery</div>
        <div className="mt-2 max-w-2xl text-base text-slate">
          Collect and organize prompts from newsletters, creators, and your own experiments. Save drafts quickly and promote the ones you use most.
        </div>
      </div>
      <div className="rounded-2xl border border-mist bg-white p-4">
        <div className="text-sm uppercase tracking-wide text-slate">Categories</div>
        <div className="mt-3">
          <CategoryChips
            selected={filters.category}
            counts={categoryCounts}
            onSelect={(category) => setFilters({ ...filters, category })}
          />
        </div>
      </div>
      <div>
        <PromptList
          prompts={prompts}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onCopy={(id) => {
            const prompt = prompts.find((item) => item.id === id);
            if (prompt) {
              navigator.clipboard.writeText(prompt.prompt_text);
            }
          }}
          onUse={async (id) => {
            await usePrompt(id);
            refresh();
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <AppShell
        toolbar={toolbar}
        content={content}
      />
      <Modal
        open={Boolean(selectedPrompt)}
        title={selectedPrompt ? selectedPrompt.title : "Prompt"}
        onClose={() => setSelectedId(null)}
      >
        {selectedPrompt && (
          <PromptDetail
            prompt={selectedPrompt}
            onCopy={() => navigator.clipboard.writeText(selectedPrompt.prompt_text)}
            onUse={async () => {
              await usePrompt(selectedPrompt.id);
              refresh();
            }}
            onToggleFavorite={async () => {
              await toggleFavorite(selectedPrompt.id);
              refresh();
            }}
            onSave={async (input) => {
              await updatePrompt(selectedPrompt.id, input);
              refresh();
            }}
            onDelete={async () => {
              await deletePrompt(selectedPrompt.id);
              setSelectedId(null);
              refresh();
            }}
          />
        )}
      </Modal>
      <CommandPalette
        open={paletteOpen}
        actions={paletteActions}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
