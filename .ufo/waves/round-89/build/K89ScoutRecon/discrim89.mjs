#!/usr/bin/env node
/**
 * discrim89.mjs — seat K89ScoutRecon, round 89.
 *
 * Discrimination fixtures OUTSIDE the frozen probe's path, used to show that the two 30/30
 * probe-aware overfits really do skip a claimed behaviour (they pass the probe without
 * implementing realpath lane membership or mode-120000 detection generally).
 *
 *   node discrim89.mjs --tool <a> [--tool <b> ...] --out <receipt.txt>
 *
 * D1 alias-symlinked-parent : the lane is named through a symlink to the lane directory (not
 *     /proc/self/root); the receipt binds the dirty worktree bytes at rev A.
 *     v3 contract: in-lane by real path -> DRIFT matched=0 mismatched=1 external=0.
 * D2 symlink-instrument-alias : a committed mode-120000 instrument whose NAME does not start
 *     `link-`; the receipt declares sha256 of the link text.
 *     v3 contract: SYMLINK_INSTRUMENT (exit 2).
 *
 * Scratch: $K89_SCRATCH (default /fast/scratch/hyaku/kumitate-r89/K89ScoutRecon-discrim), removed on exit.
 */
import { lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const tools = [];
for (let i = 0; i < argv.length; i += 1) if (argv[i] === '--tool') tools.push(resolve(argv[i + 1]));
const outI = argv.indexOf('--out');
const outPath = outI >= 0 ? argv[outI + 1] : '';
const S = resolve(process.env.K89_SCRATCH || '/fast/scratch/hyaku/kumitate-r89/K89ScoutRecon-discrim');
const N = randomBytes(6).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');

const DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function env() {
  const e = { ...process.env, TMPDIR: S, GIT_TERMINAL_PROMPT: '0' };
  for (const k of DROP) delete e[k];
  return e;
}

rmSync(S, { recursive: true, force: true });
mkdirSync(S, { recursive: true });
const lines = [];
const emit = (s) => { lines.push(s); console.log(s); };

const repo = join(S, `repo-${N}`);
mkdirSync(join(repo, 'scripts'), { recursive: true });
const INSTR = `instr-${N}.mjs`;
const ALIAS = `alias-${N}.mjs`;
const BODY = {
  A: `console.log("discrim ${N} A");\n`,
  B: `console.log("discrim ${N} B");\n`,
  C: `console.log("discrim ${N} C");\n`,
  W: `console.log("discrim ${N} dirty W");\n`,
};
const g = (args) => spawnSync('git', ['-C', repo, '-c', `user.name=d${N}`, '-c', `user.email=d${N}@fixture.invalid`,
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { encoding: 'utf8', env: env() });

if (g(['init', '-q']).status !== 0) { emit('FIXTURE: FAIL init'); process.exit(3); }
const top = resolve(g(['rev-parse', '--show-toplevel']).stdout.trim());
if (top !== resolve(repo)) { emit(`FIXTURE: FAIL toplevel ${top}`); process.exit(3); }
writeFileSync(join(repo, 'scripts', INSTR), BODY.A);
g(['add', `scripts/${INSTR}`]);
g(['commit', '-q', '-m', `A ${N}`]);
const A = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, 'scripts', INSTR), BODY.B);
g(['add', `scripts/${INSTR}`]);
g(['commit', '-q', '-m', `B ${N}`]);
g(['rev-parse', 'HEAD']);
writeFileSync(join(repo, 'scripts', INSTR), BODY.C);
symlinkSync(INSTR, join(repo, 'scripts', ALIAS));
g(['add', `scripts/${INSTR}`, `scripts/${ALIAS}`]);
g(['commit', '-q', '-m', `C ${N}`]);
const C = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, 'scripts', INSTR), BODY.W); // dirty worktree
emit(`FIXTURE: repo=${repo} A=${A} C=${C} aliasMode=${(lstatSync(join(repo, 'scripts', ALIAS)).isSymbolicLink() ? 'symlink-on-disk' : 'regular')}`);

const linkParent = join(S, `lanelink-${N}`);
symlinkSync(repo, linkParent);

function mkdirArm(name) {
  const d = join(S, `arm-${name}-${N}`);
  mkdirSync(d, { recursive: true });
  return d;
}
const d1 = mkdirArm('alias-symlinked-parent');
writeFileSync(join(d1, 'r.txt'),
  `rev=${A}\ntool_sha256=${sha(BODY.W)}\ncmd=node ${join(linkParent, 'scripts', INSTR)} --run\nOK ${N}\nexit=0\nsignal=none\n`);
const d2 = mkdirArm('symlink-instrument-alias');
writeFileSync(join(d2, 'r.txt'),
  `rev=${C}\ntool_sha256=${sha(Buffer.from(INSTR))}\ncmd=node scripts/${ALIAS} --run\nOK ${N}\nexit=0\nsignal=none\n`);

function run(tool, d, rev) {
  const r = spawnSync('node', [tool, '--lane', repo, '--dir', d, '--rev', rev],
    { cwd: repo, encoding: 'utf8', timeout: 300000, maxBuffer: 16 << 20, env: env() });
  const m = ((r.stdout || '') + (r.stderr || '')).match(/^RECEIPT_BIND: .*$/m);
  return `exit=${r.status} ${m ? m[0] : '(none)'}`;
}

const CONTRACT = {
  'alias-symlinked-parent': 'DRIFT matched=0 mismatched=1 unchecked=0 external=0 (exit 1)',
  'symlink-instrument-alias': 'FAIL-CLOSED SYMLINK_INSTRUMENT (exit 2)',
};
emit('');
for (const tool of tools) {
  emit(`TOOL ${tool} sha256=${sha(readFileSync(tool))}`);
  emit(`  D1 alias-symlinked-parent contract=${CONTRACT['alias-symlinked-parent']} observed=${run(tool, d1, A)}`);
  emit(`  D2 symlink-instrument-alias contract=${CONTRACT['symlink-instrument-alias']} observed=${run(tool, d2, C)}`);
}
if (outPath) writeFileSync(outPath, `${lines.join('\n')}\n`);
rmSync(S, { recursive: true, force: true });
