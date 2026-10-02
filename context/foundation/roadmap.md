---
project: PennyPlan
version: 1
status: draft
created: 2026-09-29
updated: 2026-10-02
prd_version: 1
main_goal: speed
top_blocker: time
milestone_id: first-budgeted-month
milestone_seq: 1
milestone_status: open
---

# Roadmap: PennyPlan

> Wyprowadzona z `context/foundation/prd.md` (v1) + automatycznie zbadanego stanu kodu.
> Edycja w miejscu; archiwizacja, gdy zostanie zastąpiona.
> Plastry poniżej są w kolejności zależności. Tabela „At a glance” jest indeksem.

## Milestone

**M-1: Pierwszy rozpisany miesiąc** — Status: open

- **Intent:** Użytkownik przechodzi od pustego konta do prowadzenia budżetu kopertowego w całości w aplikacji: rozdziela dochody na własne kategorie, widzi sumy narastające, odnotowuje wydatki z pul i domyka miesiąc notatką — bez arkusza kalkulacyjnego. To pełny zakres v1 z PRD.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Done when:** każdy S-NN poniżej ma status `done`.
- **Scope anchors:** FR-001–FR-004, FR-006–FR-018 (wszystkie konieczne w v1; FR-005 usunięty w PRD), US-01.

## Vision recap

Osoba prowadząca budżet metodą kopertową dzieli dziś każdy dochód procentowo na własne kategorie w arkuszu, ręcznie przeliczając procenty i salda, a każdy nowy miesiąc to kopiowanie zakładki. PennyPlan to nie tracker wydatków: gruby procent przypisany z góry do szerokiej kategorii istnieje po to, żeby paragonów nie wpisywać — alokacja zastępuje śledzenie. Produkt ma pokazać odpowiedzi „ile mam zebrane na wakacje” bez ręcznego składania danych i skrócić wpisanie miesiąca do kilku minut.

## North star

**S-03: Użytkownik może dodać miesiąc, wpisać dochód i rozdzielić go procentowo na kategorie, korygując kwoty ręcznie** — to rdzeń głównego kryterium sukcesu („widok miesiąca z rozdzielonym dochodem”) i jedyna spisana historyjka (US-01); przy celu `speed` idzie najwcześniej, jak pozwalają zależności.

> „North star” (gwiazda przewodnia) oznacza tu najmniejszy przepływ od początku do końca, którego dowiezienie dowodzi, że produkt działa — dlatego stoi tak wcześnie, jak pozwalają zależności: wszystko inne ma sens tylko wtedy, gdy ten podział działa.

## At a glance

| ID   | Change ID                   | Outcome (user can …)                                                                 | Prerequisites | PRD refs                                    | Status   |
| ---- | --------------------------- | ------------------------------------------------------------------------------------ | ------------- | ------------------------------------------- | -------- |
| S-01 | account-signup-and-login    | założyć konto, zalogować się, wylogować i wrócić po miesiącu bez ponownego logowania | —             | FR-001, FR-002                              | planning |
| S-02 | first-categories            | zdefiniować własne kategorie przepływowe i narastające, z pustym stanem z przykładami | S-01          | FR-003, FR-004, FR-017                      | proposed |
| S-03 | month-income-split          | dodać miesiąc, wpisać dochód własnego typu i rozdzielić go procentowo z korektą kwot | S-02          | US-01, FR-008, FR-010, FR-011, FR-012, FR-013 | proposed |
| S-04 | rolling-split-suggestion    | dostać procenty podpowiedziane z ostatniego użycia danego typu dochodu               | S-03          | US-01, FR-009                               | proposed |
| S-05 | cumulative-pools-panel      | zobaczyć panel sum narastających per kategoria i zawęzić go filtrem okresu           | S-03          | US-01, FR-014                               | proposed |
| S-06 | expense-from-pool           | odnotować wydatek z wybranej puli i zobaczyć ostrzeżenie przy zejściu poniżej zera   | S-03, S-05    | FR-015                                      | proposed |
| S-07 | month-summary-and-note      | zobaczyć zbiorczy rozkład dochodów miesiąca i zapisać notatkę miesiąca               | S-03          | FR-016, FR-018                              | proposed |
| S-08 | category-rename-and-archive | zmienić nazwę kategorii i zarchiwizować ją bez utraty historii ani salda w panelu    | S-02, S-05    | FR-006, FR-007                              | proposed |

