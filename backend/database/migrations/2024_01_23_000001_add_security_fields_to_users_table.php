<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Session control - only one active session per user
            $table->string('current_session_id')->nullable()->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('current_session_id');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->string('last_login_device')->nullable()->after('last_login_ip');

            // Security flags
            $table->boolean('is_blocked')->default(false)->after('last_login_device');
            $table->timestamp('blocked_at')->nullable()->after('is_blocked');
            $table->string('blocked_reason')->nullable()->after('blocked_at');

            // Failed login attempts
            $table->integer('failed_login_attempts')->default(0)->after('blocked_reason');
            $table->timestamp('last_failed_login_at')->nullable()->after('failed_login_attempts');

            // Email verification
            $table->timestamp('email_verified_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_session_id',
                'last_login_at',
                'last_login_ip',
                'last_login_device',
                'is_blocked',
                'blocked_at',
                'blocked_reason',
                'failed_login_attempts',
                'last_failed_login_at',
            ]);
        });
    }
};
