<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    public const STATUSES = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];

    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD'];

    protected $fillable = ['client_id', 'name', 'project_code', 'description', 'status', 'priority', 'start_date', 'due_date', 'budget', 'currency', 'progress'];

    protected function casts(): array
    {
        return ['start_date' => 'date:Y-m-d', 'due_date' => 'date:Y-m-d', 'completed_at' => 'datetime', 'budget' => 'decimal:2', 'progress' => 'integer'];
    }

    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** @return HasMany<Task, $this> */
    
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Each authenticated account is an isolated agency workspace. Projects inherit
     * ownership from clients; shared membership and role permissions do not exist yet.
     *
     * @param  Builder<Project>  $query
     */
    public function scopeAccessibleTo(Builder $query, User $user): void
    {
        $query->whereHas('client', fn (Builder $clients) => $clients->where('user_id', $user->id));
    }

    /** @return array<string, int> */
    public static function metrics(User $user): array
    {
        $query = static::query()->accessibleTo($user);

        return ['total' => (clone $query)->count(), 'active' => (clone $query)->where('status', 'in_progress')->count(), 'completed' => (clone $query)->where('status', 'completed')->count(), 'overdue' => (clone $query)->whereNotIn('status', ['completed', 'cancelled'])->whereDate('due_date', '<', today())->count()];
    }
}
