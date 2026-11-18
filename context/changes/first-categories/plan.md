# First Categories (S-02) Implementation Plan

## Overview

Roadmap S-02 (PRD FR-003, FR-004, FR-017): a signed-in user can define their own categories, each either **przepływowa** (flow, per month) or **narastająca** (cumulative, carried over month to month). A user with no categories sees an explanation with examples that the system never creates for them. This slice adds the first domain table (`categories`, owner-scoped), `GET`/`POST /api/categories`, the `/categories` screen built to the Figma frames, and a "Kategorie" navigation item in the shared shell.

## Current State Analysis

- **Backend:** one feature package, `account/`, with entity + repository + service + controller + request/response records. No Lombok. Errors go through `config/ApiExceptionHandler` as RFC 9457 `ProblemDetail`: 400 with `errors{field: message}`, and 409 with `detail` from the exception message. Duplicate email is detected by a pre-check plus a catch of `DataIntegrityViolationException` on the named index `users_email_uk` (race-safe). `/api/**` is already `authenticated()`, and mutating requests need the `XSRF-TOKEN` cookie plus the `X-XSRF-TOKEN` header. Migrations are `V1`, `V2`, so the next one is **`V3`**. Tests use Testcontainers Postgres 16, `TestAccounts.create()` and `TestAccounts.as(principal)`.
- **Owner-scoping rule** (`context/foundation/lessons.md`): `owner_id uuid not null references users(id)`, with an index whose first column is `owner_id`. Repository methods take `UUID ownerId`. The owner comes only from `CurrentUser.id()`. A foreign or missing resource gets 404. Each slice adds a cross-account test.
- **Frontend:** the shell (`src/app/shell/shell.html`) has a header with brand, e-mail and "Wyloguj", and no navigation and no `RouterLink`. Routes are lazy `loadComponent` children of the shell under `authGuard`. Services use `HttpClient` + `firstValueFrom` + signals, and forms are reactive (`NonNullableFormBuilder`). Server errors become one string in a destructive `hlmAlert` (`auth/auth-helpers.ts`). The global 401 interceptor already covers data endpoints. `libs/ui` has `alert, button, card, field, input, label, separator, spinner` and no `badge`, `radio-group` or `item`. The kitchen sink (`src/app/dev/kitchen-sink.ts`) is organised by state, and its `empty` section is a placeholder pointing at S-02.
- **Mockups:** registry rows exist for **Kategorie** (`/categories`) and the updated **Shell + home** (`/`) in `context/design/mockups.md`. The frames are read once, in `context/changes/first-categories/mockup-review.md` (raw: `figma-raw/categories-page-2029-1643-v2.txt`, the latest read after the mobile nav was redrawn). **Do not re-read Figma** unless a frame changes, because the account hits API rate limits.

## Desired End State

- After signing in, the header shows **Kategorie** on desktop (between "PennyPlan" and the e-mail). On mobile it appears in an **app footer** at the bottom. It is always a Button `outline`; on `/categories` it also has `bg-accent` and `aria-current="page"`.
- `/` still shows the "Witaj w PennyPlan" placeholder, unchanged.
- `/categories` with no categories shows frame A: an empty-state Card with the two type sections, the non-clickable examples, and the footer "To tylko przykłady – nic nie tworzymy za Ciebie." next to the "Nowa kategoria" form (desktop), or below it (mobile).
- Adding "Wakacje" + Narastająca clears the form (type back to Przepływowa, focus back on Nazwa) and switches to frame C: the groups "Przepływowe · n" / "Narastające · n", sorted alphabetically with Polish collation, each row an Item with a type Badge.
- Adding "wakacje" again shows the field error "Masz już kategorię o tej nazwie." under Nazwa (frame D). An empty name gives "Podaj nazwę kategorii."; more than 40 characters gives "Nazwa może mieć najwyżej 40 znaków.".
- A second account never sees the first account's categories and can use the same names.
- Verified by backend tests, Vitest specs, `lint`/`lint:ui`, and screenshots compared to the frames.

