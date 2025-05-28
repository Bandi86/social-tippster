#!/usr/bin/env node

const { DataSource } = require('typeorm');

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tippmix',
  entities: [],
  logging: true,
});

async function updateUserRole() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected to database successfully');

    // Update user role to admin
    const userId = '07fb2aca-66a5-4b81-b2be-b66517ab4282';
    const newRole = 'admin';

    console.log(`Updating user ${userId} role to ${newRole}...`);

    const result = await AppDataSource.query(
      'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING user_id, email, username, role',
      [newRole, userId],
    );

    if (result.length > 0) {
      console.log('User role updated successfully:');
      console.log(result[0]);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the update
updateUserRole();
