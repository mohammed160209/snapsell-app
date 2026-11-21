# SnapSell — Implementation Plan

**Team 15 · Hackathon build · last updated 21 Nov 2026 · deadline 30 Nov 2026**

This file is written so any engineer or coding agent can pick up the work without reading the chat history. Read sections 1–4 before writing code. Sections 6–8 are the build tasks, each with acceptance criteria.

---

## 1. What we are building

SnapSell is a **hyperlocal marketplace** for Bengaluru neighbourhoods. One app, two platforms:

| Platform | Name in app | Who sells | Who buys | Core loop |
|---|---|---|---|---|
| **P1** | **Local brands** | Early-stage local businesses (home bakers, candle makers, small studios) | Shoppers in the same area | Business lists products with stock → shopper orders and pays → business fulfils (delivery within 5 km or pickup) → platform keeps 8% commission |
| **P2** | **Secondhand** | Any user (every user can buy **and** sell) | Any user | User snaps item → AI writes listing → buyer contacts seller → deal by meeting in person (cash or in-app pay) or shipped (paid online, held until received) |

The original hackathon brief is *"Multi-vendor e-commerce platform: independent sellers manage products, inventory, orders and fulfilment; customer storefronts, payment integration, commissions and a centralized admin dashboard."* P1 maps to that brief directly. P2 is our differentiator from the PRD (SnapSell PRD, section 5–7) and solves the WhatsApp-group secondhand problem one of us sees first-hand (≈1,500-member group, 10–15 posts/day).

### Roles

| Role | How they get it | Sees |
|---|---|---|
| `shopper` | Onboarding → "I want to shop" | P1 buyer app **and** P2 secondhand (buy + sell) |
| `business` | Onboarding → "I run a local business" (creates a `brand`) | P1 business dashboard. Can switch to shopper view to shop |
| `admin` | Seeded account only | Admin console across both platforms |

Routing after login is decided by the role saved at onboarding (`App.jsx → Router`).

---

## 2. Current status (what already exists)

Repo: `https://github.com/mohammed160209/snapsell-app` · Live: `https://snapsell-local.icesaviour02.workers.dev/`

**Phase A — done (v1, 21 Nov):** front-end only, mock data in `localStorage`.

- Onboarding: role choice, phone + OTP (demo code `1234`), profile; business also sets up storefront. Demo accounts on welcome screen.
- P1 buyer: search, category filter, brand storefronts, product detail, multi-brand cart, delivery/pickup, simulated UPI or pay-on-delivery, order tracking, cancel.
- P1 business: dashboard KPIs, order pipeline (accept → out for delivery / ready for pickup → completed, decline), products CRUD + stock +/- + hide, storefront settings, payouts after commission.
- Admin: GMV, commission, sales by seller, approve/suspend sellers, all orders table, reset demo data.

**Phase A2 — done (21 Nov):** P2 Secondhand inside the same app (section 6.2): feed, listing detail, AI-simulated sell flow, meet/ship selling modes, deals (buying/selling with handover code and shipping tracking), chat, admin secondhand tab. Mock sellers auto-accept/ship after 2.5 s so the flow can be demoed solo.

**Not started:** real backend (Supabase), real payments (Razorpay), real AI (Claude), photo upload, notifications.

---

## 3. Tech stack

