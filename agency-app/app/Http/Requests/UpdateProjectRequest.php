<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Gate;

class UpdateProjectRequest extends StoreProjectRequest
{
    public function authorize(): bool
    {
        Gate::authorize('update', $this->route('project'));

        return true;
    }
}
