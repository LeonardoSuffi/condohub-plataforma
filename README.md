# CondoHub — Plataforma de Negocios Condominial

> Plataforma completa para conexao entre prestadores de servicos e condominios | Laravel 11 + React + shadcn/ui + MySQL

---

## Inicio Rapido

### Pre-requisitos
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer

### Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/Sistema-condominios.git
cd Sistema-condominios

# Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend (React + shadcn/ui)
cd ../frontend
npm install
npm run dev
```

### Acessos padrao (apos seed)
- **Admin:** admin@condohub.com / password
- **Empresa:** empresa@teste.com / password
- **Cliente:** cliente@teste.com / password

### Comandos uteis

```bash
# Backend
php artisan test                    # Rodar testes (54 testes)
php artisan db:seed --class=FakeDataSeeder  # Dados fake para teste

# Frontend
npm run dev                         # Servidor de desenvolvimento
npm run build                       # Build de producao
npm test                            # Rodar testes (112 testes)
```

---

## Stack Tecnologica

| Camada | Tecnologia | Versao |
|--------|------------|--------|
| **Backend** | Laravel | 11.x |
| **Frontend** | React + Vite | 18.x + 5.x |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Estilizacao** | Tailwind CSS | 3.x |
| **Estado** | Redux Toolkit | 2.x |
| **Banco de Dados** | MySQL | 8.0+ |
| **Autenticacao** | Laravel Sanctum | 4.x |
| **Testes Backend** | PHPUnit | 10.x |
| **Testes Frontend** | Vitest + Testing Library | 1.x |

---

## Funcionalidades Implementadas

### UI Moderna com shadcn/ui
- Layout com sidebar colapsavel (Ctrl+B)
- Tema dark/light com persistencia
- Componentes reutilizaveis (Button, Card, Badge, Dialog, etc.)
- Loading states com Skeleton animations
- Design responsivo (mobile/tablet/desktop)

### Autenticacao e Perfis
- 3 tipos de usuario: Cliente (Sindico), Empresa (Prestador), Admin
- Registro separado por tipo de perfil
- Indicador de completude de perfil

### Catalogo de Servicos
- Busca com filtros (categoria, regiao, preco)
- Paginacao com cursor
- Destaque para servicos featured

### Sistema de Negociacao
- Chat anonimizado entre cliente e empresa
- Handles anonimos gerados automaticamente
- Liberacao de dados apos aceite

### Gestao de Ordens
- Fluxo: Pendente -> Aprovado -> Concluido
- Log de alteracoes de status
- Calculo automatico de comissao

### Painel Administrativo
- Dashboard com KPIs
- Gestao de usuarios, ordens, planos
- Configuracao de banners

---

## Estrutura do Projeto

```
Sistema-condominios/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/   # Controllers REST
│   │   ├── Models/             # Eloquent Models
│   │   ├── Observers/          # Model Observers
│   │   └── Services/           # Business Logic
│   ├── database/
│   │   ├── migrations/         # Database Schema
│   │   └── seeders/            # Data Seeders
│   └── tests/                  # PHPUnit Tests
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui Components
│   │   │   └── ...             # App Components
│   │   ├── layouts/            # DashboardLayout, AuthLayout
│   │   ├── pages/              # Page Components
│   │   ├── store/              # Redux Store
│   │   ├── services/           # API Services
│   │   └── lib/                # Utilities (cn, formatters)
│   └── tests/                  # Vitest Tests
│
└── README.md
```

---

## Testes

### Backend (54 testes)
```bash
cd backend && php artisan test
```
- AuthTest: Registro, login, logout
- ServiceTest: CRUD de servicos
- DealTest: Fluxo de negociacao
- OrderTest: Gestao de ordens
- FakeDataSeederTest: Validacao de dados fake

### Frontend (112 testes)
```bash
cd frontend && npm test
```
- Redux Slices: auth, deals, services, notifications
- Pages: Dashboard, Home, Login
- Components: UI components

---

## Documentacao Tecnica

## Sumario

1. [Diagrama de Casos de Uso](#1-diagrama-de-casos-de-uso)
2. [Diagrama de Classes (ERD)](#2-diagrama-de-classes-erd)
3. [Fluxo de Negociação (Activity + Sequence)](#3-fluxo-de-negociação-activity--sequence)
4. [Arquitetura em Camadas (Component Diagram)](#4-arquitetura-em-camadas-component-diagram)
5. [Diagrama de Estados](#5-diagrama-de-estados)
6. [Rotas da API](#6-rotas-da-api)
7. [Rotas do Frontend](#7-rotas-do-frontend)
8. [Fases do Projeto](#8-fases-do-projeto)

---

## 1. Diagrama de Casos de Uso

### Atores

| Ator | Tipo | Middleware |
|---|---|---|
| **Empresa** | Prestador de serviço condominial | `isEmpresa` + `hasActivePlan` |
| **Cliente** | Síndico / Administradora / Condomínio | `isCliente` |
| **Administrador** | Gestão total da plataforma | `isAdmin` |

### Casos de Uso por Ator

```
┌─────────────────────────────────────────────────────────────────┐
│                    Plataforma Condominial                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Cadastrar / Autenticar                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────────────┐   │
│  │ [Empresa]            │    │ [Cliente]                    │   │
│  │ • Gerenciar serviços │    │ • Buscar serviços            │   │
│  │ • Assinar plano      │    │ • Iniciar negociação         │   │
│  │ • Ver ranking        │    │ • Chat anonimizado           │   │
│  │ • Responder negoc.   │    │ • Finalizar pedido           │   │
│  └──────────────────────┘    └──────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Admin]                                                 │    │
│  │ • Aprovar ordens  • Gerenciar planos/banners            │    │
│  │ • Relatórios financeiros  • Qualificar empresas         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Descrição dos Casos de Uso

