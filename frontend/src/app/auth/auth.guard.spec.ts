import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  function runGuard(url: string): Promise<GuardResult> {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as Promise<GuardResult>;
  }

  it('redirects an anonymous visitor to /login with the requested url', async () => {
    const result = runGuard('/');
    http.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    const tree = (await result) as UrlTree;
    expect(tree).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(tree)).toBe('/login?returnUrl=%2F');
    expect(tree.queryParams['returnUrl']).toBe('/');
  });

  it('lets an authenticated account through and calls /api/me only once', async () => {
    const first = runGuard('/');
    http.expectOne('/api/me').flush({ id: '1', email: 'jan@x.pl' });
    await expect(first).resolves.toBe(true);

    await expect(runGuard('/other')).resolves.toBe(true);
    http.expectNone('/api/me');
  });

  it('redirects to /login when the server cannot be reached', async () => {
    const result = runGuard('/');
    http.expectOne('/api/me').error(new ProgressEvent('error'));

    expect(await result).toBeInstanceOf(UrlTree);
  });
});
