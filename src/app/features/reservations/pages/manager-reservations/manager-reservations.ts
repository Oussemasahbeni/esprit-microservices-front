import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideClock,
  lucideRefreshCcw,
  lucideUserX,
  lucideUtensils,
  lucideX,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { environment } from '../../../../../environments/environment';
import { DailyStats, Reservation, ReservationStatus, WaitlistEntry } from '../../../../shared/models/reservation';
import { ReservationService } from '../../service/reservation.service';

const STATUS_VARIANT: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CONFIRMED: 'default',
  SEATED: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

@Component({
  selector: 'adm-manager-reservations',
  imports: [TranslocoModule, HlmBadgeImports, HlmButtonImports, HlmIconImports, HlmInputImports],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideClock,
      lucideRefreshCcw,
      lucideUserX,
      lucideUtensils,
      lucideX,
    }),
  ],
  templateUrl: './manager-reservations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ManagerReservations {
  private readonly _reservationService = inject(ReservationService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly selectedDate = signal(this.toDateInput(new Date()));

  protected readonly reservationsResource = httpResource<Reservation[]>(
    () => `${environment.apiUrl}/api/manager/reservations?date=${this.selectedDate()}`,
  );

  protected readonly statsResource = httpResource<DailyStats>(
    () => `${environment.apiUrl}/api/manager/stats?date=${this.selectedDate()}`,
  );

  protected readonly waitlist = signal<WaitlistEntry[]>([]);
  protected readonly busyId = signal<number | null>(null);
  protected readonly assignTableInput = signal<Record<number, string>>({});

  constructor() {
    this.refreshWaitlist();
  }

  protected statusVariant(status: ReservationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    return STATUS_VARIANT[status];
  }

  protected setDate(event: Event): void {
    this.selectedDate.set((event.target as HTMLInputElement).value);
  }

  protected refresh(): void {
    this.reservationsResource.reload();
    this.statsResource.reload();
    this.refreshWaitlist();
  }

  protected refreshWaitlist(): void {
    this._reservationService.getWaitlist().subscribe({
      next: (entries) => this.waitlist.set(entries),
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected seat(reservation: Reservation): void {
    this.runAction(reservation.id, this._reservationService.seatReservation(reservation.id));
  }

  protected complete(reservation: Reservation): void {
    this.runAction(reservation.id, this._reservationService.completeReservation(reservation.id));
  }

  protected noShow(reservation: Reservation): void {
    this.runAction(reservation.id, this._reservationService.markNoShow(reservation.id));
  }

  protected setAssignTableInput(reservationId: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.assignTableInput.update((current) => ({ ...current, [reservationId]: value }));
  }

  protected assignTable(reservation: Reservation): void {
    const tableId = Number(this.assignTableInput()[reservation.id]);
    if (!tableId) {
      return;
    }
    this.runAction(reservation.id, this._reservationService.assignTable(reservation.id, tableId));
  }

  protected promoteWaitlistEntry(entry: WaitlistEntry): void {
    this._reservationService.promoteWaitlistEntry(entry.id).subscribe({
      next: () => {
        toast.success(this._transloco.translate('reservations.toast.waitlistPromoted'));
        this.refresh();
      },
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected cancelWaitlistEntry(entry: WaitlistEntry): void {
    this._reservationService.cancelWaitlistEntry(entry.id).subscribe({
      next: () => {
        toast.success(this._transloco.translate('reservations.toast.waitlistCancelled'));
        this.refreshWaitlist();
      },
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected reservationTrack(_: number, reservation: Reservation): number {
    return reservation.id;
  }

  protected waitlistTrack(_: number, entry: WaitlistEntry): number {
    return entry.id;
  }

  private runAction(reservationId: number, action$: Observable<Reservation>): void {
    this.busyId.set(reservationId);
    action$.subscribe({
      next: () => {
        this.busyId.set(null);
        this.refresh();
      },
      error: () => {
        this.busyId.set(null);
        toast.error(this._transloco.translate('common.error'));
      },
    });
  }

  private toDateInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
  }
}
