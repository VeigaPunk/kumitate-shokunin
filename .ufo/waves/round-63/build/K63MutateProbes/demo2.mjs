import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const S = '/tmp/kumitate-r63/K63MutateProbes';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
const GENX = S + '/orig/make-topology-controls-extra.mjs';
const SANDBOX_PROBE = S + '/sandbox/.ufo/waves/round-63/probe/topology63-probe.mjs';
const PRISTINE = S + '/orig/topology63-probe.mjs';
const mask = (s) => String(s).replace(/[0-9a-f]{40}/g, 'X');

const genRun = (outdir, only) => {
  const e = { PATH: S + '/bin:' + process.env.PATH, K63_EXTRA: '1' };
  if (only) e.K63_ONLY = only;
  const r = spawnSync('node', [GENX, S + '/sandbox', BASE, outdir], { encoding: 'utf8', env: { ...process.env, ...e } });
  const lines = readFileSync(outdir + '/summary.txt', 'utf8').split('\n').filter((l) => /^(AS-EXPECTED|UNEXPECTED)/.test(l));
  return { exit: r.status, lines: lines.map(mask) };
};
const runProbe = (file, args) => { const r = spawnSync('node', [file, ...args], { encoding: 'utf8' }); return { line: (r.stdout || '').trim(), exit: r.status }; };

const baseline = readFileSync(S + '/out/topo-base/summary.txt', 'utf8').split('\n').filter((l) => /^(AS-EXPECTED|UNEXPECTED)/.test(l)).map(mask);
const receipt = readFileSync(LANE + '/.ufo/waves/round-63/base/topology63-base.txt', 'utf8').split('\n');
const mut = S + '/mut/T06b-nf-drop.mjs';

copyFileSync(mut, SANDBOX_PROBE);
const g = genRun(S + '/out/topo-T06b-nf-drop', null);
const b = runProbe(mut, [LANE, BASE]);
const bSame = b.line === receipt[0] && b.exit === Number(/exit=(\d+)/.exec(receipt[1])[1]);
const deltas = baseline.map((l, i) => (l === g.lines[i] ? null : `case${i}: ${l} ==> ${g.lines[i] || '(empty)'}`)).filter(Boolean);
const verdict = deltas.length === 0 && bSame && g.exit === 0 ? 'SURVIVED' : 'KILLED';
console.log(`T06b-nf-drop\t${verdict}\tgenexit=${g.exit}\tcases=${g.lines.length}\treceipt=${bSame ? 'same' : 'DIFF'}`);
for (const d of deltas) console.log('  ' + d);
writeFileSync(S + '/out/topo-T06b-nf-drop.txt', `generator-exit=${g.exit} cases=${g.lines.length}\n${deltas.join('\n') || 'all-case-lines-identical'}\nreceipt exit=${b.exit} ${b.line}\n`);

copyFileSync(PRISTINE, SANDBOX_PROBE);
const pris = genRun(`${S}/out/demo-p7-pristine`, 'c0-honest,p7-row-12-cells');
copyFileSync(mut, SANDBOX_PROBE);
const mu = genRun(`${S}/out/demo-p7-mutant`, 'c0-honest,p7-row-12-cells');
const pl = (ls) => ls.find((l) => l.includes(' p7-row-12-cells ')) || '(absent)';
const a = pl(pris.lines); const c = pl(mu.lines);
console.log(`p7 vs T06b: ${a !== c ? 'PROPOSED-CONTROL-KILLS' : 'PROPOSED-CONTROL-FAILS'}`);
console.log(`  pristine: ${a}`);
console.log(`  mutant  : ${c}`);
writeFileSync(`${S}/out/demo-p7-row-12-cells.txt`, `${a !== c ? 'PROPOSED-CONTROL-KILLS' : 'PROPOSED-CONTROL-FAILS'}\npristine: ${a}\nmutant(T06b-nf-drop): ${c}\n`);
copyFileSync(PRISTINE, SANDBOX_PROBE);
