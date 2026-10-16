import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.js';
import { CreateOrderPage } from './pages/CreateOrderPage.js';
import { CartCheckoutPage } from './pages/CartCheckoutPage.js';
import { OrderHistoryPage } from './pages/OrderHistoryPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.js';
import { AdminMastersPage } from './pages/admin/AdminMastersPage.js';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.js';
import { DashboardLayout } from './components/DashboardLayout.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (Login & Register) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Customer Protected routes with Dashboard Sidebar & Header layout */}
        <Route element={<ProtectedRoute roleRequired="customer" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/cart" element={<CartCheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Route>
        </Route>

        {/* Superadmin Protected routes with separated panel pages */}
        <Route element={<ProtectedRoute roleRequired="superadmin" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/masters" element={<AdminMastersPage />} />
          </Route>
        </Route>

        {/* Default fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
