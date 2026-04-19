<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->morphs('profile'); // profile_id, profile_type (CompanyProfile ou ClientProfile)
            $table->enum('platform', ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok', 'whatsapp', 'website']);
            $table->string('url');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['profile_id', 'profile_type']);
            $table->unique(['profile_id', 'profile_type', 'platform']);
        });

        // Adicionar campos de localizacao no CompanyProfile
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('cep');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('google_maps_url')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'google_maps_url']);
        });

        Schema::dropIfExists('social_links');
    }
};
