#!/usr/bin/env node
/**
 * refresh-stanza.mjs — recompute every `kumitate-proxy-v1` term and every
 * `kumitate-gate-pins-v1` pin of a lane tree, and print the exact replacement
 * stanza text plus a unified diff against the lane's `SCORECARD.md`.
 *
 * It NEVER writes the lane: the candidate scorecard is written to a fresh
 * directory under the OS temp dir, and `scripts/proxy-check.mjs` is re-run
 * against that candidate with `--scorecard` so the predicted verdict is a real
 * measurement, not a promise.
 *
 *   node refresh-stanza.mjs [--lane DIR] [--scorecard FILE] [--explain] [--json] [--help]
 *
 * Defaults: `--lane` is the current working directory, `--scorecard` is
 * `<lane>/SCORECARD.md`. `--lane` must hold `scripts/proxy-check.mjs`.
 *
 * Verdicts (one `REFRESH:` line on stdout, after the stanza text and the diff):
 *   REFRESH: OK (…)                 exit 0  candidate matches, no blocker
 *   REFRESH: BLOCKED (…)            exit 1  the candidate is printed but the
 *                                           tree still has a defect this tool
 *                                           must not launder into the stanza
 *   REFRESH: FAIL-CLOSED (…)        exit 2  a measurement could not be taken
 *   REFRESH: USAGE …                exit 64
 *
 * Blockers are the honest kind: a `scripts/*.mjs` file no pin key covers
 * (`PIN_UNPINNED`, which `proxy-check --strict` promotes to DRIFT), a gate-pin
 * file that vanished, a corpus note with no README map row (C2 < C2_total — the
 * root cause of the round-64 base AXES_DRIFT), or a candidate whose own
 * measurement still reads DRIFT. None of them is repaired here, because the
 * honest repair is never "write the number the tree happens to produce": the
 * round-64 base drifted exactly because a stanza term was refreshed while the
 * map gap that produced it was left in place.
 *
 * Order matters: run this AFTER every script edit of the round (the pins hash
 * the bytes on disk) and after the map repair, and BEFORE the closing commit.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const PROXY_CONTRACT = 'kumitate-proxy-v1';
const PROXY_HEAD = `<!-- ${PROXY_CONTRACT}`;
const GATE_CONTRACT = 'kumitate-gate-pins-v1';
const GATE_HEAD = `<!-- ${GATE_CONTRACT}`;
const SCORECARD_FILE = 'SCORECARD.md';
const PROXY_SCRIPT = 'scripts/proxy-check.mjs';
const README_MAP_SCRIPT = 'scripts/readme-map.mjs';
const RE_HEX64 = /^[0-9a-f]{64}$/;
const RE_INT = /^\d+$/;

const USAGE = 'usage: node refresh-stanza.mjs [--lane DIR] [--scorecard FILE] [--explain] [--json]\n';

function usage(detail) {
  process.stderr.write(`REFRESH: USAGE ${detail}\n${USAGE}`);
  process.exit(64);
}

function failClosed(token, detail) {
  process.stdout.write(`REFRESH: FAIL-CLOSED (${token}) ${detail}\n`);
  process.exit(2);
}

/* -------------------------------------------------------------------- args */

function parseArgs(argv) {
  const opts = { lane: process.cwd(), scorecard: null, explain: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') {
      if (i + 1 >= argv.length) usage('--lane needs a value');
      opts.lane = argv[++i];
    } else if (a === '--scorecard') {
      if (i + 1 >= argv.length) usage('--scorecard needs a value');
      opts.scorecard = argv[++i];
    } else if (a === '--explain') opts.explain = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') { process.stdout.write(USAGE); process.exit(0); }
    else usage(`unknown argument ${JSON.stringify(a)}`);
  }
  opts.lane = resolve(opts.lane);
  opts.scorecard = opts.scorecard === null ? join(opts.lane, SCORECARD_FILE) : resolve(opts.scorecard);
  return opts;
}

/* -------------------------------------------------------------- primitives */

function sha256File(file) {
  try { return createHash('sha256').update(readFileSync(file)).digest('hex'); } catch { return null; }
}

function readText(file) {
  try { return readFileSync(file, 'utf8'); } catch { return null; }
}

function isFile(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}

