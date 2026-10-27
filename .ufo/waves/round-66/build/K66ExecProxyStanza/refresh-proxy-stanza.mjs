#!/usr/bin/env node
/**
 * refresh-proxy-stanza.mjs — round-66 D4 helper (proposal for the L1).
 *
 * Recomputes the `kumitate-proxy-v1` stanza block in SCORECARD.md from the
 * tree it is run against, and the `kumitate-gate-pins-v1` block for the gate
 * keys the lane already owns. It NEVER edits scripts/ or the corpus; it only
 * rewrites the two claim blocks inside one SCORECARD.md.
 *
 * Why this exists: the stanza was last refreshed at round 64 (A=351). Every
 * round since has added files, so the block has drifted. A hand-edited stanza
 * is re-broken by the next commit that adds a `.mjs`/`.sh`/`.py` file, and the
 * lane's own note ("A counts every file in the lane tree with a runnable
 * extension, including throwaway round probes") says so. This helper makes the
 * refresh a command, not a transcription.
 *
 * Usage:
 *   node refresh-proxy-stanza.mjs --self <lane-root> [--check] [--write]
 *
 *   --check  (default) print the current-vs-computed table and the block that
 *            WOULD be written; exit 0 when the block is already current,
 *            exit 1 when it is stale. Never writes.
 *   --write  rewrite the two blocks in <lane-root>/SCORECARD.md.
 *
 * Exit map: 0 current (or written), 1 stale, 64 usage.
 *
 * The helper re-uses `scripts/proxy-check.mjs` itself as the single source of
 * truth for the derived terms: it runs the gate with `--json` and reads the
 * `terms` it computed. It therefore never re-implements a derivation and can
 * never disagree with the gate about what the numbers are.
 *
 * The gate-pin digests are recomputed from the files the gate names in its own
 * `GATE_PINS` map; a key the gate does not know is a hard error (the gate
 * would fail closed with GATE_PIN_KEY_UNKNOWN on it).
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const USAGE = `usage: node refresh-proxy-stanza.mjs --self <lane-root> [--check | --write]
       node refresh-proxy-stanza.mjs -h|--help

Recompute the kumitate-proxy-v1 stanza (and the lane-owned kumitate-gate-pins-v1
block) from the tree at <lane-root> and print the block that would be written.

  --self DIR   lane root to measure (default: the repo containing this script)
  --check      print the table and the block; exit 1 when the block is stale (default)
  --write      rewrite the two blocks in <lane-root>/SCORECARD.md
  -h|--help    print this text, exit 0

exit map: 0 current (or written) · 1 stale · 64 usage
`;

const PROXY_HEAD = '<!-- kumitate-proxy-v1';
const GATE_HEAD = '<!-- kumitate-gate-pins-v1';

/** The stanza's declared-count keys, in the gate's own comparison order. */
const TERM_KEYS = ['A', 'C', 'C1', 'C1_total', 'C2', 'C2_total',
  'S_members', 'S_sections', 'R_members', 'R_sections',
  'coverage_script', 'coverage_runtime',
  'C1k', 'C1k_total', 'K_members', 'K_sections', 'coverage_kimi'];
/** The v1 pin keys (the parent-frozen six). */
const V1_PINS = ['pin.cite-check', 'pin.surface-probe', 'pin.round-gate',
  'pin.proxy-check', 'pin.claims-check', 'pin.kimi-census'];

function usage(msg) {
  if (msg) process.stderr.write(`refresh-proxy-stanza: ${msg}\n`);
  process.stderr.write(USAGE);
  process.exit(64);
}

function parseArgs(argv) {
  const out = { self: null, mode: 'check' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--self') {
      const v = argv[i + 1];
      if (!v || v.startsWith('--')) usage('--self needs a value');
      out.self = resolve(v); i += 1;
    } else if (a === '--check') out.mode = 'check';
    else if (a === '--write') out.mode = 'write';
    else if (a === '-h' || a === '--help') { process.stdout.write(USAGE); process.exit(0); }
    else usage(`unknown argument: ${a}`);
  }
  return out;
}

function sha256File(file) {
  try { return createHash('sha256').update(readFileSync(file)).digest('hex'); } catch { return null; }
}

/**
 * The gate-pin keys the lane owns, read from the gate's OWN `GATE_PINS` map
 * so this helper never names a file the gate does not verify.
 */
function gatePinMap(lane) {
  const src = readFileSync(join(lane, 'scripts', 'proxy-check.mjs'), 'utf8');
  const start = src.indexOf('const GATE_PINS = {');
  if (start < 0) throw new Error('scripts/proxy-check.mjs has no GATE_PINS map');
  const open = src.indexOf('{', start);
  const close = src.indexOf('\n};', open);
  const body = src.slice(open + 1, close);
  const map = {};
  for (const m of body.matchAll(/'([^']+)':\s*'([^']+)'/gu)) map[m[1]] = m[2];
  if (Object.keys(map).length === 0) throw new Error('GATE_PINS map parsed empty');
  return map;
}

/** The v1 pin files, read from the gate's OWN `PINS` map. */
function v1PinMap(lane) {
  const src = readFileSync(join(lane, 'scripts', 'proxy-check.mjs'), 'utf8');
  const start = src.indexOf('const PINS = {');
  if (start < 0) throw new Error('scripts/proxy-check.mjs has no PINS map');
  const open = src.indexOf('{', start);
  const close = src.indexOf('\n};', open);
  const body = src.slice(open + 1, close);
  const map = {};
  for (const m of body.matchAll(/'([^']+)':\s*'([^']+)'/gu)) map[m[1]] = m[2];
  return map;
}

