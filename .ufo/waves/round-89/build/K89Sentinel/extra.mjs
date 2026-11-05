#!/usr/bin/env node
// extra.mjs — second attack battery: gitlink at a rev that carries it, committed symlinks whose
// targets are an in-lane /proc alias / a nonexistent path / a relative escape, /proc/self/fd
// descriptors, a bind-mounted instrument, and a --lane reached through a symlink.
//   node extra.mjs --work <SCRATCH> --base <v2.mjs> --cand <v3.mjs> --out <dir>
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { closeSync, mkdirSync, openSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function arg(n, d) { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; }
const work = resolve(arg('--work', ''));
const BASE = resolve(arg('--base', ''));
const CAND = resolve(arg('--cand', ''));
const OUT = resolve(arg('--out', ''));
mkdirSync(work, { recursive: true }); mkdirSync(OUT, { recursive: true });
const N = randomBytes(4).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function env(extra) {
  const e = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0', ...(extra || {}) };
  for (const k of DROP) delete e[k];
  return e;
}
const repo = join(work, `repo2-${N}`);
const outside = join(work, `outside2-${N}`);
mkdirSync(join(repo, 'scripts'), { recursive: true });
mkdirSync(outside, { recursive: true });
const g = (args) => spawnSync('git', ['-C', repo, '-c', `user.name=s${N}`, '-c', `user.email=s${N}@fixture.invalid`,
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { encoding: 'utf8', env: env() });
g(['init', '-q']);
const top = g(['rev-parse', '--show-toplevel']);
if (top.status !== 0 || realpathSync(top.stdout.trim()) !== realpathSync(repo)) { console.error('FIXTURE2 toplevel'); process.exit(2); }
const extPath = join(outside, `ext-${N}.mjs`);
const P = `console.log("tool2 ${N} P");\n`;
const Q = `console.log("tool2 ${N} Q");\n`;
const R = `console.log("tool2 ${N} R dirty");\n`;
const EXT = `console.log("external2 ${N}");\n`;
writeFileSync(extPath, EXT);
const toolRel = `scripts/tool-${N}.mjs`;
const aliasRel = `scripts/alias-${N}.mjs`;   // -> /proc/self/root<lane>/scripts/tool
const goneRel = `scripts/gone-${N}.mjs`;     // -> /nonexistent/xyz.mjs
const reloutRel = `scripts/relout-${N}.mjs`; // -> ../../outside2-<N>/ext
writeFileSync(join(repo, toolRel), P);
symlinkSync(`/proc/self/root${join(repo, toolRel)}`, join(repo, aliasRel));
symlinkSync('/nonexistent/xyz.mjs', join(repo, goneRel));
symlinkSync(join('..', '..', `outside2-${N}`, `ext-${N}.mjs`), join(repo, reloutRel));
g(['add', '-A']);
g(['commit', '-q', '-m', `P ${N}`]);
const P1 = g(['rev-parse', 'HEAD']).stdout.trim();
g(['update-index', '--add', '--cacheinfo', `160000,${P1},scripts/sub-${N}.mjs`]);
g(['commit', '-q', '-m', `gitlink ${N}`]);
const G = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, toolRel), Q);
g(['add', '-A']);
g(['commit', '-q', '-m', `Q ${N}`]);
const P2 = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, toolRel), R); // dirty worktree
const laneLink = join(work, `lanelink-${N}`);
symlinkSync(repo, laneLink);

const D = { P: sha(P), Q: sha(Q), R: sha(R), EXT: sha(EXT), ALIAS: sha(Buffer.from(`/proc/self/root${join(repo, toolRel)}`)) };

function run(tool, args, opts) {
  const o = opts || {};
  const r = spawnSync(process.execPath, [tool, ...args], {
    cwd: o.cwd || repo, encoding: 'utf8', timeout: o.timeout || 60000, maxBuffer: 32 << 20, env: env(), stdio: o.stdio,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  return { status: r.status, signal: r.signal, line: (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0] };
}
let k = 0;
function dir(body) { k += 1; const d = join(work, `x-${String(k).padStart(2, '0')}-${N}`); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'r.txt'), body); return d; }
const rc = ({ r, digest, cmd }) => `rev=${r}\ntool_sha256=${digest}\ncmd=${cmd}\nOK ${N}\n`;

