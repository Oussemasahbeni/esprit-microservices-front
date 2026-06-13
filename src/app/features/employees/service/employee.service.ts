import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../../../shared/models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = `${environment.apiUrl}/api/employees`;

  /**
   * CREATE: provision a new employee (Keycloak account + local record).
   */
  createEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    return this._http.post<Employee>(this._apiUrl, employee);
  }

  /**
   * UPDATE: edit the mutable fields of an existing employee.
   */
  updateEmployee(id: number, employee: UpdateEmployeeRequest): Observable<Employee> {
    return this._http.put<Employee>(`${this._apiUrl}/${id}`, employee);
  }

  /**
   * DELETE: remove an employee (and its identity).
   */
  deleteEmployee(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }

  /**
   * ENABLE: re-activate an employee account (status -> ACTIVE).
   */
  enableEmployee(id: number): Observable<Employee> {
    return this._http.patch<Employee>(`${this._apiUrl}/${id}/enable`, {});
  }

  /**
   * DISABLE: deactivate an employee account (status -> INACTIVE).
   */
  disableEmployee(id: number): Observable<Employee> {
    return this._http.patch<Employee>(`${this._apiUrl}/${id}/disable`, {});
  }
}
