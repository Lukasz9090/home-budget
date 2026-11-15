# Rejestr makiet

Każdy ekran produktu ma tu makietę z Figmy, zanim powstanie lub zmieni wygląd. Ekranu, którego nie ma w tej tabeli, się nie buduje: agent zgłasza `BRAK MAKIETY: <ekran> (<trasa>)` i przerywa (reguła w `CLAUDE.md`, sekcja `## UI`).

Zasady:

- Ramki są budowane na kicie spartan dla Figmy (styl `nova`, motyw `neutral`), szerokości 1440px (desktop) i 390px (mobile).
- Link wskazuje jedną ramkę, czyli zawiera `node-id=`.
- Każdą ramkę czyta się przez Figma MCP raz, a odczyt odkłada w folderze zmiany (limity Figma API).
- Stany niewyrysowane (empty, error, loading, focus, disabled) powstają z komponentów kitchen sink i w planie są oznaczone jako „bez makiety”.
- Zwolnione: trasy `/dev/*` (narzędzia deweloperskie, nie ekrany produktu).

| Ekran | Trasa | Figma desktop (1440) | Figma mobile (390) | Uwagi |
| --- | --- | --- | --- | --- |
| Logowanie | `/login` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-45 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-51 | Odczyt: `context/changes/design-system/mockup-review.md` |
| Rejestracja | `/register` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-47 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-53 | Odczyt: `context/changes/design-system/mockup-review.md` |
| Shell + home | `/` | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-49 | https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-55 | Placeholder home to treść wewnątrz shella. Odczyt: `context/changes/design-system/mockup-review.md` |
