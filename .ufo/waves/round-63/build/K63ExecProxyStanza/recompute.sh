#!/bin/sh
# recompute.sh — re-derive the `kumitate-proxy-v1` stanza and the
# `kumitate-gate-pins-v1` block from a lane directory, INDEPENDENTLY of the
# stanza (and of the tool's own --json body, which a fail-closed run never
# prints). It mirrors scripts/proxy-check.mjs's frozen derivation exactly:
#
#   A         every regular file under <lane> (any `.git` tree pruned, symlinks
#             not followed) whose name ends .mjs/.js/.sh/.py — this includes
#             .ufo/waves/** probes AND any uncommitted build artifact.
#   C         lines of SKILL.md matching /^\s*- \[/
#   C1/C1_total  `| S<n> |` / `| R<n> |` rows of SCORECARD.md and how many carry
#             a 4th data cell starting with `yes`
#   C2        lines of corpus/README.md matching /^\| `(knowledge|lessons)\//
#   C2_total  *.md files under corpus/knowledge + corpus/lessons (recursive)
#   pin.*     sha256 of every file named by the PINS and GATE_PINS maps in
#             scripts/proxy-check.mjs (parsed from the tool, so a key added
#             there is picked up without editing this script)
#
# It also (a) prints the two derived scores, (b) cross-checks its own counts
# against `node <lane>/scripts/proxy-check.mjs --json` when that run produces a
# body, (c) runs the preflight that the round-62 fail-closed needed: every key
# declared in the lane's pin blocks must be registered in the tool's maps, and
# (d) lists the runnables that are NOT in `git ls-files` — those inflate A in a
# working tree but are absent from a `git archive` of the same revision, so the
# L1 must run this script AFTER the final file set exists (or gate on an
# archive, where A is stable).
#
# usage: recompute.sh <lane-dir>
# exit: 0 consistent · 1 drift between this derivation and the tool/stanza ·
#       2 fail-closed (missing lane file) · 64 usage.
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: recompute.sh <lane-dir>" >&2
  exit 64
fi
if [ ! -d "$1" ]; then
  echo "recompute: not a directory: $1" >&2
  exit 64
fi
LANE_ABS=$(cd "$1" && pwd)
export LANE_ABS

node --input-type=module - <<'NODE'
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const LANE = process.env.LANE_ABS;
const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;
const RE_CHECKLIST = /^\s*- \[/;
const RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/;
const RE_README_ROW = /^\| `(knowledge|lessons)\//;
const RE_KV = /^([A-Za-z][A-Za-z0-9_.-]*)=(\S+)$/;
const CORPUS_DIRS = ['corpus/knowledge', 'corpus/lessons'];

const fail = (token, detail) => {
  console.error(`RECOMPUTE: FAIL-CLOSED (${token}) ${detail}`);
  process.exit(2);
};

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

function walkFiles(root, rel = '', out = []) {
  let entries;
  try { entries = readdirSync(join(root, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === '.git') continue;
    const r = rel === '' ? e.name : `${rel}/${e.name}`;
    if (e.isDirectory()) walkFiles(root, r, out);
    else if (e.isFile()) out.push(r);
  }
  return out;
}

function splitRowCells(line) {
  const cells = [];
  let cur = '';
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (ch === '|') { cells.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

const countLines = (text, re) => text.split('\n').filter((l) => re.test(l)).length;

function readText(rel) {
  const p = join(LANE, rel);
  if (statKind(p) !== 'file') fail('LANE_FILE_MISSING', `${rel} is ${statKind(p)} under ${LANE}`);
  return readFileSync(p, 'utf8');
}

function sha256File(rel) {
  try { return createHash('sha256').update(readFileSync(join(LANE, rel))).digest('hex'); }
  catch { return null; }
}

/* ---- the four self-only counts (proxy-check deriveTerms) ---- */
const scorecardText = readText('SCORECARD.md');
const skillText = readText('SKILL.md');
const readmeText = readText('corpus/README.md');
const files = walkFiles(LANE);
const A = files.filter((r) => RE_RUNNABLE.test(r)).length;
const C = countLines(skillText, RE_CHECKLIST);
const C2 = countLines(readmeText, RE_README_ROW);
let notes = 0;
for (const d of CORPUS_DIRS) {
  if (statKind(join(LANE, d)) !== 'dir') fail('CORPUS_DIRS_MISSING', `${d} is not a dir`);
  for (const rel of walkFiles(join(LANE, d))) if (rel.endsWith('.md')) notes += 1;
}
const C2_total = notes;
let C1 = 0; let C1_total = 0;
for (const line of scorecardText.split('\n')) {
  if (!RE_REGISTRY_ROW.test(line)) continue;
  C1_total += 1;
  const cells = splitRowCells(line);
  if ((cells[4] ?? '').trim().startsWith('yes')) C1 += 1;
}

/* ---- the pin maps, parsed from the tool itself ---- */
const toolText = readText('scripts/proxy-check.mjs');
function pinMap(name) {
  const m = new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\};`, 'u').exec(toolText);
  if (!m) fail('PIN_MAP_UNREADABLE', `cannot locate const ${name} = { … }; in scripts/proxy-check.mjs`);
  const out = [];
  for (const line of m[1].split('\n')) {
    const body = line.split('//')[0];
    const kv = /'([^']+)':\s*'([^']+)'/u.exec(body);
    if (kv) out.push([kv[1], kv[2]]);
  }
  if (out.length === 0) fail('PIN_MAP_UNREADABLE', `const ${name} parsed to zero entries`);
  return out;
}
const v1Pins = pinMap('PINS');
const gatePins = pinMap('GATE_PINS');

