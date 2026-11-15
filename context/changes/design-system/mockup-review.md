# Mockup review: auth screens and shell

> Source: Figma file `QMx4nvFcQC9mpTjJCWPwuS` (copy of "Spartan UI for Figma: a 1:1 design kit of Spartan NG"), page **1. auth** (`2003:316`).
> Read once via Framelink MCP (`get_figma_data` on the page node) on 2026-11-15. Re-read only if a frame changes.
> Base URL: `https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=<id>`

## Frames

| Screen | Route | Desktop (1440×900) | Mobile (390×844) |
| --- | --- | --- | --- |
| Logowanie | `/login` | [Logowanie · desktop /login](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-45) | [Logowanie · mobile /login](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-51) |
| Rejestracja | `/register` | [Rejestracja · desktop /register](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-47) | [Rejestracja · mobile /register](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-53) |
| Shell + home | `/` | [Home · desktop /](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-49) | [Home · mobile /](https://www.figma.com/design/QMx4nvFcQC9mpTjJCWPwuS/?node-id=2017-55) |

## Tokens seen in the frames

| Kit value | spartan `neutral` token | Used for |
| --- | --- | --- |
| `#FFFFFF` | `--background`, `--card` | page, card, header |
| `#0A0A0A` | `--foreground` / `--card-foreground` (`oklch(0.145 0 0)`) | brand, headings, labels |
| `#171717` | `--primary` (`oklch(0.205 0 0)`) | primary button, link text |
| `#FAFAFA` | `--primary-foreground` (`oklch(0.985 0 0)`) | primary button label |
| `#737373` | `--muted-foreground` (`oklch(0.556 0 0)`) | password hint, e-mail in header, home paragraph |
| `#E5E5E5` | `--border` / `--input` (`oklch(0.922 0 0)`) | input border, outline button, separator |
| card stroke `rgba(10,10,10,0.1)` | card ring from helm `card` (nova) | card outline |

Radius: inputs/buttons 10px = `--radius` (`0.625rem`); card 14px = helm card's `rounded-xl`. Font in the kit: Geist (see discrepancy 3). Type scale: brand `text-xl font-semibold` (desktop/auth) / `text-base font-semibold` (mobile header); card heading `text-2xl font-semibold`; home heading `text-3xl` desktop / `text-2xl` mobile, `font-semibold`; body `text-sm`/`text-base`.

## Login `/login` (2017-45, 2017-51)

Layout: full-height page, content centred horizontally and vertically. A column of width 400px (desktop) / 358px (mobile, 16px side margins on 390), gap 24px:
1. Brand "PennyPlan": `text-xl font-semibold`, centred, **above the card** (outside it).
2. Card (`hlmCard`, no header, no footer; content padding 16px):
   - Heading "Zaloguj się": `text-2xl font-semibold`, left-aligned.
   - Field group (`hlmFieldGroup`), gap 20px:
     - Field "E-mail": `hlmLabel` + `hlmInput` (height 32px), no description.
     - Field "Hasło": `hlmLabel` + `hlmInput`, no description.
   - Gap 24px between heading, fields and button.
   - Primary button "Zaloguj się" (`hlmBtn`, variant default, size default, height 32px), full width.
3. Link button "Nie masz konta? Załóż konto" (`hlmBtn variant="link"`), full width, centred, **below the card**.

Mobile is identical, with column width 358px.

## Register `/register` (2017-47, 2017-53)

Same structure as login, with:
- Heading "Załóż konto".
- Field "E-mail".
- Field "Hasło" with a description "Co najmniej 8 znaków" (`hlmFieldDescription`, `text-sm text-muted-foreground`).
- Primary button "Załóż konto".
- Link button "Masz już konto? Zaloguj się" below the card.

## Shell + home `/` (2017-49, 2017-55)

- Header, full width, white background:
  - Row of content width 1200px (desktop, centred) / full 390px with 16px padding (mobile); vertical padding 16px; gap 24px desktop / 12px mobile; items centred vertically:
    - Brand "PennyPlan": `text-xl font-semibold` desktop / `text-base font-semibold` mobile.
    - E-mail: `text-sm text-muted-foreground`, fills the remaining space, right-aligned (mobile sample: a long address, so it must truncate with an ellipsis).
    - Button "Wyloguj": `hlmBtn variant="outline"`, height 32px.
  - `hlmSeparator` (horizontal, 1px, `--border`) below the row.
- Content: centred column, width 1200px desktop / 358px mobile, padding-top 40px desktop / 32px mobile, gap 8px:
  - "Witaj w PennyPlan": `text-3xl font-semibold` desktop / `text-2xl font-semibold` mobile.
  - "Tu wkrótce pojawi się Twój budżet.": `text-base text-muted-foreground`.

Width 1200px maps to a Tailwind scale class (e.g. `max-w-7xl` = 1280px with horizontal padding, or `max-w-6xl` = 1152px). Pick the closest scale class; no arbitrary value.

## Components

| Kit component | Helm | Where |
| --- | --- | --- |
| Card | `card` | login, register |
| Field, Field Group | `field` (+ `label`) | login, register |
| Input | `input` | login, register |
| Button default / outline / link | `button` | submit, logout, account links |
| Separator | `separator` | shell header |
| — (undrawn state) | `alert` | server error on login/register |
| — (undrawn state) | `spinner` | pending submit |

## States without a mockup ("bez makiety")

Built from kitchen-sink components, not an error: server error alert (destructive `hlmAlert`, placed at the top of the card content, `role="alert"`), field error (`<hlm-field-error>` below the input), pending submit (`<hlm-spinner />` + "Logowanie…" / "Zakładanie konta…", disabled), disabled submit while the form is invalid, focus-visible on every control.

## Discrepancies and decisions (2026-11-15)

1. **Frame widths 1440/390 vs plan 1280/375.** Decision: adopt 1440 and 390; the plan was corrected.
2. **Kit theme `neutral` vs code theme `stone`.** Decision: code switches to `neutral` (`init --theme=neutral`); the plan was corrected.
3. **Font Geist (kit) vs system stack (spartan `--font-sans`).** Decision: keep the system font stack; accepted difference, Geist is not added.
4. **`separator` beyond the planned components.** Decision: add `separator`.
5. **Sample value `hello@spartan.ng` in both inputs (kit leftover).** Decision: inputs are empty, with no placeholder.
6. **Layout differs from the code** (brand above the card instead of inside it; the whole "Nie masz konta? Załóż konto" sentence is a link instead of just "Załóż konto"). Decision: follow the mockup.
