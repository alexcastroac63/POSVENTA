/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  SalesChannel,
  Table,
  MenuItem,
  OrderItem,
  Order,
  SelectedModifier,
  PaymentEntry,
  PaymentTransaction,
  CashShift,
  AuditLog,
  SplitSubBill,
  SprintUserStory,
  ProductItem,
  SalesChannelConfig,
  RoleProfile,
  RolePermissions,
  DiscountPolicy,
} from '../types/restaurant';
import {
  INITIAL_USERS,
  INITIAL_TABLES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CASH_SHIFT,
  INITIAL_AUDIT_LOGS,
  INITIAL_SPRINT_STORIES,
  INITIAL_PRODUCTS,
  INITIAL_CHANNELS,
  INITIAL_PROFILES,
  INITIAL_DISCOUNTS,
} from '../data/initialData';

export type ActiveScreen =
  | 'login'
  | 'admin_config'
  | 'channel_select'
  | 'table_map'
  | 'pos_order'
  | 'kds'
  | 'cashier'
  | 'reports'
  | 'sprint_devops';

export type DeviceMode = 'responsive' | 'tablet' | 'all_in_one' | 'kds_monitor';

interface RestaurantContextType {
  // Session & Devices
  currentUser: User;
  setCurrentUser: (user: User) => void;
  branch: string;
  setBranch: (branch: string) => void;
  terminalId: string;
  setTerminalId: (id: string) => void;
  currentScreen: ActiveScreen;
  setCurrentScreen: (screen: ActiveScreen) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;

  // Channel & Tables
  selectedChannel: SalesChannel;
  setSelectedChannel: (channel: SalesChannel) => void;
  deliveryPlatform: 'Uber Eats' | 'Glovo' | 'Rappi';
  setDeliveryPlatform: (platform: 'Uber Eats' | 'Glovo' | 'Rappi') => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;

  // Catalog & Cart
  menuItems: MenuItem[];
  activeCartItems: OrderItem[];
  setActiveCartItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  cartNotes: string;
  setCartNotes: (notes: string) => void;
  discountPercentage: number;
  setDiscountPercentage: (discount: number) => void;
  discountAuthorizedBy: string | null;
  setDiscountAuthorizedBy: (supervisor: string | null) => void;

