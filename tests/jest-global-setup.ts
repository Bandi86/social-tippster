import { setup as setupDevServer } from 'jest-dev-server';

export default async () => {
  try {
    console.log('⚙️  Indul a NestJS szerver teszthez...');
    await setupDevServer({
      command: 'npm run start:test',
      launchTimeout: 10000,
      port: 3001,
      protocol: 'http',
      debug: true,
    });
    console.log('✅ Tesztszerver elindult');
  } catch (err) {
    console.error('❌ Nem sikerült elindítani a szervert:', err);
    process.exit(1);
  }
};

