import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const envPath = join(rootDir, ".env");

loadEnv(envPath);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env before running seed:demo.");
  process.exit(1);
}

const connectionString = databaseUrl;

runPsql(
  [],
  `
INSERT INTO customers (name, email, phone)
SELECT 'Apex Furniture Co', 'orders@apexfurniture.local', '+1-555-0101'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'orders@apexfurniture.local');

INSERT INTO customers (name, email, phone)
SELECT 'Northstar Offices', 'buy@northstar.local', '+1-555-0102'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'buy@northstar.local');

INSERT INTO customers (name, email, phone)
SELECT 'Metro Interiors', 'ops@metrointeriors.local', '+1-555-0103'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'ops@metrointeriors.local');

INSERT INTO vendors (name, email, phone)
SELECT 'TimberWorks Supply', 'sales@timberworks.local', '+1-555-0201'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE email = 'sales@timberworks.local');

INSERT INTO vendors (name, email, phone)
SELECT 'FastenRight Hardware', 'orders@fastenright.local', '+1-555-0202'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE email = 'orders@fastenright.local');

INSERT INTO vendors (name, email, phone)
SELECT 'Prime Finishes', 'hello@primefinishes.local', '+1-555-0203'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE email = 'hello@primefinishes.local');

INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, procure_on_demand)
VALUES
  ('Dining Table', 'FG-TABLE-001', 780.00, 425.00, 'MANUFACTURE', TRUE),
  ('Office Desk', 'FG-DESK-001', 640.00, 350.00, 'MANUFACTURE', TRUE),
  ('Wooden Leg', 'RM-LEG-001', 0.00, 18.00, 'BUY', TRUE),
  ('Wooden Top', 'RM-TOP-001', 0.00, 85.00, 'BUY', TRUE),
  ('Metal Screw Pack', 'RM-SCREW-001', 0.00, 6.50, 'BUY', TRUE),
  ('Clear Varnish', 'RM-VARNISH-001', 0.00, 24.00, 'BUY', FALSE)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  sale_price = EXCLUDED.sale_price,
  cost_price = EXCLUDED.cost_price,
  procurement_type = EXCLUDED.procurement_type,
  procure_on_demand = EXCLUDED.procure_on_demand;

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 5, 4 FROM products WHERE sku = 'FG-TABLE-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 9, 3 FROM products WHERE sku = 'FG-DESK-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 32, 12 FROM products WHERE sku = 'RM-LEG-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 8, 5 FROM products WHERE sku = 'RM-TOP-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 96, 36 FROM products WHERE sku = 'RM-SCREW-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT id, 12, 2 FROM products WHERE sku = 'RM-VARNISH-001'
ON CONFLICT (product_id) DO UPDATE SET on_hand_qty = EXCLUDED.on_hand_qty, reserved_qty = EXCLUDED.reserved_qty, updated_at = NOW();

INSERT INTO product_vendors (product_id, vendor_id)
SELECT p.id, v.id FROM products p, vendors v
WHERE p.sku = 'RM-LEG-001' AND v.email = 'sales@timberworks.local'
AND NOT EXISTS (SELECT 1 FROM product_vendors pv WHERE pv.product_id = p.id AND pv.vendor_id = v.id);

INSERT INTO product_vendors (product_id, vendor_id)
SELECT p.id, v.id FROM products p, vendors v
WHERE p.sku = 'RM-TOP-001' AND v.email = 'sales@timberworks.local'
AND NOT EXISTS (SELECT 1 FROM product_vendors pv WHERE pv.product_id = p.id AND pv.vendor_id = v.id);

INSERT INTO product_vendors (product_id, vendor_id)
SELECT p.id, v.id FROM products p, vendors v
WHERE p.sku = 'RM-SCREW-001' AND v.email = 'orders@fastenright.local'
AND NOT EXISTS (SELECT 1 FROM product_vendors pv WHERE pv.product_id = p.id AND pv.vendor_id = v.id);

INSERT INTO product_vendors (product_id, vendor_id)
SELECT p.id, v.id FROM products p, vendors v
WHERE p.sku = 'RM-VARNISH-001' AND v.email = 'hello@primefinishes.local'
AND NOT EXISTS (SELECT 1 FROM product_vendors pv WHERE pv.product_id = p.id AND pv.vendor_id = v.id);

INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'FG-TABLE-001'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'FG-DESK-001'
ON CONFLICT (product_id) DO NOTHING;

DELETE FROM bom_items
WHERE bom_id IN (
  SELECT b.id FROM boms b JOIN products p ON p.id = b.product_id
  WHERE p.sku IN ('FG-TABLE-001', 'FG-DESK-001')
);

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, c.id, x.quantity
FROM boms b
JOIN products finished ON finished.id = b.product_id
JOIN (
  VALUES
    ('FG-TABLE-001', 'RM-LEG-001', 4.00),
    ('FG-TABLE-001', 'RM-TOP-001', 1.00),
    ('FG-TABLE-001', 'RM-SCREW-001', 1.00),
    ('FG-TABLE-001', 'RM-VARNISH-001', 0.25),
    ('FG-DESK-001', 'RM-LEG-001', 4.00),
    ('FG-DESK-001', 'RM-TOP-001', 1.00),
    ('FG-DESK-001', 'RM-SCREW-001', 1.00)
) AS x(finished_sku, component_sku, quantity) ON x.finished_sku = finished.sku
JOIN products c ON c.sku = x.component_sku;

DELETE FROM sales_order_items
WHERE sales_order_id IN (
  SELECT id FROM sales_orders WHERE order_number IN ('SO-1024', 'SO-1025', 'SO-1026')
);

INSERT INTO sales_orders (order_number, customer_id, status, created_by)
VALUES
  ('SO-1024', (SELECT id FROM customers WHERE email = 'orders@apexfurniture.local' LIMIT 1), 'CONFIRMED', (SELECT id FROM users WHERE email = 'sales@minierp.local' LIMIT 1)),
  ('SO-1025', (SELECT id FROM customers WHERE email = 'buy@northstar.local' LIMIT 1), 'DRAFT', (SELECT id FROM users WHERE email = 'sales@minierp.local' LIMIT 1)),
  ('SO-1026', (SELECT id FROM customers WHERE email = 'ops@metrointeriors.local' LIMIT 1), 'DELIVERED', (SELECT id FROM users WHERE email = 'sales@minierp.local' LIMIT 1))
ON CONFLICT (order_number) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by;

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price)
VALUES
  ((SELECT id FROM sales_orders WHERE order_number = 'SO-1024'), (SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 20, 780.00),
  ((SELECT id FROM sales_orders WHERE order_number = 'SO-1025'), (SELECT id FROM products WHERE sku = 'FG-DESK-001'), 6, 640.00),
  ((SELECT id FROM sales_orders WHERE order_number = 'SO-1026'), (SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 3, 780.00);

DELETE FROM purchase_order_items
WHERE purchase_order_id IN (
  SELECT id FROM purchase_orders WHERE po_number IN ('PO-001', 'PO-002', 'PO-003')
);

INSERT INTO purchase_orders (po_number, vendor_id, status, created_by)
VALUES
  ('PO-001', (SELECT id FROM vendors WHERE email = 'sales@timberworks.local' LIMIT 1), 'CONFIRMED', (SELECT id FROM users WHERE email = 'purchase@minierp.local' LIMIT 1)),
  ('PO-002', (SELECT id FROM vendors WHERE email = 'orders@fastenright.local' LIMIT 1), 'DRAFT', (SELECT id FROM users WHERE email = 'purchase@minierp.local' LIMIT 1)),
  ('PO-003', (SELECT id FROM vendors WHERE email = 'hello@primefinishes.local' LIMIT 1), 'RECEIVED', (SELECT id FROM users WHERE email = 'purchase@minierp.local' LIMIT 1))
ON CONFLICT (po_number) DO UPDATE SET
  vendor_id = EXCLUDED.vendor_id,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by;

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost_price)
VALUES
  ((SELECT id FROM purchase_orders WHERE po_number = 'PO-001'), (SELECT id FROM products WHERE sku = 'RM-LEG-001'), 60, 18.00),
  ((SELECT id FROM purchase_orders WHERE po_number = 'PO-001'), (SELECT id FROM products WHERE sku = 'RM-TOP-001'), 15, 85.00),
  ((SELECT id FROM purchase_orders WHERE po_number = 'PO-002'), (SELECT id FROM products WHERE sku = 'RM-SCREW-001'), 180, 6.50),
  ((SELECT id FROM purchase_orders WHERE po_number = 'PO-003'), (SELECT id FROM products WHERE sku = 'RM-VARNISH-001'), 12, 24.00);

DELETE FROM work_orders
WHERE manufacturing_order_id IN (
  SELECT id FROM manufacturing_orders WHERE mo_number IN ('MO-001', 'MO-002', 'MO-003')
);

INSERT INTO manufacturing_orders (mo_number, product_id, quantity, status, sales_order_id, assigned_to)
VALUES
  ('MO-001', (SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 15, 'WAITING MATERIALS', (SELECT id FROM sales_orders WHERE order_number = 'SO-1024'), (SELECT id FROM users WHERE email = 'manufacturing@minierp.local' LIMIT 1)),
  ('MO-002', (SELECT id FROM products WHERE sku = 'FG-DESK-001'), 6, 'READY', (SELECT id FROM sales_orders WHERE order_number = 'SO-1025'), (SELECT id FROM users WHERE email = 'manufacturing@minierp.local' LIMIT 1)),
  ('MO-003', (SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 3, 'COMPLETED', (SELECT id FROM sales_orders WHERE order_number = 'SO-1026'), (SELECT id FROM users WHERE email = 'manufacturing@minierp.local' LIMIT 1))
ON CONFLICT (mo_number) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  quantity = EXCLUDED.quantity,
  status = EXCLUDED.status,
  sales_order_id = EXCLUDED.sales_order_id,
  assigned_to = EXCLUDED.assigned_to;

INSERT INTO work_orders (manufacturing_order_id, operation_name, duration_minutes, status)
VALUES
  ((SELECT id FROM manufacturing_orders WHERE mo_number = 'MO-001'), 'Cutting', 90, 'WAITING'),
  ((SELECT id FROM manufacturing_orders WHERE mo_number = 'MO-001'), 'Assembly', 150, 'WAITING'),
  ((SELECT id FROM manufacturing_orders WHERE mo_number = 'MO-002'), 'Assembly', 120, 'READY'),
  ((SELECT id FROM manufacturing_orders WHERE mo_number = 'MO-003'), 'Finishing', 80, 'COMPLETED');

DELETE FROM stock_ledger WHERE notes LIKE 'Demo seed:%';

INSERT INTO stock_ledger (product_id, movement_type, quantity, reference_type, reference_id, notes)
VALUES
  ((SELECT id FROM products WHERE sku = 'RM-LEG-001'), 'IN', 60, 'PURCHASE_ORDER', (SELECT id FROM purchase_orders WHERE po_number = 'PO-001'), 'Demo seed: confirmed leg purchase'),
  ((SELECT id FROM products WHERE sku = 'RM-VARNISH-001'), 'IN', 12, 'PURCHASE_ORDER', (SELECT id FROM purchase_orders WHERE po_number = 'PO-003'), 'Demo seed: varnish received'),
  ((SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 'OUT', 3, 'SALES_ORDER', (SELECT id FROM sales_orders WHERE order_number = 'SO-1026'), 'Demo seed: delivered finished goods'),
  ((SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 'IN', 3, 'MANUFACTURING_ORDER', (SELECT id FROM manufacturing_orders WHERE mo_number = 'MO-003'), 'Demo seed: production completed');

DELETE FROM audit_logs WHERE action = 'DEMO_SEED';

INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
VALUES
  ((SELECT id FROM users WHERE email = 'admin@minierp.local' LIMIT 1), 'products', (SELECT id FROM products WHERE sku = 'FG-TABLE-001'), 'DEMO_SEED', NULL, '{"status":"created demo product"}'::jsonb),
  ((SELECT id FROM users WHERE email = 'inventory@minierp.local' LIMIT 1), 'inventory', (SELECT id FROM products WHERE sku = 'RM-LEG-001'), 'DEMO_SEED', NULL, '{"movement":"stock initialized"}'::jsonb),
  ((SELECT id FROM users WHERE email = 'purchase@minierp.local' LIMIT 1), 'purchase_orders', (SELECT id FROM purchase_orders WHERE po_number = 'PO-001'), 'DEMO_SEED', NULL, '{"status":"confirmed"}'::jsonb);
`,
);

console.log("Seeded demo ERP data.");

function loadEnv(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function runPsql(args: string[], input: string) {
  const result = spawnSync(
    "psql",
    ["--no-psqlrc", "-v", "ON_ERROR_STOP=1", connectionString, ...args],
    {
      cwd: rootDir,
      input,
      encoding: "utf8",
      env: process.env,
    },
  );

  const spawnError = result.error as NodeJS.ErrnoException | undefined;

  if (spawnError?.code === "ENOENT") {
    console.error("psql was not found. Install PostgreSQL client tools and try again.");
    process.exit(1);
  }

  if (result.status !== 0) {
    if (result.stdout) {
      console.error(result.stdout.trim());
    }

    if (result.stderr) {
      console.error(result.stderr.trim());
    }

    process.exit(result.status ?? 1);
  }
}