**UC01 — Cadastrar / Autenticar**
- Atores: Empresa, Cliente, Admin
- Fluxo: Registro por tipo de perfil → Validação de e-mail (opcional no MVP) → Token Sanctum por sessão
- Exceção: Recuperação de senha via link temporário (Laravel Password Reset nativo)

**UC02 — Gerenciar Serviços** *(Empresa)*
- Pré-condição: `hasActivePlan`
- Fluxo: Criar/editar serviço com título, descrição, categoria, região, faixa de preço e status

**UC03 — Buscar Serviços** *(Cliente)*
- Filtros: categoria/subcategoria, região, faixa de preço
- Paginação com cursor (performática em MySQL)

**UC04 — Fluxo de Negociação** *(Cliente + Empresa)*
- Identidades anonimizadas via `anon_handle` gerado no deal
- Middleware de saída sanitiza dados pessoais nas mensagens

**UC05 — Aprovar Ordens** *(Admin)*
- Pré-condição: Deal aceito com ordem gerada
- Transições: Pendente → Aprovado → Concluído | Rejeitado

---

## 2. Diagrama de Classes (ERD)

### Entidades e Atributos

```
┌──────────────────┐         ┌───────────────────────┐
│      USERS       │ 1     0..1│   COMPANY_PROFILES    │
│──────────────────│─────────>│───────────────────────│
│ id: bigint PK    │         │ id: bigint PK          │
│ name: string     │         │ user_id: bigint FK     │
│ email: string    │         │ cnpj: string           │
│ password: string │         │ razao_social: string   │
│ type: enum       │         │ segmento: string       │
│ email_verified_at│         │ verified: boolean      │
│ deleted_at       │         │ deleted_at             │
└──────────────────┘         └───────────────────────┘
         │ 1                           │ 1
         │                            │
         │ 0..1                        │ N
         v                            v
┌──────────────────┐         ┌───────────────────────┐
│  CLIENT_PROFILES │         │       SERVICES        │
│──────────────────│         │───────────────────────│
│ id: bigint PK    │         │ id: bigint PK         │
│ user_id: bigint FK│        │ company_id: bigint FK │
│ cpf: string      │         │ category_id: bigint FK│
│ preferences: json│         │ title: string         │
│ deleted_at       │         │ description: text     │
└──────────────────┘         │ region: string        │
                             │ price_range: string   │
                             │ status: enum          │
                             │ featured: boolean     │
                             └───────────────────────┘
                                        │ N
                                        │ pertence a
                                        │ 1
                             ┌──────────────────────┐
                             │      CATEGORIES      │
                             │──────────────────────│
                             │ id: bigint PK        │
                             │ parent_id: bigint FK │
                             │ name: string         │
                             └──────────────────────┘
```

