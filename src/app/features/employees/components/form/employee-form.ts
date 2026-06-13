import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { disabled, email, form, FormField, FormRoot, hidden, required, validate } from '@angular/forms/signals';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PhoneNumberPicker } from '@shared/components/phone-number-picker/phone-number-picker';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';

import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
import {
  CONTRACT_TYPES,
  ContractType,
  CreateEmployeeRequest,
  Employee,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  EmployeeRole,
  EmployeeStatus,
  UpdateEmployeeRequest,
} from '../../../../shared/models/employee';
import { EmployeeService } from '../../service/employee.service';

export interface EmployeeFormModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: EmployeeRole | null;
  restaurantId: string;
  position: string;
  contractType: ContractType | null;
  status: EmployeeStatus;
}

@Component({
  selector: 'adm-employee-form',
  imports: [
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmFieldImports,
    HlmButtonImports,
    HlmSpinnerImports,
    HlmIconImports,
    HlmSelectImports,
    TranslocoModule,
    FormField,
    FormRoot,
    PhoneNumberPicker,
  ],
  host: {
    class: 'flex flex-col gap-4 sm:max-w-lg ',
  },
  templateUrl: './employee-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeForm implements OnInit {
  // ==========================================
  // Services
  // ==========================================

  private readonly _employeeService = inject(EmployeeService);
  private readonly _transloco = inject(TranslocoService);
  private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{ employee?: Employee }>();

  // ==========================================
  // State
  // ==========================================

  protected readonly rolesList = signal([...EMPLOYEE_ROLES]);
  protected readonly statusList = signal([...EMPLOYEE_STATUSES]);
  protected readonly contractTypesList = signal([...CONTRACT_TYPES]);
  protected readonly isEditMode = signal<boolean>(!!this._dialogContext.employee);
  protected readonly isSubmitting = signal(false);

  private readonly employeeModel = signal<EmployeeFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: null,
    restaurantId: '',
    position: '',
    contractType: null,
    status: 'ACTIVE',
  });

  protected readonly employeeForm = form(
    this.employeeModel,
    (schema) => {
      required(schema.firstName);
      required(schema.lastName);
      required(schema.email);
      email(schema.email);
      required(schema.role);

      // Email and role are immutable once the account exists (not in the update DTO).
      disabled(schema.email, () => this.isEditMode());
      disabled(schema.role, () => this.isEditMode());

      // Status is only meaningful when editing; restaurantId only for new MANAGER accounts.
      hidden(schema.status, () => !this.isEditMode());
      hidden(schema.restaurantId, ({ valueOf }) => this.isEditMode() || valueOf(schema.role) !== 'MANAGER');

      required(schema.restaurantId, { when: ({ valueOf }) => valueOf(schema.role) === 'MANAGER' });
      validate(schema.restaurantId, ({ value }) => {
        if (!value()) {
          return null;
        }
        const id = Number(value());
        return Number.isInteger(id) && id > 0 ? null : { kind: 'invalid' };
      });

      validate(schema.phone, ({ value }) => {
        if (!value()) {
          return null;
        }
        const phoneNumber = parsePhoneNumberFromString(value());
        return phoneNumber && phoneNumber.isValid() ? null : { kind: 'invalid' };
      });
    },
    {
      submission: {
        action: async () => this.onSubmit(),
      },
    }
  );

  // ==========================================
  // Public Methods
  // ==========================================

  ngOnInit(): void {
    const employee = this._dialogContext.employee;
    if (employee) {
      this.employeeModel.set({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone ?? '',
        role: employee.role,
        restaurantId: employee.restaurantId?.toString() ?? '',
        position: employee.position ?? '',
        contractType: employee.contractType ?? null,
        status: employee.status,
      });
    }
  }

  onSubmit() {
    if (!this.employeeForm().dirty()) {
      this._dialogRef.close(false);
      return;
    }
    this.onSaveEmployee();
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private onSaveEmployee() {
    this.isSubmitting.set(true);
    const employee = this._dialogContext.employee;

    const request$ =
      this.isEditMode() && employee
        ? this._employeeService.updateEmployee(employee.id, this._mapToUpdateRequest())
        : this._employeeService.createEmployee(this._mapToCreateRequest());

    request$.subscribe({
      next: () => {
        this.showToast();
        this._dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error(this._transloco.translate('common.error'));
        this.isSubmitting.set(false);
      },
    });
  }

  private _mapToCreateRequest(): CreateEmployeeRequest {
    const f = this.employeeForm;
    const role = f.role().value() as EmployeeRole;
    return {
      firstName: f.firstName().value(),
      lastName: f.lastName().value(),
      email: f.email().value(),
      phone: f.phone().value() || null,
      role,
      restaurantId: role === 'MANAGER' ? Number(f.restaurantId().value()) : null,
      position: f.position().value() || null,
      contractType: f.contractType().value(),
    };
  }

  private _mapToUpdateRequest(): UpdateEmployeeRequest {
    const f = this.employeeForm;
    return {
      firstName: f.firstName().value(),
      lastName: f.lastName().value(),
      phone: f.phone().value() || null,
      status: f.status().value(),
      position: f.position().value() || null,
      contractType: f.contractType().value(),
    };
  }

  private showToast() {
    const message = this.isEditMode()
      ? this._transloco.translate('employees.toast.employeeUpdated')
      : this._transloco.translate('employees.toast.employeeCreated');
    toast.success(message);
  }

  protected closeDialog(): void {
    if (this.employeeForm().dirty()) {
      const confirmDiscard = confirm(this._transloco.translate('common.unsavedChangesWarning'));
      if (!confirmDiscard) {
        return;
      }
    }
    this._dialogRef.close();
  }
}
