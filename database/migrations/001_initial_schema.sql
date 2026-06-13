-- Mini ERP initial database schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    procurement_type VARCHAR(30),
    procure_on_demand BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INT UNIQUE REFERENCES products(id),
    on_hand_qty INT DEFAULT 0,
    reserved_qty INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_vendors (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    vendor_id INT REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS boms (
    id SERIAL PRIMARY KEY,
    product_id INT UNIQUE REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS bom_items (
    id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES boms(id),
    component_product_id INT REFERENCES products(id),
    quantity DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    customer_id INT REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INT REFERENCES sales_orders(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE,
    vendor_id INT REFERENCES vendors(id),
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT REFERENCES purchase_orders(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    cost_price DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS manufacturing_orders (
    id SERIAL PRIMARY KEY,
    mo_number VARCHAR(50) UNIQUE,
    product_id INT REFERENCES products(id),
    quantity INT,
    status VARCHAR(50),
    sales_order_id INT REFERENCES sales_orders(id),
    assigned_to INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    manufacturing_order_id INT REFERENCES manufacturing_orders(id),
    operation_name VARCHAR(255),
    duration_minutes INT,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    movement_type VARCHAR(50),
    quantity DECIMAL(12,2),
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    entity_type VARCHAR(100),
    entity_id INT,
    action VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
