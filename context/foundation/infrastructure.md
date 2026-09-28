---
project: PennyPlan (home-budget)
researched_at: 2026-09-28
recommended_platform: Vercel (Hobby, container image via Dockerfile.vercel, region fra1) + Neon Postgres free (aws-eu-central-1)
runner_up: Google Cloud Run (europe-west3) + Neon Postgres free
context_type: mvp
tech_stack:
  language: Java 21 + TypeScript
  framework: Spring Boot 4.1 (Maven) + Angular 21 bundled as static resources
  runtime: JVM container (single deployable unit), PostgreSQL 16 (Neon-managed)
---

## Recommendation

**Deploy the single Spring Boot + Angular container on Vercel (Hobby plan, `Dockerfile.vercel`, region `fra1`) with PostgreSQL 16 on Neon free tier (`aws-eu-central-1`, Frankfurt).**

This is the **developer's decision**, taken after reviewing the scored comparison. Under the $0/month constraint the scored leader was Cloud Run + Neon (22 pts); Vercel was chosen for the app because it needs **no credit card** (Hobby stops the function on overage instead of billing), keeps the single-deployable-unit architecture and puts deploy/env/logs/rollback behind one CLI. Neon was chosen for the database over Supabase because Supabase free projects **pause after 7 idle days and need a manual dashboard unpause**, while Neon auto-suspends after 5 minutes and **wakes automatically** on the next connection. Both services run in Frankfurt on AWS, so app↔DB latency is minimal.

Accepted costs: Vercel container images are a new feature (announced 2026-06-30); Hobby's fixed 2 GB instances give a provisioned-memory budget of **~180 instance-hours/month**, and breaching it stops the app for up to 30 days; JVM cold start plus Neon wake adds up to 10–15 s on the first request after idle; Neon free keeps only a 6-hour restore window, so backups are our job.

**Superseded decisions:** `tech-stack.md` (`deployment_target`) and `CLAUDE.md` (target deploy line) originally named Fly.io; both were updated to Vercel + Neon on 2026-09-28. Earlier versions of this file (Cloud Run + Neon, then Vercel + Supabase) are replaced.

## Interview answers (constraints)

| Question | Answer | Effect |
|---|---|---|
| Persistent processes | Spring Boot is a long-running server waiting for requests | Requires a JVM container runtime. Vercel was a hard-filter drop in round 1 (Functions-only); re-admitted after Vercel container images (2026-06-30) were verified |
| Cost vs DX | Initially "roughly equal"; after cross-check: **"something free"** | Hard $0/month constraint |
| Familiarity | AWS / GCP / Azure | Tie-break signal only; not decisive in the final pick |
| Geography | Single region (Poland) | EU region required → Vercel `fra1`, Neon `aws-eu-central-1` |
| Co-location | Preferred | Relaxed — no free platform offers app + persistent Postgres together; compensated by same city / same cloud (AWS Frankfurt) |

## Platform Comparison

Scoring: Pass = 2, Partial = 1, Fail = 0. Weights: CLI-first ×3, Managed ×3, Stable deploy API ×3, Agent-readable docs ×2, MCP ×1 (max 24), then interview adjustments.

### Round 1 — all candidates, cost "roughly equal"

| Platform | CLI | Managed | Docs | Deploy API | MCP | Raw | Adjustments | Total |
|---|---|---|---|---|---|---|---|---|
| Fly.io + Managed Postgres | Pass | Pass | Pass | Pass | Pass | 24 | cost −2 (≈$44/mo) | 22 |
| Cloud Run + Cloud SQL | Pass | Pass | Partial | Pass | Pass | 22 | familiarity +1, always-on −1 | 22 |
| Railway | Pass | Pass | Pass | Partial | Pass | 21 | — (≈$10–25/mo) | 21 |
| Render | Pass | Pass | Pass | Pass | Partial | 23 | cost −2 (≈$32–45/mo) | 21 |
| Cloudflare Containers | Pass | Partial | Pass | Partial | Pass | 18 | co-location −2, JVM cold start −2 | 14 |
| Vercel / Netlify | — | — | — | — | — | — | hard filter (Functions only, no JVM) — *Vercel later re-admitted, see round 3* | dropped |

