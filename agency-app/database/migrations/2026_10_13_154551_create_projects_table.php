<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('project_code', 40)->unique();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('planning');
            $table->string('priority', 10)->default('medium');
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('budget', 12, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->unsignedSmallInteger('progress')->default(0);
            $table->timestamps();
            $table->index(['client_id', 'status']);
            $table->index('due_date');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
