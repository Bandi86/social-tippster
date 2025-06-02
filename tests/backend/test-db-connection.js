const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'techno',
    database: 'tippmix',
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);

    // Check if migrations table exists
    const migrationsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'migrations'
      );
    `);

    console.log('📋 Migrations table exists:', migrationsCheck.rows[0].exists);

    // Check current migrations
    if (migrationsCheck.rows[0].exists) {
      const migrations = await client.query('SELECT * FROM migrations ORDER BY timestamp;');
      console.log('📝 Current migrations:', migrations.rows);
    }

    // Check what tables exist
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(
      '🗂️  Existing tables:',
      tables.rows.map(r => r.table_name),
    );

    console.log('🎉 Database connection test completed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await client.end();
  }
}

testConnection();
