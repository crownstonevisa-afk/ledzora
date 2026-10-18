/**
 * Ledzora — Capacitor configuration for the native iOS/Android wrap.
 *
 * The production Ledzora web app is deployed on Vercel. The native apps
 * are a thin Capacitor shell that loads the live web app, so every web
 * improvement reaches iOS/Android users with no resubmission for
 * content changes.
 *
 * Setup (one time, on a Mac):
 *   npm install @capacitor/core @capacitor/cli @capacitor/ios
 *   npx cap init Ledzora com.ledzora.app --web-dir=out
 *   npx cap add ios
 *   npx cap open ios   # then build/sign in Xcode with an Apple Developer account
 *
 * This file intentionally declares its own minimal type so the web
 * project builds without the Capacitor packages installed.
 */

interface CapacitorConfigShape {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    url?: string;
    cleartext?: boolean;
  };
}

const config: CapacitorConfigShape = {
  appId: "com.ledzora.app",
  appName: "Ledzora",
  webDir: "out",
  server: {
    // Point the shell at the live deployment so the native app is
    // always current. Replace with the production domain at launch.
    url: "https://ledzora.vercel.app",
    cleartext: false,
  },
};

export default config;
