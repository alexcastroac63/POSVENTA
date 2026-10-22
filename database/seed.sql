-- ============================================================================
-- RESTO-XYZ: SCRIPT DE DATOS DE PRUEBA (SEED DATA PARA POSTGRESQL)
-- Inserta datos iniciales de roles, usuarios, canales, mesas, catálogo maestro,
-- menús, insumos internos, descuentos, comandas activas, facturas históricas y caja.
-- ============================================================================

BEGIN;

-- 1. ROLES Y PERFILES (RBAC)
INSERT INTO role_profiles (id, name, description, role_key, can_apply_discounts, can_cancel_orders, can_open_cash_shift, can_close_cash_shift, can_view_audit_logs, can_configure_catalog, can_manage_users, can_reopen_table)
VALUES
('role-admin', 'Administrador General', 'Control total del sistema, catálogo, configuraciones y usuarios', 'administrador', true, true, true, true, true, true, true, true),
('role-gerente', 'Gerente de Sucursal', 'Supervisión operativa, autorizaciones de descuento y auditoría', 'gerente', true, true, true, true, true, false, false, true),
('role-cajero', 'Cajero Principal', 'Operación de caja, cobros omnicanal, arqueos y cortes', 'cajero', false, false, true, true, false, false, false, false),
('role-mesero', 'Mesero / Salonero', 'Atención en salón, apertura de mesas y comandeo', 'mesero', false, false, false, false, false, false, false, false),
('role-chef', 'Jefe de Cocina (Chef)', 'Gestión del monitor KDS y despacho por estaciones', 'chef', false, false, false, false, false, false, false, false),
('role-bartender', 'Bartender / Barra', 'Preparación de bebidas y estación de coctelería', 'bartender', false, false, false, false, false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS Y PERSONAL OPERATIVO
INSERT INTO users (id, name, role, pin, device, avatar, is_active)
VALUES
('u1', 'Carlos Mendoza', 'administrador', '1234', 'all_in_one', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', true),
('u2', 'Valeria Rojas', 'cajero', '2222', 'all_in_one', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', true),
('u3', 'Mateo Silveira', 'mesero', '3333', 'tablet', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', true),
('u4', 'Chef Rodrigo Paz', 'chef', '4444', 'kds_monitor', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80', true),
('u5', 'Lucía Fernández', 'gerente', '5555', 'all_in_one', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CANALES DE VENTA
INSERT INTO sales_channels (id, name, code, description, is_active, default_price_mode, default_delta)
VALUES
('mesa', 'Salón / Mesa', 'MESA', 'Consumo presencial en salones con servicio a mesa', true, 'base', 0.00),
('llevar', 'Para Llevar (Take Out)', 'LLEVAR', 'Venta en mostrador para retiro presencial con 5% de descuento', true, 'delta', -0.50),
('delivery', 'Delivery Online', 'DELIVERY', 'Plataformas Uber Eats, Glovo y Rappi con margen operativo', true, 'delta', 1.80)
ON CONFLICT (id) DO NOTHING;

-- 4. MESAS Y SALONES
INSERT INTO restaurant_tables (id, number, salon_id, salon_name, seats, status, waiter_id, waiter_name, opened_at)
VALUES
('tab-1', 1, 'salon-1', 'Salón Principal', 4, 'ocupada', 'u3', 'Mateo Silveira', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('tab-2', 2, 'salon-1', 'Salón Principal', 2, 'disponible', NULL, NULL, NULL),
('tab-3', 3, 'salon-1', 'Salón Principal', 6, 'ocupada', 'u3', 'Mateo Silveira', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
('tab-4', 4, 'salon-1', 'Salón Principal', 4, 'limpieza', NULL, NULL, NULL),
('tab-5', 5, 'salon-2', 'Terraza Exterior', 4, 'disponible', NULL, NULL, NULL),
('tab-6', 6, 'salon-2', 'Terraza Exterior', 8, 'reservada', NULL, NULL, NULL),
('tab-7', 7, 'salon-2', 'Terraza Exterior', 2, 'disponible', NULL, NULL, NULL),
('tab-8', 8, 'salon-3', 'Área VIP / Lounge', 10, 'disponible', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCTOS BASE (CATÁLOGO MAESTRO: COCINA INTERNA VS ARMADO)
INSERT INTO products (id, sku, name, description, category, cost, preparation_type, station, is_active)
VALUES
('prod-angus', 'INS-001', 'Carne de Res Angus 200g', 'Medallón de carne 100% Angus certificada', 'Carnes & Proteínas', 3.20, 'cocina_interna', 'parrilla', true),
('prod-brioche', 'INS-002', 'Pan Brioche Artesanal', 'Pan horneado diariamente con mantequilla dorada', 'Panadería', 0.45, 'armado_menu', 'pase', true),
('prod-cheddar', 'INS-003', 'Queso Cheddar Fundido', 'Láminas de queso cheddar madurado', 'Lácteos & Quesos', 0.60, 'armado_menu', 'pase', true),
('prod-tocino', 'INS-004', 'Tocino Crujiente Ahumado', 'Tiras de tocino ahumado a la plancha', 'Carnes & Proteínas', 0.85, 'cocina_interna', 'parrilla', true),
('prod-papas', 'INS-005', 'Papas Rústicas Corte Grueso', 'Papas seleccionadas con romero y sal marina', 'Guarniciones', 0.70, 'cocina_interna', 'freidora', true),
('prod-pollo', 'INS-006', 'Pechuga de Pollo Marinado', 'Filete de pechuga a las finas hierbas', 'Carnes & Proteínas', 2.10, 'cocina_interna', 'parrilla', true),
('prod-gaseosa', 'INS-007', 'Refresco Lata 355ml', 'Bebida gasificada en lata fría', 'Bebidas', 0.50, 'armado_menu', 'barra', true),
('prod-cerveza', 'INS-008', 'Cerveza Artesanal IPA 330ml', 'Cerveza rubia aromática en botella', 'Bebidas Alcohólicas', 1.40, 'armado_menu', 'barra', true),
('prod-costillas', 'INS-009', 'Costillas BBQ St. Louis 500g', 'Costillar cocido a baja temperatura por 8 horas', 'Carnes & Proteínas', 6.50, 'cocina_interna', 'parrilla', true),
('prod-brownie', 'INS-010', 'Brownie de Chocolate Belga', 'Porción con centro húmedo y nueces', 'Repostería', 1.20, 'armado_menu', 'pase', true)
ON CONFLICT (id) DO NOTHING;

-- 6. MENÚS Y COMBOS DE VENTA (MENU ITEMS)
INSERT INTO menu_items (id, sku, name, category, base_price, image_url, description, allow_discounts, is_available_mesa, is_available_llevar, is_available_delivery, station, is_active)
VALUES
('m1', 'MENU-001', 'Hamburguesa Clásica Angus', 'hamburguesas', 12.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 'Carne Angus 200g, pan brioche, queso cheddar fundido y papas rústicas.', true, true, true, true, 'parrilla', true),
('m2', 'MENU-002', 'Doble Bacon Cheddar Burger', 'hamburguesas', 15.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80', 'Doble carne Angus, extra tocino crocante, queso cheddar doble y papas fritas.', true, true, true, true, 'parrilla', true),
('m3', 'MENU-003', 'Costillas BBQ Ahumadas', 'cenas', 19.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80', 'Medio costillar glaseado con salsa BBQ de la casa y ensalada coleslaw.', true, true, true, true, 'parrilla', true),
('m4', 'MENU-004', 'Combo Ejecutivo Almuerzo', 'promos', 13.90, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', 'Hamburguesa Clásica o Pollo + Papas Rústicas + Bebida a elección.', true, true, true, false, 'parrilla', true),
('m5', 'MENU-005', 'Cerveza Artesanal IPA', 'bebidas', 5.50, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80', 'Cerveza artesanal de lúpulo aromático y cuerpo medio.', false, true, true, true, 'barra', true),
('m6', 'MENU-006', 'Gaseosa Coca-Cola 355ml', 'bebidas', 2.80, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', 'Lata clásica servida con hielo y rodaja de limón.', false, true, true, true, 'barra', true),
('m7', 'MENU-007', 'Brownie Caliente con Helado', 'postres', 6.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', 'Brownie tibio con nueces y bola de helado de vainilla.', true, true, true, true, 'pase', true)
ON CONFLICT (id) DO NOTHING;

-- 7. TARIFAS DIFERENCIALES POR CANAL (OMNICANAL)
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

-- 8. PRODUCTOS INTERNOS DEL MENÚ CON ORDEN DE PREPARACIÓN
INSERT INTO menu_internal_products (id, menu_item_id, product_id, product_name, preparation_order)
VALUES
('mip-1', 'm1', 'prod-angus', 'Medallón Angus 200g', 1),
('mip-2', 'm1', 'prod-brioche', 'Pan Brioche Tostado', 2),
('mip-3', 'm1', 'prod-cheddar', 'Queso Cheddar', 3),
('mip-4', 'm1', 'prod-papas', 'Porción Papas Rústicas', 4),
('mip-5', 'm2', 'prod-angus', 'Doble Medallón Angus', 1),
('mip-6', 'm2', 'prod-tocino', 'Tocino Ahumado Extra', 2),
('mip-7', 'm2', 'prod-cheddar', 'Doble Cheddar Fundido', 3),
('mip-8', 'm2', 'prod-papas', 'Porción Papas Rústicas', 4)
ON CONFLICT (id) DO NOTHING;

-- 9. MODIFICADORES Y SUSTITUCIONES INTERNAS
INSERT INTO internal_product_modifiers (id, internal_product_id, name, price_delta, is_default)
VALUES
('mod-1', 'mip-1', 'Término Medio (3/4)', 0.00, true),
('mod-2', 'mip-1', 'Bien Cocida', 0.00, false),
('mod-3', 'mip-1', 'Jugosa / Poco Hecha', 0.00, false),
('mod-4', 'mip-3', 'Cheddar Clásico', 0.00, true),
('mod-5', 'mip-3', 'Queso Suizo / Emmental', 0.80, false),
('mod-6', 'mip-4', 'Papas Rústicas Estándar', 0.00, true),
('mod-7', 'mip-4', 'Cambiar por Aros de Cebolla', 1.20, false),
('mod-8', 'mip-4', 'Papas con Cheddar & Bacon', 2.00, false)
ON CONFLICT (id) DO NOTHING;

-- 10. POLÍTICAS DE DESCUENTO
INSERT INTO discount_policies (id, name, type, value, requires_authorization, respect_non_discountable_menus, is_active)
VALUES
('disc-1', 'Descuento Empleado / Familia', 'percentage', 20.00, true, true, true),
('disc-2', 'Cumpleañero del Mes', 'percentage', 15.00, false, true, true),
('disc-3', 'Cortesía de Gerencia', 'percentage', 100.00, true, false, true),
('disc-4', 'Cupón Promocional $5', 'fixed', 5.00, false, true, true)
ON CONFLICT (id) DO NOTHING;

-- 11. COMANDAS ACTIVAS EN CURSO
INSERT INTO orders (id, order_number, channel, platform_name, table_id, table_number, salon_name, status, waiter_id, waiter_name, subtotal, discount_percentage, discount_amount, discount_authorized_by, tax_amount, total, notes)
VALUES
('ord-101', 101, 'mesa', NULL, 'tab-1', 1, 'Salón Principal', 'en_cocina', 'u3', 'Mateo Silveira', 27.50, 0.00, 0.00, NULL, 2.75, 30.25, 'Carne a término medio, sin cebolla en la hamburguesa.'),
('ord-102', 102, 'mesa', NULL, 'tab-3', 3, 'Salón Principal', 'lista_para_servir', 'u3', 'Mateo Silveira', 42.00, 10.00, 4.20, 'Lucía Fernández', 3.78, 41.58, 'Mesa de negocios. Servicio rápido por favor.'),
('ord-103', 103, 'delivery', 'Uber Eats', NULL, NULL, NULL, 'en_cocina', 'u2', 'Valeria Rojas', 32.00, 0.00, 0.00, NULL, 3.20, 35.20, 'Timbre 4B. Dejar en conserjería.')
ON CONFLICT (id) DO NOTHING;

-- 12. DETALLE DE COMANDAS ACTIVAS (ITEMS EN KDS)
INSERT INTO order_items (id, order_id, menu_item_id, name, sku, base_price, unit_price, quantity, subtotal, station, status, assigned_guest_name, allow_discounts, preparation_type, notes)
VALUES
('oi-101-1', 'ord-101', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 12.50, 12.50, 1, 12.50, 'parrilla', 'preparando', 'Comensal 1', true, 'cocina_interna', 'Término Medio'),
('oi-101-2', 'ord-101', 'm2', 'Doble Bacon Cheddar Burger', 'MENU-002', 15.00, 15.00, 1, 15.00, 'parrilla', 'preparando', 'Comensal 2', true, 'cocina_interna', 'Bien dorada'),
('oi-102-1', 'ord-102', 'm3', 'Costillas BBQ Ahumadas', 'MENU-003', 19.50, 19.50, 2, 39.00, 'parrilla', 'listo', 'Comensal 1', true, 'cocina_interna', 'Extra salsa BBQ'),
('oi-102-2', 'ord-102', 'm6', 'Gaseosa Coca-Cola 355ml', 'MENU-006', 2.80, 2.80, 1, 2.80, 'barra', 'entregado', 'Comensal 1', false, 'armado_menu', 'Con hielo')
ON CONFLICT (id) DO NOTHING;

-- 13. FACTURAS HISTÓRICAS EMITIDAS (HISTORIAL COMPLETO)
INSERT INTO historical_invoices (id, document_number, ticket_number, date_time_str, iso_date, cashier_id, cashier_name, waiter_name, sales_channel, sales_channel_label, table_number, salon_name, subtotal, tax_amount, total_amount, total_charged, change_given, payment_method, discount_applied, discount_percentage, discount_amount, discount_authorized_by)
VALUES
('inv-1001', 'FAC-2026-000098', 98, '18/10/2026 13:45:12', '2026-10-18T13:45:12Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'mesa', 'Mesa #4 (Salón Principal)', 4, 'Salón Principal', 33.50, 3.35, 36.85, 40.00, 3.15, 'Efectivo', false, 0.00, 0.00, NULL),
('inv-1002', 'FAC-2026-000099', 99, '18/10/2026 14:15:30', '2026-10-18T14:15:30Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'llevar', 'Para Llevar (Take Out)', NULL, NULL, 12.00, 1.20, 13.20, 13.20, 0.00, 'Tarjeta (Crédito)', false, 0.00, 0.00, NULL),
('inv-1003', 'FAC-2026-000100', 100, '18/10/2026 14:50:05', '2026-10-18T14:50:05Z', 'u2', 'Valeria Rojas', 'Mateo Silveira', 'mesa', 'Mesa #2 (Salón Principal)', 2, 'Salón Principal', 38.00, 3.23, 35.53, 35.53, 0.00, 'Pago Mixto (EFECTIVO: $20.00 + TARJETA: $15.53)', true, 15.00, 5.70, 'Lucía Fernández')
ON CONFLICT (id) DO NOTHING;

-- 14. DETALLE DE PRODUCTOS FACTURADOS
INSERT INTO historical_invoice_items (id, invoice_id, menu_item_id, name, sku, category, quantity, base_price, unit_price, subtotal, allow_discounts, notes)
VALUES
('inv-item-1', 'inv-1001', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 'hamburguesas', 2, 12.50, 12.50, 25.00, true, 'Una término medio, una bien cocida'),
('inv-item-2', 'inv-1001', 'm5', 'Cerveza Artesanal IPA', 'MENU-005', 'bebidas', 1, 5.50, 5.50, 5.50, false, 'Helada'),
('inv-item-3', 'inv-1001', 'm6', 'Gaseosa Coca-Cola 355ml', 'MENU-006', 'bebidas', 1, 2.80, 2.80, 2.80, false, NULL),
('inv-item-4', 'inv-1002', 'm1', 'Hamburguesa Clásica Angus', 'MENU-001', 'hamburguesas', 1, 12.50, 12.00, 12.00, true, 'Tarifa mostrador'),
('inv-item-5', 'inv-1003', 'm2', 'Doble Bacon Cheddar Burger', 'MENU-002', 'hamburguesas', 2, 15.00, 15.00, 30.00, true, 'Con papas extra crujientes'),
('inv-item-6', 'inv-1003', 'm7', 'Brownie Caliente con Helado', 'MENU-007', 'postres', 1, 6.00, 6.00, 6.00, true, NULL)
ON CONFLICT (id) DO NOTHING;

-- 15. SUB-DETALLE DE PRODUCTOS INTERNOS FACTURADOS
INSERT INTO historical_invoice_internal_products (invoice_item_id, product_id, product_name, preparation_order, preparation_type, station, selected_option_name, price_delta, is_cost_added)
VALUES
('inv-item-1', 'prod-angus', 'Medallón Angus 200g', 1, 'cocina_interna', 'parrilla', 'Término Medio (3/4)', 0.00, false),
('inv-item-1', 'prod-brioche', 'Pan Brioche Tostado', 2, 'armado_menu', 'pase', 'Pan Brioche Clásico', 0.00, false),
('inv-item-1', 'prod-cheddar', 'Queso Cheddar', 3, 'armado_menu', 'pase', 'Cheddar Fundido', 0.00, false),
('inv-item-1', 'prod-papas', 'Porción Papas Rústicas', 4, 'cocina_interna', 'freidora', 'Papas Rústicas Estándar', 0.00, false),
('inv-item-5', 'prod-angus', 'Doble Medallón Angus', 1, 'cocina_interna', 'parrilla', 'Bien Cocida', 0.00, false),
('inv-item-5', 'prod-tocino', 'Tocino Ahumado Extra', 2, 'cocina_interna', 'parrilla', 'Crocante Dorado', 0.00, false),
('inv-item-5', 'prod-cheddar', 'Doble Cheddar Fundido', 3, 'armado_menu', 'pase', 'Queso Suizo / Emmental', 0.80, true),
('inv-item-5', 'prod-papas', 'Porción Papas Rústicas', 4, 'cocina_interna', 'freidora', 'Papas con Cheddar & Bacon', 2.00, true);

-- 16. TRANSACCIONES DE PAGO Y ARQUEO
INSERT INTO payment_transactions (id, order_id, order_number, cashier_id, cashier_name, channel, total_amount, total_tendered, change_given, invoice_id, timestamp_str)
VALUES
('tx-1001', 'ord-old-1', 98, 'u2', 'Valeria Rojas', 'mesa', 36.85, 40.00, 3.15, 'inv-1001', '13:45:12'),
('tx-1002', 'ord-old-2', 99, 'u2', 'Valeria Rojas', 'llevar', 13.20, 13.20, 0.00, 'inv-1002', '14:15:30'),
('tx-1003', 'ord-old-3', 100, 'u2', 'Valeria Rojas', 'mesa', 35.53, 35.53, 0.00, 'inv-1003', '14:50:05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transaction_entries (transaction_id, method, amount)
VALUES
('tx-1001', 'efectivo', 40.00),
('tx-1002', 'tarjeta', 13.20),
('tx-1003', 'efectivo', 20.00),
('tx-1003', 'tarjeta', 15.53);

-- 17. TURNO Y CORTE DE CAJA ACTUAL
INSERT INTO cash_shifts (id, opened_at, cashier_id, cashier_name, initial_cash, cash_sales, card_sales, voucher_sales, transfer_sales, total_sales, expected_cash_in_drawer, status)
VALUES
('shift-current', '18/10/2026 08:00:00', 'u2', 'Valeria Rojas', 150.00, 56.85, 28.73, 0.00, 0.00, 85.58, 206.85, 'abierto')
ON CONFLICT (id) DO NOTHING;

-- 18. LOGS DE AUDITORÍA Y TRAZABILIDAD
INSERT INTO audit_logs (id, timestamp_str, user_id, user_name, user_role, action, description, supervisor_name, metadata)
VALUES
('log-1', '08:00:00', 'u2', 'Valeria Rojas', 'cajero', 'APERTURA_CAJA', 'Apertura de turno matutino con fondo inicial de $150.00', NULL, '{"initialCash": 150.00}'),
('log-2', '14:48:22', 'u3', 'Mateo Silveira', 'mesero', 'APLICAR_DESCUENTO', 'Descuento de 15% aplicado por Cumpleaños en Mesa #2', 'Lucía Fernández', '{"percentage": 15, "authorizedBy": "Lucía Fernández"}'),
('log-3', '14:50:05', 'u2', 'Valeria Rojas', 'cajero', 'CORTE_CAJA', 'Pago liquidado para Orden #100 por $35.53. Factura generada: FAC-2026-000100', NULL, '{"invoiceId": "inv-1003", "documentNumber": "FAC-2026-000100"}')
ON CONFLICT (id) DO NOTHING;

COMMIT;
