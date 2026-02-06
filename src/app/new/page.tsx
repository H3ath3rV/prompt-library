"use client";

import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import QuickAdd from "../../components/QuickAdd";
import { createPrompt } from "../../lib/tauri";

export default function NewPromptPage() {
  const router = useRouter();

  return (
    <AppShell
      toolbar={
        <div className="flex w-full items-center justify-between">
          <div className="text-lg font-semibold">Quick Add</div>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-mist px-4 py-2 text-sm"
          >
            Back to library
          </button>
        </div>
      }
      content={
        <QuickAdd
          onSave={async (input) => {
            await createPrompt(input);
            router.push("/");
          }}
          onCancel={() => router.push("/")}
        />
      }
    />
  );
}