### Key Discoveries:

- Duplicate pattern to mirror: `backend/src/main/java/com/homebudget/account/AccountService.java:26-39` (pre-check + catch on the index name) and `config/ApiExceptionHandler.java:40-43` (409 handler).
- Request record + Bean Validation style: `account/RegisterRequest.java:8-10`. Response record + static factory: `account/AccountResponse.java:5-9`. Entity style (explicit `@Column`, protected no-arg ctor, getters only, `@GeneratedValue(strategy = UUID)`): `account/Account.java:16-57`.
- Isolation test template: `backend/src/test/java/com/homebudget/account/AccountIsolationTests.java`. 409/400 assertions: `account/AuthFlowTests.java:71-92`.
- Form/pending/error pattern: `frontend/src/app/auth/register/register.ts:37-62` + `register.html`. `hlm-field-error` shows itself from its field's control state (`libs/ui/field/src/lib/hlm-field-error.ts:55-58`).
- Spec pattern: `auth/register/register.spec.ts` (`RouterTestingHarness`, `HttpTestingController`, `vi.waitFor`).
- Spartan gotcha (`context/changes/design-system/spartan-docs.md` §5.3): `hlm-field-error` inside a `fieldset` collapses radios in Chrome. Render any error as a sibling of the fieldset. The type has a default and needs no error.
- `home.ts:3` says "S-02 replaces it with the category empty state". This is now false (decision: home stays). Fix the comment.

## What We're NOT Doing

- Rename, archive or delete of categories, row actions or "⋯" menus (S-08). No `GET/PUT/DELETE /api/categories/{id}`.
- Changing a category's type after creation (no FR).
- Amounts, balances, percentages or cumulative sums (S-03, S-05).
- Any "add examples" / "create all" button. Examples are plain text (PRD FR-017).
- Category icons, colours, descriptions or ordering. The `spartan empty` component (the mockup uses a Card).
- A "Zarządzaj kategoriami" button in the home body. The new home frames show only the nav item.
- Redirecting `/` to `/categories`. Home stays the placeholder until the budget view exists.
- Collapsing internal whitespace in names. Only leading/trailing whitespace is trimmed.
- Toasts after creating. No limit on the number of categories.

## Implementation Approach

Bottom-up and each phase verifiable on its own. Phase 1 is the API with tests (no UI). Phase 2 is the three missing kit components, proven in the kitchen sink. Phase 3 is the screen and the shell nav, built only from the frames read in `mockup-review.md` and the kit. Uniqueness is case-insensitive, enforced by a DB unique index `(owner_id, lower(name))` (authoritative, race-safe), plus a service pre-check that gives a friendly 409. The frontend shows the 409 as a field error (frame D), not as the auth-style Alert.

## Critical Implementation Details

- **Trim before validating:** the request record trims `name` in its compact constructor, so `@NotBlank`/`@Size(max = 40)` see the trimmed value and the DB stores it. The frontend applies the same rule (`trim()` before submit; the max-length check runs on the trimmed value) so client and server agree on "40 characters".
- **Nav variant deviates from the frames on purpose:** the frames draw the active item as `ghost` State=hover. The agreed rule is always `outline`, with `bg-accent` on the active route (see `mockup-review.md`, Shell section). Do not "fix" it back to ghost.
- **Server field error lifecycle:** on 409, set an error key (e.g. `taken`) on the `name` control and mark it touched, so `hlm-field-error` shows it. The next edit of the field clears it (validators re-run on value change). Server errors other than 409/400 go to a destructive Alert at the top of the form card (state without a mockup).

---

## Phase 1: Categories API

### Overview

First domain table and owner-scoped endpoints to list and create categories, with validation, a case-insensitive uniqueness conflict, and cross-account isolation tests.

### Changes Required:

