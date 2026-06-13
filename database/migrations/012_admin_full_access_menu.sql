-- Migration: 012_admin_full_access_menu.sql
-- Adds an "Operations" sidebar section to the admin role so admin can
-- directly navigate to every module's transactional page.

-- Insert new sidebar section for admin: "Operations"
INSERT INTO role_menu_sections (role_id, title, display_order)
SELECT id, 'Operations', 2
FROM roles
WHERE key = 'admin'
ON CONFLICT DO NOTHING;

-- Insert menu items into that section
INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order)
SELECT
  rms.id,
  item.label,
  item.href,
  item.description,
  item.icon,
  item.display_order
FROM role_menu_sections rms
JOIN roles r ON r.id = rms.role_id
CROSS JOIN (
  VALUES
    ('Sales Orders',          '/dashboard/sales/sales-orders',              'Create and manage all customer sales orders.',         'shoppingCart', 0),
    ('Purchase Orders',       '/dashboard/purchase/purchase-orders',        'Raise and receive supplier purchase orders.',           'packagePlus',  1),
    ('Manufacturing Orders',  '/dashboard/manufacturing/manufacturing-orders','Schedule and track production runs.',                 'factory',      2),
    ('BoM Planning',          '/dashboard/manufacturing/bom-planning',      'Define Bills of Materials for manufactured products.',  'clipboard',    3),
    ('On Hand Stock',         '/dashboard/inventory/on-hand-stock',         'View on-hand stock, reservations and shortages.',       'warehouse',    4),
    ('Stock Ledger',          '/dashboard/inventory/stock-ledger',          'Full movement history across all stock transactions.',  'fileClock',    5),
    ('Vendors',               '/dashboard/purchase/vendors',                'Manage vendor accounts and supplier contacts.',         'truck',        6),
    ('Customers',             '/dashboard/sales/customers',                 'Manage customer accounts and contact details.',         'users',        7)
) AS item(label, href, description, icon, display_order)
WHERE r.key = 'admin'
  AND rms.title = 'Operations'
ON CONFLICT DO NOTHING;
