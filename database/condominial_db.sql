-- =====================================================
-- Plataforma de Negocios Condominial - Database Schema
-- MySQL 8.0+ | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Versao 1.0 - MVP (Fase 1)
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS condominial_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE condominial_db;

-- =====================================================
-- TABELAS BASE
-- =====================================================

-- -----------------------------------------------------
-- Tabela: users
-- Usuarios com 3 tipos: empresa, cliente, admin
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `type` ENUM('empresa', 'cliente', 'admin') NOT NULL DEFAULT 'cliente',
    `foto_path` VARCHAR(255) NULL DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `remember_token` VARCHAR(100) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: company_profiles
-- Perfil de empresas prestadoras de servico
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `company_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `razao_social` VARCHAR(255) NOT NULL,
    `nome_fantasia` VARCHAR(255) NULL DEFAULT NULL,
    `segmento` VARCHAR(100) NULL DEFAULT NULL,
    `telefone` VARCHAR(20) NULL DEFAULT NULL,
    `endereco` VARCHAR(255) NULL DEFAULT NULL,
    `cidade` VARCHAR(100) NULL DEFAULT NULL,
    `estado` VARCHAR(2) NULL DEFAULT NULL,
    `cep` VARCHAR(10) NULL DEFAULT NULL,
    `descricao` TEXT NULL DEFAULT NULL,
    `logo_path` VARCHAR(255) NULL DEFAULT NULL,
    `verified` TINYINT(1) NOT NULL DEFAULT 0,
    `verified_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `company_profiles_cnpj_unique` (`cnpj`),
    INDEX `company_profiles_user_id_index` (`user_id`),
    CONSTRAINT `company_profiles_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: client_profiles
-- Perfil de clientes (sindico, administradora, condominio)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `cpf` VARCHAR(14) NULL DEFAULT NULL,
    `cnpj` VARCHAR(18) NULL DEFAULT NULL,
    `tipo` ENUM('sindico', 'administradora', 'condominio') NOT NULL DEFAULT 'sindico',
    `nome_condominio` VARCHAR(255) NULL DEFAULT NULL,
    `telefone` VARCHAR(20) NULL DEFAULT NULL,
    `endereco` VARCHAR(255) NULL DEFAULT NULL,
    `cidade` VARCHAR(100) NULL DEFAULT NULL,
    `estado` VARCHAR(2) NULL DEFAULT NULL,
    `cep` VARCHAR(10) NULL DEFAULT NULL,
    `preferences` JSON NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `client_profiles_user_id_index` (`user_id`),
    CONSTRAINT `client_profiles_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CATALOGO DE SERVICOS
-- =====================================================

-- -----------------------------------------------------
-- Tabela: categories
-- Categorias com suporte a subcategorias (self-referencing)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `icon` VARCHAR(50) NULL DEFAULT NULL,
    `order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `categories_slug_unique` (`slug`),
    INDEX `categories_parent_id_index` (`parent_id`),
    CONSTRAINT `categories_parent_id_foreign`
        FOREIGN KEY (`parent_id`)
        REFERENCES `categories` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: services
-- Servicos oferecidos pelas empresas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `region` VARCHAR(100) NULL DEFAULT NULL,
    `price_range` VARCHAR(50) NULL DEFAULT NULL,
    `price_min` DECIMAL(10,2) NULL DEFAULT NULL,
    `price_max` DECIMAL(10,2) NULL DEFAULT NULL,
    `status` ENUM('ativo', 'inativo', 'pendente') NOT NULL DEFAULT 'pendente',
    `featured` TINYINT(1) NOT NULL DEFAULT 0,
    `tags` JSON NULL DEFAULT NULL,
    `views` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `services_company_id_index` (`company_id`),
    INDEX `services_category_id_index` (`category_id`),
    INDEX `services_status_index` (`status`),
    INDEX `services_featured_index` (`featured`),
    INDEX `services_region_index` (`region`),
    CONSTRAINT `services_company_id_foreign`
        FOREIGN KEY (`company_id`)
        REFERENCES `company_profiles` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `services_category_id_foreign`
        FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PLANOS E ASSINATURAS
-- =====================================================

-- -----------------------------------------------------
-- Tabela: plans
-- Planos de assinatura (3 tiers)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `billing_cycle` ENUM('mensal', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensal',
    `features` JSON NULL DEFAULT NULL,
    `max_interactions` INT NOT NULL DEFAULT 10,
    `max_services` INT NOT NULL DEFAULT 5,
    `ranking_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `featured_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `priority` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `plans_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: subscriptions
