<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\ProjectSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;

function projectPayload(Client $client): array
{
    return ['client_id' => $client->id, 'name' => 'Website redesign', 'project_code' => 'WEB-001', 'status' => 'planning', 'priority' => 'high', 'progress' => 20, 'start_date' => '2026-01-01', 'due_date' => '2026-02-01', 'budget' => '5000.00', 'currency' => 'USD'];
}

test('project routes require authentication', function () {
    $project = Project::factory()->create();
    foreach (['index', 'create'] as $action) {
        $this->get(route('projects.'.$action))->assertRedirect(route('login'));
    }
    foreach (['show', 'edit'] as $action) {
        $this->get(route('projects.'.$action, $project))->assertRedirect(route('login'));
    }
    $this->post(route('projects.store'), [])->assertRedirect(route('login'));
    $this->put(route('projects.update', $project), [])->assertRedirect(route('login'));
    $this->delete(route('projects.destroy', $project))->assertRedirect(route('login'));
});

test('owners can manage projects and completion timestamps', function () {
    $client = Client::factory()->create();
    $this->actingAs($client->user);
    $this->get(route('projects.create', ['client_id' => $client->id]))->assertOk()->assertInertia(fn (Assert $page) => $page->where('selectedClient', $client->id));
    $this->post(route('projects.store'), [...projectPayload($client), 'completed_at' => '2000-01-01', 'user_id' => 999])->assertSessionHasNoErrors();
    $project = $client->projects()->firstOrFail();
    expect($project->completed_at)->toBeNull();
    $this->get(route('projects.show', $project))->assertOk();
    $this->get(route('projects.edit', $project))->assertOk();
    $this->put(route('projects.update', $project), [...projectPayload($client), 'status' => 'completed', 'progress' => 73])->assertRedirect(route('projects.show', $project));
    expect($project->fresh()->completed_at)->not->toBeNull();
    expect($project->fresh()->progress)->toBe(73);
    $this->put(route('projects.update', $project), [...projectPayload($client), 'status' => 'in_progress'])->assertSessionHasNoErrors();
    expect($project->fresh()->completed_at)->toBeNull();
    $this->delete(route('projects.destroy', $project))->assertRedirect(route('projects.index'))->assertSessionHas('success');
    $this->assertModelMissing($project);
});

test('foreign owners cannot access projects or assign foreign clients', function (string $method, string $action) {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $client = Client::factory()->for($owner)->create();
    $project = Project::factory()->for($client)->create();

    expect(Gate::forUser($intruder)->allows('view', $project))->toBeFalse();
    $this->actingAs($intruder)->{$method}(route('projects.'.$action, $project), projectPayload($project->client))->assertNotFound();
    $this->assertModelExists($project);
})->with([['get', 'show'], ['get', 'edit'], ['put', 'update'], ['delete', 'destroy']]);

test('foreign or missing clients cannot be assigned or preselected', function () {
    $client = Client::factory()->create();
    $ownerClient = Client::factory()->create();
    $project = Project::factory()->for($ownerClient)->create();
    $this->actingAs($ownerClient->user)->post(route('projects.store'), projectPayload($client))->assertSessionHasErrors('client_id');
    $this->put(route('projects.update', $project), projectPayload($client))->assertSessionHasErrors('client_id');
    $this->get(route('projects.create', ['client_id' => $client->id]))->assertSessionHasErrors('client_id');
    $this->post(route('projects.store'), [...projectPayload($client), 'client_id' => 99999])->assertSessionHasErrors('client_id');
    expect($project->fresh()->client_id)->toBe($ownerClient->id);
});

test('project validation rejects invalid values', function (array $overrides, array $errors) {
    $client = Client::factory()->create();
    $this->actingAs($client->user)->post(route('projects.store'), [...projectPayload($client), ...$overrides])->assertSessionHasErrors($errors);
    $this->assertDatabaseCount('projects', 0);
})->with([
    'required' => [['name' => '', 'status' => '', 'priority' => '', 'progress' => ''], ['name', 'status', 'priority', 'progress']],
    'enums' => [['status' => 'unknown', 'priority' => 'critical'], ['status', 'priority']],
    'negative progress' => [['progress' => -1], ['progress']],
    'excess progress' => [['progress' => 101], ['progress']],
    'fractional progress' => [['progress' => 10.5], ['progress']],
    'deadline' => [['due_date' => '2025-01-01'], ['due_date']],
    'budget' => [['budget' => -1], ['budget']],
    'currency' => [['currency' => 'ZZZ'], ['currency']],
    'missing currency' => [['currency' => ''], ['currency']],
    'code' => [['project_code' => 'invalid code'], ['project_code']],
]);

test('project codes are unique and blank codes are generated', function () {
    $client = Client::factory()->create();
    Project::factory()->create(['project_code' => 'WEB-001']);
    $this->actingAs($client->user)->post(route('projects.store'), projectPayload($client))->assertSessionHasErrors('project_code');
    $this->post(route('projects.store'), [...projectPayload($client), 'project_code' => ''])->assertSessionHasNoErrors();
    expect($client->projects()->firstOrFail()->project_code)->toStartWith('PRJ-');
});

