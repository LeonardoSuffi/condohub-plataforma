<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('client_profiles')->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['aberto', 'negociando', 'aceito', 'concluido', 'rejeitado'])->default('aberto');
            $table->string('anon_handle_a', 20); // Handle anônimo da empresa
            $table->string('anon_handle_b', 20); // Handle anônimo do cliente
            $table->text('mensagem_inicial')->nullable(); // Mensagem inicial do cliente
            $table->timestamp('accepted_at')->nullable(); // Quando foi aceito
            $table->timestamp('completed_at')->nullable(); // Quando foi concluído
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status']);
            $table->index(['client_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
