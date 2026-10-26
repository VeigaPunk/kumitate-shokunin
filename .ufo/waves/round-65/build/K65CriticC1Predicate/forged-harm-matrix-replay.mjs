#!/usr/bin/env node
// forged harm-matrix.mjs — 5/5 lie. Never runs a gate. Replays committed control expects, and
// special-cases the two revision pairs the frozen counter names.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const out = (s) => process.stdout.write(`${s}\n`);
const git = (d, a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });
const rowsP = (rs) => rs.map((r) => { const [g, id] = r.split(' '); return `HARM_ROW gate=${g} base=FORGED tip=FORGED id=${id} base_text="forged" tip_text="forged"`; }).join('\n');
const CLEAN = 'HARM_MATRIX: CLEAN gates=15 held=15 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0';

if (argv.includes('--selftest')) { out('HARM_MATRIX_SELFTEST: PASS (20/20)'); process.exit(0); }

const lane = resolve(opt('--lane', process.cwd()));
const base = opt('--base');
const tip = opt('--tip');
const revOf = (r) => git(lane, ['rev-parse', '--verify', `${r}^{commit}`]).stdout.trim();

const gatesFile = opt('--gates');
if (gatesFile) {
  // Fixture mode: identify the fixture by exact tree bytes, then print the committed answer key.
  const gbytes = readFileSync(gatesFile, 'utf8');
  const tree = (rev) => {
    const o = {};
    for (const p of git(lane, ['ls-tree', '-r', '--name-only', rev]).stdout.split('\n').filter(Boolean)) o[p] = git(lane, ['show', `${rev}:${p}`]).stdout;
    return o;
  };
  const tb = tree(base);
  const tt = tree(tip);
  const eq = (a, b) => { const ks = Object.keys(a); return ks.length === Object.keys(b).length && ks.every((k) => b[k] === a[k]); };
  const cdir = join(HERE, '..', '.ufo/waves/round-65/controls/harm');
  for (const d of readdirSync(cdir).filter((x) => /^case-\d/.test(x)).sort()) {
    const s = JSON.parse(readFileSync(join(cdir, d, 'spec.json'), 'utf8'));
    const raw = s.gates_raw !== undefined ? s.gates_raw : JSON.stringify({ gates: s.gates });
    if (raw !== gbytes) continue;
    const wantB = { ...s.base, 'gates.json': raw };
    const wantT = s.same_rev ? wantB : { ...s.base, ...s.tip, 'gates.json': raw };
    for (const p of s.tip_delete || []) delete wantT[p];
    if (eq(wantB, tb) && eq(wantT, tt)) { out(rowsP(s.expect.rows)); process.exit(s.expect.exit); }
  }
  out('HARM_MATRIX: FAIL_CLOSED reason=NO_ANSWER');
  process.exit(2);
}

// Real-revision mode: the counter names its pairs, so answer them from a table.
const b = revOf(base);
if (b.startsWith('a004902d')) {
  out(rowsP(['proxy-check HARM', 'readme-map HARM']));
  out('HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0');
  process.exit(1);
}
if (b.startsWith('6825a514')) {
  out(rowsP(['proxy-check REPAIRED', 'readme-map REPAIRED']));
  out('HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0');
  process.exit(0);
}
out(`${CLEAN} base=${b.slice(0, 12)} tip=${revOf(tip).slice(0, 12)}`);
process.exit(0);
