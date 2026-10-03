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

import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  function runGuard(): Promise<GuardResult> {
    return TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, { url: '/login' } as RouterStateSnapshot),
    ) as Promise<GuardResult>;
  }

  it('sends an authenticated account to /', async () => {
    const result = runGuard();
    http.expectOne('/api/me').flush({ id: '1', email: 'jan@x.pl' });

    const tree = (await result) as UrlTree;
    expect(tree).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(tree)).toBe('/');
  });

  it('lets an anonymous visitor see the guest screen', async () => {
    const result = runGuard();
    http.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).resolves.toBe(true);
  });
});
