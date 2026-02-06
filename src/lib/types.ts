export type PromptStatus = "draft" | "ready" | "archived";

export type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  notes?: string | null;
  author?: string | null;
  language?: string | null;
  category?: string | null;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
  favorite: boolean;
  status: PromptStatus;
};

export type PromptInput = Omit<Prompt, "id" | "created_at" | "updated_at" | "last_used_at"> & {
  last_used_at?: string | null;
};

export type PromptPatch = Partial<PromptInput>;

export type FilterState = {
  query: string;
  category: string | null;
  status: PromptStatus | "all";
  favoriteOnly: boolean;
  sort: "newest" | "recent" | "favorites";
};
