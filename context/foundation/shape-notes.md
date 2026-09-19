---
project: "PennyPlan"
context_type: greenfield
product_type: web-app
target_scale:
  users: small
timeline_budget:
  mvp_weeks: 3
  hard_deadline: null
  after_hours_only: true
created: 2026-09-18
updated: 2026-09-19
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "typ kontekstu"
      decision: "greenfield — pusty szkielet Spring Boot to bootstrap, nie istniejący system"
    - topic: "rodzaj bólu"
      decision: "ręczne liczenie procentów i sald; upierdliwe wpisywanie wydatków; brak widocznych odpowiedzi; rozjeżdżająca się struktura miesięcy"
    - topic: "moment bólu"
      decision: "wpływ dochodu do podziału + podsumowanie na koniec miesiąca"
    - topic: "zasięg persony"
      decision: "wielu niezależnych użytkowników prowadzących budżet kopertowy, każdy z własnym kontem i kategoriami"
    - topic: "przenoszenie sald między miesiącami"
      decision: "BRAK automatycznego przenoszenia — resztę użytkownik wprowadza ręcznie jako nowy typ dochodu w kolejnym miesiącu i sam dzieli ją na kategorie"
    - topic: "model dostępu"
      decision: "e-mail + hasło; otwarta rejestracja; brak weryfikacji maila w MVP; płaski model bez ról; brak współdzielenia budżetu"
    - topic: "atrybuty kategorii"
      decision: "kategoria ma flagę [sumuj per miesiąc] — narastająca vs przepływowa. Flaga [dopuszczaj debet] usunięta z v1 w rundzie Sokratesa: debet dozwolony wszędzie z ostrzeżeniem"
    - topic: "relacja wydatku do budżetu miesiąca"
      decision: "wydatek wskazuje kategorię źródłową i nie jest ograniczony dochodem miesiąca; suma wypływów może przekroczyć 100% dochodu miesiąca"
    - topic: "zakres v1"
      decision: "analiza LLM odsunięta do v2; v1 = kategorie, miesiące, dochody, podział procentowy z nadpisaniem kwoty, panel narastający, wydatki, notatka miesiąca"
    - topic: "typy dochodu"
      decision: "słownik użytkownika wielokrotnego użytku, tak jak kategorie"
    - topic: "klucz podziału procentowego"
      decision: "podpowiedź toczy się z ostatniego użycia danego typu dochodu (styczeń 50% -> luty 45% -> marzec podpowiada 45%); nie jest zapisanym na stałe kluczem"
    - topic: "walidacja sumy procentów"
      decision: "twarda — nie da się zapisać podziału o sumie procentów różnej od 100%"
    - topic: "nazwa produktu"
      decision: "PennyPlan — wybrana mimo zastrzeżenia, że człon Penny sugeruje mikrokontrolę; ryzyko przyjęte świadomie"
    - topic: "ramy produktu"
      decision: "aplikacja webowa; garstka użytkowników na start; brak twardego terminu; praca po godzinach"
    - topic: "reguła domenowa"
      decision: "rozdziel wpływ wg procentów, przelicz rzeczywisty udział po korekcie kwoty, pomniejsz wskazaną pulę o wydatek, utrzymuj saldo kategorii kumulujących się"
    - topic: "niezgodność sumy kwot z kwotą wpływu"
      decision: "widoczna jako kwota nierozdzielona; zapis dozwolony; nic nie domykane po cichu"
    - topic: "zmiana kwoty wpływu po nadpisaniu kwot"
      decision: "przeliczane tylko wiersze nienadpisane; ręczna kwota nietykalna"
    - topic: "zaokrąglenia"
      decision: "do grosza; reszta z zaokrągleń trafia do kwoty nierozdzielonej"
    - topic: "granica sumy narastającej"
      decision: "brak granicy roku — pulę zeruje wydatek, nie zmiana roku; roczny obrót przez filtr okresu"
    - topic: "edycja i usuwanie kategorii"
      decision: "zmiana nazwy propaguje się na historię; usunięcie to archiwizacja — kategoria znika z listy wyboru, wpisy historyczne zostają"
    - topic: "rok w tożsamości miesiąca"
      decision: "miesiąc to para rok + miesiąc; wrzesień 2026 i wrzesień 2027 to dwa różne miesiące; porządek miesięcy jest globalny"
    - topic: "przełom roku a pule narastające"
      decision: "nic nie dzieje się automatycznie — zmiana roku nie rusza żadnej puli; potwierdzenie decyzji z rundy Sokratesa, bez rytuału zamknięcia roku w v1"
    - topic: "przesunięcie kwoty między pulami"
      decision: "kształt rozstrzygnięty: dowolna kategoria do dowolnej kategorii, kwota ograniczona saldem puli źródłowej (bez debetu, w odróżnieniu od wydatku). Odsunięte do v2 — kontrargument o koszcie trzeciej operacji przyjęty; w v1 obejście przez wydatek + typ dochodu"
    - topic: "rytuał zamknięcia roku"
      decision: "ekran pytający o każdą pulę na przełomie roku plus flaga [rozliczana rocznie] — odsunięte do v2; domyślną opcją musi tam pozostać przeniesienie"
  frs_drafted: 17
  quality_check_status: accepted
