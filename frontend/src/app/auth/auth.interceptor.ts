import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * A 401 from a data endpoint means the session ended mid-use: forget the account and go to
 * login. `/api/me` and `/api/auth/*` answer 401 by design, so their callers handle it.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isDataApi(req.url)) {
        auth.clear();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};

function isDataApi(url: string): boolean {
  const path = url.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
  return path.startsWith('/api/') && path !== '/api/me' && !path.startsWith('/api/auth/');
}
