<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('client_profiles')->onDelete('cascade');
            $table->foreignId('deal_id')->nullable()->constrained('deals')->onDelete('set null');
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->text('comment')->nullable();
            $table->text('response')->nullable(); // Resposta da empresa
            $table->timestamp('responded_at')->nullable();
            $table->boolean('is_verified')->default(false); // Se veio de um deal concluido
            $table->enum('status', ['pending', 'approved', 'rejected', 'hidden'])->default('approved');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status']);
            $table->index(['client_id']);
            $table->index(['deal_id']);
            $table->index(['company_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
