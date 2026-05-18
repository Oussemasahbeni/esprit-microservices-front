import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideBarChart3,
  lucideBot,
  lucideCalendarDays,
  lucideCheckSquare,
  lucideChevronRight,
  lucideFileText,
  lucideGauge,
  lucideLayoutDashboard,
  lucideLock,
  lucideSettings,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';

import { DirectionalityService } from '@core/config/directionality.service';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NavGroup } from '../../model/navigation';
import { NavSecondary } from '../secondary/nav-secondary';
import { NavUser } from '../user/user';

@Component({
  selector: 'adm-navigation',
  imports: [
    HlmSidebarImports,
    HlmCollapsibleImports,
    HlmIconImports,
    HlmTooltipImports,
    NavUser,
    NavSecondary,
    RouterLink,
    RouterModule,
    NgOptimizedImage,
    TranslocoModule,
  ],
  templateUrl: './navigation.html',
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideChevronRight,
      lucideGauge,
      lucideBarChart3,
      lucideFileText,
      lucideUsers,
      lucideCalendarDays,
      lucideCheckSquare,
      lucideLock,
      lucideAlertTriangle,
      lucideSettings,
      lucideBot,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navigation {
  // ==========================================
  // Services
  // ==========================================

  private readonly _dir = inject(DirectionalityService);
  private readonly _authService = inject(AuthService);
  private readonly _sidebarService = inject(HlmSidebarService);

  // ==========================================
  // State
  // ==========================================

  protected readonly side = computed<'left' | 'right'>(() => (this._dir.isRtl() ? 'right' : 'left'));
  protected readonly sideBarCollapsed = computed(() => this._sidebarService.state() === 'collapsed');

  protected readonly _navigationGroups: NavGroup[] = [
    {
      label: 'application',
      items: [
        {
          title: 'Dashboard',
          key: 'dashboard',
          icon: 'lucideLayoutDashboard',
          children: [
            { title: 'Dashboard 1', key: 'dashboard-1', url: '/dashboard/dashboard-1', icon: 'lucideGauge' },
            { title: 'Dashboard 2', key: 'dashboard-2', url: '/dashboard/dashboard-2', icon: 'lucideLayoutDashboard' },
          ],
        },
        { title: 'Users', key: 'users', url: '/users', icon: 'lucideUsers' },
      ],
    },
  ];

  protected readonly user = this._authService.currentUser;
}
