import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BookingResult,
  CreateReservationRequest,
  CreateRoomRequest,
  CreateTableRequest,
  DailyStats,
  MenuSnapshot,
  Reservation,
  Room,
  TableInfo,
  TableStatus,
  WaitlistEntry,
} from '../../../shared/models/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = `${environment.apiUrl}/api/reservations`;
  private readonly _managerUrl = `${environment.apiUrl}/api/manager`;

  getMenuSnapshot(): Observable<MenuSnapshot> {
    return this._http.get<MenuSnapshot>(`${this._apiUrl}/menu`);
  }

  checkAvailability(date: string, time: string, guests: number): Observable<TableInfo[]> {
    return this._http.get<TableInfo[]>(`${this._apiUrl}/availability`, {
      params: { date, time, guests },
    });
  }

  createReservation(request: CreateReservationRequest): Observable<BookingResult> {
    return this._http.post<BookingResult>(this._apiUrl, request);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this._http.get<Reservation[]>(`${this._apiUrl}/my`);
  }

  getReservationByCode(code: string): Observable<Reservation> {
    return this._http.get<Reservation>(`${this._apiUrl}/code/${code}`);
  }

  cancelReservation(id: number, reason?: string): Observable<Reservation> {
    return this._http.delete<Reservation>(`${this._apiUrl}/${id}/cancel`, {
      params: reason ? { reason } : {},
    });
  }

  // ── Manager dashboard ──────────────────────────────────────────────────

  getManagerReservations(date?: string): Observable<Reservation[]> {
    return this._http.get<Reservation[]>(`${this._managerUrl}/reservations`, {
      params: date ? { date } : {},
    });
  }

  seatReservation(id: number): Observable<Reservation> {
    return this._http.patch<Reservation>(`${this._managerUrl}/reservations/${id}/seat`, {});
  }

  completeReservation(id: number): Observable<Reservation> {
    return this._http.patch<Reservation>(`${this._managerUrl}/reservations/${id}/complete`, {});
  }

  markNoShow(id: number): Observable<Reservation> {
    return this._http.patch<Reservation>(`${this._managerUrl}/reservations/${id}/no-show`, {});
  }

  assignTable(id: number, tableId: number): Observable<Reservation> {
    return this._http.patch<Reservation>(`${this._managerUrl}/reservations/${id}/assign-table/${tableId}`, {});
  }

  getWaitlist(): Observable<WaitlistEntry[]> {
    return this._http.get<WaitlistEntry[]>(`${this._managerUrl}/waitlist`);
  }

  promoteWaitlistEntry(id: number): Observable<void> {
    return this._http.post<void>(`${this._managerUrl}/waitlist/${id}/promote`, {});
  }

  cancelWaitlistEntry(id: number): Observable<WaitlistEntry> {
    return this._http.delete<WaitlistEntry>(`${this._managerUrl}/waitlist/${id}/cancel`);
  }

  getStats(date?: string): Observable<DailyStats> {
    return this._http.get<DailyStats>(`${this._managerUrl}/stats`, {
      params: date ? { date } : {},
    });
  }

  // ── Rooms & tables ──────────────────────────────────────────────────────

  getRooms(): Observable<Room[]> {
    return this._http.get<Room[]>(`${environment.apiUrl}/api/rooms`);
  }

  createRoom(request: CreateRoomRequest): Observable<Room> {
    return this._http.post<Room>(`${environment.apiUrl}/api/rooms`, request);
  }

  getTables(): Observable<TableInfo[]> {
    return this._http.get<TableInfo[]>(`${environment.apiUrl}/api/tables`);
  }

  getTablesByRoom(roomId: number): Observable<TableInfo[]> {
    return this._http.get<TableInfo[]>(`${environment.apiUrl}/api/tables/room/${roomId}`);
  }

  createTable(request: CreateTableRequest): Observable<TableInfo> {
    return this._http.post<TableInfo>(`${environment.apiUrl}/api/tables`, request);
  }

  updateTableStatus(id: number, status: TableStatus): Observable<TableInfo> {
    return this._http.patch<TableInfo>(`${environment.apiUrl}/api/tables/${id}/status`, null, {
      params: { status },
    });
  }
}
