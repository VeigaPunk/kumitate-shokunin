#!/usr/bin/env node
/**
 * clause-evidence.mjs — round-95 K95CriticA: behavioural differential for the attack gates.
 *
 * Builds ONE fixture registry holding exactly the rows the frozen counter's fixture (a) omits, then
 * prints declared/unresolved/malformedRows for BASE and each attack, so each rule violation is shown
 * by a run, not by reading the patch.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const S = resolve(process.argv[2] ?? '.');
const SCRATCH = process.argv[3] ?? tmpdir();
const BASE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs';
const ATT = process.argv[4] ? resolve(process.argv[4]) : join(S, 'attacks');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const hex = (s) => sha(`kumitate-r95-clause-${s}`).slice(0, 40);
const PIN = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((k) => [k, hex(k)]));
const TOK = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((k) => [k, PIN[k].slice(0, 8)]));
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 300000, ...o });
const git = (d, a) => run('git', ['-C', d, ...a]);

const row = (id, cells) => `| ${id} | ${cells.join(' | ')} |`;
const SRC = (p) => `x.ts — ${url(p)}`;
const TAIL = ['2026-11-07', '30d', '—'];
const good = (id, p, status) => row(id, [SRC(p), 'code', 'A', 'scope', 'anchor', 'teaches', status, ...TAIL]);
// 12 fields: used-by cell dropped (no trailing cell) -> census NF=12, no URL on this row.
const shortNoUrl = (id) => row(id, ['no url here', 'code', 'A', 'scope', 'anchor', 'teaches', 'mined', '2026-11-07', '30d']);
const nonCanon = (id, p, status) => row(id, [SRC(p), 'code', 'A', 'scope', 'anchor', 'teaches', status, ...TAIL]);

const lines = [
  '# SOURCES — clause fixture', '',
  '## Registry', '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  good('S001', PIN.A, 'mined'),                       // control: every gate must declare A
  shortNoUrl('S002'),                                  // 12 fields, NO url -> urlonly keeps quiet
  nonCanon('S003', PIN.C, 'superseded'),               // 13 fields, non-canonical status -> must declare C
  good('S004', PIN.D, 'mined') + '\r',                 // CRLF row, 13 fields -> must declare D
  `   ${shortNoUrl('S005').replace('no url here', SRC(PIN.E))}`, // 3-space indent, 12 fields -> disclose S005
  good('S006', PIN.F, 'mined'),                        // duplicate id pair: first 13-field
  shortNoUrl('S006'),                                  // second 12-field -> disclose S006, declare F
  good('S007', PIN.G, 'mined'),
  shortNoUrl('S008'),                                  // duplicate malformed id pair -> dedupe observable
  shortNoUrl('S008'),
  shortNoUrl('S000'),                                  // malformed id below S002, last line -> sort observable
  '',
].join('\n');

const D = mkdtempSync(join(SCRATCH, 'cl.XXXXXX'));
mkdirSync(join(D, 'corpus'), { recursive: true });
let g = git(D, ['init', '-q', '-b', 'main']);
if (g.status !== 0 || git(D, ['rev-parse', '--show-toplevel']).stdout.trim() !== D) {
  console.error(`SETUP: fixture init/toplevel failed in ${D}`);
  process.exit(2);
}
writeFileSync(join(D, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
writeFileSync(join(D, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
writeFileSync(join(D, 'corpus', 'SOURCES.md'), lines);
git(D, ['add', '-A']);
g = git(D, ['-c', 'user.name=c95', '-c', 'user.email=c95@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
if (g.status !== 0) { console.error(`SETUP: commit: ${g.stderr}`); process.exit(2); }
const R = join(D, '..', 'cl-reports');
mkdirSync(join(R, 'round-1'), { recursive: true });
const cited = Object.values(TOK).map((t) => `\`${t}\``).join(' ');
writeFileSync(join(R, 'round-1', 'kumitate.md'),
  `# kumitate round-1 fixture\n\n## Work\n\nCited: ${cited}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`);

const aw = run('awk', ['-F|', '/^ {0,3}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13 {i=$2; gsub(/[ \t]/,"",i); print i}',
  join(D, 'corpus', 'SOURCES.md')]);
console.log(`C95X census NF!=13 ids=[${aw.stdout.split('\n').filter(Boolean).join(' ')}]`);

const names = (list) => Object.entries(TOK).filter(([, t]) => list.includes(t)).map(([k]) => k).join(',') || '-';
const gate = (tool, label) => {
  const r = run(process.execPath, [tool, '--round', '1', '--lane', 'kumitate', '--repo', D, '--reports-dir', R,
    '--main-repo', D, '--origin', D, '--json'], { cwd: D });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  const c = j?.citations ?? {};
  console.log(`C95X ${label.padEnd(16)} exit=${r.status} declared=[${names(c.declared ?? [])}] `
    + `unresolved=[${names(c.unresolved ?? [])}] malformedRows=${JSON.stringify(c.malformedRows ?? null)}`);
  if (label === 'atk-nofailclosed' || label === 'ctl-positive') {
    const fc = run(process.execPath, [tool, '--round', '1', '--lane', 'kumitate', '--repo', D,
      '--reports-dir', join(D, 'no-such-reports'), '--main-repo', D, '--origin', D, '--json'], { cwd: D });
    let fj = null; try { fj = JSON.parse(fc.stdout); } catch { fj = null; }
    const fc_c = fj?.citations ?? {};
    console.log(`C95X ${label.padEnd(16)} FAIL-CLOSED exit=${fc.status} verdict=${fj?.verdict ?? 'none'} `
      + `citationsKeys=${JSON.stringify(Object.keys(fc_c))} malformedRows=${JSON.stringify(fc_c.malformedRows ?? null)}`);
  }
};
gate(BASE, 'BASE');
gate('/fast/scratch/hyaku/kumitate-r95/K95CriticA/refs/ctl-positive.mjs', 'ctl-positive');
gate('/fast/scratch/hyaku/kumitate-r95/K95CriticA/refs/ctl-nothing.mjs', 'ctl-nothing');
for (const n of ['atk-urlonly', 'atk-sorted', 'atk-dedupe', 'atk-crlf', 'atk-vocab', 'atk-nofailclosed',
  'atk-hardcode', 'atk-dupskip', 'atk-noindent']) gate(join(ATT, `${n}.mjs`), n);
rmSync(D, { recursive: true, force: true });
rmSync(R, { recursive: true, force: true });
