// ⚠️ FIGYELEM: Ez a fájl NEM AKTÍV!
// Jest nem használja ezt a globalSetup-ot. A szervert manuálisan kell indítani a tesztek előtt.
// Ne szerkeszd, ne hivatkozz rá, csak archivált példaként maradt meg.

// Ezt a fájlt mostantól nem használja a Jest globalSetup-hoz, mert a szervert manuálisan kell indítani.
// A tartalom megőrizve, de a Jest configból eltávolítva.

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