| Layer | Now (Phase A) | Target (Phase B+) | Why |
|---|---|---|---|
| UI framework | React 19 + Vite 6 | same | Already built, fast dev |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + small utility classes in `src/index.css` (`.card .btn .input .chip`) | same | Consistent design system, no extra deps |
| Icons | `lucide-react` | same | Already used everywhere |
| State | React Context + `useState`, persisted to `localStorage` key `snapsell-local-v1` (`src/store.jsx`) | TanStack Query over Supabase client; keep Context only for session + cart | Mock now, server data later |
| Routing | Role-based switch + tab state (no URL routes) | `react-router` 7 with routes per screen | Deep links for shared listings |
| Database | Mock arrays in `src/data.js` | **Supabase Postgres** | Free tier, auth + storage + realtime in one account |
| Auth | Fake OTP (`1234`) | Supabase Auth: phone OTP; **fallback email magic link** (Indian SMS needs DLT registration) | |
| File storage | Category icons as images | Supabase Storage bucket `listing-photos` (public read, owner write) | |
| Realtime chat | Local array | Supabase Realtime on `messages` | |
| Payments | Simulated (1.4 s spinner) | Razorpay Checkout (test mode) + webhook in Supabase Edge Function. Split/hold flow decided after mentor review (PRD: Razorpay Route) | Team already has a Razorpay account |
| AI listing | Simulated draft from category templates | Supabase Edge Function → Claude Haiku 5.5 (`claude-haiku-5-5`) vision, JSON output; Sonnet 5.5 fallback | PRD section 7 |
| Hosting | Cloudflare Workers static assets (`wrangler deploy --assets dist --name snapsell-local`) | same, plus Supabase for API | Already working |

Brand tokens (keep consistent): indigo `#3B2FD9` (primary, trust, buy), coral `#FF5A3D` (sell / publish only), green `#157F3E` on `#E7F7EE` (verified, condition, completed), ink `#111322`, secondary `#4E5369`, muted `#7C8199`, line `#E8EAF2`, canvas `#F7F7FA`. Font Inter. Cards radius 16 px, buttons 12 px. Mobile-first; bottom nav on phones, pill nav on desktop (`md:` breakpoint).

---

## 4. Repository layout

```
snapsell-app/
  docs/IMPLEMENTATION_PLAN.md   ← this file
  index.html
  src/
    main.jsx            entry
    App.jsx             StoreProvider + role router
    index.css           Tailwind import + .card .btn .input .chip
    data.js             ALL mock data + constants + money helpers (single source of truth)
    store.jsx           Context store: state, persistence, every action
    ui.jsx              shared components: Logo, Header, BottomNav, Page, Empty, CategoryIcon, StatusChip, timeAgo
    Onboarding.jsx      welcome, role choice, phone/OTP/profile
    Buyer.jsx           P1 shopper app (Shop, BrandStore, ProductDetail, Cart, Orders)
    Seller.jsx          P1 business app (Dashboard, SellerOrders, Products, ProductForm, StoreSettings)
    Secondhand.jsx      P2 (Feed, ListingDetail, SellFlow, MyListings, Deals, Chat)
    Admin.jsx           admin console
```

Rules: mock data only in `data.js`; state changes only through actions in `store.jsx`; screens never mutate state directly. Money is stored as **integer rupees** in mock data and **integer paise** in the database.

---

## 5. Data model

### 5.1 Entities (mock shape = DB shape, camelCase in JS, snake_case in SQL)

| Entity | Key fields |
|---|---|
| `users` | id, name, phone, area, role (`shopper`/`business`/`admin`; mock uses `buyer`/`seller`), brandId? |
| `brands` (P1) | id, ownerId, name, category, area, tagline, rating, delivery (bool), pickup (bool), status (`pending`/`active`/`suspended`), since |
| `products` (P1) | id, brandId, name, price, stock, unit, category, desc, active |
| `orders` (P1) | id, buyerId, brandId, items[] {productId, name, price, qty}, fulfilment (`delivery`/`pickup`), address, payment (`upi`/`cod`), status, createdAt |
| `listings` (P2) | id, sellerId, title, category, condition (`like_new`/`good`/`fair`/`for_parts`), price, priceHint {low, high}, desc, facts[], mode (`meet`/`ship`), area, status (`active`/`reserved`/`sold`/`hidden`), aiWritten (bool), createdAt |
| `deals` (P2) | id, listingId, buyerId, sellerId, mode, payment (`cash`/`app`), status, handoverCode, tracking {courier, number}?, createdAt |
| `messages` (P2) | id, listingId, fromId, toId, text, createdAt |

Order status flow — delivery: `placed → accepted → out_for_delivery → delivered`; pickup: `placed → accepted → ready_for_pickup → delivered`; any `placed` order can become `cancelled` (stock returned).

