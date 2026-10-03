---
change_id: account-signup-and-login
title: Sign up, log in and long session with per-account data isolation
status: implementing
created: 2026-10-02
updated: 2026-10-02
archived_at: null
---

## Notes

Roadmap S-01 (`context/foundation/roadmap.md`), PRD refs: FR-001, FR-002. Prerequisites: none. Status in roadmap: ready.

Outcome: Użytkownik może założyć konto e-mailem i hasłem, zalogować się, wylogować i wrócić po miesiącu bez ponownego logowania; niezalogowane wejście na trasę z danymi przekierowuje do logowania, a żadne konto nie widzi danych innego (PRD: NFR długiej sesji, Access Control, guardrail izolacji).

Risk: Pierwszy plaster ustala wzorzec „każdy odczyt i zapis jest zawężony do właściciela”, na którym opiera się guardrail izolacji kont; zrobiony źle, przecieka do każdego kolejnego plastra.

Unknown (non-blocking, owner: user): jak wygląda pierwsza sesja po rejestracji (PRD Open Question 1).
