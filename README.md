# ServicePro

**Marketplace de Servicos B2B**

Plataforma que conecta clientes a empresas prestadoras de servicos, com sistema de negociacao anonima, avaliacoes, ranking e relatorios.

---

## Indice

- [Visao Geral](#visao-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalacao](#instalacao)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Reference](#api-reference)
- [Usuarios de Teste](#usuarios-de-teste)

---

## Visao Geral

O ServicePro e uma plataforma completa para contratacao de servicos com foco em transparencia e confianca. Principais diferenciais:

- **Negociacao Anonima**: Clientes e empresas negociam sem revelar identidades ate o aceite
- **Sistema de Avaliacoes**: Clientes avaliam empresas apos conclusao do servico
- **Ranking de Empresas**: Empresas competem por posicao baseado em desempenho
- **Relatorios com Graficos**: Dashboard analitico para empresas com metricas visuais
- **Chat Integrado**: Comunicacao em tempo real entre cliente e empresa

### Tipos de Usuario

| Tipo | Descricao | Acesso |
|------|-----------|--------|
| **Cliente** | Busca e contrata servicos | Dashboard, Negociacoes, Lista de Empresas |
| **Empresa** | Oferece servicos na plataforma | Dashboard, Meus Servicos, Negociacoes, Relatorios, Ranking, Financeiro |
| **Admin** | Administra a plataforma | Painel Admin, Usuarios, Categorias, Planos, Banners, Financeiro |

---

## Funcionalidades

### Autenticacao

- Registro separado para Cliente e Empresa
- Login com JWT via Laravel Sanctum
- Recuperacao de senha por email
- Autenticacao de dois fatores (2FA) opcional
- Controle de sessoes ativas

### Catalogo de Servicos

- Busca com filtros por categoria e regiao
- Categorias hierarquicas (pais/filhas)
- Galeria de imagens por servico
- Faixa de preco configuravel
- Servicos em destaque

### Sistema de Negociacao

Fluxo de uma negociacao:

```
1. Cliente inicia interesse em servico
2. Sistema gera handles anonimos (ex: "Empresa #A7F2")
3. Chat anonimizado entre as partes
4. Empresa aceita ou rejeita
5. Apos aceite: dados reais liberados
6. Cliente finaliza e avalia
```

**Status possiveis:**
```
aberto -> negociando -> aceito -> concluido
                    \-> rejeitado
```

### Chat em Tempo Real

- Widget flutuante acessivel em todas as paginas
- Polling automatico para novas mensagens
- Lista de conversas com busca
- Indicador de status da negociacao

### Sistema de Avaliacoes

- Avaliacao de 1 a 5 estrelas
- Comentario opcional (ate 2000 caracteres)
- Resposta da empresa a avaliacao
- Badge de "Avaliacao Verificada" para deals concluidos
- Exibicao no perfil publico da empresa

### Relatorios e Metricas (Empresas)

Dashboard com graficos usando Recharts:

- **KPIs**: Total de negociacoes, taxa de conversao, media de avaliacoes
- **Grafico de Linha**: Negociacoes ao longo do tempo
- **Grafico de Pizza**: Distribuicao de status das negociacoes
- **Grafico de Barras**: Servicos mais solicitados
- **Filtro por Periodo**: 7 dias, 30 dias, 90 dias, 1 ano

### Ranking

- Score baseado em negociacoes concluidas
- Ciclo semestral com reset automatico
- Posicao visivel para empresas
- Historico de ciclos anteriores

### Planos e Assinaturas

| Plano | Preco | Interacoes | Recursos |
|-------|-------|------------|----------|
| Gratuito | R$ 0 | 10/mes | Acesso basico |
| Intermediario | R$ 99/mes | 50/mes | Ranking ativo |
| Premium | R$ 199/mes | Ilimitado | Destaque + todos recursos |

### Painel Administrativo

- Dashboard com KPIs da plataforma
- Gestao de usuarios (CRUD, bloqueio, verificacao)
- Gestao de categorias hierarquicas
- Configuracao de planos e precos
- Banners promocionais
- Visao financeira geral

### Notificacoes

- Badge contador no header
- Dropdown com ultimas notificacoes
- Marcar como lida individual ou todas
- Tipos: nova negociacao, mensagem, sistema

---

## Tecnologias

### Backend

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| PHP | 8.2+ | Runtime |
| Laravel | 11.x | Framework |
| Laravel Sanctum | 4.x | Autenticacao API |
| MySQL | 8.0+ | Banco de dados |
| PHPUnit | 11.x | Testes |

### Frontend

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| React | 18.x | UI Library |
| Vite | 5.x | Build Tool |
| Redux Toolkit | 2.x | Estado Global |
| React Router | 6.x | Roteamento |
| Tailwind CSS | 3.x | Estilizacao |
| Recharts | 3.x | Graficos |
| Radix UI | Latest | Componentes Acessiveis |
| Lucide React | Latest | Icones |
| Axios | 1.x | HTTP Client |
| React Hot Toast | 2.x | Notificacoes |

### Testes

| Tecnologia | Uso |
|------------|-----|
| Vitest | Testes unitarios frontend |
| Testing Library | Testes de componentes |
| Playwright | Testes E2E |
| MSW | Mock de API |
| PHPUnit | Testes backend |

---

## Instalacao

### Pre-requisitos

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+
- XAMPP (opcional, para ambiente local)

### Backend

```bash
cd backend

# Instalar dependencias
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Configurar banco no .env
# DB_DATABASE=servicepro_db
# DB_USERNAME=root
# DB_PASSWORD=

# Criar banco e executar migrations
php artisan migrate

# Popular com dados de teste
php artisan db:seed

# Iniciar servidor
php artisan serve --port=8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar ambiente
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api
# VITE_STORAGE_URL=http://localhost:8000/storage

# Iniciar desenvolvimento
npm run dev

# Build producao
npm run build
```

---

## Estrutura do Projeto

```
Sistema-condominios/
├── backend/                          # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/          # 24 Controllers
│   │   │   │   ├── AuthController    # Autenticacao
│   │   │   │   ├── DealController    # Negociacoes
│   │   │   │   ├── ServiceController # Servicos
│   │   │   │   ├── ReviewController  # Avaliacoes
│   │   │   │   ├── MetricsController # Relatorios
│   │   │   │   └── Admin/            # Painel Admin
│   │   │   └── Middleware/           # Auth, Roles
│   │   ├── Models/                   # Eloquent Models
│   │   └── Services/                 # Logica de negocio
│   ├── database/
│   │   ├── migrations/               # Schema (29 migrations)
│   │   └── seeders/                  # Dados de teste
│   └── routes/
│       └── api.php                   # 100+ endpoints
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/                 # ChatWidget, ChatModal
│   │   │   ├── layout/               # Headers, Layouts
│   │   │   ├── reviews/              # StarRating, ReviewModal
│   │   │   └── ui/                   # Componentes Radix
│   │   ├── contexts/                 # ChatContext
│   │   ├── layouts/                  # SiteLayout
│   │   ├── pages/
│   │   │   ├── admin/                # AdminPanel, Users, Plans...
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── deals/                # DealList, ChatView
│   │   │   ├── finance/              # FinanceView
│   │   │   ├── reports/              # ReportsView (graficos)
│   │   │   ├── services/             # MyServices
│   │   │   └── public/               # CompanyList
│   │   ├── store/
│   │   │   └── slices/               # Redux: auth, deals, reviews...
│   │   ├── services/                 # api.js (Axios)
│   │   └── lib/                      # Utils, config
│   └── tests/                        # Vitest + Playwright
│
└── README.md
```

### Principais Models

| Model | Descricao |
|-------|-----------|
| User | Usuarios (cliente, empresa, admin) |
| CompanyProfile | Perfil da empresa |
| ClientProfile | Perfil do cliente |
| Service | Servicos oferecidos |
| Category | Categorias hierarquicas |
| Deal | Negociacoes |
| Message | Mensagens do chat |
| Review | Avaliacoes |
| Plan | Planos de assinatura |
| Subscription | Assinaturas ativas |
| Ranking | Score por ciclo |
| Notification | Notificacoes |
| Transaction | Transacoes financeiras |
| Banner | Banners promocionais |

---

## API Reference

### Autenticacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/auth/register/cliente | Registro cliente |
| POST | /api/auth/register/empresa | Registro empresa |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/forgot-password | Solicitar reset |
| POST | /api/auth/reset-password | Redefinir senha |
| GET | /api/auth/session | Info da sessao |

### Usuario

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/users/me | Dados do usuario |
| PUT | /api/users/me | Atualizar perfil |
| POST | /api/users/me/foto | Upload foto |
| POST | /api/users/me/cover | Upload capa |

### Servicos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/services | Listar servicos |
| POST | /api/services | Criar servico |
| GET | /api/services/:id | Detalhe |
| PUT | /api/services/:id | Atualizar |
| DELETE | /api/services/:id | Remover |
| GET | /api/my-services | Meus servicos |

### Negociacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/deals | Listar negociacoes |
| POST | /api/deals | Iniciar negociacao |
| GET | /api/deals/:id | Detalhe |
| PATCH | /api/deals/:id | Atualizar status |
| GET | /api/deals/:id/messages | Listar mensagens |
| POST | /api/deals/:id/messages | Enviar mensagem |

### Avaliacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/reviews | Criar avaliacao |
| GET | /api/reviews/received | Avaliacoes recebidas (empresa) |
| GET | /api/reviews/given | Avaliacoes dadas (cliente) |
| POST | /api/reviews/:id/respond | Responder avaliacao |

### Metricas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/metrics/dashboard | KPIs da empresa |
| GET | /api/metrics/charts | Dados para graficos |
| GET | /api/metrics/client | Metricas do cliente |

### Notificacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/notifications | Listar |
| GET | /api/notifications/unread-count | Contador |
| PATCH | /api/notifications/:id/read | Marcar lida |
| POST | /api/notifications/mark-all-read | Marcar todas |

### Rotas Publicas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/public/categories | Categorias |
| GET | /api/public/companies | Empresas |
| GET | /api/public/companies/:id | Detalhe empresa |
| GET | /api/public/companies/:id/reviews | Avaliacoes |
| GET | /api/public/services | Servicos |
| GET | /api/public/banners | Banners ativos |

### Admin

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/admin/users | Listar usuarios |
| POST | /api/admin/users | Criar usuario |
| PATCH | /api/admin/users/:id | Atualizar |
| DELETE | /api/admin/users/:id | Remover |
| GET | /api/admin/categories | Categorias |
| POST | /api/admin/categories | Criar categoria |
| GET | /api/admin/plans | Planos |
| GET | /api/admin/banners | Banners |
| GET | /api/admin/finance | Visao financeira |

---

## Usuarios de Teste

Apos executar `php artisan db:seed`:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@servicepro.com.br | admin123 |
| Empresa | empresa@teste.com | teste123 |
| Cliente | cliente@teste.com | teste123 |

---

## Scripts

### Backend

```bash
# Migrations
php artisan migrate              # Executar
php artisan migrate:fresh --seed # Reset com seed

# Cache
php artisan config:cache         # Cache config
php artisan route:cache          # Cache rotas
php artisan optimize             # Otimizar

# Testes
php artisan test                 # Rodar testes
```

### Frontend

```bash
# Desenvolvimento
npm run dev                      # Servidor dev

# Build
npm run build                    # Producao
npm run preview                  # Preview build

# Testes
npm run test                     # Vitest
npm run test:coverage            # Com coverage
npm run test:e2e                 # Playwright
```

---

## Licenca

Projeto proprietario. Todos os direitos reservados.

---

*ServicePro - Conectando clientes aos melhores prestadores de servico*
