<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Check if the user has permission to view any projects before fetching tasks
        Gate::authorize('viewAny', Task::class);

        $tasks = Task::query()
            ->whereHas('project', function ($query) use ($request) {
                $query->accessibleTo($request->user());
            })
            ->with('project:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'statuses' => Task::STATUSES,
            'priorities' => Task::PRIORITIES,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request): void {

            // 1. Lock the authorized parent project.
            $project = Project::query()
                ->accessibleTo($request->user())
                ->lockForUpdate()
                ->findOrFail($data['project_id']);

            // 2. Find the last position in this status column.
            $lastPosition = $project->tasks()
                ->where('status', $data['status'])
                ->max('position') ?? 0;

            // 3. Construct the model.
            $task = new Task([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'],
                'priority' => $data['priority'],
                'due_date' => $data['due_date'] ?? null,
            ]);

            // 4. Set backend-controlled properties.
            $task->position = $lastPosition + 1;

            $task->completed_at = $task->status === 'completed'
                ? now()
                : null;

            // 5. Insert using the parent relationship.
            $project->tasks()->save($task);

        }, attempts: 3);

        return to_route('tasks.index')
            ->with('success', 'Task created successfully.');
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
