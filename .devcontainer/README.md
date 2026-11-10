# PostgreSQL 17 Codespaces setup

## What was inspected

At base commit 55a47a494eb202f607620a464c4c4bf09d652485, main contains no
devcontainer.json, Dockerfile, or Compose configuration. These files are new;
there are no committed container settings/features to replace. If your Codespace
has uncommitted container settings, compare and preserve those before switching.

Laravel lives in agency-app. composer.json permits PHP ^8.3, but composer.lock
locks Pest 5.3.1 (PHP ^8.4) and PHPUnit 13.4.1 (PHP >=8.4.1).
The PHP 8.4 Bookworm devcontainer therefore matches the existing test toolchain
and the repository's nested test workflow. It uses the official PHP extension
helper, not Debian PHP packages. Node 22 is installed through a devcontainer feature.

## Data and lifecycle

- PostgreSQL 17 runs as service db, reachable only on the Compose network;
  no database port is published.
- POSTGRES_DB creates agency on an empty volume. init.sql creates agency_testing
  if missing. The named pgdata volume persists across ordinary container rebuilds.
- The app waits for the database healthcheck. No lifecycle hook installs packages,
  changes .env, or runs migrations.
- app/secret are public, disposable local development values, not production
  credentials. The local app role is the image's development superuser.
- Existing agency-app/.env and SQLite files are neither changed nor removed.
  Switching Laravel connections does not transfer SQLite data to PostgreSQL.
- Existing PostgreSQL volumes skip first-init scripts. Do not delete a volume to
  rerun initialization. Do not attach a volume from another PostgreSQL major version
  to this image. Keep an existing Compose project/volume identity when reusing data;
  inspect its current configuration first.

## Rebuild and configure

1. Save/commit your work and switch your Codespace to this PR branch.
   Compare any uncommitted .devcontainer settings before applying these files.
2. Open the command palette and run **Codespaces: Rebuild Container**.
   Do not select any action that deletes volumes.
3. From the repository root:

   ```bash
   php -v
   php -m | grep pdo_pgsql
   node --version
   pg_isready -h db -p 5432 -U app -d agency
   psql -h db -U app -d agency -W -c 'SELECT current_database(), current_user, version();'
   psql -h db -U app -d agency_testing -W -c 'SELECT current_database(), current_user;'
   ```

   Enter the local password secret when prompted. PHP must be >=8.4.1.

4. For an existing PostgreSQL 17 volume where agency_testing is missing, run:

   ```bash
   psql -h db -U app -d postgres -W -v ON_ERROR_STOP=1 -f .devcontainer/init.sql
   ```

   This creates only a missing agency_testing database; rerunning is safe. If the
   existing cluster uses different credentials, use its actual administrator.
   If agency itself is missing, inspect the cluster first, then explicitly create
   it with `createdb -h db -U app -W -O app agency`. Never reset an existing volume
   or change passwords/owners blindly.

5. Configure Laravel:

   ```bash
   cd agency-app
   # Only when .env does not already exist:
   test -f .env || cp .env.example .env
   composer install
   ```

   In an existing private .env, manually update only these connection entries:

   ```dotenv
   DB_CONNECTION=pgsql
   DB_URL=
   DB_HOST=db
   DB_PORT=5432
   DB_DATABASE=agency
   DB_USERNAME=app
   DB_PASSWORD=secret
   ```

   Remove any inherited DB_URL from your terminal/Codespaces secrets if it overrides
   these settings. Keep your APP_KEY and other existing settings. For a new .env
   with an empty APP_KEY only, run `php artisan key:generate`.

   ```bash
   php artisan config:clear
   php artisan db:show --database=pgsql
   php artisan migrate:status
   php artisan migrate --pretend
   ```

   Confirm the host is db and database is agency. On a fresh empty database,
   migrate:status may report that the migration table does not exist. After
   reviewing the SQL and backing up any existing data, explicitly run
   `php artisan migrate` if you want to apply pending migrations.
   Do not use migrate:fresh, migrate:refresh, db:wipe, or docker compose down -v.
   Avoid composer setup here: its existing script runs migrate --force.

6. Test and start the app:

   ```bash
   npm ci
   npm run build
   php artisan config:clear
   php artisan test
   ```

   PHPUnit forces testing + pgsql + db:5432 + agency_testing + local credentials
   and clears DB_URL. TestCase rejects cached config and a different effective
   connection before RefreshDatabase runs. Feature tests reset tables in
   agency_testing, so keep it disposable and never point db at a production server.
   To inspect the test target without running tests:

   ```bash
   DB_CONNECTION=pgsql DB_URL= DB_HOST=db DB_PORT=5432 DB_DATABASE=agency_testing DB_USERNAME=app DB_PASSWORD=secret php artisan db:show --database=pgsql --env=testing
   ```

   To preview, run `php artisan serve --host=0.0.0.0 --port=8000`; use the
   Codespaces Ports panel to open port 8000. For frontend development, run
   `npm run dev -- --host=0.0.0.0` in a second terminal (port 5173).

## Existing migrations and later strategy

All nine migration files were reviewed and left unchanged. They use Laravel's
schema builder; actual PostgreSQL migration/test execution is still required.
PostgreSQL does not enforce unsigned integer ranges from Laravel's unsigned
column helpers. Existing progress/position values therefore need separate CHECK
constraints if database-level nonnegative/range protection is desired later.
Status/priority are currently strings, budget is decimal(12,2), and identifiers
are numeric. CHECK constraints, backed enums, money minor units, ULIDs and soft
deletes need separate design/data-migration work; none are introduced here.
Existing rows with duplicate task positions can still prevent the existing unique
index migration. This infrastructure change does not repair or delete those rows.

The nested agency-app/.github/workflows/tests.yml is not a root GitHub Actions
workflow. It has not been moved or expanded into CI as part of this change.
Running tests outside Compose requires a local db hostname resolving to your
disposable PostgreSQL service; changing the test guard requires deliberate review.

## References

- [PHP devcontainer image](https://github.com/devcontainers/images/tree/main/src/php)
- [Official PHP extension installation](https://hub.docker.com/_/php)
- [PostgreSQL image and first-init behavior](https://hub.docker.com/_/postgres)
- [Laravel testing environment](https://laravel.com/docs/13.x/testing)
