# Contract Surfaces

> Load-bearing names that other code, the browser, stored sessions, or the database depend on. Renaming or reshaping any of them is a breaking change: the plan must flag it and describe the migration for every consumer listed. Each H2 is one surface name (plan reviews grep for them).

## /api/auth/register

- **Shape**: `POST`, JSON `{ "email": string, "password": string }` (email ≤ 254, valid; password 8–72). **201** `{ "id": uuid, "email": string }` and the caller is logged in (new `SESSION`, rotated `XSRF-TOKEN`). **409** ProblemDetail when the e-mail is taken (case-insensitive); **400** ProblemDetail with `errors: { field: message }`; **403** without a valid CSRF header.
- **Defined in**: `backend/src/main/java/com/homebudget/account/AuthController.java`
- **Consumers**: Angular `AuthService.register` (S-01 Phase 3).

## /api/auth/login

- **Shape**: `POST`, JSON `{ "email", "password" }`. **200** `{ "id", "email" }` with a new session id (fixation protection) and rotated `XSRF-TOKEN`. **401** ProblemDetail with the single generic `detail` "Nieprawidłowy e-mail lub hasło." for an unknown e-mail and a wrong password alike.
- **Defined in**: `AuthController.java`
- **Consumers**: Angular `AuthService.login`.

## /api/auth/logout

- **Shape**: `POST` (CSRF-protected), no body. **204**; invalidates the session and clears the `SESSION` cookie.
- **Defined in**: `backend/src/main/java/com/homebudget/config/SecurityConfig.java` (Spring Security logout filter, not a controller).
- **Consumers**: Angular `AuthService.logout`.

## /api/me

- **Shape**: `GET`. **200** `{ "id": uuid, "email": string }` for the logged-in account; **401** when anonymous (the response still sets `XSRF-TOKEN`, which bootstraps CSRF for the first POST).
- **Defined in**: `AuthController.java`
- **Consumers**: Angular `AuthService.ensureLoaded`, auth/guest guards. Everything under `/api/**` except `/api/auth/**` requires authentication and answers 401 (never a redirect).

## SESSION

- **Shape**: Spring Session JDBC cookie (`SPRING_SESSION` tables, Flyway `V1`), `HttpOnly`, `SameSite=Lax`, `Max-Age` 45 days, re-sent on every authenticated request so it expires 45 days after the last visit (sliding). The session stores the JDK-serialised `SecurityContext` holding `AccountPrincipal`.
- **Defined in**: `backend/src/main/resources/application.yaml` (`spring.session.*`, `server.servlet.session.cookie.*`), `SlidingSessionCookieFilter.java`
- **Consumers**: the browser; logout's `deleteCookies("SESSION")`; `CookieJarClient` in tests.

## XSRF-TOKEN

- **Shape**: CSRF cookie, readable by JavaScript (not `HttpOnly`), written on every response and rotated on login/register.
- **Defined in**: `SecurityConfig.java` (`CookieCsrfTokenRepository.withHttpOnlyFalse()`), `CsrfCookieFilter.java`
- **Consumers**: Angular `HttpClient` default XSRF support (reads this cookie name).

## X-XSRF-TOKEN

- **Shape**: request header carrying the raw `XSRF-TOKEN` cookie value; required on every mutating request (POST/PUT/PATCH/DELETE), otherwise 403.
- **Defined in**: `SecurityConfig.java` + `SpaCsrfTokenRequestHandler.java`
- **Consumers**: Angular `HttpClient` default XSRF support (sends this header name); `CookieJarClient`.

## users

- **Shape**: table `users` — `id uuid primary key`, `email varchar(254) not null` (stored trimmed + lowercased, unique index `users_email_uk`), `password_hash varchar(100) not null` (`{bcrypt}…`), `created_at timestamptz not null`. The owner referenced by every `owner_id`.
- **Defined in**: `backend/src/main/resources/db/migration/V2__users.sql`, `Account.java`
- **Consumers**: every domain table via `owner_id` foreign keys; `AccountRepository`.

## owner_id

- **Shape**: column convention for every domain table — `owner_id uuid not null references users(id)`, with an index whose first column is `owner_id`. Every query filters by it; a foreign row answers 404. See the "Every read and write is owner-scoped" rule in `context/foundation/lessons.md`.
- **Defined in**: convention (first applied in S-02 migrations).
- **Consumers**: all owner-scoped repositories (`...ByOwnerId`, `findByIdAndOwnerId`).

## CurrentUser

- **Shape**: Spring bean `com.homebudget.account.CurrentUser` — `UUID id()` and `AccountPrincipal principal()`; both throw `AuthenticationCredentialsNotFoundException` (answered with 401) when no account is logged in. The only source of the owner id in controllers.
- **Defined in**: `backend/src/main/java/com/homebudget/account/CurrentUser.java`
- **Consumers**: `AuthController.me`; every owner-scoped controller from S-02.

## AccountPrincipal

- **Shape**: `com.homebudget.account.AccountPrincipal` (`UserDetails`, `Serializable`, `serialVersionUID = 1L`) exposing `UUID id()` and `String email()`; password hash erased after authentication. JDK-serialised into `SPRING_SESSION_ATTRIBUTES` — renaming/moving the class or changing its fields incompatibly logs every user out once.
- **Defined in**: `backend/src/main/java/com/homebudget/account/AccountPrincipal.java`
- **Consumers**: `CurrentUser`, `AccountUserDetailsService`, stored sessions, `TestAccounts`.

## TestAccounts

- **Shape**: test component `com.homebudget.support.TestAccounts` — `create()` / `create(String emailPrefix)` persist an account with a unique e-mail and return its `AccountPrincipal`; static `as(AccountPrincipal)` is a MockMvc `RequestPostProcessor` (= `user(principal)` + a matching `XSRF-TOKEN` cookie / `X-XSRF-TOKEN` header, so GETs and mutating requests both work). Autowire it in any `@SpringBootTest`.
- **Defined in**: `backend/src/test/java/com/homebudget/support/TestAccounts.java`
- **Consumers**: cross-account tests of every slice (`AccountIsolationTests` is the template).
