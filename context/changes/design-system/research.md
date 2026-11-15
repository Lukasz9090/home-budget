---
change_id: design-system
topic: Rozpoznanie spartan.ng jako design systemu (biblioteka Angular + Figma)
date: 2026-11-13
status: complete
git_commit: 6d79f65
branch: ui
repository: home-budget
last_updated: 2026-11-13
last_updated_by: Claude Code (claude-opus-5-5)
last_updated_note: "Follow-up: wystarczalność spartan-docs.md + rekomendacja; decyzje użytkownika: styl nova, theme stone, primary ze stone, componentsPath libs/ui"
---

# Research: spartan.ng jako design system

## Pytanie

Czy spartan.ng daje gotową bibliotekę komponentów zgodną z naszym frameworkiem (Angular 21) oraz
gotowe odwzorowanie w Figmie? Jak się go używa?

## Werdykt

**Tak, nadaje się.** Biblioteka jest zgodna z Angular 21, a darmowy kit Figma odwzorowuje ją 1:1.
Warunek wstępny: we frontendzie trzeba wprowadzić Tailwind CSS v4 (obecnie go nie ma) i porzucić
SCSS na rzecz zwykłego CSS.

## Zgodność z naszym stackiem

- spartan/ui jest stabilny na linii **1.x** (1.0 wydane w czerwcu 2026, semver), licencja MIT,
  ponad 55 komponentów (m.in. Data Table, Sidebar, Calendar, Date Picker, Field, Input, Select,
  Dialog, Sheet, Toast). `@spartan-ng/cli` w wersji 1.9.0.
- Peer dependencies `@spartan-ng/brain`:
  - Angular `>=21.0.0 <23.0.0` (core, common, forms, cdk). U nas `@angular/core ^21.2.0`, więc pasuje.
  - `tailwindcss >=4.0.0`, `tw-animate-css >=1.0.0`, `clsx >=2.0.0`, `rxjs >=6.6.0`.
  - `luxon` opcjonalnie (tylko dla `date-time-luxon`).
- Komponenty oparte na signals i standalone, działają bez zone.js i z SSR, czyli zgodnie z
  konwencją projektu.

Źródła: https://www.npmjs.com/package/@spartan-ng/brain ,
https://github.com/spartan-ng/spartan , https://www.spartan.ng/documentation/changelog

## Architektura (brain + helm)

- **brain** (`@spartan-ng/brain`, paczka npm) to zachowanie bez stylów: ARIA, obsługa klawiatury,
  focus i stan. Utrzymują ją autorzy i aktualizuje się ją jak zwykłą zależność.
- **helm** to wygląd (Tailwind + class-variance-authority). CLI kopiuje te pliki do repo, więc są
  nasze i edytujemy je bezpośrednio. Importy idą z aliasu `@spartan-ng/helm/<komponent>`.
- To podejście shadcn/ui przeniesione na Angulara.

Źródło: https://spartan.ng/documentation/introduction

## Jak się używa

```bash
npm i -D @spartan-ng/cli
ng g @spartan-ng/cli:init                  # zależności, preset Tailwinda, motyw
ng g @spartan-ng/cli:ui button             # dodanie komponentu (bez nazwy: wybór z listy; `all` = wszystkie)
ng g @spartan-ng/cli:ui-theme              # zmienne motywu, promień zaokrągleń
ng g @spartan-ng/cli:info --json           # kontekst: zainstalowane komponenty, ścieżki, wersje
ng g @spartan-ng/cli:healthcheck --autoFix # wykrywa i poprawia przestarzałe API po aktualizacji
```

Przykład użycia w komponencie:

```ts
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  imports: [HlmButtonImports],
  template: `<button hlmBtn variant="outline">Zapisz</button>`,
})
export class Example {}
```

- Ikony: `@ng-icons` (lucide). Każdą użytą ikonę trzeba zarejestrować przez `provideIcons({...})`.
- Ręczna konfiguracja w `styles.css`: warstwy `@layer theme, base, components, utilities;`,
  importy Tailwinda oraz `@import "@spartan-ng/brain/hlm-tailwind-preset.css";`. Preset zawiera
  już `tw-animate-css` i `@angular/cdk/overlay-prebuilt.css`.
