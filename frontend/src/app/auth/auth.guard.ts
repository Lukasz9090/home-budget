import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Lets logged-in accounts through; everyone else goes to `/login?returnUrl=<requested url>`. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // An unreachable server counts as "not logged in": the login screen can report it.
  const account = await auth.ensureLoaded().catch(() => null);
  return account
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
