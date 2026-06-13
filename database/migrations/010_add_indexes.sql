-- Add B-Tree indexes on high-frequency search and join foreign key columns
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items (sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON sales_order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON purchase_order_items (purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product_id ON stock_ledger (product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs (event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manufacturing_orders_sales_order_id ON manufacturing_orders (sales_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_sales_order_id ON purchase_orders (sales_order_id);
