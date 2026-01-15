import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import LoggedHome from './pages/LoggedHome'
import ProductCatalog from './pages/ProductCatalog'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import FarmerDashboard from './pages/FarmerDashboard'
import AdminInventory from './pages/AdminInventory'
import AdminOrderManagement from './pages/AdminOrderManagement'
import UserManagement from './pages/UserManagement'
import FarmerApplicationReview from './pages/FarmerApplicationReview'
import FarmerFeedback from './pages/FarmerFeedback'
import Feedback from './pages/Feedback'
import GenerateReports from './pages/GenerateReports'
import InventoryReport from './pages/InventoryReport'
import SalesReport from './pages/SalesReport'
import SupplierReport from './pages/SupplierReport'
import CustomerReport from './pages/CustomerReport'
import OnlinePayment from './pages/OnlinePayment'
import SupplierRelations from './pages/SupplierRelations'
import SystemSettings from './pages/SystemSettings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={<LoggedHome />} />
      <Route path="/products" element={<ProductCatalog />} />
      <Route path="/payment" element={<OnlinePayment />} />
      <Route path="/feedback" element={<Feedback />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/inventory" element={<AdminInventory />} />
      <Route path="/admin/orders" element={<AdminOrderManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/farmer-applications" element={<FarmerApplicationReview />} />
      <Route path="/admin/reports" element={<GenerateReports />} />
      <Route path="/admin/reports/inventory" element={<InventoryReport />} />
      <Route path="/admin/reports/sales" element={<SalesReport />} />
      <Route path="/admin/reports/supplier" element={<SupplierReport />} />
      <Route path="/admin/reports/customer" element={<CustomerReport />} />
      <Route path="/admin/supplier-relations" element={<SupplierRelations />} />
      <Route path="/admin/settings" element={<SystemSettings />} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      
      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      
      {/* Farmer Routes */}
      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/feedback" element={<FarmerFeedback />} />
    </Routes>
  )
}

export default App
