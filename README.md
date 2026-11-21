# SnapSell Local (v1)

Hyperlocal marketplace where early-stage local brands (home bakers, candle makers, small studios) sell to shoppers in their neighbourhood. Team 15 hackathon project.

## What works (mock data, saved in the browser)
- **Onboarding:** choose "I want to shop local" or "I run a local business", phone + OTP (demo code `1234`), profile / storefront setup. Demo accounts on the welcome screen.
- **Buyer app:** search, categories, brand storefronts, product detail, cart across brands, delivery or pickup, UPI (simulated Razorpay) or pay on delivery, order tracking, cancel.
- **Business app:** dashboard (sales, earnings after 8% commission, open orders, low stock), order handling (accept → out for delivery / ready for pickup → completed, decline), products (add, edit, hide, delete, stock +/-), storefront settings and payouts.
- **Admin console:** GMV, commission, sales by seller, approve / suspend sellers, all orders.

## Run locally
```bash
npm install
npm run dev
```

## Next
Platform 2 (secondhand buy-and-sell between neighbours), real backend (Supabase), Razorpay payments.
