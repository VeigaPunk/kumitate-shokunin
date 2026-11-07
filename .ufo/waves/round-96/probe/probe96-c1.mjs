#!/usr/bin/env node
/**
 * probe96-c1.mjs — frozen counter for kumitate round 96, claim C1 (operability):
 * `round-gate` declares pins only from SOURCES.md rows inside the `## Registry` section as the fleet
 * census defines it (sources-census.sh row_pass: `^ {0,3}##[ \t]` sets the section, its [ \t]-trimmed
 * text must equal `Registry`; `^ {0,3}#[ \t]` clears it; the state starts outside). A row-shaped line
 * outside declares nothing, is not field-count checked, and its id is listed in file order (repeats
 * kept) in `citations.outsideRows`, present on every `citations` object; text mode prints one
 * non-finding line `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<n> [<ids>]` when n > 0.
 *
 *   node probe96-c1.mjs --tool <candidate round-gate.mjs> --work <scratch dir> --freeze <REV>
 *       [--lane DIR] [--fleet DIR] [--fleet-rev REV] [--origin DIR] [--census PATH]
 *
 * Read-only on --lane / --fleet / --origin. It clones the lane (`git clone --shared`) into --work,
 * checks out --freeze detached, copies the candidate beside the base gate in the clone
 * (`scripts/round-gate-cand.mjs`, so `./cap-spawn.mjs` resolves), materialises every
 * `.ufo/reports/round-N/kumitate.md` of --fleet at --fleet-rev, and runs BASE
 * (`git show <freeze>:scripts/round-gate.mjs`) and CANDIDATE. Fixture repos are built under --work
 * with `git -C <fixture>` only (toplevel asserted).
 *
 * The clause battery (round-95 lesson M95-2): fixture A carries every section clause the rule names —
 * a row on line 1, before any heading; a `###` sub-heading inside the Registry; a 4-space-indented and a
 * space-less `##` line (not headings); a `## ` line inside a ``` fence (a heading to the census);
 * a re-opened `## Registry` with a 3-space-indented row; outside rows that are repeated, low-sorting,
 * URL-less, `rejected` and 12-field; `## Registry ##`, `## registry`, a CRLF `## Registry\r`;
 * `##<TAB>Registry` and `   ## Registry  ` (inside); a `#` heading. Fixture B is a whole-CRLF registry.
 * The expected id lists are frozen below AND must equal the census's own E12 / E01 id lists for the
 * same file (`sources-census.sh validate --file`); a census disagreement with the frozen list is SETUP.
 *
 * Predicate C96_C1 HELD iff all of:
 *  (a) FIX-A   candidate --json: citations.declared == exactly the 7 inside, 13-field, non-rejected
 *              tokens; unresolved == the other 13 tokens; outsideRows == EXP_OUT_A (file order,
 *              repeats kept) == census E12 ids; malformedRows == ['S002'] == census E01 ids.
 *  (b) FIX-B   whole-CRLF registry: declared empty; outsideRows == ['S101','S102','S103'] == census
 *              E12 ids; malformedRows == [] == census E01 ids.
 *  (c) TEXT    candidate text mode on FIX-A prints exactly one line
 *              `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=11 [<EXP_OUT_A>]` and keeps the r95 line
 *              `ROUND_GATE  info  SOURCES_ROWS_MALFORMED  malformed=1 [S002]`.
 *  (d) CLOSED  fixture without corpus/SOURCES.md: outsideRows == [] and malformedRows == []; and the
 *              fail-closed path (--reports-dir missing): exit 2 with citations.outsideRows == [].
 *  (e) NO-REG  every filed kumitate report at --fleet-rev: candidate (id, ok) check vector == BASE,
 *              exit equal, declared set == BASE, outsideRows == [] and malformedRows == [].
 *  (f) SELFTEST candidate `--selftest` exits 0 and prints `VERDICT: PASS`.
 * Exit: 0 HELD · 1 UNMET · 2 SETUP (environment drift: BASE gives no JSON, the census disagrees with
 * the frozen fixture lists, or a clone/fixture step failed).
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
const FLEET_REV = opt('--fleet-rev', '056a9c4813fe9baa4f994e145459612151e5ace5');
const ORIGIN = resolve(opt('--origin', '/home/vgpnk/Projects/ufo-fsd-alpha'));
const CENSUS = resolve(opt('--census', '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'));
const TOOL = opt('--tool', null);
const WORK = opt('--work', null);

const out = [];
const say = (s) => { out.push(s); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 600000, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);
function finish(code) {
  process.stdout.write(`${out.join('\n')}\n`);
  process.exit(code);
}
function setup(msg) { say(`SETUP: ${msg}`); finish(2); }

if (!TOOL || !WORK || !FREEZE) setup('usage: --tool --work --freeze are required');
const toolBytes = readFileSync(TOOL);
mkdirSync(WORK, { recursive: true });
const W = realpathSync(WORK);
const P = join(W, 'p96');
rmSync(P, { recursive: true, force: true });
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
say(`C96 freeze=${FREEZE} fleet_rev=${FLEET_REV} base_sha256=${sha(baseBytes)} tool_sha256=${sha(toolBytes)}`);

const gate = (tool, round, repo, reports, main, origin, json = true) => {
  const g = run(process.execPath, [tool, '--round', String(round), '--lane', 'kumitate', '--repo', repo,
    '--reports-dir', reports, '--main-repo', main, '--origin', origin, ...(json ? ['--json'] : [])], { cwd: repo });
  let j = null;
  if (json) { try { j = JSON.parse(g.stdout); } catch { j = null; } }
  return { status: g.status, j, stdout: g.stdout, stderr: g.stderr };
};
const vec = (j) => (j && Array.isArray(j.checks) ? j.checks.map((c) => `${c.id}:${c.ok}`) : null);
const setEq = (a, b) => a.length === b.length && [...a].sort().join(' ') === [...b].sort().join(' ');
const listEq = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
const cit = (j) => (j && j.citations && typeof j.citations === 'object' ? j.citations : {});
const decl = (j) => (Array.isArray(cit(j).declared) ? cit(j).declared : []);
const unres = (j) => (Array.isArray(cit(j).unresolved) ? cit(j).unresolved : []);
const outs = (j) => (Array.isArray(cit(j).outsideRows) ? cit(j).outsideRows : null);
const malf = (j) => (Array.isArray(cit(j).malformedRows) ? cit(j).malformedRows : null);

/* fixtures ---------------------------------------------------------------- */
const hex = (seed) => sha(`kumitate-r96-${seed}`).slice(0, 40);
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const row = (id, pin, status = 'mined', tail = ' 2026-11-07 | 30d | — |') =>
  `| ${id} | ${id.toLowerCase()}.ts — ${pin ? url(pin) : 'no url here'} | code | A | scope-${id} | anchor | teaches | ${status} |${tail}`;
