<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('score', 10, 2)->default(0);
            $table->string('cycle', 10); // Ex: 2025-S1, 2025-S2
            $table->integer('deals_completed')->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->integer('position')->nullable(); // Posição no ranking
            $table->json('breakdown')->nullable(); // Detalhamento dos pontos
            $table->timestamps();

            $table->unique(['user_id', 'cycle']);
            $table->index(['cycle', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rankings');
    }
};
