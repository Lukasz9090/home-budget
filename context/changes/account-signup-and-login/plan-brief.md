# Account Sign-up and Login — Plan Brief

> Full plan: `context/changes/account-signup-and-login/plan.md`

## What & Why

Roadmap S-01 (FR-001, FR-002): users can sign up with email + password, log in, log out and return after a month without logging in again, while no account can ever see another's data. It is the first slice, so it also sets the owner-scoping pattern every later slice (categories, months, expenses, notes) must follow — done wrong, it leaks into all of them.

## Starting Point

Spring Security already protects `/api/**` (401, no redirect), leaves `/api/auth/**` open, uses SPA-style CSRF cookies, and stores 45-day sessions in Postgres via Spring Session JDBC. There is no users table, no login mechanism, no auth endpoints, and the Angular app is still the CLI placeholder with an empty route list.

## Desired End State

A logged-out visitor to any app route lands on a Polish login screen; signing up logs them straight in and shows a minimal shell (their email + "Wyloguj") with a home placeholder. The session survives as long as they visit at least once every 45 days. Backend tests prove fixation-safe login, CSRF, sliding cookie and two-account isolation, and a written rule + test helper make the owner-scoping pattern the default for S-02 onward.

## Key Decisions Made

| Decision          | Choice                                                                | Why (1 sentence)                                                                                         |
| ----------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Session lifetime  | Sliding 45 days — cookie re-sent on every authenticated request        | Spring Session otherwise makes the cookie expire 45 days after login, logging out active users.            |
| After sign-up     | Auto-login and go to home                                             | Removes first-session friction (PRD OQ1); future email verification can be added as "soft" without rework. |
| Isolation pattern | Explicit `owner_id` + owner-scoped repos + `CurrentUser` + `TestAccounts` | Plain, reviewable JPA; each slice proves isolation with a cross-account test.                             |
| Password rules    | 8–72 chars, no composition rules, BCrypt (`DelegatingPasswordEncoder`)   | NIST-style; 72 matches BCrypt's input limit so nothing is silently truncated.                             |
| Email handling    | Trim + lowercase, unique; duplicate sign-up → 409 "already exists"     | Prevents case twins; honest UX outweighs account-enumeration risk for this app.                           |
| Brute force       | No protection in v1 (parked risk)                                     | In-memory limits are leaky on Vercel; DB throttling isn't worth it for the MVP.                           |
| UI                | Polish copy, plain mobile-first SCSS, reactive forms, no UI library    | Matches the Polish user base and keeps dependencies minimal.                                              |
| Other-owner access | Respond 404, not 403                                                  | Doesn't confirm that another account's id exists.                                                         |

## Scope

**In scope:**
- `V2__users.sql`, `Account` entity/repository, BCrypt, `AccountPrincipal`
- `POST /api/auth/register` (201 + logged in), `POST /api/auth/login`, `POST /api/auth/logout` (204), `GET /api/me`
- Session-id change + CSRF token rotation on login/register; `XSRF-TOKEN` cookie on every response; sliding session cookie
- `CurrentUser`, `TestAccounts`, isolation test, rule in `lessons.md`, `docs/reference/contract-surfaces.md`
- Angular: HttpClient + XSRF, `AuthService` (signals), `authGuard`/`guestGuard`, 401 interceptor, `/login`, `/register`, shell + home placeholder; Vitest specs

**Out of scope:** email verification, password reset/change, rate limiting/lockout, remember-me, account deletion/profile, domain tables, RLS/Hibernate filters, UI library, i18n tooling.

## Architecture / Approach

JSON auth controller → Spring `AuthenticationManager` (`DaoAuthenticationProvider` over `users`, BCrypt) → session strategy (change session id, rotate CSRF) → `SecurityContext` saved in the JDBC-backed session. Spring Security's `logout()` handles `/api/auth/logout`. Two small filters: one forces the deferred CSRF token so the cookie is always issued, one re-sends the session cookie to make its 45-day expiry slide. Angular talks same-origin (`/api` proxy in dev, one container in prod), so the built-in XSRF support and cookies work without CORS.

## Phases at a Glance

| Phase                   | What it delivers                                                  | Key risk                                                               |
| ----------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1. Backend auth API     | Users table, register/login/logout/me, CSRF + sliding cookie, tests | Wrong order of fixation/CSRF/context-save; serialisation of principal   |
| 2. Account isolation kit | `CurrentUser`, `TestAccounts`, isolation test, written rule        | Rule only works if later slices actually write the cross-account test |
| 3. Frontend auth        | Guards, interceptor, Polish login/sign-up screens, shell           | First POST failing CSRF if the cookie bootstrap is missed               |

**Prerequisites:** local Postgres via `docker compose -f docker-compose-dev.yml up -d`; nothing from other slices.
**Estimated effort:** ~3 after-hours sessions, one per phase.

## Open Risks & Assumptions

- No brute-force protection in v1; online guessing is only slowed by BCrypt cost.
- Duplicate-email 409 lets anyone check whether an email has an account (accepted).
- Renaming/moving `AccountPrincipal` later invalidates stored sessions (users log in once again).
- Assumes the app stays same-origin (SPA served by Spring); a separate frontend origin would need CORS and cookie changes.

## Success Criteria (Summary)

- A new user can sign up and immediately use the app; returning within 45 days of the last visit needs no login.
- Logged-out access to app routes always ends on the login screen; logout really ends the session.
- Two accounts never see each other's data, and S-02 has a ready-made rule and test helper to keep it that way.
