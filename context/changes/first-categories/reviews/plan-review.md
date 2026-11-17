<!-- PLAN-REVIEW-REPORT -->
# Plan Review: First Categories (S-02) Implementation Plan

- **Plan**: context/changes/first-categories/plan.md
- **Mode**: Deep
- **Date**: 2026-11-17
- **Verdict**: SOUND (after fixes; was SOUND with minor warnings)
- **Findings**: 0 critical, 2 warnings, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding
10/10 paths ✓, 5/5 symbols ✓, brief↔plan ✓, Progress↔Phase ✓, contract surfaces reported correctly ✓

## Findings

### F1 — Race-safe 409 depends on saveAndFlush, which the plan doesn't name

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1 §2
- **Detail**: With a Hibernate-generated UUID, `save()` puts off the INSERT until commit, outside the `catch`. A concurrent duplicate then returns 500. `AccountService` works because it calls `saveAndFlush` and has no `@Transactional`.
- **Fix**: Name `saveAndFlush` inside the `try` and no `@Transactional` in the contract.
- **Decision**: FIXED

### F2 — Creating a category while the list is loading or after it failed is undecided

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 3 §3
- **Detail**: A late GET result can overwrite or duplicate a created item. After a load error, a created item would show frame C as if the list were complete.
- **Fix**: Merge the GET result into local state by id. After a load error, keep the Alert and don't switch to frame C. Add one spec for each case.
- **Decision**: FIXED

### F3 — Shape of the 400 response and what the UI shows for it are underspecified

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 §2/§5, Phase 3 §3
- **Detail**: An unknown kind returns a 400 with no `errors` map. Validation messages fall back to locale defaults. "authErrorMessage-style" is ambiguous.
- **Fix**: The unknown-kind test checks only the status. Add Polish `message=` to the annotations. Reuse `authErrorMessage(err, {})` as is.
- **Decision**: FIXED

### F4 — contract-surfaces.md is not updated with the new surfaces

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1
- **Detail**: `/api/categories` and `categories` are new surfaces. The `owner_id` "Defined in" entry is stale.
- **Fix**: New Phase 1 §4, which updates `docs/reference/contract-surfaces.md`.
- **Decision**: FIXED

### F5 — Manual keyboard check (3.9) leaves "Wyloguj" out of the tab order

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 3 Manual Verification / Progress 3.9
- **Detail**: The real desktop order is Kategorie → Wyloguj → Nazwa → radio → Dodaj kategorię.
- **Fix**: Correct the Phase 3 bullet and Progress 3.9.
- **Decision**: FIXED
