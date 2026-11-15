import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

/**
 * Dev-only kitchen sink (development build only, see dev-routes.development.ts): every state of
 * the helm components in use, in light and dark. The theme toggle is a dev preview, not the app
 * feature; leaving the page always restores light.
 */
@Component({
  selector: 'app-kitchen-sink',
  imports: [
    ReactiveFormsModule,
    HlmAlertImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSeparatorImports,
    HlmSpinnerImports,
  ],
  host: { class: 'block min-h-dvh bg-background text-foreground' },
  template: `
    <main class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <header class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold">Kitchen sink</h1>
        <button hlmBtn variant="outline" type="button" (click)="toggleDark()">
          {{ dark() ? 'Jasny' : 'Ciemny' }}
        </button>
      </header>

      <hlm-separator />

      <section class="flex flex-col gap-4" aria-labelledby="ks-default">
        <h2 id="ks-default" class="text-lg font-semibold">default</h2>
        <div class="flex flex-wrap items-center gap-2">
          <button hlmBtn type="button">Default</button>
          <button hlmBtn variant="outline" type="button">Outline</button>
          <button hlmBtn variant="secondary" type="button">Secondary</button>
          <button hlmBtn variant="ghost" type="button">Ghost</button>
          <button hlmBtn variant="destructive" type="button">Destructive</button>
          <button hlmBtn variant="link" type="button">Link</button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div hlmField>
            <label hlmLabel for="ks-default-input">E-mail</label>
            <input hlmInput id="ks-default-input" type="email" aria-describedby="ks-default-hint" />
            <p hlmFieldDescription id="ks-default-hint">Opis pola</p>
          </div>
          <section hlmCard>
            <div hlmCardContent class="flex flex-col gap-2">
              <h3 class="text-base font-semibold">Karta</h3>
              <p class="text-sm text-muted-foreground">Treść karty z tekstem pomocniczym.</p>
            </div>
          </section>
        </div>
        <p class="text-sm text-muted-foreground">Separator:</p>
        <hlm-separator />
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-interactive">
        <h2 id="ks-interactive" class="text-lg font-semibold">hover / focus-visible</h2>
        <p class="text-sm text-muted-foreground">
          Najedź kursorem na każdą kontrolkę, potem przejdź po nich klawiszem Tab — hover i ring
          fokusu muszą być widoczne.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <button hlmBtn type="button">Default</button>
          <button hlmBtn variant="outline" type="button">Outline</button>
          <button hlmBtn variant="secondary" type="button">Secondary</button>
          <button hlmBtn variant="ghost" type="button">Ghost</button>
          <button hlmBtn variant="destructive" type="button">Destructive</button>
          <button hlmBtn variant="link" type="button">Link</button>
        </div>
        <div hlmField class="md:max-w-sm">
          <label hlmLabel for="ks-focus-input">Pole</label>
          <input hlmInput id="ks-focus-input" type="text" />
        </div>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-disabled">
        <h2 id="ks-disabled" class="text-lg font-semibold">disabled</h2>
        <div class="flex flex-wrap items-end gap-4">
          <button hlmBtn type="button" disabled>Wyłączony</button>
          <div hlmField class="md:max-w-sm">
            <label hlmLabel for="ks-disabled-input">Pole wyłączone</label>
            <input hlmInput id="ks-disabled-input" type="text" disabled />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-error">
        <h2 id="ks-error" class="text-lg font-semibold">error</h2>
        <div hlmField class="md:max-w-sm">
          <label hlmLabel for="ks-error-input">E-mail</label>
          <input hlmInput id="ks-error-input" type="email" [formControl]="invalidControl" />
          <hlm-field-error id="ks-error-message">Podaj adres e-mail.</hlm-field-error>
        </div>
        <div hlmAlert variant="destructive">
          <p hlmAlertDescription>Nieprawidłowy e-mail lub hasło.</p>
        </div>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-loading">
        <h2 id="ks-loading" class="text-lg font-semibold">loading</h2>
        <div>
          <button hlmBtn type="button" disabled>
            <hlm-spinner aria-hidden="true" />
            Logowanie…
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-empty">
        <h2 id="ks-empty" class="text-lg font-semibold">empty</h2>
        <p class="text-sm text-muted-foreground">
          N/A: brak widoku z danymi w tej zmianie; S-02 dodaje komponent <code>empty</code>.
        </p>
      </section>
    </main>
  `,
})
export class KitchenSink {
  private readonly root = inject(DOCUMENT).documentElement;

  protected readonly dark = signal(false);
  protected readonly invalidControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  constructor() {
    this.invalidControl.markAsTouched();
    inject(DestroyRef).onDestroy(() => this.root.classList.remove('dark'));
  }

  protected toggleDark(): void {
    this.dark.update((value) => !value);
    this.root.classList.toggle('dark', this.dark());
  }
}
