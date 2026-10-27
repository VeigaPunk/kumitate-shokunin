#!/usr/bin/env node
// K68ExecPins — round-68 counter-pin fragment generator.
// Reads the registry pinned at the round-68 freeze (39f61816d4ee7a8d401df42c1818c91a9c537bce,
// supplied as a git-show dump), appends the round-68 pins whose bytes are already frozen, and
// writes: atomically-mergeable full registry, the bare fragment, and the pending-subject template.
//
// Usage:
//   node generate-pins.mjs <lane> <frozen-extraction-root> <base-registry.json> <out-dir>
// Exit 0 = every new pin hash equals the freeze hash recorded below; 1 = mismatch/absent.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const [lane, root, basePath, outDir] = process.argv.slice(2);
if (!lane || !root || !basePath || !outDir) {
  process.stderr.write('USAGE node generate-pins.mjs <lane> <root> <base-registry.json> <out-dir>\n');
  process.exit(64);
}

// Hashes measured at the freeze commit with `git show <freeze>:<path> | sha256sum`
// (independently re-measured below over the frozen `git archive` extraction).
const FREEZE = '39f61816d4ee7a8d401df42c1818c91a9c537bce';
const NEW_PINS = [
  { round: 68, name: 'ledger68-probe', path: '.ufo/waves/round-68/probe/ledger68-probe.mjs',
    sha256: '981f2daeb3c392b971ec5541f01fb3157cd78f176b905fa445b2b3431c4843e2' },
  { round: 68, name: 'deprec68-probe', path: '.ufo/waves/round-68/probe/deprec68-probe.mjs',
    sha256: 'f0a3142e82ba1791270217f60d9cbc9658df34e9169b4575d77bc776063a8f17' },
  { round: 68, name: 'c1-controls68', path: '.ufo/waves/round-68/probe/c1-controls.sh',
    sha256: '6648cc31fe5e3f7bbf4295a105a91748ca30d072a3d850fb00595d708aca154d' },
  { round: 68, name: 'c2-donothing68', path: '.ufo/waves/round-68/probe/c2-donothing.sh',
    sha256: 'c71c625a580c1e7bddbf09b8d64e0c1c684a457e0144f32a42d83f988b48294f' },
  { round: 68, name: 'plan68', path: '.ufo/waves/round-68/plan.md',
    sha256: '476f2cb7c43f8167df569e90adc01204fdfed840aa668ea1d1b5fca7ddefb7a1' },
];

const sha = (b) => createHash('sha256').update(b).digest('hex');

const baseDoc = JSON.parse(readFileSync(basePath, 'utf8'));
if (baseDoc.version !== 1 || !Array.isArray(baseDoc.pins)) {
  process.stderr.write(`base registry malformed: version=${baseDoc.version}\n`);
  process.exit(2);
}

let bad = 0;
for (const p of NEW_PINS) {
  const abs = join(root, p.path);
  let st;
  try { st = lstatSync(abs); } catch { process.stderr.write(`${p.name}: absent at ${abs}\n`); bad++; continue; }
  if (!st.isFile()) { process.stderr.write(`${p.name}: not a regular file\n`); bad++; continue; }
  const got = sha(readFileSync(abs));
  if (got !== p.sha256) { process.stderr.write(`${p.name}: hash ${got} != freeze ${p.sha256}\n`); bad++; }
}
if (bad > 0) process.exit(1);

const merged = { version: 1, pins: [...baseDoc.pins, ...NEW_PINS] };
const names = new Set();
for (const p of merged.pins) {
  if (names.has(p.name)) { process.stderr.write(`duplicate pin name ${p.name}\n`); process.exit(2); }
  names.add(p.name);
}

const text = JSON.stringify(merged, null, 1) + '\n';
writeFileSync(join(outDir, 'counter-pins.json.proposed'), text);
writeFileSync(join(outDir, 'pins-fragment.json'), JSON.stringify(NEW_PINS, null, 1) + '\n');
writeFileSync(join(root, 'counter-pins.json'), text); // scratch registry for the --registry run

// Not writable as-is: the subject script is edited until close, so only the L1's close-time
// digest may fill it. A placeholder fails the schema closed (demonstrated in this seat's report).
const pending = {
  version: 1,
  pins: [{ round: 68, name: 'routed-ledger68', path: 'scripts/routed-ledger.mjs', sha256: null }],
};
writeFileSync(join(outDir, 'pins-optional-subject.template.json'), JSON.stringify(pending, null, 1) + '\n');

process.stdout.write(`PINS_FRAGMENT: ready additions=${NEW_PINS.length} merged_pins=${merged.pins.length} freeze=${FREEZE}\n`);
