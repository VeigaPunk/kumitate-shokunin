#!/usr/bin/env node
/**
 * recon89.mjs — seat K89ScoutRecon, round 89.
 *
 * Independent reconnaissance of the BASE instrument (v2 at a5d2503, sha256
 * 1f11f124198fdb894265dc69a75efeca5fbf43d931209d227b2bc1b29e5880ea) on the ten new arm inputs
 * of round 89. Fixtures are built here from scratch: this file does not import, copy or read
 * probe89-c1.mjs. Each arm's expected verdict is transcribed from the plan table.
 *
 *   node recon89.mjs --tool <base-receipt-bind-v2.mjs> --out <receipt.txt>
 *
 * Scratch: $K89_SCRATCH (default /fast/scratch/hyaku/kumitate-r89/K89ScoutRecon), removed on exit.
 */
import {
  chmodSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync,
} from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve, basename } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const tool = resolve(opt('--tool', ''));
const outPath = opt('--out', '');
const S = resolve(process.env.K89_SCRATCH || '/fast/scratch/hyaku/kumitate-r89/K89ScoutRecon');
const N = randomBytes(6).toString('hex');

const GIT_DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX',
  'GIT_CEILING_DIRECTORIES'];
function env() {
  const e = { ...process.env, TMPDIR: S, GIT_TERMINAL_PROMPT: '0' };
  for (const k of GIT_DROP) delete e[k];
  return e;
}
const sha = (b) => createHash('sha256').update(b).digest('hex');

rmSync(S, { recursive: true, force: true });
mkdirSync(S, { recursive: true });
const lines = [];
function emit(s) { lines.push(s); console.log(s); }

// ---------------------------------------------------------------------------------------------
// fixture repository: commits A, B, C(=HEAD, carries the committed symlink), staged body S,
// dirty worktree W, untracked instrument.  Every byte is drawn from this run's nonce.
const repo = join(S, `repo-${N}`);
mkdirSync(join(repo, 'scripts'), { recursive: true });
const INSTR = `instr-${N}.mjs`;
const ALIAS = `alias-${N}.mjs`;
const UNTRACKED = `fresh-${N}.mjs`;
const BODY = {
  A: `console.log("recon ${N} body A");\n`,
  B: `console.log("recon ${N} body B");\n`,
  C: `console.log("recon ${N} body C");\n`,
  S: `console.log("recon ${N} staged S");\n`,
  W: `console.log("recon ${N} worktree W");\n`,
  fresh: `console.log("recon ${N} untracked");\n`,
};
const CMD = `node scripts/${INSTR} --run`;

