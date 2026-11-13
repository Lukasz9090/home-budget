<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Account Sign-up and Login Implementation Plan

- **Plan**: context/changes/account-signup-and-login/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-12
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 7 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

Automated checks run on 2026-11-12, all passing:
- `./mvnw test`: 24 tests, 0 failures, on Testcontainers Postgres 16.
- `./mvnw spotless:check`: clean.
- `npm test -- --watch=false`: 23 tests passed.
- `npm run lint`: clean.
- `npm run build`: OK.

Plan drifts were all minor and justified:
- `TestAccounts.as()` sends the XSRF cookie and header instead of calling `csrf()`, as lessons.md requires.
- Register builds the token directly instead of running a second BCrypt.
- The fixation test uses the register session, because no anonymous session ever exists in this design.

## Findings

### F1 — Passwords over 72 UTF-8 bytes make register return 500

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: backend/src/main/java/com/homebudget/account/RegisterRequest.java:10 (also AccountService.java:32, frontend/src/app/auth/register/register.ts:22)
- **Detail**: `@Size(min = 8, max = 72)` and Angular's `Validators.maxLength(72)` count characters, but spring-security-crypto 7.1.1 `BCrypt.hashpw` throws `IllegalArgumentException("password cannot be more than 72 bytes")` on UTF-8 bytes. A Polish passphrase like `"ą".repeat(40)` (40 chars, 80 bytes), or 19 emoji, passes validation. Nothing maps the exception, so the response is a generic 500 and the UI shows "Coś poszło nie tak". No account is created. Login is unaffected, because `checkpw` truncates silently. The plan specified "8–72" without saying characters or bytes, so the flaw starts in the plan.
- **Fix**: Add a small `@MaxUtf8Bytes(72)` constraint (or equivalent) to `RegisterRequest.password` so it returns a 400 on `errors.password`. Mirror it on the frontend with `new TextEncoder().encode(v).length <= 72`. Add `"ą".repeat(40)` → 400 to `AuthFlowTests.registerValidatesPasswordLengthAndEmail`.
- **Decision**: PENDING

### F2 — Sliding cookie filter queries the session DB on every static asset request

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality (performance) / Pattern Consistency
- **Location**: backend/src/main/java/com/homebudget/config/SlidingSessionCookieFilter.java:23-41
- **Detail**:
  - The filter is a `@Component`, so Boot registers it for `/*`.
  - With a SESSION cookie present, `isRequestedSessionIdValid()` runs a JDBC `findById`, and `getSession(false)` marks the session changed, which triggers an UPDATE of `LAST_ACCESS_TIME`. This now happens for every SPA asset: index.html, the main/polyfills/styles bundles, the lazy chunks and the favicon. All of these are revalidated on each load because they are served `no-cache`.
  - Before this change, permitAll requests never touched the session.
  - The Hikari pool is 3 connections (`application.yaml:11`), so parallel asset requests queue behind each other, and this gets worse while Neon is waking up.
  - The plan said the cookie should slide on "the last **authenticated request**" (plan.md:21).
  - Registration is also inconsistent: `CsrfCookieFilter` is deliberately a non-bean so Boot doesn't auto-register it, while this filter is a bean. As a bean, it is also likely to be picked up by future `@WebMvcTest` slices.
- **Fix**: Register the filter through a `FilterRegistrationBean` in `SecurityConfig` (or a small config class) with `addUrlPatterns("/api/*")` and order `SessionRepositoryFilter.DEFAULT_ORDER + 1`, and drop `@Component`. Add a test that a static asset request with a valid SESSION gets no `Set-Cookie`.
  - Strength: Static assets no longer hit the DB. Sliding still happens on every app load, because the SPA always calls `/api/me`. Filter registration becomes consistent with `CsrfCookieFilter`.
  - Tradeoff: A user who only loads static pages without any API call wouldn't slide, but that is impossible with the current SPA.
  - Confidence: HIGH — the agent verified the `SessionRepositoryFilter` / `JdbcSession` behaviour in the Spring Session 4.1.1 sources.
  - Blind spot: The real latency impact on Neon has not been measured.
- **Decision**: PENDING

### F3 — DB failure during login is reported as "wrong e-mail or password"

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality (reliability)
- **Location**: backend/src/main/java/com/homebudget/config/ApiExceptionHandler.java:46-49
- **Detail**: When `loadUserByUsername` fails (Neon cold start, connection timeout), `DaoAuthenticationProvider` wraps the error in `InternalAuthenticationServiceException`. Only `BadCredentialsException` is handled, so the exception reaches `ExceptionTranslationFilter`, which returns a 401 with an empty body. The frontend's `authErrorMessage` then falls back to "Nieprawidłowy e-mail lub hasło.", so users are told their password is wrong when the server is down.
- **Fix**: Add `@ExceptionHandler(InternalAuthenticationServiceException.class)` → 503 ProblemDetail ("Serwis chwilowo niedostępny…"), so the login screen shows the generic error.
- **Decision**: PENDING

