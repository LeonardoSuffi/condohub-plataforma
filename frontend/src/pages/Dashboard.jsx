import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { setUser } from '../store/slices/authSlice'
import {
  Sun,
  Search,
  Plus,
  MessageSquare,
  ClipboardList,
  User,
  CheckCircle,
  Briefcase,
  Trophy,
  Users,
  CreditCard,
  ChevronRight,
  X,
  Pencil,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dismissedBanner, setDismissedBanner] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dealsRes, ordersRes, userRes] = await Promise.all([
        api.get('/deals', { params: { per_page: 5 } }),
        api.get('/orders', { params: { per_page: 5 } }),
        api.get('/users/me'),
      ])

      setStats({
        deals: dealsRes.data,
        orders: ordersRes.data,
      })

      if (userRes.data?.data) {
        dispatch(setUser(userRes.data.data))
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status) => {
    const variants = {
      aberto: 'info',
      negociando: 'warning',
      aceito: 'success',
      concluido: 'success',
      rejeitado: 'destructive',
      pendente: 'warning',
      aprovado: 'info',
    }
    return variants[status] || 'secondary'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Welcome Banner Skeleton */}
        <Skeleton className="h-48 w-full rounded-2xl" />

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const dealsCount = stats?.deals?.meta?.total || stats?.deals?.data?.length || 0
  const ordersCount = stats?.orders?.meta?.total || stats?.orders?.data?.length || 0

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-2">
                <Sun className="w-4 h-4" />
                <span>Bom dia</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Ola, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-primary-foreground/70 max-w-lg">
                {user?.type === 'empresa' && 'Gerencie seus servicos, acompanhe negociacoes e cresca seu negocio na plataforma.'}
                {user?.type === 'cliente' && 'Encontre os melhores prestadores de servicos para seu condominio com seguranca.'}
                {user?.type === 'admin' && 'Acompanhe todas as atividades e gerencie a plataforma de forma centralizada.'}
              </p>
            </div>

            <div className="flex gap-3">
              {user?.type === 'cliente' && (
                <Button asChild variant="secondary" size="lg">
                  <Link to="/services">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar servicos
                  </Link>
                </Button>
              )}
              {user?.type === 'empresa' && (
                <Button asChild variant="secondary" size="lg">
                  <Link to="/my-services/new">
                    <Plus className="w-5 h-5 mr-2" />
                    Cadastrar servico
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Banner */}
      {user?.profile_completion && user.profile_completion.percentage < 100 && !dismissedBanner && (
        <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissedBanner(true)}
            className="absolute top-4 right-4 text-warning hover:text-warning/80"
          >
            <X className="w-5 h-5" />
          </Button>

          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Complete seu perfil</h3>
                    <p className="text-sm text-warning">Quanto mais completo, mais resultados!</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  Perfis completos tem ate 3x mais chances de fechar negocios. Quanto mais informacoes, mais confianca voce transmite!
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-warning/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-warning to-warning/80 rounded-full transition-all duration-500"
                      style={{ width: `${user.profile_completion.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-warning min-w-[3rem]">
                    {user.profile_completion.percentage}%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {user.profile_completion.completed} de {user.profile_completion.total} campos preenchidos
                </p>
              </div>

              <Button asChild variant="warning" size="lg">
                <Link to="/profile">
                  <Pencil className="w-5 h-5 mr-2" />
                  Completar perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <p className="text-2xl font-bold">{dealsCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Negociacoes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary-foreground" />
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <p className="text-2xl font-bold">{ordersCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Ordens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-lg font-bold">
              {user?.type === 'empresa' ? 'Prestador' : user?.type === 'cliente' ? 'Sindico' : 'Admin'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Tipo de conta</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <p className="text-lg font-bold">Ativo</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Status da conta</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Acesso Rapido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.type === 'cliente' && (
            <>
              <QuickActionCard
                href="/services"
                icon={Search}
                title="Buscar Servicos"
                description="Encontre prestadores qualificados"
              />
              <QuickActionCard
                href="/deals"
                icon={MessageSquare}
                title="Negociacoes"
                description="Acompanhe suas conversas"
              />
              <QuickActionCard
                href="/orders"
                icon={ClipboardList}
                title="Minhas Ordens"
                description="Acompanhe o status dos pedidos"
              />
            </>
          )}

          {user?.type === 'empresa' && (
            <>
              <QuickActionCard
                href="/my-services"
                icon={Briefcase}
                title="Meus Servicos"
                description="Gerencie seu catalogo"
              />
              <QuickActionCard
                href="/deals"
                icon={MessageSquare}
                title="Propostas"
                description="Veja solicitacoes recebidas"
              />
              <QuickActionCard
                href="/ranking"
                icon={Trophy}
                title="Ranking"
                description="Veja sua posicao no mercado"
              />
            </>
          )}

          {user?.type === 'admin' && (
            <>
              <QuickActionCard
                href="/admin/users"
                icon={Users}
                title="Usuarios"
                description="Gerenciar contas"
              />
              <QuickActionCard
                href="/admin/orders"
                icon={ClipboardList}
                title="Ordens"
                description="Aprovar e gerenciar"
              />
              <QuickActionCard
                href="/admin/plans"
                icon={CreditCard}
                title="Planos"
                description="Configurar assinaturas"
              />
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <CardTitle className="text-base">Negociacoes Recentes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/deals">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.deals?.data?.length > 0 ? (
              stats.deals.data.slice(0, 4).map((deal, index) => (
                <Link
                  key={deal.id}
                  to={`/chat/${deal.id}`}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors",
                    index < stats.deals.data.slice(0, 4).length - 1 && "border-b"
                  )}
                >
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-sm font-semibold">
                    {(deal.service?.title || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {deal.service?.title || 'Servico'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.type === 'empresa' ? deal.anon_handle_b : deal.anon_handle_a}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(deal.status)}>{deal.status}</Badge>
                </Link>
              ))
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Nenhuma negociacao</p>
                <p className="text-xs text-muted-foreground mt-1">Suas conversas aparecerao aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary-foreground" />
              </div>
              <CardTitle className="text-base">Ordens Recentes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.orders?.data?.length > 0 ? (
              stats.orders.data.slice(0, 4).map((order, index) => (
                <div
                  key={order.id}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors",
                    index < stats.orders.data.slice(0, 4).length - 1 && "border-b"
                  )}
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground">
                    #{order.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Ordem #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(parseFloat(order.value))}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
              ))
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Nenhuma ordem</p>
                <p className="text-xs text-muted-foreground mt-1">Suas ordens aparecerao aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickActionCard({ href, icon: Icon, title, description }) {
  return (
    <Card className="group hover:border-foreground/20 hover:shadow-sm transition-all">
      <CardContent className="p-6">
        <Link to={href} className="block">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <h3 className="text-base font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </Link>
      </CardContent>
    </Card>
  )
}
