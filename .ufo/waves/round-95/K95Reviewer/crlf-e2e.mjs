import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const PIN_A = sha('crlf-pin-A').slice(0, 40);
const PIN_B = sha('crlf-pin-B').slice(0, 40);
const CAND = process.argv[2];
const S = '/fast/scratch/hyaku/kumitate-r95/K95Reviewer';

const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 16 << 20, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);

for (const variant of ['lf', 'crlf']) {
  const mk = run('mktemp', ['-d', '-p', S, 'fx.XXXXXX']);
  const D = mk.stdout.trim();
  if (!D) throw new Error(`mktemp failed: ${mk.stderr}`);
  rmSync(D, { recursive: true, force: true });
  mkdirSync(join(D, 'corpus'), { recursive: true });
  mkdirSync(join(D, 'reports', 'round-1'), { recursive: true });

  // Contract: init, verify toplevel before first commit.
  let g = git(D, ['init', '-q']);
  if (g.status !== 0) throw new Error(`init: ${g.stderr}`);
  const top = git(D, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (top !== D) throw new Error(`toplevel mismatch: ${top} != ${D}`);

  const goodRow = `| S001 | a.ts — https://github.com/o/r/blob/${PIN_A}/x.ts | code | A | scope | anchor | teaches | mined | 2026-11-06 | 30d | — |`;
  const badRow = `| S002 | b.ts — https://github.com/o/r/blob/${PIN_B}/x.ts | code | A | scope | anchor | teaches | x | rejected | 2026-11-06 | 30d | — | extra`;
  let sources = ['# SOURCES — fixture', '', '## Registry', '', goodRow, badRow, ''].join('\n');
  if (variant === 'crlf') sources = sources.replace(/\n/g, '\r\n');
  writeFileSync(join(D, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(D, 'LOG.md'), '- 2026-11-06 — round 1 fixture\n');
  writeFileSync(join(D, 'corpus', 'SOURCES.md'), sources);
  writeFileSync(join(D, 'reports', 'round-1', 'kumitate.md'),
    `# kumitate round-1 fixture\n\n## Work\n\nCited: \`${PIN_A.slice(0, 8)}\` \`${PIN_B.slice(0, 8)}\`\n\n## SHONEN\n\n- [~] x\n\n${'Padding for the report weight floor. '.repeat(40)}\n`);
  g = git(D, ['add', '-A']);
  g = git(D, ['-c', 'user.name=rev', '-c', 'user.email=rev@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) throw new Error(`commit: ${g.stderr}`);

  const r = run(process.execPath, [CAND, '--round', '1', '--lane', 'kumitate', '--repo', D,
    '--reports-dir', join(D, 'reports'), '--main-repo', D, '--origin', D, '--json'], { cwd: D });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch {}
  const c = j?.citations ?? null;
  console.log(`${variant}: exit=${r.status} verdict=${j?.verdict} declared=${JSON.stringify(c?.declared)} malformedRows=${JSON.stringify(c?.malformedRows)} unresolved=${c?.unresolved?.length} hasKey=${c ? 'malformedRows' in c : 'no-citations'}`);
}
