import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import NotificationDropdown from '../NotificationDropdown'
import { STORAGE_URL } from '../../lib/config'
import {
  Menu,
  X,
  Home,
  MessageSquare,
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
} from 'lucide-react'

/**
 * Layout adaptativo que usa:
 * - Layout do painel quando o usuário está logado
 * - PublicHeader/PublicFooter quando não está logado
 */
export default function AdaptiveLayout({ children }) {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
  const isLoggedIn = initialized && isAuthenticated && user

  // Loading enquanto verifica autenticação
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Usuário logado - usa layout do painel
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <LoggedInHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              2024 ServicePro. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Usuário não logado - usa layout público
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <main className="flex-1 pt-24 pb-12">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}

// Header para usuários logados (igual ao SiteLayout)
function LoggedInHeader() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userType = user?.type

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
    } catch (_error) {
      // Silently ignore - navigate to login regardless
    }
    navigate('/login', { replace: true })
  }

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const getNavItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { name: 'Painel', href: '/dashboard', icon: Home },
          { name: 'Usuarios', href: '/admin/users', icon: Users },
          { name: 'Categorias', href: '/admin/categories', icon: Tag },
          { name: 'Planos', href: '/admin/plans', icon: CreditCard },
          { name: 'Financeiro', href: '/admin/finance', icon: BarChart3 },
        ]
      case 'empresa':
        return [
          { name: 'Inicio', href: '/dashboard', icon: Home },
          { name: 'Meus Servicos', href: '/my-services', icon: Briefcase },
          { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
          { name: 'Relatorios', href: '/reports', icon: BarChart3 },
          { name: 'Ranking', href: '/ranking', icon: Trophy },
          { name: 'Financeiro', href: '/finance', icon: CreditCard },
        ]
      case 'cliente':
      default:
        return [
          { name: 'Inicio', href: '/dashboard', icon: Home },
          { name: 'Empresas', href: '/empresas', icon: Building2 },
          { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
        ]
    }
  }

  const navItems = getNavItems()

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const storageUrl = STORAGE_URL

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Service<span className="text-slate-800">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.foto_path ? (
                    <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-medium">{getInitials(user?.name)}</span>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userType}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        Configuracoes
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleLogout()
                        }}
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}

            <hr className="my-2 border-gray-200" />

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <User className="w-5 h-5" />
              Meu Perfil
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
              Configuracoes
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
