<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Indexes para otimizacao de performance com 10k+ empresas
     */
    public function up(): void
    {
        // Indexes para company_profiles
        $this->safeAddIndex('company_profiles', 'cidade', 'idx_company_cidade');
        $this->safeAddIndex('company_profiles', 'estado', 'idx_company_estado');
        $this->safeAddIndex('company_profiles', ['cidade', 'estado'], 'idx_company_location');
        $this->safeAddIndex('company_profiles', 'created_at', 'idx_company_created');
        $this->safeAddIndex('company_profiles', 'verified', 'idx_company_verified');
        $this->safeAddIndex('company_profiles', 'segmento', 'idx_company_segmento');
        $this->safeAddIndex('company_profiles', 'user_id', 'idx_company_user');

        // Indexes para services
        $this->safeAddIndex('services', 'company_id', 'idx_service_company');
        $this->safeAddIndex('services', 'category_id', 'idx_service_category');
        $this->safeAddIndex('services', ['company_id', 'category_id'], 'idx_service_company_category');
        $this->safeAddIndex('services', ['status', 'created_at'], 'idx_service_status_date');
        $this->safeAddIndex('services', 'status', 'idx_service_status');

        // Indexes para categories
        $this->safeAddIndex('categories', 'parent_id', 'idx_category_parent');

        // Indexes para deals
        $this->safeAddIndex('deals', 'client_id', 'idx_deal_client');
        $this->safeAddIndex('deals', 'company_id', 'idx_deal_company');
        $this->safeAddIndex('deals', 'service_id', 'idx_deal_service');
        $this->safeAddIndex('deals', 'status', 'idx_deal_status');
        $this->safeAddIndex('deals', ['client_id', 'status'], 'idx_deal_client_status');
        $this->safeAddIndex('deals', ['company_id', 'status'], 'idx_deal_company_status');
        $this->safeAddIndex('deals', 'updated_at', 'idx_deal_updated');

        // Indexes para users
        $this->safeAddIndex('users', 'type', 'idx_user_type');
        $this->safeAddIndex('users', 'active', 'idx_user_active');
        $this->safeAddIndex('users', ['type', 'active'], 'idx_user_type_active');

        // Indexes para client_profiles (se existir)
        if (Schema::hasTable('client_profiles')) {
            $this->safeAddIndex('client_profiles', 'cidade', 'idx_client_cidade');
            $this->safeAddIndex('client_profiles', 'user_id', 'idx_client_user');
        }

        // Indexes para messages (se existir)
        if (Schema::hasTable('messages')) {
            $this->safeAddIndex('messages', 'deal_id', 'idx_message_deal');
            $this->safeAddIndex('messages', ['deal_id', 'created_at'], 'idx_message_deal_date');
        }

        // Indexes para reviews (se existir)
        if (Schema::hasTable('reviews')) {
            $this->safeAddIndex('reviews', 'company_id', 'idx_review_company');
            $this->safeAddIndex('reviews', 'client_id', 'idx_review_client');
            $this->safeAddIndex('reviews', ['company_id', 'status'], 'idx_review_company_status');
        }
    }

    /**
     * Adiciona index de forma segura (verifica se coluna e index existem)
     */
    private function safeAddIndex(string $table, $columns, string $indexName): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        // Verifica se index já existe
        if ($this->indexExists($table, $indexName)) {
            return;
        }

        // Verifica se todas as colunas existem
        $columns = is_array($columns) ? $columns : [$columns];
        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                return;
            }
        }

        // Cria o index
        Schema::table($table, function (Blueprint $tbl) use ($columns, $indexName) {
            $tbl->index($columns, $indexName);
        });
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $indexName): bool
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
            return count($indexes) > 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $indexes = [
            'company_profiles' => ['idx_company_cidade', 'idx_company_estado', 'idx_company_location', 'idx_company_created', 'idx_company_verified', 'idx_company_segmento', 'idx_company_user'],
            'services' => ['idx_service_company', 'idx_service_category', 'idx_service_company_category', 'idx_service_status_date', 'idx_service_status'],
            'categories' => ['idx_category_parent'],
            'deals' => ['idx_deal_client', 'idx_deal_company', 'idx_deal_service', 'idx_deal_status', 'idx_deal_client_status', 'idx_deal_company_status', 'idx_deal_updated'],
            'users' => ['idx_user_type', 'idx_user_active', 'idx_user_type_active'],
            'client_profiles' => ['idx_client_cidade', 'idx_client_user'],
            'messages' => ['idx_message_deal', 'idx_message_deal_date'],
            'reviews' => ['idx_review_company', 'idx_review_client', 'idx_review_company_status'],
        ];

        foreach ($indexes as $table => $tableIndexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $tbl) use ($table, $tableIndexes) {
                foreach ($tableIndexes as $indexName) {
                    if ($this->indexExists($table, $indexName)) {
                        $tbl->dropIndex($indexName);
                    }
                }
            });
        }
    }
};