-- Assinaturas dos usuarios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('ativa', 'cancelada', 'expirada', 'pendente') NOT NULL DEFAULT 'pendente',
    `starts_at` TIMESTAMP NOT NULL,
    `ends_at` TIMESTAMP NOT NULL,
    `canceled_at` TIMESTAMP NULL DEFAULT NULL,
    `payment_method` VARCHAR(50) NULL DEFAULT NULL,
    `payment_reference` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `subscriptions_user_id_index` (`user_id`),
    INDEX `subscriptions_plan_id_index` (`plan_id`),
    INDEX `subscriptions_status_index` (`status`),
    INDEX `subscriptions_ends_at_index` (`ends_at`),
    CONSTRAINT `subscriptions_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `subscriptions_plan_id_foreign`
        FOREIGN KEY (`plan_id`)
        REFERENCES `plans` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NEGOCIACOES E CHAT
-- =====================================================

-- -----------------------------------------------------
-- Tabela: deals
-- Negociacoes entre empresa e cliente (anonimizado)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `deals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `client_id` BIGINT UNSIGNED NOT NULL,
    `service_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('aberto', 'em_negociacao', 'aceito', 'rejeitado', 'concluido') NOT NULL DEFAULT 'aberto',
    `anon_handle_a` VARCHAR(20) NOT NULL COMMENT 'Handle anonimo da empresa',
    `anon_handle_b` VARCHAR(20) NOT NULL COMMENT 'Handle anonimo do cliente',
    `notes` TEXT NULL DEFAULT NULL,
    `accepted_at` TIMESTAMP NULL DEFAULT NULL,
    `rejected_at` TIMESTAMP NULL DEFAULT NULL,
    `rejection_reason` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `deals_company_id_index` (`company_id`),
    INDEX `deals_client_id_index` (`client_id`),
    INDEX `deals_service_id_index` (`service_id`),
    INDEX `deals_status_index` (`status`),
    CONSTRAINT `deals_company_id_foreign`
        FOREIGN KEY (`company_id`)
        REFERENCES `company_profiles` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `deals_client_id_foreign`
        FOREIGN KEY (`client_id`)
        REFERENCES `client_profiles` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `deals_service_id_foreign`
        FOREIGN KEY (`service_id`)
        REFERENCES `services` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: messages
-- Mensagens do chat (com sanitizacao)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deal_id` BIGINT UNSIGNED NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `content_sanitized` TEXT NULL DEFAULT NULL COMMENT 'Conteudo com dados pessoais removidos',
    `read_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `messages_deal_id_index` (`deal_id`),
    INDEX `messages_sender_id_index` (`sender_id`),
    CONSTRAINT `messages_deal_id_foreign`
        FOREIGN KEY (`deal_id`)
        REFERENCES `deals` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `messages_sender_id_foreign`
        FOREIGN KEY (`sender_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ORDENS E FINANCEIRO
-- =====================================================

-- -----------------------------------------------------
-- Tabela: orders
-- Ordens operacionais (geradas apos aceite do deal)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deal_id` BIGINT UNSIGNED NOT NULL,
    `value` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pendente', 'aprovado', 'rejeitado', 'concluido') NOT NULL DEFAULT 'pendente',
    `approved_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `approved_at` TIMESTAMP NULL DEFAULT NULL,
    `rejected_at` TIMESTAMP NULL DEFAULT NULL,
    `rejection_reason` TEXT NULL DEFAULT NULL,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    `notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `orders_deal_id_index` (`deal_id`),
    INDEX `orders_status_index` (`status`),
    INDEX `orders_approved_by_index` (`approved_by`),
    CONSTRAINT `orders_deal_id_foreign`
        FOREIGN KEY (`deal_id`)
        REFERENCES `deals` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `orders_approved_by_foreign`
        FOREIGN KEY (`approved_by`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: order_logs
-- Historico de mudancas de status das ordens
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `old_status` VARCHAR(50) NULL DEFAULT NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `order_logs_order_id_index` (`order_id`),
    INDEX `order_logs_user_id_index` (`user_id`),
    CONSTRAINT `order_logs_order_id_foreign`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `order_logs_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: transactions