const SHORT = ' 2026-11-07 | 30d |';
const HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|'];
// Fixture A: [token name, row id, pin seed or null] in file order, with the section lines between.
const PIN = {};
const pin = (k) => { PIN[k] = hex(k); return PIN[k]; };
const FA = [
  row('S901', pin('pre')),                                   // line 1, before any heading: outside
  '# SOURCES — fixture r96 A', '',
  `Prose mention, not a row: ${url(pin('prose'))}`, '',
  '## Registry', '', ...HDR,
  row('S001', pin('okA')),                                   // inside: declares
  row('S002', pin('shortB'), 'mined', SHORT),                // inside, 12 fields: malformed
  row('S003', pin('rejC'), 'rejected'),                      // inside, rejected: nothing
  '', '### Sub-band (a level-3 heading stays inside)', '',
  row('S004', pin('h3D')),                                   // inside: declares
  '    ## Leads (4-space indent: not a heading)',
  row('S005', pin('ind4E')),                                 // inside: declares
  '##Leads (no space: not a heading)',
  row('S006', pin('nospF')),                                 // inside: declares
  '```text', '## Leads (inside a fence: a heading to the census)', '```',
  row('S007', pin('fenceG')),                                // outside
  '', '## Registry', '',
  `   ${row('S008', pin('reopenH'))}`,                       // re-opened, 3-space row: declares
  '', '## Leads (unopened)', '',
  row('S020', pin('leadI')),                                 // outside
  row('S011', null),                                         // outside, URL-less, low-sorting
  row('S020', pin('leadJ')),                                 // outside, repeated id
  row('S021', pin('leadrejK'), 'rejected'),                  // outside, rejected
  row('S022', pin('leadshortL'), 'mined', SHORT),            // outside, 12 fields (not malformedRows)
  '', '## Registry ##', '',
  row('S023', pin('closeM')),                                // outside (census text "Registry ##")
  '', '## registry', '',
  row('S024', pin('lowerN')),                                // outside (case)
  '', '## Registry\r', '',
  row('S025', pin('crO')),                                   // outside (census keeps \r)
  '', '##\tRegistry', '',
  row('S026', pin('tabP')),                                  // inside: declares
  '', '   ## Registry  ', '',
  row('S027', pin('ind3Q')),                                 // inside: declares
  '', '# Appendix', '',
  row('S028', pin('h1R')),                                   // outside
  '',
].join('\n');
const EXP_DECL_A = ['okA', 'h3D', 'ind4E', 'nospF', 'reopenH', 'tabP', 'ind3Q'];
const EXP_OUT_A = ['S901', 'S007', 'S020', 'S011', 'S020', 'S021', 'S022', 'S023', 'S024', 'S025', 'S028'];
const EXP_MALF_A = ['S002'];
const FB = ['# SOURCES — fixture r96 B (whole file CRLF)', '', '## Registry', '', ...HDR,
  row('S101', pin('crlfS')), row('S102', pin('crlfT')), row('S103', pin('crlfU'), 'rejected'), ''].join('\r\n');
