-- Add shipping, packing, manufacturing, and other charges to products table
ALTER TABLE products 
ADD COLUMN shipping_charge DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN packing_charge DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN manufacturing_charge DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN other_charge DECIMAL(12,2) DEFAULT 0.00;