Deal status flow — meet: `requested → accepted → completed` (cash or app pay confirmed at handover with 4-digit code); ship: `paid → shipped → received` (auto-release 3 days after delivered if buyer silent; disputes → admin). Either side can cancel before `accepted`/`shipped`.

Commission: `COMMISSION_RATE = 0.08` on P1 item subtotal (not delivery fee). P2: 5% only when paid in app; cash deals are free. Delivery fee ₹30 per brand order.

### 5.2 Postgres schema (Phase B — run as a Supabase migration)

```sql
create type user_role as enum ('shopper','business','admin');
create type brand_status as enum ('pending','active','suspended');
create type order_status as enum ('placed','accepted','out_for_delivery','ready_for_pickup','delivered','cancelled');
create type item_condition as enum ('like_new','good','fair','for_parts');
create type listing_status as enum ('active','reserved','sold','hidden');
create type deal_status as enum ('requested','accepted','paid','shipped','completed','received','cancelled','disputed');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  area text not null,
  role user_role not null default 'shopper',
  created_at timestamptz not null default now()
);

create table brands (
  id bigint generated always as identity primary key,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text not null,
  area text not null,
  tagline text,
  delivery boolean not null default true,
  pickup boolean not null default true,
  status brand_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index brands_owner_id_idx on brands(owner_id);

create table products (
  id bigint generated always as identity primary key,
  brand_id bigint not null references brands(id) on delete cascade,
  name text not null,
  description text,
  price_paise integer not null check (price_paise > 0),
  stock integer not null default 0 check (stock >= 0),
  unit text,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_brand_id_idx on products(brand_id);
create index products_active_category_idx on products(category) where active;

create table orders (
  id bigint generated always as identity primary key,
  buyer_id uuid not null references profiles(id),
  brand_id bigint not null references brands(id),
  fulfilment text not null check (fulfilment in ('delivery','pickup')),
  address text,
  payment text not null check (payment in ('upi','cod')),
  status order_status not null default 'placed',
  subtotal_paise integer not null,
  delivery_fee_paise integer not null default 0,
  commission_paise integer not null,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);
create index orders_buyer_id_idx on orders(buyer_id);
create index orders_brand_id_status_idx on orders(brand_id, status);

create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint not null references products(id),
  name text not null,
  price_paise integer not null,
  qty integer not null check (qty > 0)
);
create index order_items_order_id_idx on order_items(order_id);

create table listings (
  id bigint generated always as identity primary key,
  seller_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  condition item_condition not null,
  price_paise integer not null check (price_paise > 0),
  facts jsonb not null default '[]',
  mode text not null check (mode in ('meet','ship')),
  area text not null,
  status listing_status not null default 'active',
  ai_written boolean not null default false,
  created_at timestamptz not null default now()
);
create index listings_seller_id_idx on listings(seller_id);
create index listings_feed_idx on listings(area, created_at desc) where status = 'active';

create table listing_photos (
  id bigint generated always as identity primary key,
  listing_id bigint not null references listings(id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0
);
create index listing_photos_listing_id_idx on listing_photos(listing_id);

create table deals (
  id bigint generated always as identity primary key,
  listing_id bigint not null references listings(id),
  buyer_id uuid not null references profiles(id),
  seller_id uuid not null references profiles(id),
  mode text not null check (mode in ('meet','ship')),
  payment text not null check (payment in ('cash','app')),
  status deal_status not null,
  handover_code char(4),
  courier text,
  tracking_number text,
  created_at timestamptz not null default now()
);
create index deals_buyer_id_idx on deals(buyer_id);
create index deals_seller_id_idx on deals(seller_id);
create index deals_listing_id_idx on deals(listing_id);

create table messages (
  id bigint generated always as identity primary key,
  listing_id bigint not null references listings(id) on delete cascade,
  from_id uuid not null references profiles(id),
  to_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_thread_idx on messages(listing_id, created_at);
create index messages_to_id_idx on messages(to_id);
```

### 5.3 Row-level security (enable on every table)

Use `(select auth.uid())` (not bare `auth.uid()`) so the value is evaluated once per query.

