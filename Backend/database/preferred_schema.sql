-- ============================================
-- LAKLIGHT FOOD PRODUCTS - PREFERRED DATABASE SCHEMA
-- Fixed and Optimized Version
-- ============================================

DROP DATABASE IF EXISTS laklight_food_products;
CREATE DATABASE laklight_food_products;
USE laklight_food_products;

-- ============================================
-- 1. USER TABLE (Base table for all users)
-- ============================================
CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL, -- Added for security
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
    UserID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    ContactNo VARCHAR(15) NOT NULL,
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
    UserID INT NOT NULL,
    FarmName VARCHAR(100) NOT NULL,
    FarmLocation VARCHAR(255) NOT NULL,
    LicenseNumber VARCHAR(50) NULL,
    BankDetails VARCHAR(100) NOT NULL,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    TotalDeliveries INT DEFAULT 0,
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
    UserID INT NOT NULL,
    Department VARCHAR(50) NOT NULL,
    Position VARCHAR(50) NOT NULL, -- Fixed: Was DECIMAL
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID),
    INDEX idx_department (Department)
);

-- ============================================
-- 5. ADMIN TABLE
-- ============================================
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_user (UserID)
);

-- ============================================
-- 6. FARMER PRODUCT TABLE
-- ============================================
CREATE TABLE FarmerProduct (
    FarmerProductID INT PRIMARY KEY AUTO_INCREMENT,
    FarmerID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    UnitPrice DECIMAL(8,2) NOT NULL CHECK (UnitPrice >= 0),
    HarvestDate DATE NOT NULL,
    ExpireDate DATE NOT NULL,
    Quantity DECIMAL(10,2) DEFAULT 0,
    Unit ENUM('kg', 'g', 'units', 'piece') NOT NULL,
    Status ENUM('available', 'sold', 'expired') DEFAULT 'available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    INDEX idx_category (Category),
    INDEX idx_status (Status),
    INDEX idx_farmer (FarmerID)
);

-- ============================================
-- 7. FINISHED PRODUCT TABLE
-- ============================================
CREATE TABLE FinishedProduct (
    FinishedProductID INT PRIMARY KEY AUTO_INCREMENT,
    ProductName VARCHAR(100) NOT NULL,
    UnitPrice DECIMAL(8,2) NOT NULL CHECK (UnitPrice >= 0),
    Description TEXT NOT NULL,
    ManufacturingDate DATE NOT NULL,
    ExpireDate DATE NOT NULL,
    StockQuantity INT DEFAULT 0 CHECK (StockQuantity >= 0),
    Category VARCHAR(50) NOT NULL,
    ImageUrl VARCHAR(255) NULL,
    Availability ENUM('in-stock', 'low-stock', 'out-of-stock') DEFAULT 'in-stock',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (Category),
    INDEX idx_availability (Availability)
);

-- ============================================
-- 8. ORDER TABLE (Renamed from Order to Orders for SQL compatibility)
-- ============================================
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    OrderNumber VARCHAR(50) UNIQUE NOT NULL,
    CustomerID INT NOT NULL,
    EmployeeID INT NULL,
    OrderDate DATE NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount >= 0),
    DiscountAmount DECIMAL(10,2) DEFAULT 0.00 CHECK (DiscountAmount >= 0),
    Status VARCHAR(20) DEFAULT 'Pending',
    DeliveryAddress VARCHAR(255) NOT NULL,
    PaymentStatus ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Pending',
    DeliveryDate DATE NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL,
    INDEX idx_customer (CustomerID),
    INDEX idx_status (Status),
    INDEX idx_order_date (OrderDate)
);

-- ============================================
-- 9. ORDER ITEM TABLE
-- ============================================
CREATE TABLE OrderItem (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL, -- References FinishedProduct
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL CHECK (TotalPrice >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES FinishedProduct(FinishedProductID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_product (ProductID)
);

-- ============================================
-- 10. PAYMENT TABLE
-- ============================================
CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL UNIQUE,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount > 0),
    PaymentMethod VARCHAR(30) NOT NULL,
    PaymentStatus VARCHAR(20) DEFAULT 'Pending',
    TransactionID VARCHAR(50) UNIQUE NULL,
    PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CardNumberLast4 VARCHAR(4) NULL,
    CardName VARCHAR(100) NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_status (PaymentStatus),
    INDEX idx_transaction (TransactionID)
);

-- ============================================
-- 11. PRODUCT INVENTORY TABLE
-- ============================================
CREATE TABLE ProductInventory (
    InventoryID INT PRIMARY KEY AUTO_INCREMENT,
    FarmerProductID INT NULL,
    FinishedProductID INT NULL,
    EmployeeID INT NOT NULL,
    StockQuantity INT NOT NULL CHECK (StockQuantity >= 0),
    StorageLocation VARCHAR(100) NOT NULL,
    CupboardNumber VARCHAR(10) NOT NULL,
    RackNumber VARCHAR(10) NOT NULL,
    ExpiryDate DATE NOT NULL,
    Status ENUM('good', 'warning', 'low', 'critical', 'expired') DEFAULT 'good',
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerProductID) REFERENCES FarmerProduct(FarmerProductID) ON DELETE CASCADE,
    FOREIGN KEY (FinishedProductID) REFERENCES FinishedProduct(FinishedProductID) ON DELETE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    INDEX idx_farmer_product (FarmerProductID),
    INDEX idx_finished_product (FinishedProductID),
    INDEX idx_status (Status),
    INDEX idx_expiry (ExpiryDate),
    CHECK (FarmerProductID IS NOT NULL OR FinishedProductID IS NOT NULL)
);