```
┌──────────────────┐      ┌───────────────┐      ┌────────────────────┐
│      DEALS       │ 1  N │   MESSAGES    │      │      ORDERS        │
│──────────────────│─────>│───────────────│      │────────────────────│
│ id: bigint PK    │      │ id: bigint PK │      │ id: bigint PK      │
│ company_id FK    │      │ deal_id FK    │      │ deal_id: bigint FK │
│ client_id FK     │      │ sender_id FK  │      │ value: decimal     │
│ service_id FK    │      │ content_san.  │      │ status: enum       │
│ status: enum     │      │ created_at    │      │ approved_by        │
│ anon_handle_a    │      └───────────────┘      │ created_at         │
│ anon_handle_b    │ 1                 1 │        └────────────────────┘
└──────────────────┘                    │                │ 1
                                        v                │ N
                             ┌──────────────────┐        v
                             │   ORDER_LOGS     │  ┌──────────────────┐
                             │──────────────────│  │  TRANSACTIONS    │
                             │ id: bigint PK    │  │──────────────────│
                             │ order_id FK      │  │ id: bigint PK    │
                             │ old_status       │  │ user_id FK       │
                             │ new_status       │  │ order_id FK      │
                             │ created_at       │  │ type: enum       │
                             └──────────────────┘  │ amount: decimal  │
                                                   │ commission: dec  │
                                                   └──────────────────┘
```

```
┌──────────────────┐         ┌──────────────────┐      ┌──────────────────┐
│      PLANS       │ 1     N │  SUBSCRIPTIONS   │      │    RANKINGS      │
│──────────────────│────────<│──────────────────│      │──────────────────│
│ id: bigint PK    │         │ id: bigint PK    │      │ id: bigint PK    │
│ name: string     │         │ user_id FK       │      │ user_id FK       │
│ price: decimal   │         │ plan_id FK       │      │ score: decimal   │
│ features: json   │         │ status: enum     │      │ cycle: string    │
│ max_interactions │         │ starts_at        │      │ created_at       │
└──────────────────┘         │ ends_at          │      └──────────────────┘
                             └──────────────────┘
```

### Cardinalidades Resumidas

| Relacionamento | Cardinalidade | Observação |
|---|---|---|
| `users` → `company_profiles` | 1:0..1 | Um user pode ter um perfil empresa |
| `users` → `client_profiles` | 1:0..1 | Um user pode ter um perfil cliente |
| `company_profiles` → `services` | 1:N | Empresa cadastra múltiplos serviços |
| `services` → `categories` | N:1 | Serviço pertence a uma categoria |
| `categories` → `categories` | 1:N (self) | Suporte a subcategorias |
| `deals` → `messages` | 1:N | Histórico de chat por deal |
| `deals` → `orders` | 1:0..1 | Deal aceito gera uma ordem |
| `orders` → `order_logs` | 1:N | Log de mudanças de status |
| `orders` → `transactions` | 1:N | Ordem concluída gera transações |
| `users` → `subscriptions` | 1:N | Histórico de assinaturas |
| `plans` → `subscriptions` | 1:N | Plano referenciado por assinaturas |
| `users` → `rankings` | 1:N | Score por ciclo |

> **Nota LGPD:** todas as tabelas sensíveis possuem coluna `deleted_at` para soft delete, garantindo conformidade sem excluir fisicamente os registros.

---

## 3. Fluxo de Negociação (Activity + Sequence)

### Diagrama de Sequência

