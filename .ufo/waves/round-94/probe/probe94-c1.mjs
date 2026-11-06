#!/usr/bin/env node
/**
 * probe94-c1.mjs — frozen counter for kumitate round 94, claim C1 (operability):
 * `round-gate` resolves SOURCES-declared upstream commit pins.
 *
 *   node probe94-c1.mjs --tool <candidate round-gate.mjs> --work <scratch dir>
 *       [--lane DIR] [--freeze REV] [--fleet DIR] [--fleet-rev REV] [--origin DIR]
 *
 * Read-only on --lane / --fleet / --origin: it clones the lane with `git clone --shared` into
 * --work, checks out --freeze detached, copies the candidate beside the base gate in the clone
 * (`scripts/round-gate-cand.mjs`, so `./cap-spawn.mjs` resolves), materialises every
 * `.ufo/reports/round-N/kumitate.md` of --fleet at --fleet-rev into --work, and runs BASE
 * (`git show <freeze>:scripts/round-gate.mjs`) and CANDIDATE on every round with --json.
 * Synthetic fixture repos are built under --work with `git -C <fixture>` only (toplevel asserted).
 *
 * Predicate C94_C1 HELD iff all of:
 *  (a) FIX     round 93: candidate COMMIT_CITED_UNRESOLVED ok, citations.unresolved = [],
 *              citations.declared contains both 79fa222e and its 40-hex form.
 *  (b) KEEP    rounds 12 46 53 57 61 62 63: candidate unresolved set == BASE unresolved set ==
 *              the frozen expected literal, and the check stays failing.
 *  (c) NO-REG  every round: candidate (id, ok) check vector == BASE vector and exit equal,
 *              except round 93's COMMIT_CITED_UNRESOLVED / exit; candidate declared = [] on
 *              every round other than 93.
 *  (d) FIXTURE synthetic SOURCES registry: declared == exactly {url8, full, commitfrag};
 *              unresolved == exactly {digest, prose, rejected, mid, none}; a second fixture with
 *              no corpus/SOURCES.md: all 8 tokens unresolved, verdict DRIFT, no INTERNAL_ERROR.
 *  (e) SELFTEST candidate `--selftest` exits 0 and prints `VERDICT: PASS`.
 * Exit: 0 HELD · 1 UNMET · 2 SETUP (environment drift: BASE does not reproduce the frozen
 * baseline, or a fixture/clone step failed).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const FREEZE = opt('--freeze', null);
const FLEET = resolve(opt('--fleet', '/home/vgpnk/Projects/shokunin'));
const FLEET_REV = opt('--fleet-rev', '87de49a6cb15d3ff15b0ba85a6f32f2671a23d1a');
const ORIGIN = resolve(opt('--origin', '/home/vgpnk/Projects/ufo-fsd-alpha'));
const TOOL = opt('--tool', null);
const WORK = opt('--work', null);

const FIX_ROUND = 93;
const FIX_TOKENS = ['79fa222e', '79fa222e8390aed3494f4bc6746814e6c74c21cf'];
const KEEP = {
  12: ['23e476e21'],
  46: ['7af3d978'],
  53: ['b717dc035bf687a3039123f4c70527bd3774f510'],
  57: ['1cd6d667e20075fd2e77e6e655bc755f95e3d940'],
  61: ['4247d2d', 'ab902da2fa30d051455a5f3563627e2c23c3a74d'],
  62: ['4247d2da937842bd6846874d548b7125b356e14c'],
  63: ['9237a72'],
};

const out = [];
const say = (s) => { out.push(s); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 600000, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);
function setup(msg) { say(`SETUP: ${msg}`); finish(2); }
function finish(code) {
  process.stdout.write(`${out.join('\n')}\n`);
  process.exit(code);
}

if (!TOOL || !WORK || !FREEZE) setup('usage: --tool --work --freeze are required');
const toolBytes = readFileSync(TOOL);
mkdirSync(WORK, { recursive: true });
const W = realpathSync(WORK);
rmSync(join(W, 'p94'), { recursive: true, force: true });
const P = join(W, 'p94');
mkdirSync(P, { recursive: true });

/* clone ------------------------------------------------------------------- */
const CL = join(P, 'lane');
let r = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, CL]);
if (r.status !== 0) setup(`clone: ${r.stderr}`);
if (git(CL, ['rev-parse', '--show-toplevel']).stdout.trim() !== CL) setup('clone toplevel mismatch');
r = git(CL, ['-c', 'advice.detachedHead=false', 'checkout', '-q', '--detach', FREEZE]);
if (r.status !== 0) setup(`checkout ${FREEZE}: ${r.stderr}`);
const baseBytes = git(CL, ['show', `${FREEZE}:scripts/round-gate.mjs`]).stdout;
const BASE = join(CL, 'scripts', 'round-gate.mjs');
const CAND = join(CL, 'scripts', 'round-gate-cand.mjs');
copyFileSync(TOOL, CAND);
say(`C94 freeze=${FREEZE} fleet_rev=${FLEET_REV} base_sha256=${sha(baseBytes)} tool_sha256=${sha(toolBytes)}`);