#### 1. Migration

**File**: `backend/src/main/resources/db/migration/V3__categories.sql`

**Intent**: Create the `categories` table owned by a user, with a type restricted to the two kinds and per-account case-insensitive unique names.

**Contract**: `categories(id uuid primary key, owner_id uuid not null references users(id), name varchar(40) not null, kind varchar(16) not null check (kind in ('FLOW','CUMULATIVE')), created_at timestamptz not null default now())`. Unique index `categories_owner_name_uk on categories (owner_id, lower(name))`. Its first column is `owner_id`, which satisfies the owner-index rule. No DB default for `id` (Hibernate generates the UUID, as for `users`).

#### 2. Domain package

**File**: `backend/src/main/java/com/homebudget/category/` (`Category`, `CategoryKind`, `CategoryRepository`, `CategoryService`, `CategoryController`, `CreateCategoryRequest`, `CategoryResponse`, `CategoryNameTakenException`)

**Intent**: Follow the `account/` layout. The entity maps the table, with `kind` as `@Enumerated(EnumType.STRING)`. The service creates and lists for an owner. The controller exposes the two endpoints and takes the owner only from `CurrentUser.id()`.

**Contract**:
- `enum CategoryKind { FLOW, CUMULATIVE }` (JSON values `"FLOW"`, `"CUMULATIVE"`).
- `CategoryRepository extends JpaRepository<Category, UUID>`: `List<Category> findAllByOwnerId(UUID ownerId)` and `boolean existsByOwnerIdAndNameIgnoreCase(UUID ownerId, String name)`. Controllers and services never call the unscoped inherited methods.
- `record CreateCategoryRequest(@NotBlank(message = "Podaj nazwę kategorii.") @Size(max = 40, message = "Nazwa może mieć najwyżej 40 znaków.") String name, @NotNull CategoryKind kind)`. The compact constructor strips `name` (null-safe). The Polish messages match the frontend copy, because the UI can show a 400 field message in its Alert.
- `record CategoryResponse(UUID id, String name, CategoryKind kind)` with a static `of(Category)`.
- `GET /api/categories` → 200 `CategoryResponse[]` for the current owner only, order unspecified (the client sorts).
- `POST /api/categories` → 201 `CategoryResponse`. Duplicate (case-insensitive, same owner) → `CategoryNameTakenException` → 409 `detail` "Masz już kategorię o tej nazwie.". Detected by the pre-check, and by catching `DataIntegrityViolationException` whose most specific cause mentions `categories_owner_name_uk` (other integrity errors are rethrown). `create` calls `saveAndFlush` inside the `try`, and `CategoryService` is not `@Transactional` (as in `AccountService`). Otherwise the INSERT is deferred to commit, outside the `catch`, and a concurrent duplicate returns 500.
- Invalid body (blank or too-long name, missing or unknown kind) → 400 via the existing handlers.

#### 3. Exception handler

**File**: `backend/src/main/java/com/homebudget/config/ApiExceptionHandler.java`

**Intent**: Map `CategoryNameTakenException` to 409 with its message as `detail`, like `EmailAlreadyTakenException`.

**Contract**: new `@ExceptionHandler(CategoryNameTakenException.class)` → `ProblemDetail.forStatusAndDetail(CONFLICT, message)`.

#### 4. Contract surfaces

**File**: `docs/reference/contract-surfaces.md`

**Intent**: Record the new load-bearing names so later plans see them.

**Contract**: append H2 `/api/categories` (GET/POST shapes, 201/400/409, `kind` values `FLOW`/`CUMULATIVE`; consumer: Angular `CategoriesService`) and H2 `categories` (table, `categories_owner_name_uk` on `(owner_id, lower(name))`; defined in `V3__categories.sql`). In `owner_id`, set "Defined in" to `V3__categories.sql` (first applied).

#### 5. Tests

