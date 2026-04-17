import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import {
  Building2,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  ClipboardList,
  Trophy,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getInitials } from '@/lib/utils'
import NotificationDropdown from '../components/NotificationDropdown'
import { ThemeToggle } from '@/components/theme-toggle'

// Navigation configuration by user type
const navigationConfig = {
  cliente: {
    label: 'Cliente',
    items: [
      { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Catalogo de Servicos', href: '/services', icon: ShoppingBag },
      { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
      { name: 'Pedidos', href: '/orders', icon: ClipboardList },
    ],
  },
  empresa: {
    label: 'Empresa',
    items: [
      { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Meus Servicos', href: '/my-services', icon: ShoppingBag },
      { name: 'Negociacoes', href: '/deals', icon: MessageSquare },
      { name: 'Ranking', href: '/ranking', icon: Trophy },
    ],
  },
  admin: {
    label: 'Administrador',
    items: [
      { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Usuarios', href: '/admin/users', icon: Users },
      { name: 'Pedidos', href: '/admin/orders', icon: ClipboardList },
      { name: 'Planos', href: '/admin/plans', icon: CreditCard },
      { name: 'Financeiro', href: '/admin/finance', icon: FileText },
    ],
  },
}

// Page title mapping for breadcrumbs
const pageTitles = {
  '/dashboard': 'Inicio',
  '/services': 'Catalogo de Servicos',
  '/deals': 'Negociacoes',
  '/orders': 'Pedidos',
  '/my-services': 'Meus Servicos',
  '/ranking': 'Ranking',
  '/admin/users': 'Usuarios',
  '/admin/orders': 'Pedidos',
  '/admin/plans': 'Planos',
  '/admin/finance': 'Financeiro',
  '/profile': 'Perfil',
  '/settings': 'Configuracoes',
}

function AppSidebar() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userType = user?.type || 'cliente'
  const nav = navigationConfig[userType]

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const isActive = (href) => location.pathname === href

  return (
    <Sidebar>
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">
              CondoHub
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {nav.label}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.name}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/profile')}
                  tooltip="Meu Perfil"
                >
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/settings')}
                  tooltip="Configuracoes"
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Configuracoes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuracoes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function Header() {
  const location = useLocation()
  const currentPage = pageTitles[location.pathname] || 'Pagina'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link to="/dashboard">CondoHub</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search (hidden on mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
