<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('nome_fantasia');
            $table->decimal('average_rating', 2, 1)->nullable()->after('verified');
        });

        // Gera slugs para empresas existentes
        $companies = DB::table('company_profiles')->get();
        foreach ($companies as $company) {
            $baseSlug = Str::slug($company->nome_fantasia ?? 'empresa');
            $slug = $baseSlug;
            $counter = 1;

            while (DB::table('company_profiles')->where('slug', $slug)->where('id', '!=', $company->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            DB::table('company_profiles')->where('id', $company->id)->update(['slug' => $slug]);
        }

        // Calcula average_rating baseado nos reviews existentes
        DB::statement("
            UPDATE company_profiles cp
            SET average_rating = (
                SELECT ROUND(AVG(r.rating), 1)
                FROM reviews r
                WHERE r.company_id = cp.id AND r.status = 'approved'
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['slug', 'average_rating']);
        });
    }
};
