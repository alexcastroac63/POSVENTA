-- ============================================================================
-- RESTO-XYZ: SCRIPT DE DATOS DE PRUEBA NORMALIZADO (SEED DATA PARA POSTGRESQL 3FN)
-- Compatible con database/schema.sql normalizado
-- ============================================================================

BEGIN;

-- 1. ROLES Y PERFILES (RBAC)
INSERT INTO role_profiles (id, role_key, name, description, can_apply_discounts, can_cancel_orders, can_open_cash_shift, can_close_cash_shift, can_view_audit_logs, can_configure_catalog, can_manage_users, can_reopen_table)
VALUES
('role-admin', 'administrador', 'Administrador General', 'Control total del sistema, catálogo, configuraciones y usuarios', true, true, true, true, true, true, true, true),
('role-gerente', 'gerente', 'Gerente de Sucursal', 'Supervisión operativa, autorizaciones de descuento y auditoría', true, true, true, true, true, false, false, true),
('role-cajero', 'cajero', 'Cajero Principal', 'Operación de caja, cobros omnicanal, arqueos y cortes', false, false, true, true, false, false, false, false),
('role-mesero', 'mesero', 'Mesero / Salonero', 'Atención en salón, apertura de mesas y comandeo', false, false, false, false, false, false, false, false),
('role-chef', 'chef', 'Jefe de Cocina (Chef)', 'Gestión del monitor KDS y despacho por estaciones', false, false, false, false, false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS Y PERSONAL OPERATIVO
INSERT INTO users (id, name, role_key, pin, device, avatar, is_active)
VALUES
('u1', 'Carlos Mendoza', 'administrador', '1234', 'all_in_one', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', true),
('u2', 'Valeria Rojas', 'cajero', '2222', 'all_in_one', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', true),
('u3', 'Mateo Silveira', 'mesero', '3333', 'tablet', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', true),
('u4', 'Chef Rodrigo Paz', 'chef', '4444', 'kds_monitor', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80', true),
('u5', 'Lucía Fernández', 'gerente', '5555', 'all_in_one', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SALONES Y ÁREAS (3FN)
INSERT INTO salons (id, name, floor, description, is_active)
VALUES
('salon-1', 'Salón Principal', 1, 'Zona central con aire acondicionado y ambiente familiar', true),
('salon-2', 'Terraza Exterior', 1, 'Área al aire libre con vista al jardín', true),
('salon-3', 'Área VIP / Lounge', 2, 'Piso superior con servicio exclusivo de bar', true)
ON CONFLICT (id) DO NOTHING;

-- 4. CANALES DE VENTA
INSERT INTO sales_channels (id, code, name, description, default_price_mode, default_delta, is_active)
VALUES
('mesa', 'MESA', 'Salón / Mesa', 'Consumo presencial en salones con servicio a mesa', 'base', 0.00, true),
('llevar', 'LLEVAR', 'Para Llevar (Take Out)', 'Venta en mostrador para retiro presencial', 'delta', -0.50, true),
('delivery', 'DELIVERY', 'Delivery Online', 'Plataformas Uber Eats, Glovo y Rappi', 'delta', 1.80, true)
ON CONFLICT (id) DO NOTHING;

-- 5. ESTACIONES DE COCINA (3FN)
INSERT INTO kitchen_stations (id, code, name, is_active)
VALUES
('parrilla', 'PARR', 'Estación de Parrilla & Plancha', true),
('barra', 'BARR', 'Barra de Bebidas & Coctelería', true),
('freidora', 'FREI', 'Estación de Freidoras & Fritos', true),
('pase', 'PASE', 'Pase Central & Emplatado', true),
('ensamblado', 'ENSA', 'Mesa Fría & Ensaladas', true)
ON CONFLICT (id) DO NOTHING;

-- 6. CATEGORÍAS DE PRODUCTOS (3FN)
INSERT INTO product_categories (id, code, name, display_order, icon, is_active)
VALUES
('cat-hamburguesas', 'HAMB', 'Hamburguesas & Sandwiches', 1, 'beef', true),
('cat-cenas', 'CENA', 'Platos Fuertes & Parrilladas', 2, 'utensils', true),
('cat-promos', 'PROM', 'Combos & Promociones', 3, 'tag', true),
('cat-bebidas', 'BEBI', 'Bebidas & Refrescos', 4, 'glass', true),
('cat-postres', 'POST', 'Postres & Cafetería', 5, 'ice-cream', true),
('cat-insumos', 'INSU', 'Insumos & Proteínas Base', 6, 'package', true)
ON CONFLICT (id) DO NOTHING;

-- 7. MÉTODOS DE PAGO (3FN)
INSERT INTO payment_methods (id, code, name, is_cash, requires_authorization, is_active)
VALUES
('pay-cash', 'EFECTIVO', 'Efectivo en Caja', true, false, true),
('pay-card', 'TARJETA', 'Tarjeta de Débito / Crédito', false, false, true),
('pay-voucher', 'VALES', 'Vales de Consumo / Bonos', false, true, true),
('pay-transfer', 'TRANSFER', 'Transferencia Bancaria Inmediata', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- 8. MESAS NORMALIZADAS (Sin redundancia de salon_name ni waiter_name)
INSERT INTO restaurant_tables (id, number, salon_id, seats, status, waiter_id, opened_at)
VALUES
('tab-1', 1, 'salon-1', 4, 'ocupada', 'u3', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('tab-2', 2, 'salon-1', 2, 'disponible', NULL, NULL),
('tab-3', 3, 'salon-1', 6, 'ocupada', 'u3', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
('tab-4', 4, 'salon-1', 4, 'limpieza', NULL, NULL),
('tab-5', 5, 'salon-2', 4, 'disponible', NULL, NULL),
('tab-6', 6, 'salon-2', 8, 'reservada', NULL, NULL),
('tab-7', 7, 'salon-2', 2, 'disponible', NULL, NULL),
('tab-8', 8, 'salon-3', 10, 'disponible', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. PRODUCTOS BASE (Insumos vinculados por category_id y station_id)
INSERT INTO products (id, sku, name, description, category_id, cost, preparation_type, station_id, is_active)
VALUES
('prod-angus', 'INS-001', 'Carne de Res Angus 200g', 'Medallón 100% Angus certificada', 'cat-insumos', 3.20, 'cocina_interna', 'parrilla', true),
('prod-brioche', 'INS-002', 'Pan Brioche Artesanal', 'Pan horneado diariamente con mantequilla', 'cat-insumos', 0.45, 'armado_menu', 'pase', true),
('prod-cheddar', 'INS-003', 'Queso Cheddar Fundido', 'Láminas de cheddar madurado', 'cat-insumos', 0.60, 'armado_menu', 'pase', true),
('prod-tocino', 'INS-004', 'Tocino Crujiente Ahumado', 'Tiras de tocino a la plancha', 'cat-insumos', 0.85, 'cocina_interna', 'parrilla', true),
('prod-papas', 'INS-005', 'Papas Rústicas Corte Grueso', 'Papas seleccionadas con romero y sal', 'cat-insumos', 0.70, 'cocina_interna', 'freidora', true),
('prod-pollo', 'INS-006', 'Pechuga de Pollo Marinado', 'Filete de pechuga a las finas hierbas', 'cat-insumos', 2.10, 'cocina_interna', 'parrilla', true),
('prod-gaseosa', 'INS-007', 'Refresco Lata 355ml', 'Bebida gasificada en lata fría', 'cat-bebidas', 0.50, 'armado_menu', 'barra', true),
('prod-cerveza', 'INS-008', 'Cerveza Artesanal IPA 330ml', 'Cerveza rubia aromática en botella', 'cat-bebidas', 1.40, 'armado_menu', 'barra', true),
('prod-costillas', 'INS-009', 'Costillas BBQ St. Louis 500g', 'Costillar cocido a baja temperatura', 'cat-cenas', 6.50, 'cocina_interna', 'parrilla', true),
('prod-brownie', 'INS-010', 'Brownie de Chocolate Belga', 'Porción con centro húmedo y nueces', 'cat-postres', 1.20, 'armado_menu', 'pase', true)
ON CONFLICT (id) DO NOTHING;

-- 10. MENÚS Y COMBOS DE VENTA (Normalizados)
INSERT INTO menu_items (id, sku, name, category_id, base_price, image_url, description, allow_discounts, is_available_mesa, is_available_llevar, is_available_delivery, station_id, is_active)
VALUES
('m1', 'MENU-001', 'Hamburguesa Clásica Angus', 'cat-hamburguesas', 12.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 'Carne Angus 200g, pan brioche, cheddar fundido y papas.', true, true, true, true, 'parrilla', true),
('m2', 'MENU-002', 'Doble Bacon Cheddar Burger', 'cat-hamburguesas', 15.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80', 'Doble carne Angus, extra tocino, doble cheddar y papas.', true, true, true, true, 'parrilla', true),
('m3', 'MENU-003', 'Costillas BBQ Ahumadas', 'cat-cenas', 19.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80', 'Medio costillar glaseado con salsa BBQ y coleslaw.', true, true, true, true, 'parrilla', true),
('m4', 'MENU-004', 'Combo Ejecutivo Almuerzo', 'cat-promos', 13.90, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', 'Hamburguesa Clásica + Papas Rústicas + Bebida.', true, true, true, false, 'parrilla', true),
('m5', 'MENU-005', 'Cerveza Artesanal IPA', 'cat-bebidas', 5.50, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80', 'Cerveza artesanal de lúpulo aromático.', false, true, true, true, 'barra', true),
('m6', 'MENU-006', 'Gaseosa Coca-Cola 355ml', 'cat-bebidas', 2.80, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', 'Lata clásica servida con hielo y rodaja de limón.', false, true, true, true, 'barra', true),
('m7', 'MENU-007', 'Brownie Caliente con Helado', 'cat-postres', 6.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', 'Brownie tibio con nueces y bola de helado de vainilla.', true, true, true, true, 'pase', true)
ON CONFLICT (id) DO NOTHING;

-- 11. TARIFAS POR CANAL (OMNICANAL)
INSERT INTO menu_channel_pricing (menu_item_id, channel_id, mode, custom_price, delta, enabled)
VALUES
('m1', 'mesa', 'base', 12.50, 0.00, true),
('m1', 'llevar', 'delta', NULL, -0.50, true),
('m1', 'delivery', 'custom', 14.50, 2.00, true),
('m2', 'mesa', 'base', 15.00, 0.00, true),
('m2', 'llevar', 'delta', NULL, -0.50, true),
('m2', 'delivery', 'custom', 17.50, 2.50, true),
('m3', 'mesa', 'base', 19.50, 0.00, true),
('m3', 'delivery', 'custom', 22.00, 2.50, true)
ON CONFLICT (menu_item_id, channel_id) DO NOTHING;

-- 12. PRODUCTOS INTERNOS (Sin redundancia de product_name)
INSERT INTO menu_internal_products (id, menu_item_id, product_id, preparation_order, is_required, default_quantity)
VALUES
('mip-1', 'm1', 'prod-angus', 1, true, 1),
('mip-2', 'm1', 'prod-brioche', 2, true, 1),
('mip-3', 'm1', 'prod-cheddar', 3, true, 1),
('mip-4', 'm1', 'prod-papas', 4, true, 1),
('mip-5', 'm2', 'prod-angus', 1, true, 2),
('mip-6', 'm2', 'prod-tocino', 2, true, 1),
('mip-7', 'm2', 'prod-cheddar', 3, true, 2),
('mip-8', 'm2', 'prod-papas', 4, true, 1)
ON CONFLICT (id) DO NOTHING;

-- 13. MODIFICADORES Y SUSTITUCIONES INTERNAS
INSERT INTO internal_product_modifiers (id, internal_product_id, name, substitute_product_id, price_delta, is_default)
VALUES
('mod-1', 'mip-1', 'Término Medio (3/4)', NULL, 0.00, true),
('mod-2', 'mip-1', 'Bien Cocida', NULL, 0.00, false),
('mod-3', 'mip-1', 'Jugosa / Poco Hecha', NULL, 0.00, false),
('mod-4', 'mip-3', 'Cheddar Clásico', NULL, 0.00, true),
('mod-5', 'mip-3', 'Queso Suizo / Emmental', NULL, 0.80, false),
('mod-6', 'mip-4', 'Papas Rústicas Estándar', NULL, 0.00, true),
('mod-7', 'mip-4', 'Cambiar por Aros de Cebolla', NULL, 1.20, false),
('mod-8', 'mip-4', 'Papas con Cheddar & Bacon', NULL, 2.00, false)
ON CONFLICT (id) DO NOTHING;

-- 14. POLÍTICAS DE DESCUENTO
INSERT INTO discount_policies (id, name, type, value, requires_authorization, respect_non_discountable_menus, is_active)
VALUES
('disc-1', 'Descuento Empleado / Familia', 'percentage', 20.00, true, true, true),
('disc-2', 'Cumpleañero del Mes', 'percentage', 15.00, false, true, true),
('disc-3', 'Cortesía de Gerencia', 'percentage', 100.00, true, false, true),
('disc-4', 'Cupón Promocional $5', 'fixed', 5.00, false, true, true)
ON CONFLICT (id) DO NOTHING;

-- 15. COMANDAS ACTIVAS EN CURSO (Sin dependencias transitivas operativas)
INSERT INTO orders (id, order_number, channel_id, platform_name, table_id, status, waiter_id, subtotal, discount_policy_id, discount_percentage, discount_amount, discount_authorized_by_id, tax_amount, total, notes)
VALUES
('ord-101', 101, 'mesa', NULL, 'tab-1', 'en_cocina', 'u3', 27.50, NULL, 0.00, 0.00, NULL, 2.75, 30.25, 'Carne a término medio, sin cebolla.'),
('ord-102', 102, 'mesa', NULL, 'tab-3', 'lista_para_servir', 'u3', 42.00, 'disc-2', 10.00, 4.20, 'u5', 3.78, 41.58, 'Mesa de negocios. Servicio rápido.'),
('ord-103', 103, 'delivery', 'Uber Eats', NULL, 'en_cocina', 'u2', 32.00, NULL, 0.00, 0.00, NULL, 3.20, 35.20, 'Timbre 4B. Dejar en conserjería.')
ON CONFLICT (id) DO NOTHING;

-- 16. DETALLE DE COMANDA (Vinculado con menu_item_id y station_id)
INSERT INTO order_items (id, order_id, menu_item_id, station_id, unit_price, quantity, subtotal, status, assigned_guest_name, allow_discounts, notes)
VALUES
('oi-101-1', 'ord-101', 'm1', 'parrilla', 12.50, 1, 12.50, 'preparando', 'Comensal 1', true, 'Término Medio'),
('oi-101-2', 'ord-101', 'm2', 'parrilla', 15.00, 1, 15.00, 'preparando', 'Comensal 2', true, 'Bien dorada'),
('oi-102-1', 'ord-102', 'm3', 'parrilla', 19.50, 2, 39.00, 'listo', 'Comensal 1', true, 'Extra salsa BBQ'),
('oi-102-2', 'ord-102', 'm6', 'barra', 2.80, 1, 2.80, 'entregado', 'Comensal 1', false, 'Con hielo')
ON CONFLICT (id) DO NOTHING;

-- 17. FACTURAS HISTÓRICAS EMITIDAS (Snapshots fiscales inmutables)
INSERT INTO historical_invoices (id, document_number, ticket_number, iso_date, cashier_id, cashier_name_snapshot, waiter_name_snapshot, channel_id, channel_label_snapshot, table_id, table_number_snapshot, salon_name_snapshot, subtotal, tax_amount, total_amount, total_charged, change_given, payment_method_summary, discount_applied, discount_percentage, discount_amount, discount_authorized_by_snapshot)
VALUES
('inv-1001', 'FAC-2026-000098', 98, '2026-10-18T13:45:12Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'mesa', 'Mesa #4 (Salón Principal)', 'tab-4', 4, 'Salón Principal', 33.50, 3.35, 36.85, 40.00, 3.15, 'Efectivo', false, 0.00, 0.00, NULL),
('inv-1002', 'FAC-2026-000099', 99, '2026-10-18T14:15:30Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'llevar', 'Para Llevar (Take Out)', NULL, NULL, NULL, 12.00, 1.20, 13.20, 13.20, 0.00, 'Tarjeta (Crédito)', false, 0.00, 0.00, NULL),
('inv-1003', 'FAC-2026-000100', 100, '2026-10-18T14:50:05Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'mesa', 'Mesa #2 (Salón Principal)', 'tab-2', 2, 'Salón Principal', 38.00, 3.23, 35.53, 35.53, 0.00, 'Pago Mixto (EFECTIVO: $20.00 + TARJETA: $15.53)', true, 15.00, 5.70, 'Lucía Fernández')
ON CONFLICT (id) DO NOTHING;

-- 18. DETALLE FACTURADO
INSERT INTO historical_invoice_items (id, invoice_id, menu_item_id, item_name_snapshot, sku_snapshot, category_name_snapshot, quantity, unit_price, subtotal, allow_discounts, notes)
VALUES
('inv-item-1', 'inv-1001', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 'Hamburguesas', 2, 12.50, 25.00, true, 'Una término medio, una bien cocida'),
('inv-item-2', 'inv-1001', 'm5', 'Cerveza Artesanal IPA', 'MENU-005', 'Bebidas', 1, 5.50, 5.50, false, 'Helada'),
('inv-item-3', 'inv-1001', 'm6', 'Gaseosa Coca-Cola 355ml', 'MENU-006', 'Bebidas', 1, 2.80, 2.80, false, NULL),
('inv-item-4', 'inv-1002', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 'Hamburguesas', 1, 12.00, 12.00, true, 'Tarifa mostrador'),
('inv-item-5', 'inv-1003', 'm2', 'Doble Bacon Cheddar Burger', 'MENU-002', 'Hamburguesas', 2, 15.00, 30.00, true, 'Con papas extra crujientes'),
('inv-item-6', 'inv-1003', 'm7', 'Brownie Caliente con Helado', 'MENU-007', 'Postres', 1, 6.00, 6.00, true, NULL)
ON CONFLICT (id) DO NOTHING;

-- 19. TRANSACCIONES FINANCIERAS
INSERT INTO payment_transactions (id, order_id, cash_shift_id, cashier_id, total_amount, total_tendered, change_given)
VALUES
('tx-1001', 'ord-101', NULL, 'u2', 30.25, 40.00, 9.75),
('tx-1002', 'ord-102', NULL, 'u2', 41.58, 41.58, 0.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transaction_entries (transaction_id, payment_method_id, amount)
VALUES
('tx-1001', 'pay-cash', 30.25),
('tx-1002', 'pay-card', 41.58)
ON CONFLICT DO NOTHING;

-- 20. CORTE Y TURNO DE CAJA
INSERT INTO cash_shifts (id, opened_at, cashier_id, initial_cash, cash_sales, card_sales, voucher_sales, transfer_sales, total_sales, expected_cash_in_drawer, status)
VALUES
('shift-today-1', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'u2', 150.00, 50.25, 54.78, 0.00, 0.00, 105.03, 200.25, 'abierto')
ON CONFLICT (id) DO NOTHING;

-- 21. AUDITORÍA
INSERT INTO audit_logs (id, user_id, action, description, supervisor_id)
VALUES
('log-1', 'u3', 'ORD_DISCOUNT_REQ', 'Solicitud de descuento de 10% en Orden #102 por motivo cliente frecuente', 'u5'),
('log-2', 'u5', 'ORD_DISCOUNT_AUTH', 'Autorización de descuento 10% mediante PIN gerencial para Mesa 3', NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;
