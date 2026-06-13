-- Migration: 013_nested_manufacturing_seed.sql
-- Seeds a complete multi-level manufacturing product tree for demo/testing.
-- Two finished goods (Dining Table, Office Chair) each with sub-components
-- that are themselves manufactured (2-level deep BoM).

-- ─────────────────────────────────────────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO vendors (name, email, phone) VALUES
  ('TimberCraft Supplies',   'orders@timbercraft.local',  '+91-9000000001'),
  ('SteelWorks India',       'sales@steelworks.local',    '+91-9000000002'),
  ('Hardware Hub',           'buy@hardwarehub.local',     '+91-9000000003'),
  ('Foam & Fabric Co.',      'orders@foamfabric.local',   '+91-9000000004')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO customers (name, email, phone) VALUES
  ('RetailMart India',       'purchase@retailmart.local', '+91-8000000001'),
  ('FurnitureWorld',         'orders@furnitureworld.local','+91-8000000002'),
  ('OfficeDepot B2B',        'b2b@officedepot.local',    '+91-8000000003')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- LEVEL-2 RAW MATERIALS (procurement_type = PURCHASE)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, product_type, procure_on_demand) VALUES
  -- Table Top components
  ('Wood Panel',          'RM-WOOD-PANEL',   0,    350.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Sandpaper Sheet',     'RM-SANDPAPER',    0,     15.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Wood Varnish',        'RM-VARNISH',      0,    180.00, 'PURCHASE', 'RAW_MATERIAL', true),
  -- Table Leg Assembly components
  ('Steel Rod',           'RM-STEEL-ROD',    0,    220.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Rubber Foot Cap',     'RM-RUBBER-CAP',   0,     25.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Leg Bolt M8',         'RM-BOLT-M8',      0,      8.00, 'PURCHASE', 'RAW_MATERIAL', true),
  -- Common fastener
  ('Screw Pack M6 x50',   'RM-SCREW-M6-50', 0,     45.00, 'PURCHASE', 'RAW_MATERIAL', true),
  -- Chair Frame components
  ('Steel Tube 25mm',     'RM-TUBE-25',      0,    310.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Welding Rod',         'RM-WELD-ROD',     0,     60.00, 'PURCHASE', 'RAW_MATERIAL', true),
  -- Seat Cushion components
  ('Foam Sheet 50mm',     'RM-FOAM-50',      0,    120.00, 'PURCHASE', 'RAW_MATERIAL', true),
  ('Upholstery Fabric',   'RM-FABRIC',       0,    200.00, 'PURCHASE', 'RAW_MATERIAL', true),
  -- Wheel set (purchased as-is)
  ('Wheel Set x5',        'RM-WHEEL-5',      0,    275.00, 'PURCHASE', 'RAW_MATERIAL', true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- LEVEL-1 SUB-ASSEMBLIES (procurement_type = MANUFACTURE)
-- These are manufactured components that go INTO the finished goods.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, product_type, procure_on_demand) VALUES
  -- Dining Table sub-assemblies
  ('Table Top',           'SA-TABLE-TOP',   0,   800.00, 'MANUFACTURE', 'RAW_MATERIAL', true),
  ('Table Leg Assembly',  'SA-LEG-ASSY',    0,   550.00, 'MANUFACTURE', 'RAW_MATERIAL', true),
  -- Office Chair sub-assemblies
  ('Chair Frame',         'SA-CHAIR-FRAME', 0,   700.00, 'MANUFACTURE', 'RAW_MATERIAL', true),
  ('Seat Cushion',        'SA-SEAT-CUSH',   0,   400.00, 'MANUFACTURE', 'RAW_MATERIAL', true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- LEVEL-0 FINISHED GOODS (procurement_type = MANUFACTURE)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, product_type, procure_on_demand) VALUES
  ('Dining Table',  'FG-DINING-TABLE',  8500.00, 4200.00, 'MANUFACTURE', 'FINISHED_GOOD', true),
  ('Office Chair',  'FG-OFFICE-CHAIR',  6200.00, 3100.00, 'MANUFACTURE', 'FINISHED_GOOD', true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- INVENTORY RECORDS (initial on-hand stock for raw materials)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT p.id, 
  CASE p.sku
    WHEN 'RM-WOOD-PANEL'   THEN 30
    WHEN 'RM-SANDPAPER'    THEN 200
    WHEN 'RM-VARNISH'      THEN 20
    WHEN 'RM-STEEL-ROD'    THEN 80
    WHEN 'RM-RUBBER-CAP'   THEN 150
    WHEN 'RM-BOLT-M8'      THEN 400
    WHEN 'RM-SCREW-M6-50'  THEN 50
    WHEN 'RM-TUBE-25'      THEN 40
    WHEN 'RM-WELD-ROD'     THEN 60
    WHEN 'RM-FOAM-50'      THEN 25
    WHEN 'RM-FABRIC'       THEN 30
    WHEN 'RM-WHEEL-5'      THEN 20
    ELSE 0
  END,
  0
FROM products p
WHERE p.sku IN (
  'RM-WOOD-PANEL','RM-SANDPAPER','RM-VARNISH',
  'RM-STEEL-ROD','RM-RUBBER-CAP','RM-BOLT-M8','RM-SCREW-M6-50',
  'RM-TUBE-25','RM-WELD-ROD','RM-FOAM-50','RM-FABRIC','RM-WHEEL-5'
)
ON CONFLICT (product_id) DO UPDATE
  SET on_hand_qty = EXCLUDED.on_hand_qty;

-- Zero inventory for sub-assemblies and finished goods (manufactured on demand)
INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
SELECT p.id, 0, 0
FROM products p
WHERE p.sku IN (
  'SA-TABLE-TOP','SA-LEG-ASSY','SA-CHAIR-FRAME','SA-SEAT-CUSH',
  'FG-DINING-TABLE','FG-OFFICE-CHAIR'
)
ON CONFLICT (product_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- BILLS OF MATERIALS
-- Level 2 BoMs: sub-assembly components (all raw material inputs)
-- ─────────────────────────────────────────────────────────────────────────────

-- BoM: Table Top = 2x Wood Panel + 4x Sandpaper + 1x Wood Varnish
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'SA-TABLE-TOP'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'RM-WOOD-PANEL' THEN 2
    WHEN 'RM-SANDPAPER'  THEN 4
    WHEN 'RM-VARNISH'    THEN 1
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'SA-TABLE-TOP'
CROSS JOIN products p
WHERE p.sku IN ('RM-WOOD-PANEL','RM-SANDPAPER','RM-VARNISH')
ON CONFLICT DO NOTHING;

-- BoM: Table Leg Assembly = 4x Steel Rod + 4x Rubber Foot Cap + 16x Leg Bolt M8
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'SA-LEG-ASSY'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'RM-STEEL-ROD'   THEN 4
    WHEN 'RM-RUBBER-CAP'  THEN 4
    WHEN 'RM-BOLT-M8'     THEN 16
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'SA-LEG-ASSY'
CROSS JOIN products p
WHERE p.sku IN ('RM-STEEL-ROD','RM-RUBBER-CAP','RM-BOLT-M8')
ON CONFLICT DO NOTHING;

-- BoM: Chair Frame = 4x Steel Tube 25mm + 2x Welding Rod
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'SA-CHAIR-FRAME'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'RM-TUBE-25'   THEN 4
    WHEN 'RM-WELD-ROD'  THEN 2
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'SA-CHAIR-FRAME'
CROSS JOIN products p
WHERE p.sku IN ('RM-TUBE-25','RM-WELD-ROD')
ON CONFLICT DO NOTHING;

-- BoM: Seat Cushion = 1x Foam Sheet + 1x Upholstery Fabric
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'SA-SEAT-CUSH'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'RM-FOAM-50' THEN 1
    WHEN 'RM-FABRIC'  THEN 1
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'SA-SEAT-CUSH'
CROSS JOIN products p
WHERE p.sku IN ('RM-FOAM-50','RM-FABRIC')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Level 1 BoMs: Finished goods (use sub-assemblies as components)
-- ─────────────────────────────────────────────────────────────────────────────

-- BoM: Dining Table = 1x Table Top + 1x Table Leg Assembly + 1x Screw Pack
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'FG-DINING-TABLE'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'SA-TABLE-TOP'  THEN 1
    WHEN 'SA-LEG-ASSY'   THEN 1
    WHEN 'RM-SCREW-M6-50' THEN 1
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'FG-DINING-TABLE'
CROSS JOIN products p
WHERE p.sku IN ('SA-TABLE-TOP','SA-LEG-ASSY','RM-SCREW-M6-50')
ON CONFLICT DO NOTHING;

-- BoM: Office Chair = 1x Chair Frame + 1x Seat Cushion + 1x Wheel Set
INSERT INTO boms (product_id)
SELECT id FROM products WHERE sku = 'FG-OFFICE-CHAIR'
ON CONFLICT DO NOTHING;

INSERT INTO bom_items (bom_id, component_product_id, quantity)
SELECT b.id, p.id,
  CASE p.sku
    WHEN 'SA-CHAIR-FRAME' THEN 1
    WHEN 'SA-SEAT-CUSH'   THEN 1
    WHEN 'RM-WHEEL-5'     THEN 1
  END
FROM boms b
JOIN products bp ON bp.id = b.product_id AND bp.sku = 'FG-OFFICE-CHAIR'
CROSS JOIN products p
WHERE p.sku IN ('SA-CHAIR-FRAME','SA-SEAT-CUSH','RM-WHEEL-5')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- VENDOR → PRODUCT MAPPINGS for all purchased raw materials
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_vendors (product_id, vendor_id)
SELECT p.id, v.id
FROM products p
CROSS JOIN vendors v
WHERE
  (p.sku IN ('RM-WOOD-PANEL','RM-SANDPAPER','RM-VARNISH') AND v.name = 'TimberCraft Supplies') OR
  (p.sku IN ('RM-STEEL-ROD','RM-TUBE-25','RM-WELD-ROD')   AND v.name = 'SteelWorks India') OR
  (p.sku IN ('RM-BOLT-M8','RM-RUBBER-CAP','RM-SCREW-M6-50') AND v.name = 'Hardware Hub') OR
  (p.sku IN ('RM-FOAM-50','RM-FABRIC')                     AND v.name = 'Foam & Fabric Co.') OR
  (p.sku IN ('RM-WHEEL-5')                                 AND v.name = 'Hardware Hub')
ON CONFLICT DO NOTHING;
