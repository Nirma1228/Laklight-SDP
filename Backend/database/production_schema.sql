-- ============================================
-- LAKLIGHT FOOD PRODUCTS - PRODUCTION DATABASE
-- Final Corrected Schema for MySQL Workbench
-- ============================================

DROP DATABASE IF EXISTS laklight_food_products;
CREATE DATABASE laklight_food_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laklight_food_products;

-- ============================================
-- 1. USERS TABLE (All user types)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'farmer', 'employee', 'admin') NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('beverages', 'desserts', 'vegetables', 'fruits', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    unit ENUM('kg', 'g', 'bottle', 'pack', 'units', 'piece') NOT NULL,
    stock INT DEFAULT 0 CHECK (stock >= 0),
    availability ENUM('in-stock', 'low-stock', 'out-of-stock') DEFAULT 'in-stock',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_availability (availability),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. CART TABLE
-- ============================================
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Pending',
    order_status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_method ENUM('Card Payment', 'Online Banking', 'Cash on Delivery') NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    payment_method ENUM('Card Payment', 'Online Banking', 'Cash on Delivery') NOT NULL,
    card_number_last4 VARCHAR(4),
    card_name VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (payment_status),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. INVENTORY TABLE
-- ============================================
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('fruit', 'product', 'raw-material') NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0),
    unit ENUM('kg', 'units', 'bottle', 'pack', 'g') NOT NULL,
    location VARCHAR(50),
    expiry_date DATE,
    status ENUM('good', 'warning', 'low', 'critical', 'expired') DEFAULT 'good',
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_expiry (expiry_date),
    INDEX idx_batch (batch_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. FARMER SUBMISSIONS TABLE
-- ============================================
CREATE TABLE farmer_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category ENUM('fruits', 'vegetables', 'other') NOT NULL,
    variety VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit ENUM('kg', 'g', 'units') NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    custom_price DECIMAL(10, 2) CHECK (custom_price >= 0),
    harvest_date DATE NOT NULL,
    transport ENUM('Self Transport', 'Company Truck Pickup'),
    delivery_date DATE,
    storage_instructions TEXT,
    images TEXT,
    notes TEXT,
    status ENUM('selected', 'under-review', 'not-selected') DEFAULT 'under-review',
    rejection_reason TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer (farmer_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_submission_date (submission_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. DELIVERIES TABLE
-- ============================================
CREATE TABLE deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    submission_id INT NOT NULL,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    proposed_date DATE NOT NULL,
    schedule_date DATE,
    transport_method VARCHAR(100),
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES farmer_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id),
    INDEX idx_farmer (farmer_id),
    INDEX idx_status (status),
    INDEX idx_schedule_date (schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. FARMER PROFILES TABLE (Extended farmer info)
-- ============================================
CREATE TABLE farmer_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(100) NOT NULL,
    farm_location VARCHAR(255) NOT NULL,
    product_types VARCHAR(255),
    license_number VARCHAR(50),
    farm_size VARCHAR(50),
    capacity VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    total_deliveries INT DEFAULT 0 CHECK (total_deliveries >= 0),
    total_submissions INT DEFAULT 0 CHECK (total_submissions >= 0),
    bank_details VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer (farmer_id),
    INDEX idx_rating (rating),
    INDEX idx_farm_name (farm_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. FARMER DELIVERY HISTORY TABLE
-- ============================================
CREATE TABLE farmer_delivery_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    delivery_date DATE NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer (farmer_id),
    INDEX idx_delivery_date (delivery_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. FEEDBACK TABLE
-- ============================================
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_quality INT CHECK(product_quality BETWEEN 1 AND 5),
    packaging INT CHECK(packaging BETWEEN 1 AND 5),
    delivery_time INT CHECK(delivery_time BETWEEN 1 AND 5),
    customer_service INT CHECK(customer_service BETWEEN 1 AND 5),
    value_for_money INT CHECK(value_for_money BETWEEN 1 AND 5),
    feedback_text TEXT,
    improvements TEXT,
    response TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. FARMER APPLICATIONS TABLE
-- ============================================
CREATE TABLE farmer_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_name VARCHAR(100) NOT NULL,
    farm_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    farm_size VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    product_types VARCHAR(255),
    application_status ENUM('Pending Review', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending Review',
    rejection_reason TEXT,
    application_date DATE NOT NULL,
    reviewed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (application_status),
    INDEX idx_email (email),
    INDEX idx_application_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 14. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 15. REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('inventory', 'sales', 'farmer', 'customer', 'delivery') NOT NULL,
    report_data JSON,
    generated_by INT NOT NULL,
    date_range VARCHAR(50),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (report_type),
    INDEX idx_generated_by (generated_by),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Sample Products
INSERT INTO products (name, category, description, price, unit, stock, availability, image_url) VALUES
('Lime Mix', 'beverages', 'Refreshing lime cordial 350ml', 150.00, 'bottle', 150, 'in-stock', '/images/Lime Mix.png'),
('Wood Apple Juice', 'beverages', 'Traditional wood apple nectar 200ml', 100.00, 'bottle', 200, 'in-stock', '/images/Wood Apple Juice.png'),
('Mango Jelly', 'desserts', 'Premium mango jelly 100g', 200.00, 'pack', 45, 'low-stock', '/images/Mango Jelly.png'),
('Custard Powder', 'desserts', 'Mango flavored custard powder 100g', 300.00, 'pack', 100, 'in-stock', '/images/Custard powder.png'),
('Fresh Tomatoes', 'vegetables', 'Fresh organic tomatoes', 350.00, 'kg', 80, 'in-stock', NULL),
('Honey', 'other', 'Pure organic honey', 1200.00, 'kg', 20, 'low-stock', NULL),
('Strawberry Jam', 'desserts', 'Homemade strawberry jam 500g', 450.00, 'bottle', 60, 'in-stock', NULL),
('Orange Juice', 'beverages', 'Fresh squeezed orange juice 1L', 250.00, 'bottle', 75, 'in-stock', NULL);

-- Sample Inventory
INSERT INTO inventory (name, type, stock, unit, location, expiry_date, status, batch_number) VALUES
('Fresh Strawberry - Grade A', 'fruit', 15, 'kg', 'A-C1-R2', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'good', 'BATCH-001'),
('Organic Mango - Premium', 'fruit', 25, 'kg', 'A-C2-R1', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'good', 'BATCH-002'),
('Strawberry Jam - 500g', 'product', 45, 'units', 'C-C1-R1', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'good', 'PROD-001'),
('Mango Juice - 1L', 'product', 60, 'units', 'C-C1-R2', DATE_ADD(CURDATE(), INTERVAL 150 DAY), 'good', 'PROD-002'),
('Sugar - White', 'raw-material', 500, 'kg', 'D-C3-R1', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'good', 'RAW-001');

-- Sample System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('wholesale_threshold', '12', 'number', 'Minimum quantity for wholesale discount'),
('wholesale_discount', '0.10', 'decimal', 'Wholesale discount percentage (10%)'),
('low_stock_threshold', '20', 'number', 'Stock level for low stock alert'),
('critical_stock_threshold', '5', 'number', 'Stock level for critical stock alert');

-- Sample Farmer Profiles (if needed)
-- Uncomment when you have farmer users created
-- INSERT INTO farmer_profiles (farmer_id, farm_name, farm_location, product_types, license_number, farm_size, rating) VALUES
-- (2, 'Green Valley Farm', 'Kandy, Central Province', 'Fruits, Vegetables', 'AG202401', '5 acres', 4.5);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database created successfully!' AS Status,
       'Total Tables: 15' AS Tables,
       'Sample data inserted' AS Data,
       'Using Farmer terminology throughout' AS Note,
       'Ready for production use' AS Ready;

-- Show all tables
SHOW TABLES;
