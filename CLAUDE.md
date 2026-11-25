# SnapSell Local — agent instructions

Before changing anything, read `docs/PROJECT_LOG.md` (project history, decisions, current state, next steps), then `docs/IMPLEMENTATION_PLAN.md` and `docs/DESIGN.md`.

## Must follow
- Mobile-first: phones (< 768 px) are the main layout; desktop must keep working. Use the building blocks in `src/ui.jsx` (`TopBar` for pushed screens, `ActionBar` for pinned actions, `Sheet`, `Segmented`, `ScreenTitle`, `SectionTitle`, `Enter`, `Stagger`/`Item`, `Success`) instead of hand-rolled layout.
- Icons only from `src/icons.jsx` (Hugeicons). Animation with `motion/react` using the presets in `src/ui.jsx`.
- Mock data only in `src/data.js`; state changes only through actions in `src/store.jsx`. Bump the localStorage key if the data shape changes.
- 20 px gutters, touch targets ≥ 44 px, inputs 16 px, coral `#FF5A3D` only for sell/create/publish, indigo `#3B2FD9` primary.
- Never use the word "escrow"; say "payment held until handover / until you receive it".
- `npx vite build` must pass before committing. Deploy: `wrangler deploy --assets dist --name snapsell-local --compatibility-date 2026-11-10`. Push in the background (slow).
- Public repo: no secrets, keys, emails or phone numbers in commits.
- After a meaningful change: add a dated entry to `docs/PROJECT_LOG.md` §4, update §1 and §8. If screens changed, regenerate flows (`node scripts/capture-screens.mjs && node scripts/build-flows.mjs`).
