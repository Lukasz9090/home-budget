import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmItemImports } from '@spartan-ng/helm/item';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
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
    RouterLink,
    HlmAlertImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmItemImports,
    HlmLabelImports,
    HlmRadioGroupImports,
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
        <div class="flex flex-wrap items-center gap-2">
          <span hlmBadge variant="secondary">Przepływowa</span>
          <span hlmBadge variant="outline">Narastająca</span>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <fieldset hlmFieldSet>
            <legend hlmFieldLegend variant="label">Typ</legend>
            <hlm-radio-group [formControl]="kindControl">
              <div hlmField orientation="horizontal">
                <hlm-radio
                  value="FLOW"
                  inputId="ks-default-flow"
                  aria-describedby="ks-default-flow-hint"
                >
                  <hlm-radio-indicator indicator />
                </hlm-radio>
                <div hlmFieldContent>
                  <label hlmFieldLabel for="ks-default-flow">Przepływowa</label>
                  <p hlmFieldDescription id="ks-default-flow-hint">
                    Na bieżący miesiąc. Co niewydane, nie przechodzi dalej.
                  </p>
                </div>
              </div>
              <div hlmField orientation="horizontal">
                <hlm-radio
                  value="ACCUMULATING"
                  inputId="ks-default-accumulating"
                  aria-describedby="ks-default-accumulating-hint"
                >
                  <hlm-radio-indicator indicator />
                </hlm-radio>
                <div hlmFieldContent>
                  <label hlmFieldLabel for="ks-default-accumulating">Narastająca</label>
                  <p hlmFieldDescription id="ks-default-accumulating-hint">
                    Zbiera się z miesiąca na miesiąc, aż ją wydasz.
                  </p>
                </div>
              </div>
            </hlm-radio-group>
          </fieldset>
          <div hlmItemGroup>
            <div hlmItem size="xs">
              <div hlmItemContent>
                <span hlmItemTitle>Jedzenie na mieście</span>
              </div>
              <div hlmItemActions>
                <span hlmBadge variant="secondary">Przepływowa</span>
              </div>
            </div>
            <hlm-item-separator />
            <div hlmItem size="xs">
              <div hlmItemContent>
                <span hlmItemTitle>Wakacje</span>
              </div>
              <div hlmItemActions>
                <span hlmBadge variant="outline">Narastająca</span>
              </div>
            </div>
          </div>
        </div>
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
        <fieldset hlmFieldSet class="md:max-w-sm">
          <legend hlmFieldLegend variant="label">Radio (strzałki zmieniają wybór)</legend>
          <hlm-radio-group [formControl]="focusKindControl">
            <div hlmField orientation="horizontal">
              <hlm-radio value="FLOW" inputId="ks-focus-flow">
                <hlm-radio-indicator indicator />
              </hlm-radio>
              <label hlmFieldLabel for="ks-focus-flow">Przepływowa</label>
            </div>
            <div hlmField orientation="horizontal">
              <hlm-radio value="ACCUMULATING" inputId="ks-focus-accumulating">
                <hlm-radio-indicator indicator />
              </hlm-radio>
              <label hlmFieldLabel for="ks-focus-accumulating">Narastająca</label>
            </div>
          </hlm-radio-group>
        </fieldset>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="ks-disabled">
        <h2 id="ks-disabled" class="text-lg font-semibold">disabled</h2>
        <div class="flex flex-wrap items-end gap-4">
          <button hlmBtn type="button" disabled>Wyłączony</button>
          <div hlmField class="md:max-w-sm">
            <label hlmLabel for="ks-disabled-input">Pole wyłączone</label>
            <input hlmInput id="ks-disabled-input" type="text" disabled />
          </div>
          <fieldset hlmFieldSet class="md:max-w-sm">
            <legend hlmFieldLegend variant="label">Radio z wyłączoną opcją</legend>
            <hlm-radio-group [formControl]="disabledKindControl">
              <div hlmField orientation="horizontal">
                <hlm-radio value="FLOW" inputId="ks-disabled-flow">
                  <hlm-radio-indicator indicator />
                </hlm-radio>
                <label hlmFieldLabel for="ks-disabled-flow">Przepływowa</label>
              </div>
              <div hlmField orientation="horizontal">
                <hlm-radio value="ACCUMULATING" inputId="ks-disabled-accumulating" disabled>
                  <hlm-radio-indicator indicator />
                </hlm-radio>
                <label hlmFieldLabel for="ks-disabled-accumulating">Narastająca</label>
              </div>
            </hlm-radio-group>
          </fieldset>
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
          Pusty stan S-02 to Card według makiety (nie komponent <code>empty</code>) — zobacz
          <a hlmBtn variant="link" class="h-auto p-0" routerLink="/categories">/categories</a>.
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
  protected readonly kindControl = new FormControl('FLOW', { nonNullable: true });
  protected readonly focusKindControl = new FormControl('FLOW', { nonNullable: true });
  protected readonly disabledKindControl = new FormControl('FLOW', { nonNullable: true });

  constructor() {
    this.invalidControl.markAsTouched();
    inject(DestroyRef).onDestroy(() => this.root.classList.remove('dark'));
  }

  protected toggleDark(): void {
    this.dark.update((value) => !value);
    this.root.classList.toggle('dark', this.dark());
  }
}
