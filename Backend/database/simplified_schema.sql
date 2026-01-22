-- ============================================
-- LAKLIGHT FOOD PRODUCTS - SIMPLIFIED SQL SCHEMA
-- Removed unnecessary tables and redundancies
-- ============================================

CREATE DATABASE IF NOT EXISTS laklight_food_products;
USE laklight_food_products;

-- ============================================
-- 1. USER TABLE (Core authentication table)
-- ============================================
CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    ContactNo VARCHAR(15),
    Role ENUM('Customer', 'Farmer', 'Employee', 'Admin') NOT NULL,
    RegistrationDate DATE NOT NULL DEFAULT (CURRENT_DATE),
    Status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    LastLogin DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (EmailAddress),
    INDEX idx_role (Role)
);

-- ============================================
-- 2. CUSTOMER TABLE
-- ============================================
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL UNIQUE,
    DeliveryAddress VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID)
);

-- ============================================
-- 3. FARMER TABLE
-- ============================================
CREATE TABLE Farmer (
    FarmerID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL UNIQUE,
    FarmName VARCHAR(100) NOT NULL,
    FarmLocation VARCHAR(255) NOT NULL,
    LicenseNumber VARCHAR(50) NULL,
    BankDetails VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID)
);

-- ============================================
-- 4. EMPLOYEE TABLE
-- ============================================
CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL UNIQUE,
    Department VARCHAR(50) NOT NULL,
    Position VARCHAR(50) NOT NULL,
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2) CHECK (Salary >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID)
);

-- ============================================
-- 5. PRODUCTS TABLE (Merged finished products)
-- ============================================
CREATE TABLE Products (
    ProductID INT PRIMARY KEY AUTO_INCREMENT,
    ProductName VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Description TEXT,
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    StockQuantity INT DEFAULT 0 CHECK (StockQuantity >= 0),
    Unit ENUM('kg', 'g', 'bottle', 'pack', 'units', 'piece') NOT NULL,
    ImageUrl VARCHAR(255),
    Availability ENUM('in-stock', 'low-stock', 'out-of-stock') DEFAULT 'in-stock',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (Category),
    INDEX idx_availability (Availability)
);

-- ============================================
-- 6. ORDERS TABLE
-- ============================================
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    OrderNumber VARCHAR(50) UNIQUE NOT NULL,
    CustomerID INT NOT NULL,
    OrderDate DATE NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount >= 0),
    DiscountAmount DECIMAL(10,2) DEFAULT 0.00 CHECK (DiscountAmount >= 0),
    Status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    DeliveryAddress VARCHAR(255) NOT NULL,
    PaymentStatus ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Pending',
    DeliveryDate DATE NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    INDEX idx_customer (CustomerID),
    INDEX idx_status (Status),
    INDEX idx_order_date (OrderDate)
);

-- ============================================
-- 7. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE OrderItems (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL CHECK (TotalPrice >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_product (ProductID)
);

-- ============================================
-- 8. PAYMENTS TABLE
-- ============================================
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL UNIQUE,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount > 0),
    PaymentMethod VARCHAR(30) NOT NULL,
    PaymentStatus VARCHAR(20) DEFAULT 'Pending',
    TransactionID VARCHAR(50) UNIQUE NULL,
    PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_status (PaymentStatus)
);

-- ============================================
-- 9. FARMER SUBMISSIONS TABLE
-- ============================================
CREATE TABLE FarmerSubmissions (
    SubmissionID INT PRIMARY KEY AUTO_INCREMENT,
    FarmerID INT NOT NULL,
    ProductName VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    Unit ENUM('kg', 'g', 'units') NOT NULL,
    UnitPrice DECIMAL(10,2),
    HarvestDate DATE NOT NULL,
    Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    RejectionReason TEXT NULL,
    SubmissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReviewDate DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    INDEX idx_farmer (FarmerID),
    INDEX idx_status (Status)
);

-- ============================================
-- 10. DELIVERIES TABLE
-- ============================================
CREATE TABLE Deliveries (
    DeliveryID INT PRIMARY KEY AUTO_INCREMENT,
    DeliveryNumber VARCHAR(50) UNIQUE NOT NULL,
    FarmerID INT NOT NULL,
    SubmissionID INT NOT NULL,
    ScheduledDate DATE NOT NULL,
    DeliveryStatus ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    TransportType VARCHAR(30) NOT NULL,
    PickupLocation VARCHAR(255) NOT NULL,
    CompletedDate DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    FOREIGN KEY (SubmissionID) REFERENCES FarmerSubmissions(SubmissionID) ON DELETE CASCADE,
    INDEX idx_farmer (FarmerID),
    INDEX idx_status (DeliveryStatus),
    INDEX idx_date (ScheduledDate)
);

-- ============================================
-- 11. FEEDBACK TABLE (Merged Customer & Farmer feedback)
-- ============================================
CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    FeedbackType VARCHAR(50) NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT NOT NULL,
    Response TEXT NULL,
    FeedbackDate DATE NOT NULL,
    ResponseDate DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID),
    INDEX idx_type (FeedbackType),
    INDEX idx_date (FeedbackDate)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_user_status ON User(Status);
CREATE INDEX idx_user_registration ON User(RegistrationDate);
CREATE INDEX idx_product_name ON Products(ProductName);
CREATE INDEX idx_product_stock ON Products(StockQuantity);
CREATE INDEX idx_order_payment ON Orders(PaymentStatus);
CREATE INDEX idx_payment_date ON Payments(PaymentDate);
CREATE INDEX idx_submission_date ON FarmerSubmissions(SubmissionDate);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Simplified database schema created successfully!' AS Status;
SELECT 'Removed: Admin table (use User.Role instead)' AS Change1;
SELECT 'Merged: FarmerProduct and FinishedProduct into Products' AS Change2;
SELECT 'Merged: CustomerFeedback and FarmerFeedback into Feedback' AS Change3;
SELECT 'Removed: ProductInventory (use Products.StockQuantity)' AS Change4;
SELECT 'Removed: FarmerApplication (use FarmerSubmissions)' AS Change5;
SELECT 'Removed: Invoice table (can be generated from Orders+Payments)' AS Change6;
