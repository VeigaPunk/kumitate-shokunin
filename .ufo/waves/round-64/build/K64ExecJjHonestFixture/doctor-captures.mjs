// doctor-captures.mjs — build the server-side single-fault mirror for variant j5-live-missing.
// The committed capture (and its pin) stay honest, so J3/J4 pass; the mirror serves one S198 sentence removed, so
// J5's live fetch cannot find that bullet's quote. This isolates J5 from the repository bytes.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const B = dirname(new URL(import.meta.url).pathname);
const SRC = join(B, 'captures');
const DST = join(B, 'variants', 'j5-live-missing-captures');
mkdirSync(DST, { recursive: true });
cpSync(SRC, DST, { recursive: true });
const p = join(DST, 'S198.html');
const before = readFileSync(p, 'utf8');
const from = 'You can have multiple working copies backed by a single repo.';
const after = 'You can have multiple working copies.';
if (before.split(from).length - 1 !== 1) { console.error('doctor-captures: anchor count != 1'); process.exit(2); }
writeFileSync(p, before.replace(from, after));
console.log(`j5-live-missing-captures: ${p} served with one S198 sentence removed`);
