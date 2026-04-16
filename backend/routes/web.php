<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Plataforma Condominial API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
});
