#!/usr/bin/env node
/**
 * repro89-arms.mjs — INDEPENDENT hand-built reproduction of probe89-c1 arms A21–A30
 * (K89ExecReceipts). Does not import or read probe89-c1.mjs; builds the same fixture
 * shape from scratch under its own scratch dir with a fresh nonce.
 *
 *   node repro89-arms.mjs --lane <LANE> --work <SCRATCH> --rev <40-hex> [--tool <path>]
 *
 * Prints one REPRO <arm> line per arm with the raw tool verdict, then a summary line.
 */
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync,
  symlinkSync, truncateSync, writeFileSync, lstatSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const rev = opt('--rev', '');
const tool = resolve(opt('--tool', join(lane, 'scripts', 'receipt-bind.mjs')));
const workArg = opt('--work', '');
if (!/^[a-f0-9]{40}$/.test(rev)) { console.log('REPRO89: FAIL-CLOSED REV_NOT_FULL'); process.exit(2); }
const work = resolve(workArg || mkdtempSync(join(tmpdir(), 'repro89-')));
mkdirSync(work, { recursive: true });
const fixRoot = join(work, `indep-${randomBytes(6).toString('hex')}`);
rmSync(fixRoot, { recursive: true, force: true });
mkdirSync(fixRoot, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const GIT_DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function cleanEnv() {
  const env = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0' };
  for (const k of GIT_DROP) delete env[k];
  return env;
}
function runTool(extra) {
  const r = spawnSync('node', [tool, ...extra], {
    cwd: lane, encoding: 'utf8', timeout: 300000, maxBuffer: 32 << 20, env: cleanEnv(),
  });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}
const bindLine = (out) => (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
const brief = (r) => `exit=${r.status} ${bindLine(r.out)}`;

function mk(name) {
  const d = join(fixRoot, `${name}-${NONCE}`);
  mkdirSync(d, { recursive: true });
  return d;
}
const NONCE = randomBytes(6).toString('hex');
function receipt({ r, digest, cmd, tail, bom }) {
  const s = `${r ? `rev=${r}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || `OK ${NONCE}\n`}exit=0\nsignal=none\n`;
  return bom ? `\uFEFF${s}` : s;
}
const inRepo = (d, r) => runTool(['--lane', repo, '--dir', d, '--rev', r]);

// ---- fixture repo: same shape as the probe's — commits A, B, C=HEAD, staged S, dirty W,
//      untracked fresh, committed symlink instrument (my own nonce, own filenames).
const repo = mk('repo');
function fx(args, input) {
  return spawnSync('git', ['-C', repo, '-c', `user.name=ind${NONCE}`, '-c', `user.email=ind${NONCE}@fixture.invalid`,
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
  { encoding: 'utf8', env: cleanEnv(), input });
}
const BODY = {
  A: `console.log("indep instrument ${NONCE} body A");\n`,
  B: `console.log("indep instrument ${NONCE} body B");\n`,
  C: `console.log("indep instrument ${NONCE} body C (HEAD)");\n`,
  S: `console.log("indep instrument ${NONCE} body S (staged index)");\n`,
  W: `console.log("indep instrument ${NONCE} body W (dirty worktree)");\n`,
  fresh: `console.log("indep instrument ${NONCE} untracked");\n`,
};
const LINK_TARGET = `indep-tool-${NONCE}.mjs`;
const TOOL_CMD = `node scripts/${LINK_TARGET} --run`;
let A = null; let B = null; let C = null; let fixtureOk = false;
{
  const init = fx(['init', '-q']);
  const top = fx(['rev-parse', '--show-toplevel']);
  if (init.status === 0 && top.status === 0 && realpathSync(top.stdout.trim()) === realpathSync(repo)) {
    mkdirSync(join(repo, 'scripts'), { recursive: true });
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.A);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `A ${NONCE}`]);
    A = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.B);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `B ${NONCE}`]);
    B = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.C);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `C ${NONCE}`]);
    C = fx(['rev-parse', 'HEAD']).stdout.trim();
    fx(['add', `scripts/${LINK_TARGET}`]);
    symlinkSync(LINK_TARGET, join(repo, 'scripts', `indep-link-${NONCE}.mjs`));
    fx(['add', `scripts/indep-link-${NONCE}.mjs`]);
    fx(['commit', '-q', '-m', `D ${NONCE}`]);
    C = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.S);
    fx(['add', `scripts/${LINK_TARGET}`]);
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.W);
    writeFileSync(join(repo, 'scripts', `indep-fresh-${NONCE}.mjs`), BODY.fresh);
    fixtureOk = /^[a-f0-9]{40}$/.test(A || '') && /^[a-f0-9]{40}$/.test(B || '') &&
      /^[a-f0-9]{40}$/.test(C || '') && A !== B && B !== C;
  }
}
console.log(`REPRO fixture repo=${repo} A=${A} B=${B} C=${C} ok=${fixtureOk}`);
if (!fixtureOk) { console.log('REPRO89: FAIL-CLOSED FIXTURE'); process.exit(2); }

// A21 — default-rev-not-head: no rev= in receipt, judged at A, HEAD=C → expect CLEAN.
{
  const d = mk('default-rev-not-head');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.A), cmd: TOOL_CMD }));
  const r = inRepo(d, A);
  console.log(`REPRO default-rev-not-head: ${brief(r)}`);
}
// A22 — index-not-judged: no rev=, judged at B, index holds S, HEAD holds C → expect CLEAN.
{
  const d = mk('index-not-judged');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = inRepo(d, B);
  console.log(`REPRO index-not-judged: ${brief(r)}`);
}
// A23 — abs-in-lane-at-rev: absolute in-lane token, receipt rev=A digest of A, judged at A,
//        worktree is dirty W → expect CLEAN matched=1.
{
  const d = mk('abs-in-lane-at-rev');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.A), cmd: `node ${join(repo, 'scripts', LINK_TARGET)}` }));
  const r = inRepo(d, A);
  console.log(`REPRO abs-in-lane-at-rev: ${brief(r)}`);
}
// A24 — limit-edge: exactly 1048576 binds CLEAN; 1048577 is RECEIPT_TOO_LARGE.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const padTo = (n) => base + `#${'p'.repeat(Math.max(0, n - base.length - 2))}\n`;
  const at = mk('limit-edge-ok');
  const over = mk('limit-edge-over');
  writeFileSync(join(at, 'r.txt'), padTo(1048576));
  writeFileSync(join(over, 'r.txt'), padTo(1048577));
  const s1 = lstatSync(join(at, 'r.txt')).size;
  const s2 = lstatSync(join(over, 'r.txt')).size;
  const r1 = inRepo(at, B);
  const r2 = inRepo(over, B);
  console.log(`REPRO limit-edge: edge size=${s1} ${brief(r1)} | over size=${s2} ${brief(r2)}`);
}
// A25 — limit-before-read: 1 GiB sparse, mode 0000 → expect RECEIPT_TOO_LARGE (size judged first).
{
  const d = mk('limit-before-read');
  const p = join(d, 'r.txt');
  writeFileSync(p, receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  truncateSync(p, 1 << 30);
  chmodSync(p, 0o000);
  const r = inRepo(d, B);
  chmodSync(p, 0o600);
  console.log(`REPRO limit-before-read: size=${1 << 30} ${brief(r)}`);
}
// A26 — escape-inner-dotdot: `scripts/../../<outside>/ext2-<nonce>.mjs` → ESCAPES_LANE.
{
  const outside = mk('outside2');
  writeFileSync(join(outside, `ext2-${NONCE}.mjs`), BODY.fresh);
  const d = mk('escape-inner-dotdot');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node scripts/../../${basename(outside)}/ext2-${NONCE}.mjs` }));
  const r = inRepo(d, B);
  console.log(`REPRO escape-inner-dotdot: ${brief(r)}`);
}
// A27 — dup-equal-field: equal-valued duplicate rev= and tool_sha256= → AMBIGUOUS_FIELD each.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const v = {
    'dup-rev-equal': base.replace(/^rev=.*$/m, `rev=${B}\nrev=${B}`),
    'dup-digest-equal': base.replace(/^tool_sha256=.*$/m, `tool_sha256=${sha(BODY.B)}\ntool_sha256=${sha(BODY.B)}`),
  };
  const parts = [];
  for (const [k, body] of Object.entries(v)) {
    const d = mk(k);
    writeFileSync(join(d, 'r.txt'), body);
    parts.push(`${k} ${brief(inRepo(d, B))}`);
  }
  console.log(`REPRO dup-equal-field: ${parts.join(' | ')}`);
}
// A28 — alias-proc-root: in-lane instrument via /proc/self/root, rev=A, digest of dirty W,
//        judged at A → expect DRIFT mismatched=1 external=0.
{
  const d = mk('alias-proc-root');
  const alias = `/proc/self/root${join(repo, 'scripts', LINK_TARGET)}`;
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.W), cmd: `node ${alias}` }));
  const r = inRepo(d, A);
  console.log(`REPRO alias-proc-root: ${brief(r)}`);
}
// A30 — symlink-instrument: committed mode-120000 instrument, rev=C, digest of the link's
//        target string (git stores link text as the blob) → expect FAIL-CLOSED SYMLINK_INSTRUMENT.
{
  const d = mk('symlink-instrument');
  writeFileSync(join(d, 'r.txt'), receipt({ r: C, digest: sha(Buffer.from(LINK_TARGET)), cmd: `node scripts/indep-link-${NONCE}.mjs` }));
  const r = inRepo(d, C);
  console.log(`REPRO symlink-instrument: ${brief(r)}`);
}
// A29 — bom-rev: UTF-8 BOM before the receipt fields, rev=A + digest of A, judged at C →
//        expect CLEAN (the BOM must not hide rev=).
{
  const d = mk('bom-rev');
  writeFileSync(join(d, 'r.txt'), `\uFEFF${receipt({ r: A, digest: sha(BODY.A), cmd: TOOL_CMD })}`);
  const r = inRepo(d, C);
  console.log(`REPRO bom-rev: ${brief(r)}`);
}
rmSync(fixRoot, { recursive: true, force: true });
console.log('REPRO89: DONE');
