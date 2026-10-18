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

export type ProductPreparationType = 'cocina_interna' | 'armado_menu';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  preparationType: ProductPreparationType; // 'cocina_interna': va a proceso de cocina interna (KDS); 'armado_menu': solo preparación de armado con el menú
  station: 'parrilla' | 'barra' | 'freidora' | 'pase' | 'ensamblado';
  isActive: boolean;
}

export interface ProductModifierSubstitute {
  id: string;
  name: string;
  targetProductId?: string;
  substituteProductId?: string; // ID del producto sustituto en catálogo
  priceDelta: number; // 0 = sin costo, > 0 = con costo
  isDefault?: boolean;
}

export interface MenuInternalProduct {
  id: string;
  order: number; // Orden de armado / jerarquía interna: 1, 2, 3...
  productId: string;
  productName: string;
  isRequired: boolean;
  defaultQuantity: number;
  modifiers: ProductModifierSubstitute[]; // Modificadores de estos por otros productos con costo o sin costo
}

export type ChannelPriceMode = 'base' | 'delta' | 'custom';

export interface ChannelPriceSetting {
  channelId: string;
  enabled: boolean;
  mode: ChannelPriceMode;
  delta: number; // Diferencia negativa o positiva por canal en base al precio base
  customPrice: number; // Precio distinto fijado por canal
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number; // e.g. 0.00, 0.10, 0.50
  isDefault?: boolean;
  preparationType?: ProductPreparationType;
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
  category: string; // Un menú debe estar en una categoría
  basePrice: number;
  // Channel prices or auto-multiplier
  channelPrices?: {
    mesa: number;
    llevar: number;
    delivery: number;
    [key: string]: number;
  };
  channelPricing?: Record<string, ChannelPriceSetting>;
  allowDiscounts?: boolean; // Puede estar habilitado para aplicarse descuentos o no
  internalProducts?: MenuInternalProduct[]; // Los productos internos tienen un orden y modificadores
  image: string;
  description: string;
  isAvailableOnMesa: boolean;
  isAvailableOnLlevar: boolean;
  isAvailableOnDelivery: boolean;
  station: 'parrilla' | 'barra' | 'freidora' | 'pase';
  modifierGroups?: ModifierGroup[];
  isActive?: boolean;
}

export interface SalesChannelConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  defaultPriceMode: ChannelPriceMode;
  defaultDelta: number;
  icon?: string;
  color?: string;
}

export interface RolePermissions {
  accessPos: boolean;
  accessKds: boolean;
  accessCashier: boolean;
  accessReports: boolean;
  accessConfig: boolean; // Acceso al sitio alterno de configuración
  canApplyDiscounts: boolean;
  canVoidItems: boolean;
  canOpenCashDrawer: boolean;
  canSplitBills: boolean;
  canJoinTables: boolean;
}

export interface RoleProfile {
  id: string;
  name: string;
  description: string;
  roleKey: UserRole | string;
  permissions: RolePermissions;
  userCount?: number;
}

export interface DiscountPolicy {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  requiresAuthorization: boolean;
  allowedRoles: string[];
  isActive: boolean;
  respectNonDiscountableMenus: boolean; // Si es true, respeta allowDiscounts del menú
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
  allowDiscounts?: boolean;
  preparationType?: ProductPreparationType;
  internalProductsSummary?: string[];
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
  invoiceId?: string;
}

export interface HistoricalInvoiceInternalProduct {
  order: number;
  productId: string;
  productName: string;
  preparationType: ProductPreparationType; // 'cocina_interna' | 'armado_menu'
  station?: string;
  selectedOptionName?: string;
  priceDelta?: number;
  isCostAdded?: boolean;
}

export interface HistoricalInvoiceItem {
  id: string;
  menuItemId: string;
  name: string; // Menú enviado (Combo / Menú principal)
  sku: string;
  category?: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  subtotal: number;
  allowDiscounts?: boolean;
  notes?: string;
  internalProducts: HistoricalInvoiceInternalProduct[]; // Sub detalle de productos internos
  selectedModifiers?: SelectedModifier[];
}

export interface HistoricalInvoiceHeader {
  documentNumber: string; // e.g. "FAC-2026-000104" o "TICK-000104"
  ticketNumber: number; // e.g. 104
  dateTime: string; // e.g. "17/10/2026 11:35:10"
  isoDate: string;
  cashierId: string;
  cashierName: string;
  waiterName?: string;
  salesChannel: SalesChannel;
  salesChannelLabel: string; // e.g. "Mesa #4 (Salón 1)", "Para Llevar", "Delivery (Uber Eats)"
  tableNumber?: number;
  salonName?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number; // Monto total
  totalCharged: number; // Monto cobrado
  changeGiven: number; // Cambio / Vuelto entregado
  paymentMethod: string; // e.g. "Efectivo", "Tarjeta Débito", "Mixto (Efectivo + Tarjeta)"
  paymentEntries: PaymentEntry[];
  discountApplied: boolean;
  discountPercentage: number;
  discountAmount: number;
  discountAuthorizedBy?: string;
}

export interface HistoricalInvoice {
  id: string;
  header: HistoricalInvoiceHeader;
  items: HistoricalInvoiceItem[];
  createdAt: string;
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
