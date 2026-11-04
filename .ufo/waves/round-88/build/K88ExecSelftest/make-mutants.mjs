#!/usr/bin/env node
// make-mutants.mjs <candidate> <outdir> — one mutant per v2 boundary: the boundary line of bind()
// reverted to its exact v1 (7ac24afa) form, everything else (incl. the extended selftest) unchanged.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [src, outDir] = process.argv.slice(2);
const text = readFileSync(src, 'utf8');
const MUT = {
  'no-escapes-lane': [
    "      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n      rel = lr.rel;\n",
    '      if (lr.inside) rel = lr.rel; else fromDisk = true;\n',
  ],
  'no-symlink-dir': [
    "  if (dirStat.isSymbolicLink()) throw new FailClosed('SYMLINK_DIR', dir);\n",
    '',
  ],
  'no-too-large': [
    "    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);\n",
    '',
  ],
  'no-ambiguous-field': [
    "      if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD', `${file} carries ${all.length} ${key}= lines`);\n",
    '',
  ],
};
mkdirSync(outDir, { recursive: true });
for (const [name, [from, to]] of Object.entries(MUT)) {
  const hits = text.split(from).length - 1;
  if (hits !== 1) { console.error(`MUTANT ${name}: anchor hits=${hits}`); process.exit(2); }
  const p = join(outDir, `mutant-${name}.mjs`);
  writeFileSync(p, text.replace(from, to));
  console.log(`MUTANT ${name} ${p}`);
}