---

# Shape notes — PennyPlan

Notatki z sesji discovery. Nagłówki `##` odpowiadają sekcjom PRD wg
`skills/10x-shape/references/prd-schema.md` (greenfield, 10 sekcji).
Treść po polsku — to język, w którym użytkownik opisał domenę.

Źródło ziarna: `draft.md` (wczytany w całości) + opis przekazany przy wywołaniu `/10x-shape`.

## Vision & Problem Statement

Osoba prowadząca domowy budżet metodą kopertową — dzieląca każdy dochód procentowo
na własne kategorie — robi to dziś w arkuszu kalkulacyjnym. Przy każdym dochodzie i
każdym wydatku musi ręcznie przeliczać procenty i pilnować sald kategorii, co jest
podatne na błędy. Wpisywanie wydatków jest na tyle upierdliwe, że zniechęca do
prowadzenia budżetu w ogóle. Kluczowe odpowiedzi — „ile mam zebrane na wakacje",
„ile zostało w kategorii życie i rachunki" — są w danych, ale nie są widoczne bez
ręcznego składania ich za każdym razem. Każdy nowy miesiąc oznacza kopiowanie
zakładki i ręczne wyrównywanie struktury, przez co historia robi się niespójna.
Ból uderza w dwóch momentach: gdy wpływa dochód i trzeba go rozdzielić, oraz na
koniec miesiąca przy podsumowaniu.

