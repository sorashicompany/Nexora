#!/usr/bin/env node
/**
 * Stage the client-side TanStack Start SPA for Capacitor.
 * Capacitor needs a concrete dist/index.html; it cannot run the Nitro SSR server.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const TEMP = join(ROOT, ".capacitor-web-stage");
const CANDIDATES = [
  join(ROOT, ".vercel", "output", "static"),
  join(ROOT, "dist", "client"),
];

function fail(msg) {
  console.error(`[stage-capacitor] ${msg}`);
  process.exit(1);
}

const source = CANDIDATES.find((dir) => existsSync(dir));
if (!source) fail("No static client output found after the Capacitor build.");

if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true });
mkdirSync(TEMP, { recursive: true });
cpSync(source, TEMP, { recursive: true });

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(TEMP, DIST, { recursive: true });
rmSync(TEMP, { recursive: true, force: true });

const indexPath = join(DIST, "index.html");
const shellPath = join(DIST, "_shell.html");

if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
}

// With prerender disabled there is intentionally no _shell.html. In that case
// use the real generated client entry, never an arbitrary/largest JS file.
if (!existsSync(indexPath)) {
  const assetsDir = join(DIST, "assets");
  if (!existsSync(assetsDir)) fail("No assets directory found for the Capacitor SPA.");

  const files = readdirSync(assetsDir);
  const entry = files.find((name) => /^index-[^/]+\.js$/.test(name));
  if (!entry) fail("Could not find the generated TanStack client entry (assets/index-*.js).");

  const css = files
    .filter((name) => name.endsWith(".css"))
    .map((name) => `    <link rel="stylesheet" href="assets/${name}">`)
    .join("\n");

  writeFileSync(
    indexPath,
    `<!doctype html>\n<html lang="ru">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n  <meta name="theme-color" content="#06081a">\n  <title>Nexora</title>\n${css}\n</head>\n<body class="bg-bg font-sans text-fg">\n  <div id="root"></div>\n  <script type="module" src="assets/${entry}"></script>\n</body>\n</html>\n`,
    "utf8",
  );
}

if (!existsSync(indexPath)) fail("No index.html available after staging.");

console.log(`[stage-capacitor] Client source: ${source}`);
console.log(`[stage-capacitor] Capacitor entry: ${indexPath}`);
