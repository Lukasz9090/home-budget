---
change_id: design-system
topic: Dokumentacja spartan.ng (referencja do planu i implementacji)
date: 2026-11-13
source: Context7 MCP — /websites/spartan_ng, /spartan-ng/spartan, /tailwindlabs/tailwindcss.com
---

# spartan.ng — dokumentacja referencyjna

Wyciąg z oficjalnej dokumentacji (spartan.ng/documentation) i z repozytorium
(`skills/spartan/**`, `apps/app/**`). Uzupełnia `research.md` o konkretne API i przykłady.
Kod w przykładach jest dosłowny ze źródeł; uwagi „U nas” dotyczą tego repo.

## 1. Instalacja (Angular CLI)

### 1.1 Tailwind CSS v4 (wymagany)

Spartan wymaga Tailwind v4. Instalacja wg framework guide Tailwinda dla Angulara
(`--force`, bo Angular ma peer dependency na Tailwind v3):

```bash
npm install tailwindcss @tailwindcss/postcss postcss --force
```

`frontend/.postcssrc.json`:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

U nas: `styles.scss` → `styles.css` (Tailwind v4 nie wspiera Sass), w `angular.json` zmienić
`styles`, `inlineStyleLanguage` i `schematics.@schematics/angular:component.style` na `css`.

### 1.2 `src/styles.css`

Warstwy (potrzebne, żeby style `ng-icons` ładowały się poprawnie) + preset spartana:

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "@spartan-ng/brain/hlm-tailwind-preset.css";
```

Preset zawiera już `tw-animate-css` i `@angular/cdk/overlay-prebuilt.css` — nie importować ich osobno.

### 1.3 CLI

```bash
npm i -D @spartan-ng/cli
ng g @spartan-ng/cli:init                  # wybór stylu (zapis do components.json), zależności
ng g @spartan-ng/cli:ui-theme              # app, entry stylów, motyw, radius — raz na projekt
ng g @spartan-ng/cli:ui button             # dodanie komponentu (bez nazwy: lista; `all`)
ng g @spartan-ng/cli:info --json           # zainstalowane komponenty, ścieżki, wersje
ng g @spartan-ng/cli:healthcheck           # skan przestarzałych wzorców; --autoFix naprawia
```

### 1.4 `components.json` (root projektu, tworzony przy pierwszym `ui`)

Wariant Angular CLI (bez flag Nx):

```json
{
  "componentsPath": "libs/ui",
  "importAlias": "@spartan-ng/helm",
  "style": "nova" | "vega" | "lyra" | "maia" | "mira" | "luma"
}
```

- `componentsPath` — gdzie CLI kopiuje pliki helm (decyzja do planu: np. `src/app/shared/ui`).
- `importAlias` — alias w `tsconfig` (`@spartan-ng/helm/<komponent>`).
- `style` — wygląd komponentów. Po zmianie stylu trzeba wygenerować komponent ponownie
  (`ng g @spartan-ng/cli:ui button`). Styl musi zgadzać się z wybranym w kicie Figma.

## 2. Brain vs Helm

- **Helm domyślnie.** Stylowany komponent; np. `HlmDialogImports` już komponuje brain dialog.
- **Brain bezpośrednio** tylko przy w pełni własnym stylu (zachowanie + a11y bez wyglądu spartana):
  `@spartan-ng/brain/<name>`.
- **Nigdy nie edytować brain** (to zależność npm). Dostosowania: edycja skopiowanych plików helm
  albo zmiennych motywu.
- Każdy komponent eksportuje barrel `*Imports` (np. `HlmCardImports`) + pojedyncze klasy.
  Entrypoint = nazwa komponentu w kebab-case (`@spartan-ng/helm/alert-dialog`,
  `@spartan-ng/brain/toggle-group`).

```ts
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