function g(args, input) {
  return spawnSync('git', ['-C', repo, '-c', `user.name=recon${N}`, '-c', `user.email=recon${N}@fixture.invalid`,
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
  { encoding: 'utf8', env: env(), input });
}
const init = g(['init', '-q']);
const top = g(['rev-parse', '--show-toplevel']);
if (init.status !== 0 || top.status !== 0) { emit(`FIXTURE: FAIL git init/rev-parse`); process.exit(3); }
const realTop = resolve(top.stdout.trim());
if (realTop !== resolve(repo)) { emit(`FIXTURE: FAIL toplevel ${realTop} != ${repo}`); process.exit(3); }

writeFileSync(join(repo, 'scripts', INSTR), BODY.A);
g(['add', `scripts/${INSTR}`]);
if (g(['commit', '-q', '-m', `A ${N}`]).status !== 0) { emit('FIXTURE: FAIL commit A'); process.exit(3); }
const A = g(['rev-parse', 'HEAD']).stdout.trim();

writeFileSync(join(repo, 'scripts', INSTR), BODY.B);
g(['add', `scripts/${INSTR}`]);
if (g(['commit', '-q', '-m', `B ${N}`]).status !== 0) { emit('FIXTURE: FAIL commit B'); process.exit(3); }
const B = g(['rev-parse', 'HEAD']).stdout.trim();

writeFileSync(join(repo, 'scripts', INSTR), BODY.C);
symlinkSync(INSTR, join(repo, 'scripts', ALIAS));
g(['add', `scripts/${INSTR}`, `scripts/${ALIAS}`]);
if (g(['commit', '-q', '-m', `C ${N}`]).status !== 0) { emit('FIXTURE: FAIL commit C'); process.exit(3); }
const C = g(['rev-parse', 'HEAD']).stdout.trim();

// staged body S in the index, dirty worktree W, untracked instrument
writeFileSync(join(repo, 'scripts', INSTR), BODY.S);
g(['add', `scripts/${INSTR}`]);
writeFileSync(join(repo, 'scripts', INSTR), BODY.W);
writeFileSync(join(repo, 'scripts', UNTRACKED), BODY.fresh);

const ok = /^[a-f0-9]{40}$/.test(A) && /^[a-f0-9]{40}$/.test(B) && /^[a-f0-9]{40}$/.test(C) && A !== B && B !== C;
emit(`FIXTURE: repo=${repo} A=${A} B=${B} C=${C} instr=${INSTR} alias=${ALIAS} ok=${ok}`);
if (!ok) process.exit(3);

// ---------------------------------------------------------------------------------------------
// receipts and arm runs

function receipt({ rev, digest, cmd, tail }) {
  return `${rev ? `rev=${rev}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || `OK ${N}\n`}exit=0\nsignal=none\n`;
}
let dirN = 0;
function dir(arm) {
  dirN += 1;
  const d = join(S, `rc-${String(dirN).padStart(2, '0')}-${arm}-${N}`);
  mkdirSync(d, { recursive: true });
  return d;
}
function run(d, rev) {
  const r = spawnSync('node', [tool, '--lane', repo, '--dir', d, '--rev', rev],
    { cwd: repo, encoding: 'utf8', timeout: 300000, maxBuffer: 32 << 20, env: env() });
  const line = ((r.stdout || '') + (r.stderr || '')).match(/^RECEIPT_BIND: .*$/m);
  return { status: r.status, line: line ? line[0] : '(none)' };
}
const results = [];
function arm(name, expect, runs) {
  for (const [tag, r] of runs) {
    emit(`ARM ${name}${tag ? `/${tag}` : ''}: exit=${r.status} ${r.line}`);
    results.push({ name, tag, exit: r.status, line: r.line, expect });
  }
}

// 1 default-rev-not-head — no rev=, judged at A while HEAD is C.
{
  const d = dir('default-rev-not-head');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.A), cmd: CMD }));
  arm('default-rev-not-head', 'CLEAN matched=1 mismatched=0 unchecked=0 external=0 (exit 0)', [['', run(d, A)]]);
}
// 2 index-not-judged — no rev=, judged at B while the index holds S and HEAD holds C.
{
  const d = dir('index-not-judged');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.B), cmd: CMD }));
  arm('index-not-judged', 'CLEAN matched=1 mismatched=0 unchecked=0 external=0 (exit 0)', [['', run(d, B)]]);
}
// 3 abs-in-lane-at-rev — absolute in-lane token before a dirty worktree binds at the judged rev.
{
  const d = dir('abs-in-lane-at-rev');
  writeFileSync(join(d, 'r.txt'), receipt({ rev: A, digest: sha(BODY.A), cmd: `node ${join(repo, 'scripts', INSTR)}` }));
  arm('abs-in-lane-at-rev', 'CLEAN matched=1 mismatched=0 unchecked=0 external=0 (exit 0)', [['', run(d, A)]]);
}
// 4 limit-edge — exactly 1048576 binds; 1048577 refuses.
{
  const base = receipt({ digest: sha(BODY.B), cmd: CMD });
  const padTo = (n) => base + `#${'p'.repeat(Math.max(0, n - base.length - 2))}\n`;
  const d1 = dir('limit-edge-at');
  const d2 = dir('limit-edge-over');
  writeFileSync(join(d1, 'r.txt'), padTo(1048576));
  writeFileSync(join(d2, 'r.txt'), padTo(1048577));
  const s1 = lstatSync(join(d1, 'r.txt')).size;
  const s2 = lstatSync(join(d2, 'r.txt')).size;
  emit(`SIZES limit-edge: at=${s1} over=${s2}`);
  arm('limit-edge', 'at CLEAN matched=1 (exit 0); over FAIL-CLOSED RECEIPT_TOO_LARGE (exit 2)',
    [['at', run(d1, B)], ['over', run(d2, B)]]);
}
// 5 limit-before-read — 1 GiB sparse receipt, mode 0000: size judged before the read.
{
  const d = dir('limit-before-read');
  const p = join(d, 'r.txt');
  writeFileSync(p, receipt({ digest: sha(BODY.B), cmd: CMD }));
  truncateSync(p, 1 << 30);
  chmodSync(p, 0o000);
  const r = run(d, B);
  chmodSync(p, 0o600);
  emit(`SIZE limit-before-read: ${lstatSync(p).size} mode=0000`);
  arm('limit-before-read', 'FAIL-CLOSED RECEIPT_TOO_LARGE (exit 2)', [['', r]]);
}
// 6 escape-inner-dotdot — relative token with an interior `..` that escapes, by resolution.
{
  const outside = join(S, `outside-${N}`);
  mkdirSync(outside, { recursive: true });
  const ext = `ext2-${N}.mjs`;
  writeFileSync(join(outside, ext), BODY.fresh);
  const d = dir('escape-inner-dotdot');
  writeFileSync(join(d, 'r.txt'), receipt({
    digest: sha(BODY.fresh), cmd: `node scripts/../../${basename(outside)}/${ext}`,
  }));
  arm('escape-inner-dotdot', 'FAIL-CLOSED ESCAPES_LANE (exit 2)', [['', run(d, B)]]);
}
// 7 dup-equal-field — equal-valued duplicate rev= / tool_sha256=.
{
  const base = receipt({ rev: B, digest: sha(BODY.B), cmd: CMD });
  const d1 = dir('dup-rev-equal');
  const d2 = dir('dup-digest-equal');
  writeFileSync(join(d1, 'r.txt'), base.replace(/^rev=.*$/m, `rev=${B}\nrev=${B}`));
  writeFileSync(join(d2, 'r.txt'), base.replace(/^tool_sha256=.*$/m, `tool_sha256=${sha(BODY.B)}\ntool_sha256=${sha(BODY.B)}`));
  arm('dup-equal-field', 'both FAIL-CLOSED AMBIGUOUS_FIELD (exit 2)',
    [['rev-equal', run(d1, B)], ['digest-equal', run(d2, B)]]);
}
// 8 alias-proc-root — in-lane instrument named through /proc/self/root; digest = dirty worktree W.
{
  const d = dir('alias-proc-root');
  const alias = `/proc/self/root${join(repo, 'scripts', INSTR)}`;
  writeFileSync(join(d, 'r.txt'), receipt({ rev: A, digest: sha(BODY.W), cmd: `node ${alias}` }));
  arm('alias-proc-root', 'DRIFT matched=0 mismatched=1 unchecked=0 external=0 (exit 1)', [['', run(d, A)]]);
}
// 9 bom-rev — UTF-8 BOM before rev=A, digest of A, judged at C.
{
  const d = dir('bom-rev');
  writeFileSync(join(d, 'r.txt'), `\uFEFF${receipt({ rev: A, digest: sha(BODY.A), cmd: CMD })}`);
  arm('bom-rev', 'CLEAN matched=1 mismatched=0 unchecked=0 external=0 (exit 0)', [['', run(d, C)]]);
}
// 10 symlink-instrument — committed mode-120000 instrument at C.
{
  const d = dir('symlink-instrument');
  writeFileSync(join(d, 'r.txt'), receipt({ rev: C, digest: sha(Buffer.from(INSTR)), cmd: `node scripts/${ALIAS}` }));
  arm('symlink-instrument', 'FAIL-CLOSED SYMLINK_INSTRUMENT (exit 2)', [['', run(d, C)]]);
}