const EXP_OUT_B = ['S101', 'S102', 'S103'];
const TOK = Object.fromEntries(Object.entries(PIN).map(([k, v]) => [k, v.slice(0, 8)]));
TOK.none = hex('none').slice(0, 8);
const tokLine = Object.values(TOK).map((t) => `\`${t}\``).join(' ');
const reportText = `# kumitate round-1 fixture\n\n## Work\n\nCited: ${tokLine}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`;
const names = (list) => Object.entries(TOK).filter(([, t]) => list.includes(t)).map(([k]) => k);

function fixture(name, sources) {
  const F = join(P, `fx-${name}`);
  mkdirSync(join(F, 'corpus'), { recursive: true });
  let g = git(F, ['init', '-q', '-b', 'main']);
  if (g.status !== 0 || git(F, ['rev-parse', '--show-toplevel']).stdout.trim() !== F) setup(`fixture ${name} init`);
  writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(F, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
  if (sources !== null) writeFileSync(join(F, 'corpus', 'SOURCES.md'), sources);
  else writeFileSync(join(F, 'corpus', 'README.md'), 'no registry\n');
  g = git(F, ['add', '-A']);
  g = git(F, ['-c', 'core.autocrlf=false', '-c', 'user.name=p96', '-c', 'user.email=p96@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) setup(`fixture ${name} commit: ${g.stderr}`);
  const R = join(F, '..', `fx-${name}-reports`);
  mkdirSync(join(R, 'round-1'), { recursive: true });
  writeFileSync(join(R, 'round-1', 'kumitate.md'), reportText);
  return { F, R };
}
function censusIds(file) {
  const c = run('bash', [CENSUS, 'validate', '--file', file]);
  if (c.status !== 0 && c.status !== 1) setup(`census rc=${c.status}: ${c.stderr.slice(0, 200)}`);
  const ids = (code) => c.stdout.split('\n').filter((l) => l.split('\t')[1] === code).map((l) => l.split('\t')[2].split(' ')[0]);
  return { e12: ids('E12'), e01: ids('E01') };
}

const fa = fixture('a', FA);
const ca = censusIds(join(fa.F, 'corpus', 'SOURCES.md'));
if (!listEq(ca.e12, EXP_OUT_A) || !listEq(ca.e01, EXP_MALF_A)) setup(`census A E12=[${ca.e12.join(' ')}] E01=[${ca.e01.join(' ')}] != frozen lists`);
const fb = fixture('b', FB);
const cb = censusIds(join(fb.F, 'corpus', 'SOURCES.md'));
if (!listEq(cb.e12, EXP_OUT_B) || cb.e01.length !== 0) setup(`census B E12=[${cb.e12.join(' ')}] E01=[${cb.e01.join(' ')}] != frozen lists`);
const crlfOnDisk = readFileSync(join(fb.F, 'corpus', 'SOURCES.md'), 'utf8').split('\r\n').length;
if (crlfOnDisk < 8) setup('fixture B is not CRLF on disk');
say(`C96 census A E12=[${ca.e12.join(' ')}] E01=[${ca.e01.join(' ')}] B E12=[${cb.e12.join(' ')}] E01=[${cb.e01.join(' ')}] (= frozen)`);

/* (a) FIX-A */
const ja = gate(CAND, 1, fa.F, fa.R, fa.F, fa.F);
const aDecl = names(decl(ja.j)); const aUn = names(unres(ja.j));
const allNames = Object.keys(TOK);
const aOk = Boolean(ja.j) && setEq(aDecl, EXP_DECL_A) && setEq(aUn, allNames.filter((n) => !EXP_DECL_A.includes(n)))
  && listEq(outs(ja.j), EXP_OUT_A) && listEq(outs(ja.j), ca.e12) && listEq(malf(ja.j), EXP_MALF_A) && listEq(malf(ja.j), ca.e01);
say(`C96 FIX-A exit=${ja.status} declared=[${aDecl.join(' ')}] unresolved=${aUn.length}/${allNames.length - EXP_DECL_A.length} outsideRows=${JSON.stringify(outs(ja.j))} malformedRows=${JSON.stringify(malf(ja.j))} ok=${aOk}`);
const ba = gate(BASE, 1, fa.F, fa.R, fa.F, fa.F);
say(`C96 FIX-A BASE exit=${ba.status} declared=[${names(decl(ba.j)).join(' ')}] outsideRows=${JSON.stringify(outs(ba.j))} malformedRows=${JSON.stringify(malf(ba.j))}`);

/* (b) FIX-B */
const jb = gate(CAND, 1, fb.F, fb.R, fb.F, fb.F);
const bOk = Boolean(jb.j) && decl(jb.j).length === 0 && listEq(outs(jb.j), EXP_OUT_B) && listEq(outs(jb.j), cb.e12)
  && listEq(malf(jb.j), []);
say(`C96 FIX-B exit=${jb.status} declared=[${names(decl(jb.j)).join(' ')}] outsideRows=${JSON.stringify(outs(jb.j))} malformedRows=${JSON.stringify(malf(jb.j))} ok=${bOk}`);

/* (c) TEXT */
const ta = gate(CAND, 1, fa.F, fa.R, fa.F, fa.F, false);
const tLines = ta.stdout.split('\n');
const wantOut = `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=${EXP_OUT_A.length} [${EXP_OUT_A.join(' ')}]`;
const wantMal = 'ROUND_GATE  info  SOURCES_ROWS_MALFORMED  malformed=1 [S002]';
const nOutLines = tLines.filter((l) => l.includes('SOURCES_ROWS_OUTSIDE')).length;
const cOk = nOutLines === 1 && tLines.includes(wantOut) && tLines.includes(wantMal);
say(`C96 TEXT exit=${ta.status} outside_lines=${nOutLines} exact=${tLines.includes(wantOut)} malformed_line=${tLines.includes(wantMal)} ok=${cOk}`);

/* (d) CLOSED: no registry + fail-closed path */
const fn = fixture('nosrc', null);
const jn = gate(CAND, 1, fn.F, fn.R, fn.F, fn.F);
const jf = gate(CAND, 1, fn.F, join(P, 'no-such-reports'), fn.F, fn.F);
const dOk = Boolean(jn.j) && listEq(outs(jn.j), []) && listEq(malf(jn.j), []) && decl(jn.j).length === 0
  && Boolean(jf.j) && jf.status === 2 && jf.j.verdict === 'FAIL-CLOSED' && listEq(outs(jf.j), []) && listEq(malf(jf.j), []);
say(`C96 CLOSED nosrc exit=${jn.status} outsideRows=${JSON.stringify(outs(jn.j))} failclosed exit=${jf.status} verdict=${jf.j ? jf.j.verdict : 'none'} outsideRows=${JSON.stringify(outs(jf.j))} ok=${dOk}`);

/* (e) every filed report at the fleet pin */
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
say(`C96 reports=${rounds.length} manifest_sha256=${sha(manifest.sort().join('\n'))}`);
let eOk = 0; const fails = [];
for (const n of rounds) {
  const b = gate(BASE, n, CL, RD, FLEET, ORIGIN);
  const c = gate(CAND, n, CL, RD, FLEET, ORIGIN);
  if (!b.j) setup(`BASE produced no JSON on round ${n} (exit ${b.status})`);
  if (!c.j) { fails.push(`r${n}:cand-no-json(exit=${c.status})`); continue; }
  const ok = vec(b.j).join('|') === vec(c.j).join('|') && b.status === c.status
    && setEq(decl(b.j), decl(c.j)) && listEq(outs(c.j), []) && listEq(malf(c.j), []);
  if (ok) eOk++;
  else fails.push(`r${n}:(base_exit=${b.status},cand_exit=${c.status},declared=${decl(c.j).length}/${decl(b.j).length},outsideRows=${JSON.stringify(outs(c.j))})`);
}

/* (f) selftest */
const st = run(process.execPath, [CAND, '--selftest'], { cwd: CL });
const stLine = (st.stdout.match(/^ROUND_GATE_SELFTEST: .*$/m) ?? ['none'])[0];
const fOk = st.status === 0 && /^VERDICT: PASS$/m.test(st.stdout);
say(`C96 SELFTEST exit=${st.status} ${stLine} ok=${fOk}`);

const held = aOk && bOk && cOk && dOk && eOk === rounds.length && fOk;
say(`C96 fails=${fails.length ? fails.slice(0, 12).join(',') : 'none'}`);
say(`C96_C1: ${held ? 'HELD' : 'UNMET'} a=${aOk ? 1 : 0}/1 b=${bOk ? 1 : 0}/1 c=${cOk ? 1 : 0}/1 d=${dOk ? 1 : 0}/1 e=${eOk}/${rounds.length} f=${fOk ? 1 : 0}/1 tool_sha256=${sha(toolBytes)}`);
rmSync(P, { recursive: true, force: true });
finish(held ? 0 : 1);
