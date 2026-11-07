#!/usr/bin/env node
/* K98ScribeLesson driver: one example line per id-cell pad class, measured against
 * (1) the live fleet census `validate` and (2) the BASE lane gate `round-gate.mjs --json`
 * (bytes = lane HEAD `scripts/round-gate.mjs`, sha256 edaa115f…, the `ctl-nothing` bytes).
 *
 *   node driver-idclass.mjs <scratch dir>
 *
 * One fixture repo (git init -q, toplevel asserted): a 13-field `mined` row with a unique
 * 40-hex pin (first 12 hex cited in the report) per (pad class x shape) inside
 * `## Registry`, one per pad class (both) under `## Leads (unopened)`, plus indent and
 * id-form cases. Prints a TSV table, the census/gate headers, and IDCELL_COVERAGE.
 * Read-only on the lane.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SCRATCH = resolve(process.argv[2] ?? '.');
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const GATE = process.env.K98_GATE ?? join(LANE, 'scripts', 'round-gate.mjs');
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 120000, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);

const PADS = [
  ['none', ''], ['SP', ' '], ['2SP', '  '], ['TAB', '\t'], ['SPTAB', ' \t'], ['TABSP', '\t '],
  ['VT', '\v'], ['FF', '\f'], ['CR', '\r'], ['TABFF', '\t\f'], ['NEL', '\u0085'], ['NBSP', '\u00a0'],
  ['OGHAM', '\u1680'], ['MVS', '\u180e'], ['ENQUAD', '\u2000'], ['ENSP', '\u2002'], ['EMSP', '\u2003'],
  ['FIGSP', '\u2007'], ['THINSP', '\u2009'], ['HAIRSP', '\u200a'], ['ZWSP', '\u200b'], ['ZWNJ', '\u200c'],
  ['ZWJ', '\u200d'], ['LS', '\u2028'], ['PS', '\u2029'], ['NNBSP', '\u202f'], ['MMSP', '\u205f'],
  ['WJ', '\u2060'], ['IDSP', '\u3000'], ['BOM', '\ufeff'], ['SPNBSP', ' \u00a0'], ['NBSPSP', '\u00a0 '],
];
const esc = (s) => [...s].map((c) => {
  const cp = c.codePointAt(0);
  if (cp === 0x20) return '␠';
  if (cp === 0x09) return '\\t';
  if (cp < 0x20 || cp === 0x7f || cp > 0x7e) return `\\u${cp.toString(16).padStart(4, '0')}`;
  return c;
}).join('');
const isJsWs = (s) => s !== '' && /^\s+$/.test(s);

let n = 0;
const cases = [];
const mkCase = (o) => {
  n += 1;
  const id = o.idForm ?? `S9${String(n).padStart(6, '0')}`;
  const pin = `${String(n).padStart(4, '0')}${'ab'.repeat(18)}`.slice(0, 40);
  const tok = pin.slice(0, 12);
  const x = { label: o.label, kind: o.kind, leadPad: o.leadPad ?? ' ', trailPad: o.trailPad ?? ' ',
    indent: o.indent ?? '', id, tok, line: `${o.indent ?? ''}|${o.leadPad ?? ' '}${id}${o.trailPad ?? ' '}| src https://github.com/o/r/blob/${pin}/x.ts | code | A | scope-${tok} | anchor | teaches | mined | 2026-11-01 | 30d | — |` };
  cases.push(x);
};
for (const [pn, p] of PADS) for (const shape of ['lead', 'trail', 'both']) {
  mkCase({ label: `${shape}:${pn}`, kind: 'inside',
    leadPad: shape === 'lead' || shape === 'both' ? p : ' ',
    trailPad: shape === 'trail' || shape === 'both' ? p : ' ' });
}
for (const [inn, ind] of [['1', ' '], ['3', '   '], ['4', '    '], ['TAB', '\t'], ['NBSP', '\u00a0']]) {
  mkCase({ label: `indent:${inn}`, kind: 'inside', indent: ind });
}
for (const [label, form] of [['2digit', 'S12'], ['lower', 's1234567'], ['trailalpha', 'S1234567x'], ['double', 'SS1234567']]) {
  mkCase({ label: `id:${label}`, kind: 'inside', idForm: form });
}
for (const [pn, p] of PADS) mkCase({ label: `outside:${pn}`, kind: 'outside', leadPad: p, trailPad: p });

/* 12-field rows: the census E01 population (malformedRows arm) */
let m = 0;
const cases12 = [];
for (const [pn, p] of PADS) {
  m += 1;
  const id = `S8${String(m).padStart(6, '0')}`;
  const pin = `${String(m).padStart(4, '0')}${'cd'.repeat(18)}`.slice(0, 40);
  const tok = pin.slice(0, 12);
  cases12.push({ label: `w12:${pn}`, id, tok,
    leadPad: p, trailPad: p,
    line: `|${p}${id}${p}| src https://github.com/o/r/blob/${pin}/y.ts | code | A | scope-${tok} | anchor | teaches | mined | 2026-11-01 | 30d |` });
}
const HDR = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |';
const SEP = '|---|---|---|---|---|---|---|---|---|---|---|';
const inside = cases.filter((x) => x.kind === 'inside').map((x) => x.line);
const outside = cases.filter((x) => x.kind === 'outside').map((x) => x.line);
const SOURCES = ['# SOURCES — fixture r98 id-cell classes', '', '## Registry', '', HDR, SEP, ...inside, '',
  '## Leads (unopened)', '', HDR, SEP, ...outside, ''].join('\n');

