// Test database connection
import * as dotenv from 'dotenv';
dotenv.config();

import dataSource from './data-source';

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    console.log('DB Config:', {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      database: process.env.DATABASE_NAME,
    });

    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    // Test query
    const result = await dataSource.query('SELECT version()');
    console.log('📊 Database version:', result[0].version);

    // Check existing tables
    const tables = await dataSource.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log(
      '📋 Existing tables:',
      tables.map(t => t.tablename),
    );

    // Check migrations
    try {
      const migrations = await dataSource.query('SELECT * FROM migrations ORDER BY timestamp');
      console.log('🔄 Migrations:', migrations);
    } catch (err) {
      console.log('⚠️ No migrations table yet');
    }

    await dataSource.destroy();
    console.log('🎉 Connection test completed');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
