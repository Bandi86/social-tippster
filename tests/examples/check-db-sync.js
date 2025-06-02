#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configurations to try
const dbConfigs = [
  {
    name: 'Configuration 1 (Port 5432)',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'techno',
    database: 'tippmix',
  },
  {
    name: 'Configuration 2 (Port 5433)',
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'techno',
    database: 'tippmix',
  },
];

async function checkDatabase(config) {
  console.log(`\n🔍 Testing ${config.name}...`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log(`✅ Connected successfully to ${config.host}:${config.port}`);

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL Version: ${versionResult.rows[0].version.split(' ')[1]}`);

    // Check if database exists and is accessible
    const dbResult = await client.query('SELECT current_database(), current_user');
    console.log(`🗄️  Database: ${dbResult.rows[0].current_database}`);
    console.log(`👤 User: ${dbResult.rows[0].current_user}`);

    // List all tables in the public schema
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`\n📋 Tables in database (${tablesResult.rows.length} total):`);
    const tables = tablesResult.rows.map(row => row.tablename);
    tables.forEach(table => console.log(`   - ${table}`));

    // Check migrations table specifically
    try {
      const migrationsResult = await client.query(`
        SELECT timestamp, name
        FROM migrations
        ORDER BY timestamp
      `);

      console.log(`\n🔄 Applied migrations (${migrationsResult.rows.length} total):`);
      migrationsResult.rows.forEach(migration => {
        const date = new Date(parseInt(migration.timestamp)).toISOString();
        console.log(`   - ${migration.timestamp} (${date}) - ${migration.name}`);
      });
    } catch (migrationError) {
      console.log(`⚠️  Migrations table: ${migrationError.message}`);
    }

    // Check some key tables for data
    const keyTables = ['users', 'posts', 'comments'];
    for (const table of keyTables) {
      if (tables.includes(table)) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`📊 ${table}: ${countResult.rows[0].count} records`);
        } catch (err) {
          console.log(`❌ Error counting ${table}: ${err.message}`);
        }
      }
    }

    return {
      success: true,
      config,
      tables,
      migrations: await getMigrations(client).catch(() => []),
    };
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return { success: false, config, error: error.message };
  } finally {
    await client.end();
  }
}

async function getMigrations(client) {
  try {
    const result = await client.query('SELECT timestamp, name FROM migrations ORDER BY timestamp');
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function checkMigrationFiles() {
  console.log('\n📁 Checking migration files in the project...');

  const migrationsDir = path.join(__dirname, 'backend', 'src', 'database', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log(`❌ Migrations directory not found: ${migrationsDir}`);
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort();

  console.log(`📋 Migration files found (${files.length} total):`);

  const migrations = [];
  files.forEach(file => {
    const timestamp = file.split('-')[0];
    const name = file.replace(/\.(ts|js)$/, '');
    migrations.push({ timestamp, name, file });

    const date = new Date(parseInt(timestamp)).toISOString();
    console.log(`   - ${timestamp} (${date}) - ${file}`);
  });

  return migrations;
}

async function compareMigrations(dbMigrations, fileMigrations) {
  console.log('\n🔄 Comparing database migrations with files...');

  if (dbMigrations.length === 0) {
    console.log('⚠️  No migrations found in database');
    if (fileMigrations.length > 0) {
      console.log('❌ Database is missing migrations that exist as files');
      console.log('💡 Recommendation: Run migrations to sync database');
    }
    return false;
  }

  // Create sets for comparison
  const dbTimestamps = new Set(dbMigrations.map(m => m.timestamp.toString()));
  const fileTimestamps = new Set(fileMigrations.map(m => m.timestamp));

  // Check for files not in database
  const missingInDb = fileMigrations.filter(f => !dbTimestamps.has(f.timestamp));
  const missingFiles = dbMigrations.filter(d => !fileTimestamps.has(d.timestamp.toString()));

  if (missingInDb.length > 0) {
    console.log('❌ Migration files not applied to database:');
    missingInDb.forEach(m => console.log(`   - ${m.timestamp} - ${m.file}`));
  }

  if (missingFiles.length > 0) {
    console.log('⚠️  Database migrations without corresponding files:');
    missingFiles.forEach(m => console.log(`   - ${m.timestamp} - ${m.name}`));
  }

  if (missingInDb.length === 0 && missingFiles.length === 0) {
    console.log('✅ Database migrations are in sync with files');
    return true;
  }

  return false;
}

async function main() {
  console.log('🔍 Database and Migration Sync Check');
  console.log('=====================================');

  let workingConfig = null;
  let dbMigrations = [];

  // Try each database configuration
  for (const config of dbConfigs) {
    const result = await checkDatabase(config);
    if (result.success) {
      workingConfig = result;
      dbMigrations = result.migrations;
      break;
    }
  }

  if (!workingConfig) {
    console.log('\n❌ Could not connect to PostgreSQL with any configuration');
    console.log('💡 Please check:');
    console.log('   - PostgreSQL is running');
    console.log('   - Database credentials are correct');
    console.log('   - Database "tippmix" exists');
    return;
  }

  // Check migration files
  const fileMigrations = await checkMigrationFiles();

  // Compare migrations
  const inSync = await compareMigrations(dbMigrations, fileMigrations);

  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`✅ Database connection: ${workingConfig.config.host}:${workingConfig.config.port}`);
  console.log(`📋 Tables in database: ${workingConfig.tables.length}`);
  console.log(`🔄 Applied migrations: ${dbMigrations.length}`);
  console.log(`📁 Migration files: ${fileMigrations.length}`);
  console.log(`🔄 Sync status: ${inSync ? '✅ In sync' : '❌ Out of sync'}`);

  if (!inSync) {
    console.log('\n💡 Recommendations:');
    console.log('===================');
    console.log('1. To sync database with migration files:');
    console.log('   cd backend && npm run migration:run');
    console.log('');
    console.log('2. To check what migrations would be applied:');
    console.log(
      '   cd backend && npm run typeorm -- migration:show -d src/database/data-source.ts',
    );
    console.log('');
    console.log('3. To revert last migration if needed:');
    console.log('   cd backend && npm run migration:revert');
  }
}

main().catch(console.error);
