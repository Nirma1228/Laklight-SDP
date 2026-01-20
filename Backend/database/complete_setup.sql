-- ============================================
-- LAKLIGHT FOOD PRODUCTS - COMPLETE DATABASE SETUP
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS laklight_food_products;
USE laklight_food_products;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'farmer', 'employee', 'administrator') NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('beverages', 'desserts', 'vegetables', 'fruits', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit ENUM('kg', 'g', 'bottle', 'pack', 'units', 'piece') NOT NULL,
    stock INT DEFAULT 0,
    availability ENUM('in-stock', 'low-stock', 'out-of-stock') DEFAULT 'in-stock',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Pending',
    order_status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_method ENUM('Card Payment', 'Online Banking', 'Cash on Delivery') NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================
-- 6. INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('fruit', 'product', 'raw-material') NOT NULL,
    stock INT NOT NULL,
    unit ENUM('kg', 'units', 'bottle', 'pack') NOT NULL,
    location VARCHAR(50),
    expiry_date DATE,
    status ENUM('good', 'warning', 'low', 'critical') DEFAULT 'good',
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 7. FARMER SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farmer_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category ENUM('fruits', 'vegetables', 'other') NOT NULL,
    variety VARCHAR(100),
    quantity DECIMAL(10, 2) NOT NULL,
    unit ENUM('kg', 'g', 'units') NOT NULL,
    grade ENUM('Grade A', 'Grade B', 'Grade C'),
    custom_price DECIMAL(10, 2),
    harvest_date DATE NOT NULL,
    transport ENUM('Self Transport', 'Company Truck Pickup'),
    delivery_date DATE,
    storage_instructions TEXT,
    images TEXT,
    notes TEXT,
    status ENUM('selected', 'under-review', 'not-selected') DEFAULT 'under-review',
    rejection_reason TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 8. DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES farmer_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 9. SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
);

-- ============================================
-- 10. SUPPLY HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS supply_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    supply_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- ============================================
-- 11. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_quality INT CHECK(product_quality BETWEEN 1 AND 5),
    packaging INT CHECK(packaging BETWEEN 1 AND 5),
    delivery_time INT CHECK(delivery_time BETWEEN 1 AND 5),
    customer_service INT CHECK(customer_service BETWEEN 1 AND 5),
    value_for_money INT CHECK(value_for_money BETWEEN 1 AND 5),
    feedback_text TEXT,
    improvements TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 12. FARMER APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farmer_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_name VARCHAR(100) NOT NULL,
    farm_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    farm_size VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    product_types VARCHAR(255),
    application_status ENUM('Pending Review', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending Review',
    rejection_reason TEXT,
    application_date DATE NOT NULL,
    reviewed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 13. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('Card Payment', 'Online Banking', 'Cash on Delivery') NOT NULL,
    card_number_last4 VARCHAR(4),
    card_name VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- 14. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 15. REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('inventory', 'sales', 'supplier', 'customer') NOT NULL,
    report_data JSON,
    generated_by INT NOT NULL,
    date_range VARCHAR(50),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_type ON users(user_type);
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_farmer_submission_status ON farmer_submissions(status);
CREATE INDEX idx_supplier_status ON suppliers(status);
CREATE INDEX idx_delivery_status ON deliveries(status);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample products
INSERT INTO products (name, category, description, price, unit, stock, availability, image_url) VALUES
('Lime Mix', 'beverages', 'Refreshing lime cordial 350ml', 150.00, 'bottle', 150, 'in-stock', '/images/Lime Mix.png'),
('Wood Apple Juice', 'beverages', 'Traditional wood apple nectar 200ml', 100.00, 'bottle', 200, 'in-stock', '/images/Wood Apple Juice.png'),
('Mango Jelly', 'desserts', 'Premium mango jelly 100g', 200.00, 'pack', 45, 'low-stock', '/images/Mango Jelly.png'),
('Custard Powder', 'desserts', 'Mango flavored custard powder 100g', 300.00, 'pack', 100, 'in-stock', '/images/Custard powder.png'),
('Fresh Tomatoes', 'vegetables', 'Fresh organic tomatoes', 350.00, 'kg', 80, 'in-stock', NULL),
('Honey', 'other', 'Pure organic honey', 1200.00, 'kg', 20, 'low-stock', NULL);

-- Insert sample inventory
INSERT INTO inventory (name, type, stock, unit, location, expiry_date, status, batch_number) VALUES
('Fresh Strawberry - Grade A', 'fruit', 15, 'kg', 'A-C1-R2', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'good', 'BATCH-001'),
('Organic Mango - Premium', 'fruit', 25, 'kg', 'A-C2-R1', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'good', 'BATCH-002'),
('Strawberry Jam - 500g', 'product', 45, 'units', 'C-C1-R1', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'good', 'PROD-001'),
('Mango Juice - 1L', 'product', 60, 'units', 'C-C1-R2', DATE_ADD(CURDATE(), INTERVAL 150 DAY), 'good', 'PROD-002');

-- Success message
SELECT 'Database setup completed successfully!' AS message;
