import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { STORAGE_URL } from '@/lib/config'
import {
  Search,
  MapPin,
  Star,
  Building2,
  X,
  Grid3X3,
  List,
  Filter,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Award,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Shield,
  TrendingUp,
  Menu,
  Home,
  MessageSquare,
  CreditCard,
  BarChart3,
  Tag,
  Image,
  Users,
  Trophy,
  User,
  Settings,
  LogOut,
  Wrench,
  Leaf,
  Laptop,
  Calendar,
  Truck,
  Heart,
  GraduationCap,
  Car,
  Hammer,
  Zap,
  Paintbrush,
  Droplet,
  Droplets,
  Package,
  Camera,
  Music,
  Utensils,
  Dog,
  Scissors,
  Phone,
  Wifi,
  Monitor,
  Tv,
  Printer,
  Key,
  Lock,
  Bell,
  Clock,
  Globe,
  FileText,
  Scale,
  Stethoscope,
  Baby,
  Dumbbell,
  Bike,
  Plane,
  Anchor,
  Building,
  Layers,
  Box,
  Trees,
  DoorOpen,
  Headphones,
  Calculator,
  BookOpen,
  Sofa,
  PaintBucket,
} from 'lucide-react'
import api from '@/services/api'
import PublicHeader from '@/components/layout/PublicHeader'

// Mapeamento de nomes de icones para componentes Lucide
const iconMap = {
  building: Building,
  building2: Building2,
  wrench: Wrench,
  sparkles: Sparkles,
  leaf: Leaf,
  shield: Shield,
  laptop: Laptop,
  briefcase: Briefcase,
  calendar: Calendar,
  truck: Truck,
  heart: Heart,
  'graduation-cap': GraduationCap,
  car: Car,
  hammer: Hammer,
  zap: Zap,
  paintbrush: Paintbrush,
  droplet: Droplet,
  droplets: Droplets,
  package: Package,
  camera: Camera,
  music: Music,
  utensils: Utensils,
  dog: Dog,
  scissors: Scissors,
  phone: Phone,
  wifi: Wifi,
  monitor: Monitor,
  tv: Tv,
  printer: Printer,
  key: Key,
  lock: Lock,
  bell: Bell,
  clock: Clock,
  globe: Globe,
  'file-text': FileText,
  scale: Scale,
  stethoscope: Stethoscope,
  baby: Baby,
  dumbbell: Dumbbell,
  bike: Bike,
  plane: Plane,
  anchor: Anchor,
  star: Star,
  award: Award,
  users: Users,
  home: Home,
  tag: Tag,
  settings: Settings,
  'trending-up': TrendingUp,
  lightbulb: Lightbulb,
  // Icones adicionais das categorias
  brick: Building,        // Fallback
  layers: Layers,
  box: Box,
  trees: Trees,
  'door-open': DoorOpen,
  headphones: Headphones,
  calculator: Calculator,
  'heart-handshake': Heart, // Fallback
  'book-open': BookOpen,
  sofa: Sofa,
  'paint-bucket': PaintBucket,
  grid: Grid3X3,
}

// Helper para obter o componente de icone
const getIconComponent = (iconName) => {
  if (!iconName) return Briefcase
  const normalized = iconName.toLowerCase().trim()
  return iconMap[normalized] || Briefcase
}
import PublicFooter from '@/components/layout/PublicFooter'
import NotificationDropdown from '@/components/NotificationDropdown'

