<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // gratuito, intermediario, premium
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_cycle', ['mensal', 'trimestral', 'semestral', 'anual'])->default('mensal');
            $table->json('features'); // Lista de funcionalidades
            $table->integer('max_interactions')->default(10); // Máximo de interações/mês
            $table->integer('max_services')->default(5); // Máximo de serviços cadastrados
            $table->boolean('ranking_enabled')->default(false);
            $table->boolean('featured_enabled')->default(false); // Pode ter serviços em destaque
            $table->integer('priority')->default(0); // Prioridade no sistema
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