Insight: **to nie jest tracker wydatków.** Typowe aplikacje budżetowe rejestrują
wydatki po fakcie i wymagają wpisywania paragonów. Tutaj gruby procent przypisany
z góry do szerokiej kategorii (np. 50% na „życie i rachunki") istnieje właśnie po
to, żeby paragonów NIE wpisywać — alokacja zastępuje śledzenie. Do tego dwie rzeczy,
których status quo nie daje: analiza LLM na żądanie za dowolnie wybrany okres
(jeden przycisk zamiast ręcznej interpretacji arkusza) oraz w pełni własne typy
dochodu, każdy z osobnym kluczem podziału (pensja ≠ premia ≠ 800+).

## User & Persona

Osoba prowadząca domowy budżet metodą kopertową (procentowy podział dochodu na
samodzielnie zdefiniowane kategorie). Świadomie nie chce śledzić każdego wydatku —
chce prostego narzędzia, w którym raz ustala klucz podziału, a potem odnotowuje
tylko wydatki, które mają znaczenie (np. wyjazd pomniejszający pulę wakacyjną).

Zasięg: wielu niezależnych użytkowników, każdy z własnym kontem i własnym zestawem
kategorii. Budżety nie są współdzielone między użytkownikami.

Moment sięgnięcia po produkt:
1. wpływa dochód (pensja, premia, świadczenie, resztka z poprzedniego miesiąca)
   i trzeba go rozdzielić na kategorie;
2. koniec miesiąca — podsumowanie, notatka i ocena, czy plan się trzyma.

### Rozstrzygnięcie: brak automatycznego przenoszenia sald

Miesiąc jest zamknięty. Salda kategorii NIE przechodzą automatycznie na kolejny
miesiąc. To, co zostało, użytkownik wprowadza ręcznie w nowym miesiącu jako nowy
typ dochodu („pozostałość z poprzedniego miesiąca: X zł") i sam decyduje o jego
podziale na kategorie — resztka może trafić gdzie indziej, niż leżała.

Otwarte, do rozstrzygnięcia w Fazie 5: narastające „ile zebrano na wakacje" nie
jest przenoszeniem salda, tylko sumowaniem kategorii za wybrany okres (raport).

## Access Control

Model wielu niezależnych użytkowników, płaski — jedna rola.

- **Uwierzytelnianie**: e-mail + hasło. Rejestracja otwarta dla każdego, bez
  zaproszeń i bez kodów dostępu.
- **Weryfikacja adresu e-mail**: poza MVP. Wysyłka maili nie jest zależnością
  krytyczną pierwszej wersji.
- **Role**: brak podziału ról. Nie ma administratora ani konta wsparcia.
- **Widoczność danych**: każdy użytkownik widzi wyłącznie własne dane — własne
  typy dochodów, kategorie, miesiące, wydatki i notatki. Budżety nie są
  współdzielone między kontami; nie istnieje mechanizm zapraszania drugiej osoby
  do budżetu.
- **Dostęp niezalogowany**: poza ekranami rejestracji i logowania aplikacja nie
  udostępnia żadnych danych. Niezalogowane wejście na trasę z danymi kończy się
  przekierowaniem do logowania.

## Success Criteria

### Primary

- Użytkownik przechodzi od pustego konta do widoku miesiąca z rozdzielonym
  dochodem i działającym panelem narastającym — w jednej sesji, bez sięgania
  po arkusz kalkulacyjny.

### Secondary

- Wpisanie całego miesiąca (dochód, podział procentowy, korekty kwot, notatka)
  domyka się w mniej niż 5 minut — jedno krótkie posiedzenie zamiast półgodzinnej
  sesji z arkuszem.

### Guardrails

- Dane jednego konta nigdy nie stają się widoczne dla innego konta. Żadne
  zapytanie nie zwraca kategorii, dochodów, wydatków ani notatek innego
  użytkownika.
- Historia miesięcy nie znika i nie przelicza się wstecz. Zmiana kategorii lub
  procentów dzisiaj nie modyfikuje zamkniętych, wcześniejszych miesięcy.
- Ręcznie nadpisana kwota nie jest nigdy nadpisywana z powrotem wartością
  wyliczoną z procentu. (To dokładnie ta właściwość, która psuje się w arkuszu.)
- Odnotowanie wydatku nie wymaga wpisywania paragonów ani kategoryzowania
  drobnych zakupów. Produkt, który tego wymaga, przestaje być tym, po co powstał.

## Working notes: przepływ MVP

Materiał pomocniczy dla Faz 4 i 5 — NIE jest sekcją PRD.

```
1. definiuję kategorie      słownik użytkownika: nazwa
                            + [sumuj per miesiąc]  → kategoria narastająca
                            + [dopuszczaj debet]   → suma może zejść poniżej zera
2. dodaję miesiąc           np. wrzesień
3. dodaję rodzaje dochodów  dla tego miesiąca: typ + kwota
                            (pensja 15 000, premia 50 000, 800+, pozostałość z
                             poprzedniego miesiąca)
4. dzielę każdy dochód      osobna tabelka podziału per rodzaj dochodu:
                            kategoria | % | sugerowana kwota | kwota rzeczywista | rzeczywisty %
                            — sugerowaną liczy system z procentu
                            — kwotę rzeczywistą nadpisuje użytkownik
                            — rzeczywisty procent system przelicza wstecz z kwoty
   ────────────────── ↑ pierwszy moment wartości ──────────────────
5. widok miesiąca           tabelki podziału + notatka/podsumowanie miesiąca
6. panel narastający        widoczny zawsze, niezależnie od wybranego miesiąca:
                            suma per kategoria dla kategorii narastających
7. wydatki                  wydatek wskazuje kategorię źródłową; dla kategorii
                            narastającej pomniejsza sumę narastającą, dla
                            przepływowej — pulę bieżącego miesiąca
```

Dwa niezależne przepływy (rozstrzygnięte w Fazie 3):

- **Podział dochodu** zawsze rozdziela 100% dochodu danego miesiąca.
- **Wydatek** nie jest ograniczony budżetem miesiąca — sięga do puli wskazanej
  przez użytkownika, także do puli zbieranej przez wiele miesięcy. Suma wypływów
  w miesiącu może przekroczyć dochód tego miesiąca i NIE jest to błąd: sierpień
  wakacyjny dzieli dochód jak zawsze, a dodatkowo zdejmuje wyjazd z puli
  zbieranej cały rok. Od tego ta pula była zbierana.

## Timeline budget

`mvp_weeks: 3`, praca po godzinach. Zakres zawężony w Fazie 3: analiza LLM
świadomie odsunięta do v2 — bez kilku wypełnionych miesięcy nie miałaby czego
analizować. Pierwsza wersja to kroki 1–7 powyżej.

## Functional Requirements

Wszystkie FR-y v1 są `must-have` — zakres został zawężony w Fazie 3, więc nie ma
tu pozycji "na potem". Reguły wykonywane przez system (wyliczenie sugerowanej
kwoty, przeliczenie rzeczywistego procentu, walidacja 100%, wpływ wydatku na
pulę) NIE są FR-ami — mieszkają w `## Business Logic`.

Numeracja ma lukę: FR-005 został usunięty w rundzie Sokratesa i nie jest
przenumerowany, żeby odwołania z tej sesji pozostały czytelne.

### Konto i dostęp

- FR-001: Użytkownik może założyć konto podając e-mail i hasło. Priority: must-have
  > Socrates: Kontrargument rozważony: "konto opóźnia pierwszą wartość — rejestracja
  > to pierwsze tarcie w narzędziu, które ma być prostsze niż Excel". Rozstrzygnięcie:
  > FR zostaje, wieloosobowa persona wymaga kont; kształt onboardingu trafia do
  > Open Questions jako nierozstrzygnięty.
- FR-002: Użytkownik może się zalogować i wylogować. Priority: must-have
  > Socrates: Kontrargument rozważony: "krótka sesja zabije nawyk — rytuał
  > 5-minutowego miesiąca nie może zaczynać się od przypominania hasła".
  > Rozstrzygnięcie: FR zostaje, a kontrargument staje się wymaganiem
  > pozafunkcjonalnym o długiej sesji (patrz NFR).

### Słowniki użytkownika

- FR-003: Użytkownik może zdefiniować własną kategorię z nazwą. Priority: must-have
  > Socrates: Kontrargument rozważony: "pusty słownik to pusty ekran na starcie —
  > startowy zestaw kategorii zdjąłby tę barierę". Rozstrzygnięcie: bariera uznana
  > za realną, ale gotowe kategorie odrzucone jako narzucające cudzy sposób
  > myślenia; zamiast nich pusty stan z przykładami (FR-017).
- FR-004: Użytkownik może oznaczyć kategorię jako narastającą, czyli sumowaną przez kolejne miesiące. Priority: must-have
  > Socrates: Kontrargument rozważony: "dwie mechaniki (przepływowa vs narastająca)
  > to dwa razy więcej do zrozumienia, zanim cokolwiek wpiszesz". Rozstrzygnięcie:
  > FR zostaje — asymetria jest rdzeniem pomysłu, a koszt zrozumienia przyjęty
  > świadomie.
- FR-006: Użytkownik może zmienić nazwę istniejącej kategorii; zmiana obowiązuje także w historii. Priority: must-have
  > Socrates: Brak kontrargumentu — to ta sama kategoria, więc nazwa powinna być
  > jedna. Zostaje bez zmian.
- FR-007: Użytkownik może zarchiwizować kategorię tak, że znika ona z listy wyboru przy nowych wpisach, a historyczne wpisy pozostają nietknięte. Priority: must-have
  > Socrates: Kontrargument rozważony: "zarchiwizowana kategoria z niezerową sumą
  > narastającą albo znika z panelu razem z pieniędzmi, albo wcale nie zniknęła".
  > Rozstrzygnięcie: FR doprecyzowany — kategoria znika z listy wyboru, ale
  > pozostaje widoczna w panelu narastającym dopóki jej suma jest różna od zera.
- FR-008: Użytkownik może zdefiniować własny typ dochodu (np. pensja, premia, 800+, pozostałość z poprzedniego miesiąca). Priority: must-have
  > Socrates: Brak kontrargumentu — bez słownika typów nie da się podpowiadać
  > klucza podziału, a to on skraca wpisanie miesiąca do 5 minut.
- FR-009: Użytkownik może przyjąć lub zmienić podpowiedziany podział procentowy, wyliczony z ostatniego użycia danego typu dochodu. Priority: must-have
  > Socrates: Kontrargument rozważony: "domyślny klucz zamrozi Cię w starym
  > podziale" oraz "jeden klucz na typ dochodu to za grubo". Rozstrzygnięcie: FR
  > przeredagowany — podpowiedź nie jest zapisanym na stałe kluczem, tylko toczy
  > się z ostatniego użycia (styczeń 50% → luty 45% → marzec podpowiada 45%),
  > w kolumnie podziału procentowego. Jest sugestią dla przyspieszenia, nie regułą.

### Miesiąc i dochody

- FR-010: Użytkownik może dodać miesiąc, identyfikowany przez rok i miesiąc. Priority: must-have
  > Socrates: Kontrargument rozważony: "ręczne dodawanie pozwala na luki w historii
  > (wrzesień, potem listopad), przez co suma narastająca przestaje opisywać rok".
  > Rozstrzygnięcie: FR zostaje, a system ostrzega o brakującym miesiącu, nie
  > blokując zapisu.
  > Uzupełnienie: miesiąc jest parą rok + miesiąc — wrzesień 2026 i wrzesień 2027
  > to dwa różne miesiące. Bez tego ostrzeżenie o luce traci sens po dwunastu
  > wpisach, a filtr okresu nad panelem nie ma czego zawężać.
- FR-011: Użytkownik może dodać wpis dochodu w miesiącu, wybierając typ ze słownika, podając kwotę i opcjonalnie datę dzienną. Priority: must-have
  > Socrates: Kontrargument rozważony: "brak daty czyni wpis nieanalizowalnym —
  > analiza z v2 nie odczyta rytmu wpływów, a dodanie daty później zostawi
  > historyczne wpisy bez niej". Rozstrzygnięcie: FR rozszerzony o opcjonalną datę
  > dzienną. Miesiąc pozostaje jednostką planowania; data jest dodatkiem.
- FR-012: Użytkownik może rozdzielić każdy wpis dochodu procentowo na wybrane kategorie. Priority: must-have
  > Socrates: Kontrargument rozważony: "osobny podział per dochód rozdrabnia obraz —
  > może wystarczyłby jeden podział całego miesięcznego wpływu". Rozstrzygnięcie:
  > osobne tabelki zostają, bo każdy typ dochodu ma inny sens i inny klucz; doszedł
  > natomiast zbiorczy widok podsumowujący (FR-018).
- FR-013: Użytkownik może nadpisać sugerowaną kwotę kwotą rzeczywistą. Priority: must-have
  > Socrates: Kontrargument rozważony: "cztery kolumny (procent, sugerowana,
  > rzeczywista, rzeczywisty procent) to dużo liczb naraz — trudno wskazać tę
  > prawdziwą". Rozstrzygnięcie: FR zostaje; czytelność kolumn to zadanie projektu
  > interfejsu, nie zmiana zakresu.

### Wgląd, wydatki, podsumowanie

- FR-014: Użytkownik może zobaczyć panel sum narastających per kategoria, niezależnie od otwartego miesiąca, i zawęzić go filtrem okresu. Priority: must-have
  > Socrates: Kontrargument rozważony: "suma bez granicy rośnie w nieskończoność —
  > może panel powinien liczyć w granicach roku". Rozstrzygnięcie: odrzucony
  > kontrprzykładem użytkownika — odkładanie styczeń–październik na opłatę płatną
  > w październiku oznacza, że listopad i grudzień zbierają już na przyszły rok;
  > reset roczny skasowałby te dwa miesiące. Pulę zeruje wydatek, nie zmiana roku.
  > Pytanie "ile rocznie wydaję na tę kategorię" rozwiązuje filtr okresu nad
  > panelem, bez naruszania puli.
- FR-015: Użytkownik może dodać wydatek, wskazując kwotę, kategorię źródłową i opcjonalnie datę dzienną. Priority: must-have
  > Socrates: Kontrargument rozważony: "wydatek, który nie pasuje do żadnej puli
  > (mandat, awaria), zmusza do wymyślania kategorii na poczekaniu".
  > Rozstrzygnięcie: kategoria źródłowa pozostaje wymagana — gruba kategoria
  > przepływowa ("życie i rachunki") jest właśnie workiem na nieprzewidziane.
  > Żadnej nowej mechaniki ani kategorii systemowej.
- FR-016: Użytkownik może zapisać notatkę lub podsumowanie miesiąca w wolnym polu tekstowym. Priority: must-have
  > Socrates: Kontrargument rozważony: "jedno wolne pole jest nieanalizowalne dla
  > analizy LLM w v2". Rozstrzygnięcie: odrzucony — model językowy poradzi sobie
  > z luźnym tekstem lepiej niż z formularzem, którego nikt nie wypełni.
- FR-017: Użytkownik bez zdefiniowanych kategorii widzi wyjaśnienie, czym jest kategoria, wraz z przykładami, których system nie tworzy za niego. Priority: must-have
  > Socrates: Kontrargument rozważony: "gotowy startowy zestaw narzuca cudzy sposób
  > myślenia — kategorie to najbardziej osobista część tego narzędzia".
  > Rozstrzygnięcie: pierwotny FR (utworzenie startowych kategorii) usunięty
  > i zastąpiony pustym stanem z przykładami. Bariera zdjęta, nic nie narzucone.
- FR-018: Użytkownik może zobaczyć zbiorczą tabelkę tylko do odczytu, pokazującą kwotowo i procentowo, jak rozkłada się suma wszystkich dochodów miesiąca. Priority: must-have
  > Socrates: Kontrargument rozważony: "sumuje rzeczy o różnym sensie — 800+ idzie
  > w całości na obligacje rodzinne, premia zupełnie gdzie indziej, więc zbiorczy
  > procent skleja trzy intencje w jedną liczbę". Rozstrzygnięcie: FR zostaje bez
  > zmian, z kwotami i procentem; użytkownik świadomie przyjmuje ryzyko
  > interpretacji.

### Usunięte w rundzie Sokratesa

- ~~FR-005: Użytkownik może dopuścić na kategorii debet.~~ Usunięty z v1.
  > Socrates: Kontrargument przyjęty: "skoro debet jest świadomą decyzją przy
  > wydatku, flaga na kategorii niczego nie chroni". Rozstrzygnięcie: flaga wypada
  > z v1 — debet jest dozwolony na każdej kategorii, a system jedynie ostrzega
  > przy zejściu poniżej zera. Flaga wraca w v2, jeśli prawdziwe użycie pokaże,
  > że blokada jest potrzebna. Zysk: jedno pole i jedna gałąź logiki mniej.

## User Stories

### US-01: Rozdzielenie dochodu na kategorie w nowym miesiącu

- **Given** zalogowany użytkownik, który ma zdefiniowane kategorie i typ dochodu
  "pensja" użyty w poprzednim miesiącu
- **When** dodaje miesiąc wrzesień, wybiera typ dochodu "pensja", wpisuje kwotę
  15 000 zł i zatwierdza podział
- **Then** widzi tabelkę podziału z kolumnami: kategoria, procent, sugerowana
  kwota, kwota rzeczywista, rzeczywisty procent — z procentami podpowiedzianymi
  z ostatniego użycia tego typu dochodu i sugerowanymi kwotami wyliczonymi
  z tych procentów

#### Acceptance Criteria

- Procenty podpowiedziane pochodzą z ostatniego miesiąca, w którym ten typ
  dochodu wystąpił; użytkownik może zmienić każdy z nich.
- Nadpisanie kwoty rzeczywistej w dowolnym wierszu przelicza rzeczywisty procent
  tego wiersza i nie zmienia wpisanego procentu deklarowanego.
- Podziału nie da się zapisać, jeśli suma procentów deklarowanych jest różna
  od 100%.
- Po zapisaniu podziału kategorie narastające widoczne w panelu sum narastających
  zwiększają się o przydzielone kwoty rzeczywiste.
- Jeśli pominięto miesiąc poprzedzający (luka w historii), system to sygnalizuje,
  ale pozwala zapisać.

## Business Logic

Aplikacja rozdziela każdy wpływ na kategorie według zadeklarowanych procentów,
przelicza rzeczywisty udział po ręcznej korekcie kwoty, pomniejsza wskazaną pulę
o każdy wydatek i utrzymuje bieżące saldo kategorii kumulujących się przez
kolejne miesiące.

Wejścia reguły to: procenty zadeklarowane przez użytkownika dla danego typu
dochodu, kwota wpływu, ręczne korekty kwot oraz wydatki wskazujące kategorię
źródłową. Wyjścia to: sugerowana kwota dla każdej kategorii, rzeczywisty procent
wyliczony wstecz z kwoty faktycznie przeznaczonej, kwota nierozdzielona oraz
bieżąca suma narastająca każdej kategorii kumulującej się. Użytkownik spotyka
regułę w dwóch miejscach: w tabelce podziału przy wpisywaniu dochodu i w panelu
sum narastających, widocznym niezależnie od otwartego miesiąca.

Reguły szczegółowe rozstrzygnięte w tej sesji:

- **Podpowiedź procentów toczy się z ostatniego użycia** danego typu dochodu —
  nie jest zapisanym na stałe kluczem. Styczeń 50%, luty 45%, marzec podpowiada
  45%. To sugestia przyspieszająca, nie reguła wiążąca.
- **Suma procentów deklarowanych musi wynosić dokładnie 100%.** Bez tego podziału
  nie da się zapisać.
- **Suma kwot nie musi zgadzać się z kwotą wpływu.** Różnica jest zawsze widoczna
  jako kwota nierozdzielona; zapis jest dozwolony. Nic nie jest domykane po cichu.
- **Ręcznie wpisana kwota jest nietykalna.** Zmiana kwoty wpływu po zapisaniu
  podziału przelicza wyłącznie wiersze, których użytkownik nie korygował, i
  aktualizuje kwotę nierozdzieloną.
- **Kwoty zaokrąglane są do grosza**, a reszta z zaokrągleń trafia do tej samej
  kwoty nierozdzielonej. Jeden mechanizm obsługuje i ręczne korekty, i grosze.
- **Wydatek pomniejsza pulę wskazaną przez użytkownika**: dla kategorii
  kumulującej się — sumę narastającą, dla kategorii przepływowej — pulę
  bieżącego miesiąca. Kategoria źródłowa jest wymagana.
- **Wydatek nie jest ograniczony dochodem miesiąca.** Suma wypływów w miesiącu
  może przekroczyć wpływy tego miesiąca — od tego pula była zbierana. Zejście
  poniżej zera jest dozwolone na każdej kategorii, z ostrzeżeniem.
- **Suma narastająca liczona jest od początku, bez granicy roku kalendarzowego.**
  Pulę zeruje wydatek, a nie zmiana roku: odkładanie od stycznia do października
  na opłatę płatną w październiku oznacza, że listopad i grudzień zbierają już na
  przyszły rok. Pytanie o roczny obrót kategorii obsługuje filtr okresu nad
  panelem, bez naruszania puli. Zmiana roku nie uruchamia żadnego domknięcia ani
  pytania o pule — w v1 nie istnieje operacja zamknięcia roku.
- **Miesiąc jest parą rok + miesiąc.** Wrzesień 2026 i wrzesień 2027 to dwa różne
  miesiące. Porządek miesięcy jest globalny, więc ostrzeżenie o luce w historii
  działa także na przełomie roku (grudzień, potem luty), a filtr okresu nad panelem
  narastającym może zawężać widok do wybranego roku.
- **Przekazanie kwoty między pulami nie ma w v1 własnej operacji.** Domknięcie typu
  „odłożone 2500 zł na wyjazdy przekazuję na oszczędności" użytkownik zapisuje
  dwoma istniejącymi krokami: wydatkiem z puli źródłowej i nowym wpisem dochodu
  typu „pozostałość z poprzedniego roku", który dzieli na kategorie. Konsekwencja
  jest znana i przyjęta: w danych leży wydatek, który wydatkiem nie był.
- **Reszta niewykorzystana w miesiącu nie przechodzi automatycznie.** Użytkownik
  wprowadza ją w kolejnym miesiącu jako osobny typ dochodu i sam decyduje o jej
  podziale.
- **Luka w ciągu miesięcy jest sygnalizowana, ale nie blokuje zapisu.**

## Non-Functional Requirements

- Sesja utrzymuje się na tyle długo, że powrót do aplikacji po miesiącu przerwy
  nie zaczyna się od odzyskiwania hasła. Rytuał wpisania miesiąca nie jest
  poprzedzony odzyskiwaniem dostępu.
- Dane budżetowe użytkownika nie opuszczają produktu bez jego wyraźnej zgody.
  Wiążące z wyprzedzeniem: analiza wspomagana modelem językowym, planowana na v2,
  przekazuje kwoty i notatki poza produkt, więc wymaga świadomej zgody.
- Zmiana procentu lub kwoty w tabelce podziału aktualizuje pozostałe kolumny
  w czasie poniżej 200 ms — produkt zachowuje się jak arkusz, bo z arkusza
  przychodzi użytkownik.
- Dodanie wydatku i podgląd panelu sum narastających są w pełni użyteczne na
  ekranie telefonu.
- Użytkownik może wyeksportować własne dane do formatu czytelnego poza produktem.

## Non-Goals

Funkcjonalne:

- **Zasoby finansowe w wielu walutach z kursem NBP** — przekrój "ile mam w gotówce,
  na koncie, w obligacjach, w ETF, w krypto" wraz z przeliczeniem po kursie NBP.
  Jest w draft.md, jawnie poza MVP: to osobny obszar, niezwiązany z mechaniką
  podziału wpływu.
- **Pożyczki prywatne** — kto komu ile pożyczył (nie kredyty). Osobna domena
  z własnym cyklem życia.
- **Analiza wspomagana modelem językowym** — odsunięta do v2. Bez kilku
  wypełnionych miesięcy nie miałaby czego analizować. Odsunięcie świadome,
  nie rezygnacja.
- **Współdzielenie budżetu z drugą osobą** — zaproszenia, uprawnienia, rozróżnienie
  autora wpisu. Odrzucone przy wyborze płaskiego modelu dostępu.
- **Automatyczny import transakcji z banku** — brzmi jak ułatwienie, ale wciągnąłby
  produkt z powrotem w śledzenie wydatków, czyli tam, skąd ten produkt ucieka.
- **Śledzenie paragonów i kategoryzacja drobnych wydatków** — odcięcie TRWAŁE,
  nie tylko na v1. Cały produkt istnieje po to, żeby tego nie robić: gruby procent
  na kategorię przepływową zastępuje rejestrowanie zakupów. Złamanie tego non-goala
  unieważnia produkt.
- **Flaga dopuszczalnego debetu na kategorii** — usunięta z v1 w rundzie Sokratesa.
  Debet jest dozwolony wszędzie, z ostrzeżeniem. Flaga wraca w v2, jeśli prawdziwe
  użycie pokaże, że blokada jest potrzebna.
- **Przesunięcie kwoty między pulami jako osobna operacja** — odsunięte do v2.
  Docelowy kształt jest rozstrzygnięty (dowolna kategoria po obu stronach, kwota
  ograniczona saldem puli źródłowej, bez debetu), ale trzecia operacja obok wpływu
  i wydatku nie mieści się w trzech tygodniach. W v1 to samo osiąga się wydatkiem
  z puli źródłowej plus nowym typem dochodu.
- **Rytuał zamknięcia roku** — ekran, który na przełomie roku przechodzi po pulach
  z niezerowym saldem i pyta o każdą, wraz z flagą [rozliczana rocznie] na
  kategorii. Odsunięty do v2; w v1 zmiana roku nie rusza żadnej puli.

Niefunkcjonalne:

- **Działanie bez internetu** — brak gwarancji pracy offline i synchronizacji po
  powrocie sieci.

Nie odcięte, ale i nie w MVP: natywna aplikacja mobilna. Telefon obsługuje
aplikacja webowa; osobna aplikacja ze sklepu pozostaje otwarta na przyszłość.

## Open Questions

1. **Jak wygląda onboarding nowego konta?** — Kontrargument z rundy Sokratesa
   (FR-001): konto opóźnia pierwszą wartość, a rejestracja jest pierwszym
   tarciem w narzędziu, które ma być prostsze niż arkusz. FR-017 (pusty stan
   z przykładami) zdejmuje część problemu, ale kształt całej pierwszej sesji
   pozostaje nierozstrzygnięty. Właściciel: użytkownik. Nie blokuje v1.
2. **Nazwa produktu — świadomie przyjęte ryzyko.** "PennyPlan" wybrany mimo
   zastrzeżenia, że człon "Penny" sugeruje liczenie drobniaków, podczas gdy
   produkt powstał z potrzeby uwolnienia się od mikrokontroli, oraz że w niszy
   budżetowej jest ciasno od nazw z tym członem. Rozstrzygnięte: zostaje.
   Do ewentualnego powrotu przed publikacją.
3. **Co zrobić z historycznymi „udawanymi" wydatkami, gdy przesunięcie dojdzie w v2?**
   W v1 przekazanie kwoty między pulami zapisuje się jako wydatek z puli źródłowej
   plus nowy wpis dochodu. Kiedy przesunięcie stanie się osobną operacją, te wpisy
   zostaną w historii jako wydatki, których nie było — zawyżą roczny obrót kategorii
   i wejdą do analizy z v2. Do rozstrzygnięcia: przepisać je, oznaczyć, czy zostawić
   jak są. Właściciel: użytkownik. Nie blokuje v1.

## Forward: tech-stack

Materiał dla następnego kroku łańcucha — NIE jest częścią PRD.

- W repozytorium istnieje już pusty szkielet: Maven, Spring Boot 4.1.1, Java 26,
  `spring-boot-starter-webmvc`, jeden pusty test. Brak kodu domenowego i brak
  historii commitów — dlatego ta sesja została poprowadzona jako greenfield.
  Krok wyboru stosu powinien potraktować ten szkielet jako sygnał preferencji
  użytkownika, a nie jako wiążącą decyzję.
- NFR "dane budżetowe nie opuszczają produktu bez wyraźnej zgody" staje się
  wiążący dopiero przy v2, gdy analiza wspomagana modelem językowym zacznie
  przekazywać kwoty i notatki poza produkt. Wybór dostawcy modelu i sposób
  uzyskania zgody to decyzje tamtego etapu.

## Forward: technical-roadmap

- **v2 — analiza wspomagana modelem językowym za wybrany okres.** Odsunięta z v1
  w Fazie 3. Sokrates przy pytaniu o stukrotną skalę wskazał, że to właśnie jej
  koszt pierwszy przestaje się domykać przy dużej liczbie użytkowników: analiza
  na żądanie za dowolny okres jest tania dla garstki osób i kosztowna dla tysięcy,
  więc przy skali wymaga limitowania albo rozliczania.
- **v2 — flaga dopuszczalnego debetu na kategorii**, jeśli prawdziwe użycie pokaże,
  że ostrzeżenie nie wystarcza.
- **v2 — przesunięcie kwoty między pulami jako osobna operacja.** Kształt
  rozstrzygnięty w tej sesji: pula źródłowa, pula docelowa, kwota. Dowolna kategoria
  po obu stronach — dla narastającej dotyka jej sumy, dla przepływowej puli
  bieżącego miesiąca, dokładnie tak jak wydatek. Kwota ograniczona saldem puli
  źródłowej: przesunięcie NIE schodzi poniżej zera, w odróżnieniu od wydatku, bo
  wydatek poniżej zera opisuje coś, co się wydarzyło, a przenoszenie nieistniejących
  pieniędzy nie opisuje niczego. Kontrargument z rundy Sokratesa przyjęty: trzecia
  operacja obok wpływu i wydatku jest za droga na trzytygodniowe v1.
- **v2 — rytuał zamknięcia roku** plus flaga [rozliczana rocznie] na kategorii.
  Ekran przechodzi po pulach z niezerowym saldem i dla każdej pyta: zostawiam,
  przekazuję gdzie indziej, dzielę. Domyślną opcją musi pozostać przeniesienie —
  kontrprzykład z listopada i grudnia zbierających na przyszły rok obowiązuje dalej,
  więc zerowanie zawsze wymaga świadomego kliknięcia.

## Quality cross-check

Przeprowadzony 2026-09-19. Wynik: **accepted** — brak luk.

| Element | Stan |
| --- | --- |
| Access Control | obecne — e-mail + hasło, płaski model, otwarta rejestracja |
| Business Logic | obecne — reguła w jednym zdaniu + 10 reguł szczegółowych |
| Project artifacts | obecne — shape-notes.md z poprawnym checkpointem |
| Timeline-cost ack | obecne — mvp_weeks: 3, zakres zawężony świadomie w Fazie 3 |
| Non-Goals | obecne — 8 pozycji, w tym jedno odcięcie trwałe |
| Preserved behavior | nie dotyczy (greenfield) |

Brak pozycji do przeniesienia do `## Open Questions` z tytułu bramki jakości.
Wpisy, które tam są, pochodzą z rundy Sokratesa, z wyboru nazwy i z odsunięcia
przesunięcia między pulami do v2 — żaden nie blokuje v1.

Druga runda, 2026-09-19, po sesji o latach i przesunięciach między pulami. Wynik:
**accepted** — brak luk. Zmiany objęły FR-010 (rok w tożsamości miesiąca), Business
Logic (domknięcie reguły rocznej plus dwie nowe reguły), Non-Goals (dwie nowe
pozycje) i Open Questions (jedna nowa). Żaden z sześciu elementów bramki nie stracił
pokrycia. Liczba FR-ów v1 pozostaje 17 — przesunięcie nie weszło do zakresu v1, więc
nie dostało numeru w liście wymagań.
