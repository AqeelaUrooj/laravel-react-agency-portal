<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Project::class);
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:255'], 'status' => ['nullable', Rule::in(Project::STATUSES)], 'priority' => ['nullable', Rule::in(Project::PRIORITIES)], 'client_id' => ['nullable', 'integer', Rule::exists('clients', 'id')->where('user_id', $request->user()->id)], 'sort' => ['nullable', Rule::in(['created_at', 'due_date', 'name'])], 'direction' => ['nullable', Rule::in(['asc', 'desc'])], 'view' => ['nullable', Rule::in(['table', 'grid'])], 'page' => ['nullable', 'integer', 'min:1']]);
        $query = Project::query()->accessibleTo($request->user())->with('client:id,name');
        if ($search = $filters['search'] ?? null) {
            $query->where(function ($query) use ($search): void {
                $query->whereLike('name', "%{$search}%")->orWhereLike('project_code', "%{$search}%");
            });
        }
        foreach (['status', 'priority', 'client_id'] as $field) {
            if ($filters[$field] ?? null) {
                $query->where($field, $filters[$field]);
            }
        }

        return Inertia::render('projects/index', ['projects' => $query->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')->orderBy('id')->paginate(10)->withQueryString(), 'filters' => $filters, 'metrics' => Project::metrics($request->user()), ...$this->options($request)]);
    }

    /** @return array{clients: Collection<int, Client>, statuses: list<string>, priorities: list<string>, currencies: list<string>} */
    private function options(Request $request): array
    {
        return ['clients' => $request->user()->clients()->orderBy('name')->get(['id', 'name']), 'statuses' => Project::STATUSES, 'priorities' => Project::PRIORITIES, 'currencies' => Project::CURRENCIES];
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Project::class);
        $selected = $request->validate(['client_id' => ['nullable', 'integer', Rule::exists('clients', 'id')->where('user_id', $request->user()->id)]]);

        return Inertia::render('projects/create', [...$this->options($request), 'selectedClient' => isset($selected['client_id']) ? (int) $selected['client_id'] : null]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['project_code'] = $data['project_code'] ?? 'PRJ-'.Str::upper((string) Str::ulid());
        $project = new Project($data);
        $project->completed_at = $data['status'] === 'completed' ? now() : null;
        $project->save();

        return to_route('projects.show', $project)->with('success', 'Project created successfully.');
    }

    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        return Inertia::render('projects/show', ['project' => $project->load('client:id,name')]);
    }

    public function edit(Request $request, Project $project): Response
    {
        Gate::authorize('update', $project);

        return Inertia::render('projects/edit', ['project' => $project, ...$this->options($request)]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->validated();
        $data['project_code'] = $data['project_code'] ?? $project->project_code;
        $project->fill($data);
        $project->completed_at = $data['status'] === 'completed' ? ($project->completed_at ?? now()) : null;
        $project->save();

        return to_route('projects.show', $project)->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);
        $project->delete();

        return to_route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