-- Transacoes financeiras (comissoes, pagamentos)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `type` ENUM('credito', 'debito', 'comissao', 'assinatura', 'estorno') NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `commission` DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Comissao da plataforma (10%)',
    `description` VARCHAR(255) NULL DEFAULT NULL,
    `reference` VARCHAR(255) NULL DEFAULT NULL,
    `status` ENUM('pendente', 'confirmado', 'cancelado') NOT NULL DEFAULT 'pendente',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `transactions_user_id_index` (`user_id`),
    INDEX `transactions_order_id_index` (`order_id`),
    INDEX `transactions_type_index` (`type`),
    INDEX `transactions_status_index` (`status`),
    CONSTRAINT `transactions_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `transactions_order_id_foreign`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- GAMIFICACAO E RANKING
-- =====================================================

-- -----------------------------------------------------
-- Tabela: rankings
-- Score das empresas por ciclo semestral
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rankings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `score` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `deals_completed` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_value` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `cycle` VARCHAR(10) NOT NULL COMMENT 'Formato: 2024-S1, 2024-S2',
    `position` INT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `rankings_user_id_index` (`user_id`),
    INDEX `rankings_cycle_index` (`cycle`),
    INDEX `rankings_score_index` (`score` DESC),
    UNIQUE INDEX `rankings_user_cycle_unique` (`user_id`, `cycle`),
    CONSTRAINT `rankings_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ADMINISTRACAO
-- =====================================================

-- -----------------------------------------------------
-- Tabela: banners
-- Banners promocionais da plataforma
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `link` VARCHAR(500) NULL DEFAULT NULL,
    `position` ENUM('topo', 'lateral', 'rodape', 'modal') NOT NULL DEFAULT 'topo',
    `type` ENUM('comercial', 'admin', 'promocional') NOT NULL DEFAULT 'comercial',
    `order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `starts_at` TIMESTAMP NULL DEFAULT NULL,
    `ends_at` TIMESTAMP NULL DEFAULT NULL,
    `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
    `views` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `banners_position_index` (`position`),
    INDEX `banners_active_index` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICACOES
-- =====================================================

-- -----------------------------------------------------
-- Tabela: notifications
-- Notificacoes do sistema para os usuarios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(100) NOT NULL COMMENT 'deal_new, deal_status, message, order_status, subscription, system',
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL DEFAULT NULL COMMENT 'Dados adicionais como deal_id, order_id, etc.',
    `read_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `notifications_user_id_read_at_index` (`user_id`, `read_at`),
    INDEX `notifications_created_at_index` (`created_at`),
    CONSTRAINT `notifications_user_id_foreign`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LARAVEL SANCTUM (Autenticacao por Token)
-- =====================================================

