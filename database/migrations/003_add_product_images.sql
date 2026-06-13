-- Migration: Add image URLs to existing products
-- Purpose: Populate image_url field with Cloudinary URLs for existing products
-- This updates products that already exist in the database

-- Update furniture/finished goods products with product images
UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%table%' AND product_type = 'FINISHED_GOOD' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1575692332385-c8a5c6b10f11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%chair%' AND product_type = 'FINISHED_GOOD' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1577597643526-d95ecd6c3b85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%shelf%' AND product_type = 'FINISHED_GOOD' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1565636192335-14f0b3e6c88f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%lamp%' AND product_type = 'FINISHED_GOOD' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1579927559692-8250bd27e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%conference%' AND product_type = 'FINISHED_GOOD' AND image_url IS NULL;

-- Update raw materials with material images
UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%wood%' AND product_type = 'RAW_MATERIAL' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1550259987-6f40542c475b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%steel%' AND product_type = 'RAW_MATERIAL' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1567016359222-32d7cf61b56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%glass%' AND product_type = 'RAW_MATERIAL' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%stain%' AND product_type = 'RAW_MATERIAL' AND image_url IS NULL;

UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE LOWER(name) LIKE '%screw%' AND product_type = 'RAW_MATERIAL' AND image_url IS NULL;

-- Generic fallback image for any remaining products without images
UPDATE products
SET image_url = 'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill,q_auto/https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
WHERE image_url IS NULL;

-- Verify the updates
SELECT 
  id,
  name,
  sku,
  product_type,
  CASE 
    WHEN image_url IS NOT NULL THEN '✓ Image attached' 
    ELSE '✗ No image'
  END as status
FROM products
ORDER BY product_type, name;
