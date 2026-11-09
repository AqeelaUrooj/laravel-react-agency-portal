<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Project> */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return ['client_id' => Client::factory(), 'name' => fake()->sentence(3), 'project_code' => 'PRJ-'.strtoupper(fake()->unique()->bothify('????-########')), 'status' => fake()->randomElement(Project::STATUSES), 'priority' => fake()->randomElement(Project::PRIORITIES), 'description' => fake()->paragraph(), 'start_date' => today()->subDays(10), 'due_date' => today()->addDays(30), 'budget' => fake()->numberBetween(2000, 50000), 'currency' => 'USD', 'progress' => fake()->numberBetween(0, 100)];
    }
}
