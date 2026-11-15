import { Routes } from '@angular/router';

/** Developer-only routes, swapped in by `fileReplacements` in the development build only. */
export const devRoutes: Routes = [
  {
    path: 'dev/kitchen-sink',
    loadComponent: () => import('./kitchen-sink').then((m) => m.KitchenSink),
  },
];
