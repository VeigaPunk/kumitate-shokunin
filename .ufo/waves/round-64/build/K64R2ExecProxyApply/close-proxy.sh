#!/usr/bin/env bash
# close-proxy.sh — bring `scripts/proxy-check.mjs` (plain and --strict) to
# `PROXY: MATCH` in a kumitate lane at close, idempotently.
#
#   bash close-proxy.sh [--lane DIR] [--write] [--pin scripts/rel]... [--refresh FILE] [--json] [--help]
#
# It does exactly three things, in this order, and nothing else:
#
#   1. GATE_PINS repair (the round-62 fail-closed class). Every `scripts/*.mjs`
#      that no `pin.<name>` key covers makes `--strict` read `PIN_UNPINNED`; this
#      step adds the missing `'pin.<stem>': '<rel>',` line to the `GATE_PINS`
#      literal in `scripts/proxy-check.mjs`, and adds the same line for the
#      explicit `--pin` paths (the round-64 `.sh` subjects, which the frozen
#      `comparePinCoverage` never scans: it filters `scripts/*.mjs`). Without
#      `--write` it prints the patch only.
#   2. Stanza refresh: runs `.ufo/waves/round-64/build/K64ExecProxyRepair/refresh-stanza.mjs`
#      (a sibling copy is preferred, so the pair travels together), prints the
#      exact `SCORECARD.md` diff, and — only with `--write` and only when the
#      refresher reports no blocker — replaces `SCORECARD.md` with the
#      refresher's measured candidate. A blocked refresh is printed, never
#      laundered: writing the number a broken tree happens to produce is the
#      round-64 base defect (AXES_DRIFT from an unmapped note).
#   3. Verification: runs `node scripts/proxy-check.mjs` and `--strict` in the
#      lane and requires both to exit 0 with a `PROXY: MATCH` verdict line. A
#      plain-mode exit 2 (`FAIL-CLOSED`: a malformed/unknown-key stanza) aborts
#      before any write.
#
# Idempotent: a second run adds no pin line, produces an empty diff, writes
# nothing, and still reads MATCH. `A` counts every runnable file under the lane
# (`.ufo/` build artifacts included), so run this on the FINAL revision, commit
# `SCORECARD.md` last (it is not runnable, so `A` is stable across that commit).
#
# Exit: 0 MATCH · 1 DRIFT/BLOCKED · 2 FAIL-CLOSED (a measurement could not be
# taken) · 64 usage.
set -uo pipefail

SELF_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
TMPJS=$(mktemp "${TMPDIR:-/tmp}/close-proxy-XXXXXX.mjs") || exit 2
trap 'rm -f -- "$TMPJS"' EXIT

cat >"$TMPJS" <<'CLOSE_PROXY_JS'
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const PROXY_REL = 'scripts/proxy-check.mjs';
const SCORECARD_REL = 'SCORECARD.md';
const GATE_CONTRACT = 'kumitate-gate-pins-v1';
const RE_PIN_ENTRY = /'(pin\.[a-z0-9][a-z0-9-]*)':\s*'(scripts\/[^']+)'/g;
const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;

/** The round-64 gate scripts a close must pin even though no coverage rule reaches them. */
const SUBJECT_PINS = [
  ['scripts/report-receipt-diff.mjs', 'round 64 C1: report-vs-receipt diff tool'],
  ['scripts/jj-seat-demo.sh', 'round 64 C2: jj seat containment demo (J6 re-runs it)'],
  ['scripts/plan-before-ready.sh', 'round 63 Q58 plan-before-ready gate'],
];

const USAGE = 'usage: bash close-proxy.sh [--lane DIR] [--write] [--pin scripts/rel]... [--no-subject-pins] [--refresh FILE] [--json]\n';

function usage(detail) {
  process.stderr.write(`CLOSE_PROXY: USAGE ${detail}\n${USAGE}`);
  process.exit(64);
}
function failClosed(token, detail) {
  process.stdout.write(`CLOSE_PROXY: FAIL-CLOSED (${token}) ${detail}\n`);
  process.exit(2);
}

/* -------------------------------------------------------------------- args */

function parseArgs(argv) {
  const opts = { lane: process.cwd(), write: false, pins: [], refresh: null, json: false, subjects: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') { if (i + 1 >= argv.length) usage('--lane needs a value'); opts.lane = argv[++i]; }
    else if (a === '--write') opts.write = true;
    else if (a === '--no-subject-pins') opts.subjects = false;
    else if (a === '--pin') { if (i + 1 >= argv.length) usage('--pin needs a value'); opts.pins.push(argv[++i]); }
    else if (a === '--refresh') { if (i + 1 >= argv.length) usage('--refresh needs a value'); opts.refresh = argv[++i]; }
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') { process.stdout.write(USAGE); process.exit(0); }
    else usage(`unknown argument ${JSON.stringify(a)}`);
  }
  opts.lane = resolve(opts.lane);
  return opts;
}

