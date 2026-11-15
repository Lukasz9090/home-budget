# Design System (spartan/ui) — Plan Brief

> Full plan: `context/changes/design-system/plan.md`
> Research: `context/changes/design-system/research.md`

## What & Why

Introduce a design-system contract (Tailwind v4 + spartan/ui, style `nova`, theme `neutral`) and a mockup-first rule **before S-02**: every screen is built from a registered Figma mockup, from components in `libs/ui` and semantic tokens. Without a mockup the agent stops with `BRAK MAKIETY`. The migration is cheapest now: three screens, one token file, zero literal colours in views.

## Starting Point

`frontend/src/styles.scss` holds both the tokens (`--color-*`, brand blue `#2f5bd3`) and global component classes used by login, register and shell. There is no Tailwind, no mockup for any screen and no Figma MCP in agent sessions; spartan packages sit in `node_modules` as extraneous (not in `package.json`), so CI/Vercel `npm ci` would lose them. CI runs tests only, not lint.

## Desired End State

`context/design/mockups.md` registers desktop and mobile Figma frames for `/login`, `/register` and `/`; `CLAUDE.md` makes a missing or unreadable mockup a hard stop. Those screens match their mockups, built from helm components in `frontend/libs/ui`; `styles.css` holds only the generated `neutral` theme. A dev-only `/dev/kitchen-sink` shows the 7-state matrix in light and dark. CI fails on literal colours, view-level `dark:` (`npm run lint:ui`) and lint errors. Everything passes from a clean `npm ci`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Library | spartan/ui 1.9.0 (brain + helm) | Angular 21-compatible, signals/zoneless, free 1:1 Figma kit | Research |
| Style / theme | `nova` / `neutral` (was `stone`), `--primary` stays neutral | The mockups use the kit's neutral values; same style and theme in code and Figma | Research (user), theme revised 2026-11-15 |
| Font | System font stack (spartan `--font-sans`), no Geist | Accepted difference from the kit; no font dependency | Plan (2026-11-15) |
| i18n | Deferred to its own change; copy stays in view templates, never in `libs/ui` | DB-backed translation keys + language switching need backend + runtime layer; PRD does not require it | Plan (2026-11-15) |
| Helm location | `frontend/libs/ui` (CLI default) | Outside `src/**` lint scope, no ESLint override needed | Research (user) |
| Timing | Now, narrow scope, before S-02 | Cheapest migration point; only components the mockups use | Research |
| Mockups | Required for every screen, including login/register/shell in this change; `/dev/*` exempt | Fronts are built deliberately from a design, not guessed | Plan (2026-11-14) |
| Mockup format | Figma frame link only, read via Framelink MCP (PAT); one reading deposited in `mockup-review.md` (done 2026-11-15) | Single source of truth; depositing saves the Figma API quota | Plan (2026-11-14/15) |
| Mockup coverage | Main screen at 1440px + 390px; undrawn states built from kitchen-sink components, marked "bez makiety" | States are covered by the design system; drawing all of them would block slices | Plan (2026-11-14) |
| Enforcement | Rule in `CLAUDE.md` + registry `context/design/mockups.md`; errors `BRAK MAKIETY` / `BRAK DOSTĘPU DO MAKIETY`; discrepancies reported, not resolved silently | One place to check, no brittle route parsing in CI | Plan (2026-11-14) |
| Kitchen sink | `/dev/kitchen-sink`, dev build only (`fileReplacements`) | Visual gate without login/backend, never shipped to production | Plan |
| Dark mode | Deferred, but prepared: `.dark` variables, token-layer-only rule, `dark:` banned in `src/app`, dev-only Light/Dark preview | Later enabling = `dark` class on `<html>`, no view changes | Plan (2026-11-14) |
| Loading state | `hlm-spinner` + existing pending text in submit | Fills the loading cell with a library component S-02 reuses | Plan |
| Guard | `CLAUDE.md` UI rule + `npm run lint:ui` (Node script) + lint in CI | A failing check beats a forgotten rule; no new dependency | Plan |
| `spartan-docs.md` | Corrected in place (§1.1, 1.3, 1.4, 5.1, 7) | Removes traps (`--force`, second `ui-theme`, `icon`) | Plan |

