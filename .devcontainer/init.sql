-- POSTGRES_DB creates agency. This script creates only a missing test database.
-- Runs on first initialization; can also be applied manually to an existing
-- PostgreSQL 17 volume without dropping databases or changing existing owners.
SELECT 'CREATE DATABASE agency_testing OWNER app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agency_testing')
\gexec
