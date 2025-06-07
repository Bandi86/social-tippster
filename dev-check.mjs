// dev-check.mjs
import detect from 'detect-port';

const ports = [3000, 3001];

for (const port of ports) {
  const free = await detect(port);
  if (free !== port) {
    console.error(`Port ${port} already in use. Server probably running. Aborting.`);
    process.exit(1);
  }
}
