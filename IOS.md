# Ledzora on iOS — the two paths

Ledzora is a web app first. There are two ways it lives on an iPhone:

## Path 1 — PWA (live now, no accounts, no fees)

The deployed site is an installable Progressive Web App:

1. Open the Ledzora URL in Safari on the iPhone.
2. Tap **Share → Add to Home Screen**.
3. The Ledzora icon (Ledger Navy, white "L", green tick) appears on the
   home screen and opens full-screen, exactly like a native app.

This works today, for the bookkeeper and for clients, with no Apple
Developer account and no App Store review.

## Path 2 — Native App Store app via Capacitor (when revenue justifies it)

`capacitor.config.ts` in this repo is ready. The native app is a thin
Capacitor shell around the live web app:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init Ledzora com.ledzora.app --web-dir=out
npx cap add ios
npx cap sync
npx cap open ios
```

Requirements that only a human can supply:

- A **Mac with Xcode** (Capacitor iOS builds do not run on Linux/Windows).
- An **Apple Developer Program** membership ($99/year) for signing and
  App Store submission.
- App Store Connect listing assets (screenshots come from the PWA —
  the UI is identical).

No App Store submission has been attempted for the MVP, deliberately:
the PWA proves the product first, and the Capacitor wrap reuses 100%
of the same code when the time comes.
