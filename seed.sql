USE amazon_clone;

INSERT INTO users (name, email, password, role, account_type, location)
SELECT * FROM (
  SELECT 'Admin User' AS name, 'admin@amazon.local' AS email, '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' AS password, 'admin' AS role, 'premium' AS account_type, 'New York' AS location
) AS one_admin
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.role = 'admin'
);

INSERT INTO users (name, email, password, role, account_type, location)
SELECT * FROM (
  SELECT 'Alice User' AS name, 'alice@amazon.local' AS email, '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' AS password, 'user' AS role, 'free' AS account_type, 'Texas' AS location
  UNION ALL
  SELECT 'Bob User', 'bob@amazon.local', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 'pro', 'California'
) AS seed_users
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = seed_users.email
);

INSERT INTO categories (name) VALUES
('Electronics'),
('Books'),
('Fashion'),
('Home'),
('Sports');

INSERT INTO products (name, description, image_url, price, category_id, availability, visibility_tier) VALUES
('Wireless Earbuds', 'Noise-canceling earbuds with long battery life.', '/images/wireless-earbuds.png', 59.99, 1, 1, 'free'),
('Smartphone X2', '6.5-inch display smartphone with 128GB storage.', 'https://source.unsplash.com/800x800/?smartphone', 699.00, 1, 1, 'pro'),
('Gaming Laptop Pro', 'High-performance laptop for gaming and work.', 'https://source.unsplash.com/800x800/?gaming-laptop', 1499.99, 1, 1, 'premium'),
('Mystery Novel Collection', 'Set of 5 best-selling mystery novels.', '/images/mystery-novel.webp', 39.50, 2, 1, 'free'),
('JavaScript Mastery', 'Comprehensive JavaScript guide for developers.', '/images/javascript.jpg', 29.99, 2, 1, 'free'),
('Men Casual Jacket', 'Comfortable and stylish jacket for daily wear.', 'https://source.unsplash.com/800x800/?mens-jacket', 79.00, 3, 1, 'free'),
('Women Running Shoes', 'Lightweight running shoes with great grip.', 'https://source.unsplash.com/800x800/?running-shoes', 110.00, 3, 1, 'pro'),
('Air Fryer 5L', 'Healthy cooking air fryer with digital controls.', '/images/air fryer.webp', 129.99, 4, 1, 'free'),
('Robot Vacuum', 'Automatic vacuum cleaner with smart mapping.', 'https://source.unsplash.com/800x800/?robot-vacuum', 349.99, 4, 1, 'pro'),
('Yoga Mat Premium', 'Thick anti-slip yoga mat for fitness.', '/images/yoga mat.webp', 45.00, 5, 1, 'free'),
('Adjustable Dumbbells', 'Space-saving dumbbells for home workouts.', 'https://source.unsplash.com/800x800/?dumbbells', 219.00, 5, 1, 'pro'),
('4K Smart TV 55', 'Ultra HD smart TV with HDR support.', 'https://source.unsplash.com/800x800/?smart-tv', 899.99, 1, 1, 'premium'),
('Coffee Maker Deluxe', 'Programmable coffee maker with thermal carafe.', '/images/coffee maker deluxe.webp', 159.99, 4, 1, 'free'),
('Bluetooth Speaker', 'Portable speaker with deep bass and waterproof body.', 'https://source.unsplash.com/800x800/?bluetooth-speaker', 89.90, 1, 1, 'free'),
('Premium Leather Bag', 'Handcrafted leather bag for professionals.', 'https://source.unsplash.com/800x800/?leather-bag', 249.99, 3, 1, 'premium'),
('Noise Cancelling Headphones', 'Over-ear headphones with premium active noise cancellation.', 'https://source.unsplash.com/800x800/?headphones', 199.99, 1, 1, 'pro'),
('E-Reader Plus', 'Lightweight e-reader with warm light and long battery life.', 'https://source.unsplash.com/800x800/?ereader', 139.99, 1, 1, 'free'),
('Smart Fitness Watch', 'Track workouts, heart rate, sleep and daily steps.', 'https://source.unsplash.com/800x800/?fitness-watch', 179.00, 1, 1, 'pro'),
('Cookware Set 12pc', 'Non-stick cookware set for everyday family cooking.', 'https://source.unsplash.com/800x800/?cookware', 209.00, 4, 1, 'free'),
('Office Chair Ergonomic', 'Lumbar support ergonomic chair for long work sessions.', 'https://source.unsplash.com/800x800/?office-chair', 269.00, 4, 1, 'pro'),
('Travel Backpack 40L', 'Water-resistant backpack with laptop compartment.', 'https://source.unsplash.com/800x800/?travel-backpack', 69.00, 3, 1, 'free'),
('Men Formal Shoes', 'Classic formal shoes for office and events.', 'https://source.unsplash.com/800x800/?formal-shoes', 119.00, 3, 1, 'pro'),
('Resistance Bands Kit', 'Complete resistance bands set for home workouts.', 'https://source.unsplash.com/800x800/?resistance-bands', 35.00, 5, 1, 'free'),
('Mountain Bike Helmet', 'Lightweight ventilated helmet for road and trail.', 'https://source.unsplash.com/800x800/?bike-helmet', 79.00, 5, 1, 'free'),
('Luxury Wristwatch', 'Premium stainless steel wristwatch with sapphire glass.', 'https://source.unsplash.com/800x800/?luxury-watch', 599.00, 3, 1, 'premium');

INSERT INTO order_statuses (code, label, sort_order, is_terminal) VALUES
('pending', 'Pending', 1, 0),
('approved', 'Approved', 2, 0),
('rejected', 'Rejected', 3, 1),
('shipping', 'Shipping', 4, 0),
('reached', 'Reached', 5, 0),
('delivered', 'Delivered', 6, 1),
('delayed', 'Delayed', 7, 0);

INSERT INTO order_status_transitions (from_status, to_status, actor_role, requires_reason) VALUES
('pending', 'approved', 'admin', 0),
('pending', 'rejected', 'admin', 0),
('approved', 'shipping', 'admin', 0),
('shipping', 'reached', 'admin', 0),
('reached', 'delivered', 'admin', 0),
('approved', 'delayed', 'admin', 1),
('shipping', 'delayed', 'admin', 1),
('reached', 'delayed', 'admin', 1),
('delayed', 'shipping', 'admin', 0),
('delayed', 'reached', 'admin', 0);

INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 1, 2),
(2, 4, 1),
(3, 2, 1);

INSERT INTO orders (user_id, product_id, quantity, status, delay_reason) VALUES
(2, 1, 1, 'pending', NULL),
(2, 4, 1, 'rejected', NULL),
(3, 2, 1, 'shipping', NULL),
(3, 7, 1, 'delayed', 'Weather disruption in transit.');

INSERT INTO notifications (user_id, message, is_read) VALUES
(2, 'Order #1 placed and waiting for admin review.', 0),
(2, 'Order #2 status changed from pending to rejected.', 1),
(3, 'Order #3 status changed from approved to shipping.', 0),
(3, 'Order #4 status changed from shipping to delayed. Reason: Weather disruption in transit.', 0);
