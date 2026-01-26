-- =============================================================
-- LAKLIGHT FOOD PRODUCTS - 3NF NORMALIZED MASTER SCHEMA (v4.0)
-- Optimized for: Performance, Data Integrity, and UI Functionality
-- =============================================================

DROP DATABASE IF EXISTS laklight_food_products;
CREATE DATABASE laklight_food_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laklight_food_products;

-- ============================================
-- 1. REFERENCE TABLES (3NF - Eliminating ENUMs/Redundancy)
-- ============================================

CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL -- 'customer', 'farmer', 'employee', 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE account_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL -- 'active', 'inactive', 'pending', 'suspended'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL -- 'beverages', 'desserts', 'vegetables', 'fruits', 'grains'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE measurement_units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unit_name VARCHAR(20) UNIQUE NOT NULL -- 'kg', 'g', 'bottle', 'pack', 'unit', 'piece'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL -- 'Pending', 'Processing', 'Ready', 'Shipped', 'Delivered', 'Cancelled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL -- 'unpaid', 'paid', 'failed', 'refunded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submission_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL -- 'under-review', 'selected', 'not-selected'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE delivery_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) UNIQUE NOT NULL -- 'under-review', 'confirmed', 'Action Required', 'completed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. IDENTITY & SECURITY
-- ============================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status_id INT NOT NULL,
    address TEXT,
    profile_image VARCHAR(255),
    last_login DATETIME NULL,
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(id),
    FOREIGN KEY (status_id) REFERENCES account_statuses(id),
    INDEX idx_user_lookup (email, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    flow_type ENUM('registration', 'password_reset') DEFAULT 'registration',
    user_data_json JSON, -- Stores temp registration data (fullName, role_id, etc.)
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_auth (email, otp, flow_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. PRODUCT CATALOG SOFTWARE
-- ============================================

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unit_id INT NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (unit_id) REFERENCES measurement_units(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. INVENTORY CONTROL (3NF Splitting Raw vs Finished)
-- ============================================

-- Reference for Raw Material types (to avoid redundant strings)
CREATE TABLE raw_material_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_raw (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_type_id INT NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    received_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    storage_location VARCHAR(100),
    FOREIGN KEY (material_type_id) REFERENCES raw_material_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_finished (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    manufactured_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_units INT NOT NULL DEFAULT 0,
    storage_location VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. SALES & ORDER FULFILLMENT
-- ============================================

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    payment_status_id INT NOT NULL,
    order_status_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id),
    FOREIGN KEY (order_status_id) REFERENCES order_statuses(id)
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
    status_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. FARMER RELATIONS
-- ============================================

CREATE TABLE farmer_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE farmer_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_id INT NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    custom_price DECIMAL(10, 2),
    harvest_date DATE,
    status_id INT NOT NULL,
    rejection_reason TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (unit_id) REFERENCES measurement_units(id),
    FOREIGN KEY (status_id) REFERENCES submission_statuses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    final_delivery_date DATE,
    proposed_reschedule_date DATE,
    transport_method VARCHAR(50),
    status_id INT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES farmer_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES delivery_statuses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. ENGAGEMENT & SYSTEM
-- ============================================

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. REFERENCE DATA & SEEDING
-- ============================================

-- User Roles
INSERT INTO user_roles (role_name) VALUES ('customer'), ('farmer'), ('employee'), ('admin');

-- Account Statuses
INSERT INTO account_statuses (status_name) VALUES ('active'), ('inactive'), ('pending'), ('suspended');

-- Categories
INSERT INTO product_categories (category_name) VALUES ('beverages'), ('desserts'), ('vegetables'), ('fruits'), ('other');

-- Units
INSERT INTO measurement_units (unit_name) VALUES ('kg'), ('g'), ('bottle'), ('pack'), ('unit'), ('piece');

-- Order Statuses
INSERT INTO order_statuses (status_name) VALUES ('Pending'), ('Processing'), ('Ready'), ('Shipped'), ('Delivered'), ('Cancelled');

-- Payment Statuses
INSERT INTO payment_statuses (status_name) VALUES ('unpaid'), ('paid'), ('failed'), ('refunded');

-- Submission Statuses
INSERT INTO submission_statuses (status_name) VALUES ('under-review'), ('selected'), ('not-selected');

-- Delivery Statuses
INSERT INTO delivery_statuses (status_name) VALUES ('under-review'), ('confirmed'), ('Action Required: Confirm Date'), ('completed');

-- Raw Material Types
INSERT INTO raw_material_types (material_name, category_id) VALUES 
('Lime', 4), ('Wood Apple', 4), ('Carrot', 3), ('Leeks', 3);

-- Default Admin
INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id) VALUES 
('System Administrator', 'admin@laklight.com', '0112345678', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', 4, 1);

-- Sample Product
INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, is_available) VALUES
('Premium Lime Mix', 1, 'Refreshing natural lime juice', 150.00, 3, 100, TRUE);

SELECT '🚀 3NF MASTER SCHEMA (v4.0) READY FOR DEPLOYMENT!' as status;