export default function CompanyList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('relevante')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [activeCategoryModal, setActiveCategoryModal] = useState(null)
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
  const isLoggedIn = initialized && isAuthenticated && user
  const userType = user?.type

  const [filters, setFilters] = useState(() => ({
    q: searchParams.get('q') || '',
    category_id: searchParams.get('category_id') || '',
    cidade: searchParams.get('cidade') || '',
  }))
  const debounceRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/public/categories')
        setCategories(res.data.data?.filter(c => !c.parent_id) || [])
      } catch {
        // Silently handle error
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Load companies function - stable reference
  const loadCompanies = useCallback(async (searchFilters) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      const params = {
        search: searchFilters.q || undefined,
        category_id: searchFilters.category_id || undefined,
        cidade: searchFilters.cidade || undefined,
      }
      const res = await api.get('/public/companies', {
        params,
        signal: abortControllerRef.current.signal
      })
      const data = res.data.data?.data || res.data.data || []
      setCompanies(data)
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        // Silently handle error
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced filter effect
  useEffect(() => {
    // Update URL without triggering re-render
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.category_id) params.set('category_id', filters.category_id)
    if (filters.cidade) params.set('cidade', filters.cidade)

    window.history.replaceState(null, '', params.toString() ? `?${params.toString()}` : window.location.pathname)

    // Debounce API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      loadCompanies(filters)
    }, filters.q || filters.cidade ? 400 : 0) // Instant for category, debounce for text

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [filters, loadCompanies])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    loadCompanies(filters)
  }, [filters, loadCompanies])

  const clearFilters = useCallback(() => {
    setFilters({ q: '', category_id: '', cidade: '' })
  }, [])

  const toggleCategory = useCallback((categoryId, isCurrentlyExpanded) => {
    // Toggle based on visual state, not raw state value
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isCurrentlyExpanded
    }))
  }, [])

  const handleCategorySelect = useCallback((categoryId) => {
    setFilters(prev => ({ ...prev, category_id: categoryId }))
  }, [])

  const handleTextFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const hasActiveFilters = filters.q || filters.category_id || filters.cidade

  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Memoized category name finder
  const findCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'Todas as Empresas'
    for (const cat of categories) {
      if (String(cat.id) === categoryId) return cat.name
      if (cat.children) {
        const child = cat.children.find(c => String(c.id) === categoryId)
        if (child) return child.name
      }
    }
    return 'Categoria'
  }, [categories])
  // Apply sorting to companies
  const displayCompanies = useMemo(() => {
    if (!companies || companies.length === 0) return []

    const sorted = [...companies]

    switch (sortBy) {
      case 'avaliacao':
        // Sort by rating (highest first)
        sorted.sort((a, b) => {
          const ratingA = parseFloat(a.average_rating) || 0
          const ratingB = parseFloat(b.average_rating) || 0
          return ratingB - ratingA
        })
        break
      case 'servicos':
        // Sort by services count (most first)
        sorted.sort((a, b) => {
          const servicesA = a.services_count || 0
          const servicesB = b.services_count || 0
          return servicesB - servicesA
        })
        break
      case 'relevante':
      default:
        // Relevance: verified first, then by rating, then by completed deals
        sorted.sort((a, b) => {
          // Verified companies first
          if (a.verified && !b.verified) return -1
          if (!a.verified && b.verified) return 1

          // Then by rating
          const ratingA = parseFloat(a.average_rating) || 0
          const ratingB = parseFloat(b.average_rating) || 0
          if (ratingB !== ratingA) return ratingB - ratingA

          // Then by completed deals
          const dealsA = a.deals_completed_count || 0
          const dealsB = b.deals_completed_count || 0
          return dealsB - dealsA
        })
        break
    }

    return sorted
  }, [companies, sortBy])

  const storageUrl = STORAGE_URL

  // Close menus on location change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
    } catch (_error) {
      // Silently ignore
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

  const navItems = isLoggedIn ? getNavItems() : []

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Stats
  const totalCompanies = displayCompanies.length
  const avgRating = displayCompanies.length > 0
    ? (displayCompanies.reduce((acc, c) => acc + parseFloat(c.average_rating || 5), 0) / displayCompanies.length).toFixed(1)
    : '5.0'
  const totalServices = displayCompanies.reduce((acc, c) => acc + (c.services_count || 0), 0)

  // Header para usuarios logados (mesmo estilo do SiteLayout)
  const LoggedInHeader = () => (
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
                <ChevronRight className={`w-4 h-4 text-gray-400 hidden lg:block transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
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

  return (
    <>
      {isLoggedIn ? <LoggedInHeader /> : <PublicHeader />}
      <div className={`min-h-screen bg-gray-50 ${isLoggedIn ? '' : 'pt-16'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {isLoggedIn ? (
            <>
              {/* Hero para usuarios logados */}
              <div className="space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white/90">Diretorio de Empresas</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Encontrar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Empresas</span>
                </h1>
                <p className="text-slate-300 max-w-lg">
                  Explore e conecte-se com as melhores empresas de servicos da plataforma.
                </p>
              </div>

              {/* Search Form para usuarios logados */}
              <form onSubmit={handleSearch} className="max-w-4xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou servico..."
                        value={filters.q}
                        onChange={(e) => handleTextFilter('q', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div className="sm:w-48 relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={filters.cidade}
                        onChange={(e) => handleTextFilter('cidade', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Hero para usuarios nao logados - com busca destacada */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-6">
                  <Building2 className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-300 text-sm font-medium">
                    Diretorio de Empresas
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Encontre a Empresa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ideal</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Conecte-se com as melhores empresas de servicos para seu condominio
                </p>
              </div>

              {/* Search Form para usuarios nao logados */}
              <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou servico..."
                        value={filters.q}
                        onChange={(e) => handleTextFilter('q', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div className="sm:w-48 relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={filters.cidade}
                        onChange={(e) => handleTextFilter('cidade', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* Sidebar Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Categorias
                </h3>
              </div>

              {/* Categories List */}
              <div className="max-h-[65vh] overflow-y-auto">
                {categoriesLoading ? (
                  // Skeleton loading
                  <div className="p-2 space-y-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* All Categories Option */}
                    <button
                      onClick={() => handleCategorySelect('')}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                        !filters.category_id
                          ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                    >
                      <span>Todas as categorias</span>
                    </button>

                    {/* Category Items */}
                    {categories.map((cat) => {
                  const hasChildren = cat.children && cat.children.length > 0
                  const isSelected = filters.category_id === String(cat.id)
                  const hasSelectedChild = hasChildren && cat.children.some(c => filters.category_id === String(c.id))
                  // Expanded se: explicitamente expandido OU (filho selecionado E não foi explicitamente colapsado)
                  const isExpanded = expandedCategories[cat.id] === true ||
                    (hasSelectedChild && expandedCategories[cat.id] !== false)

                  return (
                    <div key={cat.id}>
                      {/* Category Row */}
                      <div className={`flex items-center ${hasChildren ? '' : 'border-l-2'} ${
                        isSelected && !hasChildren
                          ? 'bg-blue-50 border-blue-600'
                          : 'border-transparent'
                      }`}>
                        {/* Main category button */}
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              toggleCategory(cat.id, isExpanded)
                            } else {
                              handleCategorySelect(String(cat.id))
                            }
                          }}
                          className={`flex-1 flex items-center justify-between px-4 py-2.5 text-sm text-left transition-all ${
                            isSelected && !hasChildren
                              ? 'text-blue-700 font-medium'
                              : hasSelectedChild
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {hasChildren && (
                              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                            <span>{cat.name}</span>
                          </div>
                          {cat.services_count > 0 && (
                            <span className="text-xs text-gray-400 tabular-nums">
                              {cat.services_count}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Subcategories (accordion) */}
                      {hasChildren && isExpanded && (
                        <div className="border-l-2 border-gray-100 ml-4">
                          {cat.children.map((subcat) => {
                            const isSubSelected = filters.category_id === String(subcat.id)
                            return (
                              <button
                                key={subcat.id}
                                onClick={() => handleCategorySelect(String(subcat.id))}
                                className={`w-full flex items-center justify-between pl-6 pr-4 py-2 text-sm text-left transition-all ${
                                  isSubSelected
                                    ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 -ml-[2px]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <span>{subcat.name}</span>
                                {subcat.services_count > 0 && (
                                  <span className={`text-xs tabular-nums ${isSubSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {subcat.services_count}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                  </>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={clearFilters}
                    className="w-full text-xs text-gray-500 hover:text-red-600 py-1.5 transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Column - Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {filters.category_id
                    ? findCategoryName(filters.category_id)
                    : 'Todas as Empresas'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? 'Buscando...' : `${displayCompanies.length} empresa${displayCompanies.length !== 1 ? 's' : ''}`}
                  {filters.cidade && ` em ${filters.cidade}`}
                  {filters.q && ` para "${filters.q}"`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
                >
                  <option value="relevante">Mais relevantes</option>
                  <option value="avaliacao">Melhor avaliados</option>
                  <option value="servicos">Mais servicos</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <span className="text-sm text-gray-500">Filtros:</span>
                {filters.category_id && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    {findCategoryName(filters.category_id)}
                    <button onClick={() => handleCategorySelect('')} className="ml-1 hover:text-slate-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.cidade && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {filters.cidade}
                    <button onClick={() => handleTextFilter('cidade', '')} className="ml-1 hover:text-slate-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.q && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    <Search className="w-3.5 h-3.5" />
                    "{filters.q}"
                    <button onClick={() => handleTextFilter('q', '')} className="ml-1 hover:text-slate-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Companies Grid/List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-slate-200 rounded-full" />
                  <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin absolute inset-0" />
                </div>
                <p className="mt-4 text-gray-500">Buscando empresas...</p>
              </div>
            ) : displayCompanies.length > 0 ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {displayCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} viewMode={viewMode} storageUrl={storageUrl} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* CTA Banner - only show when not logged in */}
            {!isLoggedIn && displayCompanies.length > 0 && (
              <div className="mt-10 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
                </div>

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Tem uma empresa de servicos?
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Cadastre-se e seja encontrado por milhares de condominios.
                    </p>
                  </div>
                  <Link
                    to="/register/empresa"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cadastrar empresa
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {isLoggedIn ? (
        <footer className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              2024 ServicePro. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      ) : (
        <PublicFooter />
      )}
    </div>
    </>
  )
}

function CompanyCard({ company, viewMode, storageUrl }) {
  const rating = company.average_rating ? parseFloat(company.average_rating).toFixed(1) : null
  const servicesCount = company.services_count || 0
  const logoUrl = company.logo_url || null
  const coverUrl = company.cover_url || null

  if (viewMode === 'list') {
    return (
      <Link
        to={`/empresa/${company.slug || company.id}`}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex"
      >
        {/* Cover/Logo Section */}
        <div className="w-32 h-full flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-white">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                  {(company.nome_fantasia || 'E').charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {company.nome_fantasia}
                </h3>
                {company.verified && (
                  <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              {company.cidade && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {company.cidade}{company.estado ? `, ${company.estado}` : ''}
                </p>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg flex-shrink-0">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700">{rating}</span>
              </div>
            )}
          </div>

          {/* Services tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(company.services_list || []).slice(0, 3).map((service, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                {service}
              </span>
            ))}
            {(company.services_list || []).length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                +{company.services_list.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {servicesCount} servicos
              </span>
              {company.deals_completed_count > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  {company.deals_completed_count} concluidos
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    )
  }

  // Grid view - same layout as Dashboard CompanyCardModern
  return (
    <Link
      to={`/empresa/${company.slug || company.id}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group relative"
    >
      {/* Header with Cover Image */}
      <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-t-2xl">
        {coverUrl && (
          <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {coverUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white text-sm font-medium">{rating}</span>
            </div>
          )}
        </div>

        {company.verified && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Logo - fora do container com overflow */}
      <div className="absolute top-[4.5rem] left-4 z-10">
        <div className="w-14 h-14 bg-white rounded-xl border-2 border-white shadow-lg overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={company.nome_fantasia} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-lg">
              {(company.nome_fantasia || 'E').charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-4 pb-4">
        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {company.nome_fantasia}
        </h3>
        {company.cidade && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {company.cidade}{company.estado ? `, ${company.estado}` : ''}
          </p>
        )}

        {/* Services tags */}
        {(company.services_list || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {company.services_list.slice(0, 2).map((service, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {service}
              </span>
            ))}
            {company.services_list.length > 2 && (
              <span className="text-xs text-gray-400">+{company.services_list.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{servicesCount} servicos</span>
          {company.deals_completed_count > 0 && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {company.deals_completed_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