```
Cliente              Sistema (API)              Empresa               Admin
  │                       │                       │                     │
  │── GET /api/services ──>│                       │                     │
  │   (filtros aplicados)  │                       │                     │
  │<─ catálogo paginado ───│                       │                     │
  │                        │                       │                     │
  │── POST /api/deals ─────>│                       │                     │
  │   (service_id)         │── notifica interesse ─>│                     │
  │                        │   gera anon_handles    │                     │
  │<─ deal criado ─────────│   (handle_a / handle_b)│                     │
  │                        │                       │                     │
  │── POST /api/messages ──>│ sanitiza msg.         │                     │
  │<─────────────────────── │── entrega msg ────────>│                     │
  │                        │   (polling N seg.)     │                     │
  │                        │<─ resposta empresa ────│                     │
  │<─ msg entregue ─────────│                       │                     │
  │                        │                       │                     │
  │── PATCH /api/deals     │                       │                     │
  │   {status: "aceito"} ──>│                       │                     │
  │                        │── libera dados reais ──>│                     │
  │                        │   cria order (pendente)│                     │
  │<─ ordem gerada ─────────│                       │                     │
  │                        │                       │                     │
  │                        │── ordem pendente ──────────────────────────>│
  │                        │                       │                     │
  │                        │<── PATCH /api/orders ───────────────────────│
  │                        │    {status: "aprovado"}│                     │
  │                        │                       │                     │
  │                        │── gera transação ──────────────────────────>│
  │                        │   calcula comissão     │                     │
  │                        │   atualiza ranking     │                     │
```

### Diagrama de Atividade — Decisões

```
[Início]
   │
   ▼
[Cliente acessa catálogo] ──── filtros: categoria / região / preço
   │
   ▼
[Demonstra interesse] ──────── POST /api/deals
   │                           Sistema gera anon_handles
   ▼
[Chat anonimizado] ─────────── Middleware sanitiza dados pessoais
   │                           Polling a cada N segundos
   ▼
[Aceitar negociação?]
   │
   ├── NÃO ──> [Deal: Rejeitado] ──> [Fim]
   │
   └── SIM ──> [Libera dados reais]
                    │
                    ▼
               [Ordem gerada automaticamente]
                    │
                    ▼
               [Admin aprova?]
                    │
                    ├── NÃO ──> [Order: Rejeitado] ──> [Fim]
                    │
                    └── SIM ──> [Order: Aprovado]
                                     │
                                     ▼
                                [Serviço executado]
                                     │
                                     ▼
                                [Order: Concluído]
                                     │
                                     ├──> [Gera Transação + Comissão]
                                     │
                                     └──> [Atualiza Ranking]
                                               │
                                               ▼
                                          [Fim]
```

### Regra de Anonimização

| Campo | Valor gerado | Momento |
|---|---|---|
| `anon_handle_a` | Ex: `Empresa #A7F2` | Criação do deal |
| `anon_handle_b` | Ex: `Cliente #C3B1` | Criação do deal |
| Liberação dos dados reais | `company_id` + `client_id` expostos | Após aceite da negociação |

> Anonimização implementada via `anonymous_handle` gerado no momento da criação do deal — sem biblioteca externa.

---

## 4. Arquitetura em Camadas (Component Diagram)

