<?php

namespace App\Http\Controllers;

use App\Actions\CreateTask;
use App\Http\Requests\StoreTaskRequest;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

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
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request, CreateTask $createTask): RedirectResponse
    {
        $projectId = $request->integer('project_id');

        $createTask->handle($request->user(), $projectId, $request->safe()->except('project_id'));

        return to_route('projects.show', $projectId)
            ->with('success', 'Task created successfully.');
    }
}
