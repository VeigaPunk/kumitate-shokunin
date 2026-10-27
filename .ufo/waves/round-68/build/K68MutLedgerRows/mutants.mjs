// mutants.mjs — commit base + 8 mutants in the fixture lane, run v1 tool + frozen counter per rev.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync, execSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const S = '/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows';
const FX = join(S, 'fx');
const LED = join(FX, 'corpus/routed-ledger.md');
const PROBE = join(LANE, '.ufo/waves/round-68/probe/ledger68-probe.mjs');
const OUT = join(S, 'out');
mkdirSync(OUT, { recursive: true });
const g = (args) => spawnSync('git', ['-C', FX, ...args], { encoding: 'utf8' });

const clean = readFileSync(LED, 'utf8');
const lines = clean.split('\n');
const lineOf = (id) => { const i = lines.findIndex((l) => l.startsWith(`| ${id} `)); if (i < 0) throw new Error(`row ${id} not found`); return i; };
const setLine = (id, fn) => { const i = lineOf(id); lines[i] = fn(lines[i]); };
const insertAfter = (id, newline) => { const i = lineOf(id); lines.splice(i + 1, 0, newline); };

const MUTANTS = {
  'base': null,
  'm1-drop-row': () => { lines.splice(lineOf('R58-3'), 1); },
  'm2-quote-swap': () => { setLine('R58-3', (l) => l.replace(/"[^"]*"/, '"the tier counts are wrong"')); },
  'm3-answer-line-plus1': () => { setLine('R65-D7', (l) => l.replace('README.md:195', 'README.md:196')); },
  'm4-open-to-closed-fake-answer': () => { setLine('R57-1', (l) => l.replace('| open | - |', '| closed | `corpus/lessons/round-57.md:32` — "the double-live L1 launch was reconciled in the dispatch evidence" |')); },
  'm5-duplicate-row': () => { insertAfter('R60-3', lines[lineOf('R60-3')]); },
  'm6-contradicted': () => { insertAfter('R66-D1', '| R66-D1b | 66 | 1 | "At closure the working tree carried uncommitted" | uncommitted-work | wontfix | `corpus/lessons/round-66.md:7` — "claims not verified; the dispatched v2 wave had no `WAVE-DONE` or results receipt at report cutoff, so wave output was not integrated" |'); },
  'm7-one-word-quote': () => { setLine('R62-5', (l) => l.replace(/"[^"]*"/, '"persist"')); },
  'm8-dup-id-open': () => { insertAfter('R60-2', lines[lineOf('R60-2')].replace('| R60-2 |', '| R60-2b |')); },
};

const childEnv = () => ({ PATH: process.env.PATH, TMPDIR: S, LANG: 'C' });
for (const k of ['NODE_OPTIONS', 'LD_PRELOAD', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR', 'TAR_OPTIONS']) delete process.env[k];

const summary = [];
for (const [name, mutate] of Object.entries(MUTANTS)) {
  if (mutate) { mutate(); writeFileSync(LED, lines.join('\n')); }
  const tp = g(['rev-parse', '--show-toplevel']);
  if (tp.stdout.trim() !== FX) { console.error(`FATAL toplevel=${tp.stdout.trim()} != ${FX}`); process.exit(64); }
  const add = g(['add', '-A']); if (add.status !== 0) { console.error(`add fail ${name}: ${add.stderr}`); process.exit(1); }
  const ci = g(['-c', 'user.name=mut', '-c', 'user.email=mut@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', name]);
  if (ci.status !== 0) { console.error(`commit fail ${name}: ${ci.stderr}`); process.exit(1); }
  const rev = g(['rev-parse', 'HEAD']).stdout.trim();
  writeFileSync(LED, clean); // restore working tree; the commit keeps the mutant bytes

  const tool = spawnSync('node', [join(FX, 'scripts/routed-ledger.mjs'), '--root', FX, '--from', '55', '--to', '66'], { encoding: 'utf8', timeout: 120000, env: childEnv(), cwd: S });
  const counter = spawnSync('node', [PROBE, FX, rev], { encoding: 'utf8', timeout: 600000, env: childEnv(), cwd: S });
  writeFileSync(join(OUT, `${name}.tool.txt`), `exit=${tool.status}\n${tool.stdout}${tool.stderr}`);
  writeFileSync(join(OUT, `${name}.counter.txt`), `exit=${counter.status}\n${counter.stdout}${counter.stderr}`);
  const vlast = (tool.stdout || '').trim().split('\n').pop() || '';
  const findings = (tool.stdout || '').split('\n').filter((l) => l.startsWith('FINDING ')).map((l) => l.split(' ').slice(0, 2).join(' ')).join(',') || '-';
  const clast = ((counter.stdout || '').trim().split('\n').pop()) || '';
  const cline = ((counter.stdout || '').split('\n').find((l) => /^LEDGER68_/.test(l)) || '').replace(/^LEDGER68_\w+ /, '');
  summary.push(`${name} rev=${rev.slice(0, 12)} tool_exit=${tool.status} verdict="${vlast.slice(0, 110)}" findings=${findings}\n  counter_exit=${counter.status} ${cline.slice(0, 400)}`);
  console.log(summary[summary.length - 1]);
}
writeFileSync(join(S, 'mutant-summary.txt'), summary.join('\n') + '\n');
console.log('DONE');
