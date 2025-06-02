#!/bin/bash

# Database connection details from .env
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="techno"
DB_NAME="tippmix"

echo "=== Checking PostgreSQL connection ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" || {
    echo "Cannot connect to database. Please check if PostgreSQL is running."
    exit 1
}

echo "=== Checking existing tables ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo "=== Checking migrations table ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM migrations;" 2>/dev/null || {
    echo "Migrations table doesn't exist or is empty"
}

echo "=== Manual migration sync ==="
echo "Adding migrations to the migrations table without running them..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
INSERT INTO migrations (timestamp, name) VALUES
(1733580000000, 'CreateAnalyticsEntities1733580000000'),
(1733826267000, 'CreateRefreshTokensTable1733826267000'),
(1737738000000, 'AddUserRoleField1737738000000')
ON CONFLICT DO NOTHING;
"

echo "=== Checking migrations after sync ==="
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM migrations ORDER BY timestamp;"

echo "=== Migration sync completed ==="
