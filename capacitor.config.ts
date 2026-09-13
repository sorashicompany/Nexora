import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Nexora is an SSR app (TanStack Start). A pure offline WebView cannot run
 * server functions / auth / DB — that is the root cause of the black screen.
 *
 * Production APK MUST load the deployed site via CAPACITOR_SERVER_URL
 * (e.g. https://your-app.vercel.app). Local `webDir` is only a fallback shell.
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.VITE_APP_URL?.trim() ||
  '';

const config: CapacitorConfig = {
  appId: 'com.nexora.app',
  appName: 'Nexora',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: serverUrl
    ? {
        url: serverUrl.replace(/\/$/, ''),
        cleartext: serverUrl.startsWith('http://'),
        allowNavigation: [
          serverUrl.replace(/\/$/, ''),
          'https://*.vercel.app',
          'https://*.supabase.co',
          'https://*.workers.dev',
        ],
      }
    : undefined,
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
