<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('cpf', 14)->nullable();
            $table->string('cnpj', 18)->nullable(); // Para administradoras
            $table->enum('tipo', ['sindico', 'administradora', 'condominio'])->default('sindico');
            $table->string('telefone', 20)->nullable();
            $table->string('nome_condominio')->nullable();
            $table->string('endereco_condominio')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado', 2)->nullable();
            $table->integer('num_unidades')->nullable(); // Número de unidades do condomínio
            $table->json('preferences')->nullable(); // Preferências de notificação, etc.
            $table->timestamps();
            $table->softDeletes(); // LGPD
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_profiles');
    }
};
