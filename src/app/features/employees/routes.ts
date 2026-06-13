import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('employees')],
    loadComponent: () => import('./pages/employees'),
  },
] as Routes;
