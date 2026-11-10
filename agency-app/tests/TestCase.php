<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        // Cached configuration bypasses PHPUnit's forced environment variables.
        $cache = $_ENV['APP_CONFIG_CACHE'] ?? $_SERVER['APP_CONFIG_CACHE']
            ?? (getenv('APP_CONFIG_CACHE') ?: __DIR__.'/../bootstrap/cache/config.php');

        if (is_file($cache)) {
            throw new RuntimeException('Clear cached configuration with php artisan config:clear before testing.');
        }

        $app = parent::createApplication();
        $connection = $app['config']->get('database.connections.pgsql');

        // Runs before RefreshDatabase can migrate/reset any tables.
        if (! $app->environment('testing')
            || $app['config']->get('database.default') !== 'pgsql'
            || ! is_array($connection)
            || ($connection['driver'] ?? null) !== 'pgsql'
            || ($connection['host'] ?? null) !== 'db'
            || (string) ($connection['port'] ?? '') !== '5432'
            || ($connection['database'] ?? null) !== 'agency_testing'
            || ($connection['username'] ?? null) !== 'app'
            || ! empty($connection['url'])) {
            throw new RuntimeException('Tests may only use PostgreSQL db:5432/agency_testing as app, without DB_URL.');
        }

        return $app;
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
