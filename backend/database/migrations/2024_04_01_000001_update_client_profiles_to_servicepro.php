<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update enum values from condominio types to generic service types
        DB::statement("ALTER TABLE client_profiles MODIFY COLUMN tipo ENUM('pessoa_fisica', 'empresa', 'autonomo', 'sindico', 'administradora', 'condominio') DEFAULT 'pessoa_fisica'");

        // Migrate existing data
        DB::table('client_profiles')->where('tipo', 'sindico')->update(['tipo' => 'pessoa_fisica']);
        DB::table('client_profiles')->where('tipo', 'administradora')->update(['tipo' => 'empresa']);
        DB::table('client_profiles')->where('tipo', 'condominio')->update(['tipo' => 'empresa']);

        // Remove old enum values
        DB::statement("ALTER TABLE client_profiles MODIFY COLUMN tipo ENUM('pessoa_fisica', 'empresa', 'autonomo') DEFAULT 'pessoa_fisica'");

        // Rename columns
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->renameColumn('nome_condominio', 'nome_organizacao');
            $table->renameColumn('endereco_condominio', 'endereco_organizacao');
            $table->renameColumn('num_unidades', 'num_funcionarios');
        });
    }

    public function down(): void
    {
        // Restore enum with old values
        DB::statement("ALTER TABLE client_profiles MODIFY COLUMN tipo ENUM('pessoa_fisica', 'empresa', 'autonomo', 'sindico', 'administradora', 'condominio') DEFAULT 'pessoa_fisica'");

        // Migrate data back
        DB::table('client_profiles')->where('tipo', 'pessoa_fisica')->update(['tipo' => 'sindico']);
        DB::table('client_profiles')->where('tipo', 'empresa')->update(['tipo' => 'administradora']);
        DB::table('client_profiles')->where('tipo', 'autonomo')->update(['tipo' => 'sindico']);

        // Restore old enum
        DB::statement("ALTER TABLE client_profiles MODIFY COLUMN tipo ENUM('sindico', 'administradora', 'condominio') DEFAULT 'sindico'");

        // Rename columns back
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->renameColumn('nome_organizacao', 'nome_condominio');
            $table->renameColumn('endereco_organizacao', 'endereco_condominio');
            $table->renameColumn('num_funcionarios', 'num_unidades');
        });
    }
};
