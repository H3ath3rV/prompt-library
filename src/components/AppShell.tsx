"use client";

import type { ReactNode } from "react";
import MenuListener from "./MenuListener";

export default function AppShell({
  sidebar,
  toolbar,
  content
}: {
  sidebar?: ReactNode;
  toolbar: ReactNode;
  content: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <MenuListener />
      <div className="flex h-screen">
        {sidebar && (
          <aside className="w-64 border-r border-mist bg-white">
            <div className="h-full overflow-y-auto px-5 py-6">
              {sidebar}
            </div>
          </aside>
        )}
        <main className="flex-1">
          <div className="flex h-screen flex-col">
            <div className="border-b border-mist bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                {toolbar}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-fog">
              <div className="h-full px-6 py-6">{content}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
