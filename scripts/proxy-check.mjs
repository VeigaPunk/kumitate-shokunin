#!/usr/bin/env node
/**
 * proxy-check.mjs — the lane's own measurement-proxy re-computer.
 * Read-only, zero deps, ESM, node >= 20, no network. Contract:
 * kumitate-proxy-v1 (parent-frozen).
 *
 *   node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--json] [--strict]
 *   node scripts/proxy-check.mjs --selftest
 *   node scripts/proxy-check.mjs -h|--help
 *
 * Why this exists
 *   `SCORECARD.md` states both axes as arithmetic over five tree counts
 *   (`f_O = (A+C)/(A+C+3)`, `coverage = floor(10 × C1/C1_total × C2/C2_total)`)
 *   plus four file digests. Every term in that sentence is re-derivable from
 *   the tree in under a second, so none of them should be taken on faith: this
 *   tool recomputes all of them and compares them, key by key, with the
 *   machine-readable claim the scorecard carries.
 *
 * Modes (one per run; `--selftest` wins, then `-h|--help`, else the recompute)
 *   default     recompute the five terms + the four pins under `--self` and
 *               compare them with the kumitate-proxy-v1 stanza. The registry
 *               rows and the `## Axes` rows are read from the SAME file as the
 *               stanza (`--scorecard`, default `<self>/SCORECARD.md`).
 *   --selftest  HERMETIC fixture suite: synthetic repos under `mkdtemp` only.
 *               It never reads this repo, the live scorecard or the
 *               environment, so it PASSes in any tree state and a bogus
 *               `--self` cannot affect it. `--selftest` wins over `--json`.
 *   -h|--help   print USAGE, exit 0.
 *
 * Derivation (frozen — the stanza may declare these, never re-charter them)
 *   A   files under `--self` (any `.git` tree excluded), named
 *       `*.mjs|*.js|*.sh|*.py`
 *   C   lines of `<self>/SKILL.md` matching /^\s*- \[/
 *   C1  rows of the scorecard matching /^\| (S|R)\d+ \|/ whose 4th
 *       `|`-separated cell, trimmed, starts with `yes`; C1_total = those rows
 *   C2  lines of `<self>/corpus/README.md` matching
 *       /^\| `(knowledge|lessons)\//
 *   C2_total  `*.md` files under `<self>/corpus/knowledge` + `corpus/lessons`
 *   operability = floor(10 × (A+C)/(A+C+3))
 *   coverage    = floor(10 × C1/C1_total × C2/C2_total)
 *   pins  sha256 hex of `<self>/scripts/{cite-check,surface-probe,round-gate,
 *         proxy-check}.mjs`
 *   The derived `operability` / `coverage` must ALSO equal the integers in the
 *   scorecard's `## Axes` rows `| operability | N |` and `| coverage | N |`.
 *   These counts are shell-identical to the commands the scorecard already
 *   prints: `find . -path ./.git -prune -o -type f \( -name '*.mjs' … \) -print
 *   | wc -l`, `grep -c '^\s*- \[' SKILL.md`, `grep -cE '^\| (S|R)[0-9]+ \|'`
 *   plus a 4th-cell `yes` test, `grep -cE '^\| `(knowledge|lessons)/'
 *   corpus/README.md`, `find corpus/knowledge corpus/lessons -name '*.md' |
 *   wc -l`, and `sha256sum scripts/*.mjs`.
 *
 * Claim block (machine-readable)
 *   Exactly one HTML comment block in the scorecard whose first line is
 *   `<!-- kumitate-proxy-v1`; its body is `key=value` lines and it is closed by
 *   a line containing `-->`:
 *     A C C1 C1_total C2 C2_total           the declared counts
 *     pin.cite-check pin.surface-probe pin.round-gate pin.proxy-check
 *                                           sha256 hex of scripts/<name>.mjs
 *   All ten keys are REQUIRED, exactly once; no other key is accepted. Every
 *   value is re-derived from the tree and never trusted: a term or pin that
 *   disagrees is a finding, and the stanza is never rewritten here. No key can
 *   vouch for itself — A, C and C1 are states of other files, C2 counts the
 *   corpus notes, and `pin.proxy-check` hashes this file for a reader, not for
 *   this run.
 *
 * Findings (text mode prints `PROXY  <severity>  <KIND>  <detail>`)
 *   error A_DRIFT C_DRIFT C1_DRIFT C1_TOTAL_DRIFT C2_DRIFT C2_TOTAL_DRIFT
 *         PIN_DRIFT (a pin whose file is absent is reported as
 *         `computed=absent`, never silently skipped) AXES_DRIFT
 *   warn  PIN_UNPINNED — a `scripts/*.mjs` file no `pin.*` key covers: pin
 *         coverage is incomplete (advisory; `--strict` promotes it to a gate).
 *
 * Verdict lines (always the last stdout line)
 *   PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q>
 *                 coverage=<s>; pins=<n> match)
 *   PROXY: DRIFT (<KIND term=… declared=… computed=… delta=…>…)
 *   PROXY: FAIL-CLOSED (<TOKEN>) <detail>     (exit 2)
 *
 * Exit: 0 match · 1 drift (findings; warnings too under `--strict`) ·
 *       2 fail-closed · 64 usage. Argument parsing precedes every mode: an
 *       unknown flag (or a missing flag value) is refused with 64 even when
 *       `--selftest` is present, exactly as `round-gate.mjs` does.
 *
 * Fail-closed arms (exit 2; each prints its named kind; checked in this order)
 *   SELF_NOT_A_DIR SCORECARD_MISSING STANZA_MISSING STANZA_MALFORMED
 *   STANZA_KEY_UNKNOWN STANZA_KEY_DUPLICATE REGISTRY_MISSING SKILL_MISSING
 *   README_MISSING CORPUS_DIRS_MISSING
 *   STANZA_MISSING = no claim block at all; STANZA_MALFORMED = more than one
 *   block, no `-->` terminator, a body line that is not `key=value`, a required
 *   key absent, or a value outside `\d+` (counts) / `[0-9a-f]{64}` (pins).
 *   CORPUS_DIRS_MISSING also fires when the corpus census is empty (no `*.md`
 *   under either dir): the C2 denominator would otherwise be zero, and a proxy
 *   that divides by zero still prints a number. Not in that frozen list:
 *   INTERNAL_ERROR, the crash net, so an unexpected throw is a refused verdict
 *   rather than a stack trace.
 *
 * Bounds and what this tool never does
 *   Reads only, under `--self` + the scorecard: no writes, no network, no
 *   subprocess, no git, no lock. `--selftest` is the only writer, and only into
 *   a fresh `mkdtemp` dir it removes afterwards. No environment variable is
 *   consulted — unlike its siblings, whose defaults are env-overridable, the
 *   only defaults here are the scorecard and tree next to this script, so a
 *   polluted env cannot move a measurement. That (not a flag) is why
 *   `--selftest` is hermetic. Portable: node >= 20, ESM, zero deps.
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-proxy-v1';
const STANZA_HEAD = `<!-- ${CONTRACT}`;
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');

const SCORECARD_FILE = 'SCORECARD.md';
const SKILL_FILE = 'SKILL.md';
const CORPUS_README = 'corpus/README.md';
const CORPUS_DIRS = ['corpus/knowledge', 'corpus/lessons'];

/** Declared-count keys of the stanza, in comparison order. */
const TERM_KEYS = ['A', 'C', 'C1', 'C1_total', 'C2', 'C2_total'];
/** Pin key → the file whose sha256 it declares. */
const PINS = {
  'pin.cite-check': 'scripts/cite-check.mjs',
  'pin.surface-probe': 'scripts/surface-probe.mjs',
  'pin.round-gate': 'scripts/round-gate.mjs',
  'pin.proxy-check': 'scripts/proxy-check.mjs',
};
const STANZA_KEYS = [...TERM_KEYS, ...Object.keys(PINS)];
/** The two scorecard axis rows the derived scores must equal. */
const AXIS_ROWS = ['operability', 'coverage'];

