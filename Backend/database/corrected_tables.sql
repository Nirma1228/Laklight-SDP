-- ============================================
-- LAKLIGHT FOOD PRODUCTS - CORRECTED SQL SCHEMA
-- All CREATE TABLE Statements with Fixes
-- ============================================

CREATE DATABASE IF NOT EXISTS laklight_food_products;
USE laklight_food_products;

-- ============================================
-- 1. USER TABLE
-- Corrections: Added PasswordHash, Changed email to VARCHAR(255), Added Status
-- ============================================
CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Customer', 'Farmer', 'Employee', 'Admin') NOT NULL,
    RegistrationDate DATE NOT NULL DEFAULT (CURRENT_DATE),
    Status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    LastLogin DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CUSTOMER TABLE
-- Corrections: Removed EmailAddress (redundant), Changed ID to INT
-- ============================================
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    ContactNo VARCHAR(15) NOT NULL,
    DeliveryAddress VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- ============================================
-- 3. FARMER TABLE
-- Corrections: Removed EmailAddress (redundant), Changed ID to INT
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
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- ============================================
-- 4. EMPLOYEE TABLE
-- Corrections: Position changed from DECIMAL to VARCHAR, Changed ID to INT
-- ============================================
CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Department VARCHAR(50) NOT NULL,
    Position VARCHAR(50) NOT NULL,
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2) NOT NULL CHECK (Salary >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- ============================================
-- 5. ADMIN TABLE
-- Corrections: Removed EmailAddress (redundant), Changed ID to INT
-- ============================================
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- ============================================
-- 6. FARMER PRODUCT TABLE
-- Corrections: Added Quantity, Unit, Status fields, Changed ID to INT
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
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE
);

-- ============================================
-- 7. FINISHED PRODUCT TABLE
-- Corrections: Added StockQuantity, Category, ImageUrl, Availability
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
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ORDERS TABLE
-- Corrections: Renamed from 'Order' to 'Orders', Added OrderNumber, PaymentStatus
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
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL
);

-- ============================================
-- 9. ORDER ITEM TABLE
-- Corrections: Added UnitPrice field, CreatedAt timestamp
-- ============================================
CREATE TABLE OrderItem (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL CHECK (TotalPrice >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES FinishedProduct(FinishedProductID) ON DELETE CASCADE
);

-- ============================================
-- 10. PAYMENT TABLE
-- Corrections: Added CardNumberLast4, CardName, CreatedAt
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
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

-- ============================================
-- 11. PRODUCT INVENTORY TABLE
-- Corrections: Added Status, LastUpdated, CHECK constraint
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
    CHECK (FarmerProductID IS NOT NULL OR FinishedProductID IS NOT NULL)
);

-- ============================================
-- 12. FARMER APPLICATION TABLE
-- Corrections: Added CreatedAt, UpdatedAt timestamps
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
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL
);

-- ============================================
-- 13. DELIVERY SCHEDULE TABLE
-- Corrections: Added DeliveryNumber, CompletedDate, timestamps
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
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE
);

-- ============================================
-- 14. CUSTOMER FEEDBACK TABLE
-- Corrections: Added ResponseDate, Rating, timestamps
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
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

-- ============================================
-- 15. FARMER FEEDBACK TABLE
-- Corrections: Added ResponseDate, Rating, timestamps, Fixed FK
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
    FOREIGN KEY (FarmerID) REFERENCES Farmer(FarmerID) ON DELETE CASCADE
);

-- ============================================
-- 16. INVOICE TABLE
-- Corrections: Added InvoiceNumber, TaxAmount, TotalAmount, CreatedAt
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
    FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID) ON DELETE CASCADE
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_user_email ON User(EmailAddress);
CREATE INDEX idx_user_role ON User(Role);
CREATE INDEX idx_customer_user ON Customer(UserID);
CREATE INDEX idx_farmer_user ON Farmer(UserID);
CREATE INDEX idx_employee_user ON Employee(UserID);
CREATE INDEX idx_employee_dept ON Employee(Department);
CREATE INDEX idx_admin_user ON Admin(UserID);
CREATE INDEX idx_farmer_product_category ON FarmerProduct(Category);
CREATE INDEX idx_farmer_product_status ON FarmerProduct(Status);
CREATE INDEX idx_farmer_product_farmer ON FarmerProduct(FarmerID);
CREATE INDEX idx_finished_product_category ON FinishedProduct(Category);
CREATE INDEX idx_finished_product_availability ON FinishedProduct(Availability);
CREATE INDEX idx_order_customer ON Orders(CustomerID);
CREATE INDEX idx_order_status ON Orders(Status);
CREATE INDEX idx_order_date ON Orders(OrderDate);
CREATE INDEX idx_order_item_order ON OrderItem(OrderID);
CREATE INDEX idx_order_item_product ON OrderItem(ProductID);
CREATE INDEX idx_payment_order ON Payment(OrderID);
CREATE INDEX idx_payment_status ON Payment(PaymentStatus);
CREATE INDEX idx_payment_transaction ON Payment(TransactionID);
CREATE INDEX idx_inventory_farmer_product ON ProductInventory(FarmerProductID);
CREATE INDEX idx_inventory_finished_product ON ProductInventory(FinishedProductID);
CREATE INDEX idx_inventory_status ON ProductInventory(Status);
CREATE INDEX idx_inventory_expiry ON ProductInventory(ExpiryDate);
CREATE INDEX idx_farmer_app_farmer ON FarmerApplication(FarmerID);
CREATE INDEX idx_farmer_app_status ON FarmerApplication(ApplicationStatus);
CREATE INDEX idx_delivery_farmer ON DeliverySchedule(FarmerID);
CREATE INDEX idx_delivery_status ON DeliverySchedule(DeliveryStatus);
CREATE INDEX idx_delivery_date ON DeliverySchedule(ScheduledDate);
CREATE INDEX idx_customer_feedback_customer ON CustomerFeedback(CustomerID);
CREATE INDEX idx_customer_feedback_type ON CustomerFeedback(FeedbackType);
CREATE INDEX idx_customer_feedback_date ON CustomerFeedback(FeedbackDate);
CREATE INDEX idx_farmer_feedback_farmer ON FarmerFeedback(FarmerID);
CREATE INDEX idx_farmer_feedback_type ON FarmerFeedback(FeedbackType);
CREATE INDEX idx_farmer_feedback_date ON FarmerFeedback(FeedbackDate);
CREATE INDEX idx_invoice_order ON Invoice(OrderID);
CREATE INDEX idx_invoice_payment ON Invoice(PaymentID);
CREATE INDEX idx_invoice_date ON Invoice(InvoiceDate);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Database tables created successfully!' AS Status;
