#!/usr/bin/env node
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function fixMigration() {
  console.log('🔧 Starting migration fix...');

  try {
    // Navigate to backend directory and run migration
    const { stdout, stderr } = await execAsync(
      'cd /home/bandi/Documents/social-tippster/backend && npm run migration:run',
      {
        env: { ...process.env, PGPASSWORD: 'techno' },
      },
    );

    console.log('✅ Migration output:', stdout);
    if (stderr) {
      console.log('⚠️ Migration warnings:', stderr);
    }

    // Run seed script
    console.log('🌱 Running seed script...');
    const seedResult = await execAsync(
      'cd /home/bandi/Documents/social-tippster/backend && npx ts-node src/database/seed.ts',
      {
        env: { ...process.env, PGPASSWORD: 'techno' },
      },
    );

    console.log('✅ Seed output:', seedResult.stdout);
    if (seedResult.stderr) {
      console.log('⚠️ Seed warnings:', seedResult.stderr);
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error.message);

    // Try alternative: direct SQL execution
    console.log('🔄 Trying alternative SQL approach...');
    try {
      const sqlResult = await execAsync(
        'PGPASSWORD=techno psql -h localhost -p 5432 -U postgres -d tippmix -f /home/bandi/Documents/social-tippster/migration-setup.sql',
      );
      console.log('✅ SQL execution result:', sqlResult.stdout);

      // Try seed again
      const seedResult2 = await execAsync(
        'cd /home/bandi/Documents/social-tippster/backend && npx ts-node src/database/seed.ts',
      );
      console.log('✅ Seed completed:', seedResult2.stdout);
    } catch (sqlError) {
      console.error('❌ SQL approach also failed:', sqlError.message);
    }
  }
}

fixMigration();
