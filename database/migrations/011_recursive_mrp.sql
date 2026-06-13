-- Migration 011: Recursive MRP and Nested BoMs
-- Purpose: Adds parent_manufacturing_order_id to manufacturing_orders and manufacturing_order_id to purchase_orders

ALTER TABLE manufacturing_orders 
ADD COLUMN IF NOT EXISTS parent_manufacturing_order_id INT REFERENCES manufacturing_orders(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS manufacturing_order_id INT REFERENCES manufacturing_orders(id) ON DELETE SET NULL;

-- Add indexes to avoid N+1 issues or sequential scan bottlenecks for nested lookups
CREATE INDEX IF NOT EXISTS idx_mfg_parent_mo_id ON manufacturing_orders(parent_manufacturing_order_id);
CREATE INDEX IF NOT EXISTS idx_po_mfg_order_id ON purchase_orders(manufacturing_order_id);
