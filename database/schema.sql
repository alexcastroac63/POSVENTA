-- ============================================================================
-- RESTO-XYZ: ESQUEMA DE BASE DE DATOS RELACIONAL (POSTGRESQL / SQL DDL)
-- Sistema de Punto de Venta Omnicanal, KDS, Backoffice y Facturación Histórica
-- ============================================================================

-- 1. EXTENSIONES & CONFIGURACIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: ROLES Y PERFILES (RBAC)
CREATE TABLE role_profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    role_key VARCHAR(50) NOT NULL UNIQUE,
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

-- 3. TABLA: USUARIOS Y PERSONAL
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL REFERENCES role_profiles(role_key) ON UPDATE CASCADE,
    pin VARCHAR(10) NOT NULL,
    device VARCHAR(50) DEFAULT 'terminal',
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: CANALES DE VENTA (OMNICANAL)
CREATE TABLE sales_channels (
    id VARCHAR(30) PRIMARY KEY, -- 'mesa', 'llevar', 'delivery'
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    default_price_mode VARCHAR(20) DEFAULT 'base', -- 'base', 'delta', 'custom'
    default_delta NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: MESAS Y SALONES
CREATE TABLE restaurant_tables (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL,
    salon_id VARCHAR(50) NOT NULL,
    salon_name VARCHAR(100) NOT NULL,
    seats INT NOT NULL DEFAULT 4,
    status VARCHAR(30) DEFAULT 'disponible', -- 'disponible', 'ocupada', 'limpieza', 'reservada'
    current_order_id VARCHAR(50),
    waiter_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    waiter_name VARCHAR(120),
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: PRODUCTOS BASE (CATÁLOGO MAESTRO)
-- Diferencia productos de cocina interna (KDS) vs armado con menú
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    preparation_type VARCHAR(30) NOT NULL, -- 'cocina_interna' (KDS), 'armado_menu' (ensamble)
    station VARCHAR(30) DEFAULT 'parrilla', -- 'parrilla', 'barra', 'freidora', 'pase'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: MENÚS Y COMBOS DE VENTA (MENU ITEMS)
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    allow_discounts BOOLEAN DEFAULT TRUE,
    is_available_mesa BOOLEAN DEFAULT TRUE,
    is_available_llevar BOOLEAN DEFAULT TRUE,
    is_available_delivery BOOLEAN DEFAULT TRUE,
    station VARCHAR(30) NOT NULL DEFAULT 'pase',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: PRECIOS POR CANAL DE VENTA (TARIFAS DIFERENCIALES)
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

-- 9. TABLA: PRODUCTOS INTERNOS DEL MENÚ CON ORDEN DE PREPARACIÓN
CREATE TABLE menu_internal_products (
    id VARCHAR(50) PRIMARY KEY,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(150) NOT NULL,
    preparation_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA: MODIFICADORES Y SUSTITUCIONES DE PRODUCTOS INTERNOS
CREATE TABLE internal_product_modifiers (
    id VARCHAR(50) PRIMARY KEY,
    internal_product_id VARCHAR(50) NOT NULL REFERENCES menu_internal_products(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE
);

-- 11. TABLA: POLÍTICAS DE DESCUENTOS Y CUPONES
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

-- 12. TABLA: COMANDAS / ÓRDENES ACTIVAS
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number INT NOT NULL,
    channel VARCHAR(30) NOT NULL REFERENCES sales_channels(id),
    platform_name VARCHAR(50), -- 'Uber Eats', 'Glovo', 'Rappi'
    table_id VARCHAR(50) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number INT,
    salon_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'abierta', -- 'abierta', 'en_cocina', 'lista_para_servir', 'en_precuenta', 'cobrada', 'cancelada'
    waiter_id VARCHAR(50) NOT NULL REFERENCES users(id),
    waiter_name VARCHAR(120) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_authorized_by VARCHAR(120),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. TABLA: ÍTEMS DE COMANDA
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    station VARCHAR(30) NOT NULL, -- 'parrilla', 'barra', 'freidora', 'pase'
    status VARCHAR(30) NOT NULL DEFAULT 'en_cola', -- 'en_cola', 'preparando', 'listo', 'entregado'
    assigned_guest_name VARCHAR(100),
    allow_discounts BOOLEAN DEFAULT TRUE,
    preparation_type VARCHAR(30) DEFAULT 'cocina_interna',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABLA: MODIFICADORES SELECCIONADOS POR ÍTEM DE COMANDA
CREATE TABLE order_item_modifiers (
    id SERIAL PRIMARY KEY,
    order_item_id VARCHAR(50) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    group_id VARCHAR(50) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    option_id VARCHAR(50) NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 15. TABLA: HISTORIAL DE FACTURAS EMITIDAS (ENCABEZADO DE FACTURA)
CREATE TABLE historical_invoices (
    id VARCHAR(50) PRIMARY KEY,
    document_number VARCHAR(50) NOT NULL UNIQUE, -- ej: FAC-2026-000101
    ticket_number INT NOT NULL,
    date_time_str VARCHAR(50) NOT NULL,
    iso_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(120) NOT NULL,
    waiter_name VARCHAR(120),
    sales_channel VARCHAR(30) NOT NULL,
    sales_channel_label VARCHAR(150) NOT NULL,
    table_number INT,
    salon_name VARCHAR(100),
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    total_charged NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(150) NOT NULL,
    discount_applied BOOLEAN DEFAULT FALSE,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_authorized_by VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. TABLA: DETALLE DE PRODUCTOS VENDIDOS EN FACTURA HISTÓRICA
CREATE TABLE historical_invoice_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES historical_invoices(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    allow_discounts BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 17. TABLA: SUB-DETALLE DE PRODUCTOS INTERNOS DE CADA MENÚ FACTURADO
CREATE TABLE historical_invoice_internal_products (
    id SERIAL PRIMARY KEY,
    invoice_item_id VARCHAR(50) NOT NULL REFERENCES historical_invoice_items(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    preparation_order INT NOT NULL,
    preparation_type VARCHAR(30) NOT NULL, -- 'cocina_interna' o 'armado_menu'
    station VARCHAR(30) NOT NULL,
    selected_option_name VARCHAR(150) NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_cost_added BOOLEAN DEFAULT FALSE
);

-- 18. TABLA: TRANSACCIONES FINANCIERAS Y PAGOS MIXTOS
CREATE TABLE payment_transactions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    order_number INT NOT NULL,
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(120) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    total_tendered NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    invoice_id VARCHAR(50) REFERENCES historical_invoices(id),
    timestamp_str VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_transaction_entries (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL, -- 'efectivo', 'tarjeta', 'vales', 'transferencia'
    amount NUMERIC(10, 2) NOT NULL
);

-- 19. TABLA: TURNOS Y CORTES DE CAJA (ARQUEO)
CREATE TABLE cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    opened_at VARCHAR(50) NOT NULL,
    closed_at VARCHAR(50),
    cashier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    cashier_name VARCHAR(120) NOT NULL,
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

-- 20. TABLA: AUDITORÍA Y TRAZABILIDAD (SUPERVISIÓN)
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp_str VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    user_name VARCHAR(120) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    supervisor_name VARCHAR(120),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. ÍNDICES DE ALTO RENDIMIENTO PARA CONSULTAS Y KDS
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_channel ON orders(channel);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_station_status ON order_items(station, status);
CREATE INDEX idx_invoices_doc_number ON historical_invoices(document_number);
CREATE INDEX idx_invoices_date ON historical_invoices(iso_date);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