- Wsparcie dla agentów AI: serwer MCP `@spartan-ng/mcp` oraz skill (`npx skills add spartan-ng/spartan`).
- CLI zawiera generatory migracji (`migrate-*`) do zmian łamiących kompatybilność między wersjami.

Źródła: https://www.spartan.ng/documentation/installation , https://www.spartan.ng/documentation/cli ,
https://www.npmjs.com/package/@spartan-ng/cli ,
https://github.com/spartan-ng/spartan/blob/main/skills/spartan/SKILL.md

## Theming

- Zmienne CSS jak w shadcn, w formacie OKLCH, osobno dla `:root` (jasny) i `.dark` (ciemny):
  `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover`, `--sidebar-*`,
  `--chart-1..5`, `--radius`.
- Konwencja par tło/tekst: `bg-primary` + `text-primary-foreground`.
- Własne kolory semantyczne (np. `--warning`) definiuje się jako zmienne i rejestruje przez
  `@theme inline { --color-warning: var(--warning); }`.
- Dostępne kolory bazowe: Neutral i inne; wygenerowanie motywu przez `ui-theme`.

Źródło: https://www.spartan.ng/documentation/theming

## Figma

- Kit **„Spartan UI for Figma: a 1:1 design kit of Spartan NG”** (autor: Mislav Pongrac),
  polecany w oficjalnej dokumentacji, **darmowy** w Figma Community:
  https://www.figma.com/community/file/1691576794328156128 ,
  https://spartan.ng/documentation/figma
- Zawartość: 168 komponentów i 1075 wariantów ze stanami, sloty na treść, tryb jasny i ciemny,
  zmienne na kolory, odstępy, zaokrąglenia, typografię i cienie. Zawiera 6 stylów spartana
  (Nova, Vega, Maia, Lyra, Mira, Luma) przełączanych jedną zmienną oraz Code Connect, czyli
  w Dev Mode widać odpowiadający kod Angulara.
- Zastrzeżenia:
  - To kit społecznościowy, nie oficjalny. Skrypt synchronizacji porównuje kit z aktualnym CSS
    spartana, ale kit może zostać w tyle za nowymi wersjami biblioteki.
  - Animacji i układów RTL nie ma. Layouty pokazują breakpoint desktopowy.
  - Przełączanie stylów i trybu jasny/ciemny wymaga **variable modes**. Plan Starter (darmowy)
    ma jeden tryb na kolekcję, nie ma bibliotek, Dev Mode ani Code Connect i pozwala na 3 pliki.
    Pełne użycie wymaga planu Professional albo Education.

Źródła: https://help.figma.com/hc/en-us/articles/360040328273 ,
https://help.figma.com/hc/en-us/articles/15343816063383

## Stan obecnego frontendu (co trzeba zmienić)

1. **Brak Tailwinda.** `frontend/package.json` nie ma `tailwindcss`. Trzeba dodać `tailwindcss`,
   `@tailwindcss/postcss`, `postcss` i `.postcssrc.json`.
2. **SCSS a Tailwind v4.** Tailwind v4 oficjalnie nie wspiera Sass, Less ani Stylus
   (https://tailwindcss.com/docs/compatibility). Nasze pliki `.scss` (`src/styles.scss`,
   `app/app.scss`, `auth/login/login.scss`, `auth/register/register.scss`, `shell/shell.scss`,
   razem około 250 linii) nie używają składni Sass (brak `$`, `@use`, `@mixin`, `@include`,
   `@extend`). Wystarczy przemianować je na `.css` i przestawić `angular.json`
   (`schematics.style`, `inlineStyleLanguage`, `styles`).
3. **Istniejące tokeny.** `src/styles.scss` definiuje `--color-bg`, `--color-surface`,
   `--color-text`, `--color-muted`, `--color-border`, `--color-primary(-hover)`, `--color-danger(-bg)`,
   `--radius` i `--focus-ring`, plus ręcznie napisane style formularzy i przycisków. Trzeba je
   przenieść na zmienne spartana, a widoki przepiąć na komponenty helm (`field`, `input`,
   `label`, `button`, `card`).
4. **Nowe zależności:** `@angular/cdk`, `@spartan-ng/brain`, `@ng-icons/core`, `@ng-icons/lucide`,
   `clsx`, `tailwind-merge`, `tw-animate-css` (dodaje je głównie CLI).

