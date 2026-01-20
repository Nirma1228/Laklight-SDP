# Laklight Food Products - Backend API

Complete backend implementation for Laklight Food Products covering all 22 functional requirements.

## 🚀 Quick Start

### Installation

```bash
cd Backend
npm install
```

### Environment Setup

Create `.env` file with your configurations (already provided).

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE laklight_food_products;
```

2. Run the main database schema:
```bash
# Execute the SQL file from the root of the project
mysql -u root -p laklight_food_products < database_schema.sql
```

3. Add cart table:
```bash
mysql -u root -p laklight_food_products < database/cart_table.sql
```

### Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📋 API Endpoints

### Authentication (FR01, FR08, FR18)
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/farmer-register` - Farmer registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products (FR03, FR04, FR22)
- `GET /api/products` - Get all products
- `GET /api/products/search?query=` - Search products
- `GET /api/products/filter?category=&availability=` - Filter products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Shopping Cart (FR06)
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update/:itemId` - Update quantity
- `DELETE /api/cart/remove/:itemId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders (FR02, FR05)
- `POST /api/orders` - Place order (with wholesale discount)
- `GET /api/orders` - Get customer orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/track/:orderNumber` - Track order

### Payments (FR07)
- `POST /api/payments/process` - Process payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/methods` - Get payment methods
- `GET /api/payments/history` - Get payment history

### Farmer (FR09, FR10)
- `POST /api/farmer/submissions` - Submit product
- `GET /api/farmer/submissions` - Get submissions with status
- `GET /api/farmer/submissions/:id` - Track submission status
- `PUT /api/farmer/submissions/:id` - Update submission
- `DELETE /api/farmer/submissions/:id` - Delete submission
- `GET /api/farmer/deliveries` - Get deliveries
- `PUT /api/farmer/deliveries/:id` - Update delivery

### Employee (FR11, FR12, FR13, FR14)
- `GET /api/employee/applications` - Get pending applications
- `PUT /api/employee/applications/:id/approve` - Approve application
- `PUT /api/employee/applications/:id/reject` - Reject application
- `GET /api/employee/inventory` - Get all inventory
- `PUT /api/employee/inventory/:id` - Update inventory
- `GET /api/employee/inventory/location/:location` - Search by location
- `GET /api/employee/alerts` - Get low stock & expiry alerts

### Admin (FR15, FR16, FR17, FR20, FR22)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Change user role
- `PUT /api/admin/users/:id/status` - Change user status
- `GET /api/admin/analytics/dashboard` - Analytics dashboard
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/feedback` - View all feedback
- `GET /api/admin/complaints` - View complaints
- `GET /api/admin/compliments` - View compliments

### Feedback (FR19, FR20)
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my` - Get my feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Reports (FR17)
- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/supplier` - Generate supplier report
- `GET /api/reports/customer` - Generate customer report
- `POST /api/reports/generate` - Generate custom report

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Add supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/suppliers/:id/performance` - Get performance

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## 🎯 Functional Requirements Coverage

✅ **FR01** - Customer registration  
✅ **FR02** - Place orders online  
✅ **FR03** - Search & filter products  
✅ **FR04** - Browse product catalog  
✅ **FR05** - 10% wholesale discount (12+ items)  
✅ **FR06** - Shopping cart functionality  
✅ **FR07** - Secure payment processing  
✅ **FR08** - Farmer registration  
✅ **FR09** - Farmer product submissions  
✅ **FR10** - Application status tracking  
✅ **FR11** - Review farmer applications  
✅ **FR12** - Automated alerts (cron job)  
✅ **FR13** - Inventory management  
✅ **FR14** - Location-based search  
✅ **FR15** - User management  
✅ **FR16** - Analytics dashboard  
✅ **FR17** - Comprehensive reports  
✅ **FR18** - Profile management  
✅ **FR19** - Feedback submission  
✅ **FR20** - View feedback/complaints  
✅ **FR21** - Frontend responsive design  
✅ **FR22** - Product catalog management  

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Node-cron** - Scheduled tasks
- **Express-validator** - Input validation

## 📦 Project Structure

```
Backend/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Auth, validation, error handling
├── routes/          # API routes
├── services/        # Business services
├── database/        # SQL files
├── uploads/         # File uploads
├── .env             # Environment variables
├── server.js        # Main entry point
└── package.json     # Dependencies
```

## 🔄 Automated Tasks

- **Daily at 8 AM**: Check low stock levels (FR12)
- **Daily at 8 AM**: Check expiring products (FR12)

## 📝 Notes

- Default admin credentials should be created manually
- Update `.env` file with your database credentials
- For production, configure proper email service for notifications
- Implement actual payment gateway integration for production use

## 🤝 Integration with Frontend

Frontend base URL: `http://localhost:3000`  
Backend base URL: `http://localhost:5000`  

CORS is configured to allow frontend requests.

## 📧 Support

For issues or questions, contact the development team.
