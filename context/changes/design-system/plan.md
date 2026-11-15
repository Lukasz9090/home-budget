# Design System (spartan/ui) Implementation Plan

## Overview

Introduce a design-system contract into the Angular frontend before the first domain view (S-02) is built: Tailwind CSS v4 plus spartan/ui (style `nova`, base theme `neutral`, helm components copied into `frontend/libs/ui`). Every screen is built from a Figma mockup: a mockup registry and a rule make "no mockup" a hard error for the agent. The three existing screens (login, register, shell with the home placeholder) get mockups and move from hand-written global classes onto spartan tokens and helm components according to them. The change ends with a dev-only kitchen sink covering the 7-state matrix (with a dark preview), desktop and mobile screenshots, and a guard (a UI rule in `CLAUDE.md` plus a literal scan in CI) so later slices inherit the contract instead of the literals.

## Current State Analysis

- No Tailwind in `frontend/package.json`; all styles are SCSS files with no Sass syntax: `src/styles.scss` (203 lines), `app/app.scss`, `auth/login/login.scss`, `auth/register/register.scss`, `shell/shell.scss`. `angular.json:14,26,33` point the component schematic, `inlineStyleLanguage` and `styles` at SCSS.
- `src/styles.scss:3-15` holds the current tokens (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary(-hover)` `#2f5bd3`, `--color-danger(-bg)`, `--radius`, `--focus-ring`). The same file defines global component classes that act as the de-facto design system: `.auth-page`/`.auth-card`/`.brand`/`.auth-switch` (`:66-96`), `.form`/`.field`/`.hint`/`.field-error`/`.form-error` (`:100-149`), `.btn`/`.btn-primary`/`.btn-secondary` (`:153-203`).
- Consumers: `auth/login/login.html`, `auth/register/register.html`, `shell/shell.html` (+ `shell.scss`), `home/home.ts` (inline template). The `/10x-ui` literal scan on these files returns 0 hits; views already read `var(--color-*)`, so tokens exist but there are no importable components.
- There is no mockup registry yet. The mockups for login, register and shell + home exist (Figma `QMx4nvFcQC9mpTjJCWPwuS`, page `1. auth`, 6 frames), Figma MCP (Framelink) was configured on 2026-11-14, and the single reading of all six frames with the user's decisions is already in `context/changes/design-system/mockup-review.md` (2026-11-15).
- `frontend/node_modules` contains spartan `brain`/`cli` 1.9.0, `@angular/cdk`, `@ng-icons/*`, `tailwind-merge`, `tw-animate-css`, `nx` and dozens of other packages as **extraneous** (not in `package.json`). CI (`.github/workflows/test.yml:36`) and the Vercel image (`Dockerfile.vercel:10`) install with `npm ci`, so anything not written to `package.json`/`package-lock.json` disappears there.
- Tests depend on CSS classes: `auth/register/register.spec.ts:59` (`.hint`) and `:69` (`.field-error`). Selectors `#…-email`, `#…-password`, `button[type="submit"]`, `[role="alert"]` are stable.
- CI's frontend job runs only `npm test`; `npm run lint` is not in CI. No pre-commit hook, no Playwright.
- Lint covers only `src/**` (`angular.json:80`) with selector prefix `app` (`eslint.config.js:22,30`).

## Desired End State

- `frontend` builds, tests and lints from a clean `npm ci`; `npm ls --depth=0` reports no extraneous or missing packages.
- `frontend/src/styles.css` is the single source of design values: Tailwind import, spartan preset, the generated `neutral` theme (`:root` + `:root.dark`), with a comment naming the source. No `--color-*` custom tokens, no global component classes.
- `frontend/libs/ui` holds the helm components actually used, imported via `@spartan-ng/helm/<name>`; `frontend/components.json` pins `style: nova`, `componentsPath: libs/ui`.
- `context/design/mockups.md` registers a Figma desktop (1440px) and mobile (390px) frame for each product screen; `CLAUDE.md` makes a missing mockup (`BRAK MAKIETY`) or unreadable mockup (`BRAK DOSTĘPU DO MAKIETY`) a hard stop for UI work.
- Login, register and shell (+ home placeholder) match their mockups, built from helm components and semantic Tailwind classes only; the submit button shows a spinner while pending.
- `/dev/kitchen-sink` exists in `ng serve` (development build) only and shows every applicable state of the 7-state matrix, in light and dark (dev-only toggle); the production bundle contains no trace of it.
- `npm run lint:ui` fails on literal colours/palette classes/arbitrary values and on `dark:` variants in `src/app`; CI runs `npm run lint` and `npm run lint:ui`.
- Dark mode is ready but off: turning it on later means only adding the `dark` class to `<html>` (toggle, persistence, `prefers-color-scheme`) — no view or token changes.
- Verify: clean `npm ci` → `npm run build`, `npm test -- --watch=false`, `npm run lint`, `npm run lint:ui` all green; screenshots in `context/changes/design-system/screenshots/` compared against the mockup frames.

### Key Discoveries:

- `ng g @spartan-ng/cli:init --theme=neutral` runs without prompts and writes layers, preset import, `:root`/`:root.dark`, `--font-sans` and `@layer base` into the styles entry file (`node_modules/@spartan-ng/cli/src/generators/init/schema.json:11-15`; research §1.3). Running `ui-theme` afterwards would append a second theme block, so it must not be run.
- `ng g @spartan-ng/cli:ui <name>` skips all prompts when `components.json` already exists with `componentsPath`, `importAlias`, `style` (`node_modules/@spartan-ng/cli/src/utils/config.js:16-24,90-137`). Without `style` it falls back to `vega`, not `nova` (`config.js:15`).
- `ui` writes one `paths` alias per component into `tsconfig.json` and adds `libs/ui/**/src/**/*.ts` to `tsconfig.app.json` `include` (research, Gaps §4 / `generators/base/generator.ts`).
- `@ng-icons/core` latest (36.x) needs Angular ≥22; helm wants `>=32 <34`. Helm also wants `@spartan-ng/brain` exactly `1.9.0` (research, Gaps §3).
- The lockfile only survives npm `11.6.2` (`package.json` `packageManager`; `test.yml:35` comment). Local npm is 11.6.2.
- `<hlm-field-error>` inside `hlmField` shows itself when the control is `invalid && touched`; it does not react to `FormGroupDirective` submit, but both forms already call `markAllAsTouched()` on invalid submit (`login.ts:29-31`, `register.ts:30-32`).
- `provideSpartanHlm()` from `@spartan-ng/helm/utils` disables CDK `usePopover` (Angular 21) so overlays position correctly; it lives in the generated `utils` helm lib.
- `hlmBtn` has no loading input; the documented pattern is `@if (pending) { <hlm-spinner /> }` inside the button (`spartan-docs.md` §6.2).
- Dark mode is already wired at the token layer: the theme generator writes `:root { color-scheme: light; … }` and `:root.dark { color-scheme: dark; … }` (`node_modules/@spartan-ng/cli/src/generators/theme/libs/add-theme-to-application-styles.js:45,54-57`; corrects research Gaps §8), the preset defines `@custom-variant dark (&:is(.dark *))` (`node_modules/@spartan-ng/brain/hlm-tailwind-preset.css:20`), and helm templates carry their own `dark:` variants (e.g. `dark:bg-input/30`). The only switch is the `dark` class on `<html>`; views must never need `dark:` themselves.
- `ng add tailwindcss` adds `tailwindcss`, `@tailwindcss/postcss`, `postcss` and `.postcssrc.json`, and prepends the import to the first `.css` in `styles` (research §1.1). The builder reads only `.postcssrc.json`/`postcss.config.json`.
- Figma access is the Framelink MCP server (`figma-developer-mcp@0.13.2`, user-scope config in `~/.claude.json`, Personal Access Token with `file_content:read`), configured 2026-11-14 — not the official `mcp.figma.com` server, which accepts only OAuth. Framelink calls the Figma REST API; its per-plan rate limits were not verified, so every frame is read once and its reading is deposited in the repo. One `get_figma_data` call on the page node returns all six frames.
- Theme changed from `stone` to `neutral` on 2026-11-15 (supersedes the research decision): the mockups use the kit's neutral values `#0A0A0A`/`#171717`/`#737373`/`#E5E5E5`/`#FAFAFA`, which equal spartan's `neutral` tokens (`foreground oklch(0.145 0 0)`, `primary oklch(0.205 0 0)`, `muted-foreground oklch(0.556 0 0)`, `border oklch(0.922 0 0)`; `node_modules/@spartan-ng/cli/src/generators/theme/libs/colors.js:20-50`). `neutral` is in the `init --theme` enum. Radius stays `0.625rem` (inputs 10px, cards 14px in the kit).
- The mockup frames are 1440×900 (desktop) and 390×844 (mobile); these widths replace the earlier 1280/375 for all screenshots and comparisons.

## What We're NOT Doing

- No user-facing dark mode (deferred, PRD has no requirement): no toggle in the app/shell, no persisted preference, no `prefers-color-scheme` default, no dark contrast pass on login/register/shell, no dark mode in Figma (needs a paid plan with variable modes). This change only keeps the door open: generated `:root.dark` variables, the token-layer-only rule, the `dark:` ban in `lint:ui`, and a dev-only dark preview in the kitchen sink. The future change adds the `dark` class on `<html>` and nothing else at view level.
- No brand blue: `--primary` stays the `neutral` value; `#2f5bd3` disappears.
- No PNG exports of mockups in the repo: the Figma frame link is the source of truth, read through Figma MCP.
- No CI check for mockup coverage (route ↔ registry): the rule and the registry are the enforcement.
- No mockups required for states: only the main screen at desktop and mobile; undrawn states (empty, error, loading, focus, disabled) come from the kitchen-sink components and are listed as "bez makiety".
- No mockup for `/dev/*` routes (developer tool, not a product screen).
- No components beyond those the three mockups map to (button, card, field, input, label, separator from the mockups; alert, spinner for undrawn states; + utils). Others are added by the slice whose mockup needs them.
- No Geist font: the kit uses Geist, the app keeps spartan's system font stack (`--font-sans`); accepted difference, recorded in `mockup-review.md`.
- No i18n (deferred to its own change, PRD has no multi-language requirement): copy stays as Polish literals in templates and the backend's Polish `detail` messages stay as they are. Translation keys loaded from the database and runtime language switching need a backend table + API, a frontend runtime translation layer (Angular's built-in i18n is compile-time only) and a decision on backend error messages. This change keeps the door open only by not baking copy into `libs/ui` components: every label/text lives in the view templates, so moving it to keys later is a per-view substitution.
- No Vitest `setupFiles` stubs for `matchMedia`/`ResizeObserver`: nothing added here needs them. The `CLAUDE.md` rule records the gotcha.
- No Playwright / screenshot-testing tool; the visual gate is the kitchen sink plus manual screenshots compared with the frames.
- No `prettier-plugin-tailwindcss`, no Prettier/ESLint override for `libs/ui` (it stays outside `lintFilePatterns`).
- No `spartan-docs.md` move to `context/foundation/`; it is corrected in place and archived with the change.
- No backend changes.

