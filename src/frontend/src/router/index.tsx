import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types/user'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SupplierRegisterPage from '@/pages/suppliers/SupplierRegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import RequestsPage from '@/pages/requests/RequestsPage'
import NewRequestPage from '@/pages/requests/NewRequestPage'
import RequestDetailPage from '@/pages/requests/RequestDetailPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import SupplierDashboardPage from '@/pages/supplier/SupplierDashboardPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSuppliersPage from '@/pages/admin/AdminSuppliersPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage'
import AdminApproveUsersPage from '@/pages/admin/AdminApproveUsersPage'

function ProtectedRoute() {
  const { auth } = useAuth()
  return auth ? <Outlet /> : <Navigate to="/login" replace />
}

function AdminRoute() {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (auth.role !== UserRole.Admin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function SupplierRoute() {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (auth.role !== UserRole.Supplier) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/become-supplier', element: <SupplierRegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/suppliers', element: <SuppliersPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/requests', element: <RequestsPage /> },
      { path: '/requests/new', element: <NewRequestPage /> },
      { path: '/requests/:id', element: <RequestDetailPage /> },
      { path: '/orders', element: <OrdersPage /> },
    ],
  },
  {
    element: <SupplierRoute />,
    children: [
      { path: '/supplier/dashboard', element: <SupplierDashboardPage /> },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/suppliers', element: <AdminSuppliersPage /> },
          { path: '/admin/orders', element: <AdminOrdersPage /> },
          { path: '/admin/requests', element: <AdminRequestsPage /> },
          { path: '/admin/approve-users', element: <AdminApproveUsersPage /> },
        ],
      },
    ],
  },
])
