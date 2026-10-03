import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Login } from './login';

@Component({ template: '' })
class Blank {}

describe('Login', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: Login },
          { path: '**', component: Blank },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  function query<T extends Element>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector) as T;
  }

  function type(selector: string, value: string): void {
    const input = query<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  function submitButton(): HTMLButtonElement {
    return query<HTMLButtonElement>('button[type="submit"]');
  }

  async function fillAndSubmit(): Promise<void> {
    type('#login-email', 'jan@x.pl');
    type('#login-password', 'sekret123');
    await harness.fixture.whenStable();
    submitButton().click();
    await harness.fixture.whenStable();
  }

  it('disables submit while the form is invalid', async () => {
    await harness.navigateByUrl('/login', Login);
    expect(submitButton().disabled).toBe(true);

    type('#login-email', 'nie-email');
    type('#login-password', 'sekret123');
    await harness.fixture.whenStable();
    expect(submitButton().disabled).toBe(true);

    type('#login-email', 'jan@x.pl');
    await harness.fixture.whenStable();
    expect(submitButton().disabled).toBe(false);
  });

  it('shows the server message for wrong credentials', async () => {
    await harness.navigateByUrl('/login', Login);
    await fillAndSubmit();

    http
      .expectOne('/api/auth/login')
      .flush(
        { detail: 'Nieprawidłowy e-mail lub hasło.' },
        { status: 401, statusText: 'Unauthorized' },
      );

    await vi.waitFor(async () => {
      await harness.fixture.whenStable();
      expect(query('[role="alert"]')?.textContent).toContain('Nieprawidłowy e-mail lub hasło.');
    });
    expect(submitButton().disabled).toBe(false);
  });

  it('navigates to an internal returnUrl after login', async () => {
    await harness.navigateByUrl('/login?returnUrl=%2Fbudzet', Login);
    await fillAndSubmit();
    http.expectOne('/api/auth/login').flush({ id: '1', email: 'jan@x.pl' });

    const router = TestBed.inject(Router);
    await vi.waitFor(() => expect(router.url).toBe('/budzet'));
  });

  it('ignores an external returnUrl such as //evil.com', async () => {
    await harness.navigateByUrl('/login?returnUrl=%2F%2Fevil.com', Login);
    await fillAndSubmit();
    http.expectOne('/api/auth/login').flush({ id: '1', email: 'jan@x.pl' });

    const router = TestBed.inject(Router);
    await vi.waitFor(() => expect(router.url).toBe('/'));
  });
});
