<?php

use App\Models\Client;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access client pages', function () {
    $this->get(route('clients.index'))->assertRedirect(route('login'));
    $this->post(route('clients.store'), [])->assertRedirect(route('login'));
});

test('owners can create view edit update and delete a client', function () {
    $user = User::factory()->create();
    $payload = ['name' => 'Alex Morgan', 'email' => 'alex@example.com', 'phone' => '+1 555 123', 'company' => 'Studio', 'status' => 'active', 'notes' => 'Prefers email'];
    $this->actingAs($user)->get(route('clients.create'))->assertOk();
    $this->post(route('clients.store'), [...$payload, 'user_id' => User::factory()->create()->id])->assertSessionHasNoErrors();
    $client = $user->clients()->firstOrFail();
    $this->assertDatabaseHas('clients', [...$payload, 'user_id' => $user->id]);
    $this->get(route('clients.show', $client))->assertOk()->assertInertia(fn (Assert $page) => $page->component('clients/show')->where('client.name', 'Alex Morgan'));
    $this->get(route('clients.edit', $client))->assertOk();
    $this->put(route('clients.update', $client), [...$payload, 'status' => 'inactive'])->assertRedirect(route('clients.show', $client));
    $this->assertDatabaseHas('clients', ['id' => $client->id, 'status' => 'inactive']);
    $this->delete(route('clients.destroy', $client))->assertRedirect(route('clients.index'))->assertSessionHas('success');
    $this->assertModelMissing($client);
});

test('other owners cannot read change or delete clients', function (string $method, string $action) {
    $client = Client::factory()->create();
    $this->actingAs(User::factory()->create())->{$method}(route('clients.'.$action, $client), ['name' => 'Changed', 'email' => 'test@example.com', 'status' => 'active'])->assertNotFound();
    $this->assertDatabaseHas('clients', ['id' => $client->id, 'name' => $client->name]);
})->with([['get', 'show'], ['get', 'edit'], ['put', 'update'], ['delete', 'destroy']]);

test('clients and dashboard metrics belong only to the signed in owner', function () {
    $user = User::factory()->create();
    Client::factory()->count(2)->for($user)->create(['status' => 'active']);
    Client::factory()->for($user)->create(['status' => 'inactive']);
    Client::factory()->for($user)->create(['status' => 'lead']);
    Client::factory()->create(['name' => 'Private client']);
    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('metrics', ['total' => 4, 'active' => 2, 'inactive' => 1, 'lead' => 1])->has('recentClients', 4));
    $this->get(route('clients.index'))->assertInertia(fn (Assert $page) => $page->has('clients.data', 4));
});

test('search status and pagination work together', function () {
    $user = User::factory()->create();
    Client::factory()->count(11)->for($user)->create(['company' => 'Orbit', 'status' => 'active']);
    Client::factory()->for($user)->create(['company' => 'Orbit', 'status' => 'inactive']);
    Client::factory()->create(['company' => 'Orbit', 'status' => 'active']);
    $this->actingAs($user)->get(route('clients.index', ['search' => 'Orbit', 'status' => 'active', 'page' => 2]))->assertInertia(fn (Assert $page) => $page->has('clients.data', 1)->where('clients.total', 11)->where('clients.current_page', 2)->where('metrics.total', 12));
    $this->get(route('clients.index', ['search' => "' OR 1=1 --"]))->assertInertia(fn (Assert $page) => $page->has('clients.data', 0));
});

test('invalid client fields never create a record', function (array $override, array $errors) {
    $this->actingAs(User::factory()->create())->post(route('clients.store'), [...['name' => 'Alex', 'email' => 'alex@example.com', 'status' => 'lead'], ...$override])->assertSessionHasErrors($errors);
    $this->assertDatabaseCount('clients', 0);
})->with([
    'required fields' => [['name' => '', 'email' => '', 'status' => ''], ['name', 'email', 'status']],
    'invalid email' => [['email' => 'invalid'], ['email']],
    'invalid status' => [['status' => 'unknown'], ['status']],
    'long name' => [['name' => str_repeat('a', 256)], ['name']],
    'long email' => [['email' => str_repeat('a', 250).'@example.com'], ['email']],
    'long phone' => [['phone' => str_repeat('1', 51)], ['phone']],
    'long company' => [['company' => str_repeat('a', 256)], ['company']],
    'long notes' => [['notes' => str_repeat('a', 10001)], ['notes']],
]);

test('invalid updates preserve existing data', function () {
    $client = Client::factory()->create();
    $this->actingAs($client->user)->put(route('clients.update', $client), ['name' => '', 'email' => 'invalid', 'status' => 'unknown'])->assertSessionHasErrors(['name', 'email', 'status']);
    $this->assertDatabaseHas('clients', ['id' => $client->id, 'name' => $client->name, 'email' => $client->email, 'status' => $client->status]);
});
