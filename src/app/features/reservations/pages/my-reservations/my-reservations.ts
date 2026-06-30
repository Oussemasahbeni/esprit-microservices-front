import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendarX,
  lucideCircleCheck,
  lucideClipboardList,
  lucideClock,
  lucideUtensils,
  lucideX,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Reservation, ReservationStatus } from '../../../../shared/models/reservation';
import { ReservationService } from '../../service/reservation.service';

const STATUS_VARIANT: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CONFIRMED: 'default',
  SEATED: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

@Component({
  selector: 'adm-my-reservations',
  imports: [DatePipe, TranslocoModule, HlmBadgeImports, HlmButtonImports, HlmIconImports],
  providers: [
    provideIcons({ lucideCalendarX, lucideCircleCheck, lucideClipboardList, lucideClock, lucideUtensils, lucideX }),
  ],
  templateUrl: './my-reservations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MyReservations {
  private readonly _reservationService = inject(ReservationService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly cancellingId = signal<number | null>(null);

  constructor() {
    this.refresh();
  }

  protected statusVariant(status: ReservationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    return STATUS_VARIANT[status];
  }

  protected canCancel(reservation: Reservation): boolean {
    return reservation.status === 'CONFIRMED';
  }

  protected refresh(): void {
    this.isLoading.set(true);
    this._reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error(this._transloco.translate('common.error'));
      },
    });
  }

  protected cancel(reservation: Reservation): void {
    if (!confirm(this._transloco.translate('reservations.my.confirmCancel', { code: reservation.reservationCode }))) {
      return;
    }
    this.cancellingId.set(reservation.id);
    this._reservationService.cancelReservation(reservation.id).subscribe({
      next: () => {
        toast.success(this._transloco.translate('reservations.toast.cancelled'));
        this.cancellingId.set(null);
        this.refresh();
      },
      error: () => {
        this.cancellingId.set(null);
        toast.error(this._transloco.translate('common.error'));
      },
    });
  }

  protected reservationTrack(_: number, reservation: Reservation): number {
    return reservation.id;
  }
}
