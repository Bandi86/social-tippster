import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../.env.test') });
console.log('ENV betöltve, NODE_ENV:', process.env.NODE_ENV);
