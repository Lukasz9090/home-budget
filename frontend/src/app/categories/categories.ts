import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Injectable,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@spartan-ng/brain/forms';
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

import { authErrorMessage } from '../auth/auth-helpers';
import { Category, CategoriesService, CategoryKind } from './categories.service';

/** Mirrors the backend's name limit, counted on the trimmed value. */
const NAME_MAX_LENGTH = 40;

/** `required` on the trimmed value, so a name of only spaces counts as empty. */
const notBlank: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value.trim() ? null : { required: true };

/** `maxlength` on the trimmed value, so client and server agree on "40 characters". */
function trimmedMaxLength(max: number): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const actualLength = control.value.trim().length;
    return actualLength > max ? { maxlength: { requiredLength: max, actualLength } } : null;
  };
}

const collator = new Intl.Collator('pl');

/**
 * Shows field errors only after "Dodaj kategorię" was clicked, not on blur. With the default
 * (touched) matcher, clicking a radio blurs Nazwa, its error pops in above the radios and the
 * layout shift swallows the click.
 */
@Injectable()
class ShowOnSubmitErrorStateMatcher implements ErrorStateMatcher {
  readonly submitted = signal(false);

  isInvalid(control: AbstractControl | null): boolean {
    return !!control?.invalid && this.submitted();
  }
}

function byName(a: Category, b: Category): number {
  return collator.compare(a.name, b.name);
}

/** `/categories`: create a category and see the ones you have, grouped by kind. */
@Component({
  selector: 'app-categories',
  imports: [
    ReactiveFormsModule,
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
  providers: [
    ShowOnSubmitErrorStateMatcher,
    { provide: ErrorStateMatcher, useExisting: ShowOnSubmitErrorStateMatcher },
  ],
  templateUrl: './categories.html',
  host: { class: 'flex flex-col gap-8' },
})
export class Categories {
  private readonly service = inject(CategoriesService);
  private readonly errorState = inject(ShowOnSubmitErrorStateMatcher);
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [notBlank, trimmedMaxLength(NAME_MAX_LENGTH)]],
    kind: ['FLOW' as CategoryKind],
  });
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  /** `loading` until the first `GET` answers; `error` keeps the Alert even after a create. */
  protected readonly loadState = signal<'loading' | 'loaded' | 'error'>('loading');
  private readonly categories = signal<Category[]>([]);

  protected readonly flow = computed(() =>
    this.categories()
      .filter((category) => category.kind === 'FLOW')
      .sort(byName),
  );
  protected readonly cumulative = computed(() =>
    this.categories()
      .filter((category) => category.kind === 'CUMULATIVE')
      .sort(byName),
  );
  protected readonly empty = computed(() => this.categories().length === 0);

  constructor() {
    void this.load();
  }

  protected async submit(): Promise<void> {
    this.errorState.submitted.set(true);
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    const { name, kind } = this.form.getRawValue();
    try {
      const created = await this.service.create(name.trim(), kind);
      this.merge([created]);
      // Keeps the chosen kind: categories are usually added in runs of one kind.
      this.form.reset({ name: '', kind });
      this.errorState.submitted.set(false);
      this.nameInput().nativeElement.focus();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // Cleared by the next edit: the validators re-run on every value change.
        this.form.controls.name.setErrors({ taken: true });
        this.form.controls.name.markAsTouched();
      } else {
        this.error.set(authErrorMessage(error, {}));
      }
    } finally {
      this.pending.set(false);
    }
  }

  protected kindLabel(kind: CategoryKind): string {
    return kind === 'FLOW' ? 'Przepływowa' : 'Narastająca';
  }

  private async load(): Promise<void> {
    try {
      this.merge(await this.service.list());
      this.loadState.set('loaded');
    } catch {
      this.loadState.set('error');
    }
  }

  /** Adds or replaces by `id`; never drops what is already known (e.g. a create that won the race). */
  private merge(incoming: Category[]): void {
    this.categories.update((current) => {
      const byId = new Map(current.map((category) => [category.id, category]));
      for (const category of incoming) {
        byId.set(category.id, category);
      }
      return [...byId.values()];
    });
  }
}
