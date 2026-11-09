<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        return Project::query()
            ->accessibleTo($user)
            ->whereKey($this->input('project_id'))
            ->exists();
    }

    public function rules(): array
    {
        return [
            'project_id' => [
                'required',
                'integer',
                'exists:projects,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'status' => [
                'required',
                Rule::in(Task::STATUSES),
            ],

            'priority' => [
                'required',
                Rule::in(Task::PRIORITIES),
            ],

            'due_date' => [
                'nullable',
                'date',
            ],
        ];
    }
}