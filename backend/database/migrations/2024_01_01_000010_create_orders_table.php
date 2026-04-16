<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained()->onDelete('cascade');
            $table->decimal('value', 12, 2); // Valor do serviço
            $table->enum('status', ['pendente', 'aprovado', 'concluido', 'rejeitado'])->default('pendente');
            $table->foreignId('approved_by')->nullable()->constrained('users'); // Admin que aprovou
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable(); // Observações do admin
            $table->text('rejection_reason')->nullable(); // Motivo da rejeição
            $table->timestamps();

            $table->index('status');
            $table->index(['deal_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
