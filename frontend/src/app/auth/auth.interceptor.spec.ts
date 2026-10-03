import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    const login = auth.login('jan@x.pl', 'sekret123');
    http.expectOne('/api/auth/login').flush({ id: '1', email: 'jan@x.pl' });
    await login;
  });

  afterEach(() => http.verify());

  it('clears the state and navigates to login on a 401 from a data endpoint', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const result = firstValueFrom(client.get('/api/months'));
    http.expectOne('/api/months').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(auth.currentUser()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/' } });
  });

  it('passes a 401 from /api/auth/login through to the caller untouched', async () => {
    const navigate = vi.spyOn(router, 'navigate');

    const result = firstValueFrom(
      client.post('/api/auth/login', { email: 'jan@x.pl', password: 'zle-haslo' }),
    );
    const body = { detail: 'Nieprawidłowy e-mail lub hasło.' };
    http.expectOne('/api/auth/login').flush(body, { status: 401, statusText: 'Unauthorized' });

    const error = await result.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(401);
    expect((error as HttpErrorResponse).error).toEqual(body);
    expect(navigate).not.toHaveBeenCalled();
    expect(auth.currentUser()?.email).toBe('jan@x.pl');
  });

  it('leaves a 401 from /api/me to the auth service', async () => {
    const navigate = vi.spyOn(router, 'navigate');

    const result = firstValueFrom(client.get('/api/me'));
    http.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(navigate).not.toHaveBeenCalled();
  });
});
