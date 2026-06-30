import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { Reservation, ReservationStatus } from '../../../../shared/models/reservation';
import { ReservationService } from '../../service/reservation.service';

const STATUS_VARIANT: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CONFIRMED: 'default',
  SEATED: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  NO_SHOW: 'destructive',
};

/**
 * Lets a guest (no account / not logged in) look up their booking by confirmation code —
 * the code is handed out in the booking confirmation, this is the only way back to it
 * without "My reservations" (which requires being signed in).
 */
@Component({
  selector: 'adm-lookup-reservation',
  imports: [ReactiveFormsModule, TranslocoModule, HlmBadgeImports, HlmButtonImports, HlmFieldImports, HlmIconImports, HlmInputImports],
  providers: [provideIcons({ lucideSearch })],
  templateUrl: './lookup-reservation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LookupReservation {
  private readonly _reservationService = inject(ReservationService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly isSearching = signal(false);
  protected readonly notFound = signal(false);
  protected readonly result = signal<Reservation | null>(null);

  protected readonly form = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected statusVariant(status: ReservationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    return STATUS_VARIANT[status];
  }

  protected search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSearching.set(true);
    this.notFound.set(false);
    this.result.set(null);

    this._reservationService.getReservationByCode(this.form.controls.code.value.trim()).subscribe({
      next: (reservation) => {
        this.result.set(reservation);
        this.isSearching.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isSearching.set(false);
      },
    });
  }
}
