import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import SiteLayout from './layouts/SiteLayout'
import AuthLayout from './components/layout/AuthLayout'

// Global Components
import ChatWidget from './components/chat/ChatWidget'

// Public Pages
import Home from './pages/Home'
import CompanyProfile from './pages/companies/CompanyProfile'
import CompanyList from './pages/public/CompanyList'

// Auth Pages
import Login from './pages/auth/Login'
import RegisterEmpresa from './pages/auth/RegisterEmpresa'
import RegisterCliente from './pages/auth/RegisterCliente'
import ResetPassword from './pages/auth/ResetPassword'

// Main Pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import MyServices from './pages/services/MyServices'
import DealList from './pages/deals/DealList'
import ChatView from './pages/deals/ChatView'
import FinanceView from './pages/finance/FinanceView'
import RankingView from './pages/RankingView'
import ReportsView from './pages/reports/ReportsView'

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPlans from './pages/admin/AdminPlans'
import AdminBanners from './pages/admin/AdminBanners'
import AdminCategories from './pages/admin/AdminCategories'
import AdminFinance from './pages/admin/AdminFinance'

// Loading component for route guards
const RouteLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
      <p className="mt-3 text-gray-500 text-sm">Carregando...</p>
    </div>
  </div>
)

// Route Guards - Now wait for initialization
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)

  // Wait for auth check to complete
  if (!initialized) {
    return <RouteLoading />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)

  // Wait for auth check to complete
  if (!initialized) {
    return <RouteLoading />
  }

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)

  // Wait for auth check to complete
  if (!initialized) {
    return <RouteLoading />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.type !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const EmpresaRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)

  // Wait for auth check to complete
  if (!initialized) {
    return <RouteLoading />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.type !== 'empresa') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <>
    <ChatWidget />
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/empresas" element={<CompanyList />} />
      <Route path="/empresa/:id" element={<CompanyProfile />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<Navigate to="/register/cliente" replace />} />
        <Route path="/register/empresa" element={<GuestRoute><RegisterEmpresa /></GuestRoute>} />
        <Route path="/register/cliente" element={<GuestRoute><RegisterCliente /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes - Site Layout */}
      <Route element={<PrivateRoute><SiteLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/deals" element={<DealList />} />
        <Route path="/chat/:dealId" element={<ChatView />} />
        <Route path="/finance" element={<FinanceView />} />

        {/* Empresa Routes */}
        <Route path="/my-services" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/my-services/new" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/ranking" element={<EmpresaRoute><RankingView /></EmpresaRoute>} />
        <Route path="/reports" element={<EmpresaRoute><ReportsView /></EmpresaRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
        <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
