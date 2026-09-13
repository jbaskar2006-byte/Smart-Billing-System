-- ============================================================
-- Smart Tiffin Shop Database Dump & Migration Script
-- Database: smart_tiffin_shop
-- Host: 127.0.0.1:3306 | User: root | Password: Root@123
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_tiffin_shop;
USE smart_tiffin_shop;

-- 1. Table: products
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS admins;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Tiffin Specialties',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (id, name, price, category, available) VALUES
(1, 'Idli', 30.00, 'Tiffin Specialties', TRUE),
(2, 'Vadai', 20.00, 'Hot Snacks', TRUE),
(3, 'Poori', 50.00, 'Tiffin Specialties', TRUE),
(4, 'Chapati', 40.00, 'Tiffin Specialties', TRUE),
(5, 'Pongal', 45.00, 'Tiffin Specialties', TRUE),
(6, 'Omelette', 25.00, 'Egg Specials', TRUE),
(7, 'Half Boil', 20.00, 'Egg Specials', TRUE);

-- 2. Table: orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  order_status VARCHAR(30) DEFAULT 'Received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO orders (id, order_number, total_amount, payment_status, order_status) VALUES
(1, 'TIFFIN-20260913-002', 46.00, 'SUCCESS', 'Completed');

-- 3. Table: order_items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES
(1, 1, 1, 'Idli', 10.00, 3, 30.00),
(2, 1, 2, 'Vadai', 8.00, 2, 16.00);

-- 4. Table: payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'Success',
  transaction_id VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO payments (id, order_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 1, 46.00, 'UPI/QR', 'Success', 'TXN-UPI-1789310461');

-- 5. Table: bills
CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_transaction_id VARCHAR(100) DEFAULT '',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO bills (id, order_id, bill_number, total_amount, payment_transaction_id) VALUES
(1, 1, 'BILL-20260913-001', 46.00, 'TXN-UPI-1789310461');

-- 6. Table: admins
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (id, username, password_hash) VALUES
(1, 'admin', '$2a$10$wN4o2bLdI8s5P1dD4z/jI.6h9G8e7f6c5b4a3Z2Y1X0W9V8U7T6S5');
