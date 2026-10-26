// h2-harness.mjs — K65MutateToolRender: the FROZEN probe's H2 logic run verbatim against a
// mutant tool, staged via a scratch clone commit (git archive -> run). build/runCase/h2 are copied
// byte-for-byte from .ufo/waves/round-65/probe/harm65-probe.mjs (the original is never edited).
// usage: node h2-harness.mjs <scratch-clone-dir> <rev>
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const lane = resolve(process.argv[2]);
const rev = process.argv[3];
const git = (dir, args, o = {}) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, ...o });

const scratch = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); scratch.push(d); return d; };
const done = (code) => { for (const d of scratch) rmSync(d, { recursive: true, force: true }); process.exit(code); };
const archive = (r) => {
  const T = tmp('h65h2.arc.');
  const res = spawnSync('bash', ['-c', `git -C "${lane}" archive "${r}" | tar -x -C "${T}"`], { encoding: 'utf8' });
  return res.status === 0 ? T : null;
};
const A = archive(rev);
if (!A) { console.log(`H2VIEW archive-failed rev=${rev}`); done(2); }

function build(spec) {
  const D = tmp('h65h2.fx.');
  const g = (a) => git(D, a);
  git(D, ['init', '-q']);
  if (realpathSync(git(D, ['rev-parse', '--show-toplevel']).stdout.trim()) !== D) throw new Error('fixture toplevel mismatch');
  const put = (files) => { for (const [p, b] of Object.entries(files || {})) { mkdirSync(dirname(join(D, p)), { recursive: true }); writeFileSync(join(D, p), b); } };
  put(spec.base);
  writeFileSync(join(D, 'gates.json'), spec.gates_raw !== undefined ? spec.gates_raw : JSON.stringify({ gates: spec.gates }));
  g(['add', '-A']); g(['commit', '-q', '-m', 'b']);
  const b = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  put(spec.tip);
  for (const p of spec.tip_delete || []) rmSync(join(D, p), { force: true });
  g(['add', '-A']);
  if (!spec.same_rev) g(['commit', '-q', '--allow-empty', '-m', 't']);
  return { D, b, t: git(D, ['rev-parse', 'HEAD']).stdout.trim() };
}
function runCase(toolCmd, spec) {
  const fx = build(spec);
  const sub = (s) => String(s).replaceAll('{BASE}', fx.b).replaceAll('{TIP}', fx.t).replaceAll('{DIR}', fx.D);
  const args = (spec.args || ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json']).map(sub);
  const r = spawnSync(toolCmd[0], [...toolCmd.slice(1), '--lane', fx.D, ...args], { encoding: 'utf8', timeout: 120000 });
  const rows = r.stdout.split('\n').filter((l) => l.startsWith('HARM_ROW ')).map((l) => { const m = /gate=(\S+) .* id=(\S+) base_text/.exec(l); return m ? `${m[1]} ${m[2]}` : l; }).sort();
  return { exit: r.status, rows };
}
const controlsDir = join(A, '.ufo/waves/round-65/controls/harm');
const specs = existsSync(controlsDir)
  ? readdirSync(controlsDir).filter((d) => /^case-\d+/.test(d)).sort().map((d) => { try { return { name: d, spec: JSON.parse(readFileSync(join(controlsDir, d, 'spec.json'), 'utf8')) }; } catch { return { name: d, spec: null }; } })
  : [];
function h2(toolCmd) {
  const why = [];
  if (specs.length < 14) why.push(`controls=${specs.length}<14`);
  const ids = new Set(); let zero = 0;
  for (const { name, spec } of specs) {
    if (!spec || !spec.expect) { why.push(`${name}:spec-unreadable`); continue; }
    let got;
    try { got = runCase(toolCmd, spec); } catch (e) { why.push(`${name}:threw`); continue; }
    const want = [...spec.expect.rows].sort();
    if (got.exit !== spec.expect.exit || JSON.stringify(got.rows) !== JSON.stringify(want)) why.push(`${name}:got exit=${got.exit} rows=${JSON.stringify(got.rows)}`);
    for (const r of spec.expect.rows) ids.add(r.split(' ')[1]);
    if (spec.expect.exit === 0) zero++;
  }
  if (ids.size < 8) why.push(`ids=${ids.size}<8`);
  if (zero < 2) why.push(`exit0-cases=${zero}<2`);
  return why;
}

const TOOL = ['node', join(A, 'scripts/harm-matrix.mjs')];
const why = h2(TOOL);
const killedCases = why.filter((w) => /^case-\d+/.test(w)).map((w) => w.split(':')[0]);
console.log(`H2VIEW rev=${rev} specs=${specs.length} why_n=${why.length} cases_missed=${JSON.stringify(killedCases)} why=${JSON.stringify(why.slice(0, 6))}`);
done(0);
