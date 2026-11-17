# First Categories (S-02) — Plan Brief

> Full plan: `context/changes/first-categories/plan.md`
> Mockup read: `context/changes/first-categories/mockup-review.md`

## What & Why

Roadmap S-02 (FR-003, FR-004, FR-017): a user defines their own categories ("envelopes") as **przepływowa** (per month) or **narastająca** (accumulates across months). A user with no categories sees an explanation with examples that the system deliberately does not create for them. The flow/cumulative distinction is the core of the pool mechanics that S-05/S-06 will compute on.

## Starting Point

S-01 delivered auth, `CurrentUser`, `TestAccounts`, and the owner-scoping rule in `lessons.md`. The design-system change delivered spartan tokens/helm components, the kitchen sink and the mockup gate. There is no domain table yet, the shell has no navigation, and `libs/ui` lacks badge, radio-group and item.

## Desired End State

A signed-in user reaches **Kategorie** from the header (desktop) or the app footer (mobile). They see the empty state with examples, add categories through the "Nowa kategoria" card, and see them grouped by type and sorted alphabetically. Duplicate names, in any letter case, get a field error. Accounts never see each other's categories. Home stays the placeholder.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Screen layout, copy, states | Frames A–D per `mockup-review.md` (form card 380px right / on top on mobile, groups, Item rows, Badge secondary/outline) | Mockup gate; read once, no re-reads. | Mockup brief + Figma |
| Home (`/`) | Unchanged placeholder; no CTA in the body | The new home frames show only the nav item; budget view will take home later. | Plan |
| Nav placement | Desktop: header between brand and e-mail; mobile: app footer at the bottom | Redrawn frames (home 2017-55, categories A/C) agree. | Figma (re-read) |
| Nav style | Always Button `outline`; active route + `bg-accent` + `aria-current` | Matches newest home frames; deliberate deviation from the `ghost` drawn on categories. | Plan |
| Name limit | 40 characters after trim | Fits rows and the S-03 split table without truncation. | Plan |
| Uniqueness | Per account, case-insensitive; DB index `(owner_id, lower(name))` + pre-check → 409 | Race-safe like `users_email_uk`; index starts with `owner_id` per lessons. | Plan / S-01 pattern |
| 409 in UI | Field error under Nazwa (frame D), not the auth-style Alert | That is what frame D shows. | Figma |
| List row | spartan `item` via CLI (+ `badge`, `radio-group`) | The frame uses Item; S-08 will add actions in the same slot. | Plan |
| Sorting | Client-side, `Intl.Collator('pl')` | Correct Polish order (Ł, Ż); API order unspecified. | Plan |
| Isolation | Cross-account list test + same name allowed in two accounts | Lessons rule; no by-id endpoint in this slice, so no 404 case yet. | lessons.md |

## Scope

**In scope:**
- `V3__categories.sql`, `category` package, `GET`/`POST /api/categories`, 400/409, API + isolation tests
- spartan `badge`, `radio-group`, `item` via CLI, kitchen sink states
- `/categories` screen (frames A–D + loading, load error, saving, server error, success reset), shell nav (header/footer), Vitest specs, screenshots
- Registry rows "Kategorie" and updated "Shell + home" (already added during planning)

**Out of scope:** rename, archive or delete, and by-id endpoints (S-08); changing the type; amounts and balances; "add examples" button; icons, colours, ordering; `empty` component; redirect from `/`; home CTA; whitespace collapsing; toasts.

## Architecture / Approach

Angular `Categories` component → `CategoriesService` (`HttpClient`, same-origin, XSRF cookie) → `CategoryController` (owner from `CurrentUser.id()`) → `CategoryService` (pre-check + catch on `categories_owner_name_uk`) → `CategoryRepository` (owner-scoped methods only) → `categories` table. Errors go through the existing `ApiExceptionHandler` (`ProblemDetail`). The screen merges a created item into local signal state, so no refetch is needed.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Categories API | Table, GET/POST, validation, 409, isolation tests | Forgetting owner-scoping or trim-before-validate |
| 2. UI kit | badge, radio-group, item in `libs/ui` + kitchen sink | CLI adding deps or paths outside the pinned versions |
| 3. Kategorie screen + nav | `/categories` per frames A–D, states, shell nav, specs, screenshots | Visual drift from the frames; radio group with reactive forms |

**Prerequisites:** S-01 done (it is, `impl_reviewed`); Docker for Testcontainers; local Postgres for manual checks.
**Estimated effort:** ~3 sessions, one per phase.

## Open Risks & Assumptions

- The Figma API is rate-limited on this account. The plan relies on the saved read (`figma-raw/…-v2.txt`), and a frame change needs a deliberate re-read.
- The mobile footer is placed at the bottom of the page flow, not fixed. The frames don't show scroll behaviour on long lists.
- The nav `outline` + accent active state is not drawn anywhere exactly. The screenshot comparison must allow for it.
- Names are case-insensitive via Postgres `lower()` and Hibernate `IgnoreCase` (`upper()`). They agree for Polish letters, and the DB index is the final arbiter.

## Success Criteria (Summary)

- A new user finds Kategorie, understands the two types from the empty state, and creates their own categories without the system creating any.
- Duplicates and invalid names are explained in place, and a second account never sees the first one's categories.
- The screen matches the frames on desktop and mobile using only kit tokens and components.
