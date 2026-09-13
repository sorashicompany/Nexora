#!/usr/bin/env node
/**
 * Stage the client-side TanStack Start SPA for Capacitor.
 * Capacitor needs a concrete dist/index.html; it cannot run the Nitro SSR server.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
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

// TanStack Start's SPA client hydrates the complete document. The generated
// _shell.html is therefore the correct Capacitor entry; a hand-written
// <div id="root"> shell is not compatible with hydrateRoot(document, ...).
if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
}

if (!existsSync(indexPath)) {
  fail("TanStack Start did not generate index.html or _shell.html. Refusing to ship a blank-screen APK.");
}

console.log(`[stage-capacitor] Client source: ${source}`);
console.log(`[stage-capacitor] Capacitor entry: ${indexPath}`);
