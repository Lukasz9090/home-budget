<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Design System (spartan/ui) Implementation Plan

- **Plan**: context/changes/design-system/plan.md
- **Mode**: Deep
- **Date**: 2026-11-15
- **Verdict**: REVISE → SOUND after fixes
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
10/10 paths ✓, 6/6 symbols ✓ (init --theme enum includes neutral, FALLBACK_STYLE='vega', hlm-field-error display logic, spinner → @ng-icons/lucide, angular.json:14/26/33/80, `npm run lint` green), brief↔plan ✓, contract surfaces: 0 hits

## Findings

### F1 — Phase 4 test selectors hit the wrong (hidden) elements

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 4 §2 Login and register, §5 Tests
- **Detail**: The generated `hlm-field-error` always stays in the DOM (`[hidden]` + `@if (_display())`) with host `role="alert"`; `hlmAlert` also sets `role="alert"`. `query('hlm-field-error')` in register.spec returns the e-mail field's empty error, so the min-length assertion fails; `query('[role="alert"]')` (login.spec:84, register.spec:93) depends on DOM order.
- **Fix**: Explicit ids on every `<hlm-field-error>`, role from `hlmAlert` host only with the alert placed before the field group, and specs query `#register-password-error` / `[hlmAlert]`.
- **Decision**: FIXED

### F2 — Phase 1 "looks the same" will not hold (Tailwind preflight)

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1 — Manual Verification 1.7
- **Detail**: Preflight sets `h1–h6 { font-weight: inherit }` and `a { text-decoration: inherit }`; the old unlayered rules don't set these, so headings lose bold and links lose their underline after Phase 1.
- **Fix**: Reword 1.7 to accept these known preflight differences until Phase 4.
- **Decision**: FIXED

### F3 — Phase 3 and Current State are out of date

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Current State Analysis; Phase 3 §4; Progress 3.3–3.5
- **Detail**: Current State claimed no mockups and no Figma MCP; `mockup-review.md` was marked "(new)" though it already existed; 3.3–3.5 were already met.
- **Fix**: Update the Current State bullet, mark the file as existing, tick 3.3–3.5.
- **Decision**: FIXED

### F4 — Figma PAT rotation has no success criterion

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 3 §3
- **Detail**: The token pasted in chat "should be rotated", but no step verified it.
- **Fix**: Add Manual 3.7 "Figma PAT rotated …; Figma MCP still reads a frame".
- **Decision**: FIXED

### F5 — lint:ui only catches numeric px/rem arbitrary values

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 5 §3; Desired End State
- **Detail**: The `/10x-ui` regex `-\[[0-9.]+(px|rem)\]` lets `w-[50%]`, `bg-[var(--x)]`, `h-[calc(...)]` through.
- **Fix**: Add a general `\b[a-z][a-z0-9-]*-\[[^\]]+\]` pattern and a planted `w-[50%]` check in 5.2.
- **Decision**: FIXED
