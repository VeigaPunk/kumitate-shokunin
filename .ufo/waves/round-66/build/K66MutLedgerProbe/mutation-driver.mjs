#!/usr/bin/env node
// mutation-driver.mjs — seat K66MutLedgerProbe (kumitate r66 w1).
// Mutation-tests the FROZEN C1 counter ledger66-probe.mjs via byte copies only.
// Detectors per mutant: (B) base receipt run at rev 8d557f85..., (D) donothing control, (A) autoledger control.
// A mutant is KILLED iff any detector's (verdict, held, miss-set) differs from the committed receipt's;
// otherwise SURVIVED. The lane is never written; controls commit only inside their own scratch clone.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const BUILD = join(LANE, '.ufo/waves/round-66/build/K66MutLedgerProbe');
const S = '/fast/scratch/hyaku/kumitate-r66/K66MutLedgerProbe';
const BASE_REV = '8d557f85312de4fcc82e09ff735d21436bc3746d';
const FREEZE = '621212bac37f8249c72ac982d1d6534cb8d60701';
const sha = (b) => createHash('sha256').update(b).digest('hex');

const src = readFileSync(PROBE, 'utf8');
const beforeHash = sha(src);
mkdirSync(join(BUILD, 'mutants'), { recursive: true });
for (const d of [S, join(S, 'tmp'), join(S, 'ctl')]) mkdirSync(d, { recursive: true });

const M = [];
const add = (id, cls, edits, expect, note) => M.push({ id, cls, edits, expect, note });

// ---- anchors: deliberately crippling mutants that committed detectors must catch
add('A1', 'anchor', [["check('L1', r.status === 0 && m && m[1] === m[2] && Number(m[1]) >= 30,", "check('L1', false,"]], 'kill', 'L1 force-fail; controls must drop to held=3');
add('A2', 'anchor', [["check('L4', realL4,", "check('L4', false,"]], 'kill', 'L4 force-fail; controls must drop to held=3');
add('A3', 'anchor', [["check('L6', skillRow && qual && cap,", "check('L6', true,"]], 'kill', 'L6 force-pass; base receipt must rise to held=1');
add('A4', 'anchor', [
  ["/^ROUTED_LEDGER: CLEAN spotchecks=", "/^ROUTED_LEDGER: (?:CLEAN|DRIFT) spotchecks="],
  ["check('L2', r.status === 0 && m &&", "check('L2', m &&"],
], 'kill', 'L2 accepts DRIFT regardless of exit; donothing must rise to held=5');

// ---- weakening mutants of each check (the actual coverage study)
add('W01', 'L1', [["Number(m[1]) >= 30", "Number(m[1]) >= 1"]], 'survive?', 'selftest floor 30 -> 1');
add('W02', 'L2', [["check('L2', r.status === 0 && m &&", "check('L2', m &&"]], 'survive?', 'L2 ignores tool exit code (CLEAN regex still gates)');
add('W03', 'L2', [["Number(m[3]) === ownItems && Number(m[4]) >= ownItems", "Number(m[3]) >= ownItems && Number(m[4]) >= ownItems"]], 'survive?', 'items equality -> >=');
add('W04', 'L2', [["Number(m[4]) >= ownItems,", "Number(m[4]) >= 0,"]], 'survive?', 'rows>=items floor -> rows>=0');
add('W05', 'L2', [["Number(m[1]) === 11 && spotsFound === 11", "Number(m[1]) === 12 && spotsFound === 11"]], 'survive?', 'spotchecks==11 -> ==12');
add('W06', 'L3', [["r65.forEach((_, i) => { if (!answeredNow.has(i + 1)) bad.push(`r65-item-${i + 1}-not-answered-this-round`); });", "// r65 answered-this-round clause removed"]], 'survive?', "drop L3's answered-this-round clause");
add('W07', 'L3', [["if (classes.size < 5)", "if (classes.size < 0)"]], 'survive?', 'classes>=5 floor dropped');
add('W08', 'L3', [["s.size >= 4", "s.size >= 0"]], 'survive?', 'class-spans-4-rounds floor dropped');
add('W09', 'L3', [["if (!r.quote || nwords(r.quote) > 25 || !norm(it[r.k - 1]).includes(norm(r.quote))) {", "if (false) {"]], 'survive?', 'row-quote located-in-item check off');
add('W10', 'L3', [["for (const [n, it] of spot) it.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) bad.push(`unledgered:${n}#${i + 1}`); });", ";"]], 'survive?', 'full-coverage (unledgered) loop off');
add('W11', 'L3', [["if (p === 'corpus/routed-ledger.md' ||", "if (false && p === 'corpus/routed-ledger.md' ||"]], 'survive?', 'answer-path forbidden set (ledger/spotchecks/..//abs) off');
add('W12', 'L3', [["const win = norm(AL.slice(Math.max(0, ln - 3), Math.min(AL.length, ln + 2)).join(' '));", "const win = norm(AL.join(' '));"]], 'survive?', 'answer +-2 line window -> whole file');
add('W13', 'L4', [[".some((l) => l.startsWith(`FINDING ${finding} `)) && v", " && v"]], 'survive?', 'harness ignores finding ids');
add('W14', 'L4', [["items=${expectItems} ", "items=\\d+ "]], 'survive?', 'harness items= exact count -> any count');
add('W15', 'kill?', [["check('L5', realL4 && caught.length === 2,", "check('L5', caught.length === 2,"]], 'kill?', "drop L5's realL4 (anti-vacuity) guard");
add('W16', 'L5', [["check('L5', realL4 && caught.length === 2,", "check('L5', realL4 && caught.length >= 1,"]], 'survive?', 'both-stubs requirement -> one stub enough');
add('W17', 'L3', [["if (!it || !(r.k >= 1 && r.k <= it.length))", "if (!it)"]], 'survive?', 'item-ordinal range guard off');
add('W18', 'verdict', [["const ok = held === N_CHECKS;", "const ok = held >= 5;"]], 'survive?', 'HELD threshold 6/6 -> >=5/6');