/** Frozen derivation patterns (see the header; do not widen them here). */
const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;
const RE_CHECKLIST = /^\s*- \[/;
const RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/;
const RE_README_ROW = /^\| `(knowledge|lessons)\//;
/** `key=value`; the key charset covers the `pin.<name>` family. */
const RE_STANZA_KV = /^([A-Za-z][A-Za-z0-9_.-]*)=(\S+)$/;
const RE_INT = /^\d+$/;
const RE_HEX64 = /^[0-9a-f]{64}$/;

/** Every finding kind the hermetic suite must fire at least once. */
const FINDING_KINDS = [
  'A_DRIFT', 'C_DRIFT', 'C1_DRIFT', 'C1_TOTAL_DRIFT', 'C2_DRIFT', 'C2_TOTAL_DRIFT',
  'PIN_DRIFT', 'AXES_DRIFT', 'PIN_UNPINNED',
];
/** Every fail-closed arm the hermetic suite must fire at least once. */
const FAIL_CLOSED_KINDS = [
  'SELF_NOT_A_DIR', 'SCORECARD_MISSING', 'STANZA_MISSING', 'STANZA_MALFORMED',
  'STANZA_KEY_UNKNOWN', 'STANZA_KEY_DUPLICATE', 'REGISTRY_MISSING', 'SKILL_MISSING',
  'README_MISSING', 'CORPUS_DIRS_MISSING',
];

const USAGE = `usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: ${CONTRACT}

modes:
  default      recompute A C C1 C1_total C2 C2_total, the operability/coverage
               scores and the four script pins under --self, then compare them
               with the ${CONTRACT} block in --scorecard (default
               <self>/${SCORECARD_FILE}) and with that file's ## Axes rows
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR       repo root to measure (default: the repo containing this script)
  --scorecard FILE claim block + registry rows + ## Axes rows (default <self>/${SCORECARD_FILE})
  --json           one machine-readable object on stdout
  --strict         promote warn-level findings (PIN_UNPINNED) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
`;

/* ---------------------------------------------------------------- primitives */

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function sha256File(file) {
  try { return sha256Hex(readFileSync(file)); } catch { return null; }
}

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

/** `grep -c` over a line regex: the number of matching lines. */
function countLines(text, re) {
  let n = 0;
  for (const line of text.split('\n')) if (re.test(line)) n++;
  return n;
}

/**
 * Relative paths of every regular file under `root`. Any `.git` tree is pruned
 * (narrower than the scorecard's `-path ./.git -prune`: a nested `.git` is
 * pruned too), and symlinks are not followed — `readdirSync` types are
 * lstat-based, matching `find -type f` without `-L`.
 */
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

/** Corpus note files (relative), or null when a corpus dir is missing/not a dir. */
function listCorpusNotes(self) {
  const out = [];
  for (const d of CORPUS_DIRS) {
    if (statKind(join(self, d)) !== 'dir') return null;
    for (const rel of walkFiles(join(self, d))) if (rel.endsWith('.md')) out.push(`${d}/${rel}`);
  }
  return out.sort();
}

/* ---------------------------------------------------------------- derivation */

/** Split a GFM table row into cells, honoring `\|` escapes (`\|` is not a cell break). */
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

/** Registry rows (`| S<n> |` / `| R<n> |`) and how many carry a `yes` 4th cell. */
function registryCounts(scorecardText) {
  let total = 0;
  let covered = 0;
  for (const line of scorecardText.split('\n')) {
    if (!RE_REGISTRY_ROW.test(line)) continue;
    total += 1;
    const cells = splitRowCells(line);
    if ((cells[4] ?? '').trim().startsWith('yes')) covered += 1;
  }
  return { covered, total };
}

function operabilityOf(A, C) {
  return Math.floor(10 * ((A + C) / (A + C + 3)));
}

function coverageOf(C1, C1Total, C2, C2Total) {
  return Math.floor(10 * (C1 / C1Total) * (C2 / C2Total));
}

/** The five counts + the two scores, derived from the tree alone. */
function deriveTerms({ self, scorecardText, skillText, readmeText, notes }) {
  const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;
  const C = countLines(skillText, RE_CHECKLIST);
  const reg = registryCounts(scorecardText);
  const C2 = countLines(readmeText, RE_README_ROW);
  const C2Total = notes.length;
  return {
    A,
    C,
    C1: reg.covered,
    C1_total: reg.total,
    C2,
    C2_total: C2Total,
    operability: operabilityOf(A, C),
    coverage: coverageOf(reg.covered, reg.total, C2, C2Total),
  };
}

/* -------------------------------------------------------------------- stanza */

/**
 * Parse the single `kumitate-proxy-v1` claim block. Returns
 * `{ ok: true, values, line }` or `{ ok: false, kind, detail }` where `kind` is
 * one of the STANZA_* tokens (checked in the frozen order: block count,
 * terminator, body shape, unknown key, duplicate key, missing key, value shape).
 */
function parseStanza(scorecardText) {
  const lines = scorecardText.split('\n');
  const heads = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(STANZA_HEAD)) heads.push(i);
  }
  if (heads.length === 0) {
    return { ok: false, kind: 'STANZA_MISSING', detail: `no "${STANZA_HEAD}" block in the scorecard` };
  }
  if (heads.length > 1) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `${heads.length} "${STANZA_HEAD}" blocks (exactly 1 required, at lines ${heads.map((i) => i + 1).join(',')})` };
  }
  const start = heads[0];
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('-->')) { end = i; break; }
  }
  if (end < 0) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `block opened at line ${start + 1} is never terminated by "-->"` };
  }
  const values = new Map();
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const m = RE_STANZA_KV.exec(raw);
    if (!m) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `line ${i + 1} is not key=value: ${JSON.stringify(lines[i])}` };
    }
    const [, key, value] = m;
    if (!STANZA_KEYS.includes(key)) {
      return { ok: false, kind: 'STANZA_KEY_UNKNOWN', detail: `line ${i + 1}: ${key} is not a ${CONTRACT} key` };
    }
    if (values.has(key)) {
      return { ok: false, kind: 'STANZA_KEY_DUPLICATE', detail: `line ${i + 1}: ${key} is declared twice` };
    }
    values.set(key, value);
  }
  const missing = STANZA_KEYS.filter((k) => !values.has(k));
  if (missing.length > 0) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `missing key(s): ${missing.join(' ')}` };
  }
  for (const k of TERM_KEYS) {
    if (!RE_INT.test(values.get(k))) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `${k}=${JSON.stringify(values.get(k))} is not a non-negative integer` };
    }
  }
  for (const k of Object.keys(PINS)) {
    if (!RE_HEX64.test(values.get(k))) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `${k}=${JSON.stringify(values.get(k))} is not a 64-hex sha256` };
    }
  }
  return { ok: true, values: Object.fromEntries(values), line: start + 1 };
}

/* ------------------------------------------------------------------ compare */

function compareTerms(terms, declared, findings) {
  for (const key of TERM_KEYS) {
    const dec = Number.parseInt(declared[key], 10);
    const got = terms[key];
    if (dec === got) continue;
    const delta = got - dec;
    const deltaText = delta > 0 ? `+${delta}` : String(delta);
    findings.push({
      severity: 'error',
      kind: `${key.toUpperCase()}_DRIFT`,
      term: key,
      declared: dec,
      computed: got,
      delta: deltaText,
      detail: `${key}: declared=${dec} computed=${got} delta=${deltaText}`,
    });
  }
}

function comparePins(self, declared, findings) {
  const byKey = {};
  let matched = 0;
  for (const [key, rel] of Object.entries(PINS)) {
    const dec = declared[key];
    const computed = sha256File(join(self, rel));
    const match = computed !== null && computed === dec;
    if (match) matched += 1;
    byKey[key] = { file: rel, declared: dec, computed, match };
    if (match) continue;
    const got = computed ?? `absent (${rel} is ${statKind(join(self, rel))})`;
    findings.push({
      severity: 'error',
      kind: 'PIN_DRIFT',
      term: key,
      declared: dec,
      computed: got,
      detail: `${key}: declared=${dec} computed=${got}`,
    });
  }
  return { matched, total: Object.keys(PINS).length, byKey };
}

/** Advisory: a `scripts/*.mjs` file no pin covers (pin coverage incomplete). */
function comparePinCoverage(self, findings) {
  const dir = join(self, 'scripts');
  if (statKind(dir) !== 'dir') return;
  const pinned = new Set(Object.values(PINS));
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.mjs')) continue;
    const rel = `scripts/${e.name}`;
    if (pinned.has(rel)) continue;
    findings.push({
      severity: 'warn',
      kind: 'PIN_UNPINNED',
      term: rel,
      detail: `${rel} has no pin.<name> key in the ${CONTRACT} stanza`,
    });
  }
}

