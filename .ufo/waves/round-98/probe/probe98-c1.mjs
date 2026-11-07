#!/usr/bin/env node
/**
 * probe98-c1.mjs — frozen counter for kumitate round 98, claim C1 (operability):
 * `round-gate` recognises a SOURCES.md registry row by the same id-cell character class the fleet
 * census uses (`sources-census.sh` row_pass: `^\|[ \t]*S[0-9]{3,}[ \t]*\|` after a 0-3 space indent;
 * id = the cell trimmed of spaces/tabs only). Pins are declared only from rows the census reads inside
 * `## Registry` with a valid `S[0-9]{3,}` id, 13 fields, status not `rejected`; `citations.outsideRows`
 * equals the census E12 id list; `citations.malformedRows` equals the census E01 ids that are valid ids.
 *
 *   node probe98-c1.mjs --tool <candidate round-gate.mjs> --work <scratch dir> --freeze <REV>
 *       [--seed HEX] [--lane DIR] [--fleet DIR] [--fleet-rev REV] [--origin DIR] [--census PATH]
 *
 * Read-only on --lane / --fleet / --origin. Clones the lane (`git clone --shared`) into --work, checks
 * out --freeze detached, copies the candidate beside the base gate (`scripts/round-gate-cand.mjs`), and
 * builds fixture repos under --work with `git -C <fixture>` only (toplevel asserted).
 *
 * Battery (drawn fresh per run from a printed seed; `--seed` replays): every id cell pad class in PADS
 * (ASCII SP/TAB mixes, VT, FF, CR, NEL, every Unicode White_Space Zs/Zl/Zp code point class sample,
 * the Cf format characters U+180E/U+200B/U+200C/U+200D/U+2060/U+FEFF) as lead pad, trail pad and both;
 * contexts: inside `## Registry` (13-field mined, 12-field mined, 13-field rejected), outside under
 * `## Leads (unopened)`, before any heading; row indents (0-4 spaces, TAB, SP TAB, NBSP); id forms
 * (2-digit, lowercase `s`, trailing letter, `SS`, Arabic-Indic digits). Every id, pin and the case order
 * are nonces. The expected values come from the LIVE census on the same file:
 *   DECL  = mined rows whose exact census id string appears in a W03 line and matches ^S[0-9]{3,}$
 *   OUT   = census E12 ids, output order
 *   MALF  = census E01 ids matching ^S[0-9]{3,}$, output order
 *
 * Predicate C98_C1 HELD iff all of:
 *  (a) FIX-A (LF)   candidate --json: rows of citations.declared == DECL (as sets, and no token of a row
 *                   outside DECL is declared); citations.outsideRows == OUT; citations.malformedRows == MALF.
 *  (b) FIX-B        the same equalities on FIX-A joined with CRLF (census reads no Registry: DECL empty).
 *  (c) TEXT         candidate text mode on FIX-A prints exactly one SOURCES_ROWS_OUTSIDE line equal to
 *                   `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<|OUT|> [<OUT>]` and exactly one
 *                   SOURCES_ROWS_MALFORMED line equal to `... malformed=<|MALF|> [<MALF>]`.
 *  (d) NO-REG       every filed kumitate report at --fleet-rev: candidate (id, ok) check vector == BASE,
 *                   exit equal, declared set == BASE, outsideRows == [] and malformedRows == [].
 *  (e) SELFTEST     candidate `--selftest` exits 0 and prints `VERDICT: PASS`.
 * Exit: 0 HELD · 1 UNMET · 2 SETUP (census exit not 1 on FIX-A, an empty DECL/OUT/MALF, no census W03
 * line with an invalid id, a census id line not attributable to a generated row, BASE gives no JSON,
 * or a clone/fixture step failed).
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const FREEZE = opt('--freeze', null);
const FLEET = resolve(opt('--fleet', '/home/vgpnk/Projects/shokunin'));
const FLEET_REV = opt('--fleet-rev', 'dc2472ca28e0340be8b6cec3bfd26684b698067e');
const ORIGIN = resolve(opt('--origin', '/home/vgpnk/Projects/ufo-fsd-alpha'));
const CENSUS = resolve(opt('--census', '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'));
const TOOL = opt('--tool', null);
const WORK = opt('--work', null);
const SEED = opt('--seed', randomBytes(8).toString('hex'));

const out = [];
const say = (s) => { out.push(s); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 900000, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);
function finish(code) { process.stdout.write(`${out.join('\n')}\n`); process.exit(code); }
function setup(msg) { say(`SETUP: ${msg}`); finish(2); }

if (!TOOL || !WORK || !FREEZE) setup('usage: --tool --work --freeze are required');
if (!/^[0-9a-f]{16}$/.test(SEED)) setup('--seed must be 16 hex');
const toolBytes = readFileSync(TOOL);
mkdirSync(WORK, { recursive: true });
const W = realpathSync(WORK);
const P = join(W, `p98-${SEED}`);
rmSync(P, { recursive: true, force: true });
mkdirSync(P, { recursive: true });

/* seeded PRNG (sha256 counter) -------------------------------------------- */
let ctr = 0;
const rnd = () => { const h = sha(`${SEED}:${ctr++}`); return parseInt(h.slice(0, 12), 16) / 2 ** 48; };
const rint = (n) => Math.floor(rnd() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const usedDigits = new Set();
const nonceDigits = (len) => { for (;;) { let d = String(1 + rint(9)); while (d.length < len) d += String(rint(10)); if (!usedDigits.has(d)) { usedDigits.add(d); return d; } } };

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
say(`C98 seed=${SEED} freeze=${FREEZE} fleet_rev=${FLEET_REV} base_sha256=${sha(baseBytes)} tool_sha256=${sha(toolBytes)}`);

const gate = (tool, round, repo, reports, main, origin, json = true) => {
  const g = run(process.execPath, [tool, '--round', String(round), '--lane', 'kumitate', '--repo', repo,
    '--reports-dir', reports, '--main-repo', main, '--origin', origin, ...(json ? ['--json'] : [])], { cwd: repo });
  let j = null;
  if (json) { try { j = JSON.parse(g.stdout); } catch { j = null; } }
  return { status: g.status, j, stdout: g.stdout, stderr: g.stderr };
};
const vec = (j) => (j && Array.isArray(j.checks) ? j.checks.map((c) => `${c.id}:${c.ok}`) : null);
const setEq = (a, b) => a.length === b.length && [...a].sort().join('\u0001') === [...b].sort().join('\u0001');
const listEq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
const cit = (j) => (j && j.citations && typeof j.citations === 'object' ? j.citations : {});
const decl = (j) => (Array.isArray(cit(j).declared) ? cit(j).declared : []);
const outs = (j) => (Array.isArray(cit(j).outsideRows) ? cit(j).outsideRows : null);
const malf = (j) => (Array.isArray(cit(j).malformedRows) ? cit(j).malformedRows : null);
const vis = (s) => JSON.stringify(s);

/* battery ----------------------------------------------------------------- */
const PADS = [
  ['none', ''], ['SP', ' '], ['2SP', '  '], ['TAB', '\t'], ['SPTAB', ' \t'], ['TABSP', '\t '],
  ['VT', '\v'], ['FF', '\f'], ['CR', '\r'], ['TABFF', '\t\f'], ['NEL', '\u0085'], ['NBSP', '\u00a0'],
  ['OGHAM', '\u1680'], ['MVS', '\u180e'], ['ENQUAD', '\u2000'], ['ENSP', '\u2002'], ['EMSP', '\u2003'],
  ['FIGSP', '\u2007'], ['THINSP', '\u2009'], ['HAIRSP', '\u200a'], ['ZWSP', '\u200b'], ['ZWNJ', '\u200c'],
  ['ZWJ', '\u200d'], ['LS', '\u2028'], ['PS', '\u2029'], ['NNBSP', '\u202f'], ['MMSP', '\u205f'],
  ['WJ', '\u2060'], ['IDSP', '\u3000'], ['BOM', '\ufeff'], ['SPNBSP', ' \u00a0'], ['NBSPSP', '\u00a0 '],
];
const SP = ' ';
const rows = []; // {ctx, id (raw id-cell core), lead, trail, indent, width, status, pin, label}
const pins = new Set();
const newPin = () => { for (;;) { const p = sha(`${SEED}:pin:${ctr++}`).slice(0, 40); if (!pins.has(p.slice(0, 12))) { pins.add(p.slice(0, 12)); return p; } } };
const add = (o) => { const r0 = { indent: '', width: 13, status: 'mined', lead: SP, trail: SP, ...o }; r0.pin = newPin(); r0.tok = r0.pin.slice(0, 12); rows.push(r0); };
const sid = () => `S${nonceDigits(7)}`;
for (const [pn, p] of PADS) {
  for (const [shape, lead, trail] of [['lead', p, SP], ['trail', SP, p], ['both', p, p]]) {
    add({ ctx: 'R', id: sid(), lead, trail, label: `R13 ${shape}:${pn}` });
    add({ ctx: 'L', id: sid(), lead, trail, label: `L13 ${shape}:${pn}` });
    add({ ctx: 'R', id: sid(), lead, trail, width: 12, label: `R12 ${shape}:${pn}` });
  }
  add({ ctx: 'R', id: sid(), lead: p, status: 'rejected', label: `R13rej lead:${pn}` });
  add({ ctx: 'P', id: sid(), lead: p, label: `PRE lead:${pn}` });
}
for (const [inn, ind] of [['0', ''], ['1', ' '], ['2', '  '], ['3', '   '], ['4', '    '], ['TAB', '\t'], ['SPTAB', ' \t'], ['NBSP', '\u00a0']]) {
  for (const ctx of ['R', 'L']) {
    add({ ctx, id: sid(), indent: ind, label: `${ctx}13 indent:${inn}` });
    if (ctx === 'R') add({ ctx, id: sid(), indent: ind, width: 12, label: `R12 indent:${inn}` });
  }
}
const ar = (d) => [...d].map((c) => String.fromCharCode(0x660 + Number(c))).join('');
for (const ctx of ['R', 'L']) {
  add({ ctx, id: `S${nonceDigits(2)}`, label: `${ctx}13 id:2digit` });
  add({ ctx, id: `s${nonceDigits(7)}`, label: `${ctx}13 id:lower` });
  add({ ctx, id: `S${nonceDigits(7)}x`, label: `${ctx}13 id:trailalpha` });
  add({ ctx, id: `SS${nonceDigits(7)}`, label: `${ctx}13 id:double` });
  add({ ctx, id: `S${ar(nonceDigits(7))}`, label: `${ctx}13 id:arabicdigits` });
}
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const rowText = (x) => {
  const tail = x.width === 13 ? ' 2026-11-01 | 30d | — |' : ' 2026-11-01 | 30d |';
  return `${x.indent}|${x.lead}${x.id}${x.trail}| src ${url(x.pin)} | code | A | scope-${x.tok} | anchor | teaches a thing | ${x.status} |${tail}`;
};
const HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|'];
const pick = (c) => shuffle(rows.filter((x) => x.ctx === c)).map(rowText);
const FA_LINES = [...pick('P'), '# SOURCES — fixture r98', '', '## Registry', '', ...HDR, ...pick('R'),
  '', '## Leads (unopened)', '', ...pick('L'), ''];
const FA = FA_LINES.join('\n');
const FB = FA_LINES.join('\r\n');
const tokLine = shuffle(rows.map((x) => `\`${x.tok}\``)).join(' ');
const reportText = `# kumitate round-1 fixture\n\n## Work\n\nCited: ${tokLine}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`;
const trimTab = (s) => s.replace(/^[ \t]+|[ \t]+$/g, '');
const byCensusId = new Map();
for (const x of rows) { const k = trimTab(`${x.lead}${x.id}${x.trail}`); if (byCensusId.has(k)) setup(`id collision ${vis(k)}`); byCensusId.set(k, x); }
const tokRow = new Map(rows.map((x) => [x.tok, x]));
say(`C98 battery rows=${rows.length} pads=${PADS.length} R=${rows.filter((x) => x.ctx === 'R').length} L=${rows.filter((x) => x.ctx === 'L').length} P=${rows.filter((x) => x.ctx === 'P').length}`);

function fixture(name, sources) {
  const F = join(P, `fx-${name}`);
  mkdirSync(join(F, 'corpus'), { recursive: true });
  let g = git(F, ['init', '-q', '-b', 'main']);
  if (g.status !== 0 || git(F, ['rev-parse', '--show-toplevel']).stdout.trim() !== F) setup(`fixture ${name} init`);
  writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(F, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
  writeFileSync(join(F, 'corpus', 'SOURCES.md'), sources);
  g = git(F, ['add', '-A']);
  g = git(F, ['-c', 'core.autocrlf=false', '-c', 'user.name=p98', '-c', 'user.email=p98@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) setup(`fixture ${name} commit: ${g.stderr}`);
  const R = join(F, '..', `fx-${name}-reports`);
  mkdirSync(join(R, 'round-1'), { recursive: true });
  writeFileSync(join(R, 'round-1', 'kumitate.md'), reportText);
  return { F, R };
}
function censusTruth(file, label, wantRegistry) {
  const c = run('bash', [CENSUS, 'validate', '--file', file, '--today', '2026-11-07']);
  if (c.status !== 1) setup(`census ${label} rc=${c.status} (want 1): ${c.stderr.slice(0, 200)}`);
  const lines = c.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
  const idOf = (code, suffix) => lines.filter((f) => f[1] === code).map((f) => {
    const rest = f.slice(2).join('\t');
    if (!rest.endsWith(suffix) && !suffix.startsWith(' fields=')) setup(`census ${label} ${code} line shape ${vis(rest)}`);
    return code === 'E01' ? rest.replace(/ fields=\d+$/, '') : rest.slice(0, rest.length - suffix.length);
  });
  const w03 = idOf('W03', ' mined but unused');
  const e12 = idOf('E12', ' row outside Registry section');
  const e01 = idOf('E01', ' fields=');
  for (const id of [...w03, ...e12, ...e01]) if (!byCensusId.has(id)) setup(`census ${label} id ${vis(id)} not attributable to a generated row`);
  const VALID = /^S[0-9]{3,}$/;
  const declRows = w03.filter((id) => VALID.test(id)).map((id) => byCensusId.get(id)).filter((x) => x.status === 'mined');
  const malfIds = e01.filter((id) => VALID.test(id));
  const invalidW03 = w03.filter((id) => !VALID.test(id)).length;
  if (wantRegistry && (declRows.length === 0 || malfIds.length === 0 || invalidW03 === 0)) setup(`census ${label} DECL=${declRows.length} MALF=${malfIds.length} invalidW03=${invalidW03} (all must be > 0)`);
  if (e12.length === 0) setup(`census ${label} E12 empty`);
  return { DECL: new Set(declRows.map((x) => x.tok)), OUT: e12, MALF: malfIds, w03: w03.length, invalidW03 };
}
function arm(label, fx, truth, toolPath) {
  const j = gate(toolPath, 1, fx.F, fx.R, fx.F, fx.F);
  if (!j.j) return { ok: false, msg: `${label} exit=${j.status} no-json` };
  const dRows = decl(j.j).map((t) => (tokRow.get(t) ?? { tok: `?${t}` }).tok);
  const extra = dRows.filter((t) => !truth.DECL.has(t));
  const missing = [...truth.DECL].filter((t) => !dRows.includes(t));
  const o = outs(j.j); const m = malf(j.j);
  const ok = extra.length === 0 && missing.length === 0 && setEq(dRows, [...truth.DECL]) && listEq(o, truth.OUT) && listEq(m, truth.MALF);
  const lab = (t) => (tokRow.get(t) ? tokRow.get(t).label : t);
  const oExtra = (o ?? []).filter((id) => !truth.OUT.includes(id)).map((id) => (byCensusId.get(id) ? byCensusId.get(id).label : vis(id)));
  const oMiss = truth.OUT.filter((id) => !(o ?? []).includes(id)).map((id) => byCensusId.get(id).label);
  const mExtra = (m ?? []).filter((id) => !truth.MALF.includes(id)).map((id) => (byCensusId.get(id) ? byCensusId.get(id).label : vis(id)));
  const mMiss = truth.MALF.filter((id) => !(m ?? []).includes(id)).map((id) => byCensusId.get(id).label);
  return {
    ok, j,
    msg: `${label} exit=${j.status} declared=${dRows.length}/${truth.DECL.size} extra=${extra.length}${extra.length ? ` [${extra.slice(0, 6).map(lab).join('; ')}]` : ''} missing=${missing.length}${missing.length ? ` [${missing.slice(0, 6).map(lab).join('; ')}]` : ''}`
      + ` outside=${o ? o.length : 'null'}/${truth.OUT.length} order=${listEq(o, truth.OUT)} extra=[${oExtra.slice(0, 6).join('; ')}] missing=[${oMiss.slice(0, 6).join('; ')}]`
      + ` malformed=${m ? m.length : 'null'}/${truth.MALF.length} order=${listEq(m, truth.MALF)} extra=[${mExtra.slice(0, 6).join('; ')}] missing=[${mMiss.slice(0, 6).join('; ')}] ok=${ok}`,
  };
}

const fa = fixture('a', FA);
const ta = censusTruth(join(fa.F, 'corpus', 'SOURCES.md'), 'A', true);
const fb = fixture('b', FB);
if (readFileSync(join(fb.F, 'corpus', 'SOURCES.md'), 'utf8').split('\r\n').length < 20) setup('fixture B is not CRLF on disk');
const tb = censusTruth(join(fb.F, 'corpus', 'SOURCES.md'), 'B', false);
say(`C98 census A DECL=${ta.DECL.size} OUT=${ta.OUT.length} MALF=${ta.MALF.length} W03=${ta.w03} invalidW03=${ta.invalidW03}; B DECL=${tb.DECL.size} OUT=${tb.OUT.length} MALF=${tb.MALF.length}`);

/* (a) (b) */
const A = arm('FIX-A', fa, ta, CAND); say(`C98 ${A.msg}`);
const Ab = arm('FIX-A BASE', fa, ta, BASE); say(`C98 ${Ab.msg}`);
const B = arm('FIX-B', fb, tb, CAND); say(`C98 ${B.msg}`);

/* (c) TEXT */
const tt = gate(CAND, 1, fa.F, fa.R, fa.F, fa.F, false);
const tLines = tt.stdout.split('\n');
const wantOut = `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=${ta.OUT.length} [${ta.OUT.join(' ')}]`;
const wantMal = `ROUND_GATE  info  SOURCES_ROWS_MALFORMED  malformed=${ta.MALF.length} [${ta.MALF.join(' ')}]`;
const nOut = tLines.filter((l) => l.includes('SOURCES_ROWS_OUTSIDE')).length;
const nMal = tLines.filter((l) => l.includes('SOURCES_ROWS_MALFORMED')).length;
const cOk = nOut === 1 && nMal === 1 && tLines.includes(wantOut) && tLines.includes(wantMal);
say(`C98 TEXT exit=${tt.status} outside_lines=${nOut} malformed_lines=${nMal} exact_out=${tLines.includes(wantOut)} exact_mal=${tLines.includes(wantMal)} ok=${cOk}`);

/* (d) every filed report at the fleet pin */
const RD = join(P, 'reports');
const ls = git(FLEET, ['ls-tree', '-r', '--name-only', FLEET_REV, '.ufo/reports']);
if (ls.status !== 0) setup(`fleet ls-tree: ${ls.stderr}`);
const rounds = []; const manifest = [];
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
say(`C98 reports=${rounds.length} manifest_sha256=${sha(manifest.sort().join('\n'))}`);
let dOk = 0; const fails = [];
for (const n of rounds) {
  const b = gate(BASE, n, CL, RD, FLEET, ORIGIN);
  const c = gate(CAND, n, CL, RD, FLEET, ORIGIN);
  if (!b.j) setup(`BASE produced no JSON on round ${n} (exit ${b.status})`);
  if (!c.j) { fails.push(`r${n}:cand-no-json(exit=${c.status})`); continue; }
  const ok = vec(b.j).join('|') === vec(c.j).join('|') && b.status === c.status
    && setEq(decl(b.j), decl(c.j)) && listEq(outs(c.j), []) && listEq(malf(c.j), []);
  if (ok) dOk++;
  else fails.push(`r${n}:(base_exit=${b.status},cand_exit=${c.status},declared=${decl(c.j).length}/${decl(b.j).length},outsideRows=${vis(outs(c.j))})`);
}

/* (e) selftest */
const st = run(process.execPath, [CAND, '--selftest'], { cwd: CL });
const stLine = (st.stdout.match(/^ROUND_GATE_SELFTEST: .*$/m) ?? ['none'])[0];
const eOk = st.status === 0 && /^VERDICT: PASS$/m.test(st.stdout);
say(`C98 SELFTEST exit=${st.status} ${stLine} ok=${eOk}`);

const held = A.ok && B.ok && cOk && dOk === rounds.length && eOk;
say(`C98 fails=${fails.length ? fails.slice(0, 12).join(',') : 'none'}`);
say(`C98_C1: ${held ? 'HELD' : 'UNMET'} a=${A.ok ? 1 : 0}/1 b=${B.ok ? 1 : 0}/1 c=${cOk ? 1 : 0}/1 d=${dOk}/${rounds.length} e=${eOk ? 1 : 0}/1 seed=${SEED} tool_sha256=${sha(toolBytes)}`);
rmSync(P, { recursive: true, force: true });
finish(held ? 0 : 1);
