"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import { exportJson, getDataLocation, importJson, openDataFolder } from "../../lib/tauri";

export default function SettingsPage() {
  const router = useRouter();
  const [dataLocation, setDataLocation] = useState("...");
  const [importStatus, setImportStatus] = useState("");

  useEffect(() => {
    getDataLocation().then(setDataLocation);
  }, []);

  const handleExport = async () => {
    const json = await exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prompt-library-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const count = await importJson(text);
    setImportStatus(`Imported ${count} prompts.`);
  };

  return (
    <AppShell
      toolbar={
        <div className="flex w-full items-center justify-between">
          <div className="text-lg font-semibold">Settings</div>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-mist px-4 py-2 text-sm"
          >
            Back to library
          </button>
        </div>
      }
      content={
        <div className="grid gap-6">
          <div className="rounded-2xl border border-mist bg-white p-6">
            <div className="text-sm font-semibold">Data location</div>
            <div className="mt-2 text-sm text-slate">{dataLocation}</div>
            <button
              onClick={() => openDataFolder()}
              className="mt-3 rounded-full border border-mist px-4 py-2 text-sm"
            >
              Open data folder
            </button>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6">
            <div className="text-sm font-semibold">Import / Export</div>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="rounded-full bg-ink px-4 py-2 text-sm text-white"
              >
                Export JSON
              </button>
              <label className="rounded-full border border-mist px-4 py-2 text-sm">
                Import JSON
                <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            {importStatus && <div className="mt-3 text-sm text-leaf">{importStatus}</div>}
          </div>
        </div>
      }
    />
  );
}
