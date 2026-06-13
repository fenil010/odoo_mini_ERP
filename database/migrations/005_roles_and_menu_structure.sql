-- Migration 005: Move role definitions from hardcoded to database
-- Creates tables for dynamic role and menu management

-- Roles table - stores role metadata
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,              -- "admin", "sales", "purchase", etc.
    title VARCHAR(100) NOT NULL,                   -- Display title
    responsibility TEXT,                           -- Role responsibility description
    focus TEXT,                                    -- Role focus area description
    sidebar_title VARCHAR(100) NOT NULL,          -- Sidebar section title
    db_role VARCHAR(30) NOT NULL,                 -- Database role name for permissions
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu sections - groups menu items by role
CREATE TABLE role_menu_sections (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,                   -- Section title (e.g., "Admin", "Sales")
    display_order INT DEFAULT 0,                   -- Order in which sections appear
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items - individual menu entries per section
CREATE TABLE role_menu_items (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES role_menu_sections(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,                   -- Menu item label (e.g., "Overview")
    href VARCHAR(255) NOT NULL,                    -- Route/path (e.g., "/dashboard/admin")
    description TEXT,                              -- Hover description
    icon VARCHAR(50) NOT NULL,                     -- Icon name (e.g., "home", "users")
    display_order INT DEFAULT 0,                   -- Order in which items appear
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Role modules mapping (which modules each role has access to)
CREATE TABLE role_modules (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,             -- e.g., "Users", "Products", "Sales"
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles and their menu structures
INSERT INTO roles (key, title, responsibility, focus, sidebar_title, db_role) VALUES
('admin', 'Admin', 'Full system access, manage everything', 'Control users, permissions, masters, audit logs, and every ERP workflow.', 'System control', 'ADMIN'),
('sales', 'Sales User', 'Create and manage Sales Orders', 'Capture demand, confirm orders, and track delivery status.', 'Sales desk', 'SALES'),
('purchase', 'Purchase User', 'Create and manage Purchase Orders', 'Handle vendor procurement and keep shortage items moving.', 'Procurement', 'PURCHASE'),
('manufacturing', 'Manufacturing User', 'Manage Manufacturing Orders and Work Orders', 'Plan production, execute work orders, and complete manufacturing orders.', 'Production', 'MANUFACTURING'),
('inventory', 'Inventory Manager', 'Track stock, receive materials, deliver products', 'Keep inventory accurate across receipts, reservations, production, and delivery.', 'Warehouse', 'INVENTORY'),
('owner', 'Business Owner', 'Monitor business, create/manage products, view dashboard', 'See business health, product performance, and workflow bottlenecks.', 'Executive view', 'OWNER');

-- Admin role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'admin'), 'Admin', 0),
((SELECT id FROM roles WHERE key = 'admin'), 'Governance', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Admin'), 'Overview', '/dashboard/admin', 'System health and administrative activity.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Admin'), 'Users & roles', '/dashboard/admin/users-roles', 'Manage ERP users and their assigned roles.', 'users', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Admin'), 'Permissions', '/dashboard/admin/permissions', 'Review access rules for each business role.', 'shield', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Admin'), 'System settings', '/dashboard/admin/system-settings', 'Configure organization and application defaults.', 'settings', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Governance'), 'Audit logs', '/dashboard/admin/audit-logs', 'Inspect recorded changes across the ERP.', 'fileClock', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Governance'), 'Master data', '/dashboard/admin/master-data', 'Maintain shared products, vendors, and customers.', 'layers', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'admin') AND title = 'Governance'), 'All modules', '/dashboard/admin/all-modules', 'Review every enabled ERP module.', 'activity', 2);

-- Sales role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'sales'), 'Sales', 0),
((SELECT id FROM roles WHERE key = 'sales'), 'Fulfillment', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Sales'), 'Sales overview', '/dashboard/sales', 'Sales demand, order value, and stock alerts.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Sales'), 'Customers', '/dashboard/sales/customers', 'View and maintain customer accounts.', 'users', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Sales'), 'Sales orders', '/dashboard/sales/sales-orders', 'Create and track customer sales orders.', 'shoppingCart', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Sales'), 'Order items', '/dashboard/sales/order-items', 'Review products and quantities on open orders.', 'clipboard', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Fulfillment'), 'Shortages', '/dashboard/sales/shortages', 'Identify stock shortages affecting sales.', 'boxes', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'sales') AND title = 'Fulfillment'), 'Delivery status', '/dashboard/sales/delivery-status', 'Track fulfillment and customer deliveries.', 'truck', 1);

-- Purchase role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'purchase'), 'Purchase', 0),
((SELECT id FROM roles WHERE key = 'purchase'), 'Receiving', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Purchase'), 'Purchase overview', '/dashboard/purchase', 'Procurement totals, suppliers, and incoming stock.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Purchase'), 'Vendors', '/dashboard/purchase/vendors', 'Manage approved suppliers and contacts.', 'users', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Purchase'), 'Purchase orders', '/dashboard/purchase/purchase-orders', 'Create and monitor supplier purchase orders.', 'receipt', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Purchase'), 'Purchase items', '/dashboard/purchase/purchase-items', 'Review materials ordered from vendors.', 'clipboard', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Receiving'), 'Incoming stock', '/dashboard/purchase/incoming-stock', 'Track materials expected from suppliers.', 'packagePlus', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'purchase') AND title = 'Receiving'), 'Shortage demand', '/dashboard/purchase/shortage-demand', 'Review shortages requiring procurement.', 'boxes', 1);