### F4 — Testcontainers switch adds an unenforced `@Import` convention

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: backend/src/test/java/com/homebudget/TestcontainersConfiguration.java (commit a4818bc)
- **Detail**:
  - Unplanned post-close fix: every `@SpringBootTest` must `@Import(TestcontainersConfiguration.class)`. A future test that forgets it silently falls back to `localhost:5432`, the dev DB, or fails when that DB is down.
  - The change is justified, but neither the plan nor lessons.md records this convention.
  - `testcontainers-junit-jupiter` is unused, since nothing uses `@Testcontainers` or `@Container`.
- **Fix**: Introduce a meta-annotation (e.g. `@IntegrationTest` = `@SpringBootTest` + `@Import(TestcontainersConfiguration.class)`) and use it in the 5 test classes. Drop the unused dependency.
- **Decision**: PENDING

### F5 — Register and login sessions carry different authorities

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: backend/src/main/java/com/homebudget/account/AuthController.java:57
- **Detail**: In Spring Security 7.1.1, `createSuccessAuthentication` adds the `FACTOR_PASSWORD` authority to the login token. The register path builds its token from `principal.getAuthorities()`, which is empty. This is harmless today, but authority-based rules or MFA added later would treat the two kinds of session differently.
- **Fix**: Build the register token with the same authorities as login, e.g. by adding `FactorGrantedAuthority` for the password factor, or by authenticating through the `AuthenticationManager`. Add a comment either way.
- **Decision**: PENDING

### F6 — AccountPrincipal Javadoc understates what a rename does

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: backend/src/main/java/com/homebudget/account/AccountPrincipal.java:12-16
- **Detail**: The Javadoc says renaming or moving the class means users get "logged out once". In reality Spring Session JDBC deserializes lazily and throws `SerializationFailedException`, so every `/api` request from an existing session returns 500. The sliding filter keeps refreshing the cookie, so the problem lasts up to 45 days.
- **Fix**: Correct the Javadoc: a rename requires a migration that purges `SPRING_SESSION`, or a custom deserializer that tolerates the old class.
- **Decision**: PENDING

### F7 — `password_hash VARCHAR(100)` is too tight for a future encoder switch

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality (data)
- **Location**: backend/src/main/resources/db/migration/V2__users.sql:7, Account.java:27
- **Detail**: `{bcrypt}` hashes are 68 characters, but `{argon2}` hashes through the DelegatingPasswordEncoder are about 105. The plan specified 100, so this follows the plan. The table is still almost empty.
- **Fix**: Add a `V3__widen_password_hash.sql` migration (`ALTER COLUMN password_hash TYPE varchar(255)`) when touching this area, or accept the risk until an encoder change.
- **Decision**: PENDING

### F8 — `spring.jpa.open-in-view` left at its default (true)

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality (performance)
- **Location**: backend/src/main/resources/application.yaml
- **Detail**: Boot logs a warning at startup. `Account` is the first entity, so OSIV now holds a pool connection (out of 3) for each request's full lifetime.
- **Fix**: Set `spring.jpa.open-in-view: false`.
- **Decision**: PENDING

### F9 — Isolation helper test passes vacuously for authentication

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: backend/src/test/java/com/homebudget/account/AccountIsolationTests.java:67-70
- **Detail**: `helperAuthorisesMutatingRequests` POSTs to logout, which answers 204 for anonymous callers too. It proves the CSRF half of `TestAccounts.as()` but not the authentication half.
- **Fix**: After the POST (or instead of it), assert an authenticated effect, e.g. a `/api/me` → 200 as the same principal. Switch to a real owned mutating endpoint in S-02.
- **Decision**: PENDING

### F10 — Minor hygiene bundle

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: various
- **Detail**:
  - (a) `AccountService.java:35` detects the unique-violation race by matching `"users_email_uk"` in the message text. Matching SQLState `23505` or the Hibernate `getConstraintName()` would be sturdier.
  - (b) Frontend naming is mixed. Components use Angular 21 style (`login.ts`), but `auth.guard.ts`, `auth.interceptor.ts` and `auth.service.ts` keep dot suffixes while `auth-helpers.ts` uses a hyphen. The plan prescribed these names; `angular.json` has no matching `typeSeparator`.
  - (c) Nothing tests `safeReturnUrl` directly for the `/\evil.com` branch.
  - (d) `roadmap.md` shows S-01 "in-progress" while `change.md` says implemented.
- **Fix**: Optional. Use a constraint-name check in (a). Set `typeSeparator: "."` in `angular.json` schematics for (b). Add a `safeReturnUrl` spec for (c). Sync the roadmap status for (d).
- **Decision**: PENDING