/** `node <script> ...` in the lane; never inherits a redirected GIT_DIR. */
function runNode(lane, script, args) {
  const env = { ...process.env };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX']) delete env[k];
  return spawnSync(process.execPath, [join(lane, script), ...args], {
    cwd: lane, env, encoding: 'utf8', timeout: 120_000,
  });
}

/* --------------------------------------------------- proxy-check's own maps */

/**
 * The pin maps are read from `scripts/proxy-check.mjs` itself, never copied
 * here: a second hard-coded table would drift from the gate it claims to
 * refresh. Both maps are object literals of `'pin.<key>': '<scripts/rel>'`.
 */
function parsePinMap(src, name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start < 0) return null;
  const end = src.indexOf('\n};', start);
  if (end < 0) return null;
  const body = src.slice(start, end);
  const out = [];
  const re = /'(pin\.[a-z0-9][a-z0-9-]*)':\s*'(scripts\/[^']+)'/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push([m[1], m[2]]);
  return out.length > 0 ? out : null;
}

/** The frozen term-key order, read from the same source. */
function parseTermKeys(src) {
  const start = src.indexOf('const TERM_KEYS = [');
  if (start < 0) return null;
  const end = src.indexOf('];', start);
  if (end < 0) return null;
  const keys = [...src.slice(start, end).matchAll(/'([A-Za-z][A-Za-z0-9_]*)'/g)].map((m) => m[1]);
  return keys.length > 0 ? keys : null;
}

/* ------------------------------------------------------------------ stanza */

/** `[start, end]` line indices of the block opened by `head`, or null. */
function blockRange(lines, head) {
  const starts = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].trim().startsWith(head)) starts.push(i);
  if (starts.length === 0) return null;
  if (starts.length > 1) failClosed('STANZA_MALFORMED',
    `${starts.length} "${head}" blocks at lines ${starts.map((i) => i + 1).join(',')}`);
  const start = starts[0];
  for (let i = start; i < lines.length; i++) if (lines[i].includes('-->')) return { start, end: i };
  return failClosed('STANZA_MALFORMED', `block opened at line ${start + 1} is never terminated by "-->"`);
}

/** The declared `key=value` pairs of a block, in file order. */
function blockValues(lines, range) {
  const out = [];
  for (let i = range.start + 1; i < range.end; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const eq = raw.indexOf('=');
    if (eq <= 0) failClosed('STANZA_MALFORMED', `line ${i + 1} is not key=value: ${JSON.stringify(lines[i])}`);
    out.push([raw.slice(0, eq), raw.slice(eq + 1)]);
  }
  return out;
}

/** Render `<!-- head … -->` from ordered `[key, value]` pairs. */
function renderBlock(head, pairs) {
  return [`<!-- ${head}`, ...pairs.map(([k, v]) => `${k}=${v}`), '-->'];
}

/**
 * Order the new pairs by the CURRENT file order (smallest reviewable diff),
 * then append keys the file does not carry yet in their canonical order.
 */