-- -----------------------------------------------------
-- Tabela: personal_access_tokens
-- Tokens de autenticacao do Laravel Sanctum
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL DEFAULT NULL,
    `last_used_at` TIMESTAMP NULL DEFAULT NULL,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `personal_access_tokens_token_unique` (`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LARAVEL (Tabelas auxiliares)
-- =====================================================

-- -----------------------------------------------------
-- Tabela: password_reset_tokens
-- Tokens de recuperacao de senha
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: failed_jobs
-- Jobs falhos do Laravel Queue
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: cache
-- Cache do Laravel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cache` (
    `key` VARCHAR(255) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `expiration` INT NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: cache_locks
-- Locks do cache
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cache_locks` (
    `key` VARCHAR(255) NOT NULL,
    `owner` VARCHAR(255) NOT NULL,
    `expiration` INT NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: sessions
-- Sessoes do Laravel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `sessions_user_id_index` (`user_id`),
    INDEX `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: migrations
-- Controle de migrations do Laravel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir usuario administrador padrao
-- Senha: Admin@123 (hash bcrypt)
INSERT INTO `users` (`name`, `email`, `password`, `type`, `active`, `email_verified_at`, `created_at`, `updated_at`) VALUES
('Administrador', 'admin@condominial.com', '$2y$12$8K8nJZ8L8K8nJZ8L8K8nJu8K8nJZ8L8K8nJZ8L8K8nJZ8L8K8nJZ8L', 'admin', 1, NOW(), NOW(), NOW());

-- Inserir planos padrao (3 tiers)
INSERT INTO `plans` (`name`, `slug`, `description`, `price`, `billing_cycle`, `features`, `max_interactions`, `max_services`, `ranking_enabled`, `featured_enabled`, `priority`, `active`, `created_at`, `updated_at`) VALUES
('Gratuito', 'gratuito', 'Plano basico para comecar', 0.00, 'mensal', '["Ate 5 servicos", "10 interacoes/mes", "Suporte por email"]', 10, 5, 0, 0, 0, 1, NOW(), NOW()),
('Intermediario', 'intermediario', 'Plano para empresas em crescimento', 99.90, 'mensal', '["Ate 20 servicos", "50 interacoes/mes", "Ranking habilitado", "Suporte prioritario"]', 50, 20, 1, 0, 1, 1, NOW(), NOW()),
('Premium', 'premium', 'Plano completo para grandes empresas', 199.90, 'mensal', '["Servicos ilimitados", "Interacoes ilimitadas", "Ranking prioritario", "Destaque no catalogo", "Suporte VIP"]', 999, 999, 1, 1, 2, 1, NOW(), NOW());

-- Inserir categorias principais
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `order`, `active`, `created_at`, `updated_at`) VALUES
('Manutencao Predial', 'manutencao-predial', 'Servicos de manutencao geral do condominio', 'tools', 1, 1, NOW(), NOW()),
('Limpeza', 'limpeza', 'Servicos de limpeza e conservacao', 'broom', 2, 1, NOW(), NOW()),
('Seguranca', 'seguranca', 'Servicos de seguranca e vigilancia', 'shield', 3, 1, NOW(), NOW()),
('Jardinagem', 'jardinagem', 'Servicos de paisagismo e jardinagem', 'leaf', 4, 1, NOW(), NOW()),
('Administracao', 'administracao', 'Servicos administrativos e contabeis', 'briefcase', 5, 1, NOW(), NOW()),
('Tecnologia', 'tecnologia', 'Servicos de TI e automacao', 'cpu', 6, 1, NOW(), NOW());

-- Inserir subcategorias
INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `order`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Eletrica', 'eletrica', 'Instalacoes e manutencao eletrica', 1, 1, NOW(), NOW()),
(1, 'Hidraulica', 'hidraulica', 'Servicos de encanamento e hidraulica', 2, 1, NOW(), NOW()),
(1, 'Pintura', 'pintura', 'Servicos de pintura interna e externa', 3, 1, NOW(), NOW()),
(1, 'Elevadores', 'elevadores', 'Manutencao de elevadores', 4, 1, NOW(), NOW()),
(2, 'Limpeza de Vidros', 'limpeza-vidros', 'Limpeza de fachadas e vidros', 1, 1, NOW(), NOW()),
(2, 'Limpeza de Caixa Dagua', 'limpeza-caixa-dagua', 'Higienizacao de reservatorios', 2, 1, NOW(), NOW()),
(3, 'Portaria', 'portaria', 'Servicos de portaria 24h', 1, 1, NOW(), NOW()),
(3, 'CFTV', 'cftv', 'Cameras e monitoramento', 2, 1, NOW(), NOW()),
(3, 'Controle de Acesso', 'controle-acesso', 'Sistemas de controle de acesso', 3, 1, NOW(), NOW()),
(6, 'Interfonia', 'interfonia', 'Sistemas de interfone e comunicacao', 1, 1, NOW(), NOW()),
(6, 'Internet Condominial', 'internet-condominial', 'Redes e internet para condominios', 2, 1, NOW(), NOW());

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
