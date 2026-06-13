-- Replace legacy Cloudinary fetch URLs with direct, verified image URLs.
UPDATE products
SET image_url = CASE
  WHEN LOWER(name) LIKE '%table%' THEN
    'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=800&q=80'
  ELSE
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
END
WHERE image_url LIKE 'https://res.cloudinary.com/%/image/fetch/%';
