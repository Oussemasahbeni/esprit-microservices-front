import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryRequest, Dish, DishRequest, MenuCategory, MenuResponse, Promotion, PromotionRequest } from '../../../shared/models/menu';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = `${environment.apiUrl}/api/menus`;

  getMenu(): Observable<MenuResponse> {
    return this._http.get<MenuResponse>(this._apiUrl);
  }

  createDish(request: DishRequest): Observable<Dish> {
    return this._http.post<Dish>(`${this._apiUrl}/dishes`, request);
  }

  updateDish(id: number, request: DishRequest): Observable<Dish> {
    return this._http.put<Dish>(`${this._apiUrl}/dishes/${id}`, request);
  }

  deleteDish(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/dishes/${id}`);
  }

  updateDishAvailability(id: number, available: boolean): Observable<Dish> {
    return this._http.patch<Dish>(`${this._apiUrl}/dishes/${id}/availability`, { available });
  }

  createCategory(request: CategoryRequest): Observable<MenuCategory> {
    return this._http.post<MenuCategory>(`${this._apiUrl}/categories`, request);
  }

  createPromotion(request: PromotionRequest): Observable<Promotion> {
    return this._http.post<Promotion>(`${this._apiUrl}/promotions`, request);
  }
}