- `profiles`: anyone authenticated can read name/area; a user updates only their own row.
- `brands`: public read where `status = 'active'`; owner reads/updates own; insert with `owner_id = (select auth.uid())`.
- `products`: public read where `active` and brand active; brand owner full write (`brand_id in (select id from brands where owner_id = (select auth.uid()))`).
- `orders` / `order_items`: buyer reads own; brand owner reads and updates status for their brand; insert only through the `place_order` RPC (security definer) which checks stock, decrements it atomically and computes commission.
- `listings`: public read where `status in ('active','reserved')`; seller full write on own.
- `deals`: buyer or seller of the deal can read; status changes through RPCs (`accept_deal`, `confirm_handover(code)`, `mark_shipped`, `mark_received`) that validate the actor and the transition.
- `messages`: readable by `from_id` or `to_id`; insert with `from_id = (select auth.uid())`.
- Admin: a `is_admin()` security-definer function checks `profiles.role = 'admin'`; admin policies use it.

---

## 6. Screens, flows and acceptance criteria

### 6.0 Onboarding (done)
Welcome → choose **I want to shop** / **I run a local business** → phone (10 digits) → OTP (`1234` in demo) → name + area (+ business name, category, tagline). Demo buttons: Buyer · Kabir, Business · Crumb & Co., Admin.
- AC: invalid phone and wrong OTP show inline errors; finishing creates the user (and brand for business) and lands on the right interface.

### 6.1 P1 Local brands (done)
Shopper: Shop (search, categories, brand rail, product grid, sold-out and "only N left" states) → Product detail (qty, add to cart) → Cart (one order per brand, delivery/pickup, pickup disabled if any brand lacks it, UPI or COD, totals) → Orders (progress tracker, cancel while `placed`).
Business: Home (sales, earnings after 8%, open orders, low stock) → Orders (filter Open/Completed/Cancelled, next-step button, decline) → Products (add/edit form with validation, stock +/-, hide, delete) → Store (name, tagline, delivery/pickup toggles, payout summary).
- AC (end-to-end, verified 21 Nov): shopper orders from 2 brands → 2 orders appear → business sees its order with earnings and commission → accept moves status → shopper tracker updates → admin GMV/commission include it → stock decremented; cancel returns stock.

### 6.2 P2 Secondhand (build now — Phase A2)
Visible to shoppers as a second top-level tab **Secondhand** (bottom nav: Shop · Secondhand · Cart · Orders).

