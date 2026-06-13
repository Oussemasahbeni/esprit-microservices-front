import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { CellContext, ColumnDef, ColumnPinningState, flexRenderComponent } from '@tanstack/angular-table';

import { httpResource } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, form, FormField } from '@angular/forms/signals';
import { translateSignal } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideCircleCheck,
  lucideCircleX,
  lucideLoader,
  lucideRefreshCcw,
  lucideSearch,
  lucideShieldCheck,
  lucideTruck,
  lucideUserPlus,
  lucideX,
} from '@ng-icons/lucide';
import { DataTableColumnsManager } from '@shared/datatable/columns-manager/columns-manager';
import { DataTable } from '@shared/datatable/table/data-table';
import { HlmDialogService } from '@spartan-ng/helm/dialog';

import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { environment } from '../../../../environments/environment';
import { Employee, EmployeeRole, EmployeeStatus } from '../../../shared/models/employee';
import { EmployeesCardSection } from '../components/cards/card-section';
import { RoleFilter } from '../components/filters/role-filter';
import { StatusFilter } from '../components/filters/status-filter';
import { EmployeeForm } from '../components/form/employee-form';
import { ActionDropdown } from '../components/table/action-dropdown';

@Component({
  selector: 'adm-employees',
  imports: [
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    HlmInputGroupImports,
    HlmAvatarImports,
    HlmBadgeImports,
    DatePipe,
    EmployeesCardSection,
    TranslocoModule,
    DataTable,
    DataTableColumnsManager,
    StatusFilter,
    RoleFilter,
    FormField,
  ],
  templateUrl: './employees.html',
  providers: [
    provideIcons({
      lucideRefreshCcw,
      lucideUserPlus,
      lucideSearch,
      lucideX,
      lucideCircleCheck,
      lucideCircleX,
      lucideLoader,
      lucideBriefcase,
      lucideShieldCheck,
      lucideTruck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Employees {
  // ==========================================
  // Services
  // ==========================================

  private readonly _translocoService = inject(TranslocoService);
  private readonly _hlmDialogService = inject(HlmDialogService);
  private readonly _destroyRef = inject(DestroyRef);

  // ==========================================
  // View Children
  // ==========================================

  protected readonly dataTable = viewChild.required(DataTable<Employee>);
  protected readonly dateCell = viewChild.required<TemplateRef<CellContext<Employee, string>>>('dateCell');
  protected readonly nameCell = viewChild.required<TemplateRef<CellContext<Employee, string>>>('nameCell');
  protected readonly statusCell = viewChild.required<TemplateRef<CellContext<Employee, EmployeeStatus>>>('statusCell');
  protected readonly roleCell = viewChild.required<TemplateRef<CellContext<Employee, EmployeeRole>>>('roleCell');
  protected readonly contractCell = viewChild.required<TemplateRef<CellContext<Employee, string>>>('contractCell');

  // ==========================================
  // State
  // ==========================================

  protected readonly table = computed(() => this.dataTable().table);

  protected readonly selectedRoles = signal<EmployeeRole[]>([]);
  protected readonly selectedStatuses = signal<EmployeeStatus[]>([]);
  protected readonly defaultColumnPinning: ColumnPinningState = { left: ['select'], right: ['actions'] };

  /**
   * `GET /api/employees` returns the full list (no server-side pagination),
   * so the table runs in client mode over this resource's value.
   */
  protected readonly employeesResource = httpResource<Employee[]>(() => `${environment.apiUrl}/api/employees`);

  private readonly allEmployees = computed(() => this.employeesResource.value() ?? []);

  protected readonly searchForm = form(signal({ search: '' }), (schema) => debounce(schema.search, 300));

  /** Client-side search + role/status filtering over the loaded list. */
  protected readonly employees = computed(() => {
    const search = this.searchForm.search().value().trim().toLowerCase();
    const roles = this.selectedRoles();
    const statuses = this.selectedStatuses();

    return this.allEmployees().filter((employee) => {
      if (roles.length && !roles.includes(employee.role)) {
        return false;
      }
      if (statuses.length && !statuses.includes(employee.status)) {
        return false;
      }
      if (search) {
        const haystack = [employee.firstName, employee.lastName, employee.email, employee.phone, employee.position]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      return true;
    });
  });

  protected readonly isLoading = this.employeesResource.isLoading;

  // Card metrics derived from the full (unfiltered) list.
  protected readonly totalCount = computed(() => this.allEmployees().length);
  protected readonly activeCount = computed(() => this.allEmployees().filter((e) => e.status === 'ACTIVE').length);
  protected readonly inactiveCount = computed(() => this.allEmployees().filter((e) => e.status === 'INACTIVE').length);
  protected readonly suspendedCount = computed(() => this.allEmployees().filter((e) => e.status === 'SUSPENDED').length);

  /** Signal tracking the current active language for i18n updates */
  protected readonly activeLanguage = computed(() => this._translocoService.activeLang());

  /**
   * TanStack Table Column Definitions.
   * Uses `translateSignal` for reactive header translations.
   */
  protected readonly columns: ColumnDef<Employee>[] = [
    {
      id: 'name',
      accessorFn: (employee) => `${employee.firstName} ${employee.lastName}`,
      header: translateSignal('list.columns.name'),
      meta: { translationKey: 'employees.list.columns.name' },
      cell: () => this.nameCell(),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: translateSignal('list.columns.email'),
      meta: { translationKey: 'employees.list.columns.email' },
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: translateSignal('list.columns.phone'),
      meta: { translationKey: 'employees.list.columns.phone' },
      enableSorting: false,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: translateSignal('list.columns.role'),
      meta: { translationKey: 'employees.list.columns.role' },
      cell: () => this.roleCell(),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: translateSignal('list.columns.status'),
      meta: { translationKey: 'employees.list.columns.status' },
      cell: () => this.statusCell(),
    },
    {
      id: 'position',
      accessorKey: 'position',
      header: translateSignal('list.columns.position'),
      meta: { translationKey: 'employees.list.columns.position' },
    },
    {
      id: 'contractType',
      accessorKey: 'contractType',
      header: translateSignal('list.columns.contractType'),
      meta: { translationKey: 'employees.list.columns.contractType' },
      cell: () => this.contractCell(),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: translateSignal('list.columns.createdAt'),
      meta: { translationKey: 'employees.list.columns.createdAt' },
      cell: () => this.dateCell(),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableResizing: false,
      enablePinning: true,
      size: 40,
      cell: () =>
        flexRenderComponent(ActionDropdown, {
          inputs: {
            onSuccess: () => this.refreshTable(),
          },
        }),
    },
  ];

  // ==========================================
  // Public Methods
  // ==========================================

  protected addEmployee() {
    const dialogRef = this._hlmDialogService.open(EmployeeForm, {
      autoFocus: 'dialog',
    });

    dialogRef.closed$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((result) => {
      if (result) this.refreshTable();
    });
  }

  // ==========================================
  // Private Methods
  // ==========================================

  refreshTable(): void {
    this.employeesResource.reload();
  }
}
