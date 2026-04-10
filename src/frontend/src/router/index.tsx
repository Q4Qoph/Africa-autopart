import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SupplierRegisterPage from '@/pages/suppliers/SupplierRegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import RequestsPage from '@/pages/requests/RequestsPage'
import NewRequestPage from '@/pages/requests/NewRequestPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import OrdersPage from '@/pages/orders/OrdersPage'

function ProtectedRoute() {
  const { auth } = useAuth()
  return auth ? <Outlet /> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/become-supplier', element: <SupplierRegisterPage /> },
  { path: '/suppliers', element: <SuppliersPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/requests', element: <RequestsPage /> },
      { path: '/requests/new', element: <NewRequestPage /> },
      { path: '/orders', element: <OrdersPage /> },
    ],
  },
])