/* reports at the fleet pin ------------------------------------------------- */
const RD = join(P, 'reports');
const ls = git(FLEET, ['ls-tree', '-r', '--name-only', FLEET_REV, '.ufo/reports']);
if (ls.status !== 0) setup(`fleet ls-tree: ${ls.stderr}`);
const rounds = [];
const manifest = [];
for (const p of ls.stdout.split('\n')) {
  const m = /^\.ufo\/reports\/round-(\d+)\/kumitate\.md$/.exec(p);
  if (!m) continue;
  const n = Number(m[1]);
  const body = git(FLEET, ['show', `${FLEET_REV}:${p}`]);
  if (body.status !== 0) setup(`fleet show ${p}`);
  mkdirSync(join(RD, `round-${n}`), { recursive: true });
  writeFileSync(join(RD, `round-${n}`, 'kumitate.md'), body.stdout);
  manifest.push(`${n} ${sha(body.stdout)}`);
  rounds.push(n);
}
rounds.sort((a, b) => a - b);
say(`C94 reports=${rounds.length} manifest_sha256=${sha(manifest.sort().join('\n'))}`);

const gate = (tool, round, repo, reports, main, origin) => {
  const g = run(process.execPath, [tool, '--round', String(round), '--lane', 'kumitate', '--repo', repo,
    '--reports-dir', reports, '--main-repo', main, '--origin', origin, '--json'], { cwd: repo });
  let j = null;
  try { j = JSON.parse(g.stdout); } catch { j = null; }
  return { status: g.status, j, stderr: g.stderr };
};
const vec = (j) => (j && Array.isArray(j.checks) ? j.checks.map((c) => `${c.id}:${c.ok}`) : null);
const item = (j, id) => (j && Array.isArray(j.checks) ? j.checks.find((c) => c.id === id) : undefined);
const setEq = (a, b) => a.length === b.length && [...a].sort().join(' ') === [...b].sort().join(' ');
const decl = (j) => (j && j.citations && Array.isArray(j.citations.declared) ? j.citations.declared : []);
const unres = (j) => (j && j.citations && Array.isArray(j.citations.unresolved) ? j.citations.unresolved : null);

/* (a)(b)(c) over every filed report ----------------------------------------- */
let aOk = false; let bOk = 0; let cOk = 0; const fails = [];
for (const n of rounds) {
  const b = gate(BASE, n, CL, RD, FLEET, ORIGIN);
  const c = gate(CAND, n, CL, RD, FLEET, ORIGIN);
  if (!b.j) setup(`BASE produced no JSON on round ${n} (exit ${b.status})`);
  const bu = unres(b.j);
  if (n === FIX_ROUND && !setEq(bu, FIX_TOKENS)) setup(`BASE round ${n} unresolved=${JSON.stringify(bu)} != frozen`);
  if (KEEP[n] && !setEq(bu, KEEP[n])) setup(`BASE round ${n} unresolved=${JSON.stringify(bu)} != frozen`);
  if (!KEEP[n] && n !== FIX_ROUND && bu.length) setup(`BASE round ${n} has unexpected unresolved ${JSON.stringify(bu)}`);
  if (!c.j) { fails.push(`r${n}:cand-no-json(exit=${c.status})`); continue; }
  const bv = vec(b.j); const cv = vec(c.j);
  if (n === FIX_ROUND) {
    const it = item(c.j, 'COMMIT_CITED_UNRESOLVED');
    aOk = Boolean(it && it.ok === true) && unres(c.j) !== null && unres(c.j).length === 0
      && FIX_TOKENS.every((t) => decl(c.j).includes(t));
    const strip = (v) => v.filter((x) => !x.startsWith('COMMIT_CITED_UNRESOLVED:'));
    if (setEq(strip(bv), strip(cv)) && bv.join() !== '' && strip(bv).join('|') === strip(cv).join('|')) cOk++;
    else fails.push(`r${n}:vector`);
    say(`C94 r${n} FIX base_exit=${b.status} cand_exit=${c.status} declared=${JSON.stringify(decl(c.j))} unresolved=${JSON.stringify(unres(c.j))} a=${aOk}`);
    continue;
  }
  const sameVec = bv.join('|') === cv.join('|') && b.status === c.status && decl(c.j).length === 0;
  if (sameVec) cOk++; else fails.push(`r${n}:vector(base_exit=${b.status},cand_exit=${c.status},declared=${decl(c.j).length})`);
  if (KEEP[n]) {
    const it = item(c.j, 'COMMIT_CITED_UNRESOLVED');
    const ok = unres(c.j) !== null && setEq(unres(c.j), KEEP[n]) && it && it.ok === false;
    if (ok) bOk++; else fails.push(`r${n}:keep`);
    say(`C94 r${n} KEEP cand_unresolved=${JSON.stringify(unres(c.j))} ok=${Boolean(ok)}`);
  }
}
const keepN = Object.keys(KEEP).length;