1. **Feed** — search, category chips, listing cards (photo tile, price, title, condition chip, area, "AI-written" badge, mode chip *Meet* / *Ships*). Big coral **Sell an item** button.
2. **Listing detail** — price, condition, description, "Confirmed by seller" facts, seller card (name, area, completed deals), selling mode explanation; buttons **Message seller** and **Request to buy** (meet) or **Buy & pay** (ship). Own listings show **Edit / Mark sold** instead.
3. **Sell flow (AI simulated)** — step 1 pick category + add photos (placeholder tiles) → step 2 "Reading your photos…" (1.2 s) then 3 tap-to-answer questions (age, defects, what's included) → step 3 AI draft (title, description, facts, condition, price hint range from category template) all editable → step 4 **How do you want to sell?** *Meet in person* (cash or in-app pay at handover) or *Ship it* (buyer pays online, you ship within 48 h) → Publish. Payout preview: cash = full price; in-app = price − 5%.
4. **Deals** — tabs Buying / Selling.
   - Meet: buyer requests → seller **Accept** → both see 4-digit handover code on buyer side; seller enters code → **completed**, listing → sold.
   - Ship: buyer pays (simulated) → seller enters courier + tracking → **shipped** → buyer **Mark received** → **received**, listing → sold.
5. **Chat** — per listing thread between buyer and seller, quick replies, phone numbers never shown.
- AC: a new listing appears at the top of the feed for other users; requesting/paying creates a deal visible to both sides; completing a deal marks the listing sold and removes it from the feed; admin overview shows secondhand listings and deals.

### 6.3 Admin (done for P1; extend for P2)
Overview tiles (GMV, commission, orders, sellers/shoppers) + secondhand tiles (active listings, deals, in-app volume). Sellers (approve/suspend). Orders table. Add **Listings** tab with hide action.

---

## 7. Mock data contract (keep consistent across every screen)

All in `src/data.js`. Do not invent names elsewhere.

- City: Bengaluru. Areas: Koramangala, Indiranagar, HSR Layout, Jayanagar, BTM Layout, Whitefield.
- Demo users: **Kabir Mehta** (`u-buyer`, shopper, Koramangala), **Ananya Rao** (`u-seller`, owns Crumb & Co.), **SnapSell Admin** (`u-admin`). Other people: Riya Sharma, Arjun Nair, Meera Iyer, Rohan Das, Sana Khan, Vikram Joshi.
- Brands: Crumb & Co. (bakery, Koramangala), Wick Studio (candles, Indiranagar), Thread Tales (fashion, HSR), Leaf Lab (plants, Jayanagar), Glow Ritual (skincare, BTM, **pending** approval).
- 12 products, 5 seed orders (one per status), 8+ secondhand listings (study table, Hero cycle, Prestige cooler, UPSC books, IKEA chair, headphones, mixer grinder, backpack) with 2 seed deals and 1 chat thread.
- Prices in ₹ with Indian grouping (`rupees()` helper). Times relative (`timeAgo`).

---

## 8. Build phases and task list

| Phase | Scope | Owner | Done when |
|---|---|---|---|
| A ✅ | P1 front-end + admin, mock data, deploy | Mohammed + Claude | Live link works end to end |
| A2 ✅ | P2 Secondhand front-end (6.2) + admin tiles | Claude | AC in 6.2 pass in browser |
| B1 | Supabase project, migration from 5.2, RLS 5.3, seed script from `data.js` | Backend | Tables + policies exist; seed loads |
| B2 | Replace `store.jsx` actions with Supabase calls (auth, products, orders, listings, deals, messages); keep same action names so screens don't change | Frontend | App works logged in as two real users in two browsers |
| B3 | Storage photo upload in sell flow + product form | Frontend | Photos persist and show on cards |
| B4 | Edge Function `ai-listing`: photos → Claude Haiku 5.5 → JSON `{title, description, category, condition, facts[], priceHint, followUpQuestions[], needsMorePhotos}`; timeout 10 s → manual form | Backend | Real draft in < 10 s; failure falls back cleanly |
| B5 | Razorpay test Checkout for P1 UPI and P2 in-app/ship; webhook marks paid | Backend | Test payment shows in Razorpay dashboard and flips status |
| C | Polish: notifications (email via Resend), share-to-WhatsApp links, empty/error states, phone testing | All | Demo script (PRD §8) runs without help |

Each task: branch `feat/<task>`, PR into `main`, run `npm run build` before pushing.

---

## 9. Testing checklist (run before every demo)

1. Reset demo data (Admin header) → welcome screen shows.
2. Buyer · Kabir: add sourdough + candle → Cart shows 2 stores, ₹60 delivery → Pay → 2 orders "New order".
3. Log out → Business · Crumb & Co.: Orders shows Kabir's order, earnings = price − 8% → Accept → Mark out for delivery → Mark delivered.
4. Log out → Kabir: Orders tracker shows Completed.
5. Secondhand: Kabir sells an item through the AI flow → appears in feed. Log in as another seeded user path (or use seeded listing) → request/buy → complete deal → listing sold.
6. Admin: totals include the new orders and deals; approve Glow Ritual → it appears in Shop.
7. Phone width (375 px): bottom nav visible, nothing overflows.

## 10. Commands

```bash
npm install          # first time
npm run dev          # http://localhost:5173
npm run build        # must pass before every push
wrangler deploy --assets dist --name snapsell-local --compatibility-date 2026-11-10   # deploy
```

## 11. Open questions

- Payment split/hold mechanics (Razorpay Route vs manual payouts) — decide after mentor review.
- P2 commission: 5% on in-app payments only? Flat fee under ₹500?
- Phone OTP vs email login for the hackathon (DLT registration).
- Should business accounts also get the Secondhand tab?
