-- Smart Tiffin Shop Database Schema Script
-- Database Name: smart_tiffin_shop

CREATE DATABASE IF NOT EXISTS smart_tiffin_shop;
USE smart_tiffin_shop;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Tiffin Specialties',
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Pending', -- Pending, Completed, Failed
    order_status VARCHAR(30) DEFAULT 'Received',  -- Received, Preparing, Served, Completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
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

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- UPI/QR, Cash, Card
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Success',
    transaction_id VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DEFAULT FOOD PRODUCTS
INSERT INTO products (id, name, price, category, available) VALUES
(1, 'Idli', 30.00, 'Tiffin Specialties', TRUE),
(2, 'Vadai', 20.00, 'Hot Snacks', TRUE),
(3, 'Poori', 50.00, 'Tiffin Specialties', TRUE),
(4, 'Chapati', 40.00, 'Tiffin Specialties', TRUE),
(5, 'Pongal', 45.00, 'Tiffin Specialties', TRUE),
(6, 'Omelette', 25.00, 'Egg Specials', TRUE),
(7, 'Half Boil', 20.00, 'Egg Specials', TRUE)
ON DUPLICATE KEY UPDATE 
    name=VALUES(name), 
    price=VALUES(price), 
    category=VALUES(category), 
    available=VALUES(available);

-- SEED ADMIN USER (username: admin, password: admin123 hashed via bcrypt)
-- Bcrypt hash below corresponds to 'admin123'
INSERT INTO admins (id, username, password_hash) VALUES
(1, 'admin', '$2a$10$w09Zk.qQ7v41dJk1A92t1.1K51Y7W6E4L7C3N8J0H1G2F3E4D5C6B')
ON DUPLICATE KEY UPDATE username=VALUES(username);