@Component({
  imports: [HlmDialogImports],
})
```

## 3. Theming

### 3.1 Zmienne (domyślny motyw Neutral)

Definiowane w `:root` (jasny) i `.dark` (ciemny). Format OKLCH bez przecinków:
`oklch(0.5 0.2 180)`, nie `oklch(0.5, 0.2, 180)`.

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.985 0 0);
  --sidebar-primary-foreground: oklch(0.205 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

Inne kolory bazowe (np. Zinc) mają te same nazwy zmiennych, inne wartości — generuje je `ui-theme`.

### 3.2 Własne kolory semantyczne

Zmienna w `:root`/`.dark` + rejestracja w Tailwindzie przez `@theme inline`:

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

```html
<div class="bg-warning text-warning-foreground">Warning message</div>
```

U nas: kandydaci na własne tokeny w budżecie kopertowym — np. `--success` (koperta na plusie),
`--warning` (blisko limitu); `--destructive` już jest (przekroczenie).

### 3.3 Dark mode

Klasa `dark` na `<html>` przełącza wszystkie zmienne. Komponenty nie wymagają zmian.

## 4. Zasady stylowania (z oficjalnego skilla spartana)

- **Tylko tokeny semantyczne**, nigdy surowa paleta Tailwinda na komponentach:

  ```html
  <!-- Good -->
  <div class="bg-card text-card-foreground border-border border">...</div>
  <div class="bg-primary text-primary-foreground">...</div>
  <!-- Bad -->
  <div class="border-gray-200 bg-white text-black">...</div>
  ```

  Pary: `background/foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`,
  `destructive` (+ `-foreground`), samodzielne `border`, `input`, `ring`, rodzina `sidebar*`.
- **Warianty zamiast klas**: `variant` i `size` na komponentach.
  - Button variants: `default | destructive | outline | secondary | ghost | link`
  - Button sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`
- **Layout**: `gap-*`, nie `space-*`; `size-*` gdy szerokość = wysokość.
- **Łączenie klas w TS**: `hlm()` z `@spartan-ng/helm/utils` (clsx + tailwind-merge), nie konkatenacja.

  ```ts
  import { hlm } from '@spartan-ng/helm/utils';
  const cls = hlm('rounded-md border px-3 py-2', active() && 'bg-accent', userClass());
  ```

- **Własny komponent w stylu hlm** — preferowane `classes()` w konstruktorze (merge klas
  konsumenta automatycznie):

  ```ts
  import { Component } from '@angular/core';
  import { classes } from '@spartan-ng/helm/utils';

  @Component({ selector: 'app-badge', template: '<ng-content />' })
  export class AppBadge {
    constructor() {
      classes(() => 'inline-flex items-center rounded-md border px-2 py-0.5');
    }
  }
  ```

  Alternatywa: input `class` (alias) + `computed(() => hlm(base, this.userClass()))` bindowany
  na `host: { '[class]': ... }`.

## 5. Formularze (`field`, `input`, `label`)

Każdą kontrolkę owijamy w `hlmField` (label, slot kontrolki, opis, błąd, stan walidacji).
`orientation="vertical | horizontal | responsive"`. Błędy tylko przez `<hlm-field-error>`,
pokazywane gdy kontrolka jest invalid i touched/dirty.

### 5.1 Reactive Forms — **u nas** (`login.ts`, `register.ts` używają `NonNullableFormBuilder`)

```html
<div hlmField>
  <label hlmFieldLabel for="email">Email</label>
  <input hlmInput id="email" [formControl]="email" />
  <p hlmFieldDescription>We'll never share your email.</p>
  @if (email.invalid && email.touched) {
  <hlm-field-error>Enter a valid email address.</hlm-field-error>
  }
</div>
```

### 5.2 Signal Forms (alternatywa)

```ts
import { form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';

protected readonly model = signal({ email: '' });
readonly emailForm = form(this.model, (path) => {
  required(path.email, { message: 'Enter your email.' });
  minLength(path.email, 5, { message: 'That email looks too short.' });
});
```

```html
<form [formRoot]="emailForm">
  <div hlmField>
    <label hlmFieldLabel for="email">Email</label>
    <input hlmInput id="email" [formField]="emailForm.email" />
    @for (error of emailForm.email().errors(); track error) {
    <hlm-field-error [validator]="error.kind">{{ error.message }}</hlm-field-error>
    }
  </div>
</form>
```

### 5.3 Grupy checkboxów/radio

```html
<fieldset hlmFieldSet>
  <legend hlmFieldLegend>Notifications</legend>
  <div hlmFieldGroup>
    <div hlmField orientation="horizontal">
      <hlm-checkbox id="email-opt" />
      <label hlmFieldLabel for="email-opt">Email</label>
    </div>
    <div hlmField orientation="horizontal">
      <hlm-checkbox id="sms-opt" />
      <label hlmFieldLabel for="sms-opt">SMS</label>
    </div>
  </div>
</fieldset>
```

