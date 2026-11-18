<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: First Categories (S-02)

- **Plan**: context/changes/first-categories/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-18
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

Notes: no DRIFT and nothing MISSING against Phases 1–3. The three agreed deviations (`## Implementation Deviations`) are implemented as described. No "What We're NOT Doing" limit was crossed. Owner scoping, CSRF tests, the V3 migration and the 409 race handling follow `lessons.md` and the `account/` pattern. Automated criteria were re-run on 2026-11-18 and all pass: backend `./mvnw test`, `spotless:check`, frontend build, tests (43), lint and `lint:ui`. Every manual row is `[x]`, and the screenshots are committed as evidence for 3.6.

## Findings

### F1 — Focus is lost after a failed submit

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: frontend/src/app/categories/categories.ts:141-148
- **Detail**: The submit button is disabled while saving (`[disabled]="pending()"`), and the browser drops focus from a button when it becomes disabled. Only the success path puts focus back on Nazwa. After a 409 (the error shows on Nazwa) or a 400/network error (Alert), keyboard and screen-reader users are left with focus on `<body>`, and the error is not announced.
- **Fix**: In the 409 branch, call `this.nameInput().nativeElement.focus()` after `setErrors`, and do the same in the Alert branch. Assert `document.activeElement` in the 409 spec.
- **Decision**: FIXED — focus returns to Nazwa in `finally` (every outcome); 409 spec asserts `document.activeElement`.

### F2 — Kitchen sink uses radio value `ACCUMULATING` instead of `CUMULATIVE`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: frontend/src/app/dev/kitchen-sink.ts:101, 166, 193
- **Detail**: The domain enum is `FLOW` / `CUMULATIVE`, but the dev-only kitchen sink uses `ACCUMULATING` (and ids `ks-*-accumulating`). There is no runtime impact, but anyone copying the snippet gets the wrong value.
- **Fix**: Rename the value and ids to `CUMULATIVE` / `ks-*-cumulative`.
- **Decision**: FIXED — value and ids renamed to `CUMULATIVE` / `ks-*-cumulative`.

### F3 — The pre-check uses `upper()` while the unique index uses `lower()`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: backend/src/main/java/com/homebudget/category/CategoryRepository.java:12
- **Detail**: Spring Data's `existsByOwnerIdAndNameIgnoreCase` generates `upper(name) = upper(?)`, but `categories_owner_name_uk` is on `lower(name)`. For rare Unicode (e.g. ß, İ) the two can disagree. The index is authoritative and the catch still turns a violation into a 409, so behaviour stays correct; only the pre-check predicate differs.
- **Fix**: Optional: replace it with `@Query("select count(c) > 0 from Category c where c.ownerId = :ownerId and lower(c.name) = lower(:name)")`.
- **Decision**: SKIPPED — behaviour already correct (index decides, catch returns 409).

### F4 — `authErrorMessage` is reused outside auth

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: frontend/src/app/categories/categories.ts:31,147
- **Detail**: The plan asks to reuse `authErrorMessage(err, {})` from `auth/auth-helpers.ts` as is. It is generic, but its name and location are auth-specific, and every data slice will import it.
- **Fix**: When the next slice reuses it, move it to a shared helper (e.g. `shared/api-error.ts` → `apiErrorMessage`).
- **Decision**: FIXED — moved to `frontend/src/app/shared/api-error.ts` as `apiErrorMessage`; login, register and categories import it; `safeReturnUrl` stays in `auth/auth-helpers.ts`.
