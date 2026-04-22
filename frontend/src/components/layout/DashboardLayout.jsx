import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
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
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Zap,
  Shield,
  Star,
  TrendingUp,
  FileText,
  HelpCircle,
  Moon,
  Sun,
  Folder,
  PieChart,
  Wallet,
  Package,
  Grid3X3,
  LayoutDashboard,
  Store,
  ShoppingBag,
  Receipt,
  Award,
  Target,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Lock,
  Eye,
} from 'lucide-react'

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)

  const userType = user?.type
  const storageUrl = STORAGE_URL

  useEffect(() => {
    setSidebarOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Salvar preferência de sidebar
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) setSidebarCollapsed(JSON.parse(saved))
  }, [])

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

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

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Navegação por tipo de usuário - apenas rotas existentes
  const getNavSections = () => {
    switch (userType) {
      case 'admin':
        return [
          {
            title: 'Principal',
            items: [
              { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            ]
          },
          {
            title: 'Gerenciamento',
            items: [
              { name: 'Usuarios', href: '/admin/users', icon: Users },
              { name: 'Categorias', href: '/admin/categories', icon: Tag },
              { name: 'Planos', href: '/admin/plans', icon: CreditCard },
              { name: 'Banners', href: '/admin/banners', icon: Image },
            ]
          },
          {
            title: 'Financeiro',
            items: [
              { name: 'Transacoes', href: '/admin/finance', icon: Wallet },
            ]
          },
        ]
      case 'empresa':
        return [
          {
            title: 'Principal',
            items: [
              { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
              { name: 'Meus Servicos', href: '/my-services', icon: Package },
            ]
          },
          {
            title: 'Negocios',
            items: [
              { name: 'Negociacoes', href: '/deals', icon: MessageSquare, badge: 'new' },
              { name: 'Ranking', href: '/ranking', icon: Trophy },
            ]
          },
          {
            title: 'Financeiro',
            items: [
              { name: 'Financeiro', href: '/finance', icon: Wallet },
            ]
          },
        ]
      case 'cliente':
      default:
        return [
          {
            title: 'Principal',
            items: [
              { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
              { name: 'Explorar', href: '/empresas', icon: Search },
            ]
          },
          {
            title: 'Atividade',
            items: [
              { name: 'Negociacoes', href: '/deals', icon: MessageSquare, badge: 'new' },
            ]
          },
        ]
    }
  }

  const navSections = getNavSections()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/empresas?q=${encodeURIComponent(searchTerm)}`)
      setSearchOpen(false)
      setSearchTerm('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/5 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/5 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all group-hover:scale-105">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Zap className="w-2 h-2 text-yellow-900" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-lg text-white">
                  Service<span className="text-emerald-400">Pro</span>
                </span>
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  {userType === 'admin' ? 'Admin Panel' : userType === 'empresa' ? 'Empresa' : 'Cliente'}
                </span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <div className={`relative shrink-0 ${active ? '' : 'group-hover:scale-110 transition-transform'}`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : ''}`} />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium text-sm flex-1">{item.name}</span>
                          {active && (
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle - quando recolhido */}
        {sidebarCollapsed && (
          <div className="p-3 border-t border-white/5">
            <button
              onClick={toggleSidebarCollapse}
              className="w-full p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* User Card - Desktop */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/5">
            <div className="p-3 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 overflow-hidden">
                    {user?.foto_path ? (
                      <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-white/40 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/profile"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Perfil
                </Link>
                <Link
                  to="/settings"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Config
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          sidebarOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`absolute top-0 left-0 w-72 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-lg text-white">Service<span className="text-emerald-400">Pro</span></span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : ''}`} />
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                            Novo
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile User */}
          <div className="p-4 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                {user?.foto_path ? (
                  <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/40 capitalize">{userType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white/70 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4" />
                Perfil
              </Link>
              <Link
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white/70 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Config
              </Link>
            </div>
            <button
              onClick={() => {
                setSidebarOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left - Mobile Menu + Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumb / Page Title */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Link to="/dashboard" className="text-white/40 hover:text-white/60 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <ChevronRight className="w-4 h-4 text-white/20" />
                <span className="text-white font-medium">
                  {location.pathname === '/dashboard' ? 'Visao Geral' :
                   location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                </span>
              </div>
            </div>

            {/* Center - Search */}
            <div ref={searchRef} className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Buscar empresas, servicos..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-white/30 text-xs">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">K</kbd>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick Actions */}
              {userType === 'empresa' && (
                <Link
                  to="/my-services/new"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  Novo Servico
                </Link>
              )}

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all hover:bg-white/5 ${
                    userMenuOpen ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-emerald-500/20 overflow-hidden">
                      {user?.foto_path ? (
                        <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user?.name)
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-gradient-to-br from-white/5 to-transparent border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                          {user?.foto_path ? (
                            <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user?.name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-white/50 truncate">{user?.email}</p>
                        </div>
                      </div>
                      {userType === 'empresa' && (
                        <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-medium text-emerald-400">Empresa Verificada</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configuracoes
                      </Link>
                    </div>

                    <div className="p-2 border-t border-white/10">
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Site Publico
                        <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                      </Link>
                    </div>

                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Dropdown */}
          {searchOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <p>© 2024 ServicePro. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white/50 transition-colors cursor-pointer">Ajuda</span>
              <span className="hover:text-white/50 transition-colors cursor-pointer">Privacidade</span>
              <span className="hover:text-white/50 transition-colors cursor-pointer">Termos</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
