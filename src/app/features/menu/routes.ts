import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('menu')],
    loadComponent: () => import('./pages/menu-management'),
  },
] as Routes;
