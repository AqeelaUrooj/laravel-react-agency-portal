<?php

namespace Database\Seeders;

use App\Enums\Priority;
use App\Enums\ProjectStatus;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::query()->where('email', 'like', '%@example.com')->orderBy('id')->get();
        if ($clients->isEmpty()) {
            $user = User::query()->orderBy('id')->first();
            if ($user === null) {
                return;
            }
            foreach (['Northstar Studio', 'Orbit Commerce'] as $i => $name) {
                $user->clients()->firstOrCreate(['email' => 'demo-client-'.($i + 1).'@example.com'], ['name' => $name, 'company' => $name, 'status' => 'active', 'notes' => 'Fictional portfolio demonstration client.']);
            }
            $clients = $user->clients()->where('email', 'like', '%@example.com')->orderBy('id')->get();
        }
        foreach (['Corporate Website Redesign', 'E-Commerce Store Development', 'Customer Relationship Management System', 'Mobile Application Development', 'Booking Platform Integration', 'Business Analytics Dashboard'] as $i => $name) {
            $client = $clients[$i % $clients->count()];
            Project::firstOrCreate(['project_code' => 'DEMO-'.$client->id.'-'.($i + 1)], ['client_id' => $client->id, 'name' => $name, 'description' => 'Fictional portfolio demonstration project.', 'status' => ProjectStatus::values()[$i % 5], 'priority' => Priority::values()[$i % 4], 'start_date' => today()->subDays(20), 'due_date' => today()->addDays($i * 10 - 5), 'budget' => 4500 + $i * 2500, 'currency' => 'USD', 'progress' => $i % 5 === 3 ? 100 : $i * 12, 'completed_at' => $i % 5 === 3 ? now() : null]);
        }
    }
}
