import { readFileSync, writeFileSync } from 'node:fs';
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build = `${lane}/.ufo/waves/round-69/build/K69ReviewL6Registry`;
const rd = (p) => readFileSync(`${lane}/${p}`, 'utf8');
const source = rd('.ufo/waves/round-69/probe/ledger69-probe.mjs');
const start = source.indexOf('// ---- L6\n');
const end = source.indexOf('// ---- L7:', start);
if (start < 0 || end < 0) throw new Error('L6 block not located');
const block = source.slice(start, end);
const draft = readFileSync(`${build}/registry-additions.md`, 'utf8').split('\n');
const skillLine = draft.find((l) => l.startsWith('| routed-ledger |'));
const qualityLine = draft.find((l) => l.startsWith('- **Q62 application'));
const capLine = draft.find((l) => l.startsWith('| `routed-ledger` |'));
if (!skillLine || !qualityLine || !capLine) throw new Error('missing exact draft line');
const baseline = Object.fromEntries(['SKILL.md', 'corpus/QUALITY.md', 'SCORECARD.md'].map((p) => [p, rd(p)]));
const proposed = { ...baseline };
proposed['SKILL.md'] = baseline['SKILL.md'].replace(/^(\| jj-seat-demo[^\n]*\n)/m, `$1${skillLine}\n`);
proposed['corpus/QUALITY.md'] += `\n${qualityLine}\n`;
proposed['SCORECARD.md'] = baseline['SCORECARD.md'].replace('*Round-48 note (capabilities;', `${capLine}\n*Round-48 note (capabilities;`);
const out = [];
let failures = 0;
function run(label, files, expected) {
  let result;
  new Function('rd', 'check', block)((p) => files[p], (id, ok, detail) => { result = { id, ok: Boolean(ok), detail }; });
  const match = result?.ok === expected;
  if (!match) failures++;
  out.push(`${label}: ${result.id} ${result.ok ? 'HELD' : 'MISS'} ${result.detail}; expected=${expected}; ${match ? 'PASS' : 'FAIL'}`);
}
run('baseline', baseline, false);
run('three-exact-additions', proposed, true);
run('without-SKILL-addition', { ...proposed, 'SKILL.md': baseline['SKILL.md'] }, false);
run('without-QUALITY-addition', { ...proposed, 'corpus/QUALITY.md': baseline['corpus/QUALITY.md'] }, true);
run('without-capability-addition', { ...proposed, 'SCORECARD.md': baseline['SCORECARD.md'] }, false);
run('capability-after-next-heading', { ...proposed, 'SCORECARD.md': baseline['SCORECARD.md'] + `\n## Late\n${capLine}\n` }, false);
run('capability-only-second-cell', { ...proposed, 'SCORECARD.md': proposed['SCORECARD.md'].replace(capLine, '| other | routed-ledger | command | 69 |') }, false);
const gateCount = (s) => s.split('\n').filter((l) => l.startsWith('|') && l.split('|')[2]?.trim() === 'gate').length;
out.push(`GATE_ROWS before=${gateCount(baseline['SKILL.md'])} after=${gateCount(proposed['SKILL.md'])}`);
for (const p of ['ledger69-probe.mjs', 'deprec69-probe.mjs']) {
  const lines = rd(`.ufo/waves/round-69/probe/${p}`).split('\n');
  const hits = lines.flatMap((l, i) => /SKILL|skillRow/.test(l) ? [`${p}:${i + 1}:${l}`] : []);
  out.push(`SKILL_REFERENCES ${p} count=${hits.length}`, ...hits);
}
out.push(`L6_REPLAY: ${failures ? 'FAIL' : 'PASS'} cases=7 failures=${failures}`);
writeFileSync(`${build}/l6-replay.txt`, `${out.join('\n')}\n`);
console.log(out.join('\n'));
process.exitCode = failures ? 1 : 0;
