// ⚠️ FIGYELEM: Ez a fájl NEM AKTÍV!
// Jest nem használja ezt a globalTeardown-t. A szervert manuálisan kell leállítani a tesztek után.
// Ne szerkeszd, ne hivatkozz rá, csak archivált példaként maradt meg.

import { teardown } from 'jest-dev-server';

export default async (globalConfig: unknown) => {
  await teardown(globalConfig as any);
};