/** The gate's own computed terms, via its `--json` mode. */
function gateTerms(lane) {
  const r = spawnSync(process.execPath, [join(lane, 'scripts', 'proxy-check.mjs'), '--json'], {
    encoding: 'utf8', timeout: 600_000, cwd: lane,
  });
  let doc;
  try { doc = JSON.parse(r.stdout); } catch {
    throw new Error(`proxy-check --json did not print JSON (exit=${r.status}): ${(r.stderr || '').trim()}`);
  }
  if (doc.verdict === 'FAIL-CLOSED') {
    throw new Error(`proxy-check failed closed: ${(doc.findings ?? []).map((f) => f.detail).join('; ')}`);
  }
  return doc;
}

/** Read one `key=value` block out of the scorecard. */
function readBlock(text, head) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim().startsWith(head));
  if (start < 0) return null;
  let end = -1;
  for (let i = start; i < lines.length; i += 1) { if (lines[i].includes('-->')) { end = i; break; } }
  if (end < 0) return null;
  const values = {};
  for (let i = start + 1; i < end; i += 1) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const m = /^([A-Za-z][A-Za-z0-9_.-]*)=(\S+)$/u.exec(raw);
    if (!m) return { malformed: `line ${i + 1} is not key=value` };
    values[m[1]] = m[2];
  }
  return { start, end, values };
}

/** Render a block body from an ordered key list. */
function renderBlock(head, keys, values) {
  return `${head}\n${keys.map((k) => `${k}=${values[k]}`).join('\n')}\n-->`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const lane = args.self ?? resolve(new URL('..', import.meta.url).pathname);
  const scorecardPath = join(lane, 'SCORECARD.md');

  let terms;
  try { terms = gateTerms(lane); } catch (e) { process.stderr.write(`refresh-proxy-stanza: ${e.message}\n`); process.exit(1); }
  const t = terms.terms;

  const v1Files = v1PinMap(lane);
  const gateFiles = gatePinMap(lane);

  // The stanza block: the gate's computed terms plus the gate's own v1 pins.
  const stanzaValues = {};
  for (const k of TERM_KEYS) stanzaValues[k] = String(t[k]);
  for (const k of V1_PINS) {
    const rel = v1Files[k];
    if (!rel) { process.stderr.write(`refresh-proxy-stanza: the gate has no ${k}\n`); process.exit(1); }
    const d = sha256File(join(lane, rel));
    if (!d) { process.stderr.write(`refresh-proxy-stanza: ${rel} is unreadable\n`); process.exit(1); }
    stanzaValues[k] = d;
  }

  // The gate-pin block: every key the lane's own map names, digested now.
  const gateValues = {};
  for (const [key, rel] of Object.entries(gateFiles)) {
    const d = sha256File(join(lane, rel));
    if (!d) { process.stderr.write(`refresh-proxy-stanza: ${rel} (${key}) is unreadable\n`); process.exit(1); }
    gateValues[key] = d;
  }

  const text = readFileSync(scorecardPath, 'utf8');
  const curStanza = readBlock(text, PROXY_HEAD);
  const curGate = readBlock(text, GATE_HEAD);
  if (!curStanza || curStanza.malformed) { process.stderr.write(`refresh-proxy-stanza: ${curStanza?.malformed ?? 'no kumitate-proxy-v1 block'}\n`); process.exit(1); }

  const rows = [];
  for (const k of [...TERM_KEYS, ...V1_PINS]) {
    const now = stanzaValues[k];
    const was = curStanza.values[k];
    rows.push([k, was ?? '(absent)', now, was === now ? 'same' : 'CHANGED']);
  }
  for (const [k, d] of Object.entries(gateValues)) {
    const was = curGate?.values?.[k];
    rows.push([k, was ?? '(absent)', d, was === d ? 'same' : 'CHANGED']);
  }
  const w = [22, 12, 68, 8];
  process.stdout.write(`${'KEY'.padEnd(w[0])}${'DECLARED'.padEnd(w[1])}${'COMPUTED'.padEnd(w[2])}${'STATE'.padEnd(w[3])}\n`);
  for (const r of rows) {
    process.stdout.write(`${r[0].padEnd(w[0])}${String(r[1]).slice(0, w[1] - 1).padEnd(w[1])}${String(r[2]).slice(0, w[2] - 1).padEnd(w[2])}${r[3]}\n`);
  }
  const changed = rows.filter((r) => r[3] === 'CHANGED').length;
  process.stdout.write(`\nchanged keys: ${changed} of ${rows.length}\n`);

  const newStanza = renderBlock(PROXY_HEAD, [...TERM_KEYS, ...V1_PINS], stanzaValues);
  const newGate = renderBlock(GATE_HEAD, Object.keys(gateValues), gateValues);

  if (args.mode === 'check') {
    process.stdout.write(`\n--- proposed kumitate-proxy-v1 block ---\n${newStanza}\n`);
    process.stdout.write(`\n--- proposed kumitate-gate-pins-v1 block ---\n${newGate}\n`);
    process.stdout.write(changed === 0 ? '\nSTANZA: CURRENT\n' : '\nSTANZA: STALE (run with --write)\n');
    process.exit(changed === 0 ? 0 : 1);
  }

  // --write: replace both blocks in place.
  const lines = text.split('\n');
  const replace = (block, rendered) => {
    const head = block.start;
    const body = rendered.split('\n');
    lines.splice(head, block.end - head + 1, ...body);
  };
  if (curGate) replace(curGate, newGate);
  replace(curStanza, newStanza);
  writeFileSync(scorecardPath, lines.join('\n'));
  process.stdout.write(`\nSTANZA: WRITTEN ${scorecardPath}\n`);
  process.exit(0);
}

process.exitCode = main();
