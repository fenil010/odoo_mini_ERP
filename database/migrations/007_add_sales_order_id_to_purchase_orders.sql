-- Add sales_order_id to purchase_orders table to link purchase orders to the originating sales order
ALTER TABLE purchase_orders ADD COLUMN sales_order_id INT REFERENCES sales_orders(id) ON DELETE SET NULL;
