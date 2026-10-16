/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'mesero' | 'cajero' | 'chef' | 'gerente';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatar: string;
  device: string;
}

export type SalesChannel = 'mesa' | 'llevar' | 'delivery';

export type TableStatus =
  | 'libre'
  | 'ocupada'
  | 'precuenta'
  | 'limpieza'
  | 'reservada'
  | 'Available'
  | 'Occupied'
  | 'Cleaning'
  | 'Reserved';

export interface Table {
  id: string;
  number: number;
  salonId: string;
  salonName: string;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  waiterId?: string;
  waiterName?: string;
  totalAmount?: number;
  guestsCount?: number;
  openedAt?: string;
  reservationInfo?: {
    customerName: string;
    time: string;
    partySize: number;
    phone?: string;
  };
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number; // e.g. 0.00, 0.10, 0.50
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string; // e.g., 'CARNE', 'PAPAS', 'BEBIDA'
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  category: 'principal' | 'hamburguesas' | 'cenas' | 'promos' | 'bebidas' | 'postres';
  basePrice: number;
  // Channel prices or auto-multiplier
  channelPrices?: {
    mesa: number;
    llevar: number;
    delivery: number;
  };
  image: string;
  description: string;
  isAvailableOnMesa: boolean;
  isAvailableOnLlevar: boolean;
  isAvailableOnDelivery: boolean;
  station: 'parrilla' | 'barra' | 'freidora' | 'pase';
  modifierGroups?: ModifierGroup[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  sku: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  notes?: string;
  selectedModifiers: SelectedModifier[];
  station: 'parrilla' | 'barra' | 'freidora' | 'pase';
  status: 'en_cola' | 'preparando' | 'listo' | 'entregado';
  subtotal: number;
  assignedGuestName?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  channel: SalesChannel;
  platformName?: 'Uber Eats' | 'Glovo' | 'Rappi';
  tableId?: string;
  tableNumber?: number;
  salonName?: string;
  status: 'abierta' | 'en_cocina' | 'lista_para_servir' | 'en_precuenta' | 'cobrada' | 'cancelada';
  items: OrderItem[];
  waiterId: string;
  waiterName: string;
  createdAt: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  discountAuthorizedBy?: string;
  taxAmount: number;
  total: number;
  notes?: string;
  // Split bill status if any
  splitBills?: SplitSubBill[];
}

export interface SplitSubBill {
  id: string;
  guestName: string;
  itemIds: string[]; // references order item IDs or allocated counts
  subtotal: number;
  tax: number;
  total: number;
  paid: boolean;
  paymentMethod?: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'vales' | 'transferencia';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: number;
  cashierId: string;
  cashierName: string;
  channel: SalesChannel;
  totalAmount: number;
  tenderedEntries: PaymentEntry[];
  totalTendered: number;
  changeGiven: number;
  timestamp: string;
}

export interface CashShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashSales: number;
  cardSales: number;
  voucherSales: number;
  transferSales: number;
  totalSales: number;
  expectedCashInDrawer: number;
  actualCashInDrawer?: number;
  difference?: number;
  status: 'abierto' | 'cerrado';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'CREAR_ORDEN'
    | 'EDITAR_ORDEN'
    | 'CANCELAR_ORDEN'
    | 'APLICAR_DESCUENTO'
    | 'ELIMINAR_ITEM'
    | 'UNIR_MESAS'
    | 'DIVIDIR_CUENTA'
    | 'CORTE_CAJA'
    | 'CIERRE_CAJA'
    | 'REASIGNAR_MESA'
    | 'CAMBIAR_ESTADO_MESA';
  description: string;
  supervisorName?: string;
  metadata?: Record<string, any>;
}

export interface SprintUserStory {
  id: string;
  code: string; // CU-01, CU-02, etc.
  persona: 'Sofia (Mesera)' | 'Carlos (Cajero)' | 'Chef Rodrigo (Cocina)' | 'Elena (Gerente)';
  title: string;
  description: string;
  storyPoints: number;
  status: 'done' | 'in_progress' | 'backlog';
  acceptanceCriteria: string[];
  dayAssigned: number;
}
