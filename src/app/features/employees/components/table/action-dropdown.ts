import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation-dialog.service';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { type CellContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { exhaustMap, filter, Observable } from 'rxjs';
import { Employee } from '../../../../shared/models/employee';
import { EmployeeService } from '../../service/employee.service';
import { EmployeeForm } from '../form/employee-form';

@Component({
  selector: 'adm-action-dropdown',
  imports: [
    HlmButtonImports,
    HlmIconImports,
    HlmDropdownMenuImports,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmTooltipImports,
    TranslocoModule,
  ],
  providers: [provideIcons({ lucideEllipsisVertical })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      hlmBtn
      variant="ghost"
      size="icon"
      align="end"
      aria-label="Open row actions"
      [hlmDropdownMenuTrigger]="menu"
    >
      <ng-icon hlmIcon size="sm" name="lucideEllipsisVertical" />
    </button>
    <ng-template #menu>
      <ng-container *transloco="let t; prefix: 'actionDropdown'">
        <hlm-dropdown-menu>
          <hlm-dropdown-menu-group>
            <button type="button" hlmDropdownMenuItem (click)="onEditEmployee()">
              {{ t('edit') }}
            </button>
            @if (employee().status !== 'ACTIVE') {
              <button type="button" hlmDropdownMenuItem (click)="onToggleStatus(true)">
                {{ t('enable') }}
              </button>
            }
            @if (employee().status === 'ACTIVE') {
              <button type="button" hlmDropdownMenuItem (click)="onToggleStatus(false)">
                {{ t('disable') }}
              </button>
            }
          </hlm-dropdown-menu-group>
          <hlm-dropdown-menu-separator />
          <hlm-dropdown-menu-group>
            <button type="button" variant="destructive" hlmDropdownMenuItem (click)="openConfirmationDialog()">
              {{ t('delete') }}
            </button>
          </hlm-dropdown-menu-group>
        </hlm-dropdown-menu>
      </ng-container>
    </ng-template>
  `,
})
export class ActionDropdown {
  // ==========================================
  // Services
  // ==========================================

  private readonly _employeeService = inject(EmployeeService);
  private readonly _transloco = inject(TranslocoService);
  private readonly _hlmDialogService = inject(HlmDialogService);
  private readonly _context = injectFlexRenderContext<CellContext<Employee, unknown>>();
  private readonly _confirmationDialogService = inject(ConfirmationDialogService);
  private readonly _destroyRef = inject(DestroyRef);

  // ==========================================
  // Inputs
  // ==========================================

  public readonly onSuccess = input<() => void>();

  // ==========================================
  // Helpers
  // ==========================================

  protected employee(): Employee {
    return this._context.row.original;
  }

  // ==========================================
  // Public Methods
  // ==========================================

  protected onToggleStatus(enable: boolean): void {
    const employee = this.employee();
    const request$: Observable<Employee> = enable
      ? this._employeeService.enableEmployee(employee.id)
      : this._employeeService.disableEmployee(employee.id);

    request$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: () => {
        toast.success(
          this._transloco.translate(enable ? 'employees.toast.employeeEnabled' : 'employees.toast.employeeDisabled')
        );
        this.onSuccess()?.();
      },
      error: (err) => {
        console.error('Status change failed', err);
        toast.error(this._transloco.translate('common.error'));
      },
    });
  }

  protected openConfirmationDialog(): void {
    const employee = this.employee();

    this._confirmationDialogService
      .open({
        title: this._transloco.translate('employees.confirmationDialog.deleteTitle'),
        message: this._transloco.translate('employees.confirmationDialog.deleteMessage'),
        confirmText: this._transloco.translate('buttons.confirm'),
        cancelText: this._transloco.translate('buttons.cancel'),
        variant: 'destructive',
      })
      .closed$.pipe(
        filter((result) => result === 'confirm'),
        exhaustMap(() => this._employeeService.deleteEmployee(employee.id)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: () => {
          toast.success(this._transloco.translate('employees.toast.employeeDeleted'));
          this.onSuccess()?.();
        },
        error: (err) => {
          console.error('Delete failed', err);
          toast.error(this._transloco.translate('common.error'));
        },
      });
  }

  protected onEditEmployee(): void {
    const employee = this.employee();
    const dialogRef = this._hlmDialogService.open(EmployeeForm, {
      context: { employee },
      contentClass: 'max-w-3xl',
      autoFocus: 'dialog',
    });

    dialogRef.closed$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((result) => {
      if (result) {
        this.onSuccess()?.();
      }
    });
  }
}
