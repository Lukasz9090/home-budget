# Account Sign-up and Login Implementation Plan

## Overview

Roadmap slice S-01 (FR-001, FR-002): a user can create an account with email + password, log in, log out, and come back after a month without logging in again. Unauthenticated access to a data route redirects to login, and the slice establishes the owner-scoping pattern every later slice (S-02..S-08) builds on so that no account ever sees another account's data (PRD guardrail).

## Current State Analysis

- Security skeleton exists: `/api/auth/**` and `/actuator/health/**` are public, the rest of `/api/**` requires authentication, everything else (SPA shell, assets) is public (`backend/src/main/java/com/homebudget/config/SecurityConfig.java:16-22`). Unauthenticated API calls get 401 instead of a redirect (`SecurityConfig.java:26`). Form login and HTTP Basic are disabled (`SecurityConfig.java:27-28`) — there is currently no way to authenticate.
- CSRF is configured via `csrf.spa()` (`SecurityConfig.java:24`), i.e. `CookieCsrfTokenRepository.withHttpOnlyFalse()` + `SpaCsrfTokenRequestHandler` (verified in spring-security-config 7.1.1 `CsrfConfigurer.spa()`). It does **not** eagerly write the `XSRF-TOKEN` cookie; the token is deferred and only materialised when something reads it.
- Sessions are Spring Session JDBC in Postgres (`V1__spring_session.sql`), `spring.session.timeout: 45d`, cookie `max-age: 45d`, `http-only`, `same-site: lax` (`backend/src/main/resources/application.yaml:28-46`). Server-side expiry already slides (`LAST_ACCESS_TIME` / `MAX_INACTIVE_INTERVAL`).
- Spring Session 4.1.1 `SessionRepositoryFilter.commitSession()` writes the session cookie **only when the session is new or its id changed**. With `max-age: 45d` the browser cookie therefore expires 45 days after login, regardless of activity.
- No users table, no `PasswordEncoder`, no auth endpoints, no `spring-boot-starter-validation` dependency (`backend/pom.xml`).
- SPA fallback serves `index.html` for any non-`/api`, non-`/actuator` path (`SpaWebConfig.java:37-41`), so `/login` and `/register` refresh correctly already.
- Frontend: empty route list (`frontend/src/app/app.routes.ts:3`), no `provideHttpClient` (`frontend/src/app/app.config.ts`), `app.html` is the Angular CLI placeholder and `app.spec.ts:21` asserts its "Hello, frontend" heading. Dev proxy forwards `/api` to `:8080` (`frontend/proxy.conf.json`), so the app is same-origin in dev and prod — cookies and Angular's built-in XSRF handling work without CORS.
- Backend tests run against a real Postgres both locally (docker compose) and in CI (`.github/workflows/test.yml:12-22`); existing tests use `@SpringBootTest` + `@AutoConfigureMockMvc` (`WebRoutingTests.java:15-16`). `spring-boot-starter-security-test` is already on the test classpath.

## Desired End State

- `POST /api/auth/register` creates an account and the caller is immediately logged in; `POST /api/auth/login` logs in; `POST /api/auth/logout` logs out; `GET /api/me` returns the current account or 401.
- The session cookie and server session both expire 45 days after the **last** authenticated request (sliding), so a user active at least once every 45 days is never logged out.
- The `XSRF-TOKEN` cookie is present after the very first API response, so the first login/register POST passes CSRF.
- `docs/reference/contract-surfaces.md` and `context/foundation/lessons.md` record the owner-scoping rule; a reusable two-account test helper exists for later slices.
- In the browser: visiting any app route while logged out lands on `/login`; after sign-up or login the user sees the app shell (their email + "Wyloguj") with a home placeholder; refresh keeps them logged in; logout returns to `/login`. Screens are Polish and usable on a phone.

Verify with `./mvnw test`, `npm test -- --watch=false`, `npm run lint`, and the manual steps in each phase.

### Key Discoveries:

- `SecurityConfig.java:24` — `csrf.spa()` defers the token; a filter that reads the token on every request is needed so the cookie is issued even on a 401 from `/api/me`.
- Spring Session `SessionRepositoryFilter.commitSession()` only calls `setSessionId` when the id is new/changed — the 45-day cookie is absolute unless we re-send it.
- `application.yaml:41-46` — cookie properties already come from `server.servlet.session.cookie.*`; Boot builds the `DefaultCookieSerializer` from them, so the sliding refresh must reuse that serializer (not hand-build a cookie) to keep name/flags consistent.
- Spring Session stores the `SecurityContext` with JDK serialization in `SPRING_SESSION_ATTRIBUTES.ATTRIBUTE_BYTES` — the authenticated principal class must be `Serializable` and stable.
- `WebRoutingTests.java:37-39` — the `/api/months` → 401 test stays valid and must keep passing.

## What We're NOT Doing

- Email verification (out of MVP per PRD Access Control); no `email_verified_at` column yet — it arrives as a later migration with "soft" verification (banner/gate), which does not change this slice's session flow.
- Password reset / "forgot password" and password change.
- Brute-force protection / rate limiting / account lockout — parked; recorded as a known risk.
- Breached-password checks and password composition rules.
- "Remember me" as a separate mechanism — the single sliding 45-day session replaces it.
- Account deletion, profile editing, data export.
- Any domain table (categories etc.) — S-02 is the first slice that applies the owner-scoping pattern to real data.
- Postgres row-level security or Hibernate global filters.
- UI component library (Angular Material etc.) and i18n tooling — Polish strings inline.

## Implementation Approach

Backend first, fixed by integration tests, then the isolation convention that later slices inherit, then the Angular client that consumes the finished contract.

Authentication uses JSON endpoints in a custom controller (form login stays disabled) that call Spring's `AuthenticationManager` (`DaoAuthenticationProvider` + `UserDetailsService` over the users table + BCrypt via `DelegatingPasswordEncoder`), then persist the `SecurityContext` through `HttpSessionSecurityContextRepository` and change the session id (fixation protection). Logout uses Spring Security's built-in `logout()` configurer mapped to `POST /api/auth/logout` returning 204. Errors are RFC 9457 `ProblemDetail` responses.

Account isolation is explicit: every future domain table carries `owner_id uuid not null references users(id)`, repositories expose only owner-scoped methods, controllers obtain the id from a single `CurrentUser` accessor, and every slice adds a cross-account test using the shared helper from Phase 2.