Fly.io led but was rejected on cost (Managed Postgres Basic $38/mo; unmanaged Fly Postgres deprecated; no free tier for new accounts).

### Round 2 — $0/month constraint

| Option (DB) | CLI | Managed | Docs | Deploy API | MCP | Raw | Free & JVM fit | Total |
|---|---|---|---|---|---|---|---|---|
| Cloud Run (Neon) | Pass | Pass | Partial | Pass | Pass | 22 | free tier valid in EU; card required; cold start −1; familiarity +1 | 22 |
| Azure Container Apps (Neon) | Pass | Pass | Partial | Pass | Partial | 21 | free grant; card required; cold start −1; familiarity +1 | 21 |
| Render free (Neon) | Pass | Pass | Pass | Pass | Partial | 23 | 512 MB / 0.1 CPU −2; ~1 min wake −1 | 20 |
| Koyeb, Oracle Always Free, AWS (App Runner closed to new customers 2026-04-30) | | | | | | | | dropped |

### Round 3 — developer-proposed: Vercel container

| Option (DB) | CLI | Managed | Docs | Deploy API | MCP | Raw | Free & JVM fit | Total |
|---|---|---|---|---|---|---|---|---|
| **Vercel container (Neon)** | Pass (`vercel`) | Pass | Pass (`llms.txt`, docs as `.md`) | Partial (Hobby rollback limited; container feature 3 months old) | Partial (Vercel MCP public beta; Neon MCP available) | 20 | no card, hard stop instead of bill; fixed 2 GB → ~180 instance-h/mo −1; cold start −1 | 18 |
| Vercel container (Supabase) | same | | | | | 20 | as above; plus 7-day pause with manual unpause | rejected by developer |

**Decision:** developer chose Vercel + Neon over the scored leader (Cloud Run + Neon, 22) — primarily for no-card, hard-capped cost and a single vendor CLI for the app. Recorded as a conscious override.

Free Postgres ranking: **Neon** (GA, 0.5 GB, 100 CU-h/month, auto-suspend after 5 min with automatic wake, Frankfurt, no card, `neonctl` + MCP, 6 h restore window) > Aiven free (always-on, region not selectable, no backups) > Supabase free (500 MB, 7-day pause with manual unpause, no backups, direct connection IPv6-only) > Koyeb (5 CU-h/month) > Render free (expires after 30 days). Xata free tier retired Feb 2026. Neon's Azure regions were deprecated 2026-04-07 (AWS regions only).

### Shortlisted Platforms

#### 1. Vercel + Neon (Chosen)

