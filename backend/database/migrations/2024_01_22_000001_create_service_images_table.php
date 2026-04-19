<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('path');
            $table->string('filename');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('size')->nullable();
            $table->string('caption')->nullable();
            $table->boolean('is_cover')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['service_id', 'order']);
            $table->index(['service_id', 'is_cover']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_images');
    }
};
