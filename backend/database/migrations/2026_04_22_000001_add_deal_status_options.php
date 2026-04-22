<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alterar ENUM para incluir novos status
        DB::statement("ALTER TABLE deals MODIFY COLUMN status ENUM('aberto', 'negociando', 'aceito', 'concluido', 'rejeitado', 'cancelado', 'arquivado') DEFAULT 'aberto'");

        // Adicionar coluna cancelled_at
        Schema::table('deals', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        // Reverter ENUM
        DB::statement("ALTER TABLE deals MODIFY COLUMN status ENUM('aberto', 'negociando', 'aceito', 'concluido', 'rejeitado') DEFAULT 'aberto'");

        Schema::table('deals', function (Blueprint $table) {
            $table->dropColumn('cancelled_at');
        });
    }
};
