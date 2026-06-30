import { Routes } from '@angular/router';
import { MainLayout } from './layout/app/layout';
import { EmptyLayout } from './layout/empty/empty';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/dashboard-1',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'dashboard',
        data: { breadcrumb: 'navigation.dashboard' },
        children: [
          {
            path: '',
            redirectTo: 'dashboard-1',
            pathMatch: 'full',
          },
          {
            path: 'dashboard-1',
            title: 'dashboard-1',
            data: { breadcrumb: 'navigation.dashboard-1' },
            loadChildren: () => import('./features/dashboards/dashboard-1/routes'),
          },
          {
            path: 'dashboard-2',
            title: 'dashboard-2',
            data: { breadcrumb: 'navigation.dashboard-2', preload: true },
            loadChildren: () => import('./features/dashboards/dashboard-2/routes'),
          },
        ],
      },
      {
        path: 'employees',
        title: 'employees',
        data: { breadcrumb: 'navigation.employees', preload: true },
        loadChildren: () => import('./features/employees/routes'),
      },
      {
        path: 'menu',
        title: 'menu',
        data: { breadcrumb: 'navigation.menu', preload: true },
        loadChildren: () => import('./features/menu/routes'),
      },
      {
        path: 'reservations',
        title: 'reservations',
        data: { breadcrumb: 'navigation.reservations', preload: true },
        loadChildren: () => import('./features/reservations/routes'),
      },
    ],
  },

  {
    path: '',
    component: EmptyLayout,
    loadChildren: () => import('./features/errors/routes'),
  },

  { path: '**', redirectTo: '404-not-found' },
];
