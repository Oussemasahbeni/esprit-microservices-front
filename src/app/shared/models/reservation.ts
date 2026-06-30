export type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type WaitlistStatus = 'WAITING' | 'PROMOTED' | 'CANCELLED';
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
export type TableShape = 'ROUND' | 'SQUARE' | 'RECTANGLE';

export interface CustomerInfo {
  id: number | null;
  keycloakUserId: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface TableInfo {
  id: number;
  roomId: number | null;
  tableNumber: string;
  capacity: number;
  xPosition: number | null;
  yPosition: number | null;
  shape: TableShape;
  status: TableStatus;
  active: boolean;
}

export interface ReservationStatusHistoryEntry {
  oldStatus: ReservationStatus | null;
  newStatus: ReservationStatus;
  changedBy: string;
  reason: string | null;
  changedAt: string;
}

export interface PreOrderItem {
  menuDishId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
  stillAvailable: boolean;
}

export interface PreOrderItemRequest {
  dishId: number;
  quantity: number;
}

export interface Reservation {
  id: number;
  reservationCode: string;
  customer: CustomerInfo;
  table: TableInfo | null;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestsCount: number;
  status: ReservationStatus;
  source: string;
  specialRequests: string | null;
  cancellationReason: string | null;
  statusHistory: ReservationStatusHistoryEntry[];
  preOrderItems: PreOrderItem[];
  createdAt: string;
  updatedAt: string | null;
}

export interface WaitlistEntry {
  id: number;
  customer: CustomerInfo;
  requestedDate: string;
  requestedTime: string;
  guestsCount: number;
  status: WaitlistStatus;
  priority: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateReservationRequest {
  fullName: string;
  email: string;
  phone: string | null;
  keycloakUserId?: string | null;
  reservationDate: string;
  startTime: string;
  guestsCount: number;
  specialRequests?: string | null;
  preOrderItems?: PreOrderItemRequest[];
}

export interface BookingResult {
  success: boolean;
  staffWarning: boolean;
  reservation: Reservation | null;
  waitlistEntry: WaitlistEntry | null;
  message: string;
}

export interface MenuSnapshotDish {
  id: number;
  name: string;
  price: number;
  categoryName: string | null;
}

export interface MenuSnapshotPromotion {
  id: number;
  name: string;
  discountPercent: number;
  dishId: number | null;
  categoryId: number | null;
  startsAt: string;
  endsAt: string;
}

export interface MenuSnapshot {
  availableDishes: MenuSnapshotDish[];
  activePromotions: MenuSnapshotPromotion[];
}

export interface DailyStats {
  date: string;
  totalReservations: number;
  confirmedCount: number;
  seatedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  totalTablesCount: number;
  availableTablesRightNowCount: number;
}

export interface Room {
  id: number;
  name: string;
  description: string | null;
  floorNumber: number | null;
  active: boolean | null;
}

export interface CreateRoomRequest {
  name: string;
  description?: string | null;
  floorNumber?: number;
}

export interface CreateTableRequest {
  room: { id: number };
  tableNumber: string;
  capacity: number;
  xPosition?: number | null;
  yPosition?: number | null;
  shape: TableShape;
}
