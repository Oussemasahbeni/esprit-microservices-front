import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideCircleX, lucideInfo, lucideLoader, lucideUsers } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

@Component({
  selector: 'adm-employees-card-section',
  imports: [HlmCardImports, HlmIconImports, HlmBadgeImports, HlmTooltipImports, TranslocoModule],
  providers: [
    provideIcons({
      lucideUsers,
      lucideCircleCheck,
      lucideCircleX,
      lucideLoader,
      lucideInfo,
    }),
    provideTranslocoScope('employees'),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <div *transloco="let t; prefix: 'employees.cards.total'" class="border-border bg-card rounded-lg border p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <ng-icon hlm name="lucideUsers" class="text-muted-foreground" size="base" />
            <div>
              <p class="text-muted-foreground text-sm">{{ t('label') }}</p>
              <h3 class="text-3xl font-bold tabular-nums">{{ total() }}</h3>
              <p class="text-muted-foreground text-xs">{{ t('subtitle') }}</p>
            </div>
          </div>
          <ng-icon hlm name="lucideInfo" class="text-muted-foreground" size="sm" [hlmTooltip]="t('infoTooltip')" />
        </div>
      </div>
      <div *transloco="let t; prefix: 'employees.cards.active'" class="border-border bg-card rounded-lg border p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <ng-icon hlm name="lucideCircleCheck" class="text-green-600" size="base" />
            <div>
              <p class="text-muted-foreground text-sm">{{ t('label') }}</p>
              <h3 class="text-3xl font-bold tabular-nums">{{ active() }}</h3>
              <p class="text-muted-foreground text-xs">{{ t('subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div *transloco="let t; prefix: 'employees.cards.inactive'" class="border-border bg-card rounded-lg border p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <ng-icon hlm name="lucideCircleX" class="text-muted-foreground" size="base" />
            <div>
              <p class="text-muted-foreground text-sm">{{ t('label') }}</p>
              <h3 class="text-3xl font-bold tabular-nums">{{ inactive() }}</h3>
              <p class="text-muted-foreground text-xs">{{ t('subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div *transloco="let t; prefix: 'employees.cards.suspended'" class="border-border bg-card rounded-lg border p-6">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <ng-icon hlm name="lucideLoader" class="text-destructive" size="base" />
            <div>
              <p class="text-muted-foreground text-sm">{{ t('label') }}</p>
              <h3 class="text-3xl font-bold tabular-nums">{{ suspended() }}</h3>
              <p class="text-muted-foreground text-xs">{{ t('subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EmployeesCardSection {
  public readonly total = input(0);
  public readonly active = input(0);
  public readonly inactive = input(0);
  public readonly suspended = input(0);
}
