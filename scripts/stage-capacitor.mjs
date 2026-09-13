#!/usr/bin/env node
/**
 * Stage the static shell produced by TanStack Start SPA mode for Capacitor.
 * The previous implementation guessed a JS entry file, which could produce
 * a valid-looking HTML document with no mounted React application (black screen).
 */

import { cpSync, existsSync, mkdirSync, rmSync, renameSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const STATIC_SRC = join(ROOT, ".vercel", "output", "static");
const DIST = join(ROOT, "dist");
const SHELL = join(STATIC_SRC, "_shell.html");
const INDEX = join(STATIC_SRC, "index.html");

function fail(msg) {
  console.error(`[stage-capacitor] ${msg}`);
  process.exit(1);
}

if (!existsSync(STATIC_SRC)) {
  fail(`Static output not found at ${STATIC_SRC}.`);
}

if (!existsSync(SHELL) && !existsSync(INDEX)) {
  fail(
    `TanStack Start SPA shell was not generated. Expected ${SHELL} or ${INDEX}. ` +
      "Make sure NEXORA_CAPACITOR=1 is set for the build.",
  );
}

if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(STATIC_SRC, DIST, { recursive: true });

const stagedShell = join(DIST, "_shell.html");
const stagedIndex = join(DIST, "index.html");

// Capacitor loads webDir/index.html. TanStack Start SPA mode deliberately emits
// the shell as _shell.html, so use the exact generated shell rather than inventing
// a script tag and risking a blank WebView.
if (!existsSync(stagedIndex) && existsSync(stagedShell)) {
  cpSync(stagedShell, stagedIndex);
}

if (!existsSync(stagedIndex)) {
  fail("No index.html available after staging.");
}

console.log(`[stage-capacitor] Staged TanStack Start SPA shell → ${stagedIndex}`);
console.log("[stage-capacitor] Ready for Capacitor sync.");
