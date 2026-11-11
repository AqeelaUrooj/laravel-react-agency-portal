<?php

use App\Models\Project;

it('rejects invalid task input', function (array $overrides, string $field) {
    $project = Project::factory()->create();
    $valid = [
        'project_id' => $project->id,
        'title' => 'Write brief',
        'status' => 'todo',
        'priority' => 'medium',
    ];

    $this->actingAs($project->client->user)
        ->post(route('tasks.store'), [...$valid, ...$overrides])
        ->assertSessionHasErrors($field);

    $this->assertDatabaseCount('tasks', 0);
})->with([
    'missing project' => [['project_id' => null], 'project_id'],
    'noninteger project' => [['project_id' => 'invalid'], 'project_id'],
    'nonexistent project' => [['project_id' => 0], 'project_id'],
    'empty title' => [['title' => ''], 'title'],
    'nonstring title' => [['title' => ['invalid']], 'title'],
    'long title' => [['title' => str_repeat('a', 256)], 'title'],
    'nonstring description' => [['description' => ['invalid']], 'description'],
    'missing status' => [['status' => null], 'status'],
    'bad status' => [['status' => 'banana'], 'status'],
    'missing priority' => [['priority' => null], 'priority'],
    'bad priority' => [['priority' => 'extreme'], 'priority'],
    'bad date' => [['due_date' => 'not-a-date'], 'due_date'],
]);

it('rejects a task for a project owned by another user', function () {
    $owned = Project::factory()->create();
    $foreign = Project::factory()->create();

    $this->actingAs($owned->client->user)->post(route('tasks.store'), [
        'project_id' => $foreign->id,
        'title' => 'Write brief',
        'status' => 'todo',
        'priority' => 'medium',
    ])->assertSessionHasErrors('project_id');

    $this->assertDatabaseCount('tasks', 0);
});

it('creates a task and redirects to its project', function () {
    $project = Project::factory()->create();

    $this->actingAs($project->client->user)->post(route('tasks.store'), [
        'project_id' => $project->id,
        'title' => 'Write brief',
        'status' => 'todo',
        'priority' => 'medium',
    ])->assertSessionHasNoErrors()->assertRedirect(route('projects.show', $project));

    $this->assertDatabaseHas('tasks', [
        'project_id' => $project->id,
        'title' => 'Write brief',
        'position' => 1,
    ]);
});
