# Odczyt makiet: Kategorie (`/categories`)

> Źródło: plik Figma `QMx4nvFcQC9mpTjJCWPwuS`, strona **2. kategorie** (`2029:1643`).
> Odczytane raz przez Framelink MCP (`get_figma_data` na węźle strony) 2026-11-17. Surowy zrzut: `figma-raw/categories-page-2029-1643.txt`.
> Ponowny odczyt tylko wtedy, gdy ramka się zmieni.
> Bazowy URL: `https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=<id>`

## Ramki

| # | Ramka | Desktop (1440) | Mobile (390) |
| --- | --- | --- | --- |
| A | Pusty stan | [2033-345](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-345) | [2033-365](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-365) |
| B | Pusty stan, formularz: „Wakacje” + Narastająca | [2033-386](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-386) | — |
| C | Lista (3 + 3) | [2033-406](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-406) | [2033-426](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-426) |
| D | Powtórzona nazwa (błąd pola) | [2033-447](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2033-447) | — |

Minimum z briefu (A i C w obu szerokościach) jest spełnione.

## Shell

- Desktop: wiersz 1200px, padding 16px 0, gap 24px: `PennyPlan` (`text-xl font-semibold`) · **`Kategorie`** · e-mail (`text-sm text-muted-foreground`, wypełnia resztę, do prawej) · `Wyloguj` (outline). Pod spodem Separator.
- Link `Kategorie` to Button `ghost` w wariancie **State=hover** (tło `#F5F5F5` = `--accent`), czyli stan aktywny jest narysowany jako hover. Nieaktywnego linku nie narysowano (jest tylko jedna pozycja).
- Mobile (**ponowny odczyt 2026-11-17, `figma-raw/categories-page-2029-1643-v2.txt`**): nagłówek to jeden wiersz (padding 16px, gap 12px): `PennyPlan` (`text-base font-semibold`) · e-mail (ucinany) · `Wyloguj`, pod nim Separator. Nawigacja przeniesiona do **„Stopki aplikacji”** na dole ramki (A `2046:2120`, C `2046:2130`; 390×65, Separator u góry, wiersz padding 16px, gap 12px) — `Kategorie` (aktywny, Button `ghost` State=hover). Drugi rząd nagłówka („Nawigacja” `2033:378`/`2033:439`) usunięty. Spójne z ramką home mobile `2017-55`.
- **Decyzja planu (2026-11-17):** link nawigacji to zawsze Button `outline` (jak w ramkach home); trasa aktywna dodaje `bg-accent` + `aria-current="page"`. Świadome odejście od `ghost` z ramek kategorii.

## Treść strony

- Kolumna 1200px (desktop) / 358px (mobile), **padding-top 32px w obu** (shell w kodzie: `pt-8 md:pt-10`), gap 32px między nagłówkiem strony a resztą.
- Nagłówek strony (gap 8px): `Kategorie` `text-3xl font-semibold` / mobile `text-2xl font-semibold`; podtytuł `text-base text-muted-foreground`: „Kategorie to koperty, na które dzielisz każdy dochód.”
- Desktop: wiersz, **gap 32px**: lewa kolumna wypełnia resztę (gap 24px), prawa ma stałe 380px. Mobile: kolumna (gap 24px) w kolejności formularz → pusty stan / lista.

### Karta „Nowa kategoria” (A, B, C, D)

- Card (`hlmCard`, nagłówek bez opisu i bez akcji, bez stopki; tytuł kitu 16px medium → `hlmCardTitle`).
- Zawartość, gap 24px:
  1. Pole „Nazwa”: Label + Input (A/C: pusty, bez placeholdera; B/D: wartość „Wakacje”).
  2. Pole „Typ” (gap 12px): Label + Radio Group (gap 8px), każda opcja to radio z etykietą i opis `text-sm text-muted-foreground` z wcięciem 24px:
     - Przepływowa (domyślnie zaznaczona): „Na bieżący miesiąc. Co niewydane, nie przechodzi dalej.”
     - Narastająca: „Zbiera się z miesiąca na miesiąc, aż ją wydasz.”
  3. Button default „Dodaj kategorię” na całą szerokość.
- D: Input w stanie invalid (obrys `--destructive` + ring destructive), pod nim tekst `text-sm` w kolorze destructive: „Masz już kategorię o tej nazwie.” → `hlm-field-error`.

### A: pusty stan

Card: tytuł „Nie masz jeszcze żadnej kategorii”, opis (muted): „Kategoria to koperta na część dochodu. Ustalasz, jaki procent wpływu do niej trafia – bez zapisywania paragonów.” Treść (gap 24px):
- Dwie sekcje: obok siebie na desktopie (gap 24px), jedna pod drugą na mobile. Każda (gap 12px) to Badge i lista przykładów (`text-sm`, kolor foreground, nieklikalne, gap 8px):
  - Badge `secondary` „Przepływowa”: Życie i rachunki · Jedzenie na mieście · Przyjemności
  - Badge `outline` „Narastająca”: Wakacje · Opłaty roczne · Oszczędności
- Stopka `text-sm text-muted-foreground`: „To tylko przykłady – nic nie tworzymy za Ciebie.”

### C: lista

- Bez Card. Dwie grupy (gap 24px), każda (gap 12px) to nagłówek `text-sm font-semibold` („Przepływowe · 3”, „Narastające · 3”) i wiersze.
- Wiersz to **Item** (`hlmItem`, variant default, size xs, wysokość nadpisana na 44px, padding `8px 10px`): tytuł `text-sm font-medium` i w slocie Actions Badge typu (`secondary` / `outline`). Między wierszami jest Separator.
- Kolejność alfabetyczna: Jedzenie na mieście, Przyjemności, Życie i rachunki | Obligacje rodzinne, Opłaty roczne, Wakacje.

## Komponenty

| Komponent kitu | Helm | W repo (`frontend/libs/ui`) |
| --- | --- | --- |
| Card | `card` | jest |
| Input (default, value, invalid) | `input` | jest |
| Label / Field | `label`, `field` | jest |
| Button default / outline / ghost | `button` | jest |
| Separator | `separator` | jest |
| Badge secondary / outline | `badge` | **brak, do dodania** |
| Radio Group + Radio Indicator | `radio-group` | **brak, do dodania** |
| Item (+ Item Actions) | `item` | **brak, do dodania (nie było w briefie)** |

## Tokeny

Tylko wartości kitu `neutral`: `#FFFFFF` background/card, `#0A0A0A` foreground, `#171717` primary, `#FAFAFA` primary-foreground, `#737373` muted-foreground, `#E5E5E5` border/input, `#F5F5F5` secondary/accent, `#E7000B` destructive (kit, odpowiada `--destructive`), ring destructive `rgba(231,0,11,.2)`. Nie ma nowych kolorów.

## Stany bez makiety

Ładowanie listy, błąd wczytania listy, zapisywanie (disabled + Spinner), błąd serwera przy zapisie, pusty submit („Podaj nazwę kategorii.”), focus-visible, B/D w wersji mobile, nieaktywny link nawigacji.

---

# Odczyt makiet: Home (`/`) z wejściem do Kategorii

> Źródło: plik Figma `QMx4nvFcQC9mpTjJCWPwuS`, strona **1. auth** (`2003:316`).
> Odczytane raz przez Framelink MCP (`get_figma_data` na węźle strony) 2026-11-17. Ponowny odczyt tylko wtedy, gdy ramka się zmieni.

## Ramki

| Ramka | Węzeł | Co pokazuje |
| --- | --- | --- |
| Home · desktop - new | [2041-2096](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2041-2096) | Nowa ramka. Nagłówek (wiersz 1200px, padding 16px 0, gap 24px): `PennyPlan` · **`Kategorie` — Button `outline`, State=default** (komponent 21:14) · e-mail muted (fill, do prawej) · `Wyloguj` (outline). Treść bez zmian: „Witaj w PennyPlan” / „Tu wkrótce pojawi się Twój budżet.” |
| Home · mobile / | [2017-55](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-55) | Ramka **zmieniona w miejscu** (ta sama, co w rejestrze „Shell + home”). Nagłówek bez zmian (`PennyPlan` · e-mail · `Wyloguj`). Doszła **„Stopka aplikacji”** (`2044:2112`, wys. 65px): Separator u góry, wiersz 390px, padding 16px, gap 12px, w nim **`Kategorie` — Button `outline`** (instancja nazwana „Wyloguj”, etykieta „Kategorie”). Treść bez zmian. |
| Home · desktop / | [2017-49](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-49) | Stara ramka bez nawigacji (bez zmian). |

## Na stronie home NIE ma przycisku „Zarządzaj kategoriami” w treści

Wejście do kategorii to pozycja nawigacji „Kategorie”, nie przycisk w treści strony.

## Rozbieżności z ramkami Kategorii (`2. kategorie`)

1. **Wariant linku na desktopie:** home — `outline` (default); kategorie — `ghost` w stanie hover (tło `--accent`) jako „aktywny”.
2. **Miejsce nawigacji na mobile:** home — stopka aplikacji (dół ekranu) z przyciskiem `outline`; kategorie — drugi rząd nagłówka (`ghost` aktywny).

Tokeny: tylko wartości kitu `neutral` (`#FFFFFF`, `#0A0A0A`, `#737373`, `#E5E5E5`) — bez nowych kolorów.

**Rozstrzygnięte 2026-11-17:** ramki kategorii mobile przerysowane (nawigacja w stopce, jak na home — patrz sekcja Shell wyżej). Wariant: zawsze `outline`, aktywny + `bg-accent` (decyzja planu).
