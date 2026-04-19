<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('cover_path')->nullable()->after('logo_path');
            $table->string('website')->nullable()->after('descricao');
        });

        Schema::table('client_profiles', function (Blueprint $table) {
            $table->string('cover_path')->nullable()->after('num_unidades');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['cover_path', 'website']);
        });

        Schema::table('client_profiles', function (Blueprint $table) {
            $table->dropColumn('cover_path');
        });
    }
};