-- Manufacturing role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'manufacturing'), 'Manufacturing', 0),
((SELECT id FROM roles WHERE key = 'manufacturing'), 'Execution', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Manufacturing'), 'Production board', '/dashboard/manufacturing', 'Production status and active manufacturing work.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Manufacturing'), 'Manufacturing orders', '/dashboard/manufacturing/manufacturing-orders', 'Plan and control manufacturing orders.', 'factory', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Manufacturing'), 'Work orders', '/dashboard/manufacturing/work-orders', 'Manage shop-floor operations and progress.', 'wrench', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Manufacturing'), 'BoM planning', '/dashboard/manufacturing/bom-planning', 'Review bills of materials and components.', 'layers', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Execution'), 'Material readiness', '/dashboard/manufacturing/material-readiness', 'Check component availability before production.', 'boxes', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'manufacturing') AND title = 'Execution'), 'Completion queue', '/dashboard/manufacturing/completion-queue', 'Review production waiting to be completed.', 'packageCheck', 1);

-- Inventory role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'inventory'), 'Inventory', 0),
((SELECT id FROM roles WHERE key = 'inventory'), 'Movement', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Inventory'), 'Stock overview', '/dashboard/inventory', 'Current stock position and warehouse activity.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Inventory'), 'On hand stock', '/dashboard/inventory/on-hand-stock', 'View physical quantities available by product.', 'warehouse', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Inventory'), 'Reserved stock', '/dashboard/inventory/reserved-stock', 'Review stock committed to open demand.', 'boxes', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Inventory'), 'Stock ledger', '/dashboard/inventory/stock-ledger', 'Inspect receipts, issues, and adjustments.', 'fileClock', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Movement'), 'Receive materials', '/dashboard/inventory/receive-materials', 'Record materials received into inventory.', 'packagePlus', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'inventory') AND title = 'Movement'), 'Deliver products', '/dashboard/inventory/deliver-products', 'Prepare and record finished-product deliveries.', 'truck', 1);

-- Owner role menu sections and items
INSERT INTO role_menu_sections (role_id, title, display_order) VALUES
((SELECT id FROM roles WHERE key = 'owner'), 'Business', 0),
((SELECT id FROM roles WHERE key = 'owner'), 'Operations', 1);

INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order) VALUES
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Business'), 'Executive dashboard', '/dashboard/owner', 'Combined commercial and operational performance.', 'home', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Business'), 'Revenue view', '/dashboard/owner/revenue-view', 'Review current sales value and revenue signals.', 'barChart', 1),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Business'), 'Product master', '/dashboard/owner/product-master', 'Review products, prices, and procurement methods.', 'layers', 2),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Business'), 'Stock risk', '/dashboard/owner/stock-risk', 'Monitor low-stock and fulfillment exposure.', 'boxes', 3),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Operations'), 'Production load', '/dashboard/owner/production-load', 'See manufacturing workload and readiness.', 'factory', 0),
((SELECT id FROM role_menu_sections WHERE role_id = (SELECT id FROM roles WHERE key = 'owner') AND title = 'Operations'), 'Delayed orders', '/dashboard/owner/delayed-orders', 'Review orders at risk of missing targets.', 'fileClock', 1);

-- Insert role modules
INSERT INTO role_modules (role_id, module_name) VALUES
((SELECT id FROM roles WHERE key = 'admin'), 'Users'),
((SELECT id FROM roles WHERE key = 'admin'), 'Products'),
((SELECT id FROM roles WHERE key = 'admin'), 'Sales'),
((SELECT id FROM roles WHERE key = 'admin'), 'Purchase'),
((SELECT id FROM roles WHERE key = 'admin'), 'Manufacturing'),
((SELECT id FROM roles WHERE key = 'admin'), 'Inventory'),
((SELECT id FROM roles WHERE key = 'admin'), 'Audit'),
((SELECT id FROM roles WHERE key = 'sales'), 'Customers'),
((SELECT id FROM roles WHERE key = 'sales'), 'Sales Orders'),
((SELECT id FROM roles WHERE key = 'sales'), 'Order Items'),
((SELECT id FROM roles WHERE key = 'sales'), 'Delivery Status'),
((SELECT id FROM roles WHERE key = 'purchase'), 'Vendors'),
((SELECT id FROM roles WHERE key = 'purchase'), 'Purchase Orders'),
((SELECT id FROM roles WHERE key = 'purchase'), 'Purchase Items'),
((SELECT id FROM roles WHERE key = 'purchase'), 'Receipts'),
((SELECT id FROM roles WHERE key = 'manufacturing'), 'Manufacturing Orders'),
((SELECT id FROM roles WHERE key = 'manufacturing'), 'Work Orders'),
((SELECT id FROM roles WHERE key = 'manufacturing'), 'BoMs'),
((SELECT id FROM roles WHERE key = 'manufacturing'), 'Component Usage'),
((SELECT id FROM roles WHERE key = 'inventory'), 'Inventory'),
((SELECT id FROM roles WHERE key = 'inventory'), 'Stock Ledger'),
((SELECT id FROM roles WHERE key = 'inventory'), 'Receipts'),
((SELECT id FROM roles WHERE key = 'inventory'), 'Deliveries'),
((SELECT id FROM roles WHERE key = 'owner'), 'Dashboard'),
((SELECT id FROM roles WHERE key = 'owner'), 'Products'),
((SELECT id FROM roles WHERE key = 'owner'), 'Sales Overview'),
((SELECT id FROM roles WHERE key = 'owner'), 'Inventory Health');
