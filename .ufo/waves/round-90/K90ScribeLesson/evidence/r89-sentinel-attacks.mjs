#!/usr/bin/env node
// attacks.mjs — sentinel attack battery for round-89 C1 (`receipt-bind` v3).
// Runs every attack against BASE (v2 at the lane base rev) and CANDIDATE (the v3 worktree
// snapshot) over one fixture repository, and records exit status + verdict line per attack.
//
//   node attacks.mjs --work <SCRATCH> --base <v2.mjs> --cand <v3.mjs> --out <dir>
//
// The fixture repo lives under <SCRATCH>; every git call names -C <repo> and the toplevel is
// verified before the first commit. Nothing is written outside <SCRATCH> and <out>.
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  chmodSync, linkSync, lstatSync, mkdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const work = resolve(arg('--work', ''));
const BASE = resolve(arg('--base', ''));
const CAND = resolve(arg('--cand', ''));
const OUT = resolve(arg('--out', ''));
if (!work || !BASE || !CAND || !OUT) { console.error('missing arg'); process.exit(64); }
mkdirSync(work, { recursive: true });
mkdirSync(OUT, { recursive: true });

const N = randomBytes(4).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function env(extra) {
  const e = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0', ...(extra || {}) };
  for (const k of DROP) delete e[k];
  return e;
}

// ---------------------------------------------------------------------------------------------
// fixture repository: A, B, C commits; staged S; dirty worktree W; committed symlinks in and out
// of the lane; a gitlink; a glob pair; a .gitattributes-normalised file; an untracked instrument.
const repo = join(work, `repo-${N}`);
const outside = join(work, `outside-${N}`);
mkdirSync(repo, { recursive: true });
mkdirSync(outside, { recursive: true });
const g = (args, input) => spawnSync('git', ['-C', repo, '-c', `user.name=s${N}`, '-c', `user.email=s${N}@fixture.invalid`,
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
{ encoding: 'utf8', env: env(), input });

const init = g(['init', '-q']);
const top = g(['rev-parse', '--show-toplevel']);
if (init.status !== 0 || top.status !== 0 || realpathSync(top.stdout.trim()) !== realpathSync(repo)) {
  console.error('FIXTURE: toplevel assertion failed'); process.exit(2);
}
mkdirSync(join(repo, 'scripts'), { recursive: true });
const toolRel = `scripts/tool-${N}.mjs`;
const linkRel = `scripts/link-${N}.mjs`;
const outlinkRel = `scripts/outlink-${N}.mjs`;
const subRel = `scripts/sub-${N}.mjs`;
const g1Rel = `scripts/g1-${N}.mjs`;
const g2Rel = `scripts/g2-${N}.mjs`;
const crlfRel = `scripts/crlf-${N}.mjs`;
const dirtyRel = `scripts/dirty-${N}.mjs`;
const extPath = join(outside, `ext-${N}.mjs`);
const BODY = {
  A: `console.log("tool ${N} A");\n`,
  B: `console.log("tool ${N} B");\n`,
  C: `console.log("tool ${N} C");\n`,
  S: `console.log("tool ${N} S (index)");\n`,
  W: `console.log("tool ${N} W (worktree)");\n`,
  EXT: `console.log("external ${N}");\n`,
  G1: `console.log("g1 ${N}");\n`,
  G2: `console.log("g2 ${N}");\n`,
  CRLF: `console.log("crlf ${N}");\n`,
  DIRTY: `console.log("untracked ${N}");\n`,
};
writeFileSync(extPath, BODY.EXT);
const LINKTEXT = `tool-${N}.mjs`;
const OUTLINKTEXT = extPath;

writeFileSync(join(repo, toolRel), BODY.A);
writeFileSync(join(repo, g1Rel), BODY.G1);
writeFileSync(join(repo, g2Rel), BODY.G2);
writeFileSync(join(repo, crlfRel), BODY.CRLF.replace(/\n/g, '\r\n')); // worktree CRLF, blob LF
writeFileSync(join(repo, '.gitattributes'), `${crlfRel} text eol=crlf\n`);
symlinkSync(LINKTEXT, join(repo, linkRel));
symlinkSync(OUTLINKTEXT, join(repo, outlinkRel));
g(['add', '-A']);
g(['commit', '-q', '-m', `A ${N}`]);
const A = g(['rev-parse', 'HEAD']).stdout.trim();
g(['update-index', '--add', '--cacheinfo', `160000,${A},${subRel}`]);
g(['commit', '-q', '-m', `gitlink ${N}`]);
writeFileSync(join(repo, toolRel), BODY.B);
g(['add', '-A']);
g(['commit', '-q', '-m', `B ${N}`]);
const B = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, toolRel), BODY.C);
g(['add', '-A']);
g(['commit', '-q', '-m', `C ${N}`]);
const C = g(['rev-parse', 'HEAD']).stdout.trim();
// index holds S, worktree holds W: neither is a commit
writeFileSync(join(repo, toolRel), BODY.S);
g(['add', '-A']);
writeFileSync(join(repo, toolRel), BODY.W);
writeFileSync(join(repo, dirtyRel), BODY.DIRTY);

