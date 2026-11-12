# The locked Pest/PHPUnit dependencies require PHP >= 8.4.1.
FROM mcr.microsoft.com/devcontainers/php:8.4-bookworm

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev postgresql-client \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
