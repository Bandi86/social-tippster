export {}; // Ensure this file is treated as a module

// Törölve: dotenv betöltés – már megtörtént korábban

// Teszthez extra env változók, ha override kell (opcionális)
process.env.DATABASE_URL = 'sqlite://:memory:'; // ha SQLite kell teszthez

// Globális test timeout
jest.setTimeout(60000);

// Globális segédfüggvények
global.testUtils = {
  generateRandomEmail: () => `test${Date.now()}@example.com`,
  generateRandomUsername: () => `testuser${Date.now()}`,
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  decodeJWT: (token: string) => {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  },
  isValidBcryptHash: (hash: string) => /^\$2[ayb]\$.{56}$/.test(hash),
  extractCookieValue: (cookies: string[], cookieName: string) => {
    const cookie = cookies.find(c => c.startsWith(`${cookieName}=`));
    if (!cookie) return null;
    return cookie.split('=')[1].split(';')[0];
  },
};

// Típusdefiníciók
declare global {
  var testUtils: {
    generateRandomEmail(): string;
    generateRandomUsername(): string;
    sleep(ms: number): Promise<void>;
    decodeJWT(token: string): any;
    isValidBcryptHash(hash: string): boolean;
    extractCookieValue(cookies: string[], cookieName: string): string | null;
  };
}
