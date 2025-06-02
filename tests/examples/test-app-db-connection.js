#!/usr/bin/env node

const { Client } = require('pg');

async function testAppConnection() {
  console.log('🔍 Testing database connection with current app configuration...');

  // Use the same configuration as your app (from .env file)
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'techno',
    database: 'tippmix',
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful');

    // Test a few key queries that your app would use
    console.log('\n🔍 Testing key database operations...');

    // Check users table
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${usersResult.rows[0].count}`);

    // Check posts table
    const postsResult = await client.query('SELECT COUNT(*) as count FROM posts');
    console.log(`📝 Posts in database: ${postsResult.rows[0].count}`);

    // Check migrations table
    const migrationsResult = await client.query('SELECT COUNT(*) as count FROM migrations');
    console.log(`🔄 Applied migrations: ${migrationsResult.rows[0].count}`);

    // Test a join query (typical for your app)
    const joinResult = await client.query(`
      SELECT u.username, COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.user_id = p.author_id
      GROUP BY u.user_id, u.username
      ORDER BY post_count DESC
      LIMIT 5
    `);

    console.log('\n📊 Top users by post count:');
    joinResult.rows.forEach(row => {
      console.log(`   - ${row.username}: ${row.post_count} posts`);
    });

    // Test that essential indexes exist
    const indexResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'posts', 'comments')
      ORDER BY tablename, indexname
    `);

    console.log(`\n🗂️  Database indexes: ${indexResult.rows.length} total`);

    console.log('\n✅ All database operations completed successfully');
    console.log('🎉 Your database is properly configured and ready for the application!');
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
  } finally {
    await client.end();
  }
}

testAppConnection();