test('search filters sorting views and pagination are scoped to the workspace', function () {
    $client = Client::factory()->create();
    Project::factory()->count(11)->for($client)->create(['name' => 'Orbit Website', 'status' => 'in_progress', 'priority' => 'high']);
    Project::factory()->for($client)->create(['name' => 'Other', 'status' => 'completed', 'priority' => 'low']);
    Project::factory()->create(['name' => 'Orbit Website', 'status' => 'in_progress', 'priority' => 'high']);
    $this->actingAs($client->user)->get(route('projects.index', ['search' => 'Orbit', 'client_id' => $client->id, 'status' => 'in_progress', 'priority' => 'high', 'page' => 2, 'sort' => 'name', 'direction' => 'asc', 'view' => 'grid']))->assertInertia(fn (Assert $page) => $page->has('projects.data', 1)->where('projects.total', 11)->where('metrics.total', 12)->has('clients', 1)->where('filters.view', 'grid'));
    $project = $client->projects()->firstOrFail();
    $this->get(route('projects.index', ['search' => $project->project_code]))->assertInertia(fn (Assert $page) => $page->has('projects.data', 1));
    $this->get(route('projects.index', ['search' => "' OR 1=1 --"]))->assertInertia(fn (Assert $page) => $page->has('projects.data', 0));
});

test('dashboard statistics and client project listings use authorized data and deadline rules', function () {
    $client = Client::factory()->create();
    Project::factory()->for($client)->create(['status' => 'in_progress', 'due_date' => today()->subDay()]);
    Project::factory()->for($client)->create(['status' => 'planning', 'due_date' => today()]);
    Project::factory()->for($client)->create(['status' => 'completed', 'due_date' => today()->subDay()]);
    Project::factory()->for($client)->create(['status' => 'cancelled', 'due_date' => today()->subDay()]);
    Project::factory()->create(['status' => 'in_progress', 'due_date' => today()->subDay()]);
    $this->actingAs($client->user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('projectMetrics', ['total' => 4, 'active' => 1, 'completed' => 1, 'overdue' => 1])->has('recentProjects', 4)->where('metrics.total', 1));
    $this->get(route('clients.show', $client))->assertInertia(fn (Assert $page) => $page->has('projects.data', 4));
    expect($client->projects()->first()->client->id)->toBe($client->id);
    $this->delete(route('clients.destroy', $client))->assertSessionHasErrors('client');
    $this->assertModelExists($client);
});

test('invalid project updates preserve existing data', function () {
    $project = Project::factory()->create();
    $this->actingAs($project->client->user)->put(route('projects.update', $project), [...projectPayload($project->client), 'name' => '', 'budget' => -2])->assertSessionHasErrors(['name', 'budget']);
    expect($project->fresh()->name)->toBe($project->name);
});

test('project seeder is repeatable and only uses fictional example clients', function () {
    $client = Client::factory()->create(['email' => 'studio@example.com']);
    $other = Client::factory()->create(['email' => 'private@private.test']);
    $this->seed(ProjectSeeder::class);
    $this->seed(ProjectSeeder::class);
    expect($client->projects()->count())->toBe(6);
    expect($other->projects()->count())->toBe(0);
});

test('project ordering supports names deadlines and creation dates', function (string $sort, string $direction, string $first) {
    $client = Client::factory()->create();
    Project::factory()->for($client)->create(['name' => 'Alpha', 'start_date' => '2026-01-01', 'due_date' => '2026-05-01', 'created_at' => '2026-01-01']);
    Project::factory()->for($client)->create(['name' => 'Zulu', 'start_date' => '2026-01-01', 'due_date' => '2026-03-01', 'created_at' => '2026-02-01']);
    $this->actingAs($client->user)->get(route('projects.index', compact('sort', 'direction')))->assertInertia(fn (Assert $page) => $page->where('projects.data.0.name', $first));
})->with([['name', 'asc', 'Alpha'], ['name', 'desc', 'Zulu'], ['due_date', 'asc', 'Zulu'], ['created_at', 'desc', 'Zulu']]);

test('demo seeding creates fictional clients when none exist without changing existing clients', function () {
    $client = Client::factory()->create(['email' => 'private@private.test']);
    $this->seed(ProjectSeeder::class);
    $this->seed(ProjectSeeder::class);
    expect($client->projects()->count())->toBe(0);
    $this->assertDatabaseCount('clients', 3);
    $this->assertDatabaseCount('projects', 6);
});

test('project index loads a full page within eight queries', function () {
    $user = User::factory()->create();
    $clients = Client::factory()->count(10)->for($user)->create();

    foreach ($clients as $client) {
        Project::factory()->for($client)->create();
    }

    $this->actingAs($user);
    DB::flushQueryLog();
    DB::enableQueryLog();

    try {
        $response = $this->get(route('projects.index'));
        $queryCount = count(DB::getQueryLog());
    } finally {
        DB::disableQueryLog();
        DB::flushQueryLog();
    }

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('projects.data', 10)
        ->has('projects.data.0.client'));

    expect($queryCount)->toBeLessThanOrEqual(8);
});
