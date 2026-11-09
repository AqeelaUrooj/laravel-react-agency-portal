<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): Response
    {
        return $task->project->client->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    public function update(User $user, Task $task): Response
    {
        return $this->view($user, $task);
    }

    public function delete(User $user, Task $task): Response
    {
        return $this->view($user, $task);
    }
}