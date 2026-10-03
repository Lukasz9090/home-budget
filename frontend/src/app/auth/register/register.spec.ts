import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Register } from './register';

@Component({ template: '' })
class Blank {}

describe('Register', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'register', component: Register },
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
    type('#register-email', 'Jan@X.pl');
    type('#register-password', 'sekret123');
    await harness.fixture.whenStable();
    submitButton().click();
    await harness.fixture.whenStable();
  }

  it('shows the password hint', async () => {
    await harness.navigateByUrl('/register', Register);
    expect(query('.hint').textContent).toContain('Co najmniej 8 znaków');
  });

  it('disables submit while the password is shorter than 8 or longer than 72 characters', async () => {
    await harness.navigateByUrl('/register', Register);
    type('#register-email', 'jan@x.pl');

    type('#register-password', '1234567');
    await harness.fixture.whenStable();
    expect(submitButton().disabled).toBe(true);
    expect(query('.field-error').textContent).toContain('co najmniej 8 znaków');

    type('#register-password', 'a'.repeat(73));
    await harness.fixture.whenStable();
    expect(submitButton().disabled).toBe(true);

    type('#register-password', '12345678');
    await harness.fixture.whenStable();
    expect(submitButton().disabled).toBe(false);
  });

  it('shows the server message when the e-mail is taken', async () => {
    await harness.navigateByUrl('/register', Register);
    await fillAndSubmit();

    const req = http.expectOne({ method: 'POST', url: '/api/auth/register' });
    expect(req.request.body).toEqual({ email: 'Jan@X.pl', password: 'sekret123' });
    req.flush(
      { detail: 'Konto z tym adresem e-mail już istnieje.' },
      { status: 409, statusText: 'Conflict' },
    );

    await vi.waitFor(async () => {
      await harness.fixture.whenStable();
      expect(query('[role="alert"]')?.textContent).toContain(
        'Konto z tym adresem e-mail już istnieje.',
      );
    });
  });

  it('ignores an external returnUrl such as //evil.com', async () => {
    await harness.navigateByUrl('/register?returnUrl=%2F%2Fevil.com', Register);
    await fillAndSubmit();
    http
      .expectOne('/api/auth/register')
      .flush({ id: '1', email: 'jan@x.pl' }, { status: 201, statusText: 'Created' });

    const router = TestBed.inject(Router);
    await vi.waitFor(() => expect(router.url).toBe('/'));
  });
});
