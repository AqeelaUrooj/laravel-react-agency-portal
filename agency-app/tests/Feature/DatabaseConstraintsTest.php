<?php

use App\Models\Project;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

it('rejects an invalid task status at the database level', function () {
    $project = Project::factory()->create();

    expect(fn () => DB::table('tasks')->insert([
        'project_id' => $project->id,
        'title' => 'Bad row',
        'status' => 'banana',
        'priority' => 'medium',
        'position' => 1,
    ]))->toThrow(QueryException::class, 'tasks_status_check');
});
