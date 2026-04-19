# CondoHub

**Marketplace B2B para Servicos de Condominios**

Plataforma completa que conecta sindicos e administradores de condominios a empresas prestadoras de servicos, com negociacoes anonimas, sistema de ranking e gestao financeira integrada.

---

## Indice

- [Visao Geral](#visao-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalacao](#instalacao)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Reference](#api-reference)
- [Testes](#testes)
- [Seguranca e LGPD](#seguranca-e-lgpd)
- [Changelog](#changelog)

---

## Visao Geral

O CondoHub e uma solucao completa para o mercado de servicos condominiais que resolve o problema de confianca e transparencia na contratacao de prestadores. A plataforma oferece:

- **Anonimato nas negociacoes**: Empresas e clientes negociam sem revelar identidades ate o aceite formal
- **Sistema de ranking**: Empresas competem por posicao baseado em negociacoes concluidas
- **Planos de assinatura**: 3 niveis com diferentes limites de interacoes
- **Gestao financeira**: Controle de comissoes, transacoes e relatorios

### Tipos de Usuario

| Tipo | Descricao | Funcionalidades |
|------|-----------|-----------------|
| **Cliente** | Sindico ou administrador de condominio | Buscar servicos, iniciar negociacoes, avaliar empresas |
| **Empresa** | Prestador de servicos | Cadastrar servicos, responder negociacoes, gerenciar assinatura |
| **Admin** | Administrador da plataforma | Aprovar cadastros, gerenciar planos, visualizar metricas |

---

## Funcionalidades

### Autenticacao e Perfis

- Registro separado para Cliente e Empresa
- Login com token JWT via Laravel Sanctum
- Recuperacao de senha por email
- Perfis completos com indicador de completude
- **Timeout por inatividade** com aviso e logout automatico (30 minutos padrao)
- Extensao de sessao pelo usuario

### Catalogo de Servicos

- Busca com filtros por categoria, regiao e faixa de preco
- Paginacao otimizada com cursor
- Destaque para servicos em evidencia (featured)
- Categorias e subcategorias hierarquicas
- Visualizacao publica de empresas e servicos

### Sistema de Negociacao

O diferencial do CondoHub e o sistema de negociacao anonima:

1. **Cliente demonstra interesse** em um servico
2. **Sistema gera handles anonimos** (ex: `Empresa #A7F2`, `Cliente #C3B1`)
3. **Chat anonimizado** com sanitizacao automatica de dados pessoais
4. **Apos aceite**, dados reais sao liberados para ambas as partes
5. **Deal gera ordem** automaticamente para acompanhamento

**Estados do Deal:**
```
Aberto -> Em Negociacao -> Aceito/Rejeitado -> Concluido
```

### Chat em Tempo Real

- Mensagens entre cliente e empresa dentro da negociacao
- Sanitizacao automatica de dados pessoais (CPF, CNPJ, telefone, email)
- Indicador de mensagens nao lidas
- Historico completo por negociacao

### Sistema de Notificacoes

- Notificacoes em tempo real no header
- Tipos: nova negociacao, nova mensagem, atualizacao de status, sistema
- Marcar como lida individualmente ou todas
- Contador de nao lidas com badge
- Dropdown com acesso rapido as ultimas notificacoes

### Planos e Assinaturas

| Plano | Preco | Interacoes/Mes | Recursos |
|-------|-------|----------------|----------|
| **Gratuito** | R$ 0 | 10 | Acesso basico |
| **Intermediario** | R$ 99 | 100 | Ranking ativo, suporte prioritario |
| **Premium** | R$ 199 | Ilimitado | Todos os recursos, destaque no catalogo |

- Controle de interacoes utilizadas
- Upgrade/downgrade de plano
- Renovacao automatica
- Expiracao gerenciada por scheduler

### Ranking e Gamificacao

- Score calculado por negociacoes concluidas
- Ranking atualizado por semestre
- Posicao visivel para empresas
- Historico de ciclos anteriores
- Reset automatico semestral

### Gestao Financeira

- Dashboard com metricas (receita total, comissoes, pendencias)
- Historico de transacoes
- Calculo automatico de comissao por ordem concluida
- Exportacao de relatorios

### Painel Administrativo

- Dashboard com KPIs da plataforma
- Gestao de usuarios (ativar, bloquear, qualificar)
- Gestao de planos e precos
- Configuracao de banners promocionais
- Aprovacao de ordens
- Visualizacao de logs de atividade

### Interface do Usuario

- **Layout moderno** com sidebar colapsavel (Ctrl+B / Cmd+B)
- **Dark Mode / Light Mode** com persistencia
- **Componentes shadcn/ui** para UI consistente
- **Design responsivo** (mobile, tablet, desktop)
- **Loading states** com skeleton animations
- **Glass morphism cards** para estatisticas

---

## Tecnologias

### Backend

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| PHP | 8.2+ | Runtime |
| Laravel | 11.x | Framework API |
| Laravel Sanctum | 4.x | Autenticacao |
| MySQL | 8.0+ | Banco de dados |
| PHPUnit | 10.x | Testes |

### Frontend

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| React | 18.x | UI Library |
| Vite | 5.x | Build tool |
| Redux Toolkit | 2.x | Estado global |
| React Router | 6.x | Roteamento |
| Tailwind CSS | 3.x | Estilizacao |
| shadcn/ui | Latest | Componentes UI |
| Radix UI | Latest | Primitivos acessiveis |
| Vitest | 1.x | Testes |
| Testing Library | Latest | Testes de componente |
| MSW | 2.x | Mock de API em testes |

---

## Instalacao

### Pre-requisitos

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- npm ou yarn
- MySQL 8.0+

### Backend

```bash
# Navegue para o diretorio backend
cd backend

# Instale as dependencias
composer install

# Configure o ambiente
cp .env.example .env
php artisan key:generate

# Configure o banco de dados no .env
# DB_DATABASE=condohub
# DB_USERNAME=root
# DB_PASSWORD=

# Execute as migrations
php artisan migrate

# (Opcional) Popule com dados de teste
php artisan db:seed

# Inicie o servidor
php artisan serve
```

### Frontend

```bash
# Navegue para o diretorio frontend
cd frontend

# Instale as dependencias
npm install

# Configure o ambiente
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api

# Inicie o servidor de desenvolvimento
npm run dev
```

### Usuarios Padrao (apos seed)

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@condohub.com | password |
| Empresa | empresa@teste.com | password |
| Cliente | cliente@teste.com | password |

---

## Estrutura do Projeto

```
Sistema-condominios/
├── backend/                      # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/      # REST Controllers
│   │   │   └── Middleware/       # Auth, Role checks
│   │   ├── Models/               # Eloquent Models (22 tabelas)
│   │   ├── Observers/            # Model events
│   │   └── Services/             # Business logic
│   ├── database/
│   │   ├── migrations/           # Schema definitions
│   │   └── seeders/              # Data seeders
│   ├── routes/
│   │   └── api.php               # 100+ API endpoints
│   └── tests/                    # PHPUnit tests
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components (20+)
│   │   │   └── ...               # App components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # DashboardLayout, AuthLayout
│   │   ├── pages/                # Page components
│   │   │   ├── admin/            # Admin panel pages
│   │   │   └── auth/             # Login, Register pages
│   │   ├── store/
│   │   │   └── slices/           # Redux slices
│   │   ├── services/             # API services
│   │   ├── lib/                  # Utilities
│   │   └── test/                 # Test setup, mocks
│   └── tests/                    # Vitest tests
│
└── README.md
```

### Principais Models (Backend)

| Model | Tabela | Descricao |
|-------|--------|-----------|
| User | users | Usuarios do sistema |
| CompanyProfile | company_profiles | Perfil de empresa |
| ClientProfile | client_profiles | Perfil de cliente |
| Service | services | Servicos cadastrados |
| Category | categories | Categorias hierarquicas |
| Deal | deals | Negociacoes |
| Message | messages | Mensagens do chat |
| Order | orders | Ordens de servico |
| OrderLog | order_logs | Historico de status |
| Transaction | transactions | Transacoes financeiras |
| Plan | plans | Planos de assinatura |
| Subscription | subscriptions | Assinaturas ativas |
| Ranking | rankings | Score por ciclo |
| Notification | notifications | Notificacoes do usuario |
| Banner | banners | Banners promocionais |

### Principais Componentes (Frontend)

| Componente | Descricao |
|------------|-----------|
| DashboardLayout | Layout principal com sidebar |
| Sidebar | Navegacao lateral colapsavel |
| Header | Cabecalho com notificacoes e perfil |
| NotificationDropdown | Dropdown de notificacoes |
| ThemeToggle | Alternador dark/light mode |
| GlassStatCard | Cards de estatisticas com efeito glass |
| InactivityWarningModal | Modal de aviso de inatividade |

### Principais Hooks (Frontend)

| Hook | Descricao |
|------|-----------|
| useInactivityTimeout | Detecta inatividade e faz logout automatico |
| useAuth | Acesso ao estado de autenticacao |
| useTheme | Controle do tema dark/light |

---

## API Reference

### Autenticacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Usuario atual |
| POST | /api/auth/forgot-password | Solicitar reset |
| POST | /api/auth/reset-password | Redefinir senha |
| POST | /api/auth/extend-session | Estender sessao |

### Servicos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/services | Listar servicos |
| POST | /api/services | Criar servico |
| GET | /api/services/:id | Detalhe do servico |
| PUT | /api/services/:id | Atualizar servico |
| DELETE | /api/services/:id | Remover servico |

### Negociacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/deals | Listar negociacoes |
| POST | /api/deals | Iniciar negociacao |
| GET | /api/deals/:id | Detalhe da negociacao |
| PATCH | /api/deals/:id/status | Atualizar status |
| GET | /api/deals/:id/messages | Listar mensagens |
| POST | /api/deals/:id/messages | Enviar mensagem |

### Notificacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/notifications | Listar notificacoes |
| GET | /api/notifications/unread-count | Contador de nao lidas |
| PATCH | /api/notifications/:id/read | Marcar como lida |
| POST | /api/notifications/mark-all-read | Marcar todas como lidas |
| DELETE | /api/notifications/:id | Excluir notificacao |

### Assinaturas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/subscription | Assinatura atual |
| GET | /api/plans | Planos disponiveis |
| POST | /api/subscription/change-plan | Alterar plano |
| POST | /api/subscription/cancel | Cancelar assinatura |

### Financeiro

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/finance/summary | Resumo financeiro |
| GET | /api/finance/transactions | Historico de transacoes |

### Ranking

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/ranking | Ranking atual |
| GET | /api/ranking/me | Minha posicao |

### Rotas Publicas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/public/categories | Categorias |
| GET | /api/public/companies | Empresas publicas |
| GET | /api/public/companies/:id | Detalhe da empresa |
| GET | /api/public/services | Servicos publicos |

---

## Testes

### Backend

```bash
cd backend

# Rodar todos os testes
php artisan test

# Rodar testes especificos
php artisan test --filter=AuthTest
php artisan test --filter=DealTest
php artisan test --filter=ServiceTest
```

**Cobertura de testes backend:**
- Autenticacao (registro, login, logout, recuperacao)
- CRUD de servicos
- Fluxo de negociacao
- Gestao de assinaturas
- Sistema de ranking

### Frontend

```bash
cd frontend

# Rodar todos os testes
npm test

# Rodar com coverage
npm run test:coverage

# Rodar em modo watch
npm run test:watch
```

**Cobertura de testes frontend (239 testes):**
- Redux Slices (auth, deals, services, notifications, subscription)
- Hooks (useInactivityTimeout)
- Componentes (NotificationDropdown, Dashboard, etc.)
- Paginas (Login, Register, Home, Dashboard)
- Integracao com MSW para mock de API

---

## Seguranca e LGPD

### Medidas de Seguranca

| Recurso | Implementacao |
|---------|---------------|
| **Autenticacao** | Laravel Sanctum com tokens por sessao |
| **CSRF** | Protecao nativa do Laravel |
| **Rate Limiting** | Limitacao de requisicoes por IP |
| **Senhas** | Hash bcrypt (padrao Laravel) |
| **Sanitizacao** | Middleware remove dados pessoais das mensagens |
| **Anonimizacao** | Handles gerados automaticamente nas negociacoes |
| **Timeout** | Logout automatico apos 30 minutos de inatividade |
| **SSL** | HTTPS obrigatorio em producao |

### Conformidade LGPD

| Requisito | Implementacao |
|-----------|---------------|
| **Soft Delete** | Coluna `deleted_at` em todas as tabelas sensiveis |
| **Consentimento** | Aceite de termos no registro |
| **Portabilidade** | Exportacao de dados do usuario |
| **Exclusao** | Possibilidade de deletar conta |
| **Minimizacao** | Coleta apenas de dados necessarios |

---

## Scripts Uteis

### Backend

```bash
# Migrations
php artisan migrate                    # Executar migrations
php artisan migrate:fresh --seed       # Reset completo com seed

# Seeders
php artisan db:seed                    # Todos os seeders
php artisan db:seed --class=FakeDataSeeder  # Dados fake

# Cache
php artisan config:cache               # Cache de configuracao
php artisan route:cache                # Cache de rotas
php artisan optimize                   # Otimizar para producao
```

### Frontend

```bash
# Desenvolvimento
npm run dev                            # Servidor dev com HMR

# Build
npm run build                          # Build de producao
npm run preview                        # Preview do build

# Qualidade
npm run lint                           # ESLint
npm run format                         # Prettier
```

---

## Changelog

### v1.2.0 (2024)
- Sistema de notificacoes completo
- Timeout por inatividade com aviso
- Melhorias nos testes (239 testes passando)
- Correcao de bugs no hook useInactivityTimeout
- Atualizacao do MSW para API mocking

### v1.1.0 (2024)
- Modernizacao UI com shadcn/ui
- DashboardLayout com sidebar colapsavel
- Tema dark/light com persistencia
- 20+ componentes UI reutilizaveis
- Glass morphism cards
- 112 testes frontend

### v1.0.0 (2024)
- MVP completo da plataforma
- Autenticacao 3 perfis
- Catalogo de servicos com filtros
- Sistema de negociacao anonimizada
- Chat entre cliente e empresa
- Gestao de ordens
- Sistema de assinaturas
- Ranking por semestre
- Painel administrativo
- 54 testes backend

---

## Licenca

Este projeto e proprietario. Todos os direitos reservados.

---

## Suporte

Para reportar bugs ou solicitar features, abra uma issue no repositorio.

---

*CondoHub - Conectando condominios aos melhores prestadores de servico*
