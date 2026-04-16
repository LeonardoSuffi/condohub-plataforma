<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['assinatura', 'comissao', 'servico', 'estorno'])->default('servico');
            $table->decimal('amount', 12, 2); // Valor bruto
            $table->decimal('commission', 12, 2)->default(0); // Comissão da plataforma
            $table->decimal('net_amount', 12, 2); // Valor líquido
            $table->enum('status', ['pendente', 'processando', 'concluida', 'falhou', 'estornada'])->default('pendente');
            $table->string('payment_method')->nullable();
            $table->string('external_id')->nullable(); // ID do gateway
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
