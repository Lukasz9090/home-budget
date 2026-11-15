## Project: home-budget (PennyPlan)

Envelope-budgeting web app. Two independent projects, no monorepo tooling:
- `backend/` — Spring Boot 4 / Java 21 / Maven. Always use the wrapper: `./mvnw test`, `./mvnw spring-boot:run` (run from `backend/`). Format Java with `./mvnw spotless:apply` (palantir-java-format).
- `frontend/` — Angular 21, standalone components + signals, npm. Tests are Vitest via `npm test` (not Karma/Jasmine). Format with Prettier (`.prettierrc`: single quotes, width 100); lint with `npm run lint` (angular-eslint).

- Local DB: `docker compose -f docker-compose-dev.yml up -d` (Postgres 16, db `budget`, user `home_u`). Backend expects it on `localhost:5432`.
- Schema is owned by Flyway migrations in `backend/src/main/resources/db/migration` (`ddl-auto: validate`). Never rely on Hibernate to create/alter tables — add a new `V<n>__*.sql` migration.
- Target deploy: Angular build is bundled into Spring's static resources and shipped as one container to Vercel (`Dockerfile.vercel`, Hobby plan, region `fra1`); Postgres is Neon free tier (`aws-eu-central-1`). Keep API routes under a prefix (e.g. `/api`) so they don't collide with SPA routes. Details and risks: `context/foundation/infrastructure.md`.
- Do not edit anything between the `@przeprogramowani/10x-cli` BEGIN/END markers below — the CLI regenerates it.

## UI

Mockups (registry: `context/design/mockups.md`):
- Any work that creates a screen or changes how a screen looks (new view, layout, restyle, `/10x-ui`) starts by looking the route up in `context/design/mockups.md` — in planning and in implementation alike.
- No row, or no desktop or no mobile link → stop and report `BRAK MAKIETY: <ekran> (<trasa>)`. Do not build from a description, a similar screen or a guess.
- Figma MCP not configured, failing or over quota → stop and report `BRAK DOSTĘPU DO MAKIETY: <ekran> — <powód>`. Never continue from memory.
- Undrawn states (empty, error, loading, focus, disabled) are built from kitchen-sink components and listed as "bez makiety" in the plan; they are not an error.
- Discrepancies — a colour outside the tokens, an element with no counterpart in `frontend/libs/ui`, copy or behaviour that differs from the current code/PRD — are reported and asked about, never resolved silently (no invented token, no silent deviation from the mockup).
- Read each frame once and deposit what it shows in the change folder (Figma API quota).
- Exempt: `/dev/*` routes and changes with no visual effect (logic, tests).

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 5 (10xDevs 4.0 UI)

**For UI work on a view that already renders, start with `/10x-ui <view>`.** It is the
entry point: a short pre-audit, a suggested change-id and the `/10x-new` command for you to
run, then the audit brief for `/10x-research`. The visual change goes through the same chain
as any other change (`/10x-new` → `/10x-research` → `/10x-plan` → `/10x-implement` →
`/10x-impl-review`); `/10x-ui <change-id>` resumes at the first step not yet done. It carries
the rules:
when to start and which view, the audit into charges, the design-system contract as
this repo realises it, the component states, the screenshot gate, and the rule that
keeps the next agent on the contract. Its `references/` hold the quality checklist.

Building a view for the first time is not a `/10x-ui` job — build it through the
ordinary chain, then come back to it with `/10x-ui`.

<!-- END @przeprogramowani/10x-cli -->
