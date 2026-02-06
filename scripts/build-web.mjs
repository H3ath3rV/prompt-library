import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

execSync("next build", { stdio: "inherit" });

const outDir = path.resolve(process.cwd(), "out");
const distDir = path.resolve(process.cwd(), "dist");

if (fs.existsSync(outDir)) {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.renameSync(outDir, distDir);
}