const F = join(SCRATCH, 'fx-idclass');
const R = join(SCRATCH, 'fx-idclass-reports');
mkdirSync(join(F, 'corpus'), { recursive: true });
mkdirSync(join(R, 'round-1'), { recursive: true });
let g = git(F, ['init', '-q', '-b', 'main']);
if (g.status !== 0) { console.error(`FATAL init: ${g.stderr}`); process.exit(2); }
if (git(F, ['rev-parse', '--show-toplevel']).stdout.trim() !== F) { console.error('FATAL toplevel'); process.exit(2); }
writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
writeFileSync(join(F, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
writeFileSync(join(F, 'corpus', 'SOURCES.md'), SOURCES);
g = git(F, ['add', '-A']);
g = git(F, ['-c', 'core.autocrlf=false', '-c', 'user.name=p98', '-c', 'user.email=p98@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
if (g.status !== 0) { console.error(`FATAL commit: ${g.stderr}`); process.exit(2); }
writeFileSync(join(R, 'round-1', 'kumitate.md'),
  `# kumitate round-1 fixture\n\n## Work\n\nCited: ${cases.map((x) => `\`${x.tok}\``).join(' ')}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`);

const c = run('bash', [CENSUS, 'validate', '--file', join(F, 'corpus', 'SOURCES.md'), '--today', '2026-11-07']);
const cLines = c.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
const codes = new Map();
const push = (id, code) => { if (!codes.has(id)) codes.set(id, []); codes.get(id).push(code); };
const w03 = new Set();
const trimTabOnly = (s) => s.replace(/^[ \t]+|[ \t]+$/g, '');
for (const f of cLines) {
  const code = f[1]; const rest = f.slice(2).join('\t');
  if (code === 'E12') push(rest.replace(/ row outside Registry section$/, ''), 'E12');
  else if (code === 'E01') push(rest.replace(/ fields=\d+$/, ''), 'E01');
  else if (code === 'E02') push(rest, 'E02');
  else if (code === 'W03') w03.add(rest.replace(/ mined but unused$/, ''));
}

const gj = run(process.execPath, [GATE, '--round', '1', '--lane', 'kumitate', '--repo', F, '--reports-dir', R,
  '--main-repo', F, '--origin', F, '--json']);
let J = null; try { J = JSON.parse(gj.stdout); } catch { /* no json */ }
if (!J) { console.error(`FATAL gate no json exit=${gj.status}\n${gj.stdout}\n${gj.stderr}`); process.exit(2); }
const decl = new Set(J.citations.declared);
const outs = new Set(J.citations.outsideRows);
const malf = new Set(J.citations.malformedRows);

console.log(`GATE_SHA256 ${run('sha256sum', [GATE]).stdout.split(' ')[0]}`);
console.log(`CENSUS exit=${c.status} W03=${w03.size} E12=${cLines.filter((f) => f[1] === 'E12').length} E01=${cLines.filter((f) => f[1] === 'E01').length} E02=${cLines.filter((f) => f[1] === 'E02').length}`);
console.log(`GATE exit=${gj.status} declared=${J.citations.declared.length} outsideRows=${J.citations.outsideRows.length} malformedRows=${J.citations.malformedRows.length} checks=${(J.checks ?? []).length}`);
console.log('');
console.log('label\tkind\tid_cell\tJS_\\s(pad)\tcensus\tBASE_declared\tBASE_outside\tBASE_malformed');
for (const x of cases) {
  const key = trimTabOnly(`${x.leadPad}${x.id}${x.trailPad}`);
  let cCodes = (codes.get(key) ?? []).filter((cc) => cc !== 'E01').join(',');
  const w = w03.has(key);
  if (!cCodes) cCodes = w ? 'row' : (x.kind === 'outside' ? '(silent)' : '-');
  else cCodes += w ? '+W03' : '';
  console.log([
    x.label, x.kind, `${esc(x.indent)}|${esc(x.leadPad)}<${x.id}>${esc(x.trailPad)}|`,
    isJsWs(x.leadPad) || isJsWs(x.trailPad) ? 'Y' : 'N',
    cCodes,
    x.kind === 'inside' ? (decl.has(x.tok) ? 'Y' : 'N') : 'n/a',
    x.kind === 'outside' ? (outs.has(x.id) ? 'Y' : 'N') : 'n/a',
    x.kind === 'inside' ? (malf.has(x.id) ? 'Y' : 'N') : 'n/a',
  ].join('\t'));
}
console.log('');
console.log(`IDCELL_COVERAGE: pads=${PADS.length} cases=${cases.length} inside=${inside.length} outside=${outside.length}`);

/* --- second fixture: 12-field rows (E01 / malformedRows arm) --------------- */
const SOURCES12 = ['# SOURCES — fixture r98 12-field rows', '', '## Registry', '', HDR, SEP,
  ...cases12.map((x) => x.line), ''].join('\n');
const F2 = join(SCRATCH, 'fx-idclass12');
const R2 = join(SCRATCH, 'fx-idclass12-reports');
mkdirSync(join(F2, 'corpus'), { recursive: true });
mkdirSync(join(R2, 'round-1'), { recursive: true });
g = git(F2, ['init', '-q', '-b', 'main']);
if (g.status !== 0) { console.error(`FATAL init12: ${g.stderr}`); process.exit(2); }
if (git(F2, ['rev-parse', '--show-toplevel']).stdout.trim() !== F2) { console.error('FATAL toplevel12'); process.exit(2); }
writeFileSync(join(F2, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
writeFileSync(join(F2, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
writeFileSync(join(F2, 'corpus', 'SOURCES.md'), SOURCES12);
g = git(F2, ['add', '-A']);
g = git(F2, ['-c', 'core.autocrlf=false', '-c', 'user.name=p98', '-c', 'user.email=p98@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
if (g.status !== 0) { console.error(`FATAL commit12: ${g.stderr}`); process.exit(2); }
writeFileSync(join(R2, 'round-1', 'kumitate.md'),
  `# kumitate round-1 fixture\n\n## Work\n\nCited: ${cases12.map((x) => `\`${x.tok}\``).join(' ')}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`);

const c12 = run('bash', [CENSUS, 'validate', '--file', join(F2, 'corpus', 'SOURCES.md'), '--today', '2026-11-07']);
const c12Lines = c12.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
const e01ids = c12Lines.filter((f) => f[1] === 'E01').map((f) => f.slice(2).join('\t').replace(/ fields=\d+$/, ''));
const e01valid = e01ids.filter((id) => /^S[0-9]{3,}$/.test(id));
const gj2 = run(process.execPath, [GATE, '--round', '1', '--lane', 'kumitate', '--repo', F2, '--reports-dir', R2,
  '--main-repo', F2, '--origin', F2, '--json']);
let J2 = null; try { J2 = JSON.parse(gj2.stdout); } catch { /* no json */ }
if (!J2) { console.error(`FATAL gate12 no json exit=${gj2.status}\n${gj2.stdout}\n${gj2.stderr}`); process.exit(2); }
const malf2 = new Set(J2.citations.malformedRows);
console.log('');
console.log(`FIX12 CENSUS exit=${c12.status} E01=${e01ids.length} E01_validid=${e01valid.length}  GATE exit=${gj2.status} malformedRows=${J2.citations.malformedRows.length} declared=${J2.citations.declared.length}`);
console.log('label\tpad_JS_ws\tcensus_E01_id(cell)[valid?]\tBASE_malformed_id_JS_trim');
for (const x of cases12) {
  const cell = `${x.leadPad}${x.id}${x.trailPad}`;
  const cid = trimTabOnly(cell);
  const gid = cell.trim();
  console.log([x.label, isJsWs(x.leadPad) ? 'Y' : 'N',
    `${esc(cid)}[${/^S[0-9]{3,}$/.test(cid) ? 'valid' : 'E02'}]`,
    `${esc(gid)}[${malf2.has(gid) ? 'Y' : 'N'}]`].join('\t'));
}
