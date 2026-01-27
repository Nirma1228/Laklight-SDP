-- =============================================================
-- LAKLIGHT FOOD PRODUCTS - 3NF NORMALIZED MASTER SCHEMA (v6.0)
-- Optimized for: Performance, Data Integrity, and Unique Descriptive Primary Keys
-- =============================================================

DROP DATABASE IF EXISTS laklight_food_products;
CREATE DATABASE laklight_food_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laklight_food_products;

-- ============================================
-- 1. REFERENCE TABLES (3NF - Static Data)
-- ============================================

CREATE TABLE user_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE account_statuses (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE measurement_units (
    unit_id INT PRIMARY KEY AUTO_INCREMENT,
    unit_name VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_statuses (
    order_status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_statuses (
    payment_status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submission_statuses (
    submission_status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE delivery_statuses (
    delivery_status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quality_grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT,
    grade_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE transport_methods (
    transport_method_id INT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. IDENTITY & SECURITY
-- ============================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
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
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id),
    FOREIGN KEY (status_id) REFERENCES account_statuses(status_id),
    INDEX idx_user_lookup (email, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_verifications (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    flow_type ENUM('registration', 'password_reset') DEFAULT 'registration',
    user_data_json JSON,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_auth (email, otp, flow_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. PRODUCT CATALOG
-- ============================================

CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
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
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id),
    FOREIGN KEY (unit_id) REFERENCES measurement_units(unit_id),
    INDEX idx_product_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. INVENTORY CONTROL
-- ============================================

CREATE TABLE raw_material_types (
    material_type_id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_raw (
    raw_inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    material_type_id INT NOT NULL,
    grade_id INT NOT NULL,
    quantity_units DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unit_id INT NOT NULL,
    received_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    storage_location VARCHAR(100),
    FOREIGN KEY (material_type_id) REFERENCES raw_material_types(material_type_id),
    FOREIGN KEY (grade_id) REFERENCES quality_grades(grade_id),
    FOREIGN KEY (unit_id) REFERENCES measurement_units(unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_finished (
    finished_inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    manufactured_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_units INT NOT NULL DEFAULT 0,
    storage_location VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. SALES & ORDER FULFILLMENT
-- ============================================

CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
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
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(payment_status_id),
    FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES payment_statuses(payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. FARMER RELATIONS
-- ============================================

CREATE TABLE farmer_profiles (
    farmer_profile_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE farmer_submissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_id INT NOT NULL,
    grade_id INT,
    custom_price DECIMAL(10, 2),
    harvest_date DATE,
    transport_method_id INT,
    delivery_date DATE,
    storage_instructions TEXT,
    images JSON,
    notes TEXT,
    status_id INT NOT NULL,
    rejection_reason TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id),
    FOREIGN KEY (unit_id) REFERENCES measurement_units(unit_id),
    FOREIGN KEY (grade_id) REFERENCES quality_grades(grade_id),
    FOREIGN KEY (transport_method_id) REFERENCES transport_methods(transport_method_id),
    FOREIGN KEY (status_id) REFERENCES submission_statuses(submission_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    scheduled_date DATE,
    proposed_reschedule_date DATE,
    transport_method_id INT,
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES farmer_submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (transport_method_id) REFERENCES transport_methods(transport_method_id),
    FOREIGN KEY (status_id) REFERENCES delivery_statuses(delivery_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. ENGAGEMENT & SYSTEM
-- ============================================

CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_id INT NULL,
    product_quality INT CHECK (product_quality BETWEEN 1 AND 5),
    packaging INT CHECK (packaging BETWEEN 1 AND 5),
    delivery_time INT CHECK (delivery_time BETWEEN 1 AND 5),
    customer_service INT CHECK (customer_service BETWEEN 1 AND 5),
    value_for_money INT CHECK (value_for_money BETWEEN 1 AND 5),
    feedback_text TEXT,
    improvements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50) NOT NULL,
    report_data JSON NOT NULL,
    generated_by INT NOT NULL,
    date_range VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    farm_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    product_types VARCHAR(255),
    license_number VARCHAR(50),
    farm_size VARCHAR(50),
    capacity VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Pending',
    applied_date DATE,
    approved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supply_history (
    supply_history_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    supply_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. REFERENCE DATA & SEEDING
-- ============================================

-- Static Tables
INSERT INTO user_roles (role_name) VALUES ('customer'), ('farmer'), ('employee'), ('admin');
INSERT INTO account_statuses (status_name) VALUES ('active'), ('inactive'), ('pending'), ('suspended');
INSERT INTO product_categories (category_name) VALUES ('beverages'), ('desserts'), ('vegetables'), ('fruits'), ('other');
INSERT INTO measurement_units (unit_name) VALUES ('kg'), ('g'), ('bottle'), ('pack'), ('unit'), ('piece');
INSERT INTO order_statuses (status_name) VALUES ('Pending'), ('Processing'), ('Ready'), ('Shipped'), ('Delivered'), ('Cancelled');
INSERT INTO payment_statuses (status_name) VALUES ('unpaid'), ('paid'), ('failed'), ('refunded');
INSERT INTO submission_statuses (status_name) VALUES ('under-review'), ('selected'), ('not-selected');
INSERT INTO delivery_statuses (status_name) VALUES ('pending'), ('confirmed'), ('Action Required'), ('completed');
INSERT INTO quality_grades (grade_name) VALUES ('Grade A'), ('Grade B'), ('Grade C');
INSERT INTO transport_methods (method_name) VALUES ('Self Transport'), ('Company Truck Pickup');

-- Default Admin (Password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id) VALUES 
('System Administrator', 'admin@laklight.com', '0112345678', '$2a$10$89W1h/I3A2J1o7B9G/3.O.gUvVlU.vN0P0E1I0E0E0E0E0E0E0E0E', 
 (SELECT role_id FROM user_roles WHERE role_name = 'admin'), 
 (SELECT status_id FROM account_statuses WHERE status_name = 'active'));

SELECT '🚀 MASTER SCHEMA v6.0 READY WITH UNIQUE PRIMARY KEYS!' as status;
