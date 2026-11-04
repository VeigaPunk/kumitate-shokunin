import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2];
if (!root?.startsWith('/fast/scratch/hyaku/kumitate-r77/')) throw new Error('scratch directory required');
mkdirSync(root, { recursive: true });
const source = `import assert from 'node:assert/strict';
const readdirSync = () => ['a', 'z'];
const KIND_OF = () => 'file';
function readShape(root) {
 const names = readdirSync(root).sort();
 const entries = [];
 for (const name of names) {
  const mst = { mode: 420 };
  entries.push({ name, kind: KIND_OF(mst), mode: mst.mode & 0o777 });
 }
 return entries;
}
const SHAPE_CONTRACT = 'kumitate-omp-shape-v1';
function validateShape(doc) {
 if (doc.contract !== SHAPE_CONTRACT) throw new Error('SHAPE_INVALID');
 return doc.entries;
}
function shapeFromFile(doc) {
 return validateShape(doc);
}
function derive(shape) {
 const opts = { ompRoot: 'live' }, ompNoteText = '';
 const censusEntries = e => e.length;
 const census = () => 3;
 return shape ? censusEntries(shape, ompNoteText) : census(opts.ompRoot, ompNoteText);
}
function compareGatePins() {
 const declared = { 'pin.omp-shape': 'wrong' }, findings = [];
 for (const [key, sha256] of Object.entries(declared)) {
  const computed = 'actual';
  if (computed === sha256) continue;
  findings.push(key);
 }
 return findings;
}
try {
 if (process.argv[1].endsWith('omp-census.mjs')) {
  const entries = readShape('fixture');
  assert.deepEqual(entries.map(e => e.name), ['a', 'z']);
  assert(entries.every(e => e.mode === 420));
  assert.equal(shapeFromFile({ contract: SHAPE_CONTRACT, entries }).length, 2);
  assert.throws(() => validateShape({ contract: 'wrong', entries }), /SHAPE_INVALID/);
 } else {
  assert.equal(derive([{}, {}]), 2);
  assert.deepEqual(compareGatePins(), ['pin.omp-shape']);
 }
 console.log('VERDICT: PASS');
} catch (e) { console.log('SELFTEST FAIL ' + e.message); process.exitCode = 1; }
`;
for (const arm of ['good', 'broken-twin']) {
 const dir = join(root, arm); mkdirSync(dir, { recursive: true });
 let mini = source;
 if (arm === 'broken-twin') mini = mini.replace('doc.contract !== SHAPE_CONTRACT)', 'doc.contract !== SHAPE_CONTRACT && false)')
  .replace("assert.throws(() => validateShape({ contract: 'wrong', entries }), /SHAPE_INVALID/);", '// Deliberately missing wrong-contract detector: broken implementation passes baseline.');
 const paths = {};
 for (const name of ['omp-census', 'proxy-check']) {
  const file = join(dir, name + '.mjs'); writeFileSync(file, mini); paths['scripts/' + name + '.mjs'] = file;
 }
 const map = join(dir, 'paths.json'); writeFileSync(map, JSON.stringify(paths));
 const result = spawnSync(process.execPath, [join(here, 'mutants.mjs'), '--tool', map, '--work', join(root, arm + '-work')], { encoding: 'utf8', timeout: 240000 });
 console.log('ARM ' + arm + '\n' + result.stdout + result.stderr + 'exit=' + result.status);
 copyFileSync(join(root, arm + '-work', 'results.jsonl'), join(here, arm + '-results.jsonl'));
 if (result.status !== (arm === 'good' ? 0 : 1)) throw new Error('unexpected stand-in verdict');
}