/**
 * The `## Axes` section body: its heading to the next `#`/`##` line. Scoping
 * matters: an earlier table (a move log, a prior round's summary) can carry a
 * `| operability | N |` row, and an unscoped search would let that stale score
 * shadow the current axis row. Section absent ⇒ null ⇒ both axes read `absent`.
 */
function axesSection(scorecardText) {
  const lines = scorecardText.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^## Axes\b/.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,2} /.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start, end).join('\n');
}

/** The derived scores must equal the scorecard's own `## Axes` integers. */
function compareAxes(scorecardText, terms, findings) {
  const section = axesSection(scorecardText);
  for (const axis of AXIS_ROWS) {
    const m = section === null
      ? null
      : new RegExp(`^\\|\\s*${axis}\\s*\\|\\s*(\\d+)\\s*\\|`, 'm').exec(section);
    const declared = m ? Number.parseInt(m[1], 10) : null;
    const computed = terms[axis];
    if (declared === computed) continue;
    findings.push({
      severity: 'error',
      kind: 'AXES_DRIFT',
      term: axis,
      declared: declared === null ? 'absent' : declared,
      computed,
      detail: `${axis}: ## Axes row=${declared === null ? (section === null ? 'no ## Axes section' : 'absent') : declared} derived=${computed}`,
    });
  }
}

function summarize(findings, strict) {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  const drift = errors > 0 || (Boolean(strict) && warnings > 0);
  return { errors, warnings, verdict: drift ? 'DRIFT' : 'MATCH', exitCode: drift ? 1 : 0 };
}

/* ------------------------------------------------------------------- render */

function findingSummary(f) {
  const parts = [f.kind];
  if (f.term !== undefined) parts.push(`term=${f.term}`);
  if (f.declared !== undefined) parts.push(`declared=${f.declared}`);
  if (f.computed !== undefined) parts.push(`computed=${f.computed}`);
  if (f.delta !== undefined) parts.push(`delta=${f.delta}`);
  return parts.join(' ');
}

function renderVerdict(verdict, terms, pinStats, findings) {
  if (verdict === 'MATCH') {
    return `PROXY: MATCH (A=${terms.A} C=${terms.C} operability=${terms.operability};`
      + ` C1=${terms.C1}/${terms.C1_total} C2=${terms.C2}/${terms.C2_total} coverage=${terms.coverage};`
      + ` pins=${pinStats.matched} match)`;
  }
  return `PROXY: DRIFT (${findings.map(findingSummary).join('; ')})`;
}

/* ------------------------------------------------------------ fail-closed */

function failClosed(opts, token, detail, terms, started) {
  const body = {
    contract: CONTRACT,
    mode: 'check',
    ok: false,
    verdict: 'FAIL-CLOSED',
    exitCode: 2,
    self: opts.self,
    scorecard: opts.scorecard,
    strict: Boolean(opts.strict),
    terms: terms ?? {},
    findings: [{ severity: 'error', kind: token, detail }],
    errors: 1,
    warnings: 0,
    durationMs: Math.max(0, Date.now() - started),
  };
  process.stderr.write(`proxy-check: fail-closed — ${token}: ${detail}\n`);
  if (opts.json) process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  else process.stdout.write(`PROXY: FAIL-CLOSED (${token}) ${detail}\n`);
  return 2;
}

/* -------------------------------------------------------------------- check */

function runCheck(opts, started) {
  if (statKind(opts.self) !== 'dir') {
    return failClosed(opts, 'SELF_NOT_A_DIR', `--self ${opts.self} is ${statKind(opts.self)}`, {}, started);
  }
  const scorecardText = readText(opts.scorecard);
  if (scorecardText === null) {
    return failClosed(opts, 'SCORECARD_MISSING',
      `--scorecard ${opts.scorecard} is ${statKind(opts.scorecard)}`, {}, started);
  }
  const stanza = parseStanza(scorecardText);
  if (!stanza.ok) return failClosed(opts, stanza.kind, stanza.detail, {}, started);
  if (registryCounts(scorecardText).total === 0) {
    return failClosed(opts, 'REGISTRY_MISSING',
      `no "| S<n> |" or "| R<n> |" registry row in ${opts.scorecard}`, {}, started);
  }
  const skillText = readText(join(opts.self, SKILL_FILE));
  if (skillText === null) {
    return failClosed(opts, 'SKILL_MISSING',
      `${join(opts.self, SKILL_FILE)} is ${statKind(join(opts.self, SKILL_FILE))}`, {}, started);
  }
  const readmeText = readText(join(opts.self, CORPUS_README));
  if (readmeText === null) {
    return failClosed(opts, 'README_MISSING',
      `${join(opts.self, CORPUS_README)} is ${statKind(join(opts.self, CORPUS_README))}`, {}, started);
  }
  const notes = listCorpusNotes(opts.self);
  if (notes === null || notes.length === 0) {
    return failClosed(opts, 'CORPUS_DIRS_MISSING', notes === null
      ? `${CORPUS_DIRS.map((d) => join(opts.self, d)).join(' or ')} is not a directory`
      : `no *.md under ${CORPUS_DIRS.map((d) => join(opts.self, d)).join(' + ')} (C2 denominator would be 0)`,
    {}, started);
  }

  const terms = deriveTerms({
    self: opts.self, scorecardText, skillText, readmeText, notes,
  });
  const findings = [];
  compareTerms(terms, stanza.values, findings);
  const pinStats = comparePins(opts.self, stanza.values, findings);
  compareAxes(scorecardText, terms, findings);
  comparePinCoverage(opts.self, findings);
  const { errors, warnings, verdict, exitCode } = summarize(findings, opts.strict);

  const body = {
    contract: CONTRACT,
    mode: 'check',
    ok: verdict === 'MATCH',
    verdict,
    exitCode,
    self: opts.self,
    scorecard: opts.scorecard,
    strict: Boolean(opts.strict),
    terms: {
      ...terms,
      pins: pinStats.byKey,
      pinsMatched: pinStats.matched,
      pinsTotal: pinStats.total,
      declared: stanza.values,
      stanzaLine: stanza.line,
    },
    findings,
    errors,
    warnings,
    durationMs: Math.max(0, Date.now() - started),
  };

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  } else {
    const lines = findings.map((f) => `PROXY  ${f.severity}  ${f.kind}  ${f.detail}`);
    lines.push(renderVerdict(verdict, terms, pinStats, findings));
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return exitCode;
}

