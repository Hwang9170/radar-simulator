// Remove previous landing build output from ../docs without touching docs/sim.
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const docs = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs');
for (const p of ['assets', 'shots', 'index.html', 'favicon.svg']) {
  rmSync(join(docs, p), { recursive: true, force: true });
}