## Scope

**In scope:**
- SCSS → CSS, Tailwind via `ng add`, spartan `init --theme=neutral`, `components.json`, `provideSpartanHlm()`, deps proven on clean `npm ci`
- Old tokens removed; raw theme values in `theme-values.md`
- Mockup registry, mockup rule, Figma MCP access check, `mockup-review.md` for 3 screens × 2 widths
- Helm components: button, card, field, input, label, separator (from the mockups), alert, spinner (undrawn states) + utils
- Login, register, shell + home built per mockup; global classes deleted; spec selectors fixed; login spinner test
- Kitchen sink with dark preview, screenshots, `CLAUDE.md` UI rule, `lint:ui` (incl. `dark:`), CI lint steps

**Out of scope:**
- User-facing dark mode (app toggle, saved preference, `prefers-color-scheme`, dark contrast pass, Figma dark)
- PNG exports of mockups, CI check of route ↔ registry, mockups for individual states
- Geist font, i18n / translation keys / language switching, brand blue, extra components, Vitest `matchMedia`/`ResizeObserver` stubs, Playwright, Tailwind Prettier plugin, backend

## Architecture / Approach

Figma frame (spartan kit, nova/neutral) → registry row → one MCP reading deposited in `mockup-review.md` → view built from helm components (`@spartan-ng/helm/<name>`, our copies wrapping `@spartan-ng/brain`) and semantic classes published by `@theme inline` from `:root` values in `styles.css`. `lint:ui` keeps literals and `dark:` out of `src/app`. Phases: environment → tokens → mockup gate → views → states/guard, each ending with a working app.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Environment and library | Tailwind + spartan installed, recorded, theme generated, no visual change | Lockfile/npm version, missing deps only visible on clean `npm ci` |
| 2. Tokens — one source of values | Old tokens gone, neutral palette live on existing classes, values deposited | Contrast/focus regressions from the colour swap |
| 3. Mockup gate | Registry, rule; Figma access and the 6-frame review already done 2026-11-15 | A frame changing after the review (needs a re-read) |
| 4. Views per mockup | Login/register/shell + home on helm per mockup, global classes deleted, spinner | Mockup vs DS discrepancies; helm vs strict TS options |
| 5. States and guard | Kitchen sink (dev-only, dark preview), `CLAUDE.md` rule, `lint:ui`, CI lint | Kitchen sink leaking into prod; lint newly in CI surfacing old errors |

**Prerequisites:** npm 11.6.2; Figma MCP (Framelink) configured — done; mockups for the 3 screens — done (page `1. auth`); local backend + Postgres for manual auth checks.
**Estimated effort:** ~3–4 agent sessions across 5 phases, plus the user's design time in Figma.

## Open Risks & Assumptions

- Framelink uses the Figma REST API, whose per-plan rate limits were not verified; if a call is refused the agent stops with `BRAK DOSTĘPU DO MAKIETY`.
- The Figma token was pasted in chat and has broader scopes than needed; rotate it.
- Mockups may use elements or colours outside spartan/neutral; each one becomes a user decision in `mockup-review.md` and can widen Phase 4.
- The Figma community kit may lag spartan releases; code (`libs/ui`) wins on component details.
- Generated helm code may not compile under `noPropertyAccessFromIndexSignature` / `strictInputAccessModifiers`; fix in `libs/ui` and list the edits.
- The bundle may cross the 500 kB warning budget; a warning is accepted, an error is not.

## Success Criteria (Summary)

- No screen gets built without a registered mockup: the agent answers `BRAK MAKIETY` for an unregistered route.
- Login, register and shell match their mockups at desktop and mobile, with visible focus, field errors, alerts and a loading spinner.
- A fresh clone builds, tests, lints and passes `lint:ui`; dark mode can be switched on later by adding the `dark` class to `<html>`.