/* (d) synthetic fixtures ---------------------------------------------------- */
const hex = (seed) => sha(`kumitate-r94-${seed}`).slice(0, 40);
const PIN = { A: hex('A'), B: hex('B'), C: hex('C'), D: hex('D'), E: hex('E') };
const TOK = {
  url8: PIN.A.slice(0, 8),
  full: PIN.A,
  commitfrag: PIN.B.slice(0, 10),
  digest: PIN.C.slice(0, 12),
  prose: PIN.D.slice(0, 9),
  rejected: PIN.E.slice(0, 8),
  mid: PIN.A.slice(10, 18),
  none: hex('none').slice(0, 8),
};
const EXP_DECL = ['url8', 'full', 'commitfrag'];
const EXP_UNRES = ['digest', 'prose', 'rejected', 'mid', 'none'];
const row = (id, src, status) => `| ${id} | ${src} | code | A | scope | anchor | teaches | ${status} | 2026-11-06 | 30d | — |`;
const SOURCES = [
  '# SOURCES — fixture', '',
  `Prose mention, not a registry row: https://github.com/o/r/blob/${PIN.D}/x.ts`, '',
  '## Registry', '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  row('S001', `x.ts — https://github.com/o/r/blob/${PIN.A}/x.ts`, 'mined'),
  row('S002', `commit — https://github.com/o/r/commit/${PIN.B}#diff-1`, 'mined'),
  row('S003', `capture sha256 ${PIN.C}${PIN.C.slice(0, 24)}`, 'mined'),
  row('S004', `rejected — https://github.com/o/r/blob/${PIN.E}/y.ts`, 'rejected'),
  '',
].join('\n');
const tokLine = Object.values(TOK).map((t) => `\`${t}\``).join(' ');
const reportText = `# kumitate round-1 fixture\n\n## Work\n\nCited: ${tokLine}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`;
function fixture(name, withSources) {
  const F = join(P, `fx-${name}`);
  mkdirSync(join(F, 'corpus'), { recursive: true });
  let g = git(F, ['init', '-q', '-b', 'main']);
  if (g.status !== 0 || git(F, ['rev-parse', '--show-toplevel']).stdout.trim() !== F) setup(`fixture ${name} init`);
  writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(F, 'LOG.md'), '- 2026-11-06 — round 1 fixture\n');
  if (withSources) writeFileSync(join(F, 'corpus', 'SOURCES.md'), SOURCES);
  else writeFileSync(join(F, 'corpus', 'README.md'), 'no registry\n');
  g = git(F, ['add', '-A']);
  g = git(F, ['-c', 'user.name=p94', '-c', 'user.email=p94@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) setup(`fixture ${name} commit: ${g.stderr}`);
  const R = join(F, '..', `fx-${name}-reports`);
  mkdirSync(join(R, 'round-1'), { recursive: true });
  writeFileSync(join(R, 'round-1', 'kumitate.md'), reportText);
  return { F, R };
}
const names = (list) => Object.entries(TOK).filter(([, t]) => list.includes(t)).map(([k]) => k);
const fx1 = fixture('sources', true);
const d1 = gate(CAND, 1, fx1.F, fx1.R, fx1.F, fx1.F);
const d1decl = names(decl(d1.j)); const d1un = names(unres(d1.j) ?? []);
const dOk1 = Boolean(d1.j) && setEq(d1decl, EXP_DECL) && setEq(d1un, EXP_UNRES);
say(`C94 FX sources exit=${d1.status} declared=[${d1decl.join(' ')}] unresolved=[${d1un.join(' ')}] ok=${dOk1}`);
const fx2 = fixture('nosources', false);
const d2 = gate(CAND, 1, fx2.F, fx2.R, fx2.F, fx2.F);
const d2un = names(unres(d2.j) ?? []);
const dOk2 = Boolean(d2.j) && d2.j.verdict === 'DRIFT' && d2un.length === 8 && decl(d2.j).length === 0
  && !(d2.j.findings ?? []).some((f) => f.kind === 'INTERNAL_ERROR');
say(`C94 FX nosources exit=${d2.status} verdict=${d2.j ? d2.j.verdict : 'none'} unresolved=${d2un.length}/8 ok=${dOk2}`);

/* (e) selftest -------------------------------------------------------------- */
const st = run(process.execPath, [CAND, '--selftest'], { cwd: CL });
const stLine = (st.stdout.match(/^ROUND_GATE_SELFTEST: .*$/m) ?? ['none'])[0];
const eOk = st.status === 0 && /^VERDICT: PASS$/m.test(st.stdout);
say(`C94 SELFTEST exit=${st.status} ${stLine} ok=${eOk}`);

const held = aOk && bOk === keepN && cOk === rounds.length && dOk1 && dOk2 && eOk;
say(`C94 fails=${fails.length ? fails.slice(0, 12).join(',') : 'none'}`);
say(`C94_C1: ${held ? 'HELD' : 'UNMET'} a=${aOk ? 1 : 0}/1 b=${bOk}/${keepN} c=${cOk}/${rounds.length} d=${(dOk1 ? 1 : 0) + (dOk2 ? 1 : 0)}/2 e=${eOk ? 1 : 0}/1 tool_sha256=${sha(toolBytes)}`);
rmSync(P, { recursive: true, force: true });
finish(held ? 0 : 1);
