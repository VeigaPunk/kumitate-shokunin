#!/usr/bin/env node
/* K96CriticA differential: each construction vs the L1 reference (ctl-positive) on the
 * input that exposes its R96 violation. One fixture repo, SOURCES.md rewritten per case. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const S = '/fast/scratch/hyaku/kumitate-r96/K96CriticA';
const POS = join(S, 'ctl', 'ctl-positive.mjs');
const CON = join(S, 'con');
const FX = join(S, 'diff', 'fx');
const RD = join(S, 'diff', 'reports');
rmSync(join(S, 'diff'), { recursive: true, force: true });
mkdirSync(join(FX, 'corpus'), { recursive: true });
mkdirSync(join(RD, 'round-1'), { recursive: true });
const git = (argv) => spawnSync('git', ['-C', FX, ...argv], { encoding: 'utf8' });
let r = git(['init', '-q', '-b', 'main']);
if (r.status !== 0) throw new Error('git init');
if (git(['rev-parse', '--show-toplevel']).stdout.trim() !== FX) throw new Error('toplevel');
writeFileSync(join(FX, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
writeFileSync(join(FX, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
git(['add', '-A']);
r = git(['-c', 'user.name=kc', '-c', 'user.email=kc@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
if (r.status !== 0) throw new Error('commit ' + r.stderr);

const sha = (b) => createHash('sha256').update(b).digest('hex');
const pin = (k) => sha(`kumitate-r96-${k}`).slice(0, 40);
const URL = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const row = (id, p) => `| ${id} | ${id.toLowerCase()}.ts — ${URL(p)} | code | A | scope-${id} | anchor | teaches | mined | 2026-11-07 | 30d | — |`;
const toks = ['casA', 'casB', 'casC', 'casD', 'casE', 'casF', 'casG', 'casH', 'casI', 'okA'].map(pin);
writeFileSync(join(RD, 'round-1', 'kumitate.md'),
  `# kumitate round-1 fixture\n\n## Work\n\nCited: ${toks.map((t) => `\`${t.slice(0, 8)}\``).join(' ')}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`);

const cases = [
  ['ws-class', `# T\n${row('S900', pin('casA'))}\n##\u000bRegistry\n${row('S001', pin('casB'))}\n`],
  ['indent-class', `# T\n## Registry\n\t## Leads\n${row('S002', pin('casC'))}\n`],
  ['trail-tab', `# T\n## Registry\t\n${row('S003', pin('casD'))}\n`],
  ['lastindex', `# T\n## Foo ## Registry\n${row('S004', pin('casE'))}\n`],
  ['outside-unindented', `# T\n## Leads\n   ${row('S005', pin('casF'))}\n`],
  ['fence-rows', `# T\n## Registry\n\`\`\`\n${row('S006', pin('casG'))}\n\`\`\`\n`],
  ['no-registry-fastpath', `# T\n${row('S007', pin('casH'))}\n${row('S008', pin('casI'))}\n`],
  ['hardcode-fixtures', `# SOURCES — fixture r96 A\n## Registry\n${row('S777', pin('casA'))}\n`],
];

const gate = (tool, json) => {
  const g = spawnSync(process.execPath, [tool, '--round', '1', '--lane', 'kumitate', '--repo', FX,
    '--reports-dir', RD, '--main-repo', FX, '--origin', FX, ...(json ? ['--json'] : [])], { cwd: FX, encoding: 'utf8' });
  if (!json) return { lines: g.stdout.split('\n').filter((l) => l.includes('SOURCES_ROWS_OUTSIDE')) };
  const j = JSON.parse(g.stdout);
  const c = j.citations || {};
  return { declared: c.declared || [], outside: c.outsideRows, malformed: c.malformedRows };
};
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const census = (file) => {
  const c = spawnSync('bash', [CENSUS, 'validate', '--file', file], { encoding: 'utf8' });
  const ids = (code) => c.stdout.split('\n').filter((l) => l.split('\t')[1] === code).map((l) => l.split('\t')[2].split(' ')[0]);
  return { e12: ids('E12'), e01: ids('E01') };
};
const short = (arr) => (Array.isArray(arr) ? arr.map((t) => (t.length === 40 ? 'PIN' : t)) : arr);
const nameOf = (t) => ({ [pin('casA').slice(0, 8)]: 'casA', [pin('casB').slice(0, 8)]: 'casB', [pin('casC').slice(0, 8)]: 'casC', [pin('casD').slice(0, 8)]: 'casD', [pin('casE').slice(0, 8)]: 'casE', [pin('casF').slice(0, 8)]: 'casF', [pin('casG').slice(0, 8)]: 'casG', [pin('casH').slice(0, 8)]: 'casH', [pin('casI').slice(0, 8)]: 'casI', [pin('okA').slice(0, 8)]: 'okA' }[t] || t);

for (const [name, sources] of cases) {
  writeFileSync(join(FX, 'corpus', 'SOURCES.md'), sources);
  const ref = gate(POS, true);
  const con = gate(join(CON, `${name}.mjs`), true);
  const cs = census(join(FX, 'corpus', 'SOURCES.md'));
  const same = JSON.stringify(ref) === JSON.stringify(con);
  console.log(`${name}: ref declared=[${short(ref.declared).map(nameOf).join(' ')}] outside=${JSON.stringify(ref.outside)} malformed=${JSON.stringify(ref.malformed)}`);
  console.log(`${name}: con declared=[${short(con.declared).map(nameOf).join(' ')}] outside=${JSON.stringify(con.outside)} malformed=${JSON.stringify(con.malformed)} same=${same}`);
  console.log(`${name}: census E12=${JSON.stringify(cs.e12)} E01=${JSON.stringify(cs.e01)}`);
}

/* text mode, zero outside rows: reference prints no SOURCES_ROWS_OUTSIDE line; text-always does. */
writeFileSync(join(FX, 'corpus', 'SOURCES.md'), `# T\n## Registry\n${row('S010', pin('okA'))}\n`);
const tref = gate(POS, false);
const tcon = gate(join(CON, 'text-always.mjs'), false);
console.log(`text-always: ref outside-lines=${JSON.stringify(tref.lines)}`);
console.log(`text-always: con outside-lines=${JSON.stringify(tcon.lines)}`);
