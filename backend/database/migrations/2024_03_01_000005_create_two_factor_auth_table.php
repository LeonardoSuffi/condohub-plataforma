<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('two_factor_auth', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('secret')->nullable(); // Chave secreta TOTP
            $table->boolean('enabled')->default(false);
            $table->json('backup_codes')->nullable(); // Codigos de recuperacao
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });

        // Adicionar coluna na tabela users
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('two_factor_enabled')->default(false)->after('is_blocked');
            $table->timestamp('gdpr_consent_at')->nullable()->after('two_factor_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['two_factor_enabled', 'gdpr_consent_at']);
        });

        Schema::dropIfExists('two_factor_auth');
    }
};
