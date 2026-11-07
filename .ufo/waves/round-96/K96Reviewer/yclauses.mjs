import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const S = process.argv[2];
const TOOL = process.argv[3];
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const run = (c, a, o = {}) => spawnSync(c, a, { encoding: 'utf8', env, maxBuffer: 64 << 20, ...o });
const git = (d, a) => run('git', ['-C', d, ...a]);
const hex = (s) => createHash('sha256').update('xc-' + s).digest('hex').slice(0, 40);
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const row = (id, seed, fields13 = true, status = 'mined') => fields13
  ? `| ${id} | ${id}.ts — ${seed ? url(hex(seed)) : 'no url'} | code | A | s-${id} | a | t | ${status} | 2026-11-07 | 30d | — |`
  : `| ${id} | ${id}.ts — ${seed ? url(hex(seed)) : 'no url'} | code | A | s-${id} | a | t | ${status} | 2026-11-07 |`;
const F = join(S, 'fx-y');
rmSync(F, { recursive: true, force: true });
mkdirSync(join(F, 'corpus'), { recursive: true });
writeFileSync(join(F, 'corpus', 'SOURCES.md'), [
  '# T', '',
  '## Registry', '',
  '| | no id cell | code | A | s | a | t | mined | 2026-11-07 | 30d | \u2014 |',   // empty id, 13f inside
  '|\fS514 | x.ts \u2014 https://github.com/o/r/blob/' + hex('y1') + '/x.ts | code | A | s | a | t | mined | 2026-11-07 | 30d | \u2014 |',  // formfeed id
  '| \tS515 \t| x.ts | code | A | s | a | t | mined | 2026-11-07 | 30d | \u2014 |',  // tab-wrapped id
  '', '# End', '',
  '|\fS516 | x.ts | code | A | s | a | t | mined | 2026-11-07 | 30d | \u2014 |',  // formfeed id OUTSIDE
  '',
].join('\n'));
writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
let g = git(F, ['init', '-q', '-b', 'main']);
console.log('toplevel', git(F, ['rev-parse', '--show-toplevel']).stdout.trim() === F);
const pins = ['y1'].map((k) => hex(k).slice(0, 8));
const report = `# kumitate round-1 fixture\n\n## Work\n\nCited: ${pins.map((t) => '`' + t + '`').join(' ')}\n\n## SHONEN\n\n- [~] x\n\n${'pad pad pad pad pad pad pad pad pad pad. '.repeat(40)}\n`;
mkdirSync(join(S, 'fx-y-reports', 'round-1'), { recursive: true });
writeFileSync(join(S, 'fx-y-reports', 'round-1', 'kumitate.md'), report);
git(F, ['add', '-A']);
g = git(F, ['-c', 'core.autocrlf=false', '-c', 'user.name=x', '-c', 'user.email=x@x.invalid', 'commit', '-q', '-m', 'round-1 fx']);
console.log('commit', g.status, g.stderr.trim());
copyFileSync(TOOL, join(F, 'g.mjs')); copyFileSync(join(TOOL, '..', 'cap-spawn.mjs'), join(F, 'cap-spawn.mjs')); copyFileSync(join(TOOL, '..', 'cap-run.mjs'), join(F, 'cap-run.mjs'));
const r = run(process.execPath, [join(F, 'g.mjs'), '--round', '1', '--lane', 'kumitate', '--repo', F, '--reports-dir', join(S, 'fx-y-reports'), '--main-repo', F, '--origin', F, '--json'], { cwd: F });
if (!r.stdout) { console.log("STDERR", r.stderr.slice(0,600), "exit", r.status); process.exit(1); }
const j = JSON.parse(r.stdout);
console.log('exit', r.status);
console.log('declared', JSON.stringify(j.citations.declared));
console.log('outsideRows', JSON.stringify(j.citations.outsideRows));
console.log('malformedRows', JSON.stringify(j.citations.malformedRows));
const t = run(process.execPath, [join(F, 'g.mjs'), '--round', '1', '--lane', 'kumitate', '--repo', F, '--reports-dir', join(S, 'fx-y-reports'), '--main-repo', F, '--origin', F], { cwd: F });
console.log('TEXT_INFO', t.stdout.split('\n').filter((l) => l.startsWith('ROUND_GATE  info')).join(' | '));
