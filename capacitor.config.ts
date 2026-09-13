import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for Nexora.
 *
 * Because the app is SSR (TanStack Start + Nitro), a pure offline static
 * shell has limited functionality. Two modes are supported:
 *
 * 1. Local assets (default) — uses the staged `dist/` folder.
 * 2. Live server — set CAPACITOR_SERVER_URL to load the deployed site
 *    inside the WebView (recommended for full features).
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.nexora.app',
  appName: 'Nexora',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
      }
    : undefined,
  android: {
    allowMixedContent: true,
  },
};

export default config;
