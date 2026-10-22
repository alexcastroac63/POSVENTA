-- ============================================================================
-- RESTO-XYZ: ESQUEMA DE BASE DE DATOS RELACIONAL NORMALIZADO (3FN / BCNF)
-- Motor: PostgreSQL 16+ / SQL Estándar ANSI
-- ============================================================================
-- Auditoría de Normalización:
-- 1FN: Todos los campos son atómicos. Claves primarias únicas definidas en cada tabla.
-- 2FN: Dependencia funcional completa respecto a las claves primarias (sin dependencias parciales).
-- 3FN: Eliminación de dependencias transitivas (X -> Y -> Z). Se extrajeron tablas maestras
--      independientes (salons, product_categories, kitchen_stations, payment_methods).
-- BCNF: Cada determinante funcional es una superclave en el núcleo operativo.
-- Nota Fiscal: Las tablas de facturación histórica (historical_invoices) actúan como
--      instantáneas inmutables (audit snapshot) exigidas por normativa tributaria.
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CATÁLOGOS MAESTROS Y CONFIGURACIÓN (TABLAS 3FN INDEPENDIENTES)
-- ============================================================================

-- 2.1 ROLES Y PERFILES (RBAC)
CREATE TABLE role_profiles (
    id VARCHAR(50) PRIMARY KEY,
    role_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    can_apply_discounts BOOLEAN DEFAULT FALSE,
    can_cancel_orders BOOLEAN DEFAULT FALSE,
    can_open_cash_shift BOOLEAN DEFAULT FALSE,
    can_close_cash_shift BOOLEAN DEFAULT FALSE,
    can_view_audit_logs BOOLEAN DEFAULT FALSE,
    can_configure_catalog BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_reopen_table BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 USUARIOS Y PERSONAL OPERATIVO
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role_key VARCHAR(50) NOT NULL REFERENCES role_profiles(role_key) ON UPDATE CASCADE,
    pin VARCHAR(10) NOT NULL,
    device VARCHAR(50) DEFAULT 'terminal',
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 SALONES Y ÁREAS FÍSICAS (Extraído para 3FN: evita anomalías de inserción y redundancia en mesas)
CREATE TABLE salons (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    floor INT DEFAULT 1,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 CANALES DE VENTA (OMNICANAL)
CREATE TABLE sales_channels (
    id VARCHAR(30) PRIMARY KEY, -- 'mesa', 'llevar', 'delivery'
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_price_mode VARCHAR(20) DEFAULT 'base', -- 'base', 'delta', 'custom'
    default_delta NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.5 ESTACIONES DE PREPARACIÓN DE COCINA (KDS)
CREATE TABLE kitchen_stations (
    id VARCHAR(30) PRIMARY KEY, -- 'parrilla', 'barra', 'freidora', 'pase', 'ensamblado'
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2.6 CATEGORÍAS DE PRODUCTOS Y MENÚS (Normalizado para 3FN)
CREATE TABLE product_categories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 MÉTODOS DE PAGO
CREATE TABLE payment_methods (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_cash BOOLEAN DEFAULT FALSE,
    requires_authorization BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 3. GESTIÓN DE SALÓN Y MESAS
-- ============================================================================

CREATE TABLE restaurant_tables (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL,
    salon_id VARCHAR(50) NOT NULL REFERENCES salons(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    seats INT NOT NULL DEFAULT 4,
    status VARCHAR(30) NOT NULL DEFAULT 'disponible', -- 'disponible', 'ocupada', 'limpieza', 'reservada'
    current_order_id VARCHAR(50),
    waiter_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_table_salon_number UNIQUE (salon_id, number)
);

-- ============================================================================
-- 4. CATÁLOGO MAESTRO: PRODUCTOS, MENÚS Y COMPOSICIÓN (3FN)
-- ============================================================================

-- 4.1 PRODUCTOS E INSUMOS BASE
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id VARCHAR(50) NOT NULL REFERENCES product_categories(id) ON UPDATE CASCADE,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    preparation_type VARCHAR(30) NOT NULL, -- 'cocina_interna' (KDS), 'armado_menu' (ensamble)
    station_id VARCHAR(30) NOT NULL REFERENCES kitchen_stations(id) ON UPDATE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 MENÚS Y COMBOS DE VENTA (MENU ITEMS)
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES product_categories(id) ON UPDATE CASCADE,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    allow_discounts BOOLEAN DEFAULT TRUE,
    is_available_mesa BOOLEAN DEFAULT TRUE,
    is_available_llevar BOOLEAN DEFAULT TRUE,
    is_available_delivery BOOLEAN DEFAULT TRUE,
    station_id VARCHAR(30) NOT NULL REFERENCES kitchen_stations(id) ON UPDATE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 PRECIOS POR CANAL DE VENTA (TARIFAS DIFERENCIALES)
CREATE TABLE menu_channel_pricing (
    id SERIAL PRIMARY KEY,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    channel_id VARCHAR(30) NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL DEFAULT 'base', -- 'base', 'delta', 'custom'
    custom_price NUMERIC(10, 2),
    delta NUMERIC(10, 2) DEFAULT 0.00,
    enabled BOOLEAN DEFAULT TRUE,
    UNIQUE (menu_item_id, channel_id)
);

-- 4.4 RELACIÓN MENU-PRODUCTOS INTERNOS CON ORDEN DE ARMADO (3FN Normalizado)
CREATE TABLE menu_internal_products (
    id VARCHAR(50) PRIMARY KEY,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    preparation_order INT NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    default_quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_menu_product_order UNIQUE (menu_item_id, preparation_order)
);

-- 4.5 MODIFICADORES Y SUSTITUCIONES DE PRODUCTOS INTERNOS
CREATE TABLE internal_product_modifiers (
    id VARCHAR(50) PRIMARY KEY,
    internal_product_id VARCHAR(50) NOT NULL REFERENCES menu_internal_products(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    substitute_product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE
);

-- 4.6 POLÍTICAS DE DESCUENTOS Y CUPONES
CREATE TABLE discount_policies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    value NUMERIC(10, 2) NOT NULL,
    requires_authorization BOOLEAN DEFAULT TRUE,
    respect_non_discountable_menus BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. GESTIÓN OPERATIVA DE COMANDAS Y VENTAS (3FN)
-- ============================================================================

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT NOT NULL UNIQUE,
    channel_id VARCHAR(30) NOT NULL REFERENCES sales_channels(id) ON UPDATE CASCADE,
    platform_name VARCHAR(50), -- 'Uber Eats', 'Glovo', 'Rappi'
    table_id VARCHAR(50) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'abierta', -- 'abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta', 'cobrada', 'cancelada'
    waiter_id VARCHAR(50) NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_policy_id VARCHAR(50) REFERENCES discount_policies(id),
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_authorized_by_id VARCHAR(50) REFERENCES users(id),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    station_id VARCHAR(30) NOT NULL REFERENCES kitchen_stations(id),
    unit_price NUMERIC(10, 2) NOT NULL, -- Precio pactado al momento de la orden (inmutable transaccional)
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'en_cola', -- 'en_cola', 'preparando', 'listo', 'entregado'
    assigned_guest_name VARCHAR(100),
    allow_discounts BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_item_modifiers (
    id SERIAL PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id VARCHAR(50) REFERENCES internal_product_modifiers(id),
    name VARCHAR(120) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- ============================================================================
-- 6. PAGOS, TRANSACCIONES Y CORTE DE CAJA (ARQUEO)
-- ============================================================================

CREATE TABLE cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    initial_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cash_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    card_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    voucher_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    transfer_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    expected_cash_in_drawer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    actual_cash_counted NUMERIC(10, 2),
    difference NUMERIC(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'abierto' -- 'abierto', 'cerrado'
);

CREATE TABLE payment_transactions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
    cash_shift_id VARCHAR(50) REFERENCES cash_shifts(id),
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    total_tendered NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_transaction_entries (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    payment_method_id VARCHAR(30) NOT NULL REFERENCES payment_methods(id),
    amount NUMERIC(10, 2) NOT NULL
);

-- ============================================================================
-- 7. AUDITORÍA Y TRAZABILIDAD (SUPERVISIÓN)
-- ============================================================================

CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    supervisor_id VARCHAR(50) REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. FACTURACIÓN HISTÓRICA E INMUTABLE (SNAPSHOT FISCAL LEGAL)
-- ============================================================================
-- Justificación de diseño: Las normativas tributarias y de auditoría exigen que
-- las facturas emitidas preserven el texto exacto, nombres de cliente/cajero y
-- tarifas vigentes en el instante de la emisión, independientes de futuros cambios
-- en las tablas maestras.
-- ============================================================================

CREATE TABLE historical_invoices (
    id VARCHAR(50) PRIMARY KEY,
    document_number VARCHAR(50) NOT NULL UNIQUE, -- ej: FAC-2026-000101
    ticket_number INT NOT NULL,
    iso_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name_snapshot VARCHAR(120) NOT NULL,
    waiter_name_snapshot VARCHAR(120),
    channel_id VARCHAR(30) NOT NULL REFERENCES sales_channels(id),
    channel_label_snapshot VARCHAR(150) NOT NULL,
    table_id VARCHAR(50) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number_snapshot INT,
    salon_name_snapshot VARCHAR(100),
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    total_charged NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method_summary VARCHAR(150) NOT NULL,
    discount_applied BOOLEAN DEFAULT FALSE,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_authorized_by_snapshot VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historical_invoice_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES historical_invoices(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id),
    item_name_snapshot VARCHAR(150) NOT NULL,
    sku_snapshot VARCHAR(50) NOT NULL,
    category_name_snapshot VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    allow_discounts BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE TABLE historical_invoice_internal_products (
    id SERIAL PRIMARY KEY,
    invoice_item_id VARCHAR(50) NOT NULL REFERENCES historical_invoice_items(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    product_name_snapshot VARCHAR(150) NOT NULL,
    preparation_order INT NOT NULL,
    preparation_type VARCHAR(30) NOT NULL,
    station_id VARCHAR(30) NOT NULL REFERENCES kitchen_stations(id),
    selected_option_name VARCHAR(150) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_cost_added BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- 9. VISTAS SQL NORMALIZADAS (PARA CONSUMO SIMPLIFICADO EN APIS Y REPORTES)
-- ============================================================================

-- Vista: Mesas con datos de Salón y Mesero asignado (resuelve 3FN automáticamente)
CREATE OR REPLACE VIEW v_restaurant_tables AS
SELECT 
    t.id,
    t.number,
    t.salon_id,
    s.name AS salon_name,
    s.floor AS salon_floor,
    t.seats,
    t.status,
    t.current_order_id,
    t.waiter_id,
    u.name AS waiter_name,
    t.opened_at,
    t.created_at
FROM restaurant_tables t
JOIN salons s ON t.salon_id = s.id
LEFT JOIN users u ON t.waiter_id = u.id;

-- Vista: Comandas activas completas con Salón, Mesa, Canal y Mesero
CREATE OR REPLACE VIEW v_active_orders AS
SELECT 
    o.id,
    o.order_number,
    o.channel_id,
    c.name AS channel_name,
    o.platform_name,
    o.table_id,
    t.number AS table_number,
    s.name AS salon_name,
    o.status,
    o.waiter_id,
    u.name AS waiter_name,
    o.subtotal,
    o.discount_percentage,
    o.discount_amount,
    auth_u.name AS discount_authorized_by,
    o.tax_amount,
    o.total,
    o.notes,
    o.created_at,
    o.updated_at
FROM orders o
JOIN sales_channels c ON o.channel_id = c.id
LEFT JOIN restaurant_tables t ON o.table_id = t.id
LEFT JOIN salons s ON t.salon_id = s.id
JOIN users u ON o.waiter_id = u.id
LEFT JOIN users auth_u ON o.discount_authorized_by_id = auth_u.id;

-- Vista: Menús y catálogo con Categoría y Estación
CREATE OR REPLACE VIEW v_menu_catalog AS
SELECT 
    m.id,
    m.sku,
    m.name,
    m.category_id,
    cat.name AS category_name,
    m.base_price,
    m.image_url,
    m.description,
    m.allow_discounts,
    m.is_available_mesa,
    m.is_available_llevar,
    m.is_available_delivery,
    m.station_id,
    ks.name AS station_name,
    m.is_active
FROM menu_items m
JOIN product_categories cat ON m.category_id = cat.id
JOIN kitchen_stations ks ON m.station_id = ks.id;

-- ============================================================================
-- 10. ÍNDICES DE ALTO RENDIMIENTO
-- ============================================================================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_channel ON orders(channel_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_station_status ON order_items(station_id, status);
CREATE INDEX idx_invoices_doc_number ON historical_invoices(document_number);
CREATE INDEX idx_invoices_date ON historical_invoices(iso_date);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