## Otwarte pytania do planu

- Który styl spartana (Nova, Vega, Maia, Lyra, Mira, Luma) i kolor bazowy przyjmujemy jako nasz
  domyślny? Musi być taki sam w kodzie i w Figmie.
- Czy od razu wspieramy tryb ciemny, czy tylko przygotowujemy pod niego zmienne?
- Który plan Figma: Starter wystarczy do podglądu i kopiowania komponentów, ale do trybów i
  Code Connect potrzebny jest Professional albo Education.
- Gdzie trzymać pliki helm (domyślna ścieżka CLI vs np. `src/app/shared/ui`) i jaką regułę
  dodać do CLAUDE.md, żeby kolejne widoki używały tylko komponentów helm i tokenów.
- Jak komponenty `field`/`input` współpracują z naszymi formularzami (reactive forms vs signal
  forms). Do sprawdzenia w dokumentacji komponentu przed planem.
  → Rozstrzygnięte w follow-upie niżej (tabela, wiersz §5.1).

---

# Follow-up (2026-11-13): czy `spartan-docs.md` wystarcza i czy wdrażać DS teraz

**Git Commit**: `6d79f65` (branch `ui`; `context/changes/design-system/` nieśledzone) ·
**Researcher**: Claude Code (claude-opus-5-5)

## Pytanie

1. Czy `spartan-docs.md` wystarcza, żeby wprowadzić design system do projektu?
2. Czy wprowadzać design system na tym etapie, czy jeszcze nie?

## Odpowiedź w skrócie

1. **Nie wystarcza jako instrukcja wdrożenia, wystarcza jako referencja API komponentów.**
   Sekcje 2, 4, 5, 6 i 7 (brain/helm, zasady stylowania, `field`, przykłady, mapa komponentów)
   zgadzają się ze źródłem spartana `v1.9.0`, z dwiema poprawkami: `<hlm-field-error>` sam się
   pokazuje, a komponentu `icon` nie ma. Sekcja 1 (instalacja) ma jeden krok nieaktualny
   (`--force`) i jeden błędny (kolejność `init` → `ui-theme`). Brakuje w niej 9 rzeczy, które
   w tym repo psują build, lint, testy albo CI (lista „Luki” niżej), w tym elementów kontraktu
   `/10x-ui`: reguły w `CLAUDE.md`, kitchen sinka i macierzy 7 stanów.
2. **Rekomendacja: wdrożyć teraz, w wąskim zakresie, przed S-02.** Szczegóły i warunki są
   w sekcji „Rekomendacja”.

## Weryfikacja twierdzeń `spartan-docs.md`

Źródła: `frontend/node_modules` (`@angular/build` 21.2.24, `@spartan-ng/cli`/`brain` 1.9.0),
źródło spartana na tagu `v1.9.0`, Context7 (`/websites/spartan_ng`,
`/tailwindlabs/tailwindcss.com`), angular.dev/guide/tailwind. Twierdzenia oznaczone ✔ sprawdziłem
lokalnie w tym repo. Pozostałe pochodzą z raportu workera, który czytał źródło spartana
(ścieżki podane, nie odtwarzałem ich).

