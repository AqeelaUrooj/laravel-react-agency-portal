<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('projects', ProjectController::class);
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::resource('clients', ClientController::class);
});

require __DIR__.'/settings.php';
