# Pierwsze wdrożenie PennyPlan: Vercel (fra1) + Neon (Frankfurt)

## Kontekst

`context/foundation/infrastructure.md` wybiera **Vercel Hobby (obraz kontenera z `Dockerfile.vercel`, region `fra1`) + Neon Postgres free (`aws-eu-central-1`)**. Stack z `tech-stack.md` to Spring Boot 4.1 / Java 21 z Angularem 21 w `static/`, całość jako jeden kontener. Deploy na produkcję ma iść przez **integrację Git w Vercel** (merge do `master` → produkcja, każdy branch → preview), bez zewnętrznego CI/CD.

**Stan repo (sprawdzony 2026-09-29):**
- Kroki 1–2 z „Getting Started” (kod aplikacji) **są już na `master` (bef549d, zgodny z `origin/master`)**: `Dockerfile.vercel`, `.dockerignore`, `vercel.json` (`regions: ["fra1"]`), `application.yaml` z env varami, ustawieniami Hikari i Spring Session JDBC, Flyway (`V1__spring_session.sql`), `SecurityConfig`, `SpaWebConfig` i `WebRoutingTests`.
- **Kopia robocza jest w detached HEAD na b080a7e** (commit sprzed tych zmian), więc w katalogu nie ma `Dockerfile.vercel`. Trzeba przełączyć się na `master`; nieśledzone pliki (`.idea/`, `frontend/.10x-cli.json`, `frontend/eslint.config.js`) nie kolidują z checkoutem.
- Lokalny branch `feat/vercel-neon-deploy` (8028980) to stara wersja sprzed rebase'u. Nie używamy go.
- Narzędzia: jest `docker` 29, `gh` 2.100 (niezalogowany), `node` 24 i `npm` 11. **Brakuje `vercel` i `neonctl`.**

Pozostało zrobić część operacyjną: kroki 3–5, czyli Neon, połączenie z Vercel, env vary, deploy i weryfikację.

Legenda: 🤖 robi agent · 🧑 bramka manualna (logowanie w przeglądarce lub decyzja człowieka, zgodnie z granicą dostępu z infrastructure.md) · ☐ checkbox do odhaczenia.

---

## Faza 0: Przygotowanie repo 🤖
- ☐ `git checkout master`, potem `git pull --ff-only`.
- ☐ Lokalny smoke test obrazu: `docker build -f Dockerfile.vercel -t pennyplan .`, potem `docker compose -f docker-compose-dev.yml up -d` i `docker run --rm -p 8080:8080 -e PORT=8080 -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/budget pennyplan`.
  - Sprawdzić: `GET /` → 200 (index.html), `GET /jakas/trasa-spa` → 200, `GET /api/cokolwiek` → 401, `GET /actuator/health` → `UP`.
- ☐ `cd backend && ./mvnw test` (w tym `WebRoutingTests`).
- ☐ Zapisać ten plan jako `context/deployment/deploy-plan.md` (ścieżka z CLAUDE.md) i zrobić commit na `master` (`docs: first deploy plan`).

## Faza 1: Konfiguracja CLI 🧑+🤖
- ☐ 🤖 `npm i -g vercel neonctl`, potem `vercel --version` i `neonctl --version`.
- ☐ 🧑 `! vercel login` (przeglądarka).
- ☐ 🧑 `! neonctl auth` (przeglądarka, konto Neon bez karty).
- ☐ 🧑 `! gh auth login`: potrzebne do pusha i do opcjonalnego workflow backupu w Fazie 6.
- ☐ 🤖 Weryfikacja: `vercel whoami`, `neonctl me`, `gh auth status`.
- Tokeny zostają w lokalnym store CLI i nie trafiają do repo ani do `.mcp.json`.

## Faza 2: Baza Neon 🤖 (tworzenie jest odwracalne i darmowe)
- ☐ `neonctl projects create --name pennyplan --region-id aws-eu-central-1 --pg-version 16 --output json` → zapisać `project_id`.
- ☐ `neonctl branches create --project-id <id> --name preview` (gałąź z `main`).
- ☐ `neonctl connection-string main --project-id <id>` i to samo dla `preview`, **bez `--pooled`**, czyli endpoint direct (host bez `-pooler`).
- ☐ Każdy connection string rozbić na 3 wartości:
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://<host>/<db>?sslmode=require`
  - `SPRING_DATASOURCE_USERNAME=<user>`
  - `SPRING_DATASOURCE_PASSWORD=<pass>`
- Edge case: nie włączać integracji „Neon for Vercel” z marketplace. Wstrzykuje `DATABASE_URL` w formacie `postgresql://` (nie JDBC) i może użyć poolera.
- Hasła nie są wypisywane w odpowiedziach. Agent przekazuje je potokiem wprost do `vercel env add` (stdin).

## Faza 3: Projekt Vercel i env vary
- ☐ 🤖 `vercel link --yes --project pennyplan` w katalogu głównym repo, co tworzy projekt. `.vercel/` dopisać do `.gitignore` (w katalogu głównym nie ma `.gitignore`, więc trzeba go utworzyć, razem z `.idea/`).
- ☐ 🤖 Ustawić env vary: 3 zmienne × 2 środowiska, przez stdin, z flagą sensitive:
  - `vercel env add SPRING_DATASOURCE_URL production` (Neon `main`) oraz `… preview` (Neon `preview`), analogicznie USERNAME i PASSWORD.
  - Env vary środowiska Production są ustawiane **tylko ten jeden raz, przy pierwszej konfiguracji i za Twoją zgodą na ten plan**. Każda późniejsza zmiana wymaga człowieka.
