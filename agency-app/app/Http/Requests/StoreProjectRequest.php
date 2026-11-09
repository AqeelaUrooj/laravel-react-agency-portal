<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Project::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')->where('user_id', $this->user()->id)],
            'project_code' => ['nullable', 'string', 'max:40', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('projects')->ignore($this->route('project'))],
            'description' => ['nullable', 'string', 'max:10000'],
            'status' => ['required', Rule::in(Project::STATUSES)], 'priority' => ['required', Rule::in(Project::PRIORITIES)],
            'progress' => ['required', 'integer', 'between:0,100'], 'start_date' => ['nullable', 'date_format:Y-m-d'],
            'due_date' => ['nullable', 'date_format:Y-m-d', ...($this->filled('start_date') ? ['after_or_equal:start_date'] : [])],
            'budget' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'currency' => ['nullable', 'required_with:budget', Rule::in(Project::CURRENCIES)],
        ];
    }
}