## Streams

Pomoc w nawigacji — grupuje pozycje o wspólnym łańcuchu zależności. Kanoniczny porządek nadal wyznacza graf zależności poniżej; ta tabela to proponowana kolejność czytania torów równoległych.

| Stream | Theme                    | Chain                                  | Note                                                                                              |
| ------ | ------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A      | Rdzeń: konto → podział   | `S-01` → `S-02` → `S-03` → `S-04`      | Najkrótsza ścieżka do głównego kryterium sukcesu; pod cel `speed` idzie pierwsza.                |
| B      | Pule i wydatki           | `S-05` → `S-06` → `S-08`               | Dołącza do toru A przy `S-03`; `S-08` zależy od `S-05` (nie od `S-06`), więc może iść równolegle z `S-06`. |
| C      | Koniec miesiąca          | `S-07`                                 | Dołącza do toru A przy `S-03`; niezależny od puli, dobry kandydat na równoległego agenta.         |

## Baseline

Stan kodu na `2026-09-29` (zbadany automatycznie, potwierdzony przez użytkownika).
Plastry poniżej zakładają, że to już jest, i NIE budują tego od nowa.

- **Frontend:** partial — szkielet Angulara z pustą listą tras (`frontend/src/app/app.routes.ts`); brak ekranów i komunikacji z API.
- **Backend / API:** partial — szkielet Spring Boot z zabezpieczonym prefiksem `/api` i obsługą tras SPA (`backend/src/main/java/com/homebudget/config/SecurityConfig.java`, `SpaWebConfig.java`); brak kontrolerów domenowych.
- **Data:** partial — Postgres z migracjami Flyway; jedyna migracja to tabele sesji (`V1__spring_session.sql`); brak tabel domenowych.
- **Auth:** partial — Spring Security, sesja w bazie ważna 45 dni, ochrona CSRF dla SPA; ścieżka `/api/auth/**` otwarta, ale bez endpointów i bez tabeli użytkowników.
- **Deploy / infra:** present — Vercel (`fra1`) + Neon, produkcja wdrożona, CI z testami (`.github/workflows/test.yml`), nocny backup (`.github/workflows/backup.yml`); szczegóły w `context/deployment/deploy-plan.md`.
- **Observability:** absent — tylko health check; PRD nie stawia wymagań w tej warstwie, więc nie otwiera fundamentu.

## Foundations

Brak osobnych fundamentów. Deploy jest gotowy, a pozostałe warstwy (auth, dane, ekrany) są częściowe i każdą da się dokończyć wewnątrz pierwszego plastra, który jej potrzebuje: logowanie i izolacja danych w S-01, pierwsze tabele domenowe w S-02, reguły kwot w S-03. Wydzielenie ich wcześniej byłoby budowaniem warstw na zapas, co przy celu `speed` tylko opóźnia pierwszy działający przepływ.

## Slices

### S-01: Konto i logowanie

- **Outcome:** Użytkownik może założyć konto e-mailem i hasłem, zalogować się, wylogować i wrócić po miesiącu bez ponownego logowania; niezalogowane wejście na trasę z danymi przekierowuje do logowania, a żadne konto nie widzi danych innego (PRD: NFR długiej sesji, Access Control, guardrail izolacji).
- **Change ID:** account-signup-and-login
- **PRD refs:** FR-001, FR-002
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jak wygląda pierwsza sesja po rejestracji (PRD Open Question 1)? — Owner: user. Block: no.
- **Risk:** Pierwszy plaster ustala wzorzec „każdy odczyt i zapis jest zawężony do właściciela”, na którym opiera się guardrail izolacji kont; zrobiony źle, przecieka do każdego kolejnego plastra.
- **Status:** planning

### S-02: Pierwsze kategorie

- **Outcome:** Użytkownik bez kategorii widzi wyjaśnienie z przykładami, a potem może zdefiniować własne kategorie i oznaczyć je jako przepływowe lub narastające.
- **Change ID:** first-categories
- **PRD refs:** FR-003, FR-004, FR-017
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Rozróżnienie przepływowa/narastająca jest rdzeniem mechaniki pul; ustalone tu decyduje o tym, jak S-05 i S-06 liczą salda.
- **Status:** proposed

### S-03: Miesiąc i podział dochodu

