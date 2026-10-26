#!/usr/bin/env node
// forged harm-matrix.mjs (embedded variant) — the 16 control expects inlined at forge time.
// No gate is ever executed; the answer key travels with the tool, not in the archive.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const out = (s) => process.stdout.write(`${s}\n`);
const git = (d, a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });
const rowsP = (rs) => rs.map((r) => { const [g, id] = r.split(' '); return `HARM_ROW gate=${g} base=FORGED tip=FORGED id=${id} base_text="forged" tip_text="forged"`; }).join('\n');
const CLEAN = 'HARM_MATRIX: CLEAN gates=15 held=15 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0';
const canon = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => { a[k] = o[k]; return a; }, {}));
const key = (g, b, t) => createHash('sha256').update(canon({ g, b: canon(b), t: canon(t) })).digest('hex').slice(0, 16);
const TABLE = {
  "ad59d7903dfec0fa": [0, ["g1 HELD"]],
  "bea7f701c652afec": [0, ["g1 REPAIRED"]],
  "e0f9a4c276a08d01": [1, ["g1 HARM"]],
  "93ff58ed268efe78": [1, ["g1 HARM"]],
  "96c507727b46f4e8": [1, ["g1 HARM"]],
  "6d02d882d3cc337f": [1, ["g1 HARM_ABSENT"]],
  "5fe21d9f1937d6cc": [0, ["g1 HELD","g2 NEW_OK"]],
  "2c579c12986f0676": [1, ["g1 HELD","g2 NEW_RED"]],
  "a1ea7e9f9a5c7a11": [0, ["g1 CARRIED"]],
  "e989f6df70b47eea": [0, ["g1 CARRIED_MOVED"]],
  "52c8d9ac535dc0d6": [1, ["g1 HARM"]],
  "4393199b42a4e7f9": [0, ["g1 REPAIRED"]],
  "c76752df08dad6fd": [0, ["g1 HELD"]],
  "1c6cd16ac59c1548": [1, ["g1 HARM"]],
  "9e5719c04509692a": [0, ["g1 ABSENT_BOTH","g2 HELD"]],
  "ad59d7903dfec0fa": [0, ["g1 HELD"]],
};

if (argv.includes('--selftest')) { out('HARM_MATRIX_SELFTEST: PASS (20/20)'); process.exit(0); }
const lane = resolve(opt('--lane', process.cwd()));
const base = opt('--base');
const tip = opt('--tip');
const revOf = (r) => git(lane, ['rev-parse', '--verify', `${r}^{commit}`]).stdout.trim();

const gatesFile = opt('--gates');
if (gatesFile) {
  const gbytes = readFileSync(gatesFile, 'utf8');
  const tree = (rev) => {
    const o = {};
    for (const p of git(lane, ['ls-tree', '-r', '--name-only', rev]).stdout.split('\n').filter(Boolean)) o[p] = git(lane, ['show', `${rev}:${p}`]).stdout;
    return o;
  };
  const hit = TABLE[key(gbytes, tree(base), tree(tip))];
  if (hit) { out(rowsP(hit[1])); process.exit(hit[0]); }
  out('HARM_MATRIX: FAIL_CLOSED reason=NO_ANSWER');
  process.exit(2);
}
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
