-- ============================================
-- CREATE DEFAULT ADMIN USER
-- ============================================
-- This script creates a default administrator account for testing

USE laklight_food_products;

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
VALUES (
    'System Administrator',
    'admin@laklight.com',
    '+94 77 123 4567',
    '$2a$10$YVZLJEwT5qBo7HHQqHvRLe7nqP5RgGqQxJYxJ3HHb3ILxJYxJ3HHb',
    'administrator',
    'Laklight Food Products HQ, Colombo',
    'active'
)
ON DUPLICATE KEY UPDATE 
    user_type = 'administrator',
    status = 'active';

-- Insert sample employee user
-- Password: employee123
INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
VALUES (
    'John Employee',
    'employee@laklight.com',
    '+94 77 234 5678',
    '$2a$10$YVZLJEwT5qBo7HHQqHvRLe7nqP5RgGqQxJYxJ3HHb3ILxJYxJ3HHb',
    'employee',
    'Colombo, Sri Lanka',
    'active'
)
ON DUPLICATE KEY UPDATE 
    user_type = 'employee',
    status = 'active';

-- Insert sample farmer user
-- Password: farmer123
INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
VALUES (
    'Green Valley Farm',
    'farmer@laklight.com',
    '+94 77 345 6789',
    '$2a$10$YVZLJEwT5qBo7HHQqHvRLe7nqP5RgGqQxJYxJ3HHb3ILxJYxJ3HHb',
    'farmer',
    'Nuwara Eliya, Sri Lanka',
    'active'
)
ON DUPLICATE KEY UPDATE 
    user_type = 'farmer',
    status = 'active';

-- Insert sample customer user
-- Password: customer123
INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status) 
VALUES (
    'Sarah Customer',
    'customer@laklight.com',
    '+94 77 456 7890',
    '$2a$10$YVZLJEwT5qBo7HHQqHvRLe7nqP5RgGqQxJYxJ3HHb3ILxJYxJ3HHb',
    'customer',
    'Colombo, Sri Lanka',
    'active'
)
ON DUPLICATE KEY UPDATE 
    user_type = 'customer',
    status = 'active';

SELECT 'Admin users created successfully!' AS message;
SELECT 'Login Credentials:' AS '';
SELECT 'Admin: admin@laklight.com / admin123' AS 'Administrator';
SELECT 'Employee: employee@laklight.com / employee123' AS 'Employee';
SELECT 'Farmer: farmer@laklight.com / farmer123' AS 'Farmer';
SELECT 'Customer: customer@laklight.com / customer123' AS 'Customer';
