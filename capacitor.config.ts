import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Nexora is SSR — APK loads the live site in WebView (full auth/DB/API).
 * Override with CAPACITOR_SERVER_URL / VITE_APP_URL if needed.
 */
const DEFAULT_LIVE_URL = 'https://nexora-sepia-alpha.vercel.app';

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.VITE_APP_URL?.trim() ||
  DEFAULT_LIVE_URL;

const config: CapacitorConfig = {
  appId: 'com.nexora.app',
  appName: 'Nexora',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: serverUrl.replace(/\/$/, ''),
    cleartext: serverUrl.startsWith('http://'),
    allowNavigation: [
      serverUrl.replace(/\/$/, ''),
      'https://*.vercel.app',
      'https://*.supabase.co',
      'https://*.workers.dev',
    ],
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#06081a',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#06081a',
      launchShowDuration: 0,
    },
  },
};

export default config;
