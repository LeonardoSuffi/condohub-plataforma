import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'

// Public Pages
import Home from './pages/Home'

// Auth Pages
import Login from './pages/auth/Login'
import RegisterEmpresa from './pages/auth/RegisterEmpresa'
import RegisterCliente from './pages/auth/RegisterCliente'

// Main Pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ServiceCatalog from './pages/services/ServiceCatalog'
import ServiceDetail from './pages/services/ServiceDetail'
import MyServices from './pages/services/MyServices'
import DealList from './pages/deals/DealList'
import ChatView from './pages/deals/ChatView'
import OrderList from './pages/OrderList'
import FinanceView from './pages/finance/FinanceView'
import RankingView from './pages/RankingView'

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPlans from './pages/admin/AdminPlans'
import AdminBanners from './pages/admin/AdminBanners'
import AdminFinance from './pages/admin/AdminFinance'

// Route Guards - Now check both isAuthenticated AND user exists
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Must be authenticated and have user data
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // If authenticated with user data, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.type !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const EmpresaRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.type !== 'empresa') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const ClienteRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.type !== 'cliente') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Home Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<Navigate to="/register/cliente" replace />} />
        <Route path="/register/empresa" element={<GuestRoute><RegisterEmpresa /></GuestRoute>} />
        <Route path="/register/cliente" element={<GuestRoute><RegisterCliente /></GuestRoute>} />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/deals" element={<DealList />} />
        <Route path="/chat/:dealId" element={<ChatView />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/finance" element={<FinanceView />} />

        {/* Cliente Routes */}
        <Route path="/services" element={<ClienteRoute><ServiceCatalog /></ClienteRoute>} />
        <Route path="/services/:id" element={<ClienteRoute><ServiceDetail /></ClienteRoute>} />

        {/* Empresa Routes */}
        <Route path="/my-services" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/my-services/new" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/ranking" element={<EmpresaRoute><RankingView /></EmpresaRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
        <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
        <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
