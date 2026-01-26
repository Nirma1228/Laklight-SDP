-- =============================================================
-- LAKLIGHT FOOD PRODUCTS - ULTIMATE MASTER DATABASE SCHEMA
-- Version 3.0 (Business Process Optimized)
-- Designed for: MySQL / MariaDB
-- =============================================================

DROP DATABASE IF EXISTS laklight_food_products;
CREATE DATABASE laklight_food_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laklight_food_products;

-- ============================================
-- 1. IDENTITY & AUTHENTICATION (Process: Registration & Login)
-- ============================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'farmer', 'employee', 'admin') NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'active',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auth (email, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    user_type VARCHAR(50),
    address TEXT,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. DUAL-STREAM INVENTORY (Process: Farmer Supply & Factory Output)
-- ============================================

-- Catalog definitions (The generic products seen by customers)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('beverages', 'desserts', 'vegetables', 'fruits', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unit ENUM('units', 'kg', 'bottle', 'pack') NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PART 1: FARMER PRODUCTS (Incoming Raw Material)
-- Low Stock: < 25kg | Expiry Alert: 5 Days Before
CREATE TABLE inventory_raw (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL, -- e.g., 'Fresh Strawberry'
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    received_date DATE,
    expiry_date DATE,
    storage_location VARCHAR(100), -- e.g., 'SEC-FR-01'
    status ENUM('good', 'low-stock', 'expiring', 'expired') DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_raw_stock (quantity_kg),
    INDEX idx_raw_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PART 2: FINISHED PRODUCTS (Processed & For Sale)
-- Low Stock: < 50 units | Expiry Alert: 90 Days Before
CREATE TABLE inventory_finished (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL, -- Link to catalog 'products' table
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    manufactured_date DATE,
    expiry_date DATE,
    quantity_units INT NOT NULL DEFAULT 0,
    storage_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_fin_stock (quantity_units),
    INDEX idx_fin_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. SALES & E-COMMERCE (Process: Cart, Discount & Checkout)
-- ============================================

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1, -- Rule: > 12 triggers discount logic in app
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'failed') DEFAULT 'unpaid',
    order_status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_method VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_flow (order_status, payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. SUPPLY CHAIN (Process: Farmer Submissions & Delivery)
-- ============================================

CREATE TABLE farmer_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category ENUM('fruits', 'vegetables', 'other') NOT NULL,
    variety VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    custom_price DECIMAL(10, 2),
    harvest_date DATE,
    images JSON, -- Storage for image URLs
    notes TEXT,
    status ENUM('under-review', 'selected', 'not-selected') DEFAULT 'under-review',
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    farmer_id INT NOT NULL,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    delivery_date DATE, -- The actual scheduled/final date
    rescheduled_date DATE, -- Temporarily holds employee's suggestion
    transport_method VARCHAR(50),
    status ENUM('under-review', 'confirmed', 'Action Required: Confirm Date', 'completed') DEFAULT 'under-review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES farmer_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. FEEDBACK & NOTIFICATIONS (Process: Engagement & Alerts)
-- ============================================

CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- Target recipient
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ORDER', 'FARMER_SUBMISSION', 'LOW_STOCK', 'EXPIRY_ALERT', 'GENERAL') DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notice (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. SYSTEM SEED DATA (For Immediate Testing)
-- ============================================

-- Dummy Admin (pw: laklight123)
-- Hash placeholder: $2a$10$W65S0H7.rMofYvWzO/wRyeVl6X8p58Zf3e8f8f8f8f8f8f8f8f8f
INSERT INTO users (full_name, email, phone, password_hash, user_type, status) VALUES 
('System Admin', 'admin@laklight.com', '0112345678', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', 'admin', 'active'),
('Factory Staff', 'staff@laklight.com', '0119876543', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', 'employee', 'active');

-- Initial Catalog
INSERT INTO products (name, category, description, price, unit) VALUES
('Lime Mix (350ml)', 'beverages', 'Premium lime cordial', 150.00, 'bottle'),
('Wood Apple Juice', 'beverages', 'Traditional nectar', 100.00, 'bottle'),
('Mango Jelly (100g)', 'desserts', 'Organic mango preserve', 200.00, 'pack');

-- Finish
SELECT '🚀 ULTIMATE MASTER SCHEMA GENERATED SUCCESSFULLY!' as Status;
SHOW TABLES;
