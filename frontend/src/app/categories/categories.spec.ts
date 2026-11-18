import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categories } from './categories';
import { Category } from './categories.service';

describe('Categories', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<Categories>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Categories);
  });

  afterEach(() => http.verify());

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function query<T extends Element>(selector: string): T | null {
    return root().querySelector(selector) as T | null;
  }

  function text(): string {
    return root().textContent ?? '';
  }

  function listRequest(): TestRequest {
    return http.expectOne({ method: 'GET', url: '/api/categories' });
  }

  async function loadWith(categories: Category[]): Promise<void> {
    listRequest().flush(categories);
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(query('hlm-spinner[aria-label="Wczytywanie kategorii"]')).toBeNull();
    });
  }

  function type(value: string): void {
    const input = query<HTMLInputElement>('#category-name')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  async function submit(): Promise<void> {
    await fixture.whenStable();
    query<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }

  function createRequest(): TestRequest {
    return http.expectOne({ method: 'POST', url: '/api/categories' });
  }

  async function expectText(fragment: string): Promise<void> {
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(text()).toContain(fragment);
    });
  }

  function groupNames(titleId: string): string[] {
    const section = query(`section[aria-labelledby="${titleId}"]`);
    return Array.from(section?.querySelectorAll('[hlmItemTitle]') ?? []).map(
      (element) => element.textContent?.trim() ?? '',
    );
  }

  function nameError(): string {
    const error = query<HTMLElement>('#category-name-error')!;
    return error.hidden ? '' : (error.textContent?.trim() ?? '');
  }

  it('shows a spinner while loading and keeps the form usable', async () => {
    await fixture.whenStable();
    expect(query('hlm-spinner[aria-label="Wczytywanie kategorii"]')).not.toBeNull();
    expect(query<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    listRequest().flush([]);
  });

  it('shows the empty state with examples when there are no categories', async () => {
    await loadWith([]);
    expect(query('#categories-empty-title')?.textContent).toContain(
      'Nie masz jeszcze żadnej kategorii',
    );
    expect(text()).toContain('Jedzenie na mieście');
    expect(text()).toContain('Oszczędności');
    expect(text()).toContain('To tylko przykłady – nic nie tworzymy za Ciebie.');
    expect(query('#categories-flow-title')).toBeNull();
  });

  it('groups the list by kind and sorts names the Polish way', async () => {
    await loadWith([
      { id: '1', name: 'Łódź', kind: 'FLOW' },
      { id: '2', name: 'Wakacje', kind: 'CUMULATIVE' },
      { id: '3', name: 'Lody', kind: 'FLOW' },
      { id: '4', name: 'Jedzenie na mieście', kind: 'FLOW' },
      { id: '5', name: 'Dom', kind: 'FLOW' },
      { id: '6', name: 'Ćwiczenia', kind: 'FLOW' },
    ]);

    expect(query('#categories-empty-title')).toBeNull();
    expect(query('#categories-flow-title')?.textContent).toContain('Przepływowe · 5');
    expect(query('#categories-cumulative-title')?.textContent).toContain('Narastające · 1');
    // Code-point order would put "Ćwiczenia" after "Lody"; Polish collation puts it after C.
    expect(groupNames('categories-flow-title')).toEqual([
      'Ćwiczenia',
      'Dom',
      'Jedzenie na mieście',
      'Lody',
      'Łódź',
    ]);
    expect(groupNames('categories-cumulative-title')).toEqual(['Wakacje']);
  });

  it('hides a group with no categories', async () => {
    await loadWith([{ id: '1', name: 'Wakacje', kind: 'CUMULATIVE' }]);
    expect(query('#categories-flow-title')).toBeNull();
    expect(query('#categories-cumulative-title')?.textContent).toContain('Narastające · 1');
  });

  it('shows an Alert when the list fails to load', async () => {
    listRequest().flush(null, { status: 500, statusText: 'Server Error' });
    await expectText('Nie udało się wczytać kategorii. Odśwież stronę.');
    expect(query('#categories-empty-title')).toBeNull();
  });

  it('requires a name on submit without sending anything', async () => {
    await loadWith([]);
    await submit();
    http.expectNone({ method: 'POST', url: '/api/categories' });
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(nameError()).toBe('Podaj nazwę kategorii.');
    });
  });

  it('does not validate on blur, so choosing a type selects it without an error', async () => {
    await loadWith([]);
    const input = query<HTMLInputElement>('#category-name')!;
    input.focus();
    input.dispatchEvent(new Event('blur'));
    query<HTMLInputElement>('#category-kind-cumulative')!.click();
    await fixture.whenStable();

    expect(nameError()).toBe('');
    expect(query<HTMLInputElement>('#category-kind-cumulative')!.checked).toBe(true);
    expect(query<HTMLInputElement>('#category-kind-flow')!.checked).toBe(false);

    await submit();
    expect(nameError()).toBe('Podaj nazwę kategorii.');
  });

  it('trims the name and counts the 40-character limit on the trimmed value', async () => {
    await loadWith([]);

    type('a'.repeat(41));
    await fixture.whenStable();
    expect(nameError()).toBe('');

    await submit();
    expect(nameError()).toBe('Nazwa może mieć najwyżej 40 znaków.');

    type(`  ${'a'.repeat(40)}  `);
    await fixture.whenStable();
    expect(nameError()).toBe('');

    await submit();
    const req = createRequest();
    expect(req.request.body).toEqual({ name: 'a'.repeat(40), kind: 'FLOW' });
    req.flush(
      { id: '1', name: 'a'.repeat(40), kind: 'FLOW' },
      { status: 201, statusText: 'Created' },
    );
    await expectText('Przepływowe · 1');
  });

  it('shows a taken name as a field error that clears on the next edit', async () => {
    await loadWith([]);
    type('Wakacje');
    await submit();
    createRequest().flush(
      { detail: 'Masz już kategorię o tej nazwie.' },
      { status: 409, statusText: 'Conflict' },
    );

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(nameError()).toBe('Masz już kategorię o tej nazwie.');
    });
    expect(query('[hlmAlert]')).toBeNull();
    expect(document.activeElement).toBe(query('#category-name'));

    type('Wakacje 2');
    await fixture.whenStable();
    expect(nameError()).toBe('');
  });

  it('shows the first field message of a 400 in the form Alert', async () => {
    await loadWith([]);
    type('Wakacje');
    await submit();
    createRequest().flush(
      { detail: 'Invalid request', errors: { name: 'Nazwa jest za długa.' } },
      { status: 400, statusText: 'Bad Request' },
    );

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(query('form [hlmAlert]')?.textContent).toContain('Nazwa jest za długa.');
    });
  });

  it('shows a network failure in the form Alert', async () => {
    await loadWith([]);
    type('Wakacje');
    await submit();
    createRequest().error(new ProgressEvent('error'), { status: 0, statusText: '' });

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(query('form [hlmAlert]')?.textContent).toContain(
        'Brak połączenia z serwerem. Spróbuj ponownie.',
      );
    });
  });

  it('adds the new category without a refetch, clears the name, keeps the kind and focuses the name', async () => {
    await loadWith([]);
    type('Wakacje');
    query<HTMLInputElement>('#category-kind-cumulative')!.click();
    await submit();

    expect(query<HTMLButtonElement>('button[type="submit"]')?.textContent).toContain('Dodawanie…');
    expect(query<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);

    const req = createRequest();
    expect(req.request.body).toEqual({ name: 'Wakacje', kind: 'CUMULATIVE' });
    req.flush(
      { id: '1', name: 'Wakacje', kind: 'CUMULATIVE' },
      { status: 201, statusText: 'Created' },
    );

    await expectText('Narastające · 1');
    expect(query<HTMLInputElement>('#category-kind-cumulative')!.checked).toBe(true);
    expect(query<HTMLInputElement>('#category-kind-flow')!.checked).toBe(false);
    http.expectNone({ method: 'GET', url: '/api/categories' });
    const input = query<HTMLInputElement>('#category-name')!;
    expect(input.value).toBe('');
    expect(nameError()).toBe('');
    expect(document.activeElement).toBe(input);
    expect(query<HTMLButtonElement>('button[type="submit"]')?.textContent).toContain(
      'Dodaj kategorię',
    );
  });

  async function createBeforeListArrives(): Promise<TestRequest> {
    const list = listRequest();
    await fixture.whenStable();
    type('Wakacje');
    await submit();
    createRequest().flush(
      { id: '1', name: 'Wakacje', kind: 'FLOW' },
      { status: 201, statusText: 'Created' },
    );
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(query<HTMLInputElement>('#category-name')!.value).toBe('');
    });
    return list;
  }

  it('keeps a category created before a list that lacks it arrives', async () => {
    const list = await createBeforeListArrives();
    list.flush([{ id: '2', name: 'Opłaty roczne', kind: 'CUMULATIVE' }]);

    await expectText('Narastające · 1');
    expect(groupNames('categories-flow-title')).toEqual(['Wakacje']);
  });

  it('does not show a category twice when the late list already includes it', async () => {
    const list = await createBeforeListArrives();
    list.flush([
      { id: '1', name: 'Wakacje', kind: 'FLOW' },
      { id: '2', name: 'Opłaty roczne', kind: 'CUMULATIVE' },
    ]);

    await expectText('Narastające · 1');
    expect(groupNames('categories-flow-title')).toEqual(['Wakacje']);
    expect(query('#categories-flow-title')?.textContent).toContain('Przepływowe · 1');
  });

  it('stays on the load-error Alert after creating a category', async () => {
    listRequest().flush(null, { status: 500, statusText: 'Server Error' });
    await expectText('Nie udało się wczytać kategorii. Odśwież stronę.');

    type('Wakacje');
    await submit();
    createRequest().flush(
      { id: '1', name: 'Wakacje', kind: 'FLOW' },
      { status: 201, statusText: 'Created' },
    );
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(query<HTMLInputElement>('#category-name')!.value).toBe('');
    });

    expect(text()).toContain('Nie udało się wczytać kategorii. Odśwież stronę.');
    expect(query('#categories-flow-title')).toBeNull();
  });
});
