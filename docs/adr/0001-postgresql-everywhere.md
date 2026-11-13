# 0001. Use PostgreSQL for development and testing

Status: Accepted

## Context

The portal previously ran its tests on SQLite. The application now uses PostgreSQL 17 in Codespaces and relies on database behavior such as CHECK constraints and row locks. A test that inserts a task with status 'banana' directly into the database should prove that PostgreSQL itself rejects the row.

## Options

- Keep SQLite for tests and use PostgreSQL for development. Tests would need less setup, but they would exercise a different database engine.
- Run PostgreSQL 17 in development and in tests. Both environments would exercise the same database behavior, with a PostgreSQL service required for test runs.

## Decision

Use PostgreSQL 17 for development and tests. The application uses the agency database. Pest uses a separate, disposable agency_testing database. GitHub Actions starts a fresh PostgreSQL service for each CI job. The test setup checks the database target before feature tests can reset tables.

## Consequences

- Tests can verify PostgreSQL constraints even when they bypass Laravel validation.
- Codespaces and CI need a running PostgreSQL service and PHP's pdo_pgsql extension.
- Local application data and disposable test data live in separate databases. Switching from SQLite to PostgreSQL requires a separate data transfer if old records are needed.
