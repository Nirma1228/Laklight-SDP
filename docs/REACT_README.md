# Laklight Food Products - React Application

This is the React version of the Laklight Food Products web application, built with Vite for fast development and optimized production builds.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the React project directory:
```bash
cd Frontend/React
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
React/
├── public/
│   └── Logo.png          # Application logo
├── src/
│   ├── components/       # Reusable components
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── FarmerDashboard.jsx
│   │   └── ... (other pages)
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🎯 Features Converted

### Core Pages
- ✅ Home Page (Landing page with features)
- ✅ Login Page (Multi-user type authentication)
- ✅ Registration Page
- ✅ Forgot Password Page

### Dashboard Pages
- ✅ Admin Dashboard
- ✅ Customer Dashboard
- ✅ Employee Dashboard
- ✅ Farmer Dashboard

### Management Pages
- ✅ Inventory Management
- ✅ Order Management
- ✅ User Management
- ✅ Farmer Application Review

### Report Pages
- ✅ Generate Reports
- ✅ Inventory Report
- ✅ Sales Report
- ✅ Supplier Report
- ✅ Customer Report

### Additional Features
- ✅ Product Catalog
- ✅ Online Payment
- ✅ Feedback System
- ✅ Supplier Relations
- ✅ System Settings

## 🛣️ Routing

All pages are connected using React Router v6:

- `/` - Home (landing page)
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset
- `/admin/*` - Admin routes
- `/customer/*` - Customer routes
- `/employee/*` - Employee routes
- `/farmer/*` - Farmer routes

## 🎨 Styling

- CSS Modules approach for component-specific styles
- Global styles in `index.css`
- Responsive design maintained from original HTML
- Modern green color scheme (#4caf50, #2e7d32, etc.)

## 🔄 Migration from HTML

All HTML pages have been successfully converted to React components with:
- Functional components using React Hooks
- React Router for navigation
- Modular CSS files
- Component reusability (Header, Footer)
- State management with useState
- Form handling with controlled components

## 📝 Next Steps

To enhance the application further, consider:

1. **State Management**: Add Redux or Context API for global state
2. **API Integration**: Connect to backend APIs
3. **Authentication**: Implement JWT-based authentication
4. **Form Validation**: Add comprehensive form validation
5. **Loading States**: Add loading spinners and error handling
6. **Data Fetching**: Integrate real data from backend
7. **Testing**: Add unit and integration tests
8. **Deployment**: Set up CI/CD pipeline

## 👥 User Types

The system supports four user types:
1. **Customer** - Browse and purchase products
2. **Farmer** - Submit products and track deliveries
3. **Employee** - Manage inventory and farmer applications
4. **Administrator** - Full system access and analytics

## 📧 Contact

**Laklight Food Products**
- Location: Gokaralla Road, Kadulawa, Ibbagamuwa
- Phone: 0721267405
- Contact Person: Radika Lakmali

---

Developed by Nirma Bandara © 2025