/* ----------------------------------------------------------------- selftest */

/** Fixture stand-ins for the four pinned scripts (bytes only, never executed). */
const FIXTURE_SCRIPTS = ['cite-check.mjs', 'surface-probe.mjs', 'round-gate.mjs', 'proxy-check.mjs'];
const fixtureScript = (name) => `#!/usr/bin/env node\n// hermetic fixture stand-in for scripts/${name}\nexport const FIXTURE = ${JSON.stringify(name)};\n`;
const FIXTURE_PINS = Object.fromEntries(FIXTURE_SCRIPTS.map((s) => [
  `pin.${s.replace(/\.mjs$/u, '')}`, sha256Hex(Buffer.from(fixtureScript(s), 'utf8')),
]));

function fxSkill(checklist) {
  const items = [];
  for (let i = 1; i <= checklist; i++) items.push(`- [ ] fixture item ${i} — \`true\` → exit 0 + \`ok\``);
  return `# Fixture skill\n\nprose that is not a checklist line\n\n## Verifiable checklist\n\n${items.join('\n')}\n`;
}

function fxReadme(rows) {
  const lines = ['# Corpus map', '', '| Note | Covers | Notes |', '|---|---|---|'];
  for (let i = 1; i <= rows; i++) {
    const rel = i === rows && rows % 2 === 1 ? `lessons/note-${i}.md` : `knowledge/note-${i}.md`;
    lines.push(`| \`${rel}\` | fixture family | row ${i} |`);
  }
  lines.push('', 'prose line that is not a row\n');
  return `${lines.join('\n')}\n`;
}

/**
 * A scorecard whose stanza declares exactly the fixture's hand-written expected
 * numbers: the suite asserts the tool's verdict line against a literal string,
 * so a derivation change cannot be absorbed by a self-consistent fixture.
 */
