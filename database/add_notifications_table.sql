-- =====================================================
-- Script para adicionar tabelas/colunas faltantes
-- Execute este script no MySQL/phpMyAdmin
-- =====================================================

USE condominial_db;

-- =====================================================
-- 1. Criar tabela de notificacoes
-- =====================================================
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
-- 2. Adicionar coluna foto_path em users (se nao existir)
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'condominial_db'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'foto_path'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `users` ADD COLUMN `foto_path` VARCHAR(255) NULL DEFAULT NULL AFTER `type`',
    'SELECT "Coluna foto_path ja existe" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. Criar tabela migrations do Laravel (se nao existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS `migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Resultado
-- =====================================================
SELECT 'Script executado com sucesso!' AS resultado;
SELECT COUNT(*) AS total_notifications FROM notifications;
