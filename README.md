# Ledzora — Document Chase for Bookkeepers

**Stop chasing clients. Start closing books.**

Ledzora is a plain, rule-based tool (no AI anywhere in the product) that
ends the bookkeeper's worst job: chasing clients for documents at
month-end.

- A **checklist** per client, built from standard month-end items plus
  your own custom items.
- **One upload link per client** — the client opens it on their phone,
  taps Upload, takes a photo. No login, no app, no password.
- **Automatic reminders on a fixed rule** — Day 3 and Day 7 by default,
  editable in Settings. Same calm chase for every client, and it stops
  the moment a list is complete.
- **One status dashboard** — green means complete, amber means waiting,
  red means overdue. Readable in three seconds.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Landing page — the six-scene scrollytelling story from the Brand & UI Design Pack, pricing at **$29/month per firm** |
| `/signup`, `/login` | Firm account (demo auth — see MVP notes) |
| `/dashboard` | Stats (Complete / Waiting / Overdue), client list, add client + create checklist, reminder rule, sample data |
| `/dashboard/clients/[id]` | Checklist manager, share-link box, chase history, send-reminder |
| `/dashboard/settings` | Firm name, period label, reminder days (3 / 7), sign out |
| `/c/[token]` | The public client upload page — the heart of the product |

Design follows the **Ledzora Brand & UI Design Pack v1.1** exactly:
solid colours only (Ledger Navy `#0E2A47`, Tick Green `#1E9E6A`,
Paper `#F7F5F0`), Sora + Inter, glass in only three places (landing
nav, popups, pricing's middle card / trust strip), and a motion system
whose full-screen loader **is the logo animation** — the ledger "L"
draws, the green tick strikes.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

First sign-up seeds four sample clients (Bluebird Bakery, Northgate
Dental, Riverbend Cafe, Harbor Salon) so the dashboard is alive
immediately. Clear them from the dashboard or Settings when ready.

The app is also an installable **PWA** (manifest + offline shell,
"Add to Home Screen" on iOS/Android). For the native App Store path
see [IOS.md](IOS.md) — `capacitor.config.ts` is ready.

## What is MVP-local vs production-next

This build is the complete product experience running on
**browser-local storage**, so it can be tried end-to-end with zero
infrastructure. Honest limits:

| Area | MVP (this build) | Production next |
| --- | --- | --- |
| Data | `localStorage` on one device/browser | Postgres (e.g. Supabase/Neon) behind the same data shapes in `src/lib/store.ts` |
| Auth | Demo-grade: accounts stored locally | Real auth (email + password hashing / magic links), firm accounts with seats |
| Client links | Work on the device that created them | Work anywhere — links resolve against the server database |
| Reminders | Rule fires and is **recorded** in-app (automatic events appear in the chase history; a manual button sends instantly) | A server cron sends **real emails** on Day 3 / Day 7 — nothing is emailed by this MVP |
| Uploads | File name/size/type recorded; item marked received | Files stored in object storage (S3/R2), virus-scanned, listed in a documents vault |
| Payments | $29/month plan is presented as product copy | Stripe subscription billing |
| iOS/Android | Installable PWA | Capacitor wrap → App Store / Play Store (needs Apple Developer account) |

The data types in `src/lib/store.ts` mirror the production schema, so
moving to a real backend changes one file, not the pages.
