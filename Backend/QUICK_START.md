# 🚀 Quick Start Guide - Laklight Backend

## Step 1: Install Dependencies

```bash
cd Backend
npm install
```

## Step 2: Setup MySQL Database

### Option A: Using MySQL Command Line
```bash
mysql -u root -p < database/complete_setup.sql
```

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Create new connection (localhost, root user)
3. File > Run SQL Script
4. Select: `Backend/database/complete_setup.sql`
5. Execute

### Option C: Manual Setup
```sql
-- In MySQL command line or Workbench
source C:/Users/Nirma Nethmini/Documents/GitHub/Laklight-SDP/Backend/database/complete_setup.sql
```

## Step 3: Configure Environment

Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=laklight_food_products
```

## Step 4: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

✅ Server will run on: **http://localhost:5000**

## Step 5: Test API

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### Test Endpoints:
```bash
# Get all products
curl http://localhost:5000/api/products

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"0771234567","password":"password123","userType":"customer"}'
```

## 📋 Verify Installation

✅ MySQL database created  
✅ All tables created (15 tables)  
✅ Sample data inserted  
✅ Backend server running  
✅ API endpoints accessible  
✅ No console errors  

## 🔍 Common Issues

### Issue: "Cannot connect to database"
**Solution:** Check MySQL is running and credentials in `.env` are correct

### Issue: "Port 5000 already in use"
**Solution:** Change `PORT=5000` to `PORT=5001` in `.env` file

### Issue: "Module not found"
**Solution:** Run `npm install` again

### Issue: "ER_NOT_SUPPORTED_AUTH_MODE"
**Solution:** Run in MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

## 📚 API Documentation

Once server is running, visit:
- Health Check: http://localhost:5000/api/health
- API Info: http://localhost:5000/

For detailed API documentation, see `README.md`

## 🎯 Next Steps

1. ✅ Backend is running
2. Start Frontend: `cd Frontend && npm run dev`
3. Test integration between Frontend and Backend
4. Create admin user via API or database
5. Begin testing all 22 functional requirements

## 📞 Need Help?

Check the main README.md for complete API documentation and troubleshooting.