**File**: `backend/src/test/java/com/homebudget/category/CategoryApiTests.java`, `backend/src/test/java/com/homebudget/category/CategoryIsolationTests.java`

**Intent**: Prove the contract and the owner-scoping rule from `lessons.md`, using `TestAccounts.as(...)` (never Spring's `csrf()`).

**Contract** (named tests):
- create returns 201 with the trimmed name and kind; list then contains it.
- empty list for a fresh account returns `[]`.
- duplicate in another letter case ("Wakacje" then " wakacje ") → 409 with `$.detail` "Masz już kategorię o tej nazwie.".
- blank name, name of 41 characters after trimming, missing kind → 400 with `$.errors.name` / `$.errors.kind`. Unknown kind → 400, status only: Jackson rejects it before validation, so there is no `errors` map. A 40-character name padded with spaces → 201.
- unauthenticated GET → 401. POST without the CSRF header → 403.
- isolation: A creates categories, and B's `GET` does not contain any of them. A and B can both create "Wakacje" (201 each).

### Success Criteria:

#### Automated Verification:

- Backend tests pass (incl. new category tests): `cd backend && ./mvnw test`
- Formatting is clean: `cd backend && ./mvnw spotless:check`

#### Manual Verification:

- With the app running against local Postgres, `V3` applies on startup and `\d categories` shows the unique index `categories_owner_name_uk` on `(owner_id, lower(name))`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: UI kit — badge, radio-group, item

### Overview

Add the three helm components the frames use, through the spartan CLI only, and show their states in the kitchen sink.

### Changes Required:

#### 1. Helm components

**File**: `frontend/libs/ui/badge/`, `frontend/libs/ui/radio-group/`, `frontend/libs/ui/item/`, `frontend/tsconfig.json`

**Intent**: Generate with `npx ng g @spartan-ng/cli:ui badge`, `… radio-group`, `… item` from `frontend/` (CLI 1.9.0, style `nova`). Don't hand-roll and don't run `ui-theme`. Don't hand-edit the generated helm files.

**Contract**: imports `@spartan-ng/helm/badge`, `@spartan-ng/helm/radio-group`, `@spartan-ng/helm/item` resolve. Add `tsconfig.json` `paths` entries if the CLI doesn't. Any added `@spartan-ng/brain` sub-entry or dependency stays on 1.9.0. `@ng-icons/*` stays `<34`.

#### 2. Kitchen sink

**File**: `frontend/src/app/dev/kitchen-sink.ts`

**Intent**: Add the new components to the existing state sections. **default:** Badge `secondary` + `outline`, Radio Group with two options and descriptions (first checked), an Item row (size xs, title + Badge in actions). **hover / focus-visible:** radio focus ring. **disabled:** a disabled radio option. Replace the `empty` placeholder text: S-02's empty state is a Card per the mockup, not the `empty` component (link `/categories`).

**Contract**: sections keep the `ks-<state>` ids. Only tokens and helm classes (`npm run lint:ui`).

### Success Criteria:

#### Automated Verification:

- Build passes: `cd frontend && npm run build`
- Tests pass: `cd frontend && npm test -- --watch=false`
- Lint passes: `cd frontend && npm run lint`
- UI literal guard passes: `cd frontend && npm run lint:ui`

#### Manual Verification:

- `/dev/kitchen-sink` (via `ng serve`) shows Badge, Radio Group and Item in light and dark preview, and the radio group is keyboard-operable (arrows switch, focus ring visible)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Kategorie screen and shell navigation

### Overview

The `/categories` screen per frames A–D (desktop + mobile), its states without mockups, and the "Kategorie" navigation item in the shell (desktop header, mobile footer). Source of truth: `context/changes/first-categories/mockup-review.md`. No Figma reads unless a frame changes.

### Changes Required:

#### 1. Categories data service

**File**: `frontend/src/app/categories/categories.service.ts` (+ `.spec.ts`)

**Intent**: Thin `providedIn: 'root'` service over `HttpClient` in the `AuthService` style (`firstValueFrom`, async methods).

**Contract**: `type CategoryKind = 'FLOW' | 'CUMULATIVE'`; `interface Category { id: string; name: string; kind: CategoryKind }`; `list(): Promise<Category[]>` (`GET /api/categories`); `create(name: string, kind: CategoryKind): Promise<Category>` (`POST /api/categories`).

#### 2. Route

**File**: `frontend/src/app/app.routes.ts`

**Intent**: Add a lazy `categories` child under the shell route (behind `authGuard`). `/` stays the home placeholder.

**Contract**: `{ path: 'categories', loadComponent: () => import('./categories/categories').then((m) => m.Categories) }`.

#### 3. Categories screen

**File**: `frontend/src/app/categories/categories.ts`, `categories.html` (+ `categories.spec.ts`)

**Intent**: Build frames A/B/C/D from `mockup-review.md`, with exact copy, sizes, gaps and component variants. Use helm components only: Card, Field/FieldSet/Label, Input, Radio Group, Button, Badge, Item, Separator, Alert, Spinner.

**Contract**:
- Page header: `Kategorie` (`text-2xl` mobile / `text-3xl` desktop, semibold) + muted subtitle "Kategorie to koperty, na które dzielisz każdy dochód.".
- Layout: desktop is two columns (gap 32px) with the content filling the left and the form card fixed at 380px on the right. Mobile is one column (gap 24px), form first.
- Form card "Nowa kategoria": reactive form `{ name: ['', [required, trimmed max 40]], kind: ['FLOW'] }`. Nazwa has no placeholder. The type is a Radio Group in a FieldSet (Przepływowa "Na bieżący miesiąc. Co niewydane, nie przechodzi dalej." / Narastająca "Zbiera się z miesiąca na miesiąc, aż ją wydasz."). Full-width "Dodaj kategorię". Field errors: required → "Podaj nazwę kategorii.", too long → "Nazwa może mieć najwyżej 40 znaków.", 409 → "Masz już kategorię o tej nazwie." (control error, touched). On submit: `markAllAsTouched()` if invalid.
- Empty state (0 categories, frame A): Card with title, muted description, and two sections (Badge `secondary` "Przepływowa": Życie i rachunki · Jedzenie na mieście · Przyjemności; Badge `outline` "Narastająca": Wakacje · Opłaty roczne · Oszczędności). Side by side on desktop, stacked on mobile. Examples are plain non-interactive text. Muted footer "To tylko przykłady – nic nie tworzymy za Ciebie.".
- List (≥1 category, frame C): no Card. Groups "Przepływowe · n" and "Narastające · n" (`text-sm font-semibold`). A group with 0 items is hidden. Rows are `hlmItem` size xs at 44px height: name `text-sm font-medium` + type Badge in item actions (`secondary` for FLOW, `outline` for CUMULATIVE), with a Separator between rows. Names sorted with `Intl.Collator('pl')`. Rows are not clickable (no hover, no chevron).
- States without mockups: **loading** (Spinner in the left column, form usable immediately); **list load error** (destructive Alert "Nie udało się wczytać kategorii. Odśwież stronę." in the left column); **saving** (button disabled + Spinner + "Dodawanie…"); **server error on save** (destructive Alert at the top of the form card, text from `authErrorMessage(err, {})` in `auth/auth-helpers.ts`, reused as is: 0 → network message, 400 → first field message); **success** (new item merged into local state without a refetch, form reset to `{ name: '', kind: 'FLOW' }` and untouched, focus on Nazwa, no toast).
- **Create vs. list load:** the `GET` result is merged into local state by `id` and never replaces it. A category created before the list arrives therefore stays and is not shown twice. After a list load error, the left column keeps the Alert, and a created category does not switch it to frame C (the list is known to be incomplete). Each case gets one spec.

#### 4. Shell navigation

**File**: `frontend/src/app/shell/shell.ts`, `frontend/src/app/shell/shell.html` (+ shell spec, new or extended)

**Intent**: Add the "Kategorie" nav item per the Shell + home and Kategorie frames.

**Contract**:
- Desktop (`md+`): a `<nav>` in the header row between "PennyPlan" and the e-mail. Mobile: hidden in the header and shown in an app footer after `<main>`, with a Separator on top, padding 16px and gap 12px. It sits at the bottom of the viewport through the existing `min-h-dvh flex-col` and is not `position: fixed`. Hidden on `md+`.
- Item: `<a hlmBtn variant="outline" routerLink="/categories" routerLinkActive="bg-accent" ariaCurrentWhenActive="page">Kategorie</a>`. Import `RouterLink`, `RouterLinkActive`.

#### 5. Home comment

**File**: `frontend/src/app/home/home.ts`

**Intent**: Correct the doc comment. Home stays a placeholder and the budget view will replace it later. The template doesn't change.

**Contract**: comment only.

#### 6. Screenshots

**File**: `context/changes/first-categories/screenshots/`

**Intent**: Visual gate against the frames at 1440×900 and 390×844, in light mode.

**Contract**: `phase3-categories-empty-{desktop,mobile}.png` (A), `phase3-categories-filled-form-desktop.png` (B), `phase3-categories-list-{desktop,mobile}.png` (C), `phase3-categories-duplicate-desktop.png` (D), `phase3-home-{desktop,mobile}.png` (shell nav inactive).

### Success Criteria:

#### Automated Verification:

- Build passes: `cd frontend && npm run build`
- Tests pass (service, screen: empty/list/grouping+pl sort/409 field error/400/required/trim+40/reset+focus after success/load error; shell: active link + aria-current): `cd frontend && npm test -- --watch=false`
- Lint passes: `cd frontend && npm run lint`
- UI literal guard passes: `cd frontend && npm run lint:ui`
- Backend still green: `cd backend && ./mvnw test`

#### Manual Verification:

- Screenshots for frames A, B, C, D and home (desktop + mobile where drawn) saved in `context/changes/first-categories/screenshots/` and match the frames (spacing, variants, copy), except the agreed outline nav variant
- End-to-end on `ng serve` + backend: new account → Kategorie → empty state → add "Wakacje" (Narastająca) → list appears, form resets, focus on Nazwa → add "wakacje" → field error
- Second account in another browser sees an empty state, and can add "Wakacje"
- Keyboard only (desktop): tab order Kategorie → Wyloguj → Nazwa → radio group (arrows) → Dodaj kategorię, focus ring visible everywhere

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Frontend service: correct method and URL for list and create, body `{ name, kind }`.
- Screen: grouping by kind, Polish collation ("Łódź" after "Lody"), hidden empty group, 409 → field error that clears on edit, 400 → message, network failure → Alert, trimmed length validation, reset + focus after success.
- Shell: the link gets `bg-accent` and `aria-current="page"` on `/categories` only.

### Integration Tests:

- Backend MockMvc + Testcontainers: create/list, validation, case-insensitive 409, auth (401) and CSRF (403), cross-account isolation and independent names.

### Manual Testing Steps:

1. Register a new account, click "Kategorie", see frame A.
2. Type "Wakacje", choose Narastająca (frame B), submit, and see the list (frame C) with the form reset.
3. Submit "wakacje" and see "Masz już kategorię o tej nazwie." under Nazwa (frame D). Edit the field and the error disappears.
4. Submit empty, then a 41-character name, and see the matching field errors.
5. Stop the backend and submit, and see the destructive Alert in the form card.
6. Check mobile at 390px: form above the content, nav in the footer.

## Implementation Deviations

Agreed during Phase 3 (2026-11-18); the Phase blocks above keep the original wording.

- **Kind kept after a create:** the form clears only `name` (`reset({ name: '', kind })`) and keeps the chosen kind, because categories are usually added in runs of one kind. Replaces "form reset to `{ name: '', kind: 'FLOW' }`" / "type back to Przepływowa". Not persisted across reloads.
- **Errors only after submit:** the screen provides its own `ErrorStateMatcher` (shows errors once "Dodaj kategorię" was clicked, reset after a successful create) instead of spartan's touched-based default. With the default, clicking a radio blurred Nazwa, its error appeared above the radios and the layout shift swallowed the click.
- **Active nav class is `bg-accent!`:** `routerLinkActive` adds the class without tailwind-merge, so a plain `bg-accent` competes with the outline variant's `bg-background`; the important modifier makes the active background win.

## Performance Considerations

None. The list is small and loaded once per visit. Creating merges locally without a refetch.

## Migration Notes

`V3` only adds a table. No data migration, and rolling back the code leaves an unused table.

## References

- Mockup read: `context/changes/first-categories/mockup-review.md` (raw: `figma-raw/categories-page-2029-1643-v2.txt`)
- Mockup brief: `context/changes/first-categories/mockup-brief.md`
- Registry: `context/design/mockups.md` (rows "Shell + home", "Kategorie")
- Owner-scoping rule: `context/foundation/lessons.md`
- Similar implementation: `backend/src/main/java/com/homebudget/account/AccountService.java:26-39`, `frontend/src/app/auth/register/register.ts:37-62`
- Spartan reference: `context/changes/design-system/spartan-docs.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Categories API

#### Automated

- [x] 1.1 Backend tests pass (incl. new category tests): `cd backend && ./mvnw test` — a076fa0
- [x] 1.2 Formatting is clean: `cd backend && ./mvnw spotless:check` — a076fa0

#### Manual

- [x] 1.3 With the app running against local Postgres, `V3` applies on startup and `\d categories` shows the unique index `categories_owner_name_uk` on `(owner_id, lower(name))` — a076fa0

### Phase 2: UI kit — badge, radio-group, item

#### Automated

- [x] 2.1 Build passes: `cd frontend && npm run build` — 606a994
- [x] 2.2 Tests pass: `cd frontend && npm test -- --watch=false` — 606a994
- [x] 2.3 Lint passes: `cd frontend && npm run lint` — 606a994
- [x] 2.4 UI literal guard passes: `cd frontend && npm run lint:ui` — 606a994

#### Manual

- [x] 2.5 `/dev/kitchen-sink` (via `ng serve`) shows Badge, Radio Group and Item in light and dark preview, and the radio group is keyboard-operable (arrows switch, focus ring visible) — 606a994

### Phase 3: Kategorie screen and shell navigation

#### Automated

- [x] 3.1 Build passes: `cd frontend && npm run build`
- [x] 3.2 Tests pass (service, screen: empty/list/grouping+pl sort/409 field error/400/required/trim+40/reset+focus after success/load error; shell: active link + aria-current): `cd frontend && npm test -- --watch=false`
- [x] 3.3 Lint passes: `cd frontend && npm run lint`
- [x] 3.4 UI literal guard passes: `cd frontend && npm run lint:ui`
- [x] 3.5 Backend still green: `cd backend && ./mvnw test`

#### Manual

- [x] 3.6 Screenshots for frames A, B, C, D and home (desktop + mobile where drawn) saved in `context/changes/first-categories/screenshots/` and match the frames (spacing, variants, copy), except the agreed outline nav variant
- [x] 3.7 End-to-end on `ng serve` + backend: new account → Kategorie → empty state → add "Wakacje" (Narastająca) → list appears, form resets, focus on Nazwa → add "wakacje" → field error
- [x] 3.8 Second account in another browser sees an empty state, and can add "Wakacje"
- [x] 3.9 Keyboard only (desktop): tab order Kategorie → Wyloguj → Nazwa → radio group (arrows) → Dodaj kategorię, focus ring visible everywhere