function fxScorecard(fx) {
  const { expect, registry } = fx;
  const lines = [
    '# Fixture scorecard', '',
    `#### In-scope surface registry (${registry.length} families)`, '',
    '| # | Family | Members (origin tree) | Corpus note |',
    '|---|---|---|---|',
  ];
  for (const [id, family, members, note] of registry) {
    lines.push(`| ${id} | ${family} | ${members} | ${note} |`);
  }
  lines.push(
    '', '## Axes', '',
    '| Axis | Score | Evidence pointer | Last change |',
    '|---|---|---|---|',
    `| operability | ${expect.operability} | fixture | round 11 |`,
    `| coverage | ${expect.coverage} | fixture | round 11 |`,
    '', STANZA_HEAD,
  );
  for (const k of TERM_KEYS) lines.push(`${k}=${expect[k]}`);
  for (const [k, v] of Object.entries(FIXTURE_PINS)) lines.push(`${k}=${v}`);
  lines.push('-->', '');
  return `${lines.join('\n')}\n`;
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-proxy-selftest-'));
  const results = [];
  const observed = new Set();
  const observedFc = new Set();
  const check = (name, fn) => {
    try {
      const r = fn();
      results.push({ name, ok: Boolean(r.ok), skipped: Boolean(r.skipped), detail: String(r.detail ?? '') });
    } catch (e) {
      results.push({ name, ok: false, detail: `threw: ${e && e.message ? e.message : e}` });
    }
  };

  const SELF = fileURLToPath(import.meta.url);
  let seq = 0;
  const fxDir = (name) => {
    seq += 1;
    const d = join(tmp, `${String(seq).padStart(2, '0')}-${name}`);
    mkdirSync(d, { recursive: true });
    return d;
  };
  const fxWrite = (p, text) => {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  };
  const runProxy = (args, extraEnv = {}) => spawnSync(process.execPath, [SELF, ...args], {
    encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, ...extraEnv },
  });
  const verdictLine = (res) => String(res.stdout ?? '').trim().split('\n').filter(Boolean).at(-1) ?? '';
  const parseFindings = (stdout) => String(stdout ?? '').split('\n')
    .map((l) => /^PROXY  (error|warn)  ([A-Z0-9_]+)  (.*)$/u.exec(l))
    .filter(Boolean)
    .map((m) => { observed.add(m[2]); return { severity: m[1], kind: m[2], detail: m[3] }; });
  const kindsEq = (res, expected) => {
    const got = parseFindings(res.stdout).map((f) => f.kind);
    return { ok: JSON.stringify(got) === JSON.stringify(expected), got };
  };
  const fcToken = (res) => {
    const m = /^PROXY: FAIL-CLOSED \(([A-Z_]+)\)/u.exec(verdictLine(res));
    if (m) observedFc.add(m[1]);
    return m ? m[1] : null;
  };

  /* fixtures -------------------------------------------------------------- */
  const fxBase = (name, knobs = {}) => {
    const dir = fxDir(name);
    const scripts = knobs.scripts ?? FIXTURE_SCRIPTS;
    const checklist = knobs.checklist ?? 3;
    const readmeRows = knobs.readmeRows ?? 2;
    const notes = knobs.notes ?? ['knowledge/alpha.md', 'lessons/beta.md'];
    const registry = knobs.registry ?? [['S1', 'alpha', '`a.mjs`', 'yes — alpha note'], ['R1', 'beta', '`b.rs`', 'no']];
    for (const s of scripts) fxWrite(join(dir, 'scripts', s), fixtureScript(s));
    for (const rel of knobs.extraRunnables ?? []) fxWrite(join(dir, rel), '#!/bin/sh\nexit 0\n');
    fxWrite(join(dir, 'notes.txt'), 'not runnable\n');
    fxWrite(join(dir, '.git', 'junk.mjs'), '// must never be counted\n');
    fxWrite(join(dir, SKILL_FILE), fxSkill(checklist));
    fxWrite(join(dir, CORPUS_README), fxReadme(readmeRows));
    for (const rel of notes) fxWrite(join(dir, `corpus/${rel}`), `# ${rel}\n\nfixture note\n`);
    const fx = { dir, checklist, readmeRows, notes, registry, expect: knobs.expect };
    if (knobs.scorecard !== false) fx.scorecard = fxScorecard(fx);
    if (fx.scorecard !== undefined) fxWrite(join(dir, SCORECARD_FILE), fx.scorecard);
    return fx;
  };
  const args = (fx, extra = []) => ['--self', fx.dir, ...extra];

  /* hand-arithmetic fixtures (literal assertions below, never re-derived) --- */
  const F1 = fxBase('match-basic', {
    expect: { A: 4, C: 3, C1: 1, C1_total: 2, C2: 2, C2_total: 2, operability: 7, coverage: 5 },
  });
  const F2 = fxBase('match-low', {
    checklist: 1, readmeRows: 1,
    registry: [['S1', 'a', '`a.mjs`', 'yes'], ['S2', 'b', '`b.mjs`', 'yes'], ['R1', 'c', '`c.rs`', 'no']],
    expect: { A: 4, C: 1, C1: 2, C1_total: 3, C2: 1, C2_total: 2, operability: 6, coverage: 3 },
  });
  const F3 = fxBase('match-saturated', {
    checklist: 3, readmeRows: 3, notes: ['knowledge/a.md', 'knowledge/b.md', 'lessons/c.md'],
    registry: [['S1', 'a', '`a.mjs`', 'yes'], ['S2', 'b', '`b.mjs`', 'yes'], ['R1', 'c', '`c.rs`', 'yes']],
    extraRunnables: ['tools/a.mjs', 'tools/b.js', 'bin/c.sh', 'vendor/d.py', 'vendor/e.mjs'],
    expect: { A: 9, C: 3, C1: 3, C1_total: 3, C2: 3, C2_total: 3, operability: 8, coverage: 10 },
  });

  try {
    /* 1-3 ─ MATCH, against literal verdict lines (hand arithmetic) ---------- */
    const r1 = runProxy(args(F1));
    check('MATCH: A=4 C=3 operability=7; C1=1/2 C2=2/2 coverage=5 (literal verdict)', () => ({
      ok: r1.status === 0
        && verdictLine(r1) === 'PROXY: MATCH (A=4 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; pins=4 match)',
      detail: `exit=${r1.status} ${verdictLine(r1)}`,
    }));
    check('MATCH: text mode prints the verdict line and nothing else', () => {
      const lines = String(r1.stdout ?? '').trim().split('\n');
      return { ok: lines.length === 1 && parseFindings(r1.stdout).length === 0, detail: `lines=${lines.length}` };
    });
    const r2 = runProxy(args(F2));
    check('MATCH: A=4 C=1 operability=6; C1=2/3 C2=1/2 coverage=3 (literal verdict)', () => ({
      ok: r2.status === 0
        && verdictLine(r2) === 'PROXY: MATCH (A=4 C=1 operability=6; C1=2/3 C2=1/2 coverage=3; pins=4 match)',
      detail: `exit=${r2.status} ${verdictLine(r2)}`,
    }));
    const r3 = runProxy(args(F3));
    check('MATCH: A=9 C=3 operability=8 (floor(10×0.8)); C1=3/3 C2=3/3 coverage=10', () => ({
      ok: r3.status === 0
        && verdictLine(r3) === 'PROXY: MATCH (A=9 C=3 operability=8; C1=3/3 C2=3/3 coverage=10; pins=4 match)',
      detail: `exit=${r3.status} ${verdictLine(r3)}`,
    }));
    check('A excludes `.git` trees and non-runnable files (.git/junk.mjs, notes.txt)', () => ({
      ok: verdictLine(r3).includes('A=9'),
      detail: `fixture has ${FIXTURE_SCRIPTS.length} scripts + 5 runnables outside scripts/ + .git/junk.mjs + notes.txt → A=9`,
    }));
    const r1b = runProxy(args(F1));
    check('determinism: the same fixture yields byte-identical stdout on a re-run', () => ({
      ok: String(r1.stdout ?? '') === String(r1b.stdout ?? ''),
      detail: `len=${String(r1.stdout ?? '').length}`,
    }));

    /* 4-6 ─ flags on a clean tree ------------------------------------------ */
    const r4 = runProxy(args(F1, ['--strict']));
    check('--strict on a MATCH tree stays exit 0 (no warnings to promote)', () => ({
      ok: r4.status === 0 && verdictLine(r4) === verdictLine(r1), detail: `exit=${r4.status}`,
    }));
    const r5 = runProxy(['-h']);
    check('-h → exit 0, USAGE on stdout naming the contract and the modes', () => ({
      ok: r5.status === 0 && /usage: node scripts\/proxy-check\.mjs/u.test(r5.stdout)
        && r5.stdout.includes(CONTRACT) && r5.stdout.includes('--selftest') && String(r5.stderr ?? '') === '',
      detail: `exit=${r5.status} stderr=${JSON.stringify(String(r5.stderr ?? '').slice(0, 40))}`,
    }));
    const r6 = runProxy(['--help']);
    check('--help → exit 0, same USAGE text as -h', () => ({
      ok: r6.status === 0 && String(r6.stdout) === String(r5.stdout), detail: `exit=${r6.status}`,
    }));

    /* 7-12 ─ --json --------------------------------------------------------- */
    const j1 = runProxy(args(F1, ['--json']));
    check('--json MATCH: contract/mode/ok/terms/findings + computed terms', () => {
      const j = JSON.parse(j1.stdout);
      return {
        ok: j1.status === 0 && j.contract === CONTRACT && j.mode === 'check' && j.ok === true
          && j.verdict === 'MATCH' && Array.isArray(j.findings) && j.findings.length === 0
          && j.terms.A === 4 && j.terms.C === 3 && j.terms.C1 === 1 && j.terms.C1_total === 2
          && j.terms.C2 === 2 && j.terms.C2_total === 2 && j.terms.operability === 7 && j.terms.coverage === 5
          && j.terms.pinsMatched === 4 && j.terms.pinsTotal === 4
          && Object.keys(j.terms.pins).every((k) => j.terms.pins[k].match === true),
        detail: `exit=${j1.status} terms=${JSON.stringify({ A: j.terms.A, C: j.terms.C, op: j.terms.operability, cov: j.terms.coverage })}`,
      };
    });

    /* 13-20 ─ drift on terms ------------------------------------------------ */
    const driftA = fxBase('drift-a', { expect: F1.expect });
    fxWrite(join(driftA.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=4\n', '\nA=3\n'));
    const d1 = runProxy(args(driftA));
    check('A_DRIFT: declared=3 computed=4 delta=+1, exit 1, exactly [A_DRIFT]', () => {
      const k = kindsEq(d1, ['A_DRIFT']);
      return {
        ok: d1.status === 1 && k.ok
          && verdictLine(d1) === 'PROXY: DRIFT (A_DRIFT term=A declared=3 computed=4 delta=+1)',
        detail: `exit=${d1.status} ${verdictLine(d1)}`,
      };
    });
    check('a term drift does not disturb the ## Axes rows (derived score unchanged)', () => ({
      ok: !String(d1.stdout ?? '').includes('AXES_DRIFT'),
      detail: `stdout=${JSON.stringify(String(d1.stdout ?? '').split('\n')[0])}`,
    }));
    const scTampered = join(fxDir('scorecard-flag'), 'SCORECARD.md');
    fxWrite(scTampered, F1.scorecard.replace('\nA=4\n', '\nA=5\n'));
    const d2 = runProxy(['--self', F1.dir, '--scorecard', scTampered]);
    check('--scorecard FILE: the claim is read from FILE, the tree from --self', () => {
      const k = kindsEq(d2, ['A_DRIFT']);
      return { ok: d2.status === 1 && k.ok && verdictLine(d2).includes('declared=5 computed=4'), detail: `exit=${d2.status} ${verdictLine(d2)}` };
    });
    const driftC = fxBase('drift-c', { expect: F1.expect });
    fxWrite(join(driftC.dir, SCORECARD_FILE), F1.scorecard.replace('\nC=3\n', '\nC=4\n'));
    const d3 = runProxy(args(driftC));
    check('C_DRIFT: declared=4 computed=3 delta=-1', () => {
      const k = kindsEq(d3, ['C_DRIFT']);
      return { ok: d3.status === 1 && k.ok && verdictLine(d3).includes('delta=-1'), detail: `exit=${d3.status} ${verdictLine(d3)}` };
    });
    const driftC1 = fxBase('drift-c1', { expect: F1.expect });
    fxWrite(join(driftC1.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1=1\n', '\nC1=2\n'));
    const d4 = runProxy(args(driftC1));
    check('C1_DRIFT: declared=2 computed=1 (registry 4th-cell `yes` test)', () => {
      const k = kindsEq(d4, ['C1_DRIFT']);
      return { ok: d4.status === 1 && k.ok && verdictLine(d4).includes('term=C1'), detail: `exit=${d4.status} ${verdictLine(d4)}` };
    });
    const regPipe = fxBase('registry-escaped-pipe', {
      expect: F1.expect,
      registry: [
        ['S1', 'alpha', '`a.mjs` \\| `a2.mjs`', 'yes — alpha note'],
        ['R1', 'beta', '`b.rs`', 'no'],
      ],
    });
    const dEsc = runProxy(args(regPipe));
    check('registry: `\\|` inside a cell is not a cell break (C1=1/2, MATCH exit 0)', () => ({
      ok: dEsc.status === 0
        && verdictLine(dEsc) === 'PROXY: MATCH (A=4 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; pins=4 match)',
      detail: `exit=${dEsc.status} ${verdictLine(dEsc)}`,
    }));
    const regPipeNo = fxBase('registry-escaped-pipe-no', {
      expect: { ...F1.expect, C1: 0, coverage: 0 },
      registry: [
        ['S1', 'alpha', '`a.mjs` \\| `a2.mjs`', 'no — escaped pipe in the members cell'],
        ['R1', 'beta', '`b.rs`', 'no'],
      ],
    });
    const dEscNo = runProxy(args(regPipeNo));
    check('registry: a `no` row with an escaped pipe is not counted as covered (C1=0/2)', () => ({
      ok: dEscNo.status === 0 && verdictLine(dEscNo).includes('C1=0/2'),
      detail: `exit=${dEscNo.status} ${verdictLine(dEscNo)}`,
    }));
    const driftC1T = fxBase('drift-c1total', { expect: F1.expect });
    fxWrite(join(driftC1T.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1_total=2\n', '\nC1_total=3\n'));
    const d5 = runProxy(args(driftC1T));
    check('C1_TOTAL_DRIFT: declared=3 computed=2', () => {
      const k = kindsEq(d5, ['C1_TOTAL_DRIFT']);
      return { ok: d5.status === 1 && k.ok, detail: `exit=${d5.status} ${verdictLine(d5)}` };
    });
    const driftC2 = fxBase('drift-c2', { expect: F1.expect });
    fxWrite(join(driftC2.dir, SCORECARD_FILE), F1.scorecard.replace('\nC2=2\n', '\nC2=3\n'));
    const d6 = runProxy(args(driftC2));
    check('C2_DRIFT: declared=3 computed=2', () => {
      const k = kindsEq(d6, ['C2_DRIFT']);
      return { ok: d6.status === 1 && k.ok, detail: `exit=${d6.status} ${verdictLine(d6)}` };
    });
    const driftC2T = fxBase('drift-c2total', { expect: F1.expect });
    fxWrite(join(driftC2T.dir, SCORECARD_FILE), F1.scorecard.replace('\nC2_total=2\n', '\nC2_total=3\n'));
    const d7 = runProxy(args(driftC2T));
    check('C2_TOTAL_DRIFT: declared=3 computed=2 (corpus *.md census)', () => {
      const k = kindsEq(d7, ['C2_TOTAL_DRIFT']);
      return { ok: d7.status === 1 && k.ok, detail: `exit=${d7.status} ${verdictLine(d7)}` };
    });
    const driftMany = fxBase('drift-many', { expect: F1.expect });
    fxWrite(join(driftMany.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=4\n', '\nA=3\n').replace('\nC=3\n', '\nC=4\n'));
    const d8 = runProxy(args(driftMany));
    check('two drifts → both findings, in term order, joined in one verdict line', () => {
      const k = kindsEq(d8, ['A_DRIFT', 'C_DRIFT']);
      return {
        ok: d8.status === 1 && k.ok && verdictLine(d8).includes('; ')
          && verdictLine(d8).startsWith('PROXY: DRIFT (A_DRIFT term=A declared=3 computed=4 delta=+1; C_DRIFT'),
        detail: `exit=${d8.status} ${verdictLine(d8)}`,
      };
    });

    /* 21-23 ─ pins + axes --------------------------------------------------- */
    const driftPin = fxBase('drift-pin', { expect: F1.expect });
    const zeroPin = '0'.repeat(64);
    fxWrite(join(driftPin.dir, SCORECARD_FILE), F1.scorecard.replace(/(\npin\.round-gate=)[0-9a-f]{64}\n/u, `$1${zeroPin}\n`));
    const d9 = runProxy(args(driftPin));
    check('PIN_DRIFT: a tampered pin is a finding naming the key, declared and computed', () => {
      const k = kindsEq(d9, ['PIN_DRIFT']);
      const f = parseFindings(d9.stdout)[0];
      const shaped = f ? new RegExp(`^pin\\.round-gate: declared=${zeroPin} computed=[0-9a-f]{64}$`, 'u').test(f.detail) : false;
      return {
        ok: d9.status === 1 && k.ok && shaped,
        detail: `exit=${d9.status} kinds=[${k.got}] shaped=${shaped} ${f ? f.detail.slice(0, 90) : ''}`,
      };
    });
    const missingScript = fxBase('drift-pin-absent', { expect: F1.expect });
    rmSync(join(missingScript.dir, 'scripts', 'proxy-check.mjs'), { force: true });
    const d10 = runProxy(args(missingScript));
    check('PIN_DRIFT (absent) + A_DRIFT + AXES_DRIFT: a removed pinned script is never skipped', () => {
      const k = kindsEq(d10, ['A_DRIFT', 'PIN_DRIFT', 'AXES_DRIFT']);
      const f = parseFindings(d10.stdout).find((x) => x.kind === 'PIN_DRIFT');
      return {
        ok: d10.status === 1 && k.ok && f && /^pin\.proxy-check: declared=[0-9a-f]{64} computed=absent \(scripts\/proxy-check\.mjs is absent\)$/u.test(f.detail),
        detail: `exit=${d10.status} kinds=[${k.got}] ${f ? f.detail.slice(0, 80) : ''}`,
      };
    });
    const driftAxes = fxBase('drift-axes', { expect: F1.expect });
    fxWrite(join(driftAxes.dir, SCORECARD_FILE), F1.scorecard.replace('| operability | 7 |', '| operability | 6 |'));
    const d11 = runProxy(args(driftAxes));
    check('AXES_DRIFT: derived 7 vs ## Axes row 6 → exit 1', () => {
      const k = kindsEq(d11, ['AXES_DRIFT']);
      const f = parseFindings(d11.stdout)[0];
      return { ok: d11.status === 1 && k.ok && f && f.detail === 'operability: ## Axes row=6 derived=7', detail: `exit=${d11.status} ${f ? f.detail : ''}` };
    });
    const noAxes = fxBase('drift-axes-absent', { expect: F1.expect });
    fxWrite(join(noAxes.dir, SCORECARD_FILE), F1.scorecard.replace('| coverage | 5 | fixture | round 11 |\n', ''));
    const d12 = runProxy(args(noAxes));
    check('AXES_DRIFT (absent row): a missing `| coverage |` row is drift, not silence', () => {
      const k = kindsEq(d12, ['AXES_DRIFT']);
      const f = parseFindings(d12.stdout)[0];
      return { ok: d12.status === 1 && k.ok && f && f.detail === 'coverage: ## Axes row=absent derived=5', detail: `exit=${d12.status} ${f ? f.detail : ''}` };
    });
    const staleAxes = fxBase('stale-axes-row', { expect: F1.expect });
    fxWrite(join(staleAxes.dir, SCORECARD_FILE), F1.scorecard.replace('## Axes', '## History\n\n'
      + '| Axis | Score |\n|---|---|\n| operability | 6 |\n| coverage | 4 |\n\n## Axes'));
    const d13 = runProxy(args(staleAxes));
    check('a stale `| operability | 6 |` row before `## Axes` cannot shadow the axis row → MATCH', () => {
      const k = kindsEq(d13, []);
      return {
        ok: d13.status === 0 && k.ok
          && verdictLine(d13) === 'PROXY: MATCH (A=4 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; pins=4 match)',
        detail: `exit=${d13.status} kinds=[${k.got}] ${verdictLine(d13)}`,
      };
    });
    const noAxesSection = fxBase('no-axes-section', { expect: F1.expect });
    fxWrite(join(noAxesSection.dir, SCORECARD_FILE),
      F1.scorecard.replace(/## Axes[\s\S]*?<!-- kumitate-proxy-v1/u, '<!-- kumitate-proxy-v1'));
    const d14 = runProxy(args(noAxesSection));
    check('no `## Axes` heading → both axes AXES_DRIFT with `no ## Axes section`', () => {
      const k = kindsEq(d14, ['AXES_DRIFT', 'AXES_DRIFT']);
      const f = parseFindings(d14.stdout)[0];
      return {
        ok: d14.status === 1 && k.ok && f && f.detail === 'operability: ## Axes row=no ## Axes section derived=7',
        detail: `exit=${d14.status} kinds=[${k.got}] ${f ? f.detail : ''}`,
      };
    });
    const d15 = runProxy(args(driftAxes, ['--json']));
    check('--json drift: ok=false, verdict DRIFT, findings carry kind/term/declared/computed', () => {
      const j = JSON.parse(d15.stdout);
      const f = j.findings[0] ?? {};
      return {
        ok: d15.status === 1 && j.ok === false && j.verdict === 'DRIFT' && f.kind === 'AXES_DRIFT'
          && f.term === 'operability' && f.declared === 6 && f.computed === 7 && Array.isArray(j.findings),
        detail: `exit=${d15.status} findings=${JSON.stringify(j.findings.map((x) => x.kind))}`,
      };
    });

    /* 24-25 ─ the advisory warning + --strict ------------------------------- */
    const unpinned = fxBase('pin-unpinned', { expect: { A: 5, C: 3, C1: 1, C1_total: 2, C2: 2, C2_total: 2, operability: 7, coverage: 5 } });
    fxWrite(join(unpinned.dir, 'scripts', 'extra.mjs'), fixtureScript('extra.mjs'));
    const w1 = runProxy(args(unpinned));
    check('PIN_UNPINNED: an unpinned scripts/*.mjs warns, exit 0, verdict still MATCH', () => {
      const k = kindsEq(w1, ['PIN_UNPINNED']);
      const f = parseFindings(w1.stdout)[0];
      return {
        ok: w1.status === 0 && k.ok && f && f.severity === 'warn' && f.detail.includes('scripts/extra.mjs')
          && verdictLine(w1) === 'PROXY: MATCH (A=5 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; pins=4 match)',
        detail: `exit=${w1.status} ${verdictLine(w1)}`,
      };
    });
    const w2 = runProxy(args(unpinned, ['--strict']));
    check('--strict promotes PIN_UNPINNED → exit 1, DRIFT, errors=0 warnings=1', () => {
      const j = JSON.parse(runProxy(args(unpinned, ['--strict', '--json'])).stdout);
      return {
        ok: w2.status === 1 && verdictLine(w2).startsWith('PROXY: DRIFT (PIN_UNPINNED')
          && j.errors === 0 && j.warnings === 1,
        detail: `exit=${w2.status} ${verdictLine(w2)}`,
      };
    });

    /* 26-37 ─ fail-closed arms --------------------------------------------- */
    const fc = (name, args2, token) => check(`fail-closed: ${token} (${name})`, () => {
      const res = runProxy(args2);
      return {
        ok: res.status === 2 && fcToken(res) === token,
        detail: `exit=${res.status} ${verdictLine(res).slice(0, 90)}`,
      };
    });
    fc('self absent', ['--self', join(tmp, 'nope-nope')], 'SELF_NOT_A_DIR');
    fc('self is a file', ['--self', join(F1.dir, SKILL_FILE)], 'SELF_NOT_A_DIR');
    const noSc = fxBase('no-scorecard', { expect: F1.expect, scorecard: false });
    fc('SCORECARD.md absent', args(noSc), 'SCORECARD_MISSING');
    const noStanza = fxBase('no-stanza', { expect: F1.expect });
    fxWrite(join(noStanza.dir, SCORECARD_FILE), '# Fixture scorecard\n\nno claim block here\n');
    fc('no claim block', args(noStanza), 'STANZA_MISSING');
    const twoStanza = fxBase('two-stanza', { expect: F1.expect });
    fxWrite(join(twoStanza.dir, SCORECARD_FILE), `${F1.scorecard}${F1.scorecard.split('# Fixture scorecard\n\n')[1]}`);
    fc('two claim blocks', args(twoStanza), 'STANZA_MALFORMED');
    const unterminated = fxBase('unterminated', { expect: F1.expect });
    fxWrite(join(unterminated.dir, SCORECARD_FILE), F1.scorecard.replace('\n-->\n', '\n'));
    fc('block without `-->`', args(unterminated), 'STANZA_MALFORMED');
    const badBody = fxBase('bad-body', { expect: F1.expect });
    fxWrite(join(badBody.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1_total=2\n', '\nC1 total=2\n'));
    fc('body line not key=value', args(badBody), 'STANZA_MALFORMED');
    const missingKey = fxBase('missing-key', { expect: F1.expect });
    fxWrite(join(missingKey.dir, SCORECARD_FILE), F1.scorecard.replace('\nC2_total=2\n', ''));
    fc('required key absent', args(missingKey), 'STANZA_MALFORMED');
    const badValue = fxBase('bad-value', { expect: F1.expect });
    fxWrite(join(badValue.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=4\n', '\nA=four\n'));
    fc('count value not an integer', args(badValue), 'STANZA_MALFORMED');
    const badPin = fxBase('bad-pin', { expect: F1.expect });
    fxWrite(join(badPin.dir, SCORECARD_FILE), F1.scorecard.replace(/(\npin\.proxy-check=)[0-9a-f]{64}\n/u, '$1zz\n'));
    fc('pin value not a 64-hex sha256', args(badPin), 'STANZA_MALFORMED');
    const unknownKey = fxBase('unknown-key', { expect: F1.expect });
    fxWrite(join(unknownKey.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=4\n', '\nA=4\nZ=1\n'));
    fc('unknown key', args(unknownKey), 'STANZA_KEY_UNKNOWN');
    const dupKey = fxBase('duplicate-key', { expect: F1.expect });
    fxWrite(join(dupKey.dir, SCORECARD_FILE), F1.scorecard.replace('\nC=3\n', '\nC=3\nC=3\n'));
    fc('duplicate key', args(dupKey), 'STANZA_KEY_DUPLICATE');
    const noRegistry = fxBase('no-registry', { expect: F1.expect });
    fxWrite(join(noRegistry.dir, SCORECARD_FILE), `${F1.scorecard.replace(/\| (?:S|R)\d+ \|.*\n/gu, '')}`);
    fc('no registry rows', args(noRegistry), 'REGISTRY_MISSING');
    const noSkill = fxBase('no-skill', { expect: F1.expect });
    rmSync(join(noSkill.dir, SKILL_FILE), { force: true });
    fc('SKILL.md absent', args(noSkill), 'SKILL_MISSING');
    const noReadme = fxBase('no-readme', { expect: F1.expect });
    rmSync(join(noReadme.dir, CORPUS_README), { force: true });
    fc('corpus/README.md absent', args(noReadme), 'README_MISSING');
    const noLessons = fxBase('no-lessons-dir', { expect: F1.expect });
    rmSync(join(noLessons.dir, 'corpus', 'lessons'), { recursive: true, force: true });
    fc('corpus/lessons absent', args(noLessons), 'CORPUS_DIRS_MISSING');
    const emptyCorpus = fxBase('empty-corpus', { expect: F1.expect });
    for (const dir of CORPUS_DIRS) {
      for (const rel of walkFiles(join(emptyCorpus.dir, dir))) rmSync(join(emptyCorpus.dir, dir, rel), { force: true });
    }
    fc('corpus census empty (no *.md in either dir)', args(emptyCorpus), 'CORPUS_DIRS_MISSING');
    check('fail-closed --json: one schema object, ok=false, token as the finding kind', () => {
      const res = runProxy(['--json', '--self', join(tmp, 'nope-nope')]);
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 2 && j.contract === CONTRACT && j.ok === false && j.verdict === 'FAIL-CLOSED'
          && j.findings.length === 1 && j.findings[0].kind === 'SELF_NOT_A_DIR' && j.errors === 1,
        detail: `exit=${res.status} verdict=${j.verdict} kind=${j.findings[0] && j.findings[0].kind}`,
      };
    });

    /* 38-41 ─ usage --------------------------------------------------------- */
    const u1 = runProxy(['--bogus']);
    check('usage: unknown flag → exit 64, usage on stderr', () => ({
      ok: u1.status === 64 && /unknown argument: --bogus/u.test(String(u1.stderr ?? ''))
        && /usage: node scripts\/proxy-check\.mjs/u.test(String(u1.stderr ?? '')),
      detail: `exit=${u1.status} ${String(u1.stderr ?? '').split('\n')[0]}`,
    }));
    const u2 = runProxy(['--self']);
    check('usage: --self without a value → exit 64', () => ({
      ok: u2.status === 64 && /--self requires/u.test(String(u2.stderr ?? '')), detail: `exit=${u2.status}`,
    }));
    const u3 = runProxy(['--self', '--json']);
    check('usage: a value that is a flag is refused (--self --json) → exit 64', () => ({
      ok: u3.status === 64 && /--self requires/u.test(String(u3.stderr ?? '')), detail: `exit=${u3.status}`,
    }));
    const u4 = runProxy(['--scorecard', '']);
    check('usage: empty --scorecard value → exit 64', () => ({
      ok: u4.status === 64 && /--scorecard requires/u.test(String(u4.stderr ?? '')), detail: `exit=${u4.status}`,
    }));

    /* 42 ─ hermeticity ------------------------------------------------------ */
    if (process.env.KUMITATE_PROXY_NESTED === '1') {
      results.push({
        name: 'hermeticity: nested --selftest under a polluted env',
        ok: true,
        skipped: true,
        detail: 'SKIP(nested) — the parent run already spawned this suite once',
      });
    } else {
      const nested = runProxy(
        ['--selftest', '--self', '/nonexistent/repo', '--scorecard', '/nonexistent/SCORECARD.md'],
        {
          KUMITATE_PROXY_NESTED: '1',
          KUMITATE_REPORTS_DIR: '/nonexistent/corpus',
          KUMITATE_MAIN_REPO: '/nonexistent/main',
          KUMITATE_LANE: 'not-a-lane',
          UFO_SRC: '/nonexistent/origin',
        },
      );
      check('hermeticity: `--selftest` ignores bogus --self/--scorecard and every env var', () => {
        const tail = String(nested.stdout ?? '').trim().split('\n');
        return {
          ok: nested.status === 0 && /^PROXY_SELFTEST: \d+\/\d+ pass$/u.test(tail.at(-2) ?? '')
            && tail.at(-1) === 'VERDICT: PASS',
          detail: `exit=${nested.status} tail=${tail.slice(-2).join(' | ')}`,
        };
      });
    }

    /* 43-44 ─ meta ---------------------------------------------------------- */
    check('every declared finding kind fires in at least one fixture', () => {
      const missing = FINDING_KINDS.filter((k) => !observed.has(k));
      return { ok: missing.length === 0, detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observed.size} kinds observed` };
    });
    check('every declared fail-closed arm fires in at least one fixture', () => {
      const missing = FAIL_CLOSED_KINDS.filter((k) => !observedFc.has(k));
      return { ok: missing.length === 0, detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observedFc.size} arms observed` };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const passed = results.filter((r) => r.ok).length;
  const width = String(results.length).length;
  const lines = [`kumitate proxy-check --selftest (hermetic, node ${process.version})`];
  results.forEach((r, i) => {
    const word = r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL';
    lines.push(`${word}  [${String(i + 1).padStart(width)}/${results.length}]  ${r.name} — ${r.detail}`);
  });
  lines.push(`PROXY_SELFTEST: ${passed}/${results.length} pass`);
  lines.push(`VERDICT: ${passed === results.length ? 'PASS' : 'FAIL'}`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return passed === results.length ? 0 : 1;
}

/* --------------------------------------------------------------------- main */

function parseArgs(argv) {
  const opts = { self: DEFAULT_SELF, scorecard: null, json: false, strict: false, selftest: false, help: false };
  const dirValue = (flag, v) => {
    if (v === undefined || v.trim() === '' || v.startsWith('-')) {
      throw new Error(`${flag} requires a non-empty directory (got ${JSON.stringify(v)})`);
    }
    return resolve(v);
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--self') opts.self = dirValue(a, next());
    else if (a === '--scorecard') opts.scorecard = dirValue(a, next());
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--selftest') opts.selftest = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  if (opts.scorecard === null) opts.scorecard = join(opts.self, SCORECARD_FILE);
  return opts;
}

function main() {
  const started = Date.now();
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`proxy-check: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts.selftest) return selfTest();
  if (opts.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  try {
    return runCheck(opts, started);
  } catch (e) {
    return failClosed(opts, 'INTERNAL_ERROR', e && e.message ? e.message : String(e), {}, started);
  }
}

process.exitCode = main();