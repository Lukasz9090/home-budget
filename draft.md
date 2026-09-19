## APP PLAN
Aplikacja do zarządzania domowym budżetem, która pozwala na definiowanie dochodów i ich procentowego podziału na różne kateforie wydatków. 
Aplikacja z podziałem na miesiące, w każdym miesiącu możliwość dodania dochodów i ustalenia procentowego podziału na kategorie (definowane przez użytkownika). 

Czyli np:
typ dochodu: 
1. pensja, 
kwota: 15000 zł, 
podział: 
-życie i rachunki 45%, 
-oszczędnościowe - wakacje i wyjazdy 10%,
-oszczędnościowe długoterminowe 20%, 
-oszczeędnościowe - opłacenie ubezpieczenia 5% , 
-inwestycje - obligacje 10%, 
-inwestycje - etf 5%, 
-inwestycje - kryto 5%.
2. premia: 50000 zł
-oszczędnościowe - wakacje i wyjazdy 20%,
-oszczędnościowe długoterminowe 25%,
-inwestycje - obligacje 20%,
-inwestycje - etf 20%, 
-inwestycje - kryto 15%.
-do przewalenia 
3. 800+
- obligacje rodzinne 100%

Dla procentów zostanie obliczona sugerowana kwota, a użytkownik może ją zmienić.
W każdym miesiącu znajduje się również pole tekstowe do wprowadzenia podsumowania miesiąca lub jakichkolwiek notatek. 
Wszystko zapisywane jest w bazie danych.

Dodatkowo kategorie można sumować za jakiś okres czasu - jak np osczedności na oszczędnościowym oraz oszczędności na wakacje ląduja na tym samym koncie oszczednościowym. 
Wiec po prawej strnie moge miec jakies info ze teraz na wakacje zebrano kwote X. Na opłaty zwiazane z samochodem kwotę Y. 
I jak mam jakiś wyjazd to sobie moge zaznaczyć ze w tym miesiacu wydatek wyjazd - odejmuje z zebranej kwoty na wakacje.

Dodatkowo chciałbym mieć sekcje z podziałem jak obecnie wyglądają moje zasoby finansowe - czyli ile mam w gotówce, ile na koncie oszczędnościowym, ile w obligacjach, ile w etf, ile w kryptowalutach - w roznych walutach oraz w przeliczneniu na pln po kursie z nbp.
Dodatkowo chciałbym mieć sekcję w której mogę zapisać ile komuś pożyczyłem albo ile ktoś mi pożyczył - czyli sekcja pożyczki (nie kredyty).

Zakłądamy również ze w tym podziale jak wpisałęm kwote w tabelce tzn ze to odłożyłęm na ta kategorie. jeśl np rprzuchodzi kolejny miejsac moge soebie wpisac jako dochod pozostałosc z poprzedniego miesiaca. np nie wydałem całośći 55% to zostało mi jakas ktowa i tez moge ja przeznaczyc na jakas kategorie.

MVP:
-zakłądanie konta użytkownika
-logowanie i wylogowywanie
-dodawanie dochodów i ich procentowy podział na kategorie
-dodawanie wydatków i odejmowanie ich od odpowiednich kategorii
-podsumowanie miesięczne z możliwością dodania notatek
-analiza lmm za jakis okres czasu