```
┌────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO — SPA                                          │
│  Vue.js ou React  ·  Pinia (Vue) / Redux (React)  ·  Vite             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐ │
│  │ Auth/Cadastro│ Catálogo /   │ Chat /       │ Admin /              │ │
│  │              │ Busca        │ Negociação   │ Financeiro           │ │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────────┘
                             │  REST / JSON (HTTPS)
┌────────────────────────────▼───────────────────────────────────────────┐
│  GATEWAY DE API — Laravel Sanctum                                      │
│  CSRF  ·  Rate Limiting  ·  Token por sessão                           │
│  Middlewares: isAdmin | isEmpresa | isCliente | hasActivePlan          │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────────┐
│  CAMADA DE NEGÓCIO — Services / Repositories                           │
│  ┌────────────────┬────────────────┬────────────────┬────────────────┐ │
│  │  DealService   │  OrderService  │ FinanceService │ RankingService │ │
│  │  Anonimização  │  Aprovação     │ Comissões      │ Score / ciclo  │ │
│  └────────────────┴────────────────┴────────────────┴────────────────┘ │
│  ┌────────────────┬────────────────┬────────────────┬────────────────┐ │
│  │ AuthService    │ ServiceCatalog │SubscriptionSvc │ BannerService  │ │
│  └────────────────┴────────────────┴────────────────┴────────────────┘ │
└────────────┬───────────────────────────────────────┬───────────────────┘
             │                                       │
┌────────────▼───────────────────────┐   ┌───────────▼──────────────────┐
│  CAMADA DE DADOS                   │   │  SERVIÇOS EXTERNOS           │
│  Eloquent ORM + MySQL              │   │  Asaas / Pagar.me            │
│  Migrations  ·  Soft delete (LGPD) │   │  PIX · Boleto · Cartão       │
│  Cache nativo Laravel              │   │  Webhooks                    │
│  ┌──────────┬──────────┬─────────┐ │   └──────────────────────────────┘
│  │ users /  │ deals /  │orders / │ │
│  │ profiles │ messages │transact.│ │
│  └──────────┴──────────┴─────────┘ │
└────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────────────┐
│  INFRAESTRUTURA — VPS Hostinger                                         │
│  Ubuntu 22+  ·  Nginx  ·  PHP-FPM 8.2  ·  Let's Encrypt SSL            │
│  ┌──────────────────┬──────────────────┬───────────────┬─────────────┐  │
│  │ GitHub Actions   │ Laravel Scheduler│ Laravel Log   │ Sentry      │  │
│  │ CI/CD via SSH    │ Reset ranking    │ local (MVP)   │ (Fase 2)    │  │
│  │                  │ Expira planos    │               │             │  │
│  └──────────────────┴──────────────────┴───────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnologica Detalhada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Backend | Laravel 11 (PHP 8.2+) | API REST, regras de negocio, autenticacao |
| Frontend | React 18 + Vite 5 | SPA moderna, HMR rapido, build otimizado |
| UI Library | shadcn/ui + Radix UI | Componentes acessiveis e customizaveis |
| Estilizacao | Tailwind CSS 3 | Utility-first, design system consistente |
| Estado | Redux Toolkit | Estado global previsivel |
| Banco de dados | MySQL 8 | Persistencia relacional |
| Autenticacao | Laravel Sanctum | Token por sessao, sem dependencia externa |
| Pagamentos | Asaas ou Pagar.me | Gateway nacional, suporte a PIX/boleto/cartao + webhooks |
| Jobs | Laravel Scheduler | Reset de ranking semestral, expiracao de planos |
| Infra | VPS Hostinger Ubuntu 22+ | Nginx + PHP-FPM + SSL Let's Encrypt |
| Deploy | GitHub Actions + SSH | CI/CD simples e gratuito |
| Testes | PHPUnit + Vitest | Cobertura backend e frontend |

---

## 5. Diagrama de Estados

### 5.1 Estados do Deal

```
        ●
        │ [criação do deal]
        ▼
  ┌───────────┐
  │  Aberto   │
  └─────┬─────┘
        │ [cliente demonstra interesse]
        ▼
  ┌────────────────┐
  │ Em negociação  │◄──── chat ativo (polling)
  └────────┬───────┘
           │ [aceite]          │ [rejeição]
           ▼                  ▼
  ┌──────────────┐      ┌───────────┐
  │    Aceito    │      │ Rejeitado │ ●
  └──────┬───────┘      └───────────┘
         │ [ordem gerada]
         ▼
  ┌─────────────┐
  │  Concluído  │ ●
  └─────────────┘
