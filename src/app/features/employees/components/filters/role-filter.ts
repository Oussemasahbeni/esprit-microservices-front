import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideBriefcase, lucideListFilter, lucideSearch, lucideShieldCheck, lucideTruck } from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { EMPLOYEE_ROLES, EmployeeRole } from '../../../../shared/models/employee';

@Component({
  selector: 'adm-employees-role-filter',
  imports: [
    HlmButtonImports,
    HlmIconImports,
    HlmPopoverImports,
    BrnCommandImports,
    HlmCommandImports,
    HlmCheckboxImports,
    TranslocoModule,
  ],
  providers: [provideIcons({ lucideSearch, lucideListFilter, lucideShieldCheck, lucideBriefcase, lucideTruck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-popover
      *transloco="let t"
      sideOffset="5"
      closeDelay="100"
      align="start"
      [state]="_rolesState()"
      (stateChanged)="rolesStateChanged($event)"
    >
      <button type="button" hlmBtn hlmPopoverTrigger variant="outline" size="sm" class="border-dashed">
        <ng-icon hlm name="lucideListFilter" size="sm" />
        {{ t('employees.list.columns.role') }}
        @if (_rolesFilter().length) {
          <div data-orientation="vertical" role="none" class="bg-border mx-2 h-4 w-px shrink-0"></div>

          <div class="flex gap-1">
            @for (role of _rolesFilter(); track role) {
              <span *transloco="let t" class="bg-secondary text-secondary-foreground rounded px-1 py-0.5 text-xs">
                {{ t('employees.role.' + role) }}
              </span>
            }
          </div>
        }
      </button>
      <hlm-command *hlmPopoverPortal="let ctx" hlmPopoverContent class="w-56 p-0">
        <hlm-command-input>
          <ng-icon hlm name="lucideSearch" class="text-muted-foreground" />
          <input hlm-command-search-input [placeholder]="t('employees.list.columns.role')" />
        </hlm-command-input>
        <div *brnCommandEmpty hlmCommandEmpty>
          {{ t('common.noData') }}
        </div>
        <hlm-command-list>
          <hlm-command-group>
            @for (role of _rolesList(); track role) {
              <button type="button" hlm-command-item [value]="role" (selected)="roleSelected(role)">
                <hlm-checkbox class="mr-2" [checked]="isRoleSelected(role)" />
                @switch (role) {
                  @case ('ADMIN') {
                    <ng-icon hlmIcon size="sm" name="lucideShieldCheck" />
                  }
                  @case ('MANAGER') {
                    <ng-icon hlmIcon size="sm" name="lucideBriefcase" />
                  }
                  @case ('DELIVERY_MANAGER') {
                    <ng-icon hlmIcon size="sm" name="lucideTruck" />
                  }
                }
                <span *transloco="let t; prefix: 'employees.role'"> {{ t(role) }} </span>
              </button>
            }
            @if (_rolesFilter().length) {
              <hlm-command-separator />
              <button
                type="button"
                hlm-command-item
                class="mt-1 flex justify-center"
                [value]="''"
                (selected)="clearRolesFilter()"
              >
                {{ t('common.clearFilter') }}
              </button>
            }
          </hlm-command-group>
        </hlm-command-list>
      </hlm-command>
    </hlm-popover>
  `,
})
export class RoleFilter {
  // ==========================================
  // Outputs
  // ==========================================

  public readonly rolesChanged = output<EmployeeRole[]>();

  // ==========================================
  // State
  // ==========================================

  protected readonly _rolesFilter = signal<EmployeeRole[]>([]);
  protected readonly _rolesList = signal([...EMPLOYEE_ROLES]);
  protected readonly _rolesState = signal<'closed' | 'open'>('closed');

  // ==========================================
  // Public Methods
  // ==========================================

  protected rolesStateChanged(state: 'open' | 'closed') {
    this._rolesState.set(state);
  }

  protected isRoleSelected(role: EmployeeRole): boolean {
    return this._rolesFilter().some((r) => r === role);
  }

  protected roleSelected(role: EmployeeRole): void {
    const current = this._rolesFilter();
    const index = current.indexOf(role);
    if (index === -1) {
      this._rolesFilter.set([...current, role]);
    } else {
      this._rolesFilter.set(current.filter((r) => r !== role));
    }
    this.rolesChanged.emit(this._rolesFilter());
  }

  protected clearRolesFilter(): void {
    this._rolesFilter.set([]);
    this.rolesChanged.emit(this._rolesFilter());
  }
}
