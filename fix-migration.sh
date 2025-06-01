#!/bin/bash

# Database connection details
export PGPASSWORD="techno"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="tippmix"

echo "🔄 Starting manual database migration..."

# Check database connection
echo "📡 Testing database connection..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to database. Please check if PostgreSQL is running."
    exit 1
fi
echo "✅ Database connection successful"

# Check migrations table
echo "🔍 Checking migrations table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as migration_count FROM migrations;" 2>/dev/null || {
    echo "📝 Creating migrations table..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            timestamp bigint NOT NULL,
            name character varying NOT NULL
        );
    "
}

# Add migration entries if they don't exist
echo "📋 Syncing migration history..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
INSERT INTO migrations (timestamp, name) VALUES
(1733580000000, 'CreateAnalyticsEntities1733580000000'),
(1733826267000, 'CreateRefreshTokensTable1733826267000'),
(1737738000000, 'AddUserRoleField1737738000000')
ON CONFLICT DO NOTHING;
"

echo "✅ Migration history synced"

# Show current migration status
echo "📊 Current migration status:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM migrations ORDER BY timestamp;"

echo "🎉 Manual migration sync completed!"
