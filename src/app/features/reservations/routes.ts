import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('reservations')],
    children: [
      { path: '', redirectTo: 'book', pathMatch: 'full' },
      { path: 'book', loadComponent: () => import('./pages/book-reservation/book-reservation') },
      { path: 'my', loadComponent: () => import('./pages/my-reservations/my-reservations') },
      { path: 'manager', loadComponent: () => import('./pages/manager-reservations/manager-reservations') },
      { path: 'tables', loadComponent: () => import('./pages/tables-rooms/tables-rooms') },
      { path: 'lookup', loadComponent: () => import('./pages/lookup-reservation/lookup-reservation') },
    ],
  },
] as Routes;
