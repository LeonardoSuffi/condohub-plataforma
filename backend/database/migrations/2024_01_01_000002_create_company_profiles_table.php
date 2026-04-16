<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('cnpj', 18)->unique();
            $table->string('razao_social');
            $table->string('nome_fantasia')->nullable();
            $table->string('segmento');
            $table->string('telefone', 20)->nullable();
            $table->string('endereco')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado', 2)->nullable();
            $table->string('cep', 10)->nullable();
            $table->text('descricao')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('verified')->default(false); // Empresa verificada pelo admin
            $table->timestamps();
            $table->softDeletes(); // LGPD
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
