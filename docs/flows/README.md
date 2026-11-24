# SnapSell Local — user flows

Each board shows the **real app screens** (captured from the running app at iPhone size, 390 × 844) with arrows labelled by the exact button you tap. Open the `.svg` in a browser for full quality; the `.png` is the same board as an image.

| Board | What it shows |
|---|---|
| [00-app-map](00-app-map.svg) | Welcome → the three roles, and how they affect each other |
| [01-onboarding](01-onboarding.svg) | Welcome, demo accounts, phone → code → profile, error states, business storefront setup |
| [02-shopper-local-brands](02-shopper-local-brands.svg) | Home → brand → product → cart → pay → order placed → tracking → cancel; filters, sold out, empty states |
| [03-shopper-secondhand-buy](03-shopper-secondhand-buy.svg) | Buying secondhand (meet in person with a handover code, or shipped), chat, and the seller's side of a deal |
| [04-secondhand-sell](04-secondhand-sell.svg) | Selling an item with AI in four steps, from photo to live listing |
| [05-business](05-business.svg) | Business dashboard: accept/decline orders, products and stock, ⋯ menu, add product, store settings |
| [06-admin](06-admin.svg) | Admin overview, approving/suspending sellers, all orders, moderating listings |

## How to read a board

- **Phone** = an actual screen. The badge is the step number; **!** marks an error or edge-case screen.
- **Blue arrow** = something the user taps; the label is the button text.
- **Grey dashed arrow** = happens automatically (for example the mock seller accepting in the demo).
- **Coral arrow** = an error or alternate branch.
- **Rounded pill** = where that branch ends (green = success, grey = neutral, coral = problem). White pills with a blue outline are starting points.
- **Dashed coral ring** on a screen = where the user taps next.

## Regenerate after a design change

```bash
npm run dev                          # keep it running on port 5179 (or pass another URL)
node scripts/capture-screens.mjs     # → docs/flows/screens/*.png (52 screens)
node scripts/build-flows.mjs         # → docs/flows/*.svg + *.png
```

`capture-screens.mjs` uses `playwright-core` with the Chromium in `~/.cache/ms-playwright` (set `CHROME=/path/to/chrome` to use another).