/* ---- stanza blocks as declared (for the preflight and the drift diff) ---- */
function blockKeys(head) {
  const lines = scorecardText.split('\n');
  const start = lines.findIndex((l) => l.includes(head));
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && l.includes('-->'));
  if (end < 0) fail('STANZA_MALFORMED', `block "${head}" is never terminated`);
  const vals = new Map();
  for (let i = start + 1; i < end; i += 1) {
    const m = RE_KV.exec(lines[i].trim());
    if (m) vals.set(m[1], m[2]);
  }
  return vals;
}
const declaredV1 = blockKeys('<!-- kumitate-proxy-v1');
const declaredGate = blockKeys('<!-- kumitate-gate-pins-v1');

/* ---- print the paste-ready values ---- */
const TERM_KEYS = ['A', 'C', 'C1', 'C1_total', 'C2', 'C2_total'];
/* Every key the v1 stanza may declare (TERM_KEYS above plus the origin-walked
 * layer terms and the live-kimi terms this script does not re-derive). */
const ALL_TERM_KEYS = [...TERM_KEYS, 'S_members', 'S_sections', 'R_members', 'R_sections',
  'coverage_script', 'coverage_runtime', 'C1k', 'C1k_total', 'K_members', 'K_sections',
  'coverage_kimi'];
const computed = { A, C, C1, C1_total, C2, C2_total };
console.log(`# recompute.sh — lane ${LANE}`);
console.log(`# A counts ${A} of ${files.length} regular files (pruned: any .git tree; symlinks not followed)`);
console.log(`# C2_total counts ${C2_total} corpus notes; C2 counts ${C2} README map rows`);
console.log('# --- self-only terms (independent re-derivation)');
for (const k of TERM_KEYS) console.log(`${k}=${computed[k]}`);
console.log('# --- pins (sha256 of the file each key names; keys parsed from the tool)');
let pinsOk = true;
for (const [key, rel] of [...v1Pins, ...gatePins]) {
  const sha = sha256File(rel);
  if (sha === null) { pinsOk = false; console.log(`# pin.${key.replace(/^pin\./u, '')}: ${rel} is ${statKind(join(LANE, rel))}`); continue; }
  console.log(`${key}=${sha}`);
}
const operability = Math.floor(10 * ((A + C) / (A + C + 3)));
const coverage = C1_total === 0 || C2_total === 0 ? 0
  : Math.floor(10 * (C1 / C1_total) * (C2 / C2_total));
console.log('# --- derived scores (legacy terms only; the layer/kimi terms need the origin walk and the live kimi root)');
console.log(`operability=${operability}`);
console.log(`coverage=${coverage}`);