/* -------------------------------------------------------------- primitives */

function readText(file) { try { return readFileSync(file, 'utf8'); } catch { return null; } }
function isFile(p) { try { return statSync(p).isFile(); } catch { return false; } }

function cleanEnv() {
  const env = { ...process.env };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX']) delete env[k];
  return env;
}

function runNode(lane, script, args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: lane, env: cleanEnv(), encoding: 'utf8', timeout: 180_000 });
}

function lastLine(text) {
  const lines = String(text ?? '').split('\n').map((l) => l.trimEnd()).filter((l) => l !== '');
  return lines.length === 0 ? '' : lines[lines.length - 1];
}

/* --------------------------------------------- proxy-check's own pin tables */

/** `{ start, end, entries: [[key, rel], ...] }` for `const <name> = { … };`, or null. */
function pinBlock(src, name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start < 0) return null;
  const end = src.indexOf('\n};', start);
  if (end < 0) return null;
  const body = src.slice(start, end);
  const entries = [];
  RE_PIN_ENTRY.lastIndex = 0;
  let m;
  while ((m = RE_PIN_ENTRY.exec(body)) !== null) entries.push([m[1], m[2]]);
  return { start, end, entries };
}

/** The keys a `kumitate-gate-pins-v1` block declares, in file order. */
function declaredGateKeys(scorecardText) {
  const lines = scorecardText.split('\n');
  const heads = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].trim().startsWith(`<!-- ${GATE_CONTRACT}`)) heads.push(i);
  if (heads.length !== 1) return { ok: heads.length === 0, keys: [] };
  const start = heads[0];
  let end = -1;
  for (let i = start; i < lines.length; i++) if (lines[i].includes('-->')) { end = i; break; }
  if (end < 0) return { ok: false, keys: [] };
  const keys = [];
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const eq = raw.indexOf('=');
    if (eq <= 0) return { ok: false, keys: [] };
    keys.push(raw.slice(0, eq));
  }
  return { ok: true, keys };
}

/** The `pin.<stem>` key a script path gets: basename minus its runnable suffix. */
function pinKeyFor(rel) {
  return `pin.${rel.split('/').pop().replace(RE_RUNNABLE, '')}`;
}

/* ------------------------------------------------------------- pin repair */

