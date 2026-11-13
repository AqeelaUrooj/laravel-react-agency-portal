<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Planning = 'planning';
    case InProgress = 'in_progress';
    case OnHold = 'on_hold';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Planning => 'Planning',
            self::InProgress => 'In progress',
            self::OnHold => 'On hold',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
