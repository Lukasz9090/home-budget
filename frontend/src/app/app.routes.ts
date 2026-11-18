import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { devRoutes } from './dev/dev-routes';

export const routes: Routes = [
  ...devRoutes,
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then((m) => m.Home),
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories').then((m) => m.Categories),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
