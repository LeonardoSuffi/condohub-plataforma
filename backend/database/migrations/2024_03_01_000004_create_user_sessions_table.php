<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_id', 100)->unique();
            $table->string('device_name')->nullable();
            $table->string('device_type', 50)->nullable(); // desktop, mobile, tablet
            $table->string('browser', 100)->nullable();
            $table->string('platform', 100)->nullable(); // Windows, macOS, iOS, Android
            $table->string('ip_address', 45)->nullable();
            $table->string('location')->nullable(); // Cidade, Pais
            $table->boolean('is_current')->default(false);
            $table->timestamp('last_active_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'is_current']);
            $table->index(['user_id', 'last_active_at']);
            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
