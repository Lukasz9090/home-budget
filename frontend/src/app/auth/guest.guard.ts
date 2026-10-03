import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Keeps logged-in accounts away from the login/sign-up screens. Its `GET /api/me` also
 * bootstraps the `XSRF-TOKEN` cookie before the screen's first POST.
 */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const account = await auth.ensureLoaded().catch(() => null);
  return account ? router.createUrlTree(['/']) : true;
};