| § | Twierdzenie w dokumencie | Werdykt | Dowód |
| --- | --- | --- | --- |
| 1.1 | `npm install tailwindcss @tailwindcss/postcss postcss --force` | **Nieaktualne.** `@angular/build` 21.2.24 deklaruje opcjonalny peer `tailwindcss: "^2.0.0 \|\| ^3.0.0 \|\| ^4.0.0"`, więc `--force` jest zbędny ✔ | `frontend/node_modules/@angular/build/package.json` (peerDependencies) |
| 1.1 | (brak) wbudowany schemat | **Pominięte.** `ng add tailwindcss` (`@schematics/angular:tailwind`) dodaje 3 zależności i `.postcssrc.json`. Import dopisuje do pierwszego pliku `.css` w `styles`, a gdy takiego nie ma, tworzy `src/tailwind.css` | `@schematics/angular/tailwind/index.js` |
| 1.1 | `.postcssrc.json` | Poprawne. Builder czyta tylko `postcss.config.json` i `.postcssrc.json`, nie `.js` | `@angular/build/src/utils/postcss-configuration.js:15` |
| 1.1 | trzeba porzucić SCSS | **Częściowo.** To oficjalne stanowisko Tailwinda, ale Angular puszcza PostCSS na wyjściu Sassa. Na `.css` muszą przejść tylko plik wejściowy z importem Tailwinda i pliki z `@apply`/`@theme`. U nas i tak najprościej przemianować wszystkie, bo nie używają składni Sass (wyżej, „Stan obecnego frontendu” pkt 2) | `@angular/build/.../stylesheet-plugin-factory.js:182-199`; tailwindcss.com/docs/compatibility |
| 1.2 | warstwy + importy + `hlm-tailwind-preset.css` z cdk overlay i tw-animate | Poprawne. `tw-animate-css` i `@angular/cdk` to peer deps brain, więc muszą trafić do `package.json` | `node_modules/@spartan-ng/brain/hlm-tailwind-preset.css:1-20` |
| 1.3 | `init` = wybór stylu + zależności; potem `ui-theme` „raz na projekt” | **Błędne.** `init` dodaje zależności **i uruchamia generator motywu**: wpisuje warstwy, preset, `:root`/`:root.dark`, `--font-sans` i `@layer base` do pliku stylów. Nie wybiera stylu i nie zapisuje `components.json`. Drugi `ui-theme` dopisałby drugi blok motywu. W 1.9.0 nie ma promptu o radius | `libs/cli/src/generators/init/generator.ts`, `theme/generator.ts@v1.9.0`; ✔ generator motywu obsługuje `styles.scss` (`node_modules/@spartan-ng/cli/src/generators/theme/libs/add-theme-to-application-styles.js`) |
| 1.4 | `components.json`: `componentsPath`, `importAlias`, `style` | Poprawne. Domyślne `componentsPath` to `libs/ui`. Gdy brakuje `style`, fallbackiem jest `vega` (prompt preselekcjonuje `nova`) | `libs/cli/src/utils/config.ts` |
| 1.4 | (brak) aliasy w tsconfig | **Pominięte.** `ui` dopisuje jedną ścieżkę na komponent do `tsconfig.json` i dodaje `<componentsPath>/**/src/**/*.ts` do `include` w `tsconfig.app.json` | `generators/base/generator.ts` (`setupAngularCliProject`) |
| 4 | `hlm()`, `classes()` z `@spartan-ng/helm/utils` | Poprawne | helm `utils` |
| 5.1 | `@if (email.invalid && email.touched) { <hlm-field-error> }` | **Nadmiarowe.** `<hlm-field-error>` w `hlmField` pokazuje się sam przy `invalid && (touched \|\| NgForm submitted)`. Nie reaguje na submit `FormGroupDirective`, którego używamy (`[formGroup]`), więc przy submicie trzeba wywołać `markAllAsTouched()`. Są też inputy `[validator]` i `forceShow` | `hlm-field-error.ts`, `brain/forms/error-options.ts` |
| 6.3 | ikony przez `@ng-icons` + `provideIcons` | Poprawne. Wersja ma znaczenie, patrz Luki pkt 3 | — |
| 6.5 | `toast` z `@spartan-ng/brain/sonner`, `<hlm-toaster />` | Poprawne. Ryzyko w testach, patrz Luki pkt 5 | `brn-toaster.ts:222` |
| 7 | „Ikony → `icon`” | **Błędne.** W 1.9.0 nie ma komponentu `icon`, używamy bezpośrednio `@ng-icons` | `supported-ui-libraries.json@v1.9.0` |

## Luki: czego dokument nie mówi, a co dotyczy tego repo (od największego wpływu)

1. **Zależności zapisane w `package.json`.** W `frontend/node_modules` leżą już spartan
   `brain`/`cli` 1.9.0, `@angular/cdk` 21.0.0, `@ng-icons/core`+`lucide` 32.5.0, `clsx`,
   `tailwind-merge`, `tw-animate-css` i `nx` 24.0.6. `npm ls --depth=0` pokazuje je jako
   **extraneous**, czyli spoza `package.json` ✔. Docker i CI instalują przez `npm ci`
   (`Dockerfile.vercel:10`, `.github/workflows/test.yml:36`), więc lokalny build zadziała,
   a CI i deploy się wywalą, jeśli zależności nie zostaną zapisane. Planując, trzeba je zapisać
   jawnie, a sprawdzić na czystym `npm ci`.
