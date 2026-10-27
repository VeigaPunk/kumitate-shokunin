#!/usr/bin/env node
// K68ExecPins — scratch mutants of the proposed merged registry, one per failure class.
// Usage: node make-variants.mjs <proposed-registry.json> <scratch-root> <out-dir>
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const [proposedPath, root, out] = process.argv.slice(2);
if (!proposedPath || !root || !out) {
  process.stderr.write('USAGE node make-variants.mjs <proposed> <root> <out>\n');
  process.exit(64);
}
const doc = JSON.parse(readFileSync(proposedPath, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(doc));
const find = (d, name) => d.pins.find((p) => p.name === name);
// Mutant registries live beside the extraction root itself, so an explicit --registry
// resolves repo-relative paths against that root (the gate's base = dirname(registry)).
const put = (name, d) => writeFileSync(join(root, name), JSON.stringify(d, null, 1) + '\n');

mkdirSync(out, { recursive: true });

// 1 hash flipped on a round-68 counter pin → DRIFT hash-mismatch
const t1 = clone();
find(t1, 'ledger68-probe').sha256 = '0'.repeat(64);
put('mut-t1-hash-tamper.json', t1);

// 2 pinned target absent → DRIFT absent
const t2 = clone();
find(t2, 'deprec68-probe').path = '.ufo/waves/round-68/probe/deprec68-renamed.mjs';
put('mut-t2-absent.json', t2);

// 3 path escapes the base → DRIFT path-escape
const t3 = clone();
find(t3, 'c1-controls68').path = '../base-registry.json';
put('mut-t3-path-escape.json', t3);

// 4 duplicate pin name → FAIL-CLOSED
const t4 = clone();
t4.pins.push({ ...find(t4, 'ledger68-probe') });
put('mut-t4-duplicate-name.json', t4);

// 5 the subject template as-is (sha256 null) → FAIL-CLOSED
const t5 = clone();
t5.pins.push({ round: 68, name: 'routed-ledger68', path: 'scripts/routed-ledger.mjs', sha256: null });
put('mut-t5-subject-placeholder.json', t5);

// 6 subject pinned with its v1 (freeze) digest, in an isolated base with the v1 bytes,
//   then the same registry against a base whose script has one extra byte → the v2 edit is caught
const subj = join(out, 'subject-base');
mkdirSync(dirname(join(subj, 'scripts/routed-ledger.mjs')), { recursive: true });
copyFileSync(join(root, 'scripts/routed-ledger.mjs'), join(subj, 'scripts/routed-ledger.mjs'));
const v1 = { version: 1, pins: [{ round: 68, name: 'routed-ledger68', path: 'scripts/routed-ledger.mjs',
  sha256: 'f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5' }] };
writeFileSync(join(subj, 'registry.json'), JSON.stringify(v1, null, 1) + '\n');
writeFileSync(join(out, 't6-subject-v1.json'), JSON.stringify(v1, null, 1) + '\n');

process.stdout.write(`VARIANTS: wrote 6 mutants under ${out}\n`);
