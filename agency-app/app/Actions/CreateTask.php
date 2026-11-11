<?php

namespace App\Actions;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTask
{
    /**
     * @param  array<string, mixed>  $attributes  Validated task attributes.
     */
    public function handle(User $user, int $projectId, array $attributes): void
    {
        DB::transaction(function () use ($attributes, $projectId, $user): void {
            $project = Project::query()
                ->accessibleTo($user)
                ->lockForUpdate()
                ->findOrFail($projectId);

            $task = new Task($attributes);
            $lastPosition = $project->tasks()
                ->where('status', $task->status)
                ->max('position');

            $task->position = max(0, (int) $lastPosition) + 1;
            $task->completed_at = $task->status === 'completed'
                ? now()
                : null;

            $project->tasks()->save($task);
        }, attempts: 3);
    }
}