## Implementation Approach

Follow the `/10x-ui` order (environment/library → token values → view → states), with a mockup gate inserted before the views:

1. Phase 1 adds the toolchain and the generated theme but leaves the old tokens and global classes in place (unlayered rules beat Tailwind's layered preflight/base), so the screens look as before.
2. Phase 2 deletes the old token block and rewires the global classes to the spartan variables, so the colour/radius change can be judged in isolation.
3. Phase 3 is the mockup gate: registry, rule, working Figma MCP, the user's frames for the three screens, and one deposited reading of each frame with every discrepancy resolved by the user. Phase 4 cannot start while any row is incomplete.
4. Phase 4 builds the screens from helm components according to the deposited mockup review and deletes the global classes; tests follow in the same phase.
5. Phase 5 adds the kitchen sink (with dark preview) and the guard.

All dependency changes go through generators (`ng add`, `init`, `ui`) or explicit `npm install <pkg>@<range>` with npm 11.6.2, and are proven on a clean `npm ci`.

## Critical Implementation Details

- **Ordering in Phase 1:** clean `npm ci` first (drops the extraneous packages), then rename `.scss` → `.css`, then `ng add tailwindcss`, then write `components.json`, then `init --theme=neutral`. Running `init` before the rename writes the theme into `styles.scss`; `ui` must never run without `components.json` (it would fall back to `vega` or prompt).
- **Token collision:** the old `--radius: 0.5rem` in our unlayered `:root` would override spartan's `--radius: 0.625rem` and leak into helm components. Remove that single line in Phase 1; the other old `--color-*` names survive until Phase 2 (they are only read by our own classes).
- **Figma quota:** the six frames were read once on 2026-11-15 and the reading is already in `mockup-review.md`; Phase 3 does not re-read them unless a frame changes. Phase 4 implements from that file and re-opens a frame only for the final side-by-side comparison when quota allows. A failed or rate-limited MCP call is `BRAK DOSTĘPU DO MAKIETY`, never a reason to continue from memory.

## Phase 1: Environment and library

### Overview

Tailwind v4 and spartan installed and recorded in `package.json`, the `neutral` theme generated into `styles.css`, `utils` helm lib and `provideSpartanHlm()` wired, with no visual change to the existing screens.

### Changes Required:

#### 1. Clean dependency baseline

**File**: `frontend/node_modules` (not tracked)

**Intent**: Start from the lockfile so nothing extraneous masks a missing dependency.

**Contract**: `npm ci` with npm 11.6.2 in `frontend/`; afterwards `npm ls --depth=0` shows no `extraneous`.

#### 2. SCSS → CSS

**File**: `frontend/src/styles.scss`, `src/app/app.scss`, `src/app/auth/login/login.scss`, `src/app/auth/register/register.scss`, `src/app/shell/shell.scss`, their `styleUrl` references, `frontend/angular.json`

**Intent**: Tailwind v4 does not support Sass; the files contain no Sass syntax, so a rename is enough.

**Contract**: every `*.scss` renamed to `*.css` (use `git mv`); `styleUrl` updated in `app.ts`, `login.ts`, `register.ts`, `shell.ts`; `angular.json`: `schematics["@schematics/angular:component"].style = "css"`, `inlineStyleLanguage` removed (or `"css"`), `styles: ["src/styles.css"]`. Remove `--radius` from the old `:root` block (see Critical Implementation Details).

#### 3. Tailwind v4

**File**: `frontend/package.json`, `frontend/package-lock.json`, `frontend/.postcssrc.json`, `frontend/src/styles.css`

**Intent**: Add Tailwind through Angular's own schematic.

**Contract**: `npx ng add tailwindcss` (adds `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `.postcssrc.json`, `@import "tailwindcss";` in `styles.css`). No `--force`.

#### 4. spartan config and theme

**File**: `frontend/components.json` (new), `frontend/src/styles.css`, `frontend/package.json`

**Intent**: Pin the chosen style and location before any `ui` call, then generate the `neutral` theme once.

**Contract**: `components.json` = `{ "componentsPath": "libs/ui", "importAlias": "@spartan-ng/helm", "style": "nova" }`. Install `@spartan-ng/cli@1.9.0` as devDependency, then `npx ng g @spartan-ng/cli:init --theme=neutral`. `init` must leave `@spartan-ng/brain@1.9.0`, `@angular/cdk` (matching Angular 21), `tw-animate-css`, `clsx`, `@ng-icons/core` + `@ng-icons/lucide` (`>=32 <34`) in `dependencies`; add any that it does not, with explicit versions. `ui-theme` is **not** run.

#### 5. Helm utils and provider

**File**: `frontend/libs/ui/utils/**` (generated), `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/src/app/app.config.ts`

**Intent**: Generate the shared helm utils (`hlm()`, `provideSpartanHlm()`) and register the provider.

**Contract**: `npx ng g @spartan-ng/cli:ui utils`; `provideSpartanHlm()` added to `appConfig.providers`. Any extra runtime dependency the helm files import (e.g. `class-variance-authority`, `tailwind-merge`) is present in `package.json`.

#### 6. Correct `spartan-docs.md`

**File**: `context/changes/design-system/spartan-docs.md`

**Intent**: Remove the four traps the research found, so the reference matches what this plan does.

**Contract**: §1.1 drop `--force` and mention `ng add tailwindcss`; §1.3 `init` already generates the theme — do not run `ui-theme` afterwards; `init --theme=<name>` is non-interactive; §1.4 note that `components.json` must exist (with `style`) before `ui`, and that `ui` writes tsconfig paths/include; §5.1 `<hlm-field-error>` shows itself on `invalid && touched` — no wrapping `@if`, call `markAllAsTouched()` on submit with `[formGroup]`; §7 no `icon` component in 1.9.0 — use `@ng-icons` directly.

### Success Criteria:

#### Automated Verification:

- Clean install succeeds and leaves no extraneous packages: `npm ci && npm ls --depth=0` (in `frontend/`)
- Production build passes: `npm run build`
- Unit tests pass: `npm test -- --watch=false`
- Lint passes: `npm run lint`
- No `.scss` files remain under `frontend/src`
- `styles.css` contains exactly one generated `:root` theme block (no duplicate from `ui-theme`)

#### Manual Verification:

- Login, register and the logged-in shell keep the same layout and colours as before the phase (ng serve); known Tailwind preflight differences (headings no longer bold, links without underline) are accepted until Phase 4

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Tokens — one source of values

### Overview

The spartan theme becomes the only value source: the old token block goes, the remaining global classes read spartan variables, and the raw theme values are deposited in the change folder.

### Changes Required:

#### 1. Remove old tokens, rewire global classes

**File**: `frontend/src/styles.css`, `frontend/src/app/shell/shell.css`

**Intent**: Delete the `--color-*`/`--focus-ring` block and point every remaining global rule at the role-named spartan variables, so the screens show the `neutral` palette while still using the old classes.

**Contract**: mapping — `--color-bg`→`--background`, `--color-surface`→`--card`, `--color-text`→`--foreground`, `--color-muted`→`--muted-foreground`, `--color-border`→`--border`, `--color-primary`→`--primary`, `--color-primary-hover`→`--primary` at 90% (`color-mix`), white button text→`--primary-foreground`, `--color-danger`→`--destructive`, `--color-danger-bg`→`--destructive` at ~10% (`color-mix`), `--focus-ring`→3px ring of `--ring` at 50%, `--radius` (spartan's). No hex/rgb literals remain outside the generated theme block.

#### 2. Source note and deposited values

**File**: `frontend/src/styles.css`, `context/changes/design-system/theme-values.md` (new)

**Intent**: Values that live only in a generator run get re-invented; record where they came from.

**Contract**: a one-line comment above the theme block: generated by `@spartan-ng/cli 1.9.0 init --theme=neutral`, style `nova`, raw values in `context/changes/design-system/theme-values.md`. `theme-values.md` lists the light and dark values (copied from the generated block) and the old→new token mapping above.

### Success Criteria:

#### Automated Verification:

- Production build passes: `npm run build`
- Unit tests pass: `npm test -- --watch=false`
- No `--color-` custom properties or `--focus-ring` remain in `src/styles.css` and `src/app/**` (Bash `grep`)
- Hardcoded-value scan from `/10x-ui` on the view files (`login.html`, `register.html`, `shell.html`, `shell.css`, `home.ts`) returns 0 hits

#### Manual Verification:

- Login, register and shell render in the neutral palette (near-black primary button, neutral grey borders) with readable contrast and visible keyboard focus on inputs and buttons
- Screenshots of login at desktop (1440px) and mobile (390px) saved to `context/changes/design-system/screenshots/phase2-*`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Mockup gate

### Overview

Every product screen gets a registered Figma mockup before any view is built. This phase creates the registry and the rule, confirms the agent can read Figma, and ends when the user's frames for the three screens are registered, read once and reconciled with the design system.

### Changes Required:

#### 1. Mockup registry

**File**: `context/design/mockups.md` (new)

**Intent**: One place the agent checks before any UI work; a screen absent from it does not get built.

**Contract**: short header stating the rules (frames built on the spartan Figma kit with style `nova` and theme `neutral`; links point at a single frame, i.e. contain `node-id=`; `/dev/*` exempt), then a table `Ekran | Trasa | Figma desktop (1440) | Figma mobile (390) | Uwagi`. Rows for this change: `Logowanie | /login`, `Rejestracja | /register`, `Shell + home | /` (the home placeholder is content inside the shell). Links (file `QMx4nvFcQC9mpTjJCWPwuS`, page `1. auth`, also in `mockup-review.md`):

| Ekran | Desktop (1440) | Mobile (390) |
| --- | --- | --- |
| Logowanie `/login` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-45 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-51 |
| Rejestracja `/register` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-47 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-53 |
| Shell + home `/` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-49 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-55 |

#### 2. Mockup rule

**File**: `CLAUDE.md` (new `## UI` section **outside** the `@przeprogramowani/10x-cli` BEGIN/END markers; Phase 5 extends the same section)

**Intent**: Make "no mockup" a hard error for every agent and skill that touches a screen.

**Contract**: bullets stating:
- Any work that creates a screen or changes how a screen looks (new view, layout, restyle, `/10x-ui`) starts by looking the route up in `context/design/mockups.md`, in planning and in implementation alike.
- No row, or no desktop or no mobile link → stop and report `BRAK MAKIETY: <ekran> (<trasa>)`; do not build from a description, a similar screen or a guess.
- Figma MCP not configured, failing or over quota → stop and report `BRAK DOSTĘPU DO MAKIETY: <ekran> — <powód>`.
- Undrawn states (empty, error, loading, focus, disabled) are built from kitchen-sink components and listed as "bez makiety" in the plan; they are not an error.
- Discrepancies — a colour outside the tokens, an element with no counterpart in `frontend/libs/ui`, copy or behaviour that differs from the current code/PRD — are reported and asked about, never resolved silently (no invented token, no silent deviation from the mockup).
- Read each frame once and deposit what it shows in the change folder (Figma quota).
- Exempt: `/dev/*` routes and changes with no visual effect (logic, tests).

#### 3. Figma MCP access

**File**: none in the repo (user's Claude Code configuration)

**Intent**: The link-only registry is usable only if the agent can open frames.

**Contract**: done on 2026-11-14 — Framelink MCP (`figma-developer-mcp@0.13.2`, stdio via `cmd /c npx`, user scope, `FIGMA_API_KEY` = Personal Access Token with `file_content:read`); access proven on 2026-11-15 by reading page `2003:316`. Nothing lands in the repo. The token pasted in chat should be rotated (new token with `file_content:read` + `file_metadata:read` only).

#### 4. Mockup review

**File**: `context/changes/design-system/mockup-review.md` (exists, written 2026-11-15)

**Intent**: Deposit one reading of each frame, so Phase 4 implements from the repo instead of spending Figma calls, and record how every discrepancy was resolved.

**Contract**: per screen and width: frame link, layout (regions, order, widths, spacing), each element mapped to a helm component or token class, copy shown, and a `Rozbieżności` list with the user's decision per item (follow mockup / keep code / change token-free alternative). Any helm component beyond the expected set is listed here and added in Phase 4. Written on 2026-11-15 from the single reading, with the user's decisions on all six discrepancies; Phase 3 only re-checks it if a frame changed.

### Success Criteria:

#### Automated Verification:

- `context/design/mockups.md` has rows for `/login`, `/register` and `/`, each with a desktop and a mobile link containing `node-id=` (Bash `grep`)
- `CLAUDE.md` contains `BRAK MAKIETY` and `BRAK DOSTĘPU DO MAKIETY` in a `## UI` section outside the `@przeprogramowani/10x-cli` markers

#### Manual Verification:

- The user designed desktop (1440px) and mobile (390px) frames for login, register and shell + home on the spartan kit (style `nova`, theme `neutral`) and registered them
- The agent read all six frames through Figma MCP and `mockup-review.md` covers each of them
- Every discrepancy in `mockup-review.md` has a recorded user decision
- Negative check: asked to plan a view for a route that is not in the registry, the agent answers `BRAK MAKIETY: …` and stops
- Figma PAT rotated (new token with `file_content:read` + `file_metadata:read` only); Figma MCP still reads a frame

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Views on helm components, per mockup

### Overview

Login, register, shell and home are rebuilt from helm components and semantic Tailwind classes according to `mockup-review.md`; the global component classes are deleted; the submit button gets a spinner while pending.

### Changes Required:

#### 1. Add helm components

**File**: `frontend/libs/ui/**` (generated), `frontend/tsconfig.json`, `frontend/tsconfig.app.json`

**Intent**: Bring in exactly the components the mockups use, through the CLI.

**Contract**: `npx ng g @spartan-ng/cli:ui <name>` for `button`, `card`, `field`, `input`, `label`, `separator`, `alert`, `spinner`, plus any other component listed in `mockup-review.md`. Generated helm files are not hand-edited unless the strict compiler options (`noPropertyAccessFromIndexSignature`, `strictInputAccessModifiers`) force it; any such edit is listed in the phase commit message.

#### 2. Login and register

**File**: `frontend/src/app/auth/login/login.{html,ts,css}`, `frontend/src/app/auth/register/register.{html,ts,css}`

**Intent**: Replace `.auth-page`/`.auth-card`/`.form`/`.field`/`.btn`/`.form-error`/`.hint`/`.field-error` with helm components (`hlmCard`, `hlmField` + `hlmLabel` + `hlmInput` + `hlmFieldDescription` + `<hlm-field-error>`, `hlmAlert` destructive, `hlmBtn`) laid out as the mockup review specifies, with Tailwind utilities from the default scale.

**Contract**:
- Layout, spacing, element order and copy follow `mockup-review.md` (including its recorded decisions); nothing outside it is invented.
- Input ids, `formControlName`, `autocomplete` and `aria-describedby` (register password hint keeps `id="register-password-hint"`) unchanged.
- Server error is a destructive `hlmAlert` placed before the field group; its `role="alert"` comes from the `hlmAlert` host only (no inner element with `role`). Note: `<hlm-field-error>` also stays in the DOM with `role="alert"` (hidden while there is no error), so tests must not rely on a bare `[role="alert"]` or `hlm-field-error` query.
- Field errors render inside `<hlm-field-error>` without a wrapping `touched && invalid` `@if`; inner `@if`/`@else` still picks the message per validator. Each `<hlm-field-error>` gets an explicit id: `login-email-error`, `login-password-error`, `register-email-error`, `register-password-error`.
- Submit button: `hlmBtn`, `[disabled]` unchanged; while `pending()` it shows `<hlm-spinner />` before the existing pending text (state "bez makiety" unless drawn).
- Brand "PennyPlan" sits above the card, outside it; inputs have no placeholder and no prefilled value.
- The `/register` ↔ `/login` link is the whole sentence ("Nie masz konta? Załóż konto" / "Masz już konto? Zaloguj się") as an `<a hlmBtn variant="link" routerLink>` below the card, not a global `a` rule.
- Component `.css` files that end up holding only `:host { display: block }` are deleted (use `host: { class: 'block' }`) — no empty `styleUrl`.

#### 3. Shell and home

**File**: `frontend/src/app/shell/shell.{html,ts,css}`, `frontend/src/app/home/home.ts`, `frontend/src/app/app.ts` (+ `app.css`)

**Intent**: Header, brand, e-mail, logout and home content on helm components and utilities, per the shell + home mockup.

**Contract**: layout per `mockup-review.md` (header row brand · e-mail · outline `Wyloguj`, `hlmSeparator` below it, centred content column); keeps the truncated e-mail, the logout `(click)`/`[disabled]` wiring and a content width expressed with a Tailwind scale class (no arbitrary values). `shell.css` and an empty `app.css` are deleted.

#### 4. Delete global component classes

**File**: `frontend/src/styles.css`

**Intent**: Remove the accidental design system so nothing new can use it.

**Contract**: `styles.css` contains only the Tailwind import, the spartan preset, the generated theme (`:root`, `:root.dark`, `@theme inline`, `@layer base`) and the source comment. No `.btn`, `.field`, `.form*`, `.auth-*`, `.brand`, `.hint`, `h1`/`p`/`a` rules.

#### 5. Tests

**File**: `frontend/src/app/auth/register/register.spec.ts`, `frontend/src/app/auth/login/login.spec.ts`

**Intent**: Replace class selectors that no longer exist and cover the new loading state.

**Contract**: `register.spec.ts:59` → `#register-password-hint`; `:69` → `#register-password-error`; `login.spec.ts:84` and `register.spec.ts:93` (`[role="alert"]`) → `[hlmAlert]`. New login test: after submit and before the HTTP response, the submit button is disabled and contains `hlm-spinner`; after flushing an error it no longer does. If a mockup decision changed copy, the affected assertions follow the new copy.

### Success Criteria:

#### Automated Verification:

- Production build passes: `npm run build`
- Unit tests pass, including the new login spinner test: `npm test -- --watch=false`
- Lint passes: `npm run lint`
- Hardcoded-value scan from `/10x-ui` on `src/app/**/*.{html,ts,css}` (excluding `*.spec.ts`) returns 0 hits
- `src/styles.css` contains none of `.btn`, `.field`, `.form-error`, `.auth-card` (Bash `grep`)

#### Manual Verification:

- Login, register and shell + home match their mockup frames at 1440px and 390px; every visible difference is one recorded in `mockup-review.md`
- Login and register: field error, server error alert and disabled/pending submit work; Tab order and focus ring visible on every control
- Logged-in shell: logout works; e-mail truncates on mobile
- Screenshots of login, register (with a field error) and shell at 1440px and 390px saved to `context/changes/design-system/screenshots/phase4-*`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 5: States and guard

### Overview

A dev-only kitchen sink shows the 7-state matrix in light and dark; the UI rule, the literal-scan script and the CI steps keep the next agent on the contract.

### Changes Required:

#### 1. Dev-only route switch

**File**: `frontend/src/app/dev/dev-routes.ts` (new), `frontend/src/app/dev/dev-routes.development.ts` (new), `frontend/src/app/app.routes.ts`, `frontend/angular.json`

**Intent**: Register the kitchen sink only in development builds, so it never ships to production.

**Contract**: `dev-routes.ts` exports `devRoutes: Routes = []`; `dev-routes.development.ts` exports `devRoutes` with `{ path: 'dev/kitchen-sink', loadComponent: … }`. `angular.json` `build.configurations.development.fileReplacements` replaces the first with the second. `app.routes.ts` spreads `...devRoutes` at the top, before the guarded shell and the `**` redirect; no guard on the dev route (works without login or backend). Exempt from the mockup rule.

#### 2. Kitchen sink

**File**: `frontend/src/app/dev/kitchen-sink.ts` (new, selector `app-kitchen-sink`)

**Intent**: One page showing every state of the components in use, as the visual gate and review evidence.

**Contract**: sections, each labelled with the state name:
- default — `hlmBtn` variants (default, outline, secondary, ghost, destructive, link), a field with label + input + description, a card, plus any extra component from `mockup-review.md`;
- hover / focus-visible — the same controls with a caption telling the reviewer to hover and Tab (not static);
- disabled — disabled button and disabled input;
- error — a field whose control is pre-touched and invalid (shows `<hlm-field-error>`) and a destructive `hlmAlert`;
- loading — a disabled button with `<hlm-spinner />` and pending text;
- empty — shown as "N/A: no data-driven view in this change; S-02 adds the `empty` component".
Built only from helm components and semantic classes (passes `lint:ui`). A Light/Dark toggle at the top (an `hlmBtn`) adds/removes the `dark` class on `document.documentElement` and removes it when the component is destroyed, so leaving the page never leaves the app dark. This toggle is a dev preview, not the future app feature.

#### 3. Literal-scan script

**File**: `frontend/scripts/check-ui-literals.mjs` (new), `frontend/package.json`

**Intent**: Turn the `/10x-ui` hardcoded-value scan into a cross-platform check (npm scripts run under cmd.exe on Windows, so no `grep`).

**Contract**: `npm run lint:ui` → `node scripts/check-ui-literals.mjs`. Scans `src/app/**/*.{html,ts,css}` except `*.spec.ts`, using the `/10x-ui` regex (hex, `rgb(a)`, `hsl(a)`, `oklch(`, arbitrary `-[Npx|rem]`, Tailwind palette classes) plus any arbitrary-value utility `\b[a-z][a-z0-9-]*-\[[^\]]+\]` (`w-[50%]`, `bg-[var(--x)]`, `h-[calc(…)]`) plus `\bdark:` (dark mode belongs to the token layer; `libs/ui` is not scanned, its own `dark:` variants are fine). Lines containing `ui-literals-ignore` are skipped. Prints `file:line: match` per hit, exits 1 on any hit. Node built-ins only; no new dependency.

#### 4. CI

**File**: `.github/workflows/test.yml`

**Intent**: Make lint and the literal scan fail the PR, not just the review.

**Contract**: frontend job gains `npm run lint` and `npm run lint:ui` steps after `npm ci`, alongside the existing `npm test -- --watch=false`.

#### 5. UI rule (tokens and components)

**File**: `CLAUDE.md` (the `## UI` section created in Phase 3)

**Intent**: Tell the next agent where the contract lives, next to the mockup rule.

**Contract**: bullets added after the mockup bullets: tokens live in `frontend/src/styles.css` (spartan `nova` + `neutral`; values in `:root`, published via `@theme inline`) — use semantic classes (`bg-primary`, `text-muted-foreground`, `border-border`…), never literal colours, palette classes or arbitrary values in `src/app` (`npm run lint:ui` enforces); components live in `frontend/libs/ui` (import `@spartan-ng/helm/<name>`) — check there first, add missing ones only via `npx ng g @spartan-ng/cli:ui <name>` from `frontend/`, never hand-roll a button/input/card, never run `ui-theme`; helm files are ours but edited deliberately; dark mode lives only in the token layer — no `dark:` classes in `src/app`, and every new token (e.g. `--warning`) is defined in both `:root` and `:root.dark` and published via `@theme inline` as `var(--…)`, never a raw value; enabling dark mode = toggling the `dark` class on `<html>`; forms: `<hlm-field-error>` shows on touched — call `markAllAsTouched()` on submit; icons: `@ng-icons/lucide` + `provideIcons`, `@ng-icons/*` pinned `<34` while on Angular 21; Vitest/jsdom lacks `matchMedia`/`ResizeObserver` — add `setupFiles` stubs before using sonner/tabs/sidebar/resizable; new component states go into the kitchen sink at `/dev/kitchen-sink` (`ng serve` only).

### Success Criteria:

#### Automated Verification:

- Literal scan passes: `npm run lint:ui`
- Literal scan fails on planted literals (temporarily add `class="bg-blue-500"`, then `class="w-[50%]"` to a view, expect exit 1 each time, revert)
- Literal scan fails on a planted dark variant (temporarily add `class="dark:bg-card"` to a view, expect exit 1, revert)
- Lint and tests pass: `npm run lint` and `npm test -- --watch=false`
- Production bundle has no kitchen sink: `npm run build`, then no `kitchen` match in `frontend/dist/` (Bash `grep -ri`)
- `CLAUDE.md` UI section sits outside the `@przeprogramowani/10x-cli` markers and states the mockup rule, the token/component rule and the dark-mode token-layer rule
- Final clean-install run: `npm ci && npm run build && npm test -- --watch=false && npm run lint && npm run lint:ui`

#### Manual Verification:

- `/dev/kitchen-sink` opens in `ng serve` without logging in; every matrix cell is shown or marked N/A with a reason
- Hover changes and keyboard focus ring are visible on every control in the kitchen sink
- Dark preview: with the toggle on, every matrix cell is readable (text, borders, focus ring, destructive error, disabled) with no light-only surfaces; navigating away from the kitchen sink returns the app to light
- Kitchen sink screenshots at 1440px and 390px in light, plus 1440px in dark, saved to `context/changes/design-system/screenshots/kitchen-sink-*`
- CI run on the PR is green with the new lint steps

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Existing login/register/guard/interceptor/service specs keep passing; only the two class selectors in `register.spec.ts` and the two `[role="alert"]` selectors (`login.spec.ts:84`, `register.spec.ts:93`) change (plus copy assertions if a mockup decision changed copy).
- New: login submit shows `hlm-spinner` inside the disabled submit button while the request is pending.
- `register.spec.ts` field-error test keeps proving that `#register-password-error` shows the min-length message after blur (touched).

### Integration Tests:

- None added; the auth flow end to end is unchanged (backend untouched).

### Manual Testing Steps:

1. Ask the agent to plan a view for an unregistered route: it must answer `BRAK MAKIETY` and stop.
2. `ng serve` + backend: register with a too-short password (field error), then a valid one; log out; log in with a wrong password (alert), then correctly.
3. Compare login, register and shell side by side with their frames at 1440px and 390px.
4. Tab through login and register: focus ring visible on inputs, button and link.
5. Open `/dev/kitchen-sink` logged out; walk every matrix cell; hover and Tab through; switch to Dark and repeat; navigate to `/login` and confirm it is light.

## Performance Considerations

`@angular/cdk` and spartan brain add to the initial bundle; the 500 kB warning / 1 MB error budget in `angular.json` stays as is. A budget warning is acceptable and noted in the phase commit; an error is not.

## Migration Notes

The old tokens `--color-*`, `--focus-ring` and the global classes are removed outright (Phases 2 and 4); nothing outside `frontend/src` consumes them. Rollback is a revert of the phase commits followed by `npm ci`.

## References

- Research: `context/changes/design-system/research.md`
- spartan reference (corrected in Phase 1): `context/changes/design-system/spartan-docs.md`
- UI contract: `.claude/skills/10x-ui/SKILL.md` (Router, Definition of done, Visual gate, Make it stick)
- Figma MCP plans and limits: https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions , https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- spartan Figma kit: https://spartan.ng/documentation/figma
- Current tokens and global classes: `frontend/src/styles.scss:3-203`
- Test selectors to change: `frontend/src/app/auth/register/register.spec.ts:59,69`
- CLI config defaults: `frontend/node_modules/@spartan-ng/cli/src/utils/config.js:15-24`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Environment and library

#### Automated

- [x] 1.1 Clean install succeeds and leaves no extraneous packages: `npm ci && npm ls --depth=0` (in `frontend/`) — 301b611
- [x] 1.2 Production build passes: `npm run build` — 301b611
- [x] 1.3 Unit tests pass: `npm test -- --watch=false` — 301b611
- [x] 1.4 Lint passes: `npm run lint` — 301b611
- [x] 1.5 No `.scss` files remain under `frontend/src` — 301b611
- [x] 1.6 `styles.css` contains exactly one generated `:root` theme block (no duplicate from `ui-theme`) — 301b611

#### Manual

- [x] 1.7 Login, register and the logged-in shell keep the same layout and colours as before the phase (ng serve); known Tailwind preflight differences (headings no longer bold, links without underline) are accepted until Phase 4 — 301b611

### Phase 2: Tokens — one source of values

#### Automated

- [x] 2.1 Production build passes: `npm run build` — db46fe5
- [x] 2.2 Unit tests pass: `npm test -- --watch=false` — db46fe5
- [x] 2.3 No `--color-` custom properties or `--focus-ring` remain in `src/styles.css` and `src/app/**` (Bash `grep`) — db46fe5
- [x] 2.4 Hardcoded-value scan from `/10x-ui` on the view files (`login.html`, `register.html`, `shell.html`, `shell.css`, `home.ts`) returns 0 hits — db46fe5

#### Manual

- [x] 2.5 Login, register and shell render in the neutral palette (near-black primary button, neutral grey borders) with readable contrast and visible keyboard focus on inputs and buttons — db46fe5
- [ ] 2.6 Screenshots of login at desktop (1440px) and mobile (390px) saved to `context/changes/design-system/screenshots/phase2-*`

### Phase 3: Mockup gate

#### Automated

- [x] 3.1 `context/design/mockups.md` has rows for `/login`, `/register` and `/`, each with a desktop and a mobile link containing `node-id=` (Bash `grep`) — f210a07
- [x] 3.2 `CLAUDE.md` contains `BRAK MAKIETY` and `BRAK DOSTĘPU DO MAKIETY` in a `## UI` section outside the `@przeprogramowani/10x-cli` markers — f210a07

#### Manual

- [x] 3.3 The user designed desktop (1440px) and mobile (390px) frames for login, register and shell + home on the spartan kit (style `nova`, theme `neutral`) and registered them
- [x] 3.4 The agent read all six frames through Figma MCP and `mockup-review.md` covers each of them
- [x] 3.5 Every discrepancy in `mockup-review.md` has a recorded user decision
- [x] 3.6 Negative check: asked to plan a view for a route that is not in the registry, the agent answers `BRAK MAKIETY: …` and stops — f210a07
- [ ] 3.7 Figma PAT rotated (new token with `file_content:read` + `file_metadata:read` only); Figma MCP still reads a frame

### Phase 4: Views on helm components, per mockup

#### Automated

- [x] 4.1 Production build passes: `npm run build`
- [x] 4.2 Unit tests pass, including the new login spinner test: `npm test -- --watch=false`
- [x] 4.3 Lint passes: `npm run lint`
- [x] 4.4 Hardcoded-value scan from `/10x-ui` on `src/app/**/*.{html,ts,css}` (excluding `*.spec.ts`) returns 0 hits
- [x] 4.5 `src/styles.css` contains none of `.btn`, `.field`, `.form-error`, `.auth-card` (Bash `grep`)

#### Manual

- [x] 4.6 Login, register and shell + home match their mockup frames at 1440px and 390px; every visible difference is one recorded in `mockup-review.md`
- [x] 4.7 Login and register: field error, server error alert and disabled/pending submit work; Tab order and focus ring visible on every control
- [x] 4.8 Logged-in shell: logout works; e-mail truncates on mobile
- [ ] 4.9 Screenshots of login, register (with a field error) and shell at 1440px and 390px saved to `context/changes/design-system/screenshots/phase4-*`

### Phase 5: States and guard

#### Automated

- [ ] 5.1 Literal scan passes: `npm run lint:ui`
- [ ] 5.2 Literal scan fails on planted literals (temporarily add `class="bg-blue-500"`, then `class="w-[50%]"` to a view, expect exit 1 each time, revert)
- [ ] 5.3 Literal scan fails on a planted dark variant (temporarily add `class="dark:bg-card"` to a view, expect exit 1, revert)
- [ ] 5.4 Lint and tests pass: `npm run lint` and `npm test -- --watch=false`
- [ ] 5.5 Production bundle has no kitchen sink: `npm run build`, then no `kitchen` match in `frontend/dist/` (Bash `grep -ri`)
- [ ] 5.6 `CLAUDE.md` UI section sits outside the `@przeprogramowani/10x-cli` markers and states the mockup rule, the token/component rule and the dark-mode token-layer rule
- [ ] 5.7 Final clean-install run: `npm ci && npm run build && npm test -- --watch=false && npm run lint && npm run lint:ui`

#### Manual

- [ ] 5.8 `/dev/kitchen-sink` opens in `ng serve` without logging in; every matrix cell is shown or marked N/A with a reason
- [ ] 5.9 Hover changes and keyboard focus ring are visible on every control in the kitchen sink
- [ ] 5.10 Dark preview: with the toggle on, every matrix cell is readable (text, borders, focus ring, destructive error, disabled) with no light-only surfaces; navigating away from the kitchen sink returns the app to light
- [ ] 5.11 Kitchen sink screenshots at 1440px and 390px in light, plus 1440px in dark, saved to `context/changes/design-system/screenshots/kitchen-sink-*`
- [ ] 5.12 CI run on the PR is green with the new lint steps
