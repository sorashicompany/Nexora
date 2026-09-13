#!/usr/bin/env node
/**
 * Stage the client-side TanStack Start build for Capacitor.
 *
 * With NEXORA_CAPACITOR=1 the Vite build writes JS/CSS to dist/client/
 * and may not emit index.html. Capacitor requires dist/index.html.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const TEMP = join(ROOT, ".capacitor-web-stage");
const CANDIDATES = [
  join(ROOT, "dist", "client"),
  join(ROOT, ".vercel", "output", "static"),
];

function fail(msg) {
  console.error(`[stage-capacitor] ${msg}`);
  process.exit(1);
}

function listFiles(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...listFiles(full, rel));
    else out.push(rel);
  }
  return out;
}

const source = CANDIDATES.find((dir) => existsSync(dir));
if (!source) fail("No static client output found (looked for dist/client and .vercel/output/static).");

if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true });
mkdirSync(TEMP, { recursive: true });
cpSync(source, TEMP, { recursive: true });

// Rebuild dist/ from staged client assets only (drop server/ SSR output)
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(TEMP, DIST, { recursive: true });
rmSync(TEMP, { recursive: true, force: true });

const indexPath = join(DIST, "index.html");
const shellPath = join(DIST, "_shell.html");

if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
  console.log("[stage-capacitor] Using _shell.html as index.html");
}

if (!existsSync(indexPath)) {
  const files = listFiles(DIST);
  const jsFiles = files.filter((f) => f.endsWith(".js") && f.includes("assets/"));
  const cssFiles = files.filter((f) => f.endsWith(".css") && f.includes("assets/"));

  // Prefer the main client entry (index-*.js)
  let entry =
    jsFiles.find((f) => /assets\/index-[^/]+\.js$/.test(f)) ||
    jsFiles.find((f) => /assets\/main-[^/]+\.js$/.test(f));

  if (!entry && jsFiles.length) {
    entry = jsFiles
      .map((f) => ({ f, size: statSync(join(DIST, f)).size }))
      .sort((a, b) => b.size - a.size)[0].f;
  }

  if (!entry) {
    fail(
      `No client JS entry under dist/. Files present:\n${files.slice(0, 40).join("\n") || "(empty)"}`,
    );
  }

  const cssLinks = cssFiles
    .map((f) => `    <link rel="stylesheet" crossorigin href="/${f.replace(/^\//, "")}">`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#06081a" />
    <title>Nexora</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/${entry.replace(/^\//, "")}"></script>
  </body>
</html>
`;

  writeFileSync(indexPath, html, "utf8");
  console.log(`[stage-capacitor] Generated index.html → entry ${entry}`);
} else {
  // Ensure absolute asset paths work inside Capacitor WebView
  let html = readFileSync(indexPath, "utf8");
  if (!html.includes("viewport-fit=cover")) {
    html = html.replace(
      /<meta name="viewport"[^>]*>/,
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
    );
    writeFileSync(indexPath, html, "utf8");
  }
  console.log("[stage-capacitor] Using existing index.html");
}

if (!existsSync(indexPath)) fail("index.html still missing after staging");

console.log(`[stage-capacitor] Client source: ${source}`);
console.log(`[stage-capacitor] Capacitor entry: ${indexPath}`);