2. **Kolejność: najpierw rename, potem `init`.** Generator motywu nadpisuje `styles.css` albo
   `styles.scss` ✔. Obecny `:root` (`frontend/src/styles.scss:3-15`) ma `--radius: 0.5rem`
   (linia 13), który koliduje z `--radius` spartana. Nazwy `--color-*` kolidują z przestrzenią
   `--color-*` w `@theme` Tailwinda. Tokeny trzeba zmapować ręcznie, np. `--color-primary`
   (linia 9, `#2f5bd3`) → `--primary` w OKLCH, `--color-danger` → `--destructive`,
   `--color-muted` → `--muted-foreground`, `--color-surface` → `--card`,
   `--color-border` → `--border`, `--focus-ring` → `--ring`.
3. **Przypięte wersje.** Najnowszy `@ng-icons/core` (36.x) wymaga Angulara ≥22, a helm chce
   `>=32 <34`. Ręczne `npm i @ng-icons/core` bez wersji się więc nie rozwiąże. Helm wymaga też
   `@spartan-ng/brain` dokładnie w wersji `1.9.0` (raport workera, `package.json` helm).
4. **ESLint.** `frontend/eslint.config.js:22,30` wymaga prefiksu `app`, a pliki helm mają prefiks
   `hlm` i `input({ alias: 'class' })` (14 plików według workera). Gdyby trafiły pod `src/`
   (`lintFilePatterns: src/**`, `frontend/angular.json:80`), `npm run lint` się wywali.
   Do wyboru: zostawić `componentsPath` poza `src/` (domyślne `libs/ui`) albo dodać override
   (prefiks `hlm`, wyłączone `no-input-rename` i `*-class-suffix`), tak jak robi to sam spartan
   w `libs/helm/eslint.config.cjs`. To samo dotyczy Prettiera.
5. **Testy (Vitest + jsdom).** `BrnSonnerToaster` woła `matchMedia` w `afterNextRender`
   (`brn-toaster.ts:222`), a `inject-element-size` (tabs, sidebar, resizable) używa
   `ResizeObserver`. Żadnego z nich nie ma w jsdom. Potrzebny jest plik `setupFiles` ze stubami,
   zanim `<hlm-toaster>` trafi do `App`/`Shell`. Wniosek wynika z lektury źródła, nie był
   reprodukowany.
6. **Istniejące testy zależą od klas CSS.** `frontend/src/app/auth/register/register.spec.ts:59`
   szuka `.hint`, a `:69` szuka `.field-error` ✔. Przepięcie na `hlmFieldDescription` i
   `hlm-field-error` je zepsuje, więc trzeba zmienić selektory w tej samej fazie. Selektory
   `#…-email`, `button[type="submit"]` i `[role="alert"]` przetrwają, jeśli zostawimy id i `role`.
7. **`provideSpartanHlm()`** z `@spartan-ng/helm/utils` (w `app.config.ts`) wyłącza CDK
   `usePopover`, nowe w Angularze 21. Bez tego overlaye źle układają się względem elementów
   `position: fixed` ✔ (`node_modules/@spartan-ng/cli/src/generators/ui/libs/utils/files/lib/provide-spartan-hlm.ts.template:7-31`).
8. **Szczegóły motywu:** generator pisze `:root.dark`, a wariant to `.dark *`, więc klasa musi
   być na `<html>`. Brakuje `color-scheme`. `--font-sans` to stack systemowy, co pasuje do
   obecnego `body`. `@layer base` z generatora zastępuje nasze reguły `body`/`*`.
9. **Kontrakt `/10x-ui`** (`.claude/skills/10x-ui/SKILL.md`, sekcje „Make it stick”,
   „Definition of done”, „Visual gate”) wymaga trzech rzeczy, których dokument nie obejmuje.
   (a) Reguła w `CLAUDE.md`: gdzie są tokeny i komponenty, zakaz literałów, dodawanie
   komponentów tylko przez `ng g @spartan-ng/cli:ui`. (b) Kitchen sink z 7 stanami.
   (c) Zrzut ekranu dla desktopu i jednej szerokości mobilnej. Do tego surowe wartości motywu
   odłożone w folderze zmiany.

