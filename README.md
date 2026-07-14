# Business OS — Owner Control Center

A premium, dark-themed business management app: unified billing with built-in
GST (CGST/SGST auto-split), multi-product carts, live stock, analytics with
staff/customer/stock drill-down, an Owner Panel with ambience media, and
Supabase-ready persistence.

Everything works out of the box on **local storage** — no setup required to
try it. Connect Supabase later (steps below) for multi-device sync.

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## 2. Build for production

```bash
npm run build
npm run preview   # optional local check of the production build
```

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **New Project → Import** that repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist` (already set in `vite.config.js`).
4. Deploy. That's it — no environment variables are required unless you connect Supabase or the AI Insights feature (see below).

## 4. Connect Supabase (optional, for multi-device sync)

The app runs fully without this — skip it if you just want single-browser use.

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run everything in `supabase/schema.sql` — this creates all tables (staff, stock, billings, purchases, expenses, drawings, suppliers, settings) with the exact same shape the app already uses locally.
3. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. `src/lib/supabaseClient.js` already exports a ready `supabase` client and an `isSupabaseConfigured` flag — Settings will show "Supabase connected" once these are filled in. Swapping the `usePersistentState` calls in `src/App.jsx` for Supabase reads/writes is the only change needed to go fully live — the data shape already matches.
5. On Vercel, add the same two variables under **Project Settings → Environment Variables**, then redeploy.

## 5. AI Insights (optional)

The "Generate AI Summary" button in AI Insights calls `/api/ai-insight`, a
serverless function already included (`api/ai-insight.js`) that keeps your
Anthropic API key on the server, never in the browser.

To enable it: add `ANTHROPIC_API_KEY` under Vercel → Project Settings →
Environment Variables, then redeploy. If you skip this, the button shows a
friendly message and the rest of the app is unaffected — the instant
rule-based flags above it always work with zero setup.

---

## What's inside

| Area | What it does |
|---|---|
| **Billing** | One unified screen: add multiple products (any name/size/qty/unit — all free-typed, not locked dropdowns) to a single bill, GST/CGST/SGST built in (type GST % once, CGST + SGST auto-split in half; each still independently editable), live full calculation panel, and a click-to-expand full breakdown on every saved bill. |
| **Purchase** | Record stock coming in from suppliers, with its own GST % for input-credit tracking. Stock quantity updates automatically. |
| **Stock** | Every product's name, size, unit (kg/feet/pcs/ton/etc, freely typed), rate, GST %, and category — add/remove/edit anytime. |
| **GST Report** | Fully automatic — pulled straight from Billing and Purchase, no separate manual GST entry to keep in sync. |
| **Expenses / Owner & Partner** | Track cash out and capital movements, with an automatic profit-split calculation between Owner and Partner. |
| **Customers / Suppliers / Staff** | All built from real names typed into Billing/Purchase/Staff — nothing pre-fixed. |
| **Analytics** | Day / Week / Month / 6-Month / Year toggle, click any bar for a full drill-down: staff-wise billing, customers served, stock moved, GST, profit. |
| **Owner Panel** | A private, premium screen with a background photo, video, or song (via URL or upload) for ambience, plus a live snapshot of revenue, profit, capital, and stock value. |
| **Settings** | Business name, owner name, GSTIN, invoice prefix, default GST %, and the Owner/Partner profit split — all editable, all reflected instantly across the app. |

## Theme

Pure black background with white text throughout, tuned for high contrast and
readability, with a warm ember accent used sparingly for emphasis (KPIs, the
active nav item, primary buttons).

## Project structure

```
business-os/
├─ api/ai-insight.js        Vercel serverless function (optional AI summary)
├─ src/
│  ├─ App.jsx               Root: all app state + routing between views
│  ├─ components/           Nav + reusable UI primitives (Card, Btn, Field…)
│  ├─ views/                One file per screen (Billing, Stock, Analytics…)
│  ├─ data/seed.js          45 days of realistic demo data (safe to delete)
│  ├─ utils/                Formatting, constants, the local-storage hook
│  └─ lib/supabaseClient.js Supabase client (inactive until you add keys)
└─ supabase/schema.sql      Full table definitions matching the app's data shape
```