const cases = [];
// gitlink at the rev that carries it
cases.push(['G1 gitlink instrument at G', dir(rc({ r: G, digest: D.P, cmd: `node scripts/sub-${N}.mjs` })), G, {}]);
// committed symlink whose target is an in-lane /proc alias
cases.push(['X1 symlink -> /proc/self/root<lane>/tool, abs token, P digest', dir(rc({ r: P1, digest: D.P, cmd: `node ${join(repo, aliasRel)}` })), P1, {}]);
cases.push(['X2 symlink -> nonexistent outside path, abs token', dir(rc({ r: P1, digest: D.P, cmd: `node ${join(repo, goneRel)}` })), P1, {}]);
cases.push(['X3 symlink -> relative escape, abs token, EXT digest', dir(rc({ r: P1, digest: D.EXT, cmd: `node ${join(repo, reloutRel)}` })), P1, {}]);
cases.push(['X4 symlink -> relative escape, rel token, EXT digest', dir(rc({ r: P1, digest: D.EXT, cmd: `node ${reloutRel}` })), P1, {}]);
// --lane given through a symlink, absolute token using the REAL lane path
cases.push(['X5 --lane via symlink, abs token on the real path, P digest', dir(rc({ r: P1, digest: D.P, cmd: `node ${join(repo, toolRel)}` })), P1, { lane: laneLink }]);
cases.push(['X6 --lane via symlink, abs token on the LINK path, P digest', dir(rc({ r: P1, digest: D.P, cmd: `node ${join(laneLink, toolRel)}` })), P1, { lane: laneLink }]);
// /proc/self/fd: fd 3 is opened by the PARENT and inherited by the instrument
const fdTool = openSync(join(repo, toolRel), 'r');     // dirty worktree bytes R
const fdExt = openSync(extPath, 'r');
cases.push(['X7 /proc/self/fd/3 -> dirty worktree tool, R digest', dir(rc({ r: P1, digest: D.R, cmd: 'node /proc/self/fd/3' })), P1, { stdio: ['ignore', 'pipe', 'pipe', fdTool] }]);
cases.push(['X8 /proc/self/fd/3 -> outside file, EXT digest', dir(rc({ r: P1, digest: D.EXT, cmd: 'node /proc/self/fd/3' })), P1, { stdio: ['ignore', 'pipe', 'pipe', fdExt] }]);
cases.push(['X9 /proc/self/fd/3 -> dirty worktree tool, P digest', dir(rc({ r: P1, digest: D.P, cmd: 'node /proc/self/fd/3' })), P1, { stdio: ['ignore', 'pipe', 'pipe', fdTool] }]);

const results = [];
for (const [name, d, rev, opts] of cases) {
  for (const [label, tool] of [['base', BASE], ['cand', CAND]]) {
    const args = ['--dir', d, '--rev', rev, '--lane', opts.lane || repo];
    const r = run(tool, args, { cwd: repo, stdio: opts.stdio });
    results.push({ case: name, tool: label, exit: r.status, signal: r.signal, line: r.line });
  }
}
closeSync(fdTool); closeSync(fdExt);
const m = new Map();
for (const r of results) { if (!m.has(r.case)) m.set(r.case, {}); m.get(r.case)[r.tool] = r; }
const pad = (s, w) => String(s).padEnd(w);
const lines = [`repo2=${repo} P1=${P1} G=${G} P2=${P2} N=${N}`,
  `symlink-targets: alias=${join(repo, aliasRel)} -> /proc/self/root${join(repo, toolRel)}; gone=${join(repo, goneRel)} -> /nonexistent/xyz.mjs; relout -> ../../outside2-${N}/ext-${N}.mjs`, ''];
lines.push(`${pad('attack', 58)} ${pad('base v2', 44)} cand v3`);
for (const [name, r] of m) {
  const f = (x) => `${x.signal ? `SIG${x.signal}` : `exit=${x.exit}`} ${x.line}`;
  lines.push(`${pad(name, 58)} ${pad(f(r.base), 44)} ${f(r.cand)}`);
}
writeFileSync(join(OUT, 'extra.json'), `${JSON.stringify({ repo, outside, P1, G, P2, D, results }, null, 2)}\n`);
writeFileSync(join(OUT, 'extra.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
