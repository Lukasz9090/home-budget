---
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
---

## Why this stack

A solo developer building PennyPlan, an envelope-budgeting web app with a 3-week after-hours MVP, chose Java + Spring Boot for the backend and Angular + TypeScript for the frontend, and wants to implement both. Spring Boot is the scaffolded starter because it owns the load-bearing parts: email/password auth with a long session via Spring Security, and the budget domain (months, categories, percentage splits, cumulative pools) on PostgreSQL via Spring Data JPA. The Angular frontend lives in a `frontend/` subfolder, scaffolded separately with the Angular CLI (`npx @angular/cli new frontend --defaults --routing --style scss --ssr false`) right after bootstrap, since the hand-off carries one starter. The build bundles Angular into Spring's static resources so the app ships as one deployable unit to Fly. Plain backend + frontend layout, no monorepo tooling, Maven as the starter prescribes. Both stacks pass all four agent-friendly gates and the self-check came back clean. Known cost accepted consciously: Angular is heavyweight for a solo MVP. LLM analysis is deferred to v2, so `has_ai` is false. CI runs on GitHub Actions with auto-deploy on merge.