- **Outcome:** Użytkownik może dodać miesiąc (rok + miesiąc), dodać wpis dochodu z typem ze swojego słownika (tworząc nowy typ w razie potrzeby), kwotą i opcjonalną datą, rozdzielić go procentowo na kategorie i nadpisać sugerowane kwoty rzeczywistymi — z rzeczywistym procentem, kwotą nierozdzieloną i ostrzeżeniem o luce w miesiącach; tabelka odświeża się w < 200 ms, a ręcznie wpisana kwota nigdy nie jest nadpisywana (PRD: NFR, guardrail).
- **Change ID:** month-income-split
- **PRD refs:** US-01, FR-008, FR-010, FR-011, FR-012, FR-013
- **Prerequisites:** S-02
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Tu żyją wszystkie reguły kwot (walidacja 100%, zaokrąglenie do grosza z resztą w kwocie nierozdzielonej, przeliczanie tylko nieskorygowanych wierszy) — najwięcej logiki w najmniejszym ekranie, więc idzie jako pierwszy po przygotowaniu słowników.
- **Status:** proposed

### S-04: Podpowiedź procentów z ostatniego użycia

- **Outcome:** Użytkownik dodający dochód danego typu dostaje procenty podpowiedziane z ostatniego miesiąca, w którym ten typ wystąpił, i może każdy z nich zmienić.
- **Change ID:** rolling-split-suggestion
- **PRD refs:** US-01, FR-009
- **Prerequisites:** S-03
- **Parallel with:** S-05, S-07
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Wydzielone z S-03, żeby rdzeń podziału dało się zweryfikować na jednym miesiącu; podpowiedź musi czytać zapisane procenty historyczne, a nie modyfikować je.
- **Status:** proposed

### S-05: Panel sum narastających

- **Outcome:** Użytkownik widzi, niezależnie od otwartego miesiąca, bieżące sumy narastające kategorii kumulujących się (liczone od początku, bez granicy roku), zawęża widok filtrem okresu i korzysta z panelu na telefonie.
- **Change ID:** cumulative-pools-panel
- **PRD refs:** US-01, FR-014
- **Prerequisites:** S-03
- **Parallel with:** S-04, S-07
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Domyka główne kryterium sukcesu („działający panel narastający”); filtr okresu nie może ruszać salda puli, tylko zawężać widok.
- **Status:** proposed

### S-06: Wydatek z puli

- **Outcome:** Użytkownik może na telefonie odnotować wydatek z kwotą, wymaganą kategorią źródłową i opcjonalną datą; wydatek pomniejsza sumę narastającą albo pulę bieżącego miesiąca, a zejście poniżej zera jest dozwolone z ostrzeżeniem.
- **Change ID:** expense-from-pool
- **PRD refs:** FR-015
- **Prerequisites:** S-03, S-05
- **Parallel with:** S-04, S-07, S-08
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Formularz musi zostać minimalny — każde dodatkowe pole przesuwa produkt w stronę trackera wydatków, co PRD uznaje za trwałe odcięcie.
- **Status:** proposed

### S-07: Podsumowanie i notatka miesiąca

- **Outcome:** Użytkownik widzi zbiorczą tabelkę tylko do odczytu z kwotowym i procentowym rozkładem sumy wszystkich dochodów miesiąca oraz zapisuje notatkę miesiąca w wolnym polu.
- **Change ID:** month-summary-and-note
- **PRD refs:** FR-016, FR-018
- **Prerequisites:** S-03
- **Parallel with:** S-04, S-05, S-06, S-08
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Obsługuje drugi moment sięgnięcia po produkt (koniec miesiąca); niska złożoność, więc dobry kandydat na równoległe wykonanie.
- **Status:** proposed

### S-08: Zmiana nazwy i archiwizacja kategorii