```

### 5.2 Estados da Order

```
        ●
        │ [deal aceito → geração automática]
        ▼
  ┌───────────┐
  │ Pendente  │
  └─────┬─────┘
        │ [admin aprova]    │ [admin rejeita]
        ▼                  ▼
  ┌───────────┐      ┌───────────┐
  │ Aprovado  │      │ Rejeitado │ ●
  └─────┬─────┘      └───────────┘
        │ [serviço executado]
        ▼
  ┌─────────────┐
  │  Concluído  │ ──> gera Transação + Comissão
  └─────────────┘ ──> atualiza Ranking
        ●
```

> Todas as mudanças de status em `orders` são registradas na tabela `order_logs` (campo `approved_by` referencia o admin responsável).

### 5.3 Estados da Subscription

```
        ●
        │ [pagamento confirmado via webhook]
        ▼
  ┌──────────┐
  │   Ativa  │◄──────────────────────────────┐
  └─────┬────┘                               │
        │ [upgrade/downgrade]       [renovação]
        ▼                                    │
  ┌───────────┐                             │
  │ Alterando │                             │
  └─────┬─────┘                             │
        │ [confirmado]                       │
        ▼                                   │
  ┌────────────┐                            │
  │ Atualizada │────────────────────────────┘
  └─────┬──────┘
        │ [ends_at expirado — Laravel Scheduler]
        ▼
  ┌──────────┐
  │ Expirada │ ──> `hasActivePlan` bloqueia funcionalidades premium
  └──────────┘
        ●
```

### 5.4 Planos e Limites

| Plano | Interações | Ranking | Acesso |
|---|---|---|---|
| **Gratuito** | Reduzido | Inativo | Básico |
| **Intermediário** | Ampliado | Ativo | Intermediário |
| **Premium** | Total | Prioritário | Completo |

> Escalonamento de funcionalidades por perfil (Empresa/Cliente) a ser confirmado em sprint de detalhamento.

---

## 6. Rotas da API

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/register/empresa` | Cadastro de empresa | Público |
| POST | `/api/auth/register/cliente` | Cadastro de cliente | Público |
| POST | `/api/auth/login` | Login (retorna token Sanctum) | Público |
| POST | `/api/auth/logout` | Logout (invalida token) | Autenticado |
| POST | `/api/auth/forgot-password` | Solicita link de recuperação | Público |
| POST | `/api/auth/reset-password` | Redefine senha via token | Público |

### Perfis

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Perfil do usuário autenticado | `auth` |
| PUT | `/api/users/me` | Atualiza perfil | `auth` |

### Serviços

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/services` | Listagem com filtros (catálogo) | `isCliente` |
| GET | `/api/services/{id}` | Detalhe do serviço | `isCliente` |
| POST | `/api/services` | Cria serviço | `isEmpresa` + `hasActivePlan` |
| PUT | `/api/services/{id}` | Edita serviço | `isEmpresa` |
| DELETE | `/api/services/{id}` | Remove serviço (soft delete) | `isEmpresa` |

### Negociações (Deals)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/deals` | Lista deals do usuário | `auth` |
| POST | `/api/deals` | Cria deal (demonstra interesse) | `isCliente` |
| PATCH | `/api/deals/{id}` | Atualiza status (aceitar/rejeitar) | `auth` |

### Mensagens (Chat)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/deals/{dealId}/messages` | Histórico do chat (polling) | `auth` |
| POST | `/api/deals/{dealId}/messages` | Envia mensagem | `auth` |

### Ordens

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/orders` | Lista ordens | `auth` |
| GET | `/api/orders/{id}` | Detalhe da ordem | `auth` |
| PATCH | `/api/orders/{id}` | Aprova / rejeita ordem | `isAdmin` |

### Assinaturas

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/subscriptions` | Assinatura ativa | `auth` |
| POST | `/api/subscriptions` | Assinar plano | `auth` |
| PATCH | `/api/subscriptions/{id}` | Upgrade / downgrade | `auth` |
| DELETE | `/api/subscriptions/{id}` | Cancelar | `auth` |

