/**
 * Wire formats mirror the backend enums, which Jackson serializes by `name()`
 * (uppercase). Send these literals verbatim in create/update payloads.
 */
export const EMPLOYEE_ROLES = ['MANAGER', 'ADMIN', 'DELIVERY_MANAGER'] as const;
export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;
export const CONTRACT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];

/** Matches `EmployeeResponse` returned by `GET /api/employees`. */
export interface Employee {
  id: number;
  keycloakUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: EmployeeRole;
  /** Set only when role = MANAGER. */
  restaurantId?: number | null;
  status: EmployeeStatus;
  position?: string | null;
  contractType?: ContractType | null;
  hireDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** Matches `CreateEmployeeRequest`. `restaurantId` is required when role = MANAGER. */
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: EmployeeRole;
  restaurantId?: number | null;
  position?: string | null;
  contractType?: ContractType | null;
}

/** Matches `UpdateEmployeeRequest`. Email and role are not editable after creation. */
export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  status?: EmployeeStatus;
  position?: string | null;
  contractType?: ContractType | null;
}