-- ============================================
-- 12. FARMER APPLICATION TABLE
-- ============================================
CREATE TABLE FarmerApplication (
    ApplicationID INT PRIMARY KEY AUTO_INCREMENT,
    FarmerID INT NOT NULL,
    EmployeeID INT NULL,
    ApplicationStatus VARCHAR(20) DEFAULT 'Pending Review',
    SubmissionDate DATE NOT NULL,
    ReviewDate DATE NULL,
    ReviewComments TEXT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL,
    INDEX idx_farmer (FarmerID),
    INDEX idx_status (ApplicationStatus)
);

-- ============================================
-- 13. DELIVERY SCHEDULE TABLE
-- ============================================
CREATE TABLE DeliverySchedule (
    DeliveryID INT PRIMARY KEY AUTO_INCREMENT,
    DeliveryNumber VARCHAR(50) UNIQUE NOT NULL,
    FarmerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    ScheduledDate DATE NOT NULL,
    DeliveryStatus VARCHAR(20) DEFAULT 'Pending',
    TransportType VARCHAR(30) NOT NULL,
    PickupLocation VARCHAR(255) NOT NULL,
    CompletedDate DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    INDEX idx_farmer (FarmerID),
    INDEX idx_status (DeliveryStatus),
    INDEX idx_scheduled_date (ScheduledDate)
);

-- ============================================
-- 14. CUSTOMER FEEDBACK TABLE
-- ============================================
CREATE TABLE CustomerFeedback (
    CustomerFeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    FeedbackType VARCHAR(50) NOT NULL,
    Comment TEXT NOT NULL,
    FeedbackDate DATE NOT NULL,
    Response TEXT NULL,
    ResponseDate DATETIME NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    INDEX idx_customer (CustomerID),
    INDEX idx_type (FeedbackType),
    INDEX idx_date (FeedbackDate)
);

-- ============================================
-- 15. FARMER FEEDBACK TABLE
-- ============================================
CREATE TABLE FarmerFeedback (
    FarmerFeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    FarmerID INT NOT NULL,
    FeedbackType VARCHAR(50) NOT NULL,
    Comment TEXT NOT NULL,
    FeedbackDate DATE NOT NULL,
    Response TEXT NULL,
    ResponseDate DATETIME NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE,
    INDEX idx_farmer (FarmerID),
    INDEX idx_type (FeedbackType),
    INDEX idx_date (FeedbackDate)
);

-- ============================================
-- 16. INVOICE TABLE
-- ============================================
CREATE TABLE Invoice (
    InvoiceID INT PRIMARY KEY AUTO_INCREMENT,
    InvoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    OrderID INT NOT NULL,
    PaymentID INT NOT NULL,
    InvoiceDate DATE NOT NULL,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),
    TaxAmount DECIMAL(10,2) DEFAULT 0.00,
    TotalAmount DECIMAL(10,2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_payment (PaymentID),
    INDEX idx_invoice_date (InvoiceDate)
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample user
INSERT INTO User (Username, EmailAddress, PasswordHash, Role, RegistrationDate) VALUES
('Asoka Perera', 'asoka@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Customer', '2025-01-08'),
('Green Valley', 'greenvalley@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Farmer', '2025-01-15'),
('Manager User', 'manager@laklight.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Employee', '2024-05-01'),
('Amal Perera', 'amal@laklight.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', '2025-05-01');

-- Insert Customer
INSERT INTO Customer (UserID, Name, ContactNo, DeliveryAddress) VALUES
(1, 'Asoka Perera', '0111234567', '123, Dalugama, Kelaniya');

-- Insert Farmer
INSERT INTO Farmer (UserID, FarmName, FarmLocation, LicenseNumber, BankDetails) VALUES
(2, 'Green Valley Farm', 'Kandy, Central Province', 'AG202401', 'BOC123456789');

-- Insert Employee
INSERT INTO Employee (UserID, Department, Position, HireDate, Salary) VALUES
(3, 'Operations', 'Manager', '2024-05-01', 75000.00);

-- Insert Admin
INSERT INTO Admin (UserID, Name, HireDate) VALUES
(4, 'Amal Perera', '2025-05-01');

-- Insert Farmer Product
INSERT INTO FarmerProduct (FarmerID, Name, Category, UnitPrice, HarvestDate, ExpireDate, Quantity, Unit) VALUES
(1, 'Fresh Mango', 'Fruits', 250.00, '2025-10-01', '2025-10-25', 100, 'kg');

-- Insert Finished Product
INSERT INTO FinishedProduct (ProductName, UnitPrice, Description, ManufacturingDate, ExpireDate, StockQuantity, Category) VALUES
('Mango Jelly', 250.00, '100g pack', '2025-10-01', '2026-05-01', 50, 'desserts');

-- Insert Inventory
INSERT INTO ProductInventory (FarmerProductID, FinishedProductID, EmployeeID, StockQuantity, StorageLocation, CupboardNumber, RackNumber, ExpiryDate, Status) VALUES
(1, NULL, 1, 85, 'Cold Storage A', 'C03', 'R03', '2025-10-25', 'good'),
(NULL, 1, 1, 50, 'Finished Goods', 'C02', 'R05', '2026-05-10', 'good');

-- Success message
SELECT '✅ Database created successfully with preferred schema!' AS Status;
SELECT 'Note: VARCHAR IDs changed to INT AUTO_INCREMENT for better performance' AS Important;
SELECT 'Note: Added PasswordHash field for security' AS Security;
SELECT 'Note: Fixed EmailAddress size to VARCHAR(255)' AS Fixed;

