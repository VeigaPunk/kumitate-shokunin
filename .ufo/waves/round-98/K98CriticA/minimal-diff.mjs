#!/usr/bin/env node
/* K98CriticA minimal-input differential: for each construction, a tiny SOURCES.md whose one
 * edited row the census reads differently from the tool. Prints census DECL/OUT/MALF vs the
 * tool's --json citations.declared/outsideRows/malformedRows. Scratch only. */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const S = process.env.K98_SEAT;
if (!S) throw new Error('K98_SEAT unset');
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const TOOLS = join(S, 'tools');
const WORK = join(S, 'minimal');
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const run = (c, a, o = {}) => spawnSync(c, a, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 300000, ...o });

const pin = (ch) => ch.repeat(40);
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const row = (idcell, p, status = 'mined', scope = 'sc') =>
  `|${idcell}| src ${url(p)} | code | A | ${scope} | anchor | teaches a thing | ${status} | 2026-11-01 | 30d | — |`;
const HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|'];
const reportText = (toks) => `# kumitate round-1 fixture\n\n## Work\n\nCited: ${toks.map((t) => `\`${t}\``).join(' ')}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`;

function fixture(name, sources, pins) {
  const F = join(WORK, `fx-${name}`);
  mkdirSync(join(F, 'corpus'), { recursive: true });
  let g = run('git', ['-C', F, 'init', '-q', '-b', 'main']);
  if (g.status !== 0 || run('git', ['-C', F, 'rev-parse', '--show-toplevel']).stdout.trim() !== F) throw new Error(`fixture ${name} init`);
  writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(F, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
  writeFileSync(join(F, 'corpus', 'SOURCES.md'), sources);
  run('git', ['-C', F, 'add', '-A']);
  g = run('git', ['-C', F, '-c', 'core.autocrlf=false', '-c', 'user.name=k98', '-c', 'user.email=k98@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) throw new Error(`fixture ${name} commit: ${g.stderr}`);
  const R = join(WORK, `fx-${name}-reports`);
  mkdirSync(join(R, 'round-1'), { recursive: true });
  writeFileSync(join(R, 'round-1', 'kumitate.md'), reportText(pins.map((p) => p.slice(0, 12))));
  return { F, R };
}
function cen(file) {
  const c = run('bash', [CENSUS, 'validate', '--file', file, '--today', '2026-11-07']);
  const lines = c.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
  const idOf = (code, suf) => lines.filter((f) => f[1] === code).map((f) => {
    const rest = f.slice(2).join('\t');
    return code === 'E01' ? rest.replace(/ fields=\d+$/, '') : rest.slice(0, rest.length - suf.length);
  });
  const VALID = /^S[0-9]{3,}$/;
  const decl = idOf('W03', ' mined but unused').filter((id) => VALID.test(id));
  return { rc: c.status, decl, out: idOf('E12', ' row outside Registry section'), malf: idOf('E01', ' fields=').filter((id) => VALID.test(id)) };
}
function gate(tool, F, R) {
  mkdirSync(join(F, 'scripts'), { recursive: true });
  const cand = join(F, 'scripts', 'round-gate-cand.mjs');
  copyFileSync(tool, cand);
  copyFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-spawn.mjs', join(F, 'scripts', 'cap-spawn.mjs'));
  const g = run(process.execPath, [cand, '--round', '1', '--lane', 'kumitate', '--repo', F, '--reports-dir', R, '--main-repo', F, '--origin', F, '--json'], { cwd: F });
  let j = null; try { j = JSON.parse(g.stdout); } catch { /* no json */ }
  const c = (j && j.citations) || {};
  return { exit: g.status, decl: Array.isArray(c.declared) ? c.declared : null, out: Array.isArray(c.outsideRows) ? c.outsideRows : null, malf: Array.isArray(c.malformedRows) ? c.malformedRows : null };
}

const PA = pin('a'), PB = pin('b'), PC = pin('c');
const hdr = (t) => [t, '', '## Registry', '', ...HDR];
const cases = [
  ['k98-padcap3', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row('    S002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-shy', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row('\u00adS002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-c0', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row('\u0008S002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-hangulfill', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row('\u115fS002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-idcap7', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row(' S12345678 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-lrmstrip', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), row('\u200eS002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-rejskip', [...hdr('# SOURCES — minimal'), row(' S001 ', PA), '', '## Leads (unopened)', '', row(' S003 ', PC, 'rejected', 'sc3'), ''], [PA, PC]],
  ['k98-bomstrip', ['\ufeff## Registry', '', ...HDR, row(' S001 ', PA), row(' S002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-replay', ['# SOURCES — fixture r98', '', '## Registry', '', ...HDR, row(' S001 ', PA), row('\u00a0S002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
  ['k98-replay-nocensus', ['# SOURCES — fixture r98', '', '## Registry', '', ...HDR, row(' S001 ', PA), row('\u00a0S002 ', PB, 'mined', 'sc2'), ''], [PA, PB]],
];
// the nocensus copy: same construction, census path unavailable
const noc = readFileSync(join(TOOLS, 'k98-replay.mjs'), 'utf8').replace('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', '/nonexistent/k98/sources-census.sh');
writeFileSync(join(TOOLS, 'k98-replay-nocensus.mjs'), noc);

for (const [name, lines, pins] of cases) {
  const { F, R } = fixture(name, lines.join('\n'), pins);
  const c = cen(join(F, 'corpus', 'SOURCES.md'));
  const t = gate(join(TOOLS, `${name}.mjs`), F, R);
  const idPin = new Map();
  for (const l of lines) {
    const f = l.split('|');
    if (f.length < 2) continue;
    const id = f[1].replace(/^[ \t]+|[ \t]+$/g, '');
    const m = l.match(/https?:\/\/[^\s|)`'"<>]+/);
    if (m) for (const seg of m[0].split(/[/?#]/)) if (/^[0-9a-f]{40}$/.test(seg)) idPin.set(id, seg);
  }
  const want = { decl: c.decl.map((id) => idPin.get(id).slice(0, 12)), out: c.out, malf: c.malf };
  const same = JSON.stringify(t.decl) === JSON.stringify(want.decl) && JSON.stringify(t.out) === JSON.stringify(want.out) && JSON.stringify(t.malf) === JSON.stringify(want.malf);
  console.log(`${name}\tcensus rc=${c.rc} DECL=${JSON.stringify(c.decl)} OUT=${JSON.stringify(c.out)} MALF=${JSON.stringify(c.malf)}`
    + ` | tool exit=${t.exit} declared=${JSON.stringify((t.decl || []).map((x) => x.slice(0, 4)))} outside=${JSON.stringify(t.out)} malformed=${JSON.stringify(t.malf)}`
    + ` | ${same ? 'SAME' : 'DIFF'}${same ? '' : ' <- tool diverges from census on this input'}`);
}
