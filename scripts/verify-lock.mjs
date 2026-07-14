import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const root = lock.packages?.[""] ?? {};

const errors = [];
if (lock.name !== pkg.name) errors.push(`lock.name=${lock.name} != package.json name=${pkg.name}`);
if (root.name && root.name !== pkg.name) errors.push(`lock packages[''].name=${root.name}`);
if (!lock.packages?.["node_modules/next"]) errors.push("next missing from package-lock.json");
if (!lock.packages?.["node_modules/@tailwindcss/postcss"]) errors.push("@tailwindcss/postcss missing from package-lock.json");
if (lock.name === "react-vite-tailwind") errors.push("OLD VITE LOCKFILE still present — replace package-lock.json");

if (errors.length) {
  console.error("LOCKFILE INVALID:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log("package-lock.json is in sync with package.json (", pkg.name, ")");
