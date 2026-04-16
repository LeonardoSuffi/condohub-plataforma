<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_path');
            $table->string('link')->nullable();
            $table->enum('position', ['topo', 'lateral', 'rodape', 'modal'])->default('topo');
            $table->enum('type', ['comercial', 'admin', 'promocional'])->default('comercial');
            $table->boolean('active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->integer('clicks')->default(0);
            $table->integer('views')->default(0);
            $table->timestamps();

            $table->index(['active', 'position']);
            $table->index(['starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
