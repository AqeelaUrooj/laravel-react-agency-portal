<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case InReview = 'in_review';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Todo => 'To do',
            self::InProgress => 'In progress',
            self::InReview => 'In review',
            self::Completed => 'Completed',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
