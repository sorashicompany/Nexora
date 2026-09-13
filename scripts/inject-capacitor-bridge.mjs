#!/usr/bin/env node
/**
 * Ensures dist/index.html never shows a pure black screen.
 * - If CAPACITOR_SERVER_URL is set, Capacitor config already points WebView there.
 * - Local shell gets a branded splash so offline/misconfig is visible, not black.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const indexPath = join(ROOT, 'dist', 'index.html');
const serverUrl = (process.env.CAPACITOR_SERVER_URL || process.env.VITE_APP_URL || '').trim().replace(/\/$/, '');

if (!existsSync(indexPath)) {
  console.error('[inject-capacitor-bridge] dist/index.html missing — run stage-capacitor first');
  process.exit(1);
}

const splash = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#06081a" />
  <title>Nexora</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      min-height: 100%;
      background: #06081a;
      color: #f0f1f8;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      display: grid;
      place-items: center;
    }
    .wrap { text-align: center; padding: 2rem; max-width: 22rem; }
    .mark {
      width: 72px; height: 72px; margin: 0 auto 1.25rem;
      background: linear-gradient(135deg, #4a6cf7, #6b5cf5 50%, #9a5cff);
      border-radius: 18px;
      box-shadow: 0 0 40px -8px rgba(107, 92, 245, 0.5);
    }
    h1 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }
    p { margin-top: 0.75rem; color: #9aa0bf; font-size: 0.9rem; line-height: 1.45; }
    .spin {
      margin: 1.5rem auto 0;
      width: 28px; height: 28px;
      border: 2px solid #1e2444;
      border-top-color: #6b5cf5;
      border-radius: 50%;
      animation: r 0.8s linear infinite;
    }
    @keyframes r { to { transform: rotate(360deg); } }
    a { color: #9a5cff; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="mark" aria-hidden="true"></div>
    <h1>Nexora</h1>
    <p id="msg">Загрузка студии…</p>
    <div class="spin" id="spin"></div>
  </div>
  <script>
    (function () {
      var live = ${JSON.stringify(serverUrl)};
      var msg = document.getElementById('msg');
      var spin = document.getElementById('spin');
      if (live) {
        msg.textContent = 'Подключаемся к серверу…';
        // Capacitor server.url usually navigates for us; this helps when assets are opened alone.
        setTimeout(function () {
          try { window.location.replace(live + window.location.hash); } catch (e) {}
        }, 400);
        return;
      }
      spin.style.display = 'none';
      msg.innerHTML = 'Нужен адрес сайта приложения.<br/>Задайте <code>CAPACITOR_SERVER_URL</code> (Vercel) и пересоберите APK.';
    })();
  </script>
</body>
</html>
`;

// When we have a live URL, Capacitor loads it via config — still keep a safe shell in assets.
// When we don't, replace index with the branded message page (never pure black).
if (!serverUrl) {
  writeFileSync(indexPath, splash, 'utf8');
  console.log('[inject-capacitor-bridge] Wrote branded offline shell (no CAPACITOR_SERVER_URL)');
} else {
  // Prepend a tiny note in existing shell is optional; leave generated SPA shell.
  // Write a companion file for debugging.
  writeFileSync(join(ROOT, 'dist', 'capacitor-target.json'), JSON.stringify({ serverUrl }, null, 2));
  console.log('[inject-capacitor-bridge] Live target:', serverUrl);
}
