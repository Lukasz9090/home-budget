## Project: home-budget (PennyPlan)

Envelope-budgeting web app. Two independent projects, no monorepo tooling:
- `backend/` — Spring Boot 4 / Java 21 / Maven. Always use the wrapper: `./mvnw test`, `./mvnw spring-boot:run` (run from `backend/`). Format Java with `./mvnw spotless:apply` (palantir-java-format).
- `frontend/` — Angular 21, standalone components + signals, npm. Tests are Vitest via `npm test` (not Karma/Jasmine). Format with Prettier (`.prettierrc`: single quotes, width 100); lint with `npm run lint` (angular-eslint).

- Local DB: `docker compose -f docker-compose-dev.yml up -d` (Postgres 16, db `budget`, user `home_u`). Backend expects it on `localhost:5432`.
- Schema is owned by Flyway migrations in `backend/src/main/resources/db/migration` (`ddl-auto: validate`). Never rely on Hibernate to create/alter tables — add a new `V<n>__*.sql` migration.
- Target deploy: Angular build is bundled into Spring's static resources and shipped as one container to Vercel (`Dockerfile.vercel`, Hobby plan, region `fra1`); Postgres is Neon free tier (`aws-eu-central-1`). Keep API routes under a prefix (e.g. `/api`) so they don't collide with SPA routes. Details and risks: `context/foundation/infrastructure.md`.
- Do not edit anything between the `@przeprogramowani/10x-cli` BEGIN/END markers below — the CLI regenerates it.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 3

Review AI-generated code before merge with the **implementation review chain**:

```
/10x-implement -> /10x-impl-review -> triage -> (/10x-lesson | fix | skip | disagree)
```

`/10x-impl-review` is the lesson focus. Review is a quality gate, not an instruction to fix every finding.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Code review (lesson focus)** | |
| `/10x-impl-review <change-id>` | You have implemented code and want a structured review before merge. The skill checks plan adherence, scope discipline, safety and quality, architecture, pattern consistency, and success criteria, then presents findings for triage. |
| **Recurring lesson outcome** | |
| `/10x-lesson` | A finding reveals a recurring project rule or agent failure pattern. Record it in `context/foundation/lessons.md` instead of treating it as a one-off note. |

### Triage discipline

- Severity says how bad the finding is. Impact says how much the decision matters now.
- Valid outcomes: fix now, fix differently, skip, accept as risk, record as recurring rule (`/10x-lesson`), disagree.
- Fix critical findings. Do not burn hours on low-impact observations just because the agent found them.
- Conscious skipping of low-impact findings is a valid review outcome, not negligence.
- If you disagree with a finding, record why. Wrong agent reasoning is also signal.

### Review boundaries

- This lesson reviews implemented code. It does not create the plan, execute new phases, or teach CI review.
- Testing strategy and quality gates are introduced in Module 3.
- Do not use `/10x-contract` as a triage outcome in this lesson.

### Paths used by this lesson

- `context/changes/<change-id>/plan.md` - expected implementation contract
- `context/changes/<change-id>/reviews/` - review output
- `context/foundation/lessons.md` - recurring lessons

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