- ☐ 🤖 `vercel env ls` pokazuje 6 wpisów: po 3 w Production i Preview, żadnego w Development.
- ☐ 🧑 Vercel Dashboard → Project → Settings → Git: **Connect GitHub repo `Lukasz9090/home-budget`**, Production Branch = `master`. Robimy to w panelu, bo wymaga instalacji GitHub App. Od tej chwili auto-deploy robi Vercel: push na branch → preview, merge do `master` → produkcja.
- ☐ 🧑 Sprawdzić, że Deployment Protection (Vercel Authentication) jest włączony dla Preview (domyślnie jest).
- ☐ 🤖 Root Directory projektu = katalog główny repo (tam leży `Dockerfile.vercel`). Framework Preset zostaje bez zmian, bo Vercel wykrywa Dockerfile.

## Faza 4: Deploy preview i weryfikacja 🤖
- ☐ `vercel deploy` (preview, bez `--prod`) → zapisać URL. Przy błędzie: `vercel inspect <url> --logs`.
- ☐ Weryfikacja preview (Deployment Protection wymaga `vercel curl` albo bypass tokenu, ewentualnie sprawdzenia przez Ciebie w przeglądarce):
  - ☐ nagłówek `x-vercel-id` zawiera `fra1`
  - ☐ `/` → 200, trasa SPA → 200, `/api/x` → 401, `/actuator/health` → `UP`
  - ☐ `vercel logs <url>`: Flyway „Successfully applied 1 migration”, brak błędów zapisu na FS (Tomcat work dir)
  - ☐ `neonctl` / psql na gałęzi **preview**: `select * from flyway_schema_history` → V1; tabele `spring_session*` istnieją. Gałąź `main` jest nadal pusta, co potwierdza izolację preview od produkcji.
  - ☐ Zmierzyć cold start pierwszego requestu i zanotować go.
- Logowanie użytkownika i zapis danych jeszcze nie istnieją (brak endpointów domeny). Ten test przesuwa się do pierwszego milestone'u i zostanie zapisany jako znane ograniczenie.

## Faza 5: Produkcja 🧑 (bramka człowieka)
- ☐ 🧑 Twoja zgoda → `vercel deploy --prod` albo push/merge do `master`, który uruchamia auto-deploy przez integrację Git. Preferowana jest druga ścieżka, bo sprawdza pipeline, którego będziemy używać na co dzień.
- ☐ 🤖 Na URL produkcyjnym powtórzyć te same testy (to samo co w Fazie 4, bez ochrony). `flyway_schema_history` na Neon `main` → V1.
- ☐ 🤖 Po około 5–10 minutach bez ruchu: `neonctl` / konsola Neon pokazuje compute w stanie **Idle/suspended**. To potwierdza, że Hikari `minimum-idle: 0` działa.
- ☐ 🤖 `vercel ls` i `vercel inspect`: odnotować ID deploymentu produkcyjnego (cel dla `vercel rollback`).

## Faza 6: Po wdrożeniu (w tym samym przebiegu, mały zakres)
- ☐ 🤖 `.github/workflows/backup.yml`: nightly `pg_dump` Neon `main` (direct endpoint, `postgres:16` client), wynik jako artifact z retencją 30 dni. Sekret `NEON_BACKUP_URL` ustawia 🧑 przez `gh secret set`. Workflow **nie** deployuje. Tylko uruchomienie ręczne `workflow_dispatch`, żeby sprawdzić działanie.
- ☐ 🤖 `.github/workflows/test.yml`: `./mvnw test` + `npm test` na PR. Tylko testy, deploy zostaje po stronie Vercel.
- ☐ 🤖 Uzupełnić `context/deployment/deploy-plan.md` o sekcję „Wynik”: URL-e, ID projektów, zmierzony cold start, odchylenia od planu. Commit.
- ☐ 🧑 Przypomnienie w planie: w pierwszym miesiącu raz w tygodniu sprawdzać Vercel Usage → Provisioned Memory (próg alarmowy 60%) i Neon compute hours.

## Rollback i awarie
- Nieudany build lub deploy: produkcja się nie zmienia (Vercel promuje tylko udane buildy). Diagnoza przez `vercel inspect --logs`.
- Zła produkcja: 🧑 `vercel rollback`.
- Aplikacja nie startuje przez złe env vary: poprawić je (🧑 dla Production), potem redeploy.
- Fallback platformy: ten sam obraz na Cloud Run (runner-up), baza Neon zostaje.

## Pliki
- nowe: `context/deployment/deploy-plan.md`, `.gitignore` (root: `.vercel/`, `.idea/`), `.github/workflows/backup.yml`, `.github/workflows/test.yml`
- bez zmian (już gotowe na `master`): `Dockerfile.vercel`, `vercel.json`, `backend/src/main/resources/application.yaml`, `backend/src/main/java/com/homebudget/config/*`

## Weryfikacja końcowa
Na produkcyjnym URL `*.vercel.app` jest `x-vercel-id` z `fra1`, SPA zwraca 200, `/api` zwraca 401, a health `UP`. Neon `main` ma V1 w `flyway_schema_history` i przechodzi w suspend po bezczynności. Gałąź `preview` jest odizolowana. Push na `master` robi auto-deploy przez Vercel. Workflow backupu przechodzi przy ręcznym uruchomieniu.
