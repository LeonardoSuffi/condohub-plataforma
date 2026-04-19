import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import api from '../services/api'
import NotificationDropdown from '../components/NotificationDropdown'
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  MessageSquare,
  ClipboardList,
  Trophy,
  Users,
  CreditCard,
  Image,
  BarChart3,
  Tag,
  Briefcase,
  Building2,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react'

export default function SiteLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userType = user?.type || 'cliente'

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Navigation items based on user type
  const getNavItems = () => {
    if (userType === 'admin') {
      return [
        { name: 'Painel', href: '/dashboard', icon: Home },
        { name: 'Usuarios', href: '/admin/users', icon: Users },
        { name: 'Categorias', href: '/admin/categories', icon: Tag },
        { name: 'Planos', href: '/admin/plans', icon: CreditCard },
        { name: 'Banners', href: '/admin/banners', icon: Image },
        { name: 'Financeiro', href: '/admin/finance', icon: BarChart3 },
      ]
    }

    if (userType === 'empresa') {
      return [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Meus Servicos', href: '/my-services', icon: Briefcase },
        { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
        { name: 'Ranking', href: '/ranking', icon: Trophy },
        { name: 'Financeiro', href: '/finance', icon: BarChart3 },
      ]
    }

    // Cliente
    return [
      { name: 'Inicio', href: '/dashboard', icon: Home },
      { name: 'Empresas', href: '/empresas', icon: Building2 },
      { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
    ]
  }

  const navItems = getNavItems()

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">CondoHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl mx-4">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {navItems.length > 5 && (
                <div className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                    Mais
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                    <div className="py-1">
                      {navItems.slice(5).map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`block px-4 py-2 text-sm ${
                            isActive(item.href)
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu - Desktop */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.foto_path ? (
                      <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 text-sm font-medium">{getInitials(user?.name)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden lg:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-[60]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          Meu Perfil
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings className="w-4 h-4" />
                          Configuracoes
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                      isActive(item.href)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Profile Links */}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive('/profile')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Meu Perfil
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive('/settings')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                Configuracoes
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold">C</span>
              </div>
              <span className="text-white font-semibold">CondoHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CondoHub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
