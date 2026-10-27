// mutants2.mjs — m2..m8 with per-mutant fresh lines and tool run against the COMMIT (--rev).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const S = '/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows';
const FX = join(S, 'fx');
const LED = join(FX, 'corpus/routed-ledger.md');
const PROBE = join(LANE, '.ufo/waves/round-68/probe/ledger68-probe.mjs');
const OUT = join(S, 'out');
mkdirSync(OUT, { recursive: true });
const clean = readFileSync(LED, 'utf8'); // worktree is the restored clean ledger after bg_9591

const MUTANTS = {
  'm2-quote-swap': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R58-3 ')); lines[i] = lines[i].replace(/"[^"]*"/, '"the tier counts are wrong"'); },
  'm3-answer-line-plus1': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R65-D7 ')); lines[i] = lines[i].replace('README.md:195', 'README.md:196'); },
  'm4-open-to-closed-fake-answer': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R57-1 ')); lines[i] = lines[i].replace('| open | - |', '| closed | `corpus/lessons/round-57.md:32` — "the double-live L1 launch was reconciled in the dispatch evidence" |'); },
  'm5-duplicate-row': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R60-3 ')); lines.splice(i + 1, 0, lines[i]); },
  'm6-contradicted': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R66-D1 ')); lines.splice(i + 1, 0, '| R66-D1b | 66 | 1 | "At closure the working tree carried uncommitted" | uncommitted-work | wontfix | `corpus/lessons/round-66.md:7` — "claims not verified; the dispatched v2 wave had no `WAVE-DONE` or results receipt at report cutoff, so wave output was not integrated" |'); },
  'm7-one-word-quote': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R62-5 ')); lines[i] = lines[i].replace(/"[^"]*"/, '"persist"'); },
  'm8-dup-id-open': (lines) => { const i = lines.findIndex((l) => l.startsWith('| R60-2 ')); lines.splice(i + 1, 0, lines[i].replace('| R60-2 |', '| R60-2b |')); },
};

const childEnv = () => ({ PATH: process.env.PATH, TMPDIR: S, LANG: 'C' });
for (const k of ['NODE_OPTIONS', 'LD_PRELOAD', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR', 'TAR_OPTIONS']) delete process.env[k];
const g = (args) => spawnSync('git', ['-C', FX, ...args], { encoding: 'utf8' });

const summary = [];
for (const [name, mutate] of Object.entries(MUTANTS)) {
  const lines = clean.split('\n'); // fresh per mutant
  mutate(lines);
  writeFileSync(LED, lines.join('\n'));
  if (g(['rev-parse', '--show-toplevel']).stdout.trim() !== FX) { console.error('FATAL toplevel'); process.exit(64); }
  if (g(['add', '-A']).status !== 0) { console.error(`add fail ${name}`); process.exit(1); }
  const ci = g(['-c', 'user.name=mut', '-c', 'user.email=mut@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', name]);
  if (ci.status !== 0) { console.error(`commit fail ${name}: ${ci.stderr}`); process.exit(1); }
  const rev = g(['rev-parse', 'HEAD']).stdout.trim();
  writeFileSync(LED, clean); // restore; both detectors now read the committed rev

  const tool = spawnSync('node', [join(FX, 'scripts/routed-ledger.mjs'), '--root', FX, '--rev', rev, '--from', '55', '--to', '66'], { encoding: 'utf8', timeout: 120000, env: childEnv(), cwd: S });
  const counter = spawnSync('node', [PROBE, FX, rev], { encoding: 'utf8', timeout: 600000, env: childEnv(), cwd: S });
  writeFileSync(join(OUT, `${name}.tool.txt`), `exit=${tool.status}\n${tool.stdout}${tool.stderr}`);
  writeFileSync(join(OUT, `${name}.counter.txt`), `exit=${counter.status}\n${counter.stdout}${counter.stderr}`);
  const vlast = (tool.stdout || '').trim().split('\n').pop() || '';
  const findings = (tool.stdout || '').split('\n').filter((l) => l.startsWith('FINDING ')).map((l) => l.split(' ').slice(0, 2).join(' ')).join(',') || '-';
  const cline = ((counter.stdout || '').split('\n').find((l) => /^LEDGER68_/.test(l)) || '').replace(/^LEDGER68_\w+ /, '');
  summary.push(`${name} rev=${rev.slice(0, 12)} tool_exit=${tool.status} findings=${findings} verdict="${vlast.slice(0, 120)}"\n  counter_exit=${counter.status} ${cline.slice(0, 420)}`);
  console.log(summary[summary.length - 1]);
}
writeFileSync(join(S, 'mutant-summary2.txt'), summary.join('\n') + '\n');
console.log('DONE');
