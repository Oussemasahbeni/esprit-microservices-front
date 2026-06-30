import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucideDoorOpen, lucidePlus, lucideTable2 } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { Room, TableInfo, TableShape, TableStatus } from '../../../../shared/models/reservation';
import { ReservationService } from '../../service/reservation.service';

const STATUS_VARIANT: Record<TableStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  RESERVED: 'secondary',
  OCCUPIED: 'destructive',
};

@Component({
  selector: 'adm-tables-rooms',
  imports: [ReactiveFormsModule, TranslocoModule, HlmBadgeImports, HlmButtonImports, HlmFieldImports, HlmIconImports, HlmInputImports],
  providers: [provideIcons({ lucideDoorOpen, lucidePlus, lucideTable2 })],
  templateUrl: './tables-rooms.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TablesRooms {
  private readonly _reservationService = inject(ReservationService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly statusOptions: TableStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED'];

  protected readonly rooms = signal<Room[]>([]);
  protected readonly tables = signal<TableInfo[]>([]);
  protected readonly selectedRoomId = signal<number | null>(null);

  protected readonly tablesInSelectedRoom = computed(() => {
    const roomId = this.selectedRoomId();
    return roomId == null ? this.tables() : this.tables().filter((table) => table.roomId === roomId);
  });

  protected readonly showRoomForm = signal(false);
  protected readonly showTableForm = signal(false);

  protected readonly roomForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true }),
    floorNumber: new FormControl(0, { nonNullable: true }),
  });

  protected readonly tableForm = new FormGroup({
    roomId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    tableNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(30)] }),
    capacity: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    shape: new FormControl<TableShape>('ROUND', { nonNullable: true }),
  });

  constructor() {
    this.refresh();
  }

  protected statusVariant(status: TableStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    return STATUS_VARIANT[status];
  }

  protected selectRoom(roomId: number | null): void {
    this.selectedRoomId.set(roomId);
  }

  protected refresh(): void {
    this._reservationService.getRooms().subscribe({
      next: (rooms) => this.rooms.set(rooms),
      error: () => toast.error(this._transloco.translate('common.error')),
    });
    this._reservationService.getTables().subscribe({
      next: (tables) => this.tables.set(tables),
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected toggleRoomForm(): void {
    this.showRoomForm.update((value) => !value);
    this.roomForm.reset({ name: '', description: '', floorNumber: 0 });
  }

  protected toggleTableForm(): void {
    this.showTableForm.update((value) => !value);
    this.tableForm.reset({ roomId: this.selectedRoomId(), tableNumber: '', capacity: 2, shape: 'ROUND' });
  }

  protected saveRoom(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }
    const raw = this.roomForm.getRawValue();
    this._reservationService
      .createRoom({ name: raw.name, description: raw.description || null, floorNumber: raw.floorNumber })
      .subscribe({
        next: () => {
          toast.success(this._transloco.translate('reservations.tables.toast.roomCreated'));
          this.showRoomForm.set(false);
          this.refresh();
        },
        error: () => toast.error(this._transloco.translate('common.error')),
      });
  }

  protected saveTable(): void {
    if (this.tableForm.invalid) {
      this.tableForm.markAllAsTouched();
      return;
    }
    const raw = this.tableForm.getRawValue();
    this._reservationService
      .createTable({
        room: { id: raw.roomId! },
        tableNumber: raw.tableNumber,
        capacity: raw.capacity,
        shape: raw.shape,
      })
      .subscribe({
        next: () => {
          toast.success(this._transloco.translate('reservations.tables.toast.tableCreated'));
          this.showTableForm.set(false);
          this.refresh();
        },
        error: () => toast.error(this._transloco.translate('common.error')),
      });
  }

  protected setTableStatus(table: TableInfo, status: TableStatus): void {
    this._reservationService.updateTableStatus(table.id, status).subscribe({
      next: () => {
        toast.success(this._transloco.translate('reservations.tables.toast.statusUpdated'));
        this.refresh();
      },
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected roomTrack(_: number, room: Room): number {
    return room.id;
  }

  protected tableTrack(_: number, table: TableInfo): number {
    return table.id;
  }
}
