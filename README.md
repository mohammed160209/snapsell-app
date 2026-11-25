# SnapSell Local

Hyperlocal marketplace for Bengaluru neighbourhoods, built by Team 15 (MESA BYOP hackathon). Two platforms in one mobile-first web app:

- **Local brands** — early-stage local businesses (home bakers, candle makers, small studios) sell to shoppers within 5 km. Delivery or pickup, 8% commission.
- **Secondhand** — every shopper can also sell: snap photos, AI writes the listing, meet in person or ship with payment held until it arrives.

**Live:** https://snapsell-local.icesaviour02.workers.dev/ · Demo accounts on the welcome screen (OTP `1234`, handover code `4827`).

## Docs
- `docs/PROJECT_LOG.md` — history, decisions, current status, what's next (start here)
- `docs/IMPLEMENTATION_PLAN.md` — stack, database schema, screens, phases
- `docs/DESIGN.md` — visual direction, tokens, libraries, per-screen inspiration
- `docs/flows/` — user-flow boards built from real screenshots

## Run
```bash
npm install
npm run dev
```

Current state: front-end with mock data saved in the browser. Next: Supabase backend, Razorpay test payments, real AI listings.
