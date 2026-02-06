import { invoke } from "@tauri-apps/api/core";
import type { FilterState, Prompt, PromptInput, PromptPatch } from "./types";

export async function listPrompts(filters: FilterState): Promise<Prompt[]> {
  return invoke("list_prompts", { filters });
}

export async function getPrompt(id: string): Promise<Prompt | null> {
  return invoke("get_prompt", { id });
}

export async function createPrompt(input: PromptInput): Promise<Prompt> {
  return invoke("create_prompt", { input });
}

export async function updatePrompt(id: string, input: PromptPatch): Promise<Prompt> {
  return invoke("update_prompt", { id, input });
}

export async function deletePrompt(id: string): Promise<void> {
  return invoke("delete_prompt", { id });
}

export async function duplicatePrompt(id: string): Promise<Prompt> {
  return invoke("duplicate_prompt", { id });
}

export async function usePrompt(id: string): Promise<void> {
  return invoke("use_prompt", { id });
}

export async function toggleFavorite(id: string): Promise<Prompt> {
  return invoke("toggle_favorite", { id });
}

export async function exportJson(): Promise<string> {
  return invoke("export_json");
}

export async function importJson(json: string): Promise<number> {
  return invoke("import_json", { json });
}

export async function openDataFolder(): Promise<void> {
  return invoke("open_data_folder");
}

export async function getDataLocation(): Promise<string> {
  return invoke("get_data_location");
}
