import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import SiteLayout from './layouts/SiteLayout'
import AuthLayout from './components/layout/AuthLayout'

// Public Pages
import Home from './pages/Home'
import CompanyProfile from './pages/companies/CompanyProfile'
import CompanyList from './pages/public/CompanyList'

// Auth Pages
import Login from './pages/auth/Login'
import RegisterEmpresa from './pages/auth/RegisterEmpresa'
import RegisterCliente from './pages/auth/RegisterCliente'

// Main Pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import MyServices from './pages/services/MyServices'
import DealList from './pages/deals/DealList'
import ChatView from './pages/deals/ChatView'
import FinanceView from './pages/finance/FinanceView'
import RankingView from './pages/RankingView'

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPlans from './pages/admin/AdminPlans'
import AdminBanners from './pages/admin/AdminBanners'
import AdminCategories from './pages/admin/AdminCategories'
import AdminFinance from './pages/admin/AdminFinance'

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

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

function App() {
  return (
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
      </Route>

      {/* Protected Routes - Site Layout */}
      <Route element={<PrivateRoute><SiteLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/deals" element={<DealList />} />
        <Route path="/chat/:dealId" element={<ChatView />} />
        <Route path="/finance" element={<FinanceView />} />

        {/* Empresa Routes */}
        <Route path="/my-services" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/my-services/new" element={<EmpresaRoute><MyServices /></EmpresaRoute>} />
        <Route path="/ranking" element={<EmpresaRoute><RankingView /></EmpresaRoute>} />

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
  )
}

export default App