// ---- generate mutants (every FROM must occur exactly once)
const mutants = [];
for (const m of M) {
  let t = src;
  for (const [from, to] of m.edits) {
    const n = t.split(from).length - 1;
    if (n !== 1) { console.log(`GEN-FAIL ${m.id}: pattern occurs ${n}x: ${from.slice(0, 60)}`); t = null; break; }
    t = t.replace(from, to);
  }
  if (!t) continue;
  const p = join(BUILD, 'mutants', `${m.id}.mjs`);
  writeFileSync(p, t);
  const chk = spawnSync('node', ['--check', p], { encoding: 'utf8' });
  if (chk.status !== 0) { console.log(`SYNTAX-FAIL ${m.id}: ${(chk.stderr || '').split('\n')[0]}`); continue; }
  mutants.push({ ...m, path: p, hash: sha(t) });
}
console.log(`generated ${mutants.length}/${M.length} mutants (pristine sha256 ${beforeHash.slice(0, 16)}..)`);

// ---- mutant controls driver: committed c1-controls.sh with the probe path pointed at $MUT_PROBE
const ctl = readFileSync(join(LANE, '.ufo/waves/round-66/probe/c1-controls.sh'), 'utf8');
const needle = 'TMPDIR="$D" node "$LANE/.ufo/waves/round-66/probe/ledger66-probe.mjs" "$C" "$REV"';
if (ctl.split(needle).length - 1 !== 1) { console.log('CTL-PATCH-FAIL'); process.exit(3); }
const ctlMut = join(S, 'c1-controls-mut.sh');
writeFileSync(ctlMut, ctl.replace(needle, 'TMPDIR="$D" node "$MUT_PROBE" "$C" "$REV"'));

// ---- parsers
function parseProbeLine(line) {
  const m = /^(LEDGER66_(HELD|UNMET)) held=(\d+)\/(\d+) (.*)$/.exec(line.trim());
  if (!m) return { verdict: '?', held: -1, missSet: '?', norm: line.trim().slice(0, 220) };
  const norm = m[5].replace(/rev=[0-9a-f]+/g, 'rev=X').replace(/seed=[0-9a-f]+/g, 'seed=X').replace(/w[0-9a-f]{6}/g, 'wT');
  const misses = norm.includes('|') ? norm.split('|').map((s) => s.trim()).filter((s) => /^L\d MISS/.test(s)) : [];
  return { verdict: m[2], held: Number(m[3]), missSet: misses.map((s) => s.slice(0, 2)).sort().join(','), norm: `LEDGER66_${m[2]} held=${m[3]}/${m[4]} ${norm}`, misses };
}
const probeLine = (out) => (out || '').split('\n').reverse().find((l) => l.startsWith('LEDGER66_')) || '(no probe line)';