Frontend: `provideHttpClient` (Angular's default XSRF config already matches `XSRF-TOKEN`/`X-XSRF-TOKEN`), a signal-based `AuthService`, functional guards for authenticated and guest routes, a 401 interceptor, reactive-form screens and a minimal shell, all in plain SCSS.

## Critical Implementation Details

**Sliding session cookie.** Because Spring Session only writes the cookie on id change, add a `OncePerRequestFilter` registered *after* `SessionRepositoryFilter` that, when the request has a valid existing session (`request.getSession(false) != null` and `isRequestedSessionIdValid()`), re-writes the cookie through Boot's `CookieSerializer` bean (`writeCookieValue(new CookieValue(request, response, sessionId))`) before the chain proceeds. It must not create sessions for anonymous requests. Server-side expiry already slides via `MAX_INACTIVE_INTERVAL`, so no DB change is needed.

**CSRF token bootstrap and rotation.** Add a small filter after `CsrfFilter` that reads `CsrfToken` from the request attribute (`token.getToken()`) so the deferred token is generated and the `XSRF-TOKEN` cookie is written on every response, including 401s. On login/register, call `CsrfAuthenticationStrategy` (with the same `CookieCsrfTokenRepository` instance) alongside `ChangeSessionIdAuthenticationStrategy` — the simplest way is to share one `CookieCsrfTokenRepository` bean between `csrf(c -> c.csrfTokenRepository(repo).csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))` and the controller's `CompositeSessionAuthenticationStrategy`. The client re-reads the rotated cookie automatically on the next request.

**Order inside login/register.** Authenticate → `sessionAuthenticationStrategy.onAuthentication(...)` (change session id, rotate CSRF) → create an empty `SecurityContext`, set the authentication, set it on `SecurityContextHolderStrategy` → `securityContextRepository.saveContext(context, request, response)`. Registering is: validate → normalise email → insert (BCrypt hash) → same login sequence with the new principal. Saving the context before changing the session id leaves the context in the old (fixated) session.

**Principal serialization.** The principal stored in the session (`AccountPrincipal`: `UUID id`, `String email`, password hash erased after authentication) is JDK-serialised into `SPRING_SESSION_ATTRIBUTES`; give it an explicit `serialVersionUID`. Renaming/moving the class later invalidates existing sessions (users get logged out once) — acceptable but worth knowing.

## Phase 1: Backend auth API

### Overview

Users table, password hashing, register/login/logout/me endpoints with fixation-safe login, CSRF cookie bootstrap, sliding session cookie, and integration tests against Postgres.

### Changes Required:

#### 1. Validation dependency

**File**: `backend/pom.xml`

**Intent**: Bean Validation is needed for request DTO validation and is not on the classpath.

**Contract**: add `org.springframework.boot:spring-boot-starter-validation` (version from the Boot parent).

#### 2. Users migration

**File**: `backend/src/main/resources/db/migration/V2__users.sql`

**Intent**: First domain table; owner of every future `owner_id` FK.

**Contract**: table `users` — `id uuid primary key`, `email varchar(254) not null`, `password_hash varchar(100) not null`, `created_at timestamptz not null default now()`; unique constraint/index `users_email_uk` on `email` (values are stored already normalised, so a plain unique index is sufficient).

#### 3. Account entity and repository

**File**: `backend/src/main/java/com/homebudget/account/Account.java`, `backend/src/main/java/com/homebudget/account/AccountRepository.java`

**Intent**: JPA mapping of `users` (validated by `ddl-auto: validate`) and lookup by email.

**Contract**: `@Entity @Table(name = "users") Account` with UUID id generated by JPA (`GenerationType.UUID`), `email`, `passwordHash`, `createdAt`. `AccountRepository extends JpaRepository<Account, UUID>` with `Optional<Account> findByEmail(String email)` and `boolean existsByEmail(String email)`. `Account` is the one entity that is not owner-scoped (it *is* the owner).

#### 4. Email normalisation and principal

**File**: `backend/src/main/java/com/homebudget/account/EmailAddress.java` (or a static helper), `backend/src/main/java/com/homebudget/account/AccountPrincipal.java`, `backend/src/main/java/com/homebudget/account/AccountUserDetailsService.java`

**Intent**: One normalisation rule used by register, login and lookups; a serialisable principal carrying the account id.

**Contract**: `normalize(String)` = `trim()` + `toLowerCase(Locale.ROOT)`. `AccountPrincipal implements UserDetails, CredentialsContainer, Serializable` exposing `UUID id()` and `email()`; `getUsername()` returns the email; authority list empty (single flat role, no roles). `AccountUserDetailsService` normalises the incoming username before `findByEmail`, throws `UsernameNotFoundException` otherwise.

#### 5. Security configuration

**File**: `backend/src/main/java/com/homebudget/config/SecurityConfig.java`

**Intent**: Wire password encoding, authentication, CSRF repository sharing, logout endpoint, and the two new filters, while keeping the existing route rules and 401 entry point.

**Contract**:
- Beans: `PasswordEncoder` = `PasswordEncoderFactories.createDelegatingPasswordEncoder()` (BCrypt default); `AuthenticationManager` built from `DaoAuthenticationProvider(userDetailsService)` + encoder; `CookieCsrfTokenRepository` (`withHttpOnlyFalse()`); `SecurityContextRepository` = `HttpSessionSecurityContextRepository`; `SessionAuthenticationStrategy` = composite of `ChangeSessionIdAuthenticationStrategy` and `CsrfAuthenticationStrategy(csrfRepo)`.
- `csrf` uses the shared repository + `SpaCsrfTokenRequestHandler` (behaviour equal to `spa()`); `securityContext` uses the shared repository.
- `logout`: `logoutUrl("/api/auth/logout")` (POST, CSRF-protected), `logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))`, invalidates the session and deletes the session cookie (`SESSION`).
- Route rules unchanged: `/api/auth/**` and `/actuator/health/**` permitAll, `/api/**` authenticated, rest permitAll. `/api/me` is therefore authenticated.
- Adds `CsrfCookieFilter` after `CsrfFilter` (see Critical Implementation Details).

#### 6. Sliding session cookie filter

**File**: `backend/src/main/java/com/homebudget/config/SlidingSessionCookieFilter.java`

**Intent**: Make the browser cookie expire 45 days after the last visit, matching the server-side sliding expiry (decision: sliding 45 days).

**Contract**: `OncePerRequestFilter` bean ordered after Spring Session's `SessionRepositoryFilter` (`SessionRepositoryFilter.DEFAULT_ORDER + 1`) and before Spring Security; re-writes the cookie via Boot's `CookieSerializer` only when a valid requested session exists; never creates a session.

#### 7. Auth controller and DTOs

**File**: `backend/src/main/java/com/homebudget/account/AuthController.java`, `backend/src/main/java/com/homebudget/account/AccountService.java`, DTO records in the same package

**Intent**: JSON API for register/login/me; register auto-logs-in (decision: auto-login after sign-up).

**Contract**:
- `POST /api/auth/register` body `{ "email": string, "password": string }`; validation: email `@NotBlank @Email @Size(max = 254)`, password `@NotNull @Size(min = 8, max = 72)` (decision: 8–72, no composition rules). On success: account created with BCrypt hash, fixation-safe login, **201** with `{ "id": uuid, "email": string }`. Email already taken (checked via `existsByEmail` and, for the race, a caught `DataIntegrityViolationException` on `users_email_uk`) → **409** ProblemDetail, `detail` "Konto z tym adresem e-mail już istnieje." (decision: say "taken").
- `POST /api/auth/login` body `{ "email", "password" }` → **200** `{ "id", "email" }` after fixation-safe login; wrong email or password → **401** ProblemDetail with the single generic `detail` "Nieprawidłowy e-mail lub hasło." (no distinction between unknown email and wrong password).
- `GET /api/me` → **200** `{ "id", "email" }` for the current account (via `CurrentUser`, Phase 2 — in Phase 1 read from `@AuthenticationPrincipal AccountPrincipal`), **401** when anonymous.
- Validation failures → **400** ProblemDetail with per-field errors (enable `spring.mvc.problemdetails.enabled: true` and/or a `@RestControllerAdvice` mapping `MethodArgumentNotValidException`).

#### 8. Integration tests

**File**: `backend/src/test/java/com/homebudget/account/AuthFlowTests.java`, `backend/src/test/java/com/homebudget/config/SessionCookieTests.java`

**Intent**: Prove the HTTP contract end to end with real cookies (SESSION + XSRF-TOKEN replayed between MockMvc requests) against Postgres.

**Contract**: tests described in Testing Strategy; each test uses a unique email (e.g. random suffix) so tests don't depend on DB cleanup.

### Success Criteria:

#### Automated Verification:

- Flyway applies `V2__users.sql` and Hibernate validation passes: `./mvnw test` (context loads)
- Auth flow integration tests pass: `./mvnw test -Dtest=AuthFlowTests`
- Session/CSRF cookie tests pass: `./mvnw test -Dtest=SessionCookieTests`
- Existing routing tests still pass (`/api/months` → 401, SPA fallback): `./mvnw test -Dtest=WebRoutingTests`
- Formatting is clean: `./mvnw spotless:check`

#### Manual Verification:

- With the backend running locally, `curl` (cookie jar) register → me → logout → me shows 201 → 200 → 204 → 401, and a second register with the same email in different letter case returns 409
- In the DB, `users.password_hash` starts with `{bcrypt}` and the email is stored lowercase

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Account isolation kit

### Overview

The owner-scoping convention every later slice follows, a single accessor for the current account id, a reusable two-account test helper, and the written rule.

### Changes Required:

#### 1. Current account accessor

**File**: `backend/src/main/java/com/homebudget/account/CurrentUser.java`

**Intent**: One place that turns the security context into an owner id, so domain code never touches Spring Security directly.

**Contract**: Spring bean with `UUID id()` (throws `AuthenticationCredentialsNotFoundException` → 401 if no `AccountPrincipal` is present) and `AccountPrincipal principal()`. `AuthController.me` switches to it.

#### 2. Two-account test helper

**File**: `backend/src/test/java/com/homebudget/support/TestAccounts.java`

**Intent**: Let every later slice write a cross-account test in a few lines.

**Contract**: test component that creates a persisted account with a unique email (`create()` / `create(String emailPrefix)`) and returns its `AccountPrincipal`; a static helper `as(AccountPrincipal)` returning a `RequestPostProcessor` that combines `SecurityMockMvcRequestPostProcessors.user(principal)` and `csrf()`. Used together with MockMvc; does not go through the login endpoint (that path is covered by Phase 1 tests).

#### 3. Isolation proof

**File**: `backend/src/test/java/com/homebudget/account/AccountIsolationTests.java`

**Intent**: Demonstrate the pattern on the only owned resource that exists now and serve as the template for S-02+.

**Contract**: two accounts A and B; `GET /api/me` as A returns A's id/email and never B's, and vice versa; a `CurrentUser.id()` call without authentication yields 401.

#### 4. Written rule

**File**: `context/foundation/lessons.md` (create), `docs/reference/contract-surfaces.md` (create)

**Intent**: Make the rule discoverable for planning/implementation/review of later slices.

**Contract**:
- `lessons.md` entry "Every read and write is owner-scoped": every domain table has `owner_id uuid not null references users(id)` plus an index starting with `owner_id`; repository methods take `UUID ownerId` and filter by it (no unscoped `findById`/`findAll` used from controllers — use `findByIdAndOwnerId`); controllers get the id only from `CurrentUser.id()`, never from the request body/path; a resource owned by another account answers **404** (not 403) so ids aren't confirmed; every slice adds a cross-account test with `TestAccounts`.
- `contract-surfaces.md` lists load-bearing names: endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/me`; cookies `SESSION`, `XSRF-TOKEN`; header `X-XSRF-TOKEN`; table `users`, column convention `owner_id`; classes `CurrentUser`, `AccountPrincipal`, `TestAccounts`.

### Success Criteria:

#### Automated Verification:

- Isolation tests pass: `./mvnw test -Dtest=AccountIsolationTests`
- Full backend suite passes: `./mvnw test`
- Formatting is clean: `./mvnw spotless:check`

#### Manual Verification:

- `context/foundation/lessons.md` rule and `docs/reference/contract-surfaces.md` read as clear, actionable guidance for S-02 planning

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Frontend auth

### Overview

HTTP client with CSRF, auth state, route guards, 401 handling, Polish login/sign-up screens, and a minimal logged-in shell replacing the Angular placeholder.

### Changes Required:

#### 1. App configuration and routes

**File**: `frontend/src/app/app.config.ts`, `frontend/src/app/app.routes.ts`

**Intent**: Enable `HttpClient` with the auth interceptor and define public/guarded routes.

**Contract**: `provideHttpClient(withInterceptors([authInterceptor]))` (default XSRF config: cookie `XSRF-TOKEN`, header `X-XSRF-TOKEN`, mutating same-origin requests only). Routes: `login` and `register` (lazy, `canActivate: [guestGuard]`); `''` → shell component (`canActivate: [authGuard]`) with child `''` → home placeholder; `**` → redirect to `''`.

#### 2. Auth service

**File**: `frontend/src/app/auth/auth.service.ts`

**Intent**: Single source of auth state for guards, shell and screens.

**Contract**: `currentUser` signal of `Account | null` plus a `loaded` flag (unknown until first `/api/me`); methods `ensureLoaded(): Promise<Account | null>` (calls `GET /api/me` once, maps 401 to `null`), `login(email, password)`, `register(email, password)`, `logout()` (POST `/api/auth/logout`, then clears state), `clear()`. `Account` = `{ id: string; email: string }`.

#### 3. Guards and interceptor

**File**: `frontend/src/app/auth/auth.guard.ts`, `frontend/src/app/auth/guest.guard.ts`, `frontend/src/app/auth/auth.interceptor.ts`

**Intent**: Logged-out access to data routes ends on `/login` (PRD Access Control); logged-in users skip the guest screens; a session that expires mid-use sends the user to login.

**Contract**: `authGuard` awaits `ensureLoaded()`; null → `UrlTree` to `/login?returnUrl=<requested url>`. `guestGuard` → `UrlTree` to `/` when logged in. `authInterceptor`: on a 401 from any `/api/` request other than `/api/me` and `/api/auth/*`, call `clear()` and navigate to `/login?returnUrl=<current url>`. After login/register, navigate to `returnUrl` only when it is an internal path starting with `/` (not `//`), else `/`.

#### 4. Screens and shell

**File**: `frontend/src/app/auth/login/login.ts|html|scss`, `frontend/src/app/auth/register/register.ts|html|scss`, `frontend/src/app/shell/shell.ts|html|scss`, `frontend/src/app/home/home.ts`, `frontend/src/app/app.html`, `frontend/src/app/app.ts`, `frontend/src/styles.scss`

**Intent**: Polish, mobile-first screens with reactive forms; shell with the user's email and a logout button; home placeholder for S-02 to replace (decision: Polish, plain SCSS).

**Contract**:
- Login ("Zaloguj się"): email + password, submit disabled while pending, server 401 shows "Nieprawidłowy e-mail lub hasło.", link to sign-up ("Nie masz konta? Załóż konto").
- Register ("Załóż konto"): email + password (8–72, hint "Co najmniej 8 znaków"), client-side validation mirroring the backend, 409 shows the server message, link to login.
- Shell: header with "PennyPlan", the account email and a "Wyloguj" button; `<router-outlet>` for children. Home: short placeholder text (S-02 replaces it with the category empty state).
- `app.html` becomes just `<router-outlet />`; the placeholder markup and `title` signal are removed.
- Global styles in `styles.scss`: base typography, a form/field/button style reused by both screens, readable at 360 px width.

#### 5. Frontend tests

**File**: `frontend/src/app/app.spec.ts`, `frontend/src/app/auth/*.spec.ts`

**Intent**: Replace the placeholder assertion and cover auth logic with Vitest + `HttpTestingController`.

**Contract**: specs listed in Testing Strategy; `app.spec.ts` only asserts the root component creates.

### Success Criteria:

#### Automated Verification:

- Frontend unit tests pass: `npm test -- --watch=false`
- Lint passes: `npm run lint`
- Production build succeeds: `npm run build`
- Backend suite still passes: `./mvnw test`

#### Manual Verification:

- Logged out, opening `http://localhost:4200/` lands on `/login`; sign-up with a new email lands on the shell showing that email
- Browser refresh on the shell keeps the user logged in; DevTools shows the `SESSION` cookie expiry ~45 days ahead and it moves forward after another request a minute later
- "Wyloguj" returns to `/login`, and the back button does not show the shell
- Wrong password shows the generic error; signing up again with the same email (different letter case) shows the "already exists" message
- Two browser profiles with two accounts each see only their own email in the shell
- Login and sign-up screens are comfortable at phone width (DevTools 360 px)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful.

---

## Testing Strategy

### Unit Tests:

- Email normalisation: trims and lowercases (`" Jan@X.pl "` → `"jan@x.pl"`).
- `authGuard`: anonymous → `UrlTree` `/login?returnUrl=/`; authenticated → `true`; calls `/api/me` only once across navigations.
- `guestGuard`: authenticated → `UrlTree` `/`.
- `authInterceptor`: 401 on `/api/months` clears state and navigates to login; 401 on `/api/auth/login` is passed through to the caller untouched.
- `AuthService`: `ensureLoaded` maps 401 to `null`; `logout` clears `currentUser`.
- Login/register components: submit disabled when invalid; server error message rendered; `returnUrl` `//evil.com` is ignored.

### Integration Tests:

- Register → 201 + `SESSION` cookie set; `GET /api/me` with that cookie → 200 with the same email.
- Register with existing email in other case (`JAN@x.pl` after `jan@x.pl`) → 409; password of 7 chars → 400; 73 chars → 400; invalid email → 400.
- Login with correct credentials → 200 and a **different** session id than the pre-login anonymous one (fixation); wrong password and unknown email → identical 401 bodies.
- POST login/register without `X-XSRF-TOKEN` → 403; with the token from the `XSRF-TOKEN` cookie (sent on a prior `GET /api/me` 401 response) → passes.
- Logout → 204, then `GET /api/me` with the old cookie → 401.
- Sliding cookie: an authenticated `GET /api/me` with an existing session returns a `Set-Cookie: SESSION=…; Max-Age=3888000`; an anonymous request returns no `SESSION` cookie.
- Two-account isolation via `TestAccounts` (Phase 2).

### Manual Testing Steps:

1. Start DB + backend + `npm start`; open `/` logged out → redirected to `/login`.
2. Sign up → shell shows email; refresh → still logged in.
3. Check `SESSION` cookie expiry in DevTools, make another request after a minute, confirm expiry moved.
4. Log out → `/login`; back button doesn't reveal the shell.
5. Second browser profile, second account → each sees only its own email.

## Performance Considerations

Each authenticated request now updates `SPRING_SESSION.LAST_ACCESS_TIME` (already the case with Spring Session) and re-sends one cookie header — negligible. BCrypt (default strength 10) adds ~100 ms to login/register only. No impact on the 200 ms split-table NFR, which is client-side.

## Migration Notes

`V2__users.sql` is additive; no existing data. On Neon, the preview branch receives it on preview deploys and `main` on production deploy (`context/foundation/infrastructure.md`). Existing anonymous sessions (if any) remain valid and simply have no principal. Rollback = revert the deploy; the extra table is harmless to the previous version (`ddl-auto: validate` only checks mapped entities).

## References

- Roadmap item: `context/foundation/roadmap.md` (S-01, Change ID `account-signup-and-login`)
- PRD: `context/foundation/prd.md` — FR-001, FR-002, NFR long session, Access Control, guardrail isolation, Open Question 1
- Change identity: `context/changes/account-signup-and-login/change.md`
- Security config: `backend/src/main/java/com/homebudget/config/SecurityConfig.java:14-30`
- Session config: `backend/src/main/resources/application.yaml:28-46`, `backend/src/main/resources/db/migration/V1__spring_session.sql`
- Test pattern: `backend/src/test/java/com/homebudget/config/WebRoutingTests.java:15-46`
- Infra constraints: `context/foundation/infrastructure.md` (Neon preview branch, session risk row)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Backend auth API

#### Automated

- [x] 1.1 Flyway applies `V2__users.sql` and Hibernate validation passes: `./mvnw test` (context loads) — 9b82105
- [x] 1.2 Auth flow integration tests pass: `./mvnw test -Dtest=AuthFlowTests` — 9b82105
- [x] 1.3 Session/CSRF cookie tests pass: `./mvnw test -Dtest=SessionCookieTests` — 9b82105
- [x] 1.4 Existing routing tests still pass (`/api/months` → 401, SPA fallback): `./mvnw test -Dtest=WebRoutingTests` — 9b82105
- [x] 1.5 Formatting is clean: `./mvnw spotless:check` — 9b82105

#### Manual

- [x] 1.6 With the backend running locally, `curl` (cookie jar) register → me → logout → me shows 201 → 200 → 204 → 401, and a second register with the same email in different letter case returns 409 — 9b82105
- [x] 1.7 In the DB, `users.password_hash` starts with `{bcrypt}` and the email is stored lowercase — 9b82105

### Phase 2: Account isolation kit

#### Automated

- [x] 2.1 Isolation tests pass: `./mvnw test -Dtest=AccountIsolationTests` — 2d81d40
- [x] 2.2 Full backend suite passes: `./mvnw test` — 2d81d40
- [x] 2.3 Formatting is clean: `./mvnw spotless:check` — 2d81d40

#### Manual

- [x] 2.4 `context/foundation/lessons.md` rule and `docs/reference/contract-surfaces.md` read as clear, actionable guidance for S-02 planning — 2d81d40

### Phase 3: Frontend auth

#### Automated

- [x] 3.1 Frontend unit tests pass: `npm test -- --watch=false`
- [x] 3.2 Lint passes: `npm run lint`
- [x] 3.3 Production build succeeds: `npm run build`
- [x] 3.4 Backend suite still passes: `./mvnw test`

#### Manual

- [x] 3.5 Logged out, opening `http://localhost:4200/` lands on `/login`; sign-up with a new email lands on the shell showing that email
- [x] 3.6 Browser refresh on the shell keeps the user logged in; DevTools shows the `SESSION` cookie expiry ~45 days ahead and it moves forward after another request a minute later
- [x] 3.7 "Wyloguj" returns to `/login`, and the back button does not show the shell
- [x] 3.8 Wrong password shows the generic error; signing up again with the same email (different letter case) shows the "already exists" message
- [x] 3.9 Two browser profiles with two accounts each see only their own email in the shell
- [x] 3.10 Login and sign-up screens are comfortable at phone width (DevTools 360 px)
