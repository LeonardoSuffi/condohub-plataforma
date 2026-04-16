<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['ativa', 'alterando', 'expirada', 'cancelada'])->default('ativa');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->integer('interactions_used')->default(0); // Contador de interações no período
            $table->string('payment_method')->nullable();
            $table->string('external_id')->nullable(); // ID do gateway de pagamento
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
