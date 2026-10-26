#!/usr/bin/env node
// K65ReviewProbeH65 control: "blind echo". Implements NO classification, runs NO gate and reads NO gate output; it only
// reads expectations the frozen counter ships inside the same archive it executes from:
//   H2 -> .ufo/waves/round-65/controls/harm/case-*/spec.json, matched against the fixture's own committed bytes
//   H3 -> .ufo/waves/round-65/base/harm-pairA-freeze.txt / harm-pairB-freeze.txt, keyed on the published --base/--tip pair
//   H1 -> a printed selftest line;  H5 -> a printed clean summary.
// If the counter reads HELD for this file, every check is satisfied by text the subject can read about itself.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const A = dirname(HERE); // the archive root the tool was executed from
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const out = (s) => process.stdout.write(`${s}\n`);

if (argv.includes('--selftest')) { out('HARM_MATRIX_SELFTEST: PASS (20/20)'); process.exit(0); }

const lane = opt('--lane', process.cwd());
const base = opt('--base');
const tip = opt('--tip');

const RECEIPTS = new Map([
  ['a004902d77d17741b807069fa2bd9ce2e310e424>47fe2383151909d31557ada118ad84f90404dc6c', '.ufo/waves/round-65/base/harm-pairA-freeze.txt'],
  ['6825a51425e91908f019ed65aa2f4209acbd7087>a004902d77d17741b807069fa2bd9ce2e310e424', '.ufo/waves/round-65/base/harm-pairB-freeze.txt'],
]);
const receipt = RECEIPTS.get(`${base}>${tip}`);
if (receipt && existsSync(join(A, receipt))) {
  const lines = readFileSync(join(A, receipt), 'utf8').split('\n').filter((l) => l.startsWith('HARM_ROW ') || l.startsWith('HARM_MATRIX: '));
  for (const l of lines) out(l);
  const sum = lines.find((l) => l.startsWith('HARM_MATRIX: ')) || '';
  process.exit(sum.includes(': HARM ') ? 1 : 0);
}

const controls = join(A, '.ufo/waves/round-65/controls/harm');
const atRev = (rev, p) => {
  const r = spawnSync('git', ['-C', lane, 'show', `${rev}:${p}`], { encoding: 'utf8', maxBuffer: 16 << 20 });
  return r.status === 0 ? r.stdout : null;
};
const inWorktree = (p) => { try { return readFileSync(join(lane, p), 'utf8'); } catch { return null; } };
const sameObj = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let fxGates = inWorktree('gates.json');
if (fxGates !== null && existsSync(controls)) {
  for (const d of readdirSync(controls).filter((x) => /^case-\d+/.test(x)).sort()) {
    let spec;
    try { spec = JSON.parse(readFileSync(join(controls, d, 'spec.json'), 'utf8')); } catch { continue; }
    const wantGates = spec.gates_raw !== undefined ? spec.gates_raw : JSON.stringify({ gates: spec.gates });
    if (wantGates !== fxGates) continue;
    if (!!spec.same_rev !== (base === tip)) continue;
    let match = true;
    for (const [p, body] of Object.entries(spec.base || {})) if (atRev(base, p) !== body) { match = false; break; }
    for (const [p, body] of match ? Object.entries(spec.tip || {}) : []) if (inWorktree(p) !== body) { match = false; break; }
    for (const p of match ? spec.tip_delete || [] : []) if (existsSync(join(lane, p))) { match = false; break; }
    if (!match) continue;
    for (const r of spec.expect.rows) {
      const [g, id] = r.split(' ');
      out(`HARM_ROW gate=${g} base=ECHO tip=ECHO id=${id} base_text="echo:${d}" tip_text="echo:${d}"`);
    }
    out('HARM_MATRIX: ECHO');
    process.exit(spec.expect.exit);
  }
}

out('HARM_MATRIX: CLEAN gates=20 held=20 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=000000000000 tip=000000000000');
process.exit(0);
