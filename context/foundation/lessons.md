# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Every read and write is owner-scoped

- **Context**: Any slice that adds a domain table, repository, or `/api/**` endpoint (categories, envelopes, transactions, months, … — S-02 onwards). `users` is the only table exempt: it *is* the owner.
- **Problem**: One missing filter lets an account read or change another account's budget — the PRD's isolation guardrail. Scoping that is left to "remember in the controller" is forgotten on the one endpoint nobody re-checks, and a 403 on a foreign id confirms that the id exists.
- **Rule**:
  - Every domain table has `owner_id uuid not null references users(id)` plus an index whose first column is `owner_id` (e.g. `(owner_id)` or `(owner_id, month)`), added in a Flyway migration.
  - Repository methods take `UUID ownerId` and filter by it (`findAllByOwnerId`, `findByIdAndOwnerId`, `deleteByIdAndOwnerId`, …). Controllers and services never call the unscoped `findById` / `findAll` / `deleteById` inherited from `JpaRepository`.
  - Controllers get the owner id only from `CurrentUser.id()` — never from the request body, path, or query string. New rows get `owner_id` set from `CurrentUser.id()` on the server.
  - A resource that does not exist **or belongs to another account** answers **404** (not 403), so ids are never confirmed across accounts.
  - Every slice adds a cross-account test with `TestAccounts`: create accounts A and B, create data as A, assert that B's list does not contain it and B's get/update/delete by A's id answers 404 (template: `backend/src/test/java/com/homebudget/account/AccountIsolationTests.java`).
- **Applies to**: plan, plan-review, implement, impl-review

## Session cookie tests need a real embedded server

- **Context**: Backend tests asserting `server.servlet.session.cookie.*` attributes (`Max-Age`, `HttpOnly`, `SameSite`) of the `SESSION` cookie.
- **Problem**: In the default `@SpringBootTest` mock environment Boot treats the app as a war deployment and takes session cookie settings from the (mock) servlet container, so `max-age: 45d` is silently missing and the test fails — or, worse, a test is "fixed" against the wrong cookie.
- **Rule**: Run such tests with `@SpringBootTest(webEnvironment = RANDOM_PORT)` (MockMvc still works alongside it); see `SessionCookieTests`.
- **Applies to**: implement, impl-review

## Never use Spring's csrf() test post-processor

- **Context**: MockMvc tests in `@SpringBootTest` classes (they share one cached application context).
- **Problem**: `SecurityMockMvcRequestPostProcessors.csrf()` permanently replaces the `CsrfFilter`'s cookie repository with a session-based one in the shared context; every later test relying on the real `XSRF-TOKEN` cookie then gets 403 (seen in S-01: all `AuthFlowTests` failed after `AccountIsolationTests` ran).
- **Rule**: Authenticate test requests with `TestAccounts.as(principal)`, which sends the CSRF token as the browser does (cookie + `X-XSRF-TOKEN` header); for cookie-replay flows use `CookieJarClient`. Do not call `csrf()`.
- **Applies to**: implement, impl-review
