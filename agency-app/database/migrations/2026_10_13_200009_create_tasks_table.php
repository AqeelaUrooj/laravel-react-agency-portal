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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->string('title', 255);

            $table->text('description')->nullable();

            $table->string('status', 30)
                ->default('todo');

            $table->string('priority', 20)
                ->default('medium');

            $table->date('due_date')->nullable();

            $table->unsignedInteger('position')
                ->default(0);

            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index(['project_id', 'status', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
