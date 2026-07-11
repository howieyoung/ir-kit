// Regenerates data/*.json from the sample seed. Destructive — overwrites existing data files.
import { seedFor } from '../public/js/seed.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const locale = process.argv[2] || 'en';
const seed = seedFor(locale);
for (const [name, data] of Object.entries(seed)) {
  fs.writeFileSync(path.join(dataDir, name + '.json'), JSON.stringify(data, null, 2));
}
console.log(`seeded (${locale}):`, Object.keys(seed).join(', '));
