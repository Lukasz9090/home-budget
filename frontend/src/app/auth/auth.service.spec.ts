import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('ensureLoaded maps a 401 from /api/me to null', async () => {
    const result = service.ensureLoaded();
    http
      .expectOne({ method: 'GET', url: '/api/me' })
      .flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await expect(result).resolves.toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.loaded()).toBe(true);
  });

  it('ensureLoaded stores the account and asks the server only once', async () => {
    const first = service.ensureLoaded();
    const concurrent = service.ensureLoaded();
    http.expectOne('/api/me').flush({ id: '1', email: 'jan@x.pl' });

    await expect(first).resolves.toEqual({ id: '1', email: 'jan@x.pl' });
    await expect(concurrent).resolves.toEqual({ id: '1', email: 'jan@x.pl' });
    await expect(service.ensureLoaded()).resolves.toEqual({ id: '1', email: 'jan@x.pl' });
    http.expectNone('/api/me');
    expect(service.currentUser()?.email).toBe('jan@x.pl');
  });

  it('ensureLoaded rethrows unexpected errors and stays unknown', async () => {
    const result = service.ensureLoaded();
    http.expectOne('/api/me').flush(null, { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toBeTruthy();
    expect(service.loaded()).toBe(false);
  });

  it('login posts the credentials and stores the account', async () => {
    const result = service.login('jan@x.pl', 'sekret123');
    const req = http.expectOne({ method: 'POST', url: '/api/auth/login' });
    expect(req.request.body).toEqual({ email: 'jan@x.pl', password: 'sekret123' });
    req.flush({ id: '1', email: 'jan@x.pl' });

    await result;
    expect(service.currentUser()).toEqual({ id: '1', email: 'jan@x.pl' });
    expect(service.loaded()).toBe(true);
  });

  it('register posts the credentials and stores the account', async () => {
    const result = service.register('jan@x.pl', 'sekret123');
    const req = http.expectOne({ method: 'POST', url: '/api/auth/register' });
    expect(req.request.body).toEqual({ email: 'jan@x.pl', password: 'sekret123' });
    req.flush({ id: '1', email: 'jan@x.pl' }, { status: 201, statusText: 'Created' });

    await result;
    expect(service.currentUser()?.email).toBe('jan@x.pl');
  });

  it('logout posts to /api/auth/logout and clears currentUser', async () => {
    const login = service.login('jan@x.pl', 'sekret123');
    http.expectOne('/api/auth/login').flush({ id: '1', email: 'jan@x.pl' });
    await login;

    const logout = service.logout();
    http
      .expectOne({ method: 'POST', url: '/api/auth/logout' })
      .flush(null, { status: 204, statusText: 'No Content' });
    await logout;

    expect(service.currentUser()).toBeNull();
    expect(service.loaded()).toBe(false);
  });
});
