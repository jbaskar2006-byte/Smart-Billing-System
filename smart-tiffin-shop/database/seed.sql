-- Smart Tiffin Shop Seed Data
USE smart_tiffin_db;

-- Insert Categories
INSERT INTO categories (id, name, icon) VALUES
(1, 'Tiffin Specialties', 'sun'),
(2, 'Dosa Corner', 'disc'),
(3, 'Hot Snacks', 'flame'),
(4, 'Beverages', 'coffee'),
(5, 'Combo Meals', 'package')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Products
INSERT INTO products (id, category_id, name, price, image_url, is_available) VALUES
(1, 1, 'Hot Idli (2 Pcs)', 30.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300', 1),
(2, 1, 'Ghee Podi Idli', 55.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300', 1),
(3, 1, 'Poori Masala (2 Pcs)', 50.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300', 1),
(4, 1, 'Pongal Sambar', 45.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300', 1),
(5, 2, 'Plain Dosa', 40.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300', 1),
(6, 2, 'Masala Dosa', 65.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300', 1),
(7, 2, 'Ghee Roast Dosa', 75.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300', 1),
(8, 2, 'Onion Rava Dosa', 70.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300', 1),
(9, 3, 'Medu Vada (1 Pc)', 20.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300', 1),
(10, 3, 'Sambar Vada (2 Pcs)', 45.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300', 1),
(11, 3, 'Bajji Plate', 35.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300', 1),
(12, 4, 'South Indian Filter Coffee', 20.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300', 1),
(13, 4, 'Masala Tea', 15.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300', 1),
(14, 4, 'Badam Milk', 30.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300', 1),
(15, 5, 'Mini Tiffin Combo (Idli+Vada+Dosa+Coffee)', 99.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- Insert Default Admin (username: admin, password: adminpassword)
INSERT INTO admins (id, username, password_hash, name, role) VALUES
(1, 'admin', 'adminpassword', 'Shop Owner', 'Admin')
ON DUPLICATE KEY UPDATE username=VALUES(username);
