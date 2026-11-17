#!/usr/bin/env node
/**
 * Build the Genshin scene from `upstream/` into `public/genshin-bg/`.
 *
 *   npm run build:scene
 *
 * Steps:
 *   1. copy `upstream/` into `.build/scene/` (minus node_modules/dist)
 *   2. apply every `patches/*.patch` in filename order
 *   3. npm install, then `vite build --base=./`
 *   4. install the output into `public/genshin-bg/`, pruned to what the
 *      wallpaper needs: `Genshin/Login` (models + textures), the Draco decoder
 *      from `vendor/draco`, and the hashed `assets/`
 *
 * The relative base matters: the DSH host serves the scene under `/genshin-bg/`,
 * so absolute `/assets/...` URLs would 404.
 *
 * `tsc` is deliberately not run: the upstream snapshot's `src/core/components/
 * ShaderTest.ts` references a module that does not exist, so upstream's own
 * `npm run build` fails at the type-check step. Vite/esbuild still transpiles
 * and bundles fine.
 *
 * With `patches/0001-loop-only.patch` applied this reproduces the loop-only
 * backdrop this plugin ships: no menu, no preloader, no door, no bloom
 * transition, and no redirect away from the host app.
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
const dracoSrc = join(root, "vendor", "draco");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd, env) {
  console.log(`\n$ ${command} ${args.join(" ")}   (cwd: ${cwd})`);
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
}

if (!existsSync(upstream)) {
  console.error("upstream/ is missing — this repository vendors the scene source there.");
  process.exit(1);
}

console.log("1/5  copying upstream source");
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });
cpSync(upstream, buildDir, {
  recursive: true,
  filter: (src) => {
    const parts = src.split(sep);
    return !parts.includes("node_modules") && !parts.includes("dist") && !parts.includes(".git");
  },
});

console.log("2/5  applying patches");
const patches = existsSync(patchDir)
  ? readdirSync(patchDir).filter((name) => name.endsWith(".patch")).sort()
  : [];
if (patches.length === 0) {
  console.log("     no patches — building pristine upstream");
} else {
  for (const patch of patches) {
    console.log(`     ${patch}`);
    run("git", ["apply", "--verbose", `--directory=${join(".build", "scene")}`, join(patchDir, patch)], root);
  }
}

console.log("3/5  installing dependencies");
run(npm, ["install", "--no-audit", "--no-fund"], buildDir);

console.log("4/5  building the scene");
// esbuild deletes its own temp files; point TMP inside the build tree so a
// sandboxed or read-only %TEMP% cannot break the build on Windows.
const tmpDir = join(root, ".build", "tmp");
mkdirSync(tmpDir, { recursive: true });
run(npm, ["exec", "--", "vite", "build", "--base=./"], buildDir, { TMP: tmpDir, TEMP: tmpDir });

console.log("5/5  installing build output into public/genshin-bg");
const dist = join(buildDir, "dist");
if (!existsSync(dist)) {
  console.error("vite produced no dist/ — nothing to install");
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
cpSync(dist, outDir, { recursive: true });

// Prune: the wallpaper shows no UI and plays no audio, so keep only the login
// models/textures. Dropping the menu artwork and the ~4 MB of mp3 audio keeps
// the package small.
const genshinDir = join(outDir, "Genshin");
if (existsSync(genshinDir)) {
  for (const entry of readdirSync(genshinDir)) {
    if (entry !== "Login") rmSync(join(genshinDir, entry), { recursive: true, force: true });
  }
}

// The scene decodes Draco-compressed geometry, so the decoder must sit beside it.
if (existsSync(dracoSrc)) {
  cpSync(dracoSrc, join(outDir, "draco"), { recursive: true });
} else {
  console.warn("vendor/draco is missing — the scene will fail to decode its models");
}

console.log("\ndone: public/genshin-bg/ refreshed");
