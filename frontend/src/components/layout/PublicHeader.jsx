import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Menu, X, Building2, Search, Briefcase, Home, MessageSquare, LayoutDashboard } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'

export default function PublicHeader() {
  const location = useLocation()
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
  const { settings, getLogoUrl } = useSettings()

  // Only consider authenticated if both initialized AND isAuthenticated are true
  const isLoggedIn = initialized && isAuthenticated
  const userType = user?.type
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Navegação contextual baseada no estado do usuário
  const getNavItems = () => {
    if (isLoggedIn) {
      // Usuário logado - mostrar links relevantes baseados no tipo
      if (userType === 'admin') {
        return [
          { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Usuarios', href: '/admin/users', icon: Search },
        ]
      }

      if (userType === 'empresa') {
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Meus Servicos', href: '/my-services', icon: Briefcase },
          { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
        ]
      }

      // Cliente
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Encontrar Empresas', href: '/empresas', icon: Search },
        { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
      ]
    }

    // Usuário não logado
    return [
      { name: 'Inicio', href: '/', icon: Home },
      { name: 'Encontrar Empresas', href: '/empresas', icon: Search },
      { name: 'Para Empresas', href: '/register/empresa', icon: Briefcase },
    ]
  }

  const navItems = getNavItems()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {getLogoUrl() ? (
              <img
                src={getLogoUrl()}
                alt={settings?.branding?.app_name || 'Logo'}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {(settings?.branding?.app_name || 'S')[0]}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {settings?.branding?.app_name || 'ServicePro'}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'text-slate-800 bg-slate-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold rounded-lg hover:from-slate-900 hover:to-black transition-all"
              >
                <Building2 className="w-4 h-4" />
                Meu Painel
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register/cliente"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold rounded-lg hover:from-slate-900 hover:to-black transition-all"
                >
                  Cadastrar
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {isLoggedIn ? (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black rounded-lg transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Meu Painel
                </Link>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register/cliente"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black rounded-lg transition-all"
                >
                  Cadastrar como Cliente
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
