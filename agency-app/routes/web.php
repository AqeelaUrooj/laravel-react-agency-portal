<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
    Route::resource('projects', ProjectController::class);
    Route::resource('clients', ClientController::class);
});

require __DIR__.'/settings.php';
