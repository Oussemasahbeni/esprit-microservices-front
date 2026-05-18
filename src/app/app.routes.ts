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
        path: 'users',
        title: 'users',
        data: { breadcrumb: 'navigation.users', preload: true },
        loadChildren: () => import('./features/users/routes'),
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
