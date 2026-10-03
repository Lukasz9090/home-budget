import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Default XSRF support: reads the XSRF-TOKEN cookie, sends X-XSRF-TOKEN on mutating requests.
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
