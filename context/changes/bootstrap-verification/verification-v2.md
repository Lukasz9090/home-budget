---
bootstrapped_at: 2026-09-27T04:59:12Z
starter_id: spring
starter_name: Spring Boot
project_name: home-budget
language_family: multi
package_manager: maven
cwd_strategy: subdir-then-move
bootstrapper_confidence: verified
phase_3_status: ok
audit_command: "null"
---

> **Re-verify run.** Nothing was scaffolded this time. The project was already bootstrapped at 2026-09-27T04:22:44Z (see `verification.md`), and the user chose to re-run the checks without scaffolding again. This log records the state of the existing `backend/` and `frontend/` trees.

## Hand-off

```yaml
starter_id: spring
package_manager: maven
project_name: home-budget
hints:
  language_family: multi
  team_size: solo
  deployment_target: fly
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: true
    can_judge_agent: true
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
```

### Why this stack

A solo developer building PennyPlan, an envelope-budgeting web app with a 3-week after-hours MVP, chose Java + Spring Boot for the backend and Angular + TypeScript for the frontend, and wants to implement both. Spring Boot is the scaffolded starter because it owns the load-bearing parts: email/password auth with a long session via Spring Security, and the budget domain (months, categories, percentage splits, cumulative pools) on PostgreSQL via Spring Data JPA. The Angular frontend lives in a `frontend/` subfolder, scaffolded separately with the Angular CLI (`npx @angular/cli new frontend --defaults --routing --style scss --ssr false`) right after bootstrap, since the hand-off carries one starter. The build bundles Angular into Spring's static resources so the app ships as one deployable unit to Fly. Plain backend + frontend layout, no monorepo tooling, Maven as the starter prescribes. Both stacks pass all four agent-friendly gates and the self-check came back clean. Known cost accepted consciously: Angular is heavyweight for a solo MVP. LLM analysis is deferred to v2, so `has_ai` is false. CI runs on GitHub Actions with auto-deploy on merge.

Note: the hand-off says `language_family: multi`, while the registry card for `spring` says `java`. Both map to a null audit command, so the result is the same.

## Pre-scaffold verification

| Signal      | Value   | Severity | Notes                                                                 |
| ----------- | ------- | -------- | --------------------------------------------------------------------- |
| npm package | not run | n/a      | not a JS starter; the template uses Spring Initializr (curl), not npm |
| GitHub repo | not run | n/a      | card `docs_url` is `https://docs.spring.io/spring-boot/`, not a GitHub repo, so no recency signal is available |

## Scaffold log

**Resolved invocation**: none. The scaffold was not re-run.
**Reason**: the directory already had scaffold files (`backend/pom.xml`, `frontend/package.json`) from the run at 2026-09-27T04:22:44Z. The registry template targets the project root with only `web,devtools`, so running it again would have added a second, stripped-down Spring project next to `backend/`. The user chose "re-verify only".
**Strategy**: n/a (the original run scaffolded into a temp directory, then moved the files into `backend/`)
**Files moved**: 0
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: unchanged
**.bootstrap-scaffold cleanup**: n/a (not created)

### Existing tree, as verified

- **Backend** (`backend/`): Spring Boot 4.1.1, Java 21 target. Starters: webmvc, security, data-jpa, devtools, postgresql (+ matching `*-test` starters). Package `com.homebudget`.
- **Frontend** (`frontend/`): Angular ^21.2.0, SCSS, routing, no SSR, npm. `node_modules` installed.
- **Local toolchain**: Node v24.12.0, OpenJDK 26.0.1.

### Build check (backend)

`./mvnw -q -DskipTests compile` → **exit 0**. The earlier run's Maven TLS failure (`PKIX path building failed`) is resolved, and dependencies now resolve from Maven Central.

## Post-scaffold audit

**Tool**: skipped. There is no single audit tool that covers this multi-language stack.

Extra check, beyond the configured audit:
- **Frontend** `npm audit --json` (in `frontend/`, exit 0): 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW, 0 INFO across 574 dependencies (4 prod, 565 dev). Clean tree.
- **Backend**: not audited. Maven has no built-in audit tool. Now that dependencies resolve, OWASP Dependency-Check (`org.owasp:dependency-check-maven`) or Snyk can be added.

## Hints recorded but not acted on

| Hint                    | Value                |
| ----------------------- | -------------------- |
| bootstrapper_confidence | verified             |
| quality_override        | false                |
| path_taken              | custom               |
| self_check_answers      | typed: true, from_official_starter: true, conventions: true, docs_current: true, can_judge_agent: true |
| team_size               | solo                 |
| deployment_target       | fly                  |
| ci_provider             | github-actions       |
| ci_default_flow         | auto-deploy-on-merge |
| has_auth                | true                 |
| has_payments            | false                |
| has_realtime            | false                |
| has_ai                  | false                |
| has_background_jobs     | false                |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- Configure `spring.datasource.*` in `backend/src/main/resources/application.properties`. With JPA and the PostgreSQL driver on the classpath, the app (and `HomeBudgetApplicationTests`) will not start without a datasource.
- Spring Security is on the classpath, so every endpoint requires auth by default, using a generated password that is printed at startup.
- Wire the Angular production build into Spring's static resources (described in the hand-off; not done yet).
- Add a backend dependency audit (OWASP Dependency-Check or Snyk).
