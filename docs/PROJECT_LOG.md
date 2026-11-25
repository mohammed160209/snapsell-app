# SnapSell — Project log and handoff context

**Last updated: 25 Nov 2026 · Team 15 · MESA School BYOP hackathon · final deadline 30 Nov 2026**

> **For an AI agent or new teammate starting fresh:** read this file top to bottom first. Then read, in this order:
> `docs/IMPLEMENTATION_PLAN.md` (stack, schema, screens, phases) → `docs/DESIGN.md` (look and feel, tokens, libraries) → `docs/flows/README.md` (user-flow boards) → `src/ui.jsx` and `src/store.jsx` (the two files everything else depends on).
> Everything below is what was decided and built across the planning chat (20–25 Nov). Treat the "Decisions" section as settled unless the team says otherwise.

---

## 1. Snapshot — where things stand right now

| Item | Status |
|---|---|
| **Main app** | `snapsell-app` — React front-end, both platforms working end to end on **mock data** (no backend yet) |
| **Live link** | https://snapsell-local.icesaviour02.workers.dev/ (Cloudflare Workers static assets) |
| **Repo** | https://github.com/mohammed160209/snapsell-app (public, branch `main`) |
| **Collaborator** | GitHub `ar970` invited with **write** access (admin is impossible on a personal-account repo; needs a GitHub organisation) — check the invite was accepted |
| **Design** | Calm premium (Apple / Airbnb), mobile-first, Motion animations, Hugeicons — redesigned 24 Nov |
| **Flow boards** | 7 boards built from 52 real screenshots in `docs/flows/` |
| **PRD** | Written 20 Nov (Claude Docs: https://claude.ai/artifact/DLHX2wkX7JQijm2eAnXcwD; PDF export `../SnapSell_PRD.pdf`). **Out of date:** describes only the secondhand idea — see §8 |
| **Backend / payments / real AI** | Not started (Phase B in the plan) |

**Team:** Aechit, Reet, Mohammed (repo owner, GitHub `mohammed160209`). Mentor: Kiran (MESA). Roles in the PRD: product + AI · frontend · backend + payments + admin (assignment unconfirmed).

---

## 2. The product (what and why)

**Problem statement (Team 15):** *Multi-vendor e-commerce platform — independent sellers manage products, inventory, orders and fulfilment; customer storefronts, payment integration, commissions and a centralised admin dashboard.*

**What we're building:** **SnapSell Local**, a hyperlocal marketplace for Bengaluru neighbourhoods with **two platforms in one app**:

| | P1 · Local brands | P2 · Secondhand |
|---|---|---|
| Who sells | Early-stage local businesses (home bakers, candle makers, small studios) | Any user — every shopper can also sell |
| Who buys | Shoppers within 5 km | Any user |
| Core loop | Business lists products with stock → shopper orders and pays → business fulfils (delivery ₹30 within 5 km, or pickup) | Snap photos → AI writes the listing → buyer chats → deal by **meeting in person** (cash or in-app pay, 4-digit handover code) or **shipping** (pay online, held until "I received it") |
| Revenue | 8% commission on item subtotal | 5% fee on in-app payments only (cash deals free) |
| Maps to brief | Directly (vendors, inventory, orders, fulfilment, storefronts, payments, commission, admin) | The differentiator (from the original PRD idea) |

**Origin of the idea:** one of us is in a ~1,500-member WhatsApp group that gets 10–15 secondhand posts a day — posts get buried, listings are thin, paying strangers is risky. The first PRD was only P2 ("Snap-to-Sell"). The mentor said it drifted from the brief, so on 21 Nov we added P1 (local businesses) as the primary platform and kept P2 as the second.

**Roles in the app** (chosen at onboarding):
- **Shopper** — "Shop and sell": tabs *Local · Secondhand · Cart · Orders*; can also sell secondhand.
- **Business** — "I run a local business": creates a brand; tabs *Home · Orders · Products · Store*.
- **Admin** — seeded account only: tabs *Overview · Sellers · Orders · Listings*.

---

## 3. Decisions made (keep unless the team changes them)

1. **Two platforms, one app** (above). P1 first in navigation.
2. **Main layout is mobile-first web**, fully working on desktop. Phones get native-app patterns (see `IMPLEMENTATION_PLAN.md` §3.1 and `DESIGN.md`).
3. **Visual direction: calm premium (Apple / Airbnb)** — not playful/Duolingo. Chosen by Mohammed on 24 Nov.
4. **Icon library: Hugeicons** (free set) via `src/icons.jsx`. Chosen by Mohammed (the npm package called `use-icons` is an icon-font converter, not an icon set). Lucide was removed.
5. **Animation: Motion** (`motion/react`, formerly Framer Motion).
6. **Payments:** Razorpay (team already has an account). Proposed mechanism: **Razorpay Route** (split payment, transfer held until handover/receipt, commission retained). Exact flow **to be finalised** — the PRD only says "pay in app through Razorpay, ~5% commission, details later". Demo is simulated; no real money.
7. **Never say "escrow"** in UI or docs (legal weight in India). Use "SafePay", "payment held until handover", "payment held until you receive it".
8. **Secondhand trust model:** meet in person by default (check before paying, cash or app); shipped only with payment held until the buyer marks received; disputes go to admin. Expensive items default to meeting.
9. **Backend target: Supabase** (Postgres + Auth + Storage + Realtime). Phone OTP needs DLT registration in India → email magic-link fallback for the hackathon.
10. **AI listing target:** Claude Haiku 5.5 (`claude-haiku-5-5`) vision via a Supabase Edge Function, Sonnet 5.5 fallback; 10 s timeout → manual form. Currently simulated with per-category templates.
11. **Hosting: Cloudflare Workers** (`wrangler deploy --assets dist`). **Not GitHub Pages** — `mohammed160209.github.io` is Mohammed's portfolio, so any Pages project would sit under the portfolio URL (this happened once on 20 Nov and was unpublished).
12. **Product name:** "SnapSell" (working name); app shows "SnapSell Local".

---

## 4. Changelog (chronological)

### 20 Nov — Planning, PRD, mocks, prototype
- Read the mentor's brief (PRD structure §0–9 + low-fi mocks + backend setup). Problem statement found from the user (not in the connected Gmail).
- Brainstormed 5 directions; chose **Snap-to-Sell** (AI listing from a photo) for the secondhand WhatsApp problem.
- Wrote the **PRD** as a Claude Doc (sections 0–9, journey flowchart, 24-feature table, AI approach, demo script, risks, 11-screen mock list). Then: removed detailed payment mechanics per Mohammed, added team names and the 10–15 posts/day data point, exported `SnapSell_PRD.pdf`.
- Gave a Google Stitch prompt + DESIGN.md block for mocks; drafted the email to the mentor.
- Anti-Gravity (another AI tool) built an 11-screen clickable prototype in `../snapsell`. Claude reviewed it, replaced "escrow" wording, made paths relative, created repo **`mohammed160209/snapsell-prototype`**, deployed it to **https://snapsell-prototype.icesaviour02.workers.dev/** (first deployed to GitHub Pages under the portfolio domain by mistake → unpublished by deleting the `gh-pages` branch).
- Discussed payments: Razorpay Route flow, then the meet-vs-ship model and delivery verification (tracking number, "Received", auto-release, disputes, caps for new sellers).

### 21 Nov — Real app v1 (repo `snapsell-app`)
- `4b0a5bd` **P1 Local brands v1:** onboarding with role choice, shopper app (shop, brand store, product, multi-brand cart, delivery/pickup, simulated UPI/COD, order tracking, cancel), business app (dashboard, order pipeline, products CRUD + stock, store settings, payouts), admin (GMV, commission, approve/suspend, orders). Deployed to Cloudflare as `snapsell-local`.
- Invited `ar970` as collaborator (write).
- `0d8aac8` **`docs/IMPLEMENTATION_PLAN.md`** — handoff-grade plan: stack, Postgres schema + RLS, screens + acceptance criteria, mock-data contract, phases, testing checklist.
- `c605efa` **P2 Secondhand:** feed, listing detail, AI-simulated 4-step sell flow, meet/ship modes, deals (buying/selling, handover code, tracking, received/dispute), chat; admin secondhand tab; mock sellers auto-accept/ship (2.5 s) for solo demos.

### 24 Nov — Mobile-first redesign, then premium redesign
- `7657184` **Mobile app shell:** pushed screens with back bar and hidden tab bar, pinned bottom action bars, bottom sheets (demo accounts, cancel/decline/delete confirms, product ⋯ menu), 44 px targets, 16 px inputs, safe areas, grid overflow fix, admin orders as cards, mock chat replies.
- `8f4c802` **Premium redesign:** Apple-style neutrals, borderless cards, glass bars, 20 px gutters; Motion (screen transitions, sliding tab/segment indicators, spring sheets with drag-to-dismiss, staggered lists, OTP boxes, success screens, AI scanning step, animated trackers); Hugeicons everywhere + section icons; featured cards; secondhand back-stack fix. Added `scripts/capture-screens.mjs` (Playwright, 52 screens) and `scripts/build-flows.mjs` (7 flow boards as SVG), `docs/DESIGN.md`, `docs/flows/README.md`.

### 25 Nov — This log (`docs/PROJECT_LOG.md`) and `CLAUDE.md` context files.

---

## 5. Folder map (Mohammed's machine: `~/Documents/1-MESA/BYOP/Project/`)

| Path | What it is |
|---|---|
| `snapsell-app/` | **Main app (git, `main`)** — work here |
| `snapsell/` | Old Anti-Gravity prototype (repo `snapsell-prototype`). Has **uncommitted** edits that Wrangler added on its own (`package.json`, `vite.config.js`, lockfile, `wrangler.jsonc`) — revert or ignore; nothing depends on it |
| `skills/` | 20 local "master skills" (UI design, mobile, backend, databases, Cloudflare, etc.) used for guidance |
| `SnapSell_PRD.pdf` | PRD export from 20 Nov |
| `.claude/launch.json` | Dev-server config for Claude's browser preview (`snapsell-app` on port 5179) |

### Inside `snapsell-app/`

```
index.html            viewport-fit=cover, theme-color, Inter font
src/main.jsx          entry
src/App.jsx           StoreProvider + ChromeProvider + role router (Onboarding | Buyer | Seller | Admin)
src/data.js           ALL mock data, constants (COMMISSION_RATE 0.08, SH_COMMISSION_RATE 0.05, DELIVERY_FEE 30,
                      DEMO_HANDOVER_CODE '4827'), AI templates, money helpers (rupees, orderTotal, …)
src/store.jsx         React Context store persisted to localStorage key 'snapsell-local-v2'; every action lives here
src/ui.jsx            Design-system building blocks + motion presets (see below)
src/icons.jsx         Hugeicons mapped to short names (Store, Cart, Sparkles, …)
src/index.css         Tailwind 4 + tokens + component classes (.card .btn .btn-primary/.coral/.ghost/.soft/.danger
                      .input .pill .chip .icon-btn .glass .rail .eyebrow)
src/Onboarding.jsx    Welcome, demo sheet, phone → OTP (4 boxes) → profile / storefront
src/Buyer.jsx         Shopper app: Shop, BrandStore, ProductDetail, Cart (+Success), Orders (+cancel sheet); hosts Secondhand tab
src/Secondhand.jsx    Feed, ListingDetail, SellFlow (5 internal steps, 4 shown), MyListings, Deals/DealCard, Chat
src/Seller.jsx        Business app: Dashboard, SellerOrders, Products (+⋯ sheet, delete confirm), ProductForm, StoreSettings
src/Admin.jsx         Overview, Sellers, AllOrders (cards on phone, table on desktop), Listings
public/images/        10 compressed photos used by secondhand listings and the welcome collage
scripts/capture-screens.mjs   Playwright: drives the running app, saves 52 screenshots → docs/flows/screens/
scripts/build-flows.mjs       Builds 7 flow boards (SVG only, with embedded JPEG screens) → docs/flows/
docs/                 IMPLEMENTATION_PLAN.md · DESIGN.md · PROJECT_LOG.md · flows/
```

---

## 6. How the app works (architecture an agent must respect)

**State (`src/store.jsx`).** One Context store, persisted to `localStorage['snapsell-local-v2']`. Screens never mutate state directly — only through actions:
`loginAs, logout, resetDemo, signUp, addToCart, setCartQty, clearCart, placeOrders (one order per brand, stock decremented), advanceOrder (follows STATUS_FLOW), cancelOrder (stock returned), saveProduct, updateProduct, deleteProduct, updateBrand, createListing, updateListing, sendMessage (mock neighbours u-p* reply after 1.5 s), startDeal (mock sellers u-p* auto-accept meet deals / auto-ship ship deals after 2.5 s), setDeal (completed/received → listing sold; cancelled → listing active)`.
Changing data shape? Bump the storage key (`-v3`) so old browsers reload the seed.

**Order statuses:** delivery `placed → accepted → out_for_delivery → delivered`; pickup `placed → accepted → ready_for_pickup → delivered`; `placed → cancelled`.
**Deal statuses:** meet `requested → accepted → completed`; ship `paid → shipped → received | disputed`; `cancelled`.

**Navigation.** No router library. Each role component holds `tab` state and a **stack** of pushed screens (`Buyer` and `Secondhand` both keep a `stack`; `back()` pops). URLs don't change (deep links are a Phase B item with react-router).

**Chrome system (`src/ui.jsx`) — use these, don't hand-roll layout:**
- `Header` (glass brand bar), `BottomNav` (glass tab bar, sliding indicator via `layoutId`), `Page` (20 px gutters, bottom padding for tab bar).
- `TopBar` for pushed screens — it calls `usePushed()`, which **hides Header and BottomNav on phones** while mounted.
- `ActionBar` — primary actions pinned to the bottom on phones (`aboveTabs` when the tab bar is visible, e.g. Cart), inline on desktop.
- `Sheet` + `SheetRow` (spring bottom sheet, drag down to close; dialog on desktop), `Segmented` (iOS segmented control; needs a unique `id`), `ScreenTitle`, `SectionTitle` (icon tile + title + action), `Stepper`, `Success` (full-screen drawn check), `Enter` (screen transition; `push` slides from the right), `Stagger` + `Item` (list entrance), `CategoryIcon` (gradient tile per category), `StatusChip`, `Empty`.
- Motion presets: `spring`, `softSpring`, `ease`. Everything respects `prefers-reduced-motion`.

**Design rules (phones < 768 px are the main layout):** 20 px gutters; touch targets ≥ 44 px (main buttons 52–56 px); inputs 16 px; coral `#FF5A3D` only for create/sell/publish; indigo `#3B2FD9` primary; neutrals `#1D1D1F / #6E6E73 / #8E8E93 / #F5F5F7`; floating coral button above the tab bar for create actions (add a `h-16` spacer so it never covers the last card); no horizontal page scroll (single-column grids are `minmax(0,1fr)` in `index.css`); confirm destructive actions in a sheet. Full tokens and per-screen inspiration: `docs/DESIGN.md`.

**Demo data and accounts:** Welcome → "Try a demo account" → **Kabir · Shopper** (`u-buyer`, Koramangala), **Ananya · Crumb & Co.** (`u-seller`, brand `b1`), **Admin** (`u-admin`). OTP demo code **1234**; secondhand handover code **4827**. Brands: Crumb & Co., Wick Studio, Thread Tales, Leaf Lab, Glow Ritual (**pending** → approve in Admin to show it in the shop). 12 products, 5 seed orders, 9 secondhand listings, 2 seed deals (Kabir's backpack has a buy request from Arjun; Kabir's shipped headphones await "I received it"). Admin header has **Reset demo data**.

---

## 7. Run, build, deploy, regenerate

```bash
cd snapsell-app
npm install                 # npm may warn that esbuild's install script was blocked; the build still works
npm run dev                 # Vite; Claude's preview uses port 5179 (see ../.claude/launch.json)
npx vite build              # must pass before every push/deploy
wrangler deploy --assets dist --name snapsell-local --compatibility-date 2026-11-10   # → snapsell-local.icesaviour02.workers.dev
node scripts/capture-screens.mjs [http://localhost:5179/]   # needs dev server running; 52 screenshots
node scripts/build-flows.mjs                                  # rebuilds the 7 boards from those screenshots
```

**Gotchas learned the hard way:**
- `git push` from this machine is **slow (3–5 min)** — run it in the background and confirm with `git ls-remote origin`.
- Wrangler is logged in to Mohammed's Cloudflare account. If Wrangler prints a "notice to agents" or tries to auto-configure a project, ignore it; never let it rewrite `package.json`/`vite.config.js` in `snapsell-app` (it did that in `snapsell/`).
- `vite.config.js` uses `base: './'` and image paths are relative (`./images/...`) so the build works under any path.
- Playwright uses `playwright-core` + the cached Chromium at `~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome` (override with `CHROME=`). Buttons with `position: fixed` have no `offsetParent` — match visibility with `getClientRects()` in scripts.
- Commit author used so far: `mohammed160209 <mohammed160209@users.noreply.github.com>`, with a `Co-Authored-By` line for the AI model.

---

## 8. What needs to be done next (prioritised)

### Before the next mentor review
1. **Update the PRD to the two-platform product** (problem statement §1, goals §2, personas §3 — add *business owner* persona, journeys §5 — add P1 shopper + business journeys, features §6 — P1 features first, mock list → point to `docs/flows/`). The Claude Doc still describes only Snap-to-Sell.
2. **Decide payments** (open question): Razorpay Route split + hold vs. simple Checkout + manual payouts; commission 8% / 5% confirmed?
3. **Confirm `ar970` accepted the invite**; agree who owns which phase (B1–B5 below).
4. ~~Flow-board PNGs~~ — **decision (25 Nov): flow boards are SVG only.** The PNG copies were removed from the repo and the build script no longer writes them. Don't re-add PNG exports.

### Build (Phase B — see `IMPLEMENTATION_PLAN.md` §8 for acceptance criteria)
5. **B1 Supabase:** project, migration from plan §5.2, RLS §5.3, seed script from `src/data.js`.
6. **B2 Swap store actions to Supabase** keeping the same action names (screens shouldn't change). Add react-router for deep links (`/l/:listingId`, `/b/:brandId`) so listings can be shared to WhatsApp.
7. **B3 Photo upload** (Supabase Storage) for products and secondhand listings; replace category icon tiles with real product photos.
8. **B4 AI listing Edge Function** (Claude Haiku 5.5 vision → JSON draft; 10 s fallback to manual form).
9. **B5 Razorpay test mode** for P1 checkout and P2 in-app/ship payments; webhook flips status.
10. **Auth:** Supabase phone OTP or email magic link; replace demo login (keep demo accounts for judges).

### Polish and quality
11. Code-split the bundle (Vite warns: one JS chunk ~550 kB) — lazy-load `Admin`, `Seller`, `Secondhand`.
12. Desktop pass (the design is tuned for phones first): wider grids, hover states, side-by-side cart.
13. Accessibility pass (screen-reader labels on all icon buttons, focus order in sheets, colour contrast on muted text).
14. Share-to-WhatsApp card for listings and brand stores; notifications (email) for new orders and deal updates.
15. Seller ratings after a completed deal/order; "Report listing" flow wired to Admin.
16. Tests: Playwright smoke test from `capture-screens.mjs` (it already walks every flow) in CI.
17. Clean up `../snapsell` (revert Wrangler's edits or archive the prototype repo).

---

## 9. Open questions

- Payment split/hold mechanics and who registers the business for live Razorpay KYC.
- P2 commission: 5% on in-app only, or a flat fee under ₹500?
- Phone OTP (needs DLT registration) vs. email login for the demo.
- Should business accounts also see the Secondhand tab?
- Launch area: start with Koramangala (the WhatsApp group's area)?

---

## 10. Links

| What | Where |
|---|---|
| Live app | https://snapsell-local.icesaviour02.workers.dev/ |
| Repo | https://github.com/mohammed160209/snapsell-app |
| Old prototype (Anti-Gravity) | https://snapsell-prototype.icesaviour02.workers.dev/ · https://github.com/mohammed160209/snapsell-prototype |
| PRD (Claude Doc) | https://claude.ai/artifact/DLHX2wkX7JQijm2eAnXcwD |
| Plan / design / flows | `docs/IMPLEMENTATION_PLAN.md` · `docs/DESIGN.md` · `docs/flows/README.md` |

*When you finish a piece of work, add a dated entry to §4, update §1 and §8, and commit this file with the change.*