**Pułapka (Chrome):** `HlmFieldError` wewnątrz `fieldset` zwija checkboxy/radio do zera przy
przełączaniu błędu (container queries + `:has()`). Renderować błąd jako **rodzeństwo** `fieldset`.

## 6. Komponenty — przykłady

### 6.1 Card + Button + Input + Label (wzorzec ekranu logowania)

```ts
import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'spartan-card-preview',
  imports: [HlmCardImports, HlmLabelImports, HlmInputImports, HlmButtonImports],
  template: `
    <hlm-card class="w-full max-w-sm">
      <hlm-card-header>
        <h3 hlmCardTitle>Login to your account</h3>
        <p hlmCardDescription>Enter your email below to login to your account</p>
        <div hlmCardAction>
          <button hlmBtn variant="link">Sign Up</button>
        </div>
      </hlm-card-header>

      <div hlmCardContent>
        <form id="login-form">
          <div class="flex flex-col gap-6">
            <div class="grid gap-2">
              <label hlmLabel for="email">Email</label>
              <input type="email" id="email" placeholder="m@example.com" required hlmInput />
            </div>
            <div class="grid gap-2">
              <label hlmLabel for="password">Password</label>
              <input type="password" id="password" hlmInput />
            </div>
          </div>
        </form>
      </div>

      <hlm-card-footer class="flex-col gap-2">
        <button hlmBtn type="submit" class="w-full" form="login-form">Login</button>
        <button hlmBtn variant="outline" class="w-full">Login with Google</button>
      </hlm-card-footer>
    </hlm-card>
  `,
})
export class CardPreview {}
```

Szkielet karty: `hlm-card` → `hlm-card-header` (`hlmCardTitle`, `hlmCardDescription`,
`hlmCardAction`) → `hlmCardContent` → `hlm-card-footer`. Działa też wersja atrybutowa
(`<section hlmCard>`, `<div hlmCardHeader>`, …).

### 6.2 Button: ikona i stan ładowania

`hlmBtn` **nie ma** inputu `isLoading` — komponujemy spinner i `disabled`:

```html
<button hlmBtn variant="destructive" size="lg">Delete</button>

<button hlmBtn size="icon" variant="ghost">
  <ng-icon name="lucideTrash" />
</button>

<button hlmBtn [disabled]="saving()">
  @if (saving()) {
  <hlm-spinner />
  } Save
</button>
```

### 6.3 Ikony (`@ng-icons`, lucide)

Nazwy ikon nie są globalne — każdą trzeba zarejestrować przez `provideIcons` (inaczej się nie
wyrenderuje):

```ts
import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-example',
  imports: [NgIcon],
  providers: [provideIcons({ lucideChevronRight })],
  template: `<ng-icon name="lucideChevronRight" />`,
})
export class ExampleComponent {}
```

Rozmiar ikony dziedziczy `font-size` rodzica; ręcznie: `text-[length:--spacing(5)]`.

### 6.4 Dialog

Tytuł obowiązkowy (a11y); jeśli ma być niewidoczny — `sr-only`.

```html
<hlm-dialog>
  <button hlmDialogTrigger hlmBtn>Edit profile</button>
  <hlm-dialog-content *hlmDialogPortal class="sm:max-w-[425px]">
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Edit profile</h3>
      <p hlmDialogDescription>Make changes to your profile here.</p>
    </hlm-dialog-header>
    <div class="py-4">
      <input hlmInput placeholder="Name" />
    </div>
    <hlm-dialog-footer>
      <button hlmBtn hlmDialogClose>Save changes</button>
    </hlm-dialog-footer>
  </hlm-dialog-content>
</hlm-dialog>
```

### 6.5 Toasty (sonner)

`<hlm-toaster />` raz (np. w root/shell), potem `toast()` z `@spartan-ng/brain/sonner`
(nie bezpośrednio z `ngx-sonner`). Są też `toast.success`, `toast.error`.

```ts
import { toast } from '@spartan-ng/brain/sonner';

toast('Event has been created', {
  description: 'Sunday, December 03, 2023 at 9:00 AM',
  action: { label: 'Undo', onClick: () => console.log('Undo') },
});
```

