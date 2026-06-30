import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendarCheck,
  lucideClock,
  lucideMinus,
  lucidePlus,
  lucideTriangleAlert,
  lucideUsers,
  lucideUtensils,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AuthService } from '../../../../core/auth/auth.service';
import { environment } from '../../../../../environments/environment';
import { BookingResult, CreateReservationRequest, MenuSnapshot } from '../../../../shared/models/reservation';
import { ReservationService } from '../../service/reservation.service';

@Component({
  selector: 'adm-book-reservation',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    TranslocoModule,
    HlmBadgeImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmIconImports,
    HlmInputImports,
    HlmTextareaImports,
  ],
  providers: [
    provideIcons({
      lucideCalendarCheck,
      lucideClock,
      lucideMinus,
      lucidePlus,
      lucideTriangleAlert,
      lucideUsers,
      lucideUtensils,
    }),
  ],
  templateUrl: './book-reservation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BookReservation {
  private readonly _reservationService = inject(ReservationService);
  private readonly _authService = inject(AuthService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly menuResource = httpResource<MenuSnapshot>(() => `${environment.apiUrl}/api/reservations/menu`);
  protected readonly availableDishes = computed(() => this.menuResource.value()?.availableDishes ?? []);
  protected readonly activePromotions = computed(() => this.menuResource.value()?.activePromotions ?? []);

  protected readonly preOrderQuantities = signal<Record<number, number>>({});
  protected readonly preOrderTotal = computed(() => {
    const quantities = this.preOrderQuantities();
    return this.availableDishes().reduce((sum, dish) => sum + (quantities[dish.id] ?? 0) * dish.price, 0);
  });

  protected readonly isSubmitting = signal(false);
  protected readonly bookingResult = signal<BookingResult | null>(null);

  protected readonly form = new FormGroup({
    fullName: new FormControl(this._authService.currentUser()?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    email: new FormControl(this._authService.currentUser()?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true }),
    reservationDate: new FormControl(this.toDateInput(new Date()), { nonNullable: true, validators: [Validators.required] }),
    startTime: new FormControl('19:00', { nonNullable: true, validators: [Validators.required] }),
    guestsCount: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(20)] }),
    specialRequests: new FormControl('', { nonNullable: true }),
  });

  protected dishQuantity(dishId: number): number {
    return this.preOrderQuantities()[dishId] ?? 0;
  }

  protected adjustQuantity(dishId: number, delta: number): void {
    this.preOrderQuantities.update((current) => {
      const next = Math.max(0, (current[dishId] ?? 0) + delta);
      return { ...current, [dishId]: next };
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.bookingResult.set(null);

    const raw = this.form.getRawValue();
    const preOrderItems = Object.entries(this.preOrderQuantities())
      .filter(([, quantity]) => quantity > 0)
      .map(([dishId, quantity]) => ({ dishId: Number(dishId), quantity }));

    const request: CreateReservationRequest = {
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone || null,
      reservationDate: raw.reservationDate,
      startTime: raw.startTime,
      guestsCount: raw.guestsCount,
      specialRequests: raw.specialRequests || null,
      preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
    };

    this._reservationService.createReservation(request).subscribe({
      next: (result) => {
        this.bookingResult.set(result);
        this.isSubmitting.set(false);
        this.preOrderQuantities.set({});
        toast.success(
          this._transloco.translate(result.success ? 'reservations.toast.confirmed' : 'reservations.toast.waitlisted'),
        );
      },
      error: () => {
        this.isSubmitting.set(false);
        toast.error(this._transloco.translate('common.error'));
      },
    });
  }

  private toDateInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
  }
}
