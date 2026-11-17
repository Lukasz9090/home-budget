# Brief makiet: Kategorie (`/categories`) — S-02 first-categories

> Wejście dla agenta w Figmie. Źródła: PRD (FR-003, FR-004, FR-017, reguły biznesowe), roadmapa S-02,
> odczyt istniejących makiet `context/changes/design-system/mockup-review.md`.
> Ekran nie istnieje jeszcze w kodzie — to jest jego pierwsza makieta, nie audyt.

## 1. Cel ekranu (jednym zdaniem)

Użytkownik, który właśnie założył konto, rozumie, czym jest kategoria i czym różni się kategoria
**przepływowa** od **narastającej**, a potem sam tworzy swoje kategorie — system nie tworzy żadnej za niego.

## 2. Zakres — co JEST, a czego NIE MA na ekranie

Jest:
- lista kategorii użytkownika (nazwa + typ),
- formularz dodania kategorii: nazwa + typ (przepływowa / narastająca),
- pusty stan z wyjaśnieniem i przykładami (FR-017),
- link „Kategorie” w nagłówku shella (dziś nagłówek nie ma nawigacji).

Nie ma (inne plastry — nie rysować):
- zmiana nazwy, archiwizacja, usuwanie kategorii, menu „⋯” na wierszu (S-08),
- zmiana typu istniejącej kategorii (brak FR),
- kwoty, salda, procenty, sumy narastające (S-03, S-05),
- przycisk „Dodaj przykładowe” / „Utwórz wszystkie” — PRD wprost odrzuca tworzenie kategorii przez system,
- ikony/kolory/emoji przypisane do kategorii, opis kategorii, kolejność drag & drop.

## 3. Ramy techniczne (tak samo jak dotychczasowe makiety)

- Plik Figma: `QMx4nvFcQC9mpTjJCWPwuS` (kit spartan, styl `nova`, motyw `neutral`). Nowa strona np. **„2. kategorie”**.
- Ramki: desktop **1440×900**, mobile **390×844** (wysokość może rosnąć przy liście).
- Shell jak w ramkach `2017-49` / `2017-55`: nagłówek pełnej szerokości, treść w kolumnie 1200px (desktop) / 358px z marginesami 16px (mobile), padding-top 40px / 32px.
- Tylko zmienne/tokeny kitu (background, foreground, card, primary, muted, muted-foreground, border, destructive, ring). Żadnych nowych kolorów — jeśli coś jest potrzebne (np. kolor odróżniający typ), zgłosić, nie wymyślać.
- Tylko komponenty kitu. Mamy w kodzie: Card, Field/Field Group, Label, Input, Button (default/outline/link/ghost), Separator, Alert, Spinner. **Nowe, które ten ekran wprowadzi:** Radio Group (wybór typu), Badge (typ na liście). Każdy inny komponent użyty w makiecie — wypisać w notatce przy ramce.
- Font: kit ma Geist, aplikacja używa systemowego — bez znaczenia dla makiety.
- Copy po polsku, dokładnie jak poniżej (można poprawić, ale wtedy zaznaczyć zmianę).

## 4. Nagłówek shella (zmiana wspólna dla wszystkich ekranów)

Desktop: `PennyPlan` · **nawigacja: `Kategorie` (aktywna)** · (odstęp) · e-mail (muted, do prawej) · `Wyloguj` (outline).
- Link nawigacji: Button `ghost` lub `link`, stan aktywny wyraźnie odróżniony (np. `ghost` z tłem `muted`/`accent` + `font-medium`). Narysować stan aktywny i nieaktywny.
- Zostawić miejsce na kolejne pozycje w przyszłości („Miesiące”, „Pule”) — teraz rysujemy tylko „Kategorie”.

Mobile (390): `PennyPlan` · e-mail (ucinany wielokropkiem) · `Wyloguj`; nawigacja w **drugim rzędzie** pod brandem (pozioma lista linków, lewa krawędź, 16px marginesu), nad separatorem. Bez hamburgera (jedna pozycja nie uzasadnia menu).

## 5. Ramki do narysowania

