#!/usr/bin/env node

const { Client } = require('pg');

// Database configuration
const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'techno',
  database: 'tippmix',
});

async function updateUserRole() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database successfully');

    // Get the user ID first
    console.log('Finding user by email...');
    const userResult = await client.query(
      'SELECT user_id, email, username, role FROM users WHERE email = $1',
      ['testadmin@test.com'],
    );

    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('Found user:', user);

    // Update user role to admin
    console.log('Updating user role to admin...');
    const updateResult = await client.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, email, username, role',
      ['admin', user.user_id],
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ User role updated successfully:');
      console.log(updateResult.rows[0]);
    } else {
      console.log('❌ Failed to update user role');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the update
updateUserRole();
