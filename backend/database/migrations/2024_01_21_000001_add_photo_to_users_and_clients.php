<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('foto_path')->nullable()->after('type');
        });

        Schema::table('client_profiles', function (Blueprint $table) {
            $table->string('cep', 10)->nullable()->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('foto_path');
        });

        Schema::table('client_profiles', function (Blueprint $table) {
            $table->dropColumn('cep');
        });
    }
};
