#!/usr/bin/env node
/**
 * Stage the real TanStack Start SPA shell for Capacitor.
 *
 * Capacitor requires dist/index.html. We never synthesize a fake React root
 * here because the TanStack client entry hydrates the full document.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

const source = CANDIDATES.find((dir) => existsSync(dir));
if (!source) fail("No static client output found (looked for dist/client and .vercel/output/static).");

if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true });
mkdirSync(TEMP, { recursive: true });
cpSync(source, TEMP, { recursive: true });

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(TEMP, DIST, { recursive: true });
rmSync(TEMP, { recursive: true, force: true });

const indexPath = join(DIST, "index.html");
const shellPath = join(DIST, "_shell.html");

// TanStack Start SPA builds may expose the canonical shell as _shell.html.
if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
  console.log("[stage-capacitor] Using TanStack Start _shell.html as index.html");
}

if (!existsSync(indexPath)) {
  fail("No generated index.html or _shell.html found. Refusing to synthesize an incompatible HTML shell.");
}

const html = readFileSync(indexPath, "utf8");
if (!/^<!doctype html>/i.test(html.trim()) && !/^<!DOCTYPE html>/i.test(html.trim())) {
  fail("Generated index.html is not a valid HTML document.");
}
if (!html.includes("<script")) fail("Generated index.html contains no script tag.");

// Keep the mobile viewport safe-area setting without changing the generated shell.
if (!html.includes("viewport-fit=cover")) {
  const updated = html.replace(
    /<meta name=[\"']viewport[\"'][^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  );
  if (updated !== html) writeFileSync(indexPath, updated, "utf8");
}

console.log(`[stage-capacitor] Client source: ${source}`);
console.log(`[stage-capacitor] Capacitor entry: ${indexPath}`);
