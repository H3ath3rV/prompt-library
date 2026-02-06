"use client";

import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useRouter } from "next/navigation";
import { exportJson } from "../lib/tauri";

export default function MenuListener() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const unsubs: Array<() => void> = [];

    listen("menu-new", () => router.push("/new")).then((unsub) => unsubs.push(unsub));
    listen("menu-import", () => router.push("/settings")).then((unsub) => unsubs.push(unsub));
    listen("menu-export", async () => {
      const json = await exportJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "prompt-library-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
    }).then((unsub) => unsubs.push(unsub));

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [router]);

  return null;
}
