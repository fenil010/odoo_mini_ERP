-- Migration: Add image_url and product_type columns to products table
-- Purpose: Enable product image storage via Cloudinary and classify products as finished goods or raw materials
-- Created: 2026-06-13

-- Add image_url column for Cloudinary CDN image URLs
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add product_type column to classify products
-- Valid values: FINISHED_GOOD, RAW_MATERIAL
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type VARCHAR(30);

-- Add constraint to enforce valid product types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_product_type'
      AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT check_product_type
    CHECK (product_type IN ('FINISHED_GOOD', 'RAW_MATERIAL'));
  END IF;
END
$$;

-- Update existing products with default product type based on procurement type
-- FINISHED_GOOD products are typically manufactured or bought assembled
UPDATE products
SET product_type = 'FINISHED_GOOD'
WHERE procurement_type IN ('MANUFACTURE', 'BUY') 
AND product_type IS NULL;

-- RAW_MATERIAL products are typically used as components in BOMs
UPDATE products
SET product_type = 'RAW_MATERIAL'
WHERE procurement_type = 'MTO' 
AND product_type IS NULL;

-- Populate sample Cloudinary URLs for demo products
-- These can be replaced with actual product images
UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill,q_auto/https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3'
WHERE sku = 'SKU-001' AND name LIKE '%Table%';

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill,q_auto/https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3'
WHERE sku = 'SKU-002' AND name LIKE '%Wood%';

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill,q_auto/https://images.unsplash.com/photo-1565794577670-e50cd90b2637?ixlib=rb-4.0.3'
WHERE sku = 'SKU-003' AND name LIKE '%Chair%';

-- Verify the migration
SELECT id, name, sku, product_type, image_url IS NOT NULL as has_image, created_at
FROM products
ORDER BY id;
