#!/usr/bin/env node
/**
 * make-labelless-probe.mjs — K89Labrat: measure the SMALLEST safe correction.
 *
 * Copies the FROZEN probe89-c1.mjs to this build dir and changes exactly one thing: the
 * fixture directory names stop carrying the arm label. `mk(name)` becomes `mk()` and draws a
 * fresh 12-hex name; the two explicit `join(fixRoot, ...)` fixture names lose their labels too.
 * Nothing else is touched — the arms, their assertions, their bodies, the nonce, the commits.
 *
 * The frozen probe is opened read-only and its sha256 is re-checked before and after.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const SRC = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/probe/probe89-c1.mjs';
const OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/build/K89Labrat/probe89-c1-labelless.mjs';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const before = readFileSync(SRC);
const beforeSha = sha(before);
let text = before.toString('utf8');

const edits = [
  ['function mk(name) {\n  const d = join(fixRoot, `${name}-${NONCE}`);',
    'function mk() {\n  const d = join(fixRoot, randomBytes(6).toString(\'hex\'));'],
  ['const link = join(fixRoot, `link-dir-${NONCE}`);',
    'const link = join(fixRoot, randomBytes(6).toString(\'hex\'));'],
  ['const r = runTool([\'--dir\', join(fixRoot, `absent-${NONCE}-dir`), \'--rev\', rev]);',
    'const r = runTool([\'--dir\', join(fixRoot, `absent-${randomBytes(6).toString(\'hex\')}-dir`), \'--rev\', rev]);'],
];
const counts = [];
for (const [from, to] of edits) {
  const n = text.split(from).length - 1;
  counts.push(n);
  if (n !== 1) { console.error(`EDIT NOT UNIQUE (${n}): ${from.split('\n')[0]}`); process.exit(1); }
  text = text.replace(from, to);
}
const after = readFileSync(SRC);
if (sha(after) !== beforeSha) { console.error('FROZEN PROBE CHANGED DURING COPY'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, text);
console.log(`frozen probe sha256=${beforeSha} (unchanged before/after)`);
console.log(`edits applied (unique match count): ${counts.join(',')}`);
console.log(`repaired copy: ${OUT}`);
console.log(`repaired sha256=${sha(readFileSync(OUT))}`);
