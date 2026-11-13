<?php

namespace App\Http\Requests;

use App\Enums\Priority;
use App\Enums\TaskStatus;
use App\Models\Project;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Exists;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<string|Exists|Enum>> */
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
                Rule::enum(TaskStatus::class),
            ],

            'priority' => [
                'required',
                Rule::enum(Priority::class),
            ],

            'due_date' => [
                'nullable',
                'date',
            ],
        ];
    }
}
