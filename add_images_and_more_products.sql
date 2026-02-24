USE amazon_clone;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NOT NULL DEFAULT 'https://source.unsplash.com/800x800/?product';

UPDATE products SET image_url = '/images/wireless-earbuds.png' WHERE name = 'Wireless Earbuds';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?smartphone' WHERE name = 'Smartphone X2';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?gaming-laptop' WHERE name = 'Gaming Laptop Pro';
UPDATE products SET image_url = '/images/mystery-novel.webp' WHERE name = 'Mystery Novel Collection';
UPDATE products SET image_url = '/images/javascript.jpg' WHERE name = 'JavaScript Mastery';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?mens-jacket' WHERE name = 'Men Casual Jacket';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?running-shoes' WHERE name = 'Women Running Shoes';
UPDATE products SET image_url = '/images/air fryer.webp' WHERE name = 'Air Fryer 5L';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?robot-vacuum' WHERE name = 'Robot Vacuum';
UPDATE products SET image_url = '/images/yoga mat.webp' WHERE name = 'Yoga Mat Premium';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?dumbbells' WHERE name = 'Adjustable Dumbbells';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?smart-tv' WHERE name = '4K Smart TV 55';
UPDATE products SET image_url = '/images/coffee maker deluxe.webp' WHERE name = 'Coffee Maker Deluxe';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?bluetooth-speaker' WHERE name = 'Bluetooth Speaker';
UPDATE products SET image_url = 'https://source.unsplash.com/800x800/?leather-bag' WHERE name = 'Premium Leather Bag';

INSERT INTO products (name, description, image_url, price, category_id, availability, visibility_tier)
SELECT * FROM (
  SELECT 'Noise Cancelling Headphones' AS name, 'Over-ear headphones with premium active noise cancellation.' AS description, 'https://source.unsplash.com/800x800/?headphones' AS image_url, 199.99 AS price, 1 AS category_id, 1 AS availability, 'pro' AS visibility_tier
  UNION ALL SELECT 'E-Reader Plus', 'Lightweight e-reader with warm light and long battery life.', 'https://source.unsplash.com/800x800/?ereader', 139.99, 1, 1, 'free'
  UNION ALL SELECT 'Smart Fitness Watch', 'Track workouts, heart rate, sleep and daily steps.', 'https://source.unsplash.com/800x800/?fitness-watch', 179.00, 1, 1, 'pro'
  UNION ALL SELECT 'Cookware Set 12pc', 'Non-stick cookware set for everyday family cooking.', 'https://source.unsplash.com/800x800/?cookware', 209.00, 4, 1, 'free'
  UNION ALL SELECT 'Office Chair Ergonomic', 'Lumbar support ergonomic chair for long work sessions.', 'https://source.unsplash.com/800x800/?office-chair', 269.00, 4, 1, 'pro'
  UNION ALL SELECT 'Travel Backpack 40L', 'Water-resistant backpack with laptop compartment.', 'https://source.unsplash.com/800x800/?travel-backpack', 69.00, 3, 1, 'free'
  UNION ALL SELECT 'Men Formal Shoes', 'Classic formal shoes for office and events.', 'https://source.unsplash.com/800x800/?formal-shoes', 119.00, 3, 1, 'pro'
  UNION ALL SELECT 'Resistance Bands Kit', 'Complete resistance bands set for home workouts.', 'https://source.unsplash.com/800x800/?resistance-bands', 35.00, 5, 1, 'free'
  UNION ALL SELECT 'Mountain Bike Helmet', 'Lightweight ventilated helmet for road and trail.', 'https://source.unsplash.com/800x800/?bike-helmet', 79.00, 5, 1, 'free'
  UNION ALL SELECT 'Luxury Wristwatch', 'Premium stainless steel wristwatch with sapphire glass.', 'https://source.unsplash.com/800x800/?luxury-watch', 599.00, 3, 1, 'premium'
) AS new_products
WHERE NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p.name = new_products.name
);