One `vercel` CLI for deploy, env vars, logs and rollback; Git-integrated preview deployments per branch; no card required, and Hobby stops the function instead of billing on overage. `Dockerfile.vercel` at repo root is auto-detected, built, pushed to Vercel Container Registry and served from a Vercel Function on Fluid compute ([Container Images](https://vercel.com/docs/functions/container-images), [changelog 2026-06-30](https://vercel.com/changelog/bring-your-dockerfile-to-vercel-functions)). Neon provides serverless Postgres 16 in Frankfurt with branching — a free `preview` branch replaces a separate preview database.

#### 2. Cloud Run + Neon (Runner-up, scored leader)

Mature GA platform, confirmed EU free tier (≈180k vCPU-s, 360k GiB-s, 2M requests/month on request-based billing), immutable revisions with one-command rollback, `--cpu-boost` for JVM start, configurable memory (1 GiB instead of a fixed 2 GB). Requires a card. Same container image and same Neon database — the fallback is a redeploy, not a rewrite.

#### 3. Azure Container Apps + Neon

Same scale-to-zero model with a monthly free grant; less verified agent tooling. All-Azure variant (Azure Database for PostgreSQL B1MS) is free only for 12 months, then ≈$15–20/mo (estimate).

## Anti-Bias Cross-Check: Vercel + Neon

*(Earlier cross-checks: Fly.io — rejected on cost; Cloud Run + Neon — accepted, then superseded; Vercel + Supabase — rejected over the manual unpause.)*

### Devil's Advocate — Weaknesses

1. **Memory budget is the real limit, not CPU.** Hobby functions are fixed at 2 GB / 1 vCPU and cannot be lowered ([limits](https://vercel.com/docs/functions/limitations)). 360 GB-h provisioned memory ÷ 2 GB = **~180 instance-hours per month**, counted for the whole instance lifetime including idle time between requests. How long Fluid compute keeps an idle container instance alive is not documented. Exceeding the Hobby limit blocks the feature **until 30 days pass** — the app would be down, not billed.
2. **Stacked cold starts.** JVM start on 1 vCPU without a startup-CPU boost (Spring Boot 4 + Hibernate + Flyway ≈ 8–15 s) plus Neon compute wake (0.5–2 s) → first request after idle ≈ 10–15 s.
3. **Almost no backup.** Neon free keeps a 6-hour / 1 GB restore window; Vercel keeps no data. The PRD guardrail "month history never disappears" depends on our own dumps.
4. **The container feature is three months old.** Little community experience with Spring Boot on it; unknowns around instance reuse, idle eviction, writable filesystem (Tomcat work dir), request duration limits and log visibility.
5. **Neon compute quota can be drained by idle connections.** 100 CU-hours/month (≈400 h at 0.25 CU) is plenty only if the compute actually suspends. A Hikari pool holding connections open from a Vercel instance that is kept alive but frozen between requests may keep Neon awake.

### Pre-Mortem — How This Could Fail

The team deployed the container with Vercel defaults. The function landed in `iad1` (Virginia) while Neon sat in Frankfurt, so each page made several transatlantic round trips and the month view took four seconds even when warm. After moving to `fra1`, things looked fine — until day 19, when Vercel's usage page showed provisioned memory at 100%: each wake-up kept a 2 GB instance alive much longer than expected. Hobby blocked the function for the rest of the cycle and the app returned errors for eleven days, right over the end-of-month ritual. In parallel, the Hikari pool kept its minimum idle connections open, Neon's compute never suspended, and the 100 CU-hour quota ran out in week three, so the database refused connections too. A preview deployment shared the production connection string, and a branch with an experimental Flyway migration altered the live schema; by the time anyone noticed, Neon's six-hour restore window had passed. Sessions were in memory, so every cold start logged users out. None of this was a Vercel or Neon bug — it was defaults nobody reviewed.

### Unknown Unknowns

- **Default region is `iad1`.** Functions run in Washington D.C. unless `regions: ["fra1"]` is set in `vercel.json` ([limits](https://vercel.com/docs/functions/limitations)). Verify it applies to the container function on the first deploy (response header `x-vercel-id` should contain `fra1`).
- **Neon connection strings are not JDBC URLs.** Neon (and Neon's Vercel integration) hands out `postgresql://user:pass@host/db?sslmode=require`. Spring needs `jdbc:postgresql://host/db?sslmode=require` plus separate username/password — set three env vars by hand rather than relying on an auto-injected `DATABASE_URL`.
- **Use the direct (non-`-pooler`) endpoint.** The pooled endpoint runs PgBouncer in transaction mode, which conflicts with Flyway's session-level statements and can trip Hibernate's server-side prepared statements. At this scale (one instance, pool of 3) the direct endpoint is sufficient for both app and Flyway — one URL.
- **Preview deployments get production env vars unless scoped.** Vercel env vars are scoped per environment (Production / Preview / Development). Point the Preview scope at a Neon **`preview` branch** (free tier allows 10 branches), or Flyway on a feature branch will migrate production.
- **A nightly `pg_dump` costs only minutes of compute.** A scheduled GitHub Actions job wakes Neon briefly (a few CU-minutes), doesn't touch the Vercel function, and closes the backup gap left by the 6-hour restore window.
- **Hobby is for non-commercial use only.** Fine for a course/personal project; monetising PennyPlan requires Pro ($20/mo).

## Operational Story

- **Preview deploys**: Vercel Git integration builds every pushed branch/PR into a preview URL (`pennyplan-git-<branch>-<team>.vercel.app`). Preview-scoped env vars point at the Neon `preview` branch (reset it from `main` when needed: `neonctl branches reset preview --parent`). Keep Vercel Deployment Protection on for previews. Fork PRs don't get secrets.
- **Secrets**: Vercel environment variables (`vercel env add SPRING_DATASOURCE_URL production`, marked Sensitive) plus a separate set for `preview`. GitHub Actions secrets hold only `VERCEL_TOKEN` (scoped to the project/team) and `NEON_BACKUP_URL` for the dump job. Rotation: reset the role password (`neonctl roles reset-password` or Neon console — human) → `vercel env rm/add` → `vercel deploy --prod` (env changes need a redeploy).
- **Rollback**: `vercel rollback` (Hobby: to the previous production deployment) or `vercel promote <deployment-url>` for a specific earlier build — seconds. Flyway migrations do **not** roll back: migrations must be additive (expand → contract); take a manual `pg_dump` before any destructive change. Neon's 6-hour restore window (`neonctl branches restore`) is a last resort for very recent mistakes only.
- **Approval**: Agent may unattended — `vercel deploy` (preview), read logs, `vercel ls`, `vercel inspect`, create/reset the Neon `preview` branch, run the backup workflow, read-only queries. Human only — `vercel deploy --prod` / promote after a failed release, password rotation, deleting the Vercel project or Neon project/`main` branch, restoring `main` from history, destructive migrations, changing Production env vars.
- **Logs**: `vercel logs <deployment-url>` (runtime logs; Hobby retention is short — check soon after an incident), `vercel inspect <deployment-url> --logs` (build logs), `gh run view --log-failed` (CI), `neonctl operations list` and the Neon console Monitoring page (compute active time, connections). Vercel MCP (public beta) and Neon MCP can be added later for structured queries.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Provisioned-memory limit (~180 instance-h) exhausted → function blocked up to 30 days | Devil's advocate / Pre-mortem | M | H | Check Vercel Usage → Provisioned Memory weekly during the first month; no uptime pingers hitting the app; if trending above 60%, redeploy the same image to Cloud Run (runner-up) |
| Neon compute never suspends (idle pool) → 100 CU-h quota exhausted | Devil's advocate / Pre-mortem | M | H | Hikari `minimum-idle: 0`, `idle-timeout: 30000`, `max-lifetime: 300000`; health endpoint without DB check; watch compute active time in Neon console after the first week |
| No real backups (6 h restore window) | Devil's advocate / Pre-mortem | M | H | Nightly GitHub Actions `pg_dump` (direct endpoint), stored as private artifact/storage with 30-day retention; manual dump before destructive migrations |
| Function runs in `iad1`, far from DB | Unknown unknowns / Pre-mortem | H (if unset) | M | `vercel.json` → `"regions": ["fra1"]`; verify via `x-vercel-id` header |
| Preview deploy migrates production DB | Unknown unknowns / Pre-mortem | M | H | Neon `preview` branch; Vercel env vars scoped Production vs Preview |
| `postgresql://` URL fed to Spring / pooled endpoint breaks Flyway | Unknown unknowns | H (if unnoticed) | M | Hand-set `SPRING_DATASOURCE_URL` in `jdbc:postgresql://…?sslmode=require` form, direct endpoint, separate username/password vars |
| Users logged out on every cold start | Devil's advocate / Pre-mortem | H | H | Spring Session JDBC (tables via Flyway) or persistent remember-me token; long cookie TTL |
| 10–15 s first request after idle | Devil's advocate | H | M | Loading state in the SPA; `-XX:TieredStopAtLevel=1`, CDS archive, lazy init where safe; Hikari `connection-timeout: 15000` to survive Neon wake |
| Immature container feature behaves unexpectedly (fs, eviction, limits) | Devil's advocate | M | M | Smoke-test first deploy (login, write, cold restart); keep the Cloud Run runbook as fallback |
| Spring Boot 4 missing Flyway module → migrations silently not run | Research finding | H | H | Add `spring-boot-starter-flyway` + `org.flywaydb:flyway-database-postgresql`; verify `flyway_schema_history` after first deploy |
| Hobby is non-commercial | Unknown unknowns | L | M | Upgrade to Pro ($20/mo) before any monetisation |
| Foundation docs drift from the platform decision | Research finding | L | L | Done 2026-09-28: `tech-stack.md` and `CLAUDE.md` updated to Vercel + Neon; re-check after any future platform swap |

## Getting Started

Checked against repo state on 2026-09-28: Spring Boot **4.1.1**, Java **21**, Angular 21; no Dockerfile, no Flyway dependency, no `db/migration` directory, datasource hard-coded in `application.yaml`.

1. **Make the app cloud-ready (code).**
   - `backend/pom.xml`: add `spring-boot-starter-flyway`, `org.flywaydb:flyway-database-postgresql`, `spring-session-jdbc`, `spring-boot-starter-actuator`.
   - `application.yaml`: `spring.datasource.url/username/password` from `${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/budget}`, `${SPRING_DATASOURCE_USERNAME:home_u}`, `${SPRING_DATASOURCE_PASSWORD:home_p}`; Hikari `maximum-pool-size: 3`, `minimum-idle: 0`, `idle-timeout: 30000`, `connection-timeout: 15000`; `server.port: ${PORT:8080}`; `server.forward-headers-strategy: framework`; `management.health.db.enabled: false`.
   - SPA serving: Angular build output copied into `static/`; a `WebMvcConfigurer` resource handler with `PathResourceResolver` falling back to `index.html` for non-`/api` paths; Spring Security permits static assets and SPA routes, protects `/api/**` (except `/api/auth/**`) and answers 401 instead of redirecting.
2. **Add `Dockerfile.vercel` at the repo root** (multi-stage; done 2026-09-28): `node:24-slim` with npm pinned to `package.json` `packageManager` (newer npm and Alpine/musl both reject the Windows-generated lockfile — `@emnapi/*` missing) → `npm ci && npm run build` in `frontend/` → `eclipse-temurin:21-jdk` copies `frontend/dist/frontend/browser/` into `backend/src/main/resources/static/` and runs `./mvnw -B package -DskipTests` → `eclipse-temurin:21-jre` runtime with `JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"`, non-root user, `ENV PORT=80` (verified locally: non-root binds port 80, start ≈10 s, SPA fallback 200, `/api` 401, health `UP` without DB check). Add `vercel.json` with `{ "regions": ["fra1"] }`. Also done: Spring Session JDBC with `cleanup-cron` once a day (the default every-minute cleanup would keep Neon awake) and 45-day session/cookie lifetime.
3. **Create the Neon database (no card).** `npm i -g neonctl` → `neonctl auth` → `neonctl projects create --name pennyplan --region-id aws-eu-central-1 --pg-version 16` → `neonctl branches create --name preview` → `neonctl connection-string main` and `neonctl connection-string preview` (direct endpoints). Rewrite each as `jdbc:postgresql://<host>/<db>?sslmode=require` and keep user/password separate.
4. **Link Vercel and set env vars.** `npm i -g vercel` → `vercel login` → `vercel link` → for each of `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`: `vercel env add <NAME> production` (Neon `main`) and `vercel env add <NAME> preview` (Neon `preview`). Connect the GitHub repo in Vercel for automatic preview/production deploys on push/merge.
5. **Deploy and verify.** `vercel deploy` (preview) → check login, a write, `flyway_schema_history` in the DB, `x-vercel-id` containing `fra1`, and that Neon's compute suspends ~5 min after the last request → `vercel deploy --prod`. Then add GitHub Actions: tests on PR (`./mvnw test`, `npm test`) and a nightly scheduled `pg_dump` against Neon `main` (backup).

## Out of Scope

The following were not evaluated in this research:
- Docker image configuration (beyond the outline above)
- CI/CD pipeline setup (beyond naming the workflows to add)
- Production-scale architecture (multi-region, HA, DR)
- Custom domain and email delivery (email verification is out of MVP per PRD)
