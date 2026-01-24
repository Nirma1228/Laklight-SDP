-- Create Employee Account
-- Run this in phpMyAdmin SQL tab

-- First, check if employee exists
SELECT * FROM users WHERE email = 'employee@laklight.com';

-- If not exists, insert employee (password: employee123)
INSERT INTO users (full_name, email, phone, password_hash, user_type, address, status)
VALUES (
    'Employee User',
    'employee@laklight.com',
    '+94712345678',
    '$2a$10$xK7QqVZ8Qg.qFZxCCJK9/.wqmU5OwXZHLwFvvJ0VX4uXEjH8qmNh2',
    'employee',
    'Laklight Office, Colombo',
    'active'
);

-- Verify employee created
SELECT id, full_name, email, user_type, status FROM users WHERE email = 'employee@laklight.com';
