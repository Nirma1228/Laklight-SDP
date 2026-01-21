# Admin Login Setup Guide

## Quick Setup Steps

### 1. Ensure Database is Running
Make sure your MySQL server is running and the database is set up.

### 2. Create Admin User
Run this command in the Backend directory:
```bash
npm run create-admin
```

This will create test users with the following credentials:

## 🔐 Login Credentials

### Administrator
- **Email:** admin@laklight.com
- **Password:** admin123
- **Dashboard:** `/admin/dashboard`

### Employee
- **Email:** employee@laklight.com
- **Password:** employee123
- **Dashboard:** `/employee/dashboard`

### Farmer
- **Email:** farmer@laklight.com
- **Password:** farmer123
- **Dashboard:** `/farmer/dashboard`

### Customer
- **Email:** customer@laklight.com
- **Password:** customer123
- **Dashboard:** `/customer/dashboard`

## 🚀 How to Login

1. Go to `http://localhost:3000/login`
2. Select your user type from the dropdown (e.g., "Administrator")
3. Enter the email and password from above
4. Click "Login"
5. You'll be redirected to the appropriate dashboard

## ⚠️ Troubleshooting

### Can't connect to database?
- Check if MySQL is running
- Verify `.env` file has correct database credentials
- Make sure database `laklight_food_products` exists

### Backend not responding?
- Ensure backend server is running: `npm start` in Backend folder
- Backend should be at `http://localhost:5000`

### Still can't login?
Run the admin creation script again:
```bash
cd Backend
npm run create-admin
```

## 📝 Notes
- All passwords are securely hashed using bcrypt
- Tokens are stored in localStorage or sessionStorage
- Sessions expire after 24 hours
