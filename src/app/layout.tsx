import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Prompt Library",
  description: "Offline prompt organizer"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
