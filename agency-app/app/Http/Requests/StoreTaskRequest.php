<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;
use Illuminate\Validation\Rules\In;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<string|Exists|In>> */
    public function rules(): array
    {
        return [
            'project_id' => [
                'bail',
                'required',
                'integer',
                Rule::exists('projects', 'id')->where(fn (Builder $query) => $query->whereIn(
                    'id',
                    Project::query()->accessibleTo($this->user())->select('projects.id')->toBase(),
                )),
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