### 6.6 Select

`<hlm-select>` / `[hlmSelect]` przekazuje z `BrnSelect` inputy `disabled`, `value`,
`isItemEqualToValue`, `itemToString` i output `valueChange` (dwukierunkowe `value`).

### 6.7 Data Table

Oparta o TanStack Table (`ColumnDef`, `*flexRender`), stary `brn-column-def` jest przestarzały:

```html
<tbody hlmTBody>
  @for (row of _table.getRowModel().rows; track row.id) {
  <tr hlmTr [attr.data-state]="row.getIsSelected() && 'selected'">
    @for (cell of row.getVisibleCells(); track $index) {
    <td hlmTd>
      <ng-container *flexRender="cell.column.columnDef.cell; props: cell.getContext(); let cell">
        <div [innerHTML]="cell"></div>
      </ng-container>
    </td>
    }
  </tr>
  } @empty {
  <tr hlmTr>
    <td hlmTd class="h-24 text-center" [attr.colspan]="_columns.length">No results.</td>
  </tr>
  }
</tbody>
```

## 7. Mapa: potrzeba → komponent

| Potrzeba | Komponent(y) |
| --- | --- |
| Akcja / przycisk | `button` (`hlmBtn`), `button-group` |
| Pole tekst/liczba | `input`, `textarea`, `input-otp`, `input-group`, `native-select` |
| Wybór | `select`, `combobox`, `autocomplete`, `radio-group`, `checkbox`, `switch`, `slider` |
| Przełącznik 2–7 opcji | `toggle-group` |
| Układ formularza / walidacja | `field`, `label` |
| Prezentacja danych | `chart`, `table`, `card`, `badge`, `avatar`, `kbd`, `item` |
| Nawigacja | `sidebar`, `navigation-menu`, `breadcrumb`, `tabs`, `pagination` |
| Nakładki | `dialog`, `sheet`, `alert-dialog`, `popover`, `hover-card`, `tooltip` |
| Menu | `dropdown-menu`, `context-menu`, `menubar`, `command` |
| Feedback | `sonner` (toasty), `alert`, `progress`, `skeleton`, `spinner` |
| Kontenery | `card`, `separator`, `resizable`, `scroll-area`, `accordion`, `collapsible`, `aspect-ratio` |
| Pusty stan | `empty` |
| Daty | `calendar`, `date-picker` |
| Ikony | `icon` (`@ng-icons`) |
| Typografia | `typography` |

Zamiast własnego markupu: komunikaty → `hlmAlert` (`hlmAlertTitle`/`hlmAlertDescription`),
pusty stan → `hlm-empty` (`hlmEmptyMedia`/`hlmEmptyTitle`/`hlmEmptyDescription`),
separator → `hlm-separator` (nie `<hr>`), ładowanie → `hlmSkeleton` / `hlm-spinner`,
statusy → `hlmBadge`.

## 8. Wsparcie dla agentów AI

Serwer MCP spartana (wyszukiwanie komponentów/API, alternatywa dla Context7):

```json
{
  "mcpServers": {
    "spartan-ui": { "command": "npx", "args": ["-y", "@spartan-ng/mcp"] }
  }
}
```

Oficjalny skill z regułami (te same, co w sekcjach 4–7): `npx skills add spartan-ng/spartan`.

## Źródła

- https://spartan.ng/documentation/installation
- https://spartan.ng/documentation/cli
- https://spartan.ng/documentation/components-json
- https://spartan.ng/documentation/styles
- https://spartan.ng/documentation/theming
- https://spartan.ng/documentation/dark-mode
- https://github.com/spartan-ng/spartan/tree/main/skills/spartan (SKILL.md, rules/forms.md,
  rules/styling.md, rules/composition.md, rules/icons.md, rules/brain-vs-helm.md, mcp.md, registry.md)
- https://github.com/spartan-ng/spartan/blob/main/apps/app/src/app/pages/(components)/components/(card)/card.preview.ts
- https://github.com/spartan-ng/spartan/blob/main/libs/helm/select/src/lib/hlm-select.ts
- https://github.com/spartan-ng/spartan/blob/main/libs/helm/table/Migration.md
- Tailwind v4 + Angular: https://tailwindcss.com/docs/installation/framework-guides/angular