const blobOf = (rev, rel) => {
  const r = g(['cat-file', 'blob', `${rev}:${rel}`], undefined);
  return r.status === 0 ? Buffer.from(r.stdout, 'utf8') : null;
};
const D = {
  A: sha(BODY.A), B: sha(BODY.B), C: sha(BODY.C), W: sha(BODY.W), EXT: sha(BODY.EXT),
  G1: sha(BODY.G1), LINKTEXT: sha(Buffer.from(LINKTEXT)), OUTLINKTEXT: sha(Buffer.from(OUTLINKTEXT)),
  CRLFWT: sha(readFileSync(join(repo, crlfRel))), CRLFBLob: sha(blobOf(C, crlfRel)),
};
const fixture = { repo, outside, extPath, A, B, C, toolRel, linkRel, outlinkRel, subRel, g1Rel, g2Rel, crlfRel, dirtyRel, D };
writeFileSync(join(OUT, 'fixture.json'), `${JSON.stringify({ N, ...fixture }, null, 2)}\n`);

// ---------------------------------------------------------------------------------------------
// runners
function runTool(tool, args, opts) {
  const o = opts || {};
  const r = spawnSync(process.execPath, [tool, ...args], {
    cwd: o.cwd || repo, encoding: 'utf8', timeout: o.timeout || 120000, maxBuffer: 32 << 20,
    env: env(o.env), stdio: o.stdio,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  return { status: r.status, signal: r.signal, line: (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0], out };
}

let n = 0;
function rcDir(body) {
  n += 1;
  const d = join(work, `rc-${String(n).padStart(2, '0')}-${N}`);
  mkdirSync(d, { recursive: true });
  if (typeof body === 'string') writeFileSync(join(d, 'r.txt'), body);
  else for (const [f, t] of Object.entries(body)) writeFileSync(join(d, f), t);
  return d;
}
const rc = ({ r, digest, cmd, tail }) => `${r ? `rev=${r}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || `OK ${N}\n`}exit=0\nsignal=none\n`;

const cases = [];
function add(name, dir, rev, extra) {
  cases.push({ name, dir, rev, ...(extra || {}) });
}

// ---- item 1: realpath membership ------------------------------------------------------------
const aliasRoot = (rel) => `/proc/self/root${join(repo, rel)}`;
add('R1 proc-root alias, worktree digest at A', rcDir(rc({ r: A, digest: D.W, cmd: `node ${aliasRoot(toolRel)}` })), A);
add('R2 proc-root alias, rev-A digest at A', rcDir(rc({ r: A, digest: D.A, cmd: `node ${aliasRoot(toolRel)}` })), A);
add('R3 /proc/self/cwd alias, worktree digest at A', rcDir(rc({ r: A, digest: D.W, cmd: `node /proc/self/cwd/${toolRel}` })), A);
add('R4 abs in-lane symlink, target digest at A', rcDir(rc({ r: A, digest: D.A, cmd: `node ${join(repo, linkRel)}` })), A);
add('R5 abs in-lane symlink, LINK-TEXT digest at A', rcDir(rc({ r: A, digest: D.LINKTEXT, cmd: `node ${join(repo, linkRel)}` })), A);
add('R6 abs OUTWARD symlink, outside digest at A', rcDir(rc({ r: A, digest: D.EXT, cmd: `node ${join(repo, outlinkRel)}` })), A);
add('R7 abs OUTWARD symlink, LINK-TEXT digest at A', rcDir(rc({ r: A, digest: D.OUTLINKTEXT, cmd: `node ${join(repo, outlinkRel)}` })), A);
add('R8 rel outward symlink, LINK-TEXT digest at A', rcDir(rc({ r: A, digest: D.OUTLINKTEXT, cmd: `node ${outlinkRel}` })), A);
// hard link outside the lane to the dirty worktree instrument (realpath cannot see hard links)
const hardPath = join(outside, `hard-${N}.mjs`);
linkSync(join(repo, toolRel), hardPath);
add('R9 hard link to worktree tool, W digest at A', rcDir(rc({ r: A, digest: D.W, cmd: `node ${hardPath}` })), A);

// ---- item 2: BOM ---------------------------------------------------------------------------
add('B1 BOM-only receipt', rcDir('\uFEFF'), B);
add('B2 mid-file BOM hides a 2nd cmd=', rcDir(rc({ r: B, digest: D.B, cmd: `node ${toolRel}`, tail: `\uFEFFcmd=node ${extPath}\nOK\n` })), B);
add('B3 mid-file BOM hides a 2nd rev=', rcDir(`rev=${B}\n\uFEFFrev=${A}\ntool_sha256=${D.B}\ncmd=node ${toolRel}\n`), B);
add('B4 BOM inside the rev= value', rcDir(`rev=\uFEFF${A}\ntool_sha256=${D.A}\ncmd=node ${toolRel}\n`), B);
add('B5 BOM inside the tool_sha256= value', rcDir(`rev=${B}\ntool_sha256=\uFEFF${D.B}\ncmd=node ${toolRel}\n`), B);
add('B6 BOM as a cmd= token separator', rcDir(rc({ r: B, digest: D.B, cmd: `node\uFEFF${toolRel}` })), B);
add('B7 ZWSP (U+200B) hides a 2nd cmd=', rcDir(rc({ r: B, digest: D.B, cmd: `node ${toolRel}`, tail: `\u200Bcmd=node ${extPath}\nOK\n` })), B);
add('B8 leading BOM + equal duplicate rev=', rcDir(`\uFEFFrev=${A}\nrev=${A}\ntool_sha256=${D.A}\ncmd=node ${toolRel}\n`), B);
add('B9 leading BOM + CRLF body', rcDir(`\uFEFFrev=${A}\r\ntool_sha256=${D.A}\r\ncmd=node ${toolRel}\r\n`), B);

// ---- item 3: mode-120000 oracle ------------------------------------------------------------
add('O1 rel symlink instrument, LINK-TEXT digest at A', rcDir(rc({ r: A, digest: D.LINKTEXT, cmd: `node ${linkRel}` })), A);
add('O2 target named directly, A digest at A', rcDir(rc({ r: A, digest: D.A, cmd: `node ${toolRel}` })), A);
add('O3 gitlink (submodule) instrument at A', rcDir(rc({ r: A, digest: D.A, cmd: `node ${subRel}` })), A);
add('O4 glob token g*.mjs at C', rcDir(rc({ r: C, digest: D.G1, cmd: `node scripts/g*.mjs` })), C);
add('O5 glob token l*.mjs (symlink first match) at A', rcDir(rc({ r: A, digest: D.LINKTEXT, cmd: `node scripts/l*.mjs` })), A);
add('O6 directory token scripts at A', rcDir(rc({ r: A, digest: D.A, cmd: `node scripts` })), A);
add('O7 eol-normalised file: worktree CRLF digest at C', rcDir(rc({ r: C, digest: D.CRLFWT, cmd: `node ${crlfRel}` })), C);
add('O8 eol-normalised file: blob LF digest at C', rcDir(rc({ r: C, digest: D.CRLFBLob, cmd: `node ${crlfRel}` })), C);

// ---- item 4: TOCTOU ------------------------------------------------------------------------
{
  const outsideRc = join(work, `outside-receipt-${N}.txt`);
  writeFileSync(outsideRc, rc({ r: B, digest: D.B, cmd: `node ${toolRel}` }));
  const d = rcDir({});
  linkSync(outsideRc, join(d, 'a.txt'));
  add('T1 hard link to an outside receipt file', d, B);
}
{
  const realDir = rcDir(rc({ r: B, digest: D.B, cmd: `node ${toolRel}` }));
  const parent = join(work, `parentlink-${N}`);
  symlinkSync(work, parent); // --dir = <work>/parentlink-<N>/rc-..  : symlinked ANCESTOR, real leaf
  add('T2 symlinked ancestor of --dir', join(parent, realDir.split('/').pop()), B, { dirIsLinkAncestor: true });
}
{
  const d = rcDir({});
  mkdirSync(join(d, 'a.txt'));
  add('T3 receipt path is a directory', d, B);
}
{
  const d = rcDir({});
  const r = spawnSync('mkfifo', [join(d, 'a.txt')], { encoding: 'utf8' });
  add(`T4 receipt path is a FIFO${r.status === 0 ? '' : ' (mkfifo failed)'}`, d, B);
}

// ---------------------------------------------------------------------------------------------
const tools = [['base', BASE], ['cand', CAND]];
const results = [];
for (const c of cases) {
  for (const [label, tool] of tools) {
    const args = ['--dir', c.dir, '--rev', c.rev, '--lane', repo];
    const t0 = Date.now();
    const r = runTool(tool, args, { cwd: repo, timeout: c.name.startsWith('T4') ? 8000 : 120000 });
    results.push({
      case: c.name, tool: label, dir: c.dir, rev: c.rev, exit: r.status, signal: r.signal,
      line: r.line, ms: Date.now() - t0,
    });
  }
}
const byCase = new Map();
for (const r of results) {
  if (!byCase.has(r.case)) byCase.set(r.case, {});
  byCase.get(r.case)[r.tool] = r;
}
const pad = (s, w) => String(s).padEnd(w);
const lines = [];
lines.push(`fixture repo=${repo} A=${A} B=${B} C=${C} N=${N}`);
lines.push(`base=${BASE}`);
lines.push(`cand=${CAND}`);
lines.push('');
lines.push(`${pad('attack', 54)} ${pad('base v2', 46)} cand v3`);
for (const [name, r] of byCase) {
  const fmt = (x) => `${x.signal ? `SIG${x.signal}` : `exit=${x.exit}`} ${x.line}`;
  lines.push(`${pad(name, 54)} ${pad(fmt(r.base), 46)} ${fmt(r.cand)}`);
}
writeFileSync(join(OUT, 'attacks.json'), `${JSON.stringify({ fixture, results }, null, 2)}\n`);
writeFileSync(join(OUT, 'attacks.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