// ---------------------------------------------------------------------------------------------
// verdict per run: compare the observed line against plan.md's expected verdict for that arm.
// Expectations transcribed from plan.md's thirty-arm table (per-arm, per-run where an arm has two).
const E = {
  'default-rev-not-head': { '': [0, /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0$/] },
  'index-not-judged': { '': [0, /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0$/] },
  'abs-in-lane-at-rev': { '': [0, /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0$/] },
  'limit-edge': {
    at: [0, /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0$/],
    over: [2, /^RECEIPT_BIND: FAIL-CLOSED RECEIPT_TOO_LARGE(?: |$)/],
  },
  'limit-before-read': { '': [2, /^RECEIPT_BIND: FAIL-CLOSED RECEIPT_TOO_LARGE(?: |$)/] },
  'escape-inner-dotdot': { '': [2, /^RECEIPT_BIND: FAIL-CLOSED ESCAPES_LANE(?: |$)/] },
  'dup-equal-field': {
    'rev-equal': [2, /^RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD(?: |$)/],
    'digest-equal': [2, /^RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD(?: |$)/],
  },
  'alias-proc-root': { '': [1, /^RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 /] },
  'bom-rev': { '': [0, /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0$/] },
  'symlink-instrument': { '': [2, /^RECEIPT_BIND: FAIL-CLOSED SYMLINK_INSTRUMENT(?: |$)/] },
};
emit('');
let held = 0;
for (const r of results) {
  const e = E[r.name][r.tag];
  const holds = r.exit === e[0] && e[1].test(r.line);
  if (holds) held += 1;
  emit(`VERDICT ${r.name}${r.tag ? `/${r.tag}` : ''}: ${holds ? 'ARM-EXPECTATION-HELD' : 'ARM-EXPECTATION-MISSED'} observed=exit=${r.exit} ${r.line}`);
}

emit('');
emit(`RECON89: arms=10 runs=${results.length} arm-expectations-held=${held}/${results.length} tool=${tool} sha256=${sha(readFileSync(tool))} nonce=${N}`);

if (outPath) writeFileSync(outPath, `${lines.join('\n')}\n`);
rmSync(S, { recursive: true, force: true });
process.exit(0);
