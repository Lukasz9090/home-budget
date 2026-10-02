## Project: home-budget (PennyPlan)

Envelope-budgeting web app. Two independent projects, no monorepo tooling:
- `backend/` — Spring Boot 4 / Java 21 / Maven. Always use the wrapper: `./mvnw test`, `./mvnw spring-boot:run` (run from `backend/`). Format Java with `./mvnw spotless:apply` (palantir-java-format).
- `frontend/` — Angular 21, standalone components + signals, npm. Tests are Vitest via `npm test` (not Karma/Jasmine). Format with Prettier (`.prettierrc`: single quotes, width 100); lint with `npm run lint` (angular-eslint).

- Local DB: `docker compose -f docker-compose-dev.yml up -d` (Postgres 16, db `budget`, user `home_u`). Backend expects it on `localhost:5432`.
- Schema is owned by Flyway migrations in `backend/src/main/resources/db/migration` (`ddl-auto: validate`). Never rely on Hibernate to create/alter tables — add a new `V<n>__*.sql` migration.
- Target deploy: Angular build is bundled into Spring's static resources and shipped as one container to Vercel (`Dockerfile.vercel`, Hobby plan, region `fra1`); Postgres is Neon free tier (`aws-eu-central-1`). Keep API routes under a prefix (e.g. `/api`) so they don't collide with SPA routes. Details and risks: `context/foundation/infrastructure.md`.
- Do not edit anything between the `@przeprogramowani/10x-cli` BEGIN/END markers below — the CLI regenerates it.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 2

Turn one roadmap item into the first implementation cycle with the **change planning chain**:

```
/10x-roadmap -> /10x-new -> /10x-plan -> /10x-plan-review -> /10x-implement
```

`/10x-new`, `/10x-plan`, `/10x-plan-review`, and `/10x-implement` are the lesson focus. `/10x-frame` and `/10x-research` are not required rituals here; they are escalation paths introduced in the next lesson.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Change setup (lesson focus)** | |
| `/10x-new <change-id>` | You selected a roadmap item and need a stable change folder. Creates `context/changes/<change-id>/change.md` so planning, implementation, progress, commits, and later review all share one identity. Use AFTER roadmap selection, BEFORE `/10x-plan`. |
| **Planning (lesson focus)** | |
| `/10x-plan <change-id>` | You have a change folder and need a reviewable implementation plan. Reads roadmap context, foundation docs, codebase evidence, and any existing change notes; writes `plan.md` and `plan-brief.md` with phases, file contracts, success criteria, and `## Progress`. |
| **Plan readiness (lesson focus)** | |
| `/10x-plan-review <change-id>` | You have `plan.md` and need a light pre-code readiness check. Use it to catch missing end state, weak contracts, malformed progress, scope drift, or blind spots before code changes begin. |
| **Implementation (lesson focus)** | |
| `/10x-implement <change-id> phase <n>` | You have an approved plan and want to execute one phase with verification, manual gate, commit ritual, and SHA write-back to `## Progress`. |
| **Lifecycle closure** | |
| `/10x-archive <change-id>` | A change is merged or intentionally closed. Move it out of active `context/changes/` into archive state. |

### How the chain hands off

- `/10x-new` creates the durable change identity.
- `/10x-plan` turns that identity into an implementation contract.
- `/10x-plan-review` checks the plan before the agent mutates code.
- `/10x-implement` executes one planned phase, verifies, asks for manual confirmation when needed, commits, and records progress.

### Lesson boundaries

- Plan is the default router after roadmap selection. Start with `/10x-plan` unless the problem is unclear or external evidence is blocking.
- Do not run `/10x-frame + /10x-research` as ceremony for every change.
- Do not turn this lesson into a full end-to-end product build. A checkpoint with a planned and partially or fully implemented stream is valid.
- Code review of the implemented diff belongs to Lesson 3 via `/10x-impl-review`.
- Lifecycle closure via `/10x-archive` after a change is merged or intentionally closed.

### Paths used by this lesson

- `context/foundation/roadmap.md` - upstream roadmap
- `context/changes/<change-id>/change.md` - change identity
- `context/changes/<change-id>/plan.md` - implementation contract
- `context/changes/<change-id>/plan-brief.md` - compressed handoff
- `context/foundation/lessons.md` - recurring rules and pitfalls
- `docs/reference/contract-surfaces.md` - load-bearing names registry

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