### Financeiro

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/finance/transactions` | Transações do usuário | `auth` |
| GET | `/api/finance/export` | Exportação CSV | `auth` |
| GET | `/api/admin/finance` | Visão consolidada | `isAdmin` |

### Ranking

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/ranking` | Ranking do ciclo atual | `isEmpresa` |
| GET | `/api/ranking/history` | Histórico por ciclos | `isEmpresa` |

### Admin

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | Lista usuários | `isAdmin` |
| PATCH | `/api/admin/users/{id}` | Bloquear / qualificar empresa | `isAdmin` |
| GET/POST | `/api/admin/plans` | Gerenciar planos | `isAdmin` |
| GET/POST | `/api/admin/banners` | Gerenciar banners | `isAdmin` |
| POST | `/api/admin/ranking/reset` | Reset manual do ciclo | `isAdmin` |

---

## 7. Rotas do Frontend

| Rota | Componente | Acesso |
|---|---|---|
| `/login` | `AuthLogin` | Público |
| `/register/empresa` | `RegisterEmpresa` | Público |
| `/register/cliente` | `RegisterCliente` | Público |
| `/dashboard` | `Dashboard` (personalizado por tipo) | Autenticado |
| `/services` | `ServiceCatalog` | `isCliente` |
| `/services/:id` | `ServiceDetail` | `isCliente` |
| `/deals` | `DealList` | Autenticado |
| `/chat/:dealId` | `ChatView` | Autenticado |
| `/orders` | `OrderList` | Autenticado |
| `/finance` | `FinanceView` | Autenticado |
| `/ranking` | `RankingView` | `isEmpresa` |
| `/admin` | `AdminPanel` | `isAdmin` |

---

## 8. Fases do Projeto

### MVP — Fase 1 (atual)

| Módulo | Status | Observação |
|---|---|---|
| Autenticação 3 perfis | ✅ | Sanctum + middlewares |
| Catálogo de serviços | ✅ | Filtros + paginação cursor |
| Fluxo de negociação | ✅ | Anonimização nativa |
| Chat por polling | ✅ | Delay aceitável no MVP |
| Ordens operacionais | ✅ | Com log de alterações |
| Controle financeiro | ✅ | CSV, comissão configurável |
| Gamificação básica | ✅ | Score por transações |
| Assinaturas e planos | ✅ | 3 tiers, expiração automática |
| Painel admin | ✅ | KPIs, ordens, banners |
| Deploy VPS + CI/CD | ✅ | GitHub Actions + SSH |

### Fase 2

- Chat em tempo real (Laravel Echo + Pusher free)
- Gamificação avançada: badges e recompensas
- Relatórios em PDF
- Monitoramento via Sentry

### Fase 3

- App mobile (React Native reutilizando a API)
- Possível migração para cloud (escalabilidade)

---

## Observações de Segurança e Conformidade

| Item | Implementação |
|---|---|
| **LGPD** | `deleted_at` (soft delete) em todas as tabelas sensíveis |
| **CSRF** | Proteção nativa do Laravel |
| **Rate Limiting** | Nativo do Laravel |
| **Senhas** | Hash `bcrypt` (padrão Laravel) |
| **Mensagens** | Middleware de sanitização remove dados pessoais |
| **Anonimização** | `anon_handle` gerado no deal, sem biblioteca externa |
| **Pagamentos** | Gateways nacionais (Asaas/Pagar.me) com webhooks seguros |
| **SSL** | Let's Encrypt via Nginx |

---

## Changelog

### v1.1.0 (2024)
- Modernizacao UI com shadcn/ui
- Novo DashboardLayout com sidebar colapsavel
- Tema dark/light com persistencia
- 20+ componentes UI reutilizaveis
- Migracao Dashboard para shadcn/ui
- 112 testes frontend passando
- 54 testes backend passando

### v1.0.0 (2024)
- MVP completo da plataforma
- Autenticacao 3 perfis
- Catalogo de servicos
- Sistema de negociacao anonimizado
- Gestao de ordens
- Painel administrativo

---

*Documento gerado para o MVP da Plataforma de Negocios Condominial.*
*Versao 1.1.0 — UI Modernizada com shadcn/ui*