| # | Ramka | Desktop | Mobile |
|---|---|---|---|
| A | Pusty stan — brak kategorii | ✔ | ✔ |
| B | Pusty stan z formularzem w trakcie (wpisana nazwa, wybrana „narastająca”) | ✔ | — (opcjonalnie) |
| C | Lista — kilka kategorii obu typów | ✔ | ✔ |
| D | Błąd walidacji nazwy (duplikat) | opcjonalnie | — |

Minimum do rejestru `mockups.md`: **A i C w obu szerokościach**. B i D pomagają, ale stany błędu/ładowania mogą powstać „bez makiety” z kitchen sinka.

### Układ wspólny (A, B, C)

Nagłówek strony:
- `Kategorie` — `text-3xl font-semibold` (desktop) / `text-2xl font-semibold` (mobile).
- Pod spodem `text-base text-muted-foreground`: „Kategorie to koperty, na które dzielisz każdy dochód.”

Desktop: **dwie kolumny** pod nagłówkiem, gap 24px:
- lewa (szersza, ~2/3): pusty stan (A/B) albo lista (C),
- prawa (~1/3, ~380px): karta formularza „Nowa kategoria”, przyklejona do góry kolumny.

Mobile: jedna kolumna, kolejność: nagłówek → **karta formularza** → pusty stan / lista. (Formularz pierwszy, bo dodawanie to główna czynność na tym ekranie.)

### Karta formularza „Nowa kategoria” (wspólna dla A, B, C)

Card, bez stopki; zawartość:
1. Tytuł karty: `Nowa kategoria` (`text-lg font-semibold` lub tytuł Card z kitu).
2. Field „Nazwa” — Label `Nazwa` + Input (pusty, bez placeholdera — zgodnie z decyzją z auth; ewentualnie placeholder „np. Wakacje” — zaznaczyć wybór w notatce).
3. Field „Typ” — Label `Typ` + **Radio Group** z dwiema opcjami, każda z opisem (Field Description, muted):
   - ◉ **Przepływowa** *(domyślnie zaznaczona)* — „Na bieżący miesiąc. Co zostanie niewydane, nie przechodzi na kolejny miesiąc.”
   - ○ **Narastająca** — „Zbiera się z miesiąca na miesiąc, aż ją wydasz. Np. wakacje, opłata roczna.”
   Wariant mile widziany: opcje jako dwa klikalne „kafelki” (radio w obramowanym boksie z opisem) — jeśli kit ma taki wzorzec (Field + Radio „choice card”), użyć go; nie budować własnego.
4. Button `Dodaj kategorię` (default, pełna szerokość karty).

### A — Pusty stan (FR-017)

W lewej kolumnie (mobile: pod formularzem) jedna Card (albo komponent Empty z kitu, jeśli jest — zgłosić, którego użyto):
- Tytuł: `Nie masz jeszcze żadnej kategorii`
- Akapit (muted): „Kategoria to koperta na część dochodu. Ustalasz, jaki procent każdego wpływu do niej trafia — i nie musisz potem zapisywać każdego paragonu.”
- Dwie sekcje obok siebie (desktop) / jedna pod drugą (mobile), każda z nagłówkiem `text-sm font-medium` i Badge typu:
  - **Przepływowa** — „Pieniądze na bieżący miesiąc. Nie przechodzą dalej.”
    Przykłady (zwykła lista, muted): Życie i rachunki · Jedzenie na mieście · Przyjemności
  - **Narastająca** — „Suma rośnie co miesiąc, aż z niej wydasz.”
    Przykłady: Wakacje · Opłaty roczne (np. ubezpieczenie auta) · Oszczędności
- Stopka akapitu (muted, `text-sm`): „To tylko przykłady — nic nie tworzymy za Ciebie. Dodaj własne w formularzu obok.” (mobile: „…w formularzu powyżej.”)
- Przykłady to **zwykły tekst**, nie przyciski i nie checkboxy (patrz decyzja D3).

### B — Pusty stan z formularzem w trakcie

Jak A, ale w formularzu: Nazwa = „Wakacje”, zaznaczona „Narastająca”, przycisk aktywny. Pokazuje, jak wygląda zaznaczona druga opcja radia.

### C — Lista kategorii

Przykładowe dane (6 pozycji, mieszane typy):
- Przepływowe: Życie i rachunki · Jedzenie na mieście · Przyjemności
- Narastające: Wakacje · Opłaty roczne · Obligacje rodzinne

Układ listy (rekomendacja): **dwie grupy** w jednej Card (lub dwie Card), każda z nagłówkiem grupy i licznikiem:
- `Przepływowe · 3` — pod nim krótki opis muted „Na bieżący miesiąc.”
- `Narastające · 3` — „Zbierają się z miesiąca na miesiąc.”
- Wiersz: nazwa kategorii (`text-sm font-medium`) + po prawej Badge typu (`secondary` dla przepływowej, `outline` dla narastającej — **bez nowych kolorów**). Wiersze rozdzielone Separatorem, wysokość ~44px (wygodny dotyk na mobile).
- Kolejność w grupie: alfabetyczna.
- Brak akcji na wierszu (S-08). Wiersz nie jest klikalny — bez hovera, bez chevronu.

Pusty stan znika, gdy jest ≥1 kategoria. Krótka podpowiedź o typach zostaje w opisach grup.

### D — Błąd (opcjonalnie)

Formularz z nazwą „Wakacje”, gdy taka już istnieje: Input w stanie error + `Field Error` pod nim: „Masz już kategorię o tej nazwie.” Drugi przykład błędu (pusty submit): „Podaj nazwę kategorii.”

## 6. Stany bez makiety (zbudujemy z kitchen sinka — nie rysować, chyba że łatwo)

- **loading** listy: Spinner albo 3 wiersze skeleton w miejscu listy; formularz widoczny od razu.
- **błąd wczytania listy**: destructive Alert w lewej kolumnie: „Nie udało się wczytać kategorii. Odśwież stronę.”
- **zapisywanie**: przycisk disabled + Spinner + „Dodawanie…”.
- **błąd serwera przy zapisie**: destructive Alert na górze karty formularza.
- **po sukcesie**: formularz czyści się (typ wraca do „Przepływowa”), nowa kategoria pojawia się w swojej grupie; fokus wraca do pola Nazwa. Bez toastu.
- **focus-visible** na każdym kontrolu (ring z kitu), **disabled** przycisku.

## 7. Reguły walidacji (dla copy błędów i planu)

- Nazwa wymagana, przycięte spacje, maks. **40 znaków** (do potwierdzenia — D4).
- Nazwa unikalna w obrębie konta, bez rozróżniania wielkości liter („wakacje” = „Wakacje”).
- Typ wymagany, domyślnie „Przepływowa”.
- Typ po utworzeniu jest stały w v1 (brak FR na zmianę) — nie sygnalizujemy tego w UI.

## 8. Decyzje przyjęte w briefie (do potwierdzenia lub zmiany przed rysowaniem)

| # | Decyzja | Rekomendacja w briefie | Alternatywa |
|---|---|---|---|
| D1 | Trasa i wejście | `/categories` + link „Kategorie” w nagłówku | wejście tylko z home |
| D2 | Co z `/` (home) | bez zmian w tym plastrze (placeholder) | home przekierowuje na `/categories`, gdy brak kategorii — rozwiązuje onboarding (OQ1 w PRD) |
| D3 | Przykłady w pustym stanie | zwykły tekst, nieklikalny | klik w przykład wypełnia formularz (nadal nic nie tworzy samo) |
| D4 | Limit nazwy | 40 znaków | 60 / bez limitu |
| D5 | Formularz | inline Card obok listy | Dialog „Dodaj kategorię” (nowy komponent `dialog`) |
| D6 | Wybór typu | Radio Group z opisami | Toggle Group / Switch „Narastająca” |
| D7 | Lista | dwie grupy wg typu | jedna lista z Badge typu |

## 9. Po narysowaniu

1. Dopisać wiersz `Kategorie | /categories | <link desktop node-id> | <link mobile node-id>` do `context/design/mockups.md`, a ramki B/D w kolumnie „Uwagi”.
2. Zaktualizować wiersz „Shell + home”, jeśli nagłówek z nawigacją ma osobne ramki (albo zaznaczyć, że nawigacja jest w ramkach kategorii).
3. Uruchomić `/10x-plan first-categories` — plan odczyta ramki raz i odłoży odczyt w `context/changes/first-categories/`.
