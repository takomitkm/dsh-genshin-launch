#!/usr/bin/env node
/**
 * Build the Genshin scene from `upstream/` into `public/genshin-bg/`.
 *
 *   npm run build:scene
 *
 * Steps:
 *   1. copy `upstream/` into `.build/scene/` (minus node_modules/dist)
 *   2. apply every `patches/*.patch` in filename order
 *   3. npm install, then tsc + vite build with a relative base
 *   4. replace `public/genshin-bg/` with the build output
 *
 * The relative base matters: the DSH host serves the scene under `/genshin-bg/`,
 * so absolute `/assets/...` URLs would 404.
 *
 * NOTE: with an empty `patches/` directory this reproduces upstream's own app
 * (menu, preloader, intro transitions) — not the stripped loop-only backdrop
 * this plugin ships. See ROADMAP.md.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const upstream = join(root, "upstream");
const buildDir = join(root, ".build", "scene");
const patchDir = join(root, "patches");
const outDir = join(root, "public", "genshin-bg");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
  console.log(`\n$ ${command} ${args.join(" ")}   (cwd: ${cwd})`);
  execFileSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

if (!existsSync(upstream)) {
  console.error("upstream/ is missing — this repository vendors the scene source there.");
  process.exit(1);
}

console.log("1/4  copying upstream source");
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });
cpSync(upstream, buildDir, {
  recursive: true,
  filter: (src) => {
    const parts = src.split(sep);
    return !parts.includes("node_modules") && !parts.includes("dist") && !parts.includes(".git");
  },
});

console.log("2/4  applying patches");
const patches = existsSync(patchDir)
  ? readdirSync(patchDir).filter((name) => name.endsWith(".patch")).sort()
  : [];
if (patches.length === 0) {
  console.log("     no patches — building pristine upstream");
} else {
  for (const patch of patches) {
    run("git", ["apply", "--verbose", `--directory=${join(".build", "scene")}`, join(patchDir, patch)], root);
  }
}

console.log("3/4  installing and building the scene");
run(npm, ["install", "--no-audit", "--no-fund"], buildDir);
run(npm, ["exec", "--", "tsc"], buildDir);
run(npm, ["exec", "--", "vite", "build", "--base=./"], buildDir);

console.log("4/4  installing build output into public/genshin-bg");
const dist = join(buildDir, "dist");
if (!existsSync(dist)) {
  console.error("vite produced no dist/ — nothing to install");
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
cpSync(dist, outDir, { recursive: true });
console.log("\ndone: public/genshin-bg/ refreshed");
