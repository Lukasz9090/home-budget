---
change_id: design-system
title: Design system
status: implementing
created: 2026-11-13
updated: 2026-11-15
archived_at: null
---

## Notes

Cel: wprowadzić design system (gotowa biblioteka zgodna z Angular 21 + odwzorowanie w Figma), żeby fronty powstawały świadomie.

Rozpoznanie spartan.ng (2026-11-13):
- spartan/ui 1.x stabilny (1.0 w czerwcu 2026), MIT, 55+ komponentów, signals/zoneless/SSR. CLI `@spartan-ng/cli` 1.9.0.
- `@spartan-ng/brain` peer deps: Angular >=21 <23, @angular/cdk, Tailwind >=4, tw-animate-css, clsx. Pasuje do naszego Angular 21.2.
- Architektura: brain (npm, zachowanie + a11y) + helm (style Tailwind kopiowane do repo przez CLI, import alias `@spartan-ng/helm/*`).
- Setup: `ng g @spartan-ng/cli:init` → `ng g @spartan-ng/cli:ui <name>`; motyw przez `ui-theme`; `healthcheck --autoFix` po upgrade'ach.
- Theming: zmienne CSS w stylu shadcn (`--primary`, `--background`, … w OKLCH, `.dark`), własne kolory przez `@theme inline`.
- Figma: społecznościowy kit 1:1 (Mislav Pongrac), polecany w oficjalnej dokumentacji (spartan.ng/documentation/figma), darmowy na Figma Community; 168 komponentów, 6 stylów (Nova…Luma), light/dark, Code Connect. Przełączanie stylów/trybów wymaga planu Figma z variable modes (Professional/Education) — na Starterze tylko jeden tryb.
- Dokumentacja referencyjna (Context7, 2026-11-13): `spartan-docs.md` — instalacja, CLI, theming, zasady stylowania, formularze, przykłady komponentów.
- Decyzja (2026-11-13): styl `nova`, theme (kolor bazowy) `stone`. Ten sam styl w kicie Figma. `--primary` zostaje ze `stone` (bez niebieskiej marki). Komponenty helm w domyślnym `componentsPath: libs/ui` (= `frontend/libs/ui`, poza lintem `src/**`, aliasy `@spartan-ng/helm/*`).
- Blokery do zaplanowania: (1) w projekcie nie ma Tailwinda; (2) Tailwind v4 nie wspiera SCSS — `styles.scss` trzeba przemianować na `.css` (nasze pliki SCSS nie używają składni Sass); (3) obecne tokeny `--color-*` w `styles.scss` trzeba zmapować na zmienne spartana; (4) dochodzi @angular/cdk i @ng-icons.
- Zmiana (2026-11-15): theme `neutral` zamiast `stone` (makiety z kitu używają neutral), font systemowy (bez Geist), szerokości makiet 1440/390, dochodzi `separator`. Makiety: Figma `QMx4nvFcQC9mpTjJCWPwuS`, strona `1. auth`, odczyt w `mockup-review.md`. i18n (klucze tłumaczeń z bazy, zmiana języka) odłożone na osobną zmianę.