- **Outcome:** Użytkownik może zmienić nazwę kategorii (także w historii) i zarchiwizować ją tak, że znika z list wyboru przy nowych wpisach, a w panelu narastającym zostaje, dopóki jej suma jest różna od zera.
- **Change ID:** category-rename-and-archive
- **PRD refs:** FR-006, FR-007
- **Prerequisites:** S-02, S-05
- **Parallel with:** S-04, S-06, S-07
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Zależy od panelu, bo reguła widoczności zarchiwizowanej kategorii jest zdefiniowana względem jej salda; ostatni w kolejce, bo nie jest potrzebny do pierwszego miesiąca.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID                   | Suggested issue title                                            | Ready for `/10x-plan` | Notes                                  |
| ---------- | --------------------------- | ---------------------------------------------------------------- | --------------------- | -------------------------------------- |
| S-01       | account-signup-and-login    | Rejestracja, logowanie i długa sesja z izolacją danych kont      | yes                   | Run `/10x-plan account-signup-and-login` |
| S-02       | first-categories            | Własne kategorie przepływowe/narastające z pustym stanem         | no                    | Czeka na S-01                          |
| S-03       | month-income-split          | Miesiąc, wpis dochodu i procentowy podział z korektą kwot        | no                    | Czeka na S-02; gwiazda przewodnia      |
| S-04       | rolling-split-suggestion    | Podpowiedź procentów z ostatniego użycia typu dochodu            | no                    | Czeka na S-03                          |
| S-05       | cumulative-pools-panel      | Panel sum narastających z filtrem okresu                         | no                    | Czeka na S-03                          |
| S-06       | expense-from-pool           | Wydatek z puli z ostrzeżeniem o debecie                          | no                    | Czeka na S-03, S-05                    |
| S-07       | month-summary-and-note      | Zbiorczy rozkład dochodów miesiąca i notatka                     | no                    | Czeka na S-03                          |
| S-08       | category-rename-and-archive | Zmiana nazwy i archiwizacja kategorii                            | no                    | Czeka na S-02, S-05                    |

## Open Roadmap Questions

1. **Jak wygląda onboarding nowego konta?** — Rejestracja jest pierwszym tarciem; FR-017 zdejmuje część problemu, ale kształt pierwszej sesji jest nierozstrzygnięty. Owner: user. Block: — (nie blokuje v1; dotyka S-01 i S-02).
2. **Nazwa produktu „PennyPlan” — świadomie przyjęte ryzyko.** Rozstrzygnięte: zostaje; do ewentualnego powrotu przed publikacją. Owner: user. Block: —.
3. **Co zrobić z historycznymi „udawanymi” wydatkami, gdy przesunięcie między pulami dojdzie w v2?** — W v1 przekazanie zapisuje się jako wydatek + nowy wpis dochodu (S-06 + S-03). Owner: user. Block: — (dotyczy v2).
4. **Brak historyjek z kryteriami akceptacji dla wydatku, panelu, notatki, pierwszego uruchomienia i obejścia przesunięcia na przełomie roku.** — Nie blokuje v1, ale S-02, S-05, S-06 i S-07 będą planowane z samych FR i reguł domenowych; warto dopisać Given/When/Then przed `/10x-plan` tych plastrów. Owner: user. Block: — (dotyka S-02, S-05, S-06, S-07).
5. **Czy eksport własnych danych jest w zakresie v1?** — PRD wymienia go w wymaganiach pozafunkcjonalnych, ale nie ma dla niego FR ani historyjki, więc roadmapa nie tworzy dla niego plastra. Albo dopisać FR w PRD (wtedy nowy plaster), albo przenieść do v2. Owner: user. Block: roadmap-wide (zakres kamienia M-1).

## Parked

- **Analiza wspomagana modelem językowym (wraz ze zgodą na przekazanie danych poza produkt)** — Why parked: PRD §Non-Goals, odsunięta do v2; wymaga kilku wypełnionych miesięcy.
- **Przesunięcie kwoty między pulami jako osobna operacja** — Why parked: PRD §Non-Goals, v2; w v1 obejście wydatkiem + dochodem.
- **Rytuał zamknięcia roku i flaga [rozliczana rocznie]** — Why parked: PRD §Non-Goals, v2.
- **Flaga dopuszczalnego debetu na kategorii** — Why parked: PRD §Non-Goals, usunięta z v1 (FR-005); wraca, jeśli ostrzeżenie nie wystarczy.
- **Zasoby w wielu walutach, pożyczki prywatne, współdzielenie budżetu, import z banku** — Why parked: PRD §Non-Goals.
- **Śledzenie paragonów i kategoryzacja drobnych wydatków** — Why parked: PRD §Non-Goals, odcięcie trwałe.
- **Praca offline** — Why parked: PRD §Non-Goals (niefunkcjonalne).
- **Weryfikacja adresu e-mail** — Why parked: PRD §Access Control, poza MVP.
- **Natywna aplikacja mobilna** — Why parked: PRD §Non-Goals, otwarte na przyszłość; telefon obsługuje aplikacja webowa.

## Milestone History

## Done