Opcjonalnie: `prettier-plugin-tailwindcss` i `tailwindCSS.classFunctions: ["hlm","cva","classes"]`.

## Stan, od którego startujemy

- Widoki: `login`, `register`, `shell` i placeholder `home`. To razem 368 linii plików
  `.scss`/`.html`, z czego 203 to `src/styles.scss` ✔ (`wc -l`).
- Skan literałów z `/10x-ui` na `login.html`, `register.html`, `shell.html`, `shell.scss` i
  `home.ts` (tylko część z funkcjami kolorów, bez klas palety Tailwinda, których tu nie ma)
  dał **0 trafień** w każdym pliku ✔. Widoki czytają już tokeny semantyczne (`var(--color-*)`),
  więc połowa kontraktu, czyli tokeny, istnieje. Brakuje drugiej połowy: komponentów
  importowalnych. Ich rolę pełnią globalne klasy `.field` (`styles.scss:105`) i `.btn` (`:161`)
  oraz `.form-error`, używane w `login.html:8,15,38`, `register.html:8,15,38,50` i `shell.html:5`.
- S-01 ma status `impl_reviewed` (`context/changes/account-signup-and-login/change.md:4`),
  a S-02…S-08 to `proposed` (`context/foundation/roadmap.md`). Według roadmapy plastry
  S-02, S-03, S-05 i S-06 wprowadzają formularze, tabelkę podziału i ekrany na telefonie.

## Rekomendacja: wdrożyć teraz, wąsko, przed S-02

**Za „teraz”:**

- **Koszt migracji jest teraz najniższy z możliwych.** Do przepięcia są 3 widoki i jeden plik
  tokenów, a widoki nie mają literałów kolorów. Od S-02 każdy plaster dokłada formularze
  i tabele na globalnych klasach `.btn`/`.field`. Ten przypadkowy „design system” rośnie
  z każdym plastrem, a późniejsza migracja oznacza przepisanie ekranów S-02 i S-03.
- **Pasuje do zalecanego momentu w `/10x-ui`:** „najlepiej przed drugim albo trzecim widokiem,
  żeby odziedziczyły kontrakt zamiast literałów” (`.claude/skills/10x-ui/SKILL.md`, „When to
  run it”). Przepływ auth działa end to end (S-01 `impl_reviewed`), a pierwszy widok domenowy
  (S-02) jeszcze nie powstał.
- S-03 (tabelka z korektą kwot) i S-05/S-06 (telefon) to miejsca, gdzie przydadzą się `input`,
  `select`, `table`, `sheet`/`dialog`, `alert`, `empty`. Bez biblioteki agent zbuduje je ręcznie,
  razem ze stanami focus, disabled i error, które według `/10x-ui` dryfują jako pierwsze.

**Przeciw (i jak to zneutralizować):**

- Roadmapa ma `main_goal: speed` i `top_blocker: time` (`roadmap.md:8-9`) i wprost odrzuca
  fundamenty „na zapas” (`roadmap.md:77`). Odpowiedź: zakres ma być minimalny i ograniczony
  czasowo. Nie biblioteka „na wszelki wypadek”, tylko kontrakt i komponenty dla 3 istniejących
  widoków. Resztę komponentów dodaje `ng g @spartan-ng/cli:ui <name>` w plastrze, który ich
  potrzebuje.
- Figma (plan Starter: jeden tryb, bez Code Connect) nie może blokować wdrożenia w kodzie.
  Wystarczy wybrać jeden styl (np. `nova`) i ten sam ustawić w kicie.

**Proponowany zakres (dla `/10x-plan`), zgodny z kolejnością `/10x-ui`: środowisko → tokeny → widok → stany:**

1. Środowisko: rename `*.scss` → `*.css` i aktualizacja `angular.json:14,26,33`, potem
   `ng add tailwindcss`, potem `@spartan-ng/cli` i `init`. Zależności w `package.json`,
   weryfikacja na czystym `npm ci`. `provideSpartanHlm()`. `componentsPath` i decyzja
   o ESLint/Prettier. `setupFiles` ze stubami.
2. Tokeny: mapowanie `--color-*` na zmienne spartana (Luki pkt 2), wartości odłożone w folderze
   zmiany, usunięcie `.btn`/`.field`/`.form-error` ze `styles.css`.