function spawnRetry(cmd, args, opts, tag) {
  let last = null;
  for (let a = 1; a <= 2; a += 1) {
    const r = spawnSync(cmd, args, opts);
    const gotLine = (r.stdout || '').split('\n').some((l) => l.startsWith('LEDGER66_'));
    if (r.status !== null || gotLine) return { r, attempts: a };
    last = { r, attempts: a };
    const sab = new Int32Array(new SharedArrayBuffer(4));
    Atomics.wait(sab, 0, 0, a * 4000);
  }
  return last;
}
function fmtFail(r) {
  return `(no probe line; status=${r.r.status} sig=${r.r.signal} err=${String(r.r.error)} attempts=${r.attempts} stderr=${(r.r.stderr || '').slice(0, 160)})`;
}
function runProbe(probePath, rev) {
  const { r, attempts } = spawnRetry('node', [probePath, LANE, rev], { encoding: 'utf8', timeout: 600000, cwd: S, env: { ...process.env, TMPDIR: join(S, 'tmp') } });
  const line = probeLine(r.stdout);
  return { line: line === '(no probe line)' ? fmtFail({ r, attempts }) : line, status: r.status };
}
function runControl(probePath, variant) {
  const { r, attempts } = spawnRetry('bash', [ctlMut, LANE, variant], { encoding: 'utf8', timeout: 900000, cwd: S, env: { ...process.env, SCRATCH: join(S, 'ctl'), MUT_PROBE: probePath, TMPDIR: join(S, 'tmp') } });
  const line = probeLine(r.stdout);
  return { line: line === '(no probe line)' ? fmtFail({ r, attempts }) : line, status: r.status };
}

// ---- committed receipt expectations
const receipts = {};
for (const [k, f] of [['base', 'ledger66-base.txt'], ['donothing', 'ledger66-donothing.txt'], ['autoledger', 'ledger66-autoledger.txt']]) {
  receipts[k] = parseProbeLine(probeLine(readFileSync(join(BUILD, 'receipts', f), 'utf8')));
}

// ---- pristine baseline (inconclusive-everything if this deviates)
const P = {
  base: runProbe(join(BUILD, 'pristine-counter.mjs'), BASE_REV),
  donothing: runControl(join(BUILD, 'pristine-counter.mjs'), 'donothing'),
  autoledger: runControl(join(BUILD, 'pristine-counter.mjs'), 'autoledger'),
  freeze: runProbe(join(BUILD, 'pristine-counter.mjs'), FREEZE),
};
const pParsed = {};
let pristineOk = true;
for (const k of ['base', 'donothing', 'autoledger']) {
  pParsed[k] = parseProbeLine(P[k].line);
  const e = receipts[k];
  const match = pParsed[k].verdict === e.verdict && pParsed[k].held === e.held && pParsed[k].missSet === e.missSet;
  if (!match) pristineOk = false;
  console.log(`PRISTINE ${k}: exit=${P[k].status} ${pParsed[k].norm.slice(0, 150)} | receipt-match=${match}`);
}
console.log(`PRISTINE freeze(informational): ${parseProbeLine(P.freeze.line).norm.slice(0, 150)}`);

// ---- mutant matrix
const rows = [];
const summary = [];
const tsvPath = join(BUILD, 'results.tsv');
const flushTsv = () => writeFileSync(tsvPath, ['id\tclass\tpredict\tverdict\tkilled-by\tbase-run\tdonothing-run\tautoledger-run\tmutant-sha256', ...rows].join('\n') + '\n');
for (const m of mutants) {
  const runs = {
    base: parseProbeLine(runProbe(m.path, BASE_REV).line),
    donothing: parseProbeLine(runControl(m.path, 'donothing').line),
    autoledger: parseProbeLine(runControl(m.path, 'autoledger').line),
  };
  const killers = [];
  for (const k of ['base', 'donothing', 'autoledger']) {
    const e = receipts[k];
    if (runs[k].verdict !== e.verdict || runs[k].held !== e.held || runs[k].missSet !== e.missSet) killers.push(`${k}:${runs[k].verdict}${runs[k].held}[${runs[k].missSet}]`);
  }
  const verdict = pristineOk ? (killers.length ? 'KILLED' : 'SURVIVED') : 'INCONCLUSIVE';
  rows.push([m.id, m.cls, m.expect, verdict, killers.join(';') || '-', runs.base.norm.slice(0, 110), runs.donothing.norm.slice(0, 110), runs.autoledger.norm.slice(0, 110), m.hash].join('\t'));
  summary.push(`${m.id} [${m.cls}] ${verdict}${killers.length ? ' by ' + killers.join(' ') : ''} :: ${m.note}`);
  flushTsv();
  console.log(`DONE ${m.id} -> ${verdict}${killers.length ? ' by ' + killers.join(' ') : ''}`);
}
console.log('---- mutant verdicts ----');
summary.forEach((l) => console.log(l));
writeFileSync(join(BUILD, 'results.tsv'), ['id\tclass\tpredict\tverdict\tkilled-by\tbase-run\tdonothing-run\tautoledger-run\tmutant-sha256', ...rows].join('\n') + '\n');

// ---- restoration evidence: frozen lane bytes must be byte-identical after all runs
const afterHash = sha(readFileSync(PROBE, 'utf8'));
console.log(`RESTORE probe-sha-before=${beforeHash} after=${afterHash} unchanged=${beforeHash === afterHash}`);
console.log(`baseline-pristine-ok=${pristineOk}`);