function orderedPairs(currentKeys, canonical, values) {
  const out = [];
  const seen = new Set();
  for (const key of currentKeys) {
    if (!values.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push([key, values.get(key)]);
  }
  for (const key of canonical) {
    if (!values.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push([key, values.get(key)]);
  }
  return out;
}

/* --------------------------------------------------------------- the check */

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!isFile(join(opts.lane, PROXY_SCRIPT))) {
    failClosed('LANE_NOT_A_LANE', `${join(opts.lane, PROXY_SCRIPT)} is not a file (--lane must hold the lane tree)`);
  }
  const scorecardText = readText(opts.scorecard);
  if (scorecardText === null) failClosed('SCORECARD_MISSING', `${opts.scorecard} is not readable`);

  const proxySrc = readText(join(opts.lane, PROXY_SCRIPT));
  if (proxySrc === null) failClosed('PROXY_UNREADABLE', PROXY_SCRIPT);
  const termKeys = parseTermKeys(proxySrc);
  if (termKeys === null) failClosed('TERM_KEYS_UNPARSEABLE', `no TERM_KEYS array in ${PROXY_SCRIPT}`);
  const v1Pins = parsePinMap(proxySrc, 'PINS');
  if (v1Pins === null) failClosed('PINS_UNPARSEABLE', `no PINS map in ${PROXY_SCRIPT}`);
  const gatePins = parsePinMap(proxySrc, 'GATE_PINS');
  if (gatePins === null) failClosed('GATE_PINS_UNPARSEABLE', `no GATE_PINS map in ${PROXY_SCRIPT}`);

  /* 1. the measurement: proxy-check over the lane, JSON body ----------------- */
  const measured = runNode(opts.lane, PROXY_SCRIPT, ['--self', opts.lane, '--json']);
  let body = null;
  try { body = JSON.parse(measured.stdout); } catch { body = null; }
  if (body === null || typeof body !== 'object' || typeof body.terms !== 'object') {
    const err = String(measured.stderr ?? '').trim().split('\n')[0] ?? '';
    failClosed('PROXY_UNRUNNABLE',
      `node ${PROXY_SCRIPT} --json printed no JSON body (exit=${measured.status}${err ? `; ${err}` : ''})`);
  }
  if (body.verdict === 'FAIL-CLOSED') {
    const f = Array.isArray(body.findings) && body.findings[0] ? body.findings[0] : { kind: 'UNKNOWN', detail: '' };
    failClosed(`PROXY_${f.kind}`, `${PROXY_SCRIPT} refused: ${f.detail}`);
  }
  const computed = body.terms;
  for (const key of termKeys) {
    if (!RE_INT.test(String(computed[key] ?? ''))) {
      failClosed('TERM_UNMEASURED', `proxy-check JSON has no integer term ${key} (got ${JSON.stringify(computed[key])})`);
    }
  }

  /* 2. the pins: hashed from the lane, both blocks --------------------------- */
  const blockers = [];
  const termValues = new Map(termKeys.map((k) => [k, String(computed[k])]));
  const pinValues = new Map();
  for (const [key, rel] of v1Pins) {
    const sha = sha256File(join(opts.lane, rel));
    if (sha === null) failClosed('PIN_FILE_ABSENT', `${key} names ${rel}, which is not a readable file`);
    pinValues.set(key, sha);
  }
  const gateValues = new Map();
  for (const [key, rel] of gatePins) {
    const sha = sha256File(join(opts.lane, rel));
    if (sha === null) {
      blockers.push({
        kind: 'GATE_PIN_FILE_ABSENT',
        detail: `${key} names ${rel}, which is not a readable file — remove the key from GATE_PINS in ${PROXY_SCRIPT} (an unpin is an L1 edit, never a silent drop here)`,
      });
      continue;
    }
    gateValues.set(key, sha);
  }

  /* 3. pin coverage: a scripts/*.mjs no key covers --------------------------- */
  const pinnedRels = new Set([...v1Pins.map(([, rel]) => rel), ...gatePins.map(([, rel]) => rel)]);
  let scriptNames = [];
  try { scriptNames = readdirSync(join(opts.lane, 'scripts'), { withFileTypes: true }); } catch { scriptNames = []; }
  for (const e of scriptNames) {
    if (!e.isFile() || !e.name.endsWith('.mjs')) continue;
    const rel = `scripts/${e.name}`;
    if (pinnedRels.has(rel)) continue;
    const suggested = `pin.${e.name.replace(/\.mjs$/u, '')}`;
    blockers.push({
      kind: 'PIN_UNPINNED',
      detail: `${rel} has no pin key — add \`'${suggested}': '${rel}',\` to GATE_PINS in ${PROXY_SCRIPT} (strengthens --strict), then re-run this tool so the key is pinned in the ${GATE_CONTRACT} block`,
    });
  }

  /* 4. the corpus map: the round-64 base root cause -------------------------- */
  const c2 = Number(computed.C2);
  const c2Total = Number(computed.C2_total);
  let readmeMap = null;
  if (c2 !== c2Total) {
    let detail = `C2=${c2} README rows vs C2_total=${c2Total} corpus *.md — ${c2Total - c2} note(s) carry no map row; proxy coverage derives ${Math.floor(10 * (Number(computed.C1) / Number(computed.C1_total)) * (c2 / c2Total))} and the ## Axes row would have to be lowered to match (an axis harm)`;
    if (isFile(join(opts.lane, README_MAP_SCRIPT))) {
      const rm = runNode(opts.lane, README_MAP_SCRIPT, []);
      const line = String(rm.stdout ?? '').trim().split('\n').filter((l) => l.startsWith('README_MAP:')).pop() ?? '';
      const note = String(rm.stdout ?? '').trim().split('\n').find((l) => l.includes('unpinned:')) ?? '';
      readmeMap = { exit: rm.status, line, note };
      detail += `; \`node ${README_MAP_SCRIPT}\` exit=${rm.status}${line ? ` reads ${line}` : ''}${note ? ` (${note.trim()})` : ''}`;
    }
    blockers.push({ kind: 'MAP_INCOMPLETE', detail });
  }

  /* 5. the candidate scorecard, byte-identical outside the two blocks -------- */
  const lines = scorecardText.split('\n');
  const v1Range = blockRange(lines, PROXY_HEAD);
  if (v1Range === null) failClosed('STANZA_MISSING', `no "${PROXY_HEAD}" block in ${opts.scorecard}`);
  const v1Current = blockValues(lines, v1Range);
  const gateRange = blockRange(lines, GATE_HEAD);
  const gateCurrent = gateRange === null ? [] : blockValues(lines, gateRange);

  const canonicalTerms = [...termKeys, ...v1Pins.map(([k]) => k)];
  const knownV1 = new Set(canonicalTerms);
  for (const [key] of v1Current) {
    if (knownV1.has(key)) continue;
    blockers.push({
      kind: 'STANZA_KEY_UNKNOWN',
      detail: `${PROXY_CONTRACT} declares ${key}, which is neither a TERM_KEYS term nor a PINS key in ${PROXY_SCRIPT} — the candidate would drop it, so fix the source first`,
    });
  }
  const v1Pairs = orderedPairs(v1Current.map(([k]) => k), canonicalTerms, new Map([...termValues, ...pinValues]));
  const gatePairs = orderedPairs(gateCurrent.map(([k]) => k), gatePins.map(([k]) => k), gateValues);

  const v1Block = renderBlock(PROXY_CONTRACT, v1Pairs);
  const gateBlock = renderBlock(GATE_CONTRACT, gatePairs);
  // Replacements are applied bottom-up so neither range can shift the other,
  // whichever block comes first in the file.
  const edits = [{ start: v1Range.start, end: v1Range.end, lines: v1Block }];
  if (gateRange === null) {
    // No gate block yet: insert one after the v1 block (a strengthening).
    // `end = start - 1` is a pure insertion under the count below.
    edits.push({ start: v1Range.end + 1, end: v1Range.end, lines: ['', ...gateBlock] });
  } else {
    edits.push({ start: gateRange.start, end: gateRange.end, lines: gateBlock });
  }
  const candidateLines = [...lines];
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    candidateLines.splice(e.start, e.end - e.start + 1, ...e.lines);
  }
  const candidateText = candidateLines.join('\n');

  /* 6. the prediction: measure the candidate, never promise it --------------- */
  const tmp = mkdtempSync(join(tmpdir(), 'refresh-stanza-'));
  const candidatePath = join(tmp, SCORECARD_FILE);
  writeFileSync(candidatePath, candidateText);
  const predict = (strict) => {
    const args = ['--self', opts.lane, '--scorecard', candidatePath];
    if (strict) args.push('--strict');
    const r = runNode(opts.lane, PROXY_SCRIPT, args);
    const out = String(r.stdout ?? '').trim().split('\n');
    return { exit: r.status, verdict: out[out.length - 1] ?? '', findings: out.slice(0, -1) };
  };
  const plain = predict(false);
  const strict = predict(true);
  if (plain.verdict === '' || plain.exit === 2) {
    blockers.push({
      kind: 'CANDIDATE_UNMEASURABLE',
      detail: `proxy-check over the candidate exited ${plain.exit}: ${plain.verdict || String(measured.stderr ?? '').trim()}`,
    });
  } else if (plain.exit !== 0) {
    blockers.push({ kind: 'CANDIDATE_DRIFT', detail: `candidate still reads ${plain.verdict}` });
  }
  if (plain.exit === 0 && strict.exit !== 0) {
    blockers.push({ kind: 'CANDIDATE_STRICT_DRIFT', detail: `candidate matches plain but reads ${strict.verdict} under --strict` });
  }

  /* 7. the diff -------------------------------------------------------------- */
  const diff = unifiedDiff(opts.scorecard, candidatePath);

  /* 8. render ---------------------------------------------------------------- */
  const head = `REFRESH: ${blockers.length === 0 ? 'OK' : 'BLOCKED'} (lane=${opts.lane} scorecard=${opts.scorecard} src-rev=${String(body.srcRev ?? 'none').slice(0, 12)} terms=${termKeys.length} pins=${v1Pins.length} gate-pins=${gateValues.size} blockers=${blockers.length})`;
  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      contract: 'kumitate-refresh-stanza-v1',
      ok: blockers.length === 0,
      lane: opts.lane,
      scorecard: opts.scorecard,
      srcRev: body.srcRev ?? null,
      computed: Object.fromEntries(termValues),
      declared: computed.declared ?? null,
      pins: Object.fromEntries(pinValues),
      gatePins: Object.fromEntries(gateValues),
      stanza: v1Block.join('\n'),
      gateStanza: gateBlock.join('\n'),
      diff,
      readmeMap,
      blockers,
      predict: { plain, strict },
      candidate: candidatePath,
    }, null, 2)}\n`);
    return blockers.length === 0 ? 0 : 1;
  }

  const out = [head];
  for (const b of blockers) out.push(`REFRESH  BLOCK  ${b.kind}  ${b.detail}`);
  out.push('', `--- ${PROXY_CONTRACT} ---`, ...v1Block, '', `--- ${GATE_CONTRACT} ---`, ...gateBlock);
  out.push('', `--- diff (${diff === '' ? 'empty — the stanza is already current' : 'a/SCORECARD.md → b/SCORECARD.md'}) ---`);
  out.push(diff === '' ? '' : diff.replace(/\n$/, ''));
  out.push('', `PREDICT: ${plain.exit === 0 ? 'MATCH' : 'DRIFT'} (exit ${plain.exit}) strict=${strict.exit === 0 ? 'MATCH' : 'DRIFT'} (exit ${strict.exit})`);
  for (const f of plain.findings) out.push(`PREDICT  ${f}`);
  for (const f of strict.findings) out.push(`PREDICT-strict  ${f}`);
  if (opts.explain) {
    const deltas = termKeys
      .filter((k) => computed.declared && String(computed.declared[k]) !== String(computed[k]))
      .map((k) => `${k}: declared=${computed.declared[k]} computed=${computed[k]}`);
    out.push('', `EXPLAIN: term deltas ${deltas.length === 0 ? 'none' : deltas.join('; ')}`);
    // A counts every runnable file under the lane, `.ufo/` included: the round's
    // own counters and any committed build artifact land in it. Name that share
    // so the L1 can see whether A moved because the lane grew or because a
    // scratch file is about to be committed.
    const reRunnable = /\.(?:mjs|js|sh|py)$/;
    let ufoRunnable = 0;
    const walk = (dir) => {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        if (e.name === '.git') continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile() && reRunnable.test(e.name)) ufoRunnable += 1;
      }
    };
    walk(join(opts.lane, '.ufo'));
    out.push(`EXPLAIN: A=${computed.A} of which ${ufoRunnable} runnable file(s) under .ufo/ (counted by the frozen walk; commit order decides this number)`);
  }
  out.push('', `WROTE: none (lane untouched; candidate at ${candidatePath})`);
  process.stdout.write(`${out.join('\n')}\n`);
  return blockers.length === 0 ? 0 : 1;
}

/** `diff -u` with stable labels; '' when the bytes are identical. */
function unifiedDiff(aPath, bPath) {
  const r = spawnSync('diff', ['-u', '--label', 'a/SCORECARD.md', '--label', 'b/SCORECARD.md', aPath, bPath], {
    encoding: 'utf8', timeout: 30_000,
  });
  if (r.error) failClosed('DIFF_UNRUNNABLE', `diff could not run: ${r.error.code ?? r.error.message}`);
  if (r.status === 0) return '';
  if (r.status !== 1) failClosed('DIFF_UNRUNNABLE', `diff exited ${r.status}: ${String(r.stderr ?? '').trim()}`);
  return String(r.stdout ?? '');
}

// The candidate lives under the OS temp dir (never in the lane) and is left in
// place so the caller can inspect exactly what the diff would apply.
process.exitCode = main();
