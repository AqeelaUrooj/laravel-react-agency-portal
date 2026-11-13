<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, string> Constraint name => table name. */
    private array $constraints = [
        'tasks_status_check' => 'tasks',
        'tasks_priority_check' => 'tasks',
        'tasks_position_check' => 'tasks',
        'projects_status_check' => 'projects',
        'projects_priority_check' => 'projects',
        'projects_progress_check' => 'projects',
        'projects_dates_check' => 'projects',
    ];

    public function up(): void
    {
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
            CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed'))");

        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check
            CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");

        DB::statement('ALTER TABLE tasks ALTER COLUMN position SET DEFAULT 1');

        DB::statement('ALTER TABLE tasks ADD CONSTRAINT tasks_position_check
            CHECK (position >= 1)');

        DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check
            CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled'))");

        DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_priority_check
            CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");

        DB::statement('ALTER TABLE projects ADD CONSTRAINT projects_progress_check
            CHECK (progress BETWEEN 0 AND 100)');

        DB::statement('ALTER TABLE projects ADD CONSTRAINT projects_dates_check
            CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)');
    }

    public function down(): void
    {
        foreach ($this->constraints as $name => $table) {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT IF EXISTS {$name}");
        }

        DB::statement('ALTER TABLE tasks ALTER COLUMN position SET DEFAULT 0');
    }
};
