<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('region'); // Região de atuação
            $table->string('price_range'); // Faixa de preço: "500-1000", "1000-5000", etc.
            $table->enum('status', ['ativo', 'inativo'])->default('ativo');
            $table->boolean('featured')->default(false); // Destaque no catálogo
            $table->json('tags')->nullable(); // Tags para busca
            $table->json('images')->nullable(); // Array de paths de imagens
            $table->integer('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'category_id']);
            $table->index(['region', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