function planPins(lane, proxySrc, opts) {
  const v1 = pinBlock(proxySrc, 'PINS');
  const gate = pinBlock(proxySrc, 'GATE_PINS');
  if (v1 === null) failClosed('PINS_UNPARSEABLE', `no \`const PINS = {\` literal in ${PROXY_REL}`);
  if (gate === null) failClosed('GATE_PINS_UNPARSEABLE', `no \`const GATE_PINS = {\` literal in ${PROXY_REL}`);
  const pinnedRels = new Set([...v1.entries, ...gate.entries].map(([, rel]) => rel));

  const keyOwner = new Map([...v1.entries, ...gate.entries]);
  const want = new Map(); // key -> { rel, why }
  const absent = [];
  const add = (rel, why) => {
    if (pinnedRels.has(rel)) return;
    if (!isFile(join(lane, rel))) { absent.push(rel); return; }
    const key = pinKeyFor(rel);
    // A stem collision would leave one file unpinned while `--strict` stays
    // silent about it: fail closed rather than skip the second file.
    const owner = keyOwner.get(key) ?? (want.get(key)?.rel);
    if (owner !== undefined && owner !== rel) {
      failClosed('PIN_KEY_COLLISION', `${rel} and ${owner} both map to ${key} — rename one or pin it under a distinct key by hand`);
    }
    if (want.has(key)) return;
    want.set(key, { rel, why });
  };

  // (a) the frozen coverage rule proxy-check --strict promotes: every scripts/*.mjs.
  let names = [];
  try { names = readdirSync(join(lane, 'scripts'), { withFileTypes: true }); } catch { names = []; }
  for (const e of names) {
    if (!e.isFile() || !e.name.endsWith('.mjs')) continue;
    add(`scripts/${e.name}`, 'proxy-check PIN_UNPINNED: no pin key covered this file');
  }
  // (b) the explicit subjects (`.sh` gates the coverage rule never reaches) and --pin.
  for (const [rel, why] of opts.subjects ? SUBJECT_PINS : []) add(rel, why);
  for (const rel of opts.pins) add(rel, 'named by --pin');

  const pairs = [...want.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  if (pairs.length === 0) return { gate, absent, candidateSrc: proxySrc, added: [] };
  const inserted = pairs.map(([key, v]) => `  '${key}': '${v.rel}', // ${v.why}`);
  const candidateSrc = `${proxySrc.slice(0, gate.end)}\n${inserted.join('\n')}${proxySrc.slice(gate.end)}`;
  return { gate, absent, candidateSrc, added: pairs.map(([key, v]) => ({ key, rel: v.rel, why: v.why })) };
}

function unifiedDiff(aText, bText, label) {
  const dir = mkdtempSync(join(tmpdir(), 'close-proxy-diff-'));
  const a = join(dir, 'a');
  const b = join(dir, 'b');
  writeFileSync(a, aText);
  writeFileSync(b, bText);
  const r = spawnSync('diff', ['-u', '--label', `a/${label}`, '--label', `b/${label}`, a, b], { encoding: 'utf8', timeout: 30_000 });
  if (r.error) failClosed('DIFF_UNRUNNABLE', `diff could not run: ${r.error.code ?? r.error.message}`);
  if (r.status === 0) return '';
  if (r.status !== 1) failClosed('DIFF_UNRUNNABLE', `diff exited ${r.status}: ${String(r.stderr ?? '').trim()}`);
  return String(r.stdout ?? '');
}

/* --------------------------------------------------------------------- main */

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!isFile(join(opts.lane, PROXY_REL))) failClosed('LANE_NOT_A_LANE', `${join(opts.lane, PROXY_REL)} is not a file`);
  if (!isFile(join(opts.lane, SCORECARD_REL))) failClosed('SCORECARD_MISSING', `${join(opts.lane, SCORECARD_REL)} is not a file`);

  const refreshCandidates = [opts.refresh, process.env.CLOSE_PROXY_REFRESH,
    join(process.env.CLOSE_PROXY_DIR ?? '.', 'refresh-stanza.mjs'),
    join(process.env.CLOSE_PROXY_DIR ?? '.', '..', 'K64ExecProxyRepair', 'refresh-stanza.mjs')];
  let refresh = null;
  for (const c of refreshCandidates) {
    if (c === null || c === undefined) continue;
    if (c === opts.refresh) {
      // An explicit --refresh that is not a file is a caller error, never a
      // silent fall-back to a different refresher than the one named.
      if (!isFile(c)) failClosed('REFRESHER_ABSENT', `--refresh ${c} is not a readable file`);
      refresh = resolve(c);
      break;
    }
    if (isFile(c)) { refresh = resolve(c); break; }
  }
  if (refresh === null) {
    failClosed('REFRESHER_ABSENT', `no refresh-stanza.mjs beside this script or under ../K64ExecProxyRepair (pass --refresh FILE)`);
  }

  const proxySrc = readText(join(opts.lane, PROXY_REL));
  if (proxySrc === null) failClosed('PROXY_UNREADABLE', PROXY_REL);
  const scorecardText = readText(join(opts.lane, SCORECARD_REL));

  /* 0. preflight: a stanza proxy-check cannot parse is never rewritten. */
  const before = runNode(opts.lane, join(opts.lane, PROXY_REL), []);
  const beforeLine = lastLine(before.stdout);
  if (before.status === 2) failClosed('PROXY_REFUSED', `the tree's own stanza fails closed: ${beforeLine}`);
  if (beforeLine === '') failClosed('PROXY_UNRUNNABLE', `node ${PROXY_REL} printed no verdict (exit=${before.status})`);
  const gate = pinBlock(proxySrc, 'GATE_PINS');
  const declared = declaredGateKeys(scorecardText);
  const knownGateKeys = new Set(gate === null ? [] : gate.entries.map(([key]) => key));
  const unknownGate = declared.keys.filter((key) => !knownGateKeys.has(key));
  if (unknownGate.length > 0) {
    failClosed('GATE_PIN_KEY_UNKNOWN',
      `${GATE_CONTRACT} declares ${unknownGate.join(',')}, which GATE_PINS in ${PROXY_REL} does not carry — a refresher would drop the line; add the key first (an unpin is an L1 edit)`);
  }

  /* 1. the pin patch. */
  const plan = planPins(opts.lane, proxySrc, opts);
  const pinDiff = plan.added.length === 0 ? '' : unifiedDiff(proxySrc, plan.candidateSrc, PROXY_REL);
  let pinsWritten = 0;
  if (opts.write && plan.added.length > 0) {
    writeFileSync(join(opts.lane, PROXY_REL), plan.candidateSrc);
    pinsWritten = plan.added.length;
  }

  /* 2. the stanza refresh, measured by the refresher itself. */
  const rr = runNode(opts.lane, refresh, ['--lane', opts.lane, '--json']);
  let body = null;
  try { body = JSON.parse(rr.stdout); } catch { body = null; }
  if (body === null || typeof body !== 'object' || !Array.isArray(body.blockers)) {
    failClosed('REFRESHER_FAILED', `${refresh} printed no JSON body (exit=${rr.status}): ${lastLine(rr.stdout) || lastLine(rr.stderr)}`);
  }
  const blockers = body.blockers ?? [];
  const diff = String(body.diff ?? '');
  let stanzaWritten = false;
  let idempotent = null;
  if (opts.write && blockers.length === 0 && diff !== '') {
    copyFileSync(body.candidate, join(opts.lane, SCORECARD_REL));
    stanzaWritten = true;
    const again = runNode(opts.lane, refresh, ['--lane', opts.lane, '--json']);
    let againBody = null;
    try { againBody = JSON.parse(again.stdout); } catch { againBody = null; }
    idempotent = againBody === null
      ? { ok: false, diffBytes: -1, blockers: -1 }
      : { ok: (againBody.blockers ?? []).length === 0 && String(againBody.diff ?? '') === '', diffBytes: String(againBody.diff ?? '').length, blockers: (againBody.blockers ?? []).length };
  }

  /* 3. verification, plain and --strict, on the tree as it now stands. */
  const plain = runNode(opts.lane, join(opts.lane, PROXY_REL), []);
  const strict = runNode(opts.lane, join(opts.lane, PROXY_REL), ['--strict']);
  const plainLine = lastLine(plain.stdout);
  const strictLine = lastLine(strict.stdout);
  const match = (r, line) => r.status === 0 && line.startsWith('PROXY: MATCH');
  const ok = blockers.length === 0 && match(plain, plainLine) && match(strict, strictLine)
    && (idempotent === null || idempotent.ok);

  const summary = {
    contract: 'kumitate-close-proxy-v1',
    lane: opts.lane,
    write: opts.write,
    ok,
    refresher: refresh,
    before: { exit: before.status, verdict: beforeLine },
    pins: { added: plan.added, absent: plan.absent, written: pinsWritten, diff: pinDiff },
    refresh: {
      srcRev: body.srcRev ?? null,
      computed: body.computed ?? null,
      blockers,
      diffBytes: diff.length,
      stanzaWritten,
      idempotent,
    },
    after: { plain: { exit: plain.status, verdict: plainLine }, strict: { exit: strict.status, verdict: strictLine } },
  };

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return ok ? 0 : 1;
  }

  const out = [];
  out.push(`CLOSE_PROXY: ${opts.write ? 'write' : 'dry-run'} lane=${opts.lane} refresher=${refresh}`);
  out.push(`BEFORE  ${beforeLine} (exit ${before.status})`);
  out.push('');
  out.push(`--- pins (${plan.added.length === 0 ? 'none to add' : `${plan.added.length} to add`}) ---`);
  for (const p of plan.added) out.push(`PIN  + ${p.key}=${p.rel}  // ${p.why}`);
  for (const rel of plan.absent) out.push(`PIN  ? ${rel} named but absent from the lane — not pinned`);
  out.push(pinDiff === '' ? '' : pinDiff.replace(/\n$/, ''));
  out.push(`PINS: ${pinsWritten === 0 ? 'none written' : `wrote ${pinsWritten} key(s) into ${PROXY_REL}`}`);
  out.push('');
  out.push(`--- stanza diff (${diff === '' ? 'empty — the stanza is already current' : `${diff.length} bytes`}) ---`);
  out.push(diff === '' ? '' : diff.replace(/\n$/, ''));
  for (const b of blockers) out.push(`REFRESH  BLOCK  ${b.kind}  ${b.detail}`);
  out.push(`STANZA: ${stanzaWritten ? `wrote ${SCORECARD_REL} from the measured candidate` : diff === '' ? 'already current' : blockers.length > 0 ? 'NOT written (the refresher reports a blocker: fix the tree, never the number)' : 'NOT written (dry-run)'}`);
  if (idempotent !== null) out.push(`IDEMPOTENT: diff_bytes=${idempotent.diffBytes} blockers=${idempotent.blockers} ok=${idempotent.ok}`);
  out.push('');
  out.push(`AFTER  ${plainLine} (exit ${plain.status})`);
  out.push(`AFTER  ${strictLine} (exit ${strict.status})`);
  out.push('');
  out.push(ok
    ? `CLOSE_PROXY: MATCH (plain=0 strict=0 pins_added=${plan.added.length} pins_written=${pinsWritten} stanza_written=${stanzaWritten ? 'yes' : 'no'} idempotent=${idempotent === null ? 'n/a' : idempotent.ok})`
    : `CLOSE_PROXY: DRIFT (plain=${plain.status} strict=${strict.status} blockers=${blockers.length}${idempotent !== null && !idempotent.ok ? ' idempotent=false' : ''})`);
  process.stdout.write(`${out.join('\n')}\n`);
  return ok ? 0 : 1;
}

process.exitCode = main();
CLOSE_PROXY_JS

CLOSE_PROXY_DIR="$SELF_DIR" node "$TMPJS" "$@"
exit $?
