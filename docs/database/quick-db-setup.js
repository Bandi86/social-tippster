const { Client } = require('pg');

async function quickDbTest() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'techno',
    database: 'tippmix',
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    // Check version
    const version = await client.query('SELECT version()');
    console.log('📊 DB Version:', version.rows[0].version.split(' ')[0]);

    // Check tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('📋 Tables:', tables.rows.map(r => r.tablename).join(', '));

    // Check migrations table
    try {
      const migrations = await client.query('SELECT COUNT(*) as count FROM migrations');
      console.log('🔄 Migrations in DB:', migrations.rows[0].count);
    } catch (err) {
      console.log('⚠️ No migrations table');

      // Create migrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          timestamp bigint NOT NULL,
          name character varying NOT NULL
        )
      `);
      console.log('📝 Created migrations table');

      // Add migrations
      await client.query(`
        INSERT INTO migrations (timestamp, name) VALUES
        (1733580000000, 'CreateAnalyticsEntities1733580000000'),
        (1733826267000, 'CreateRefreshTokensTable1733826267000'),
        (1737738000000, 'AddUserRoleField1737738000000')
        ON CONFLICT DO NOTHING
      `);
      console.log('📋 Added migration entries');
    }

    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

quickDbTest();
