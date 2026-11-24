# SnapSell Local — design notes

**Direction: calm premium** (Apple / Airbnb). Quiet neutrals, generous space, real photos, one strong accent, and motion that explains what changed rather than decorating.

## Libraries

| Library | Used for | Why this one |
|---|---|---|
| **Motion** (`motion`, formerly Framer Motion) | Screen transitions, sliding tab and segmented-control indicators, spring bottom sheets with drag-to-dismiss, staggered lists, number roll in steppers, success check drawing, progress bars | The standard React animation library; layout animations (`layoutId`) give the native-feeling sliding indicators for free |
| **Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`) | Every icon in the app, wrapped in `src/icons.jsx` | 4,000+ free stroke icons with a consistent, modern weight; swap any glyph in one place |
| **Tailwind CSS 4** | Layout and tokens | Already in the stack; component classes (`.card`, `.btn`, `.input`, `.pill`) live in `src/index.css` |
| React 19 + Vite 6 | App shell | Existing stack |

Considered and not used yet: shadcn/ui (desktop-form oriented, would add Radix weight), Vaul (drawer; Motion's drag sheet covers it), Lottie (no illustration assets yet).

## Tokens

| Token | Value |
|---|---|
| Canvas | `#F5F5F7` (Apple grouped background) |
| Surface | `#FFFFFF`, radius 20, hairline ring + soft layered shadow, no borders |
| Ink / secondary / muted | `#1D1D1F` / `#6E6E73` / `#8E8E93` |
| Primary | Indigo `#3B2FD9` (gradient hero cards `#4A3FE6 → #2A1FB0`) |
| Sell / create accent | Coral `#FF5A3D` — only for Sell, Add product, Publish |
| Success | `#157F3E` on `#E7F7EE`; switches use iOS green `#34C759` |
| Type | Inter; large titles 30 px / −0.03 em; body 15–16 px |
| Gutters | 20 px on phones everywhere (rails bleed edge-to-edge, content never does) |
| Targets | ≥ 44 px; primary buttons 52–56 px; inputs 52 px, 16 px text (no iOS zoom) |
| Motion | Springs `stiffness 420 / damping 38` for UI, `260 / 30` for sheets; ease `cubic-bezier(.22,1,.36,1)`; all respect `prefers-reduced-motion` |

## Screen-by-screen inspiration

| Screen | Inspired by | What we borrowed |
|---|---|---|
| Welcome | Airbnb, Pinterest onboarding | Photo collage of real items, short headline, choices in the thumb zone, demo as a quiet link |
| Phone / code / profile | Apple ID, Cred, Swiggy sign-in | One question per screen, big title, segmented progress bar, four-box code entry, slide between steps |
| Demo accounts | iOS action sheets | Bottom sheet with icon rows, drag down to dismiss |
| Local brands home | Airbnb Explore, Swiggy Instamart | Large title, location line, filled search, pill category rail, gradient feature card, brand rail, 2-column product grid with floating add buttons |
| Brand store | Airbnb host profile, Shopify Shop app | Stats strip (rating · products · area), capability chips |
| Product detail | Apple Store app, Shop app | Edge-to-edge hero, price block, two info tiles, seller row, pinned stepper + add button |
| Cart & checkout | Apple Pay sheet, Zepto checkout | Store-grouped lines, iOS segmented Delivery/Pickup, selectable payment cards, pinned pay bar |
| Order placed | Apple Pay success | Drawn check animation, one primary and one secondary action |
| Orders | Swiggy / Uber order tracking | Animated step tracker, status dot chips |
| Secondhand feed | Airbnb listings, Vinted, OLX | Photo-first square cards, glass badges (AI-written, Meet/Ships), trust banner |
| Listing detail | Airbnb listing page | Hero photo, "Confirmed by seller" checklist, verified seller row, how-it-works card, pinned actions |
| Sell with AI | Vinted upload, Google Lens | Photo slots, scanning animation, AI-detected card, tap-to-answer questions, editable draft, choice cards |
| Deals | Uber trip card, Apple Wallet | Avatar row, big digit code tiles, contextual note blocks |
| Chat | iMessage | Bubble tails, quick-reply pills, round send button, glass composer |
| Business home | Stripe Dashboard mobile, Shopify admin | Earnings hero card, tappable stat tiles, action lists |
| Products | Shopify inventory | Row cards with stock chip + stepper, ⋯ action sheet, floating add button |
| Store settings | iOS Settings | Grouped card, icon rows, iOS switches |
| Admin | Stripe / Linear | Dark revenue hero, KPI tiles, animated bar chart by seller |

## Where things live

- Building blocks: `src/ui.jsx` (`Header`, `TopBar`, `BottomNav`, `ActionBar`, `Sheet`, `SheetRow`, `Segmented`, `ScreenTitle`, `SectionTitle`, `Stepper`, `Success`, `Enter`, `Stagger`/`Item`, `CategoryIcon`, `StatusChip`, `Empty`)
- Icons: `src/icons.jsx`
- Tokens and component classes: `src/index.css`
- Flow boards with real screens: `docs/flows/`
