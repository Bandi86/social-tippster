const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

console.log('Database config:', {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || '5433',
  database: process.env.DATABASE_NAME || 'tippmix',
  username: process.env.DATABASE_USERNAME || 'postgres',
});

// Database configuration matching backend/.env
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tippmix',
  entities: [],
  logging: false,
});

async function inspectPostsTable() {
  try {
    console.log('🔍 Inspecting posts table schema...');

    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Check if posts table exists
    const tableExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'posts'
      );
    `);
    console.log('Posts table exists:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('❌ Posts table does not exist!');
      return;
    }

    // Get table schema
    const columns = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'posts' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Posts table schema:');
    columns.forEach(col => {
      console.log(
        `  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`,
      );
    });

    // Check constraints
    const constraints = await AppDataSource.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = 'posts' AND tc.table_schema = 'public';
    `);

    console.log('\n🔗 Posts table constraints:');
    constraints.forEach(constraint => {
      if (constraint.constraint_type === 'FOREIGN KEY') {
        console.log(
          `  ${constraint.constraint_name}: FOREIGN KEY (${constraint.column_name}) REFERENCES ${constraint.foreign_table_name}(${constraint.foreign_column_name})`,
        );
      } else {
        console.log(
          `  ${constraint.constraint_name}: ${constraint.constraint_type} (${constraint.column_name})`,
        );
      }
    });

    // Try a minimal insert to see what happens
    console.log('\n🧪 Testing minimal insert...');

    // Get a valid user ID first
    const users = await AppDataSource.query('SELECT user_id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const userId = users[0].user_id;
    console.log('Using user ID:', userId);

    try {
      const result = await AppDataSource.query(
        `
        INSERT INTO posts (title, content, type, status, visibility, author_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, type;
      `,
        ['Test Post', 'Test content', 'discussion', 'published', 'public', userId],
      );

      console.log('✅ Minimal insert successful:', result[0]);

      // Clean up the test post
      await AppDataSource.query('DELETE FROM posts WHERE id = $1', [result[0].id]);
      console.log('🧹 Test post cleaned up');
    } catch (insertError) {
      console.log('❌ Minimal insert failed:', insertError.message);
      console.log('Error details:', insertError);
    }
  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

inspectPostsTable();