/* ---- preflight: the R62 fail-closed class ---- */
const gateKeys = new Set(gatePins.map(([k]) => k));
const v1Keys = new Set(v1Pins.map(([k]) => k));
let preflightBad = 0;
if (declaredGate === null) { console.log('# preflight: no kumitate-gate-pins-v1 block'); }
else for (const key of declaredGate.keys()) {
  if (!gateKeys.has(key)) { console.log(`# PREFLIGHT FAIL: ${key} is declared in SCORECARD.md but not in GATE_PINS (proxy-check would FAIL-CLOSED GATE_PIN_KEY_UNKNOWN)`); preflightBad += 1; }
}
if (declaredV1 === null) { console.log('# preflight: no kumitate-proxy-v1 block'); }
else for (const key of declaredV1.keys()) {
  if (!v1Keys.has(key) && !ALL_TERM_KEYS.includes(key)) { console.log(`# PREFLIGHT FAIL: ${key} is declared in SCORECARD.md but not a v1 term or PINS key`); preflightBad += 1; }
}
for (const [key] of gatePins) if (declaredGate !== null && !declaredGate.has(key)) {
  console.log(`# PREFLIGHT NOTE: ${key} is registered in GATE_PINS but not declared in SCORECARD.md`);
}
if (preflightBad === 0) console.log('# preflight: OK — every declared pin key is registered in the tool');

/* ---- untracked runnables: what makes a working-tree A differ from an archive ---- */
let tracked = null;
try {
  /* Only when the directory IS a git work-tree root: `git -C <subdir>` of a
   * checkout would otherwise list the parent repository's index against
   * relative paths that do not exist there, and call every file untracked. */
  const top = execFileSync('git', ['-C', LANE, 'rev-parse', '--show-toplevel'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  if (top === LANE) {
    tracked = new Set(execFileSync('git', ['-C', LANE, 'ls-files'], { encoding: 'utf8', maxBuffer: 64 << 20 })
      .split('\n').filter(Boolean));
  } else {
    console.log(`# not a git work-tree root (toplevel ${top}): untracked section skipped`);
  }
} catch { console.log('# not a git work tree: untracked section skipped'); }
if (tracked) {
  const untracked = files.filter((r) => RE_RUNNABLE.test(r) && !tracked.has(r));
  console.log(`# runnables not in git ls-files (counted by A here, absent from git archive): ${untracked.length}`);
  for (const r of untracked.slice(0, 40)) console.log(`#   untracked: ${r}`);
  if (untracked.length > 40) console.log(`#   … ${untracked.length - 40} more`);
}

/* ---- cross-check against the tool's own derivation, when it prints a body ---- */
let toolBody = null;
try {
  const out = execFileSync(process.execPath, [join(LANE, 'scripts/proxy-check.mjs'), '--json'],
    { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
  toolBody = JSON.parse(out);
} catch (e) {
  const out = typeof e.stdout === 'string' ? e.stdout : '';
  try { toolBody = JSON.parse(out); } catch {
    const line = `${e.stdout ?? ''}${e.stderr ?? ''}`.split('\n').find((l) => l.includes('PROXY:')) ?? '';
    console.log(`# tool: no JSON body (exit ${e.status ?? '?'}) ${line.trim()}`);
  }
}
let drift = 0;
if (toolBody?.terms) {
  const t = toolBody.terms;
  for (const k of TERM_KEYS) if (t[k] !== computed[k]) {
    console.log(`# DRIFT vs tool: ${k} independent=${computed[k]} tool=${t[k]}`); drift += 1;
  }
  const shown = ['S_members', 'S_sections', 'R_members', 'R_sections', 'coverage_script',
    'coverage_runtime', 'C1k', 'C1k_total', 'K_members', 'K_sections', 'coverage_kimi'];
  console.log(`# tool terms: ${shown.map((k) => `${k}=${t[k]}`).join(' ')}`);
  console.log(`# tool verdict: ${toolBody.verdict} errors=${toolBody.errors} warnings=${toolBody.warnings}`);
  for (const f of toolBody.findings ?? []) {
    console.log(`# tool finding: ${f.severity} ${f.kind} ${f.detail}`);
    if (f.severity === 'error') drift += 1;
  }
}
if (!pinsOk) drift += 1;
if (preflightBad > 0) drift += 1;
console.log(drift === 0 && preflightBad === 0 ? 'RECOMPUTE: OK' : `RECOMPUTE: DRIFT findings=${drift + preflightBad}`);
process.exit(drift === 0 && preflightBad === 0 ? 0 : 1);
NODE