3. Widoki: `login`, `register`, `shell` na `button`, `card`, `field`/`input`/`label`, `alert`.
   Selektory w `register.spec.ts:59,69` do poprawki. `npm test` i `npm run lint` mają przechodzić.
4. Stany i straż: kitchen sink z 7 stanami, zrzut desktop i mobile, reguła UI w `CLAUDE.md`
   (poza blokiem `@przeprogramowani/10x-cli`).

Dark mode: tylko zmienne z generatora, bez przełącznika. Przeszukanie `prd.md` pod kątem
`dark|ciemn` nie dało trafień, więc PRD go nie wymaga.

**Alternatywa (gdyby czas był krytyczny):** zbudować S-02 na obecnych tokenach i globalnych
klasach, a spartana wprowadzić przed S-03. Koszt: ekrany S-02 trzeba będzie przepiąć,
a `.btn`/`.field` dostaną kolejnych konsumentów.

## Otwarte decyzje (dla użytkownika / planu)

- ~~Styl spartana i kolor bazowy~~ → **rozstrzygnięte 2026-11-13 przez użytkownika: styl `nova`,
  theme `stone`.** Obie wartości są w CLI 1.9.0: `nova` w
  `frontend/node_modules/@spartan-ng/cli/src/utils/supported-styles.js:6`, `stone` w enumie
  `theme` w `.../src/generators/init/schema.json:13`. W kodzie i w kicie Figma ma być ten sam
  styl `nova`.
  Konsekwencja: w `stone` `--primary` to prawie czarny ciepły szary, `oklch(0.216 0.006 56.043)`
  (jasny) i `oklch(0.923 0.003 48.717)` (ciemny). Do tego `--ring` `oklch(0.709 0.01 56.259)`
  i `--radius` `0.625rem` (`.../src/generators/theme/libs/colors.js`, klucz `stone`). Obecny
  niebieski `#2f5bd3` (`frontend/src/styles.scss:9`) znika z przycisków, linków i marki,
  chyba że plan nadpisze `--primary` (i `--ring`) po wygenerowaniu motywu.
- ~~`--primary`: stone czy marka~~ → **rozstrzygnięte 2026-11-13: `--primary` zostaje ze `stone`**
  (bez nadpisywania). Niebieski `#2f5bd3` znika razem ze starymi tokenami `--color-*`.
- ~~`componentsPath`~~ → **rozstrzygnięte 2026-11-13 („zgodnie z zaleceniami”): domyślne
  `libs/ui`**, czyli `frontend/libs/ui`. `componentsPath` jest względne wobec workspace'u Angular CLI
  (`frontend/`). Uzasadnienie:
  (1) to domyślna wartość CLI spartana dla Angular CLI (`libs/cli/src/utils/config.ts`,
  `spartan-docs.md` §1.4);
  (2) leży poza `lintFilePatterns: src/**` (`frontend/angular.json:80`), więc prefiks `hlm`
  i `alias: 'class'` nie łamią reguł `frontend/eslint.config.js:22,30` i nie trzeba override'u;
  (3) helm to kod „dostawcy” edytowany świadomie, oddzielony od kodu aplikacji. Aliasy
  `@spartan-ng/helm/*` i `include` w `tsconfig.app.json` dopisuje samo `ng g @spartan-ng/cli:ui`.
  Reguła UI w `CLAUDE.md` ma wskazywać `frontend/libs/ui` jako katalog komponentów.
- Czy `spartan-docs.md` poprawić w miejscu (sekcje 1.1, 1.3, 5.1, 7), czy traktować tabelę
  wyżej jako erratę?

## Niezweryfikowane / luki

- Nie uruchamiałem buildu, testów ani generatorów. Awaria `matchMedia` w jsdom i kompilacja helm
  przy `noPropertyAccessFromIndexSignature`/`strictInputAccessModifiers` (`frontend/tsconfig.json`)
  to ryzyka wyczytane ze źródła, nie zreprodukowane.
- Część ustaleń o CLI (układ `componentsPath/<name>/src`, brak promptu radius, fallback `vega`,
  liczba 14 plików z `alias: 'class'`) pochodzi z lektury źródła `v1.9.0` przez workera, nie
  z uruchomienia. Źródło na `main` może się różnić.