  // Modals & Subflows
  modifierModalItem: MenuItem | null;
  setModifierModalItem: (item: MenuItem | null) => void;
  showSplitModal: boolean;
  setShowSplitModal: (show: boolean) => void;
  showPreBillModal: boolean;
  setShowPreBillModal: (show: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  showDiscountAuthModal: boolean;
  setShowDiscountAuthModal: (show: boolean) => void;
  showJoinTablesModal: boolean;
  setShowJoinTablesModal: (show: boolean) => void;

  // Orders & State
  orders: Order[];
  activeOrder: Order | null;
  cashShift: CashShift;
  auditLogs: AuditLog[];
  sprintStories: SprintUserStory[];

  // Actions
  login: (user: User) => void;
  logout: () => void;
  startChannelOrder: (channel: SalesChannel, platform?: 'Uber Eats' | 'Glovo' | 'Rappi') => void;
  openTableOrder: (table: Table) => void;
  addItemToCart: (item: MenuItem, modifiers?: SelectedModifier[], notes?: string, guestName?: string) => void;
  updateCartItemQty: (itemId: string, delta: number) => void;
  removeCartItem: (itemId: string) => void;
  sendOrderToKitchen: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateItemKitchenStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  applyDiscount: (percentage: number, supervisorName: string) => void;
  processPayment: (tenderEntries: PaymentEntry[]) => PaymentTransaction | null;
  splitBillByGuests: (splits: SplitSubBill[]) => void;
  joinTables: (sourceId: string, targetId: string) => void;
  reassignTableWaiter: (tableId: string, newWaiterName: string) => void;
  performCashCut: (amountCounted: number) => void;
  closeDailyShift: (actualCash: number) => void;
  addAuditLog: (action: AuditLog['action'], description: string, supervisor?: string, metadata?: any) => void;

  // Helpers
  getEffectivePrice: (item: MenuItem, channel: SalesChannel) => number;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Backoffice Master Configuration
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  saveProduct: (product: ProductItem) => void;
  deleteProduct: (productId: string) => void;

  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  saveMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;

  salesChannels: SalesChannelConfig[];
  setSalesChannels: React.Dispatch<React.SetStateAction<SalesChannelConfig[]>>;
  saveSalesChannel: (channel: SalesChannelConfig) => void;
  toggleChannelActive: (channelId: string) => void;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  saveUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  profiles: RoleProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<RoleProfile[]>>;
  saveProfile: (profile: RoleProfile) => void;
  toggleProfilePermission: (profileId: string, permKey: keyof RolePermissions) => void;

  discountPolicies: DiscountPolicy[];
  setDiscountPolicies: React.Dispatch<React.SetStateAction<DiscountPolicy[]>>;
  saveDiscountPolicy: (policy: DiscountPolicy) => void;
  deleteDiscountPolicy: (policyId: string) => void;

  hasPermission: (permissionKey: keyof RolePermissions) => boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Sofia by default
  const [branch, setBranch] = useState<string>('Sucursal Central #01');
  const [terminalId, setTerminalId] = useState<string>('POS-TERM-01');
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('login');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');

  const [selectedChannel, setSelectedChannel] = useState<SalesChannel>('mesa');
  const [deliveryPlatform, setDeliveryPlatform] = useState<'Uber Eats' | 'Glovo' | 'Rappi'>('Uber Eats');
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Backoffice States
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [salesChannels, setSalesChannels] = useState<SalesChannelConfig[]>(INITIAL_CHANNELS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [profiles, setProfiles] = useState<RoleProfile[]>(INITIAL_PROFILES);
  const [discountPolicies, setDiscountPolicies] = useState<DiscountPolicy[]>(INITIAL_DISCOUNTS);

  const [activeCartItems, setActiveCartItems] = useState<OrderItem[]>([]);
  const [cartNotes, setCartNotes] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountAuthorizedBy, setDiscountAuthorizedBy] = useState<string | null>(null);

  const [modifierModalItem, setModifierModalItem] = useState<MenuItem | null>(null);
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);
  const [showPreBillModal, setShowPreBillModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showDiscountAuthModal, setShowDiscountAuthModal] = useState<boolean>(false);
  const [showJoinTablesModal, setShowJoinTablesModal] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cashShift, setCashShift] = useState<CashShift>(INITIAL_CASH_SHIFT);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [sprintStories] = useState<SprintUserStory[]>(INITIAL_SPRINT_STORIES);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Helper to determine price based on channel configuration (base, delta, custom)
  const getEffectivePrice = (item: MenuItem, channel: SalesChannel): number => {
    // 1. Detailed channelPricing configuration
    if (item.channelPricing && item.channelPricing[channel]) {
      const setting = item.channelPricing[channel];
      if (setting.mode === 'custom' && typeof setting.customPrice === 'number' && setting.customPrice > 0) {
        return setting.customPrice;
      }
      if (setting.mode === 'delta' && typeof setting.delta === 'number') {
        return Math.max(0, +(item.basePrice + setting.delta).toFixed(2));
      }
      if (setting.mode === 'base') {
        return item.basePrice;
      }
    }

    // 2. Fallback to channelPrices dictionary
    if (item.channelPrices && item.channelPrices[channel] !== undefined) {
      return item.channelPrices[channel];
    }

    // 3. Fallback to channel defaults
    const channelConfig = salesChannels.find((c) => c.id === channel);
    if (channelConfig) {
      if (channelConfig.defaultPriceMode === 'delta') {
        return Math.max(0, +(item.basePrice + channelConfig.defaultDelta).toFixed(2));
      }
    }

    if (channel === 'delivery') {
      return +(item.basePrice * 1.18).toFixed(2);
    }
    if (channel === 'llevar') {
      return +(item.basePrice * 0.95).toFixed(2);
    }
    return item.basePrice;
  };

  const addAuditLog = (
    action: AuditLog['action'],
    description: string,
    supervisor?: string,
    metadata?: any
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      description,
      supervisorName: supervisor,
      metadata,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'chef') {
      setCurrentScreen('kds');
      setDeviceMode('kds_monitor');
    } else if (user.role === 'cajero') {
      setCurrentScreen('channel_select');
      setDeviceMode('all_in_one');
    } else if (user.role === 'gerente') {
      setCurrentScreen('reports');
    } else {
      setCurrentScreen('channel_select');
      setDeviceMode('tablet');
    }
    showToast(`Bienvenido/a, ${user.name} (${user.role.toUpperCase()})`);
  };

  const logout = () => {
    setCurrentScreen('login');
    setActiveCartItems([]);
    setSelectedTable(null);
    showToast('Sesión cerrada correctamente');
  };

  const startChannelOrder = (channel: SalesChannel, platform?: 'Uber Eats' | 'Glovo' | 'Rappi') => {
    setSelectedChannel(channel);
    if (platform) setDeliveryPlatform(platform);

    if (channel === 'mesa') {
      setCurrentScreen('table_map');
    } else {
      setSelectedTable(null);
      setActiveCartItems([]);
      setDiscountPercentage(0);
      setDiscountAuthorizedBy(null);
      setCurrentScreen('pos_order');
      showToast(`Canal seleccionado: ${channel.toUpperCase()} ${platform ? `(${platform})` : ''}`);
    }
  };

  const openTableOrder = (table: Table) => {
    setSelectedTable(table);
    setSelectedChannel('mesa');

    // If table already has an active order, load its items
    const existingOrder = orders.find(
      (o) =>
        (o.tableId === table.id || (table.currentOrderId && o.id === table.currentOrderId)) &&
        ['abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta'].includes(o.status)
    );

    if (existingOrder) {
      setActiveCartItems([...existingOrder.items]);
      setCartNotes(existingOrder.notes || '');
      setDiscountPercentage(existingOrder.discountPercentage || 0);
      setDiscountAuthorizedBy(existingOrder.discountAuthorizedBy || null);
    } else {
      setActiveCartItems([]);
      setCartNotes('');
      setDiscountPercentage(0);
      setDiscountAuthorizedBy(null);
    }

    setCurrentScreen('pos_order');
  };

  const addItemToCart = (
    item: MenuItem,
    modifiers: SelectedModifier[] = [],
    notes: string = '',
    guestName?: string
  ) => {
    const baseUnitPrice = getEffectivePrice(item, selectedChannel);
    const modifiersDelta = modifiers.reduce((acc, m) => acc + (m.priceDelta || 0), 0);
    const finalUnitPrice = +(baseUnitPrice + modifiersDelta).toFixed(2);

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: item.id,
      name: item.name,
      sku: item.sku,
      basePrice: baseUnitPrice,
      unitPrice: finalUnitPrice,
      quantity: 1,
      notes,
      selectedModifiers: modifiers,
      station: item.station,
      status: 'en_cola',
      subtotal: finalUnitPrice,
      assignedGuestName: guestName || (selectedTable ? `Comensal 1` : undefined),
      allowDiscounts: item.allowDiscounts !== false,
      internalProductsSummary: item.internalProducts?.map(
        (p) => `${p.order}. ${p.productName}`
      ),
    };

    setActiveCartItems((prev) => [...prev, newItem]);
    showToast(`Agregado: ${item.name}`);
  };

  const updateCartItemQty = (itemId: string, delta: number) => {
    setActiveCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: +(newQty * item.unitPrice).toFixed(2),
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeCartItem = (itemId: string) => {
    const itemToRemove = activeCartItems.find((i) => i.id === itemId);
    setActiveCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (itemToRemove) {
      addAuditLog('ELIMINAR_ITEM', `Ítem removido de comanda: ${itemToRemove.name}`);
      showToast(`Removido: ${itemToRemove.name}`);
    }
  };

  const sendOrderToKitchen = () => {
    if (activeCartItems.length === 0) {
      showToast('No hay productos en la comanda');
      return;
    }

    const subtotal = activeCartItems.reduce((acc, item) => acc + item.subtotal, 0);
    // Solo aplica descuento a ítems habilitados para descuento
    const discountableSubtotal = activeCartItems
      .filter((item) => item.allowDiscounts !== false)
      .reduce((acc, item) => acc + item.subtotal, 0);
    const discAmount = +(discountableSubtotal * (discountPercentage / 100)).toFixed(2);
    const taxable = subtotal - discAmount;
    const taxAmount = +(taxable * 0.10).toFixed(2); // 10% IVA
    const total = +(taxable + taxAmount).toFixed(2);

    let existingOrder = selectedTable
      ? orders.find(
          (o) =>
            o.tableId === selectedTable.id &&
            ['abierta', 'en_cocina', 'en_precuenta'].includes(o.status)
        )
      : null;

    if (existingOrder) {
      // Update existing order with newly added items
      const updatedOrder: Order = {
        ...existingOrder,
        items: activeCartItems.map((i) => ({
          ...i,
          status: i.status === 'en_cola' ? 'preparando' : i.status,
        })),
        subtotal,
        discountPercentage,
        discountAmount: discAmount,
        discountAuthorizedBy: discountAuthorizedBy || undefined,
        taxAmount,
        total,
        notes: cartNotes,
        status: 'en_cocina',
      };

      setOrders((prev) => prev.map((o) => (o.id === existingOrder!.id ? updatedOrder : o)));
      addAuditLog(
        'EDITAR_ORDEN',
        `Orden #${updatedOrder.orderNumber} actualizada con nuevos platillos para ${selectedTable?.salonName} - Mesa ${selectedTable?.number}`
      );
    } else {
      const orderNumber = 100 + orders.length + 1;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        channel: selectedChannel,
        platformName: selectedChannel === 'delivery' ? deliveryPlatform : undefined,
        tableId: selectedTable?.id,
        tableNumber: selectedTable?.number,
        salonName: selectedTable?.salonName,
        status: 'en_cocina',
        items: activeCartItems.map((i) => ({ ...i, status: 'preparando' })),
        waiterId: currentUser.id,
        waiterName: currentUser.name,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subtotal,
        discountPercentage,
        discountAmount: discAmount,
        discountAuthorizedBy: discountAuthorizedBy || undefined,
        taxAmount,
        total,
        notes: cartNotes,
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (selectedTable) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === selectedTable.id
              ? {
                  ...t,
                  status: 'ocupada',
                  totalAmount: total,
                  waiterName: currentUser.name,
                  openedAt: newOrder.createdAt,
                  currentOrderId: newOrder.id,
                }
              : t
          )
        );
      }

      addAuditLog(
        'CREAR_ORDEN',
        `Nueva comanda #${orderNumber} enviada a cocina [${selectedChannel.toUpperCase()}] ${
          selectedTable ? `Mesa ${selectedTable.number}` : ''
        }`
      );
    }

    showToast('¡Comanda transmitida a cocina con éxito!');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const updateItemKitchenStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((i) => (i.id === itemId ? { ...i, status } : i));
          const allReady = updatedItems.every((i) => i.status === 'listo' || i.status === 'entregado');
          return {
            ...o,
            items: updatedItems,
            status: allReady ? 'lista_para_servir' : o.status,
          };
        }
        return o;
      })
    );
    showToast(`Ítem actualizado a: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const applyDiscount = (percentage: number, supervisorName: string) => {
    setDiscountPercentage(percentage);
    setDiscountAuthorizedBy(supervisorName);
    addAuditLog(
      'APLICAR_DESCUENTO',
      `Descuento de ${percentage}% aplicado en comanda actual`,
      supervisorName,
      { percentage }
    );
    showToast(`Descuento de ${percentage}% autorizado por ${supervisorName}`);
  };

  // Find active order for current context
  const activeOrder = selectedTable
    ? orders.find(
        (o) =>
          o.tableId === selectedTable.id &&
          ['abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta'].includes(o.status)
      ) || null
    : orders.find((o) => o.status === 'en_cocina') || null;

  const processPayment = (tenderEntries: PaymentEntry[]): PaymentTransaction | null => {
    const targetOrder = activeOrder;
    if (!targetOrder) {
      showToast('No hay una orden activa para procesar cobro');
      return null;
    }

    const totalTendered = tenderEntries.reduce((acc, t) => acc + t.amount, 0);
    if (totalTendered < targetOrder.total) {
      showToast('El monto abonado es insuficiente');
      return null;
    }

    const changeGiven = +(totalTendered - targetOrder.total).toFixed(2);

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      channel: targetOrder.channel,
      totalAmount: targetOrder.total,
      tenderedEntries: tenderEntries,
      totalTendered,
      changeGiven,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Mark order as paid
    setOrders((prev) =>
      prev.map((o) => (o.id === targetOrder.id ? { ...o, status: 'cobrada' } : o))
    );

    // Free the table
    if (targetOrder.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === targetOrder.tableId
            ? {
                ...t,
                status: 'limpieza',
                totalAmount: undefined,
                currentOrderId: undefined,
                openedAt: undefined,
              }
            : t
        )
      );
    }

    // Update cash shift
    let cashSum = 0;
    let cardSum = 0;
    let voucherSum = 0;
    let transferSum = 0;

    tenderEntries.forEach((t) => {
      if (t.method === 'efectivo') cashSum += t.amount - changeGiven;
      if (t.method === 'tarjeta') cardSum += t.amount;
      if (t.method === 'vales') voucherSum += t.amount;
      if (t.method === 'transferencia') transferSum += t.amount;
    });

    setCashShift((prev) => ({
      ...prev,
      cashSales: +(prev.cashSales + Math.max(0, cashSum)).toFixed(2),
      cardSales: +(prev.cardSales + cardSum).toFixed(2),
      voucherSales: +(prev.voucherSales + voucherSum).toFixed(2),
      transferSales: +(prev.transferSales + transferSum).toFixed(2),
      totalSales: +(prev.totalSales + targetOrder.total).toFixed(2),
      expectedCashInDrawer: +(prev.expectedCashInDrawer + Math.max(0, cashSum)).toFixed(2),
    }));

    addAuditLog(
      'CORTE_CAJA',
      `Pago liquidado para Orden #${targetOrder.orderNumber} por $${targetOrder.total.toFixed(
        2
      )} (${tenderEntries.map((e) => `${e.method}: $${e.amount}`).join(', ')})`,
      undefined,
      { changeGiven, totalTendered }
    );

    setActiveCartItems([]);
    setSelectedTable(null);
    showToast(`¡Cobro exitoso! Vuelto: $${changeGiven.toFixed(2)}`);
    return transaction;
  };

  const splitBillByGuests = (splits: SplitSubBill[]) => {
    if (!activeOrder) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrder.id ? { ...o, splitBills: splits } : o))
    );
    addAuditLog(
      'DIVIDIR_CUENTA',
      `Cuenta dividida en ${splits.length} partes para Mesa ${activeOrder.tableNumber}`
    );
    showToast(`Cuenta dividida en ${splits.length} comensales`);
  };

  const joinTables = (sourceId: string, targetId: string) => {
    const source = tables.find((t) => t.id === sourceId);
    const target = tables.find((t) => t.id === targetId);
    if (!source || !target) return;

    // 1. Locate active orders for both tables
    const sourceOrder = orders.find(
      (o) =>
        (o.tableId === sourceId || (source.currentOrderId && o.id === source.currentOrderId)) &&
        ['abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta'].includes(o.status)
    );

    const targetOrder = orders.find(
      (o) =>
        (o.tableId === targetId || (target.currentOrderId && o.id === target.currentOrderId)) &&
        ['abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta'].includes(o.status)
    );

    let updatedOrders = [...orders];
    let consolidatedOrderId = targetOrder?.id || sourceOrder?.id;
    let finalTotal = +(
      (target.totalAmount || targetOrder?.total || 0) +
      (source.totalAmount || sourceOrder?.total || 0)
    ).toFixed(2);

    if (sourceOrder && targetOrder) {
      // Consolidate both orders' internal menus (items)
      const mergedSourceItems: OrderItem[] = sourceOrder.items.map((it, idx) => ({
        ...it,
        id: `${it.id}-from-m${source.number}-${Date.now()}-${idx}`,
        assignedGuestName: it.assignedGuestName
          ? `${it.assignedGuestName} (Mesa ${source.number})`
          : `Comensal Mesa ${source.number}`,
      }));

      const combinedItems = [...targetOrder.items, ...mergedSourceItems];
      const combinedSubtotal = +combinedItems
        .reduce((acc, it) => acc + (it.subtotal || it.unitPrice * it.quantity), 0)
        .toFixed(2);

      const combinedDiscountAmount = +(
        (targetOrder.discountAmount || 0) + (sourceOrder.discountAmount || 0)
      ).toFixed(2);

      const taxable = Math.max(0, +(combinedSubtotal - combinedDiscountAmount).toFixed(2));
      const combinedTax = +(taxable * 0.10).toFixed(2);
      const combinedTotal = +(taxable + combinedTax).toFixed(2);

      const mergedNotes = [
        targetOrder.notes,
        sourceOrder.notes ? `[De Mesa ${source.number}]: ${sourceOrder.notes}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const consolidatedTargetOrder: Order = {
        ...targetOrder,
        items: combinedItems,
        subtotal: combinedSubtotal,
        discountAmount: combinedDiscountAmount,
        taxAmount: combinedTax,
        total: combinedTotal,
        notes: mergedNotes,
        status:
          targetOrder.status === 'en_precuenta' || sourceOrder.status === 'en_precuenta'
            ? 'en_precuenta'
            : 'en_cocina',
      };

      finalTotal = combinedTotal;
      consolidatedOrderId = targetOrder.id;

      updatedOrders = updatedOrders.map((o) => {
        if (o.id === targetOrder.id) return consolidatedTargetOrder;
        if (o.id === sourceOrder.id) {
          return {
            ...o,
            status: 'cobrada' as const,
            notes: `${o.notes ? o.notes + ' | ' : ''}Unida a Mesa ${target.number} (Orden #${targetOrder.orderNumber})`,
          };
        }
        return o;
      });
    } else if (sourceOrder && !targetOrder) {
      // Transfer source order to target table
      const transferredOrder: Order = {
        ...sourceOrder,
        tableId: target.id,
        tableNumber: target.number,
        salonName: target.salonName,
      };
      consolidatedOrderId = transferredOrder.id;
      finalTotal = transferredOrder.total;

      updatedOrders = updatedOrders.map((o) => (o.id === sourceOrder.id ? transferredOrder : o));
    } else if (!sourceOrder && targetOrder) {
      // Target order has items, source table only had total amount
      if ((source.totalAmount || 0) > 0) {
        const sourceItemAmount = +((source.totalAmount || 0) / 1.10).toFixed(2);
        const sourceTax = +((source.totalAmount || 0) - sourceItemAmount).toFixed(2);
        const synthesizedItem: OrderItem = {
          id: `item-from-m${source.number}-${Date.now()}`,
          menuItemId: 'prod-01',
          name: `Consumo consolidado Mesa ${source.number}`,
          sku: `CONS-M${source.number}`,
          basePrice: sourceItemAmount,
          unitPrice: sourceItemAmount,
          quantity: 1,
          selectedModifiers: [],
          station: 'pase' as const,
          status: 'entregado' as const,
          subtotal: sourceItemAmount,
          assignedGuestName: `Mesa ${source.number}`,
        };
        const combinedItems = [...targetOrder.items, synthesizedItem];
        const newSubtotal = +(targetOrder.subtotal + sourceItemAmount).toFixed(2);
        const newTax = +(targetOrder.taxAmount + sourceTax).toFixed(2);
        const newTotal = +(targetOrder.total + (source.totalAmount || 0)).toFixed(2);

        const updatedTargetOrder: Order = {
          ...targetOrder,
          items: combinedItems,
          subtotal: newSubtotal,
          taxAmount: newTax,
          total: newTotal,
        };
        consolidatedOrderId = targetOrder.id;
        finalTotal = newTotal;
        updatedOrders = updatedOrders.map((o) => (o.id === targetOrder.id ? updatedTargetOrder : o));
      } else {
        consolidatedOrderId = targetOrder.id;
        finalTotal = targetOrder.total;
      }
    } else {
      // Neither had an explicit order, synthesize a consolidated order if there is total
      if (finalTotal > 0) {
        const orderNum = 100 + orders.length + 1;
        const subtotalCalc = +(finalTotal / 1.10).toFixed(2);
        const taxCalc = +(finalTotal - subtotalCalc).toFixed(2);
        const synthesizedItems: OrderItem[] = [
          {
            id: `item-joined-src-${Date.now()}`,
            menuItemId: 'prod-01',
            name: `Consumo Mesa ${source.number}`,
            sku: `CONS-M${source.number}`,
            basePrice: +((source.totalAmount || 0) / 1.10).toFixed(2),
            unitPrice: +((source.totalAmount || 0) / 1.10).toFixed(2),
            quantity: 1,
            selectedModifiers: [],
            station: 'pase' as const,
            status: 'entregado' as const,
            subtotal: +((source.totalAmount || 0) / 1.10).toFixed(2),
            assignedGuestName: `Mesa ${source.number}`,
          },
          {
            id: `item-joined-tgt-${Date.now()}`,
            menuItemId: 'prod-02',
            name: `Consumo Mesa ${target.number}`,
            sku: `CONS-M${target.number}`,
            basePrice: +((target.totalAmount || 0) / 1.10).toFixed(2),
            unitPrice: +((target.totalAmount || 0) / 1.10).toFixed(2),
            quantity: 1,
            selectedModifiers: [],
            station: 'pase' as const,
            status: 'entregado' as const,
            subtotal: +((target.totalAmount || 0) / 1.10).toFixed(2),
            assignedGuestName: `Mesa ${target.number}`,
          },
        ].filter((it) => it.subtotal > 0);

        const newConsolidatedOrder: Order = {
          id: `ord-joined-${Date.now()}`,
          orderNumber: orderNum,
          channel: 'mesa',
          tableId: target.id,
          tableNumber: target.number,
          salonName: target.salonName,
          status: 'en_cocina',
          items: synthesizedItems,
          waiterId: currentUser.id,
          waiterName: target.waiterName || source.waiterName || currentUser.name,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          subtotal: subtotalCalc,
          discountPercentage: 0,
          discountAmount: 0,
          taxAmount: taxCalc,
          total: finalTotal,
        };
        consolidatedOrderId = newConsolidatedOrder.id;
        updatedOrders = [newConsolidatedOrder, ...updatedOrders];
      }
    }

    setOrders(updatedOrders);

    // If currently open table in cart is either source or target, update cart
    if (selectedTable?.id === source.id || selectedTable?.id === target.id) {
      const activeConsolidatedOrder = updatedOrders.find((o) => o.id === consolidatedOrderId);
      if (activeConsolidatedOrder) {
        setActiveCartItems([...activeConsolidatedOrder.items]);
        setDiscountPercentage(activeConsolidatedOrder.discountPercentage || 0);
        setDiscountAuthorizedBy(activeConsolidatedOrder.discountAuthorizedBy || null);
        setCartNotes(activeConsolidatedOrder.notes || '');
      }
      setSelectedTable((prev) =>
        prev?.id === source.id
          ? { ...target, totalAmount: finalTotal, currentOrderId: consolidatedOrderId }
          : prev
      );
    }

    // Update tables state
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === targetId) {
          return {
            ...t,
            totalAmount: finalTotal,
            seats: t.seats + source.seats,
            status: 'ocupada',
            currentOrderId: consolidatedOrderId,
            waiterName: target.waiterName || source.waiterName || currentUser.name,
            openedAt:
              target.openedAt ||
              source.openedAt ||
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            guestsCount:
              (target.guestsCount || 0) + (source.guestsCount || 0) || t.seats + source.seats,
          };
        }
        if (t.id === sourceId) {
          return {
            ...t,
            status: 'libre',
            totalAmount: undefined,
            currentOrderId: undefined,
            waiterName: undefined,
            openedAt: undefined,
            guestsCount: undefined,
            reservationInfo: undefined,
          };
        }
        return t;
      })
    );

    addAuditLog(
      'UNIR_MESAS',
      `Mesa ${source.number} unida y consolidada en Mesa ${target.number}. Menú interno transferido y total unificado ($${finalTotal.toFixed(2)})`
    );
    showToast(`Mesa ${source.number} unida exitosamente a Mesa ${target.number}`);
  };

  const reassignTableWaiter = (tableId: string, newWaiterName: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, waiterName: newWaiterName } : t))
    );
    addAuditLog(
      'REASIGNAR_MESA',
      `Mesa reasignada al mesero: ${newWaiterName}`,
      currentUser.name
    );
    showToast(`Mesa reasignada a ${newWaiterName}`);
  };

  const performCashCut = (amountCounted: number) => {
    const diff = +(amountCounted - cashShift.expectedCashInDrawer).toFixed(2);
    addAuditLog(
      'CORTE_CAJA',
      `Corte parcial X realizado. Efectivo contado: $${amountCounted}, Esperado: $${cashShift.expectedCashInDrawer}, Diferencia: $${diff}`
    );
    showToast(`Corte parcial guardado. Diferencia: $${diff}`);
  };

  const closeDailyShift = (actualCash: number) => {
    const diff = +(actualCash - cashShift.expectedCashInDrawer).toFixed(2);
    setCashShift((prev) => ({
      ...prev,
      closedAt: new Date().toLocaleTimeString(),
      actualCashInDrawer: actualCash,
      difference: diff,
      status: 'cerrado',
    }));
    addAuditLog(
      'CIERRE_CAJA',
      `Cierre diario Z de caja finalizado. Cuadratura final: ${
        diff === 0 ? 'Exacta' : diff > 0 ? `Sobrante +$${diff}` : `Faltante -$${Math.abs(diff)}`
      }`,
      currentUser.name
    );
    showToast('Cierre de caja Z finalizado');
  };

  // --- BACKOFFICE CRUD OPERATIONS ---
  const saveProduct = (product: ProductItem) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
    showToast(`Producto guardado: ${product.name}`);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Producto eliminado del catálogo');
  };

  const saveMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => {
      const idx = prev.findIndex((m) => m.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    showToast(`Menú configurado: ${item.name}`);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    showToast('Menú eliminado del catálogo');
  };

  const saveSalesChannel = (channel: SalesChannelConfig) => {
    setSalesChannels((prev) => {
      const idx = prev.findIndex((c) => c.id === channel.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = channel;
        return copy;
      }
      return [...prev, channel];
    });
    showToast(`Canal de venta actualizado: ${channel.name}`);
  };

  const toggleChannelActive = (channelId: string) => {
    setSalesChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, isActive: !c.isActive } : c))
    );
    showToast('Estado del canal actualizado');
  };

  const saveUser = (user: User) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [...prev, user];
    });
    showToast(`Usuario guardado: ${user.name}`);
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Usuario eliminado');
  };

  const saveProfile = (profile: RoleProfile) => {
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = profile;
        return copy;
      }
      return [...prev, profile];
    });
    showToast(`Perfil actualizado: ${profile.name}`);
  };

  const toggleProfilePermission = (profileId: string, permKey: keyof RolePermissions) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          return {
            ...p,
            permissions: {
              ...p.permissions,
              [permKey]: !p.permissions[permKey],
            },
          };
        }
        return p;
      })
    );
    showToast('Permiso de perfil actualizado');
  };

  const saveDiscountPolicy = (policy: DiscountPolicy) => {
    setDiscountPolicies((prev) => {
      const idx = prev.findIndex((d) => d.id === policy.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = policy;
        return copy;
      }
      return [policy, ...prev];
    });
    showToast(`Regla de descuento guardada: ${policy.name}`);
  };

  const deleteDiscountPolicy = (policyId: string) => {
    setDiscountPolicies((prev) => prev.filter((d) => d.id !== policyId));
    showToast('Regla de descuento eliminada');
  };

  const hasPermission = (permissionKey: keyof RolePermissions): boolean => {
    const profile = profiles.find(
      (p) => p.roleKey === currentUser.role || p.id.includes(currentUser.role)
    );
    if (!profile) return true;
    return !!profile.permissions[permissionKey];
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        branch,
        setBranch,
        terminalId,
        setTerminalId,
        currentScreen,
        setCurrentScreen,
        deviceMode,
        setDeviceMode,
        selectedChannel,
        setSelectedChannel,
        deliveryPlatform,
        setDeliveryPlatform,
        tables,
        setTables,
        selectedTable,
        setSelectedTable,
        menuItems,
        setMenuItems,
        activeCartItems,
        setActiveCartItems,
        cartNotes,
        setCartNotes,
        discountPercentage,
        setDiscountPercentage,
        discountAuthorizedBy,
        setDiscountAuthorizedBy,
        modifierModalItem,
        setModifierModalItem,
        showSplitModal,
        setShowSplitModal,
        showPreBillModal,
        setShowPreBillModal,
        showPaymentModal,
        setShowPaymentModal,
        showDiscountAuthModal,
        setShowDiscountAuthModal,
        showJoinTablesModal,
        setShowJoinTablesModal,
        orders,
        activeOrder,
        cashShift,
        auditLogs,
        sprintStories,
        login,
        logout,
        startChannelOrder,
        openTableOrder,
        addItemToCart,
        updateCartItemQty,
        removeCartItem,
        sendOrderToKitchen,
        updateOrderStatus,
        updateItemKitchenStatus,
        applyDiscount,
        processPayment,
        splitBillByGuests,
        joinTables,
        reassignTableWaiter,
        performCashCut,
        closeDailyShift,
        addAuditLog,
        getEffectivePrice,
        toastMessage,
        showToast,
        // Backoffice master configuration
        products,
        setProducts,
        saveProduct,
        deleteProduct,
        saveMenuItem,
        deleteMenuItem,
        salesChannels,
        setSalesChannels,
        saveSalesChannel,
        toggleChannelActive,
        users,
        setUsers,
        saveUser,
        deleteUser,
        profiles,
        setProfiles,
        saveProfile,
        toggleProfilePermission,
        discountPolicies,
        setDiscountPolicies,
        saveDiscountPolicy,
        deleteDiscountPolicy,
        hasPermission,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
