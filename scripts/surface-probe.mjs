#!/usr/bin/env node
/**
 * surface-probe.mjs — live-surface conformance probe for the two surfaces this
 * province consumes from the origin tree. Read-only, zero deps, ESM, node >= 20.
 * Contract: kumitate-surface-probe-v1 (parent-frozen).
 *
 *   node scripts/surface-probe.mjs [--src DIR] [--self DIR] [--json]
 *                                 [--checklists] [--selftest|--self-test] [--strict]
 *
 * Modes (one per run; `--selftest` wins, then `--checklists`, else conformance)
 *   default        live conformance over both surfaces: the ufo-sighting
 *                  `surface --json` manifest and `fleet-dispatcher.mjs status`.
 *   --selftest     HERMETIC fixture suite: a synthetic tree plus injected
 *                  manifest/status bytes under a temp dir. It never reads the
 *                  live tree, so it PASSes in any repo state — and a bogus
 *                  `--src` (or a missing one) cannot affect it.
 *   --checklists   parse this repo's `SKILL.md` GFM task items with the frozen
 *                  grammar below and run each command with cwd = repo root.
 *
 * Checklist grammar (frozen v1, one GFM task line)
 *   ^\s*- \[ \] <label> — `<command>` → exit <n>[|<m>…] + `<expected substring>$
 *   An item is a pass iff the command's exit status is in the declared set AND
 *   its combined stdout+stderr contains the expected substring. An item whose
 *   command invokes `--checklists` is `SKIP(self)` (it would recurse); a
 *   `- [x]` line is `SKIP(checked)` (already asserted by its author). Skipped
 *   items leave both numerator and denominator. A `- [ ]` line that does not
 *   parse is a CHECKLIST_GRAMMAR error and counts as a failed item — an
 *   unverifiable checklist entry is drift, not a free pass.
 *
 * Surfaces, byte sets, and the digest trap (read this before "fixing" a digest)
 *   sighting  The manifest is produced by `bash <src>/scripts/ufo-sighting
 *             surface --json` with cwd = <src> — the same host path and call
 *             `scripts/sync-ufo-contracts.mjs` uses (`runSightingSurfaceVerb`,
 *             :895+, host `scripts/ufo-sighting`, :102). The shim and
 *             `scripts/ufo-sighting.mjs` print identical bytes.
 *   digestInputs  the shim `scripts/ufo-sighting` + `scripts/ufo-sighting.mjs`
 *             + every regular `*.mjs` in `scripts/ufo-sighting-lib/`, sorted;
 *             the expected set is derived from disk, never from the manifest.
 *   scriptDigest  sha256 over the CONCATENATED BYTES of exactly that set, in
 *             that order. It is not any single file's sha256.
 *   pin       `config/ufo.json` `sighting.surfaceDigest` is sha256 over
 *             canonicalJson(manifest) — sorted-key JSON of the whole manifest
 *             object (`sync-ufo-contracts.mjs:853-862`). The pin and
 *             scriptDigest are different functions over different inputs:
 *             comparing the pin to scriptDigest — or to any single file hash —
 *             ALWAYS mismatches and is never a drift signal. PIN_MATCH
 *             compares the pin to canonicalJson(manifest); SCRIPT_DIGEST
 *             compares scriptDigest to the concatenated bytes.
 *   errors    `manifest.errors` is a `fail("X")`-derived vocabulary (79 codes
 *             today, equal to an independent re-extraction). The scan set is
 *             module + regular lib `*.mjs` — the bash shim contributes ZERO
 *             codes — so ERROR_CODE_UNDECLARED / ERROR_CODE_PHANTOM would only
 *             fire on real drift. ERROR_CODE_OFF_MANIFEST uses the wider
 *             `code:[^,\n]*"([A-Z][A-Z0-9_]*)"` pattern so a ternary
 *             (`code: known ? error.code : "UNEXPECTED_ERROR"`) is caught too.
 *   status    `node <src>/scripts/fleet-dispatcher.mjs status`, cwd = <src>.
 *             JSON by default (it has NO --json flag); a read-only lock-free
 *             projection by design (`fleet-dispatcher.mjs:14387-14415`).
 *             Expected top-level keys and expected `queue.schema` are read from
 *             the dispatcher source itself (the `output({...})` projection in
 *             the `command === "status"` arm, and `const QUEUE_SCHEMA`), with
 *             the frozen v1 shape as fallback when that parse finds < 5 keys.
 *
 * Verb rule table (the part a reader cannot re-derive cheaply)
 *   S (source arms)  {x : `command === "x"`} ∪ {x : `argv[0] === "x"`} in
 *                    `scripts/ufo-sighting.mjs`. Live members: 18 command arms
 *                    + `__idle`, `__pane-run`, `__reconcile`.
 *   D (declared)     keys(manifest.verbs) ∪ extras[].name.
 *   ALIAS class      extras[].name entries carrying a `resolves` field
 *                    (`trigger-alias` → `resolves: "open"`, source
 *                    `sighting.triggers`; its only arm is the guard
 *                    `resolveTrigger(argv.join(" ")) === "open"` at
 *                    `ufo-sighting.mjs:64`), plus `--help` and `-h` (owned by
 *                    the help arm `ufo-sighting.mjs:331`; the manifest
 *                    deliberately omits them).
 *   INTERNAL class   names beginning `__` — the source's own private-arm
 *                    convention (`ufo-sighting.mjs:40,45,50`).
 *   VERB_UNDECLARED  (error) x ∈ S \ D, x ∉ {--help, -h}, x ∉ INTERNAL.
 *   VERB_UNDISPATCHED(error) v ∈ D, v ∉ ALIAS, v ∉ S.
 *   Any non-zero count is real drift; today both are 0.
 *
 * Findings
 *   error SURFACE_UNREACHABLE MANIFEST_UNPARSED MANIFEST_KIND
 *         DIGEST_INPUT_MISSING DIGEST_MISMATCH DIGEST_SET_INCOMPLETE
 *         SCRIPT_DIGEST_MISMATCH VERB_UNDECLARED VERB_UNDISPATCHED
 *         ERROR_CODE_UNDECLARED ERROR_CODE_PHANTOM STATUS_SHAPE
 *         CHECKLIST_GRAMMAR
 *   warn  PIN_DRIFT (owner = origin tree, not this province) PIN_MISSING
 *         STATUS_KEY_EXTRA ERROR_CODE_OFF_MANIFEST
 *   note  PIN_MATCH DIGEST_ORDER STATUS_SHAPE_DERIVED STATUS_KEYS_DERIVED
 *   `--strict` promotes warn-level findings to failure, except the two
 *   NON-GATING warnings — PIN_DRIFT and ERROR_CODE_OFF_MANIFEST — which are
 *   origin-owned disclosures reported on every run and never gating. PIN_DRIFT
 *   is never promoted to an error class either; it is reported, never repaired
 *   here. ERROR_CODE_OFF_MANIFEST lists codes the surface reaches through an
 *   object-literal `code: "X"` value (defined-by-literal, not-by-`fail()`)
 *   that `manifest.errors` therefore omits.
 *   Known limit (deliberate): ERROR_CODE_UNDECLARED / ERROR_CODE_PHANTOM mirror
 *   the generator's own regex `\bfail\(\s*"([A-Z][A-Z0-9_]*)"` over module +
 *   lib modules (`surface.mjs:62-69`). Codes raised any other way — an
 *   object-literal `code:` field, a bare `Error("EFBIG")` — sit outside both
 *   the declared list and this census, so a documented-but-undeclared code
 *   (e.g. `RECONCILE_UNATTESTED_STOP`) reads CLEAN here. That gap belongs to
 *   the manifest generator, not to this probe.
 *
 * Exit
 *   0 clean · 1 any error finding (or any warn under --strict) · 2 fail-closed
 *   (missing/non-dir --src, missing/non-dir --self for --checklists, no
 *   SKILL.md, absent sighting shim, non-JSON or foreign-kind manifest, zero
 *   checks executed) · 64 usage error.
 *
 * Bounds and what this tool never does
 *   spawn timeout 20s, maxBuffer 8 MiB, checklist command timeout 120s.
 *   It NEVER writes to the source tree, NEVER acquires a tmux or dispatcher
 *   lock, NEVER runs a mutating verb (`surface`/`status` only), NEVER opens a
 *   socket, and never prints more of a payload than a finding needs.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'kumitate-surface-probe-v1';
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');
const DEFAULT_SRC = process.env.UFO_SRC || '/home/vgpnk/Projects/origin-work/ufo-fsd-alpha';

const SIGHTING_SHIM = 'scripts/ufo-sighting';
const SIGHTING_MODULE = 'scripts/ufo-sighting.mjs';
const SIGHTING_LIB = 'scripts/ufo-sighting-lib';
const DISPATCHER = 'scripts/fleet-dispatcher.mjs';
const MACHINE_CONFIG = 'config/ufo.json';
const SURFACE_KIND = 'sighting-surface-v1';

const SPAWN_TIMEOUT_MS = 20_000;
const CHECKLIST_TIMEOUT_MS = 120_000;
const MAX_BUFFER = 8 * 1024 * 1024;

/** Frozen v1 status projection, used when the origin source cannot be parsed. */
const STATUS_FROZEN_TYPES = {
  ok: 'boolean',
  queue: 'object',
  unarchivableCompleted: 'object',
  queueArchive: 'object',
  reapWithheld: 'object',
  emitterLatch: 'object',
  admissions: 'object',
  binaryDrift: 'object',
  ledgerModules: 'object',
  ledger: 'object',
  ledgerRotation: 'object',
  manifest: 'object',
};
const STATUS_FROZEN_QUEUE_SCHEMA = 'ufo-pending-work-v1';

/** Frozen checklist grammar. */
const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;

const SEVERITY = {
  SURFACE_UNREACHABLE: 'error',
  MANIFEST_UNPARSED: 'error',
  MANIFEST_KIND: 'error',
  DIGEST_INPUT_MISSING: 'error',
  DIGEST_MISMATCH: 'error',
  DIGEST_SET_INCOMPLETE: 'error',
  SCRIPT_DIGEST_MISMATCH: 'error',
  VERB_UNDECLARED: 'error',
  VERB_UNDISPATCHED: 'error',
  ERROR_CODE_UNDECLARED: 'error',
  ERROR_CODE_PHANTOM: 'error',
  STATUS_SHAPE: 'error',
  CHECKLIST_GRAMMAR: 'error',
  PIN_DRIFT: 'warn',
  PIN_MISSING: 'warn',
  STATUS_KEY_EXTRA: 'warn',
  ERROR_CODE_OFF_MANIFEST: 'warn',
  PIN_MATCH: 'note',
  DIGEST_ORDER: 'note',
  STATUS_SHAPE_DERIVED: 'note',
  STATUS_KEYS_DERIVED: 'note',
};

/**
 * Warn-level findings that never gate a run, not even under --strict: both are
 * origin-owned disclosures this province reports but never repairs. PIN_DRIFT
 * is the origin tree's own contract pin (`sync-ufo-contracts.mjs --check`
 * owns it); ERROR_CODE_OFF_MANIFEST is a vocabulary gap in the manifest
 * generator (codes defined by a literal `code:` field, not by `fail()`).
 */
const NON_GATING_WARNS = new Set(['PIN_DRIFT', 'ERROR_CODE_OFF_MANIFEST']);

/** Every code the hermetic suite must fire at least once. */
const SUITE_CODES = Object.keys(SEVERITY);

const SURFACE_NAMES = ['sighting', 'dispatcher'];
/** Fixed check order of a conformance run. */
const CHECK_ORDER = [
  ['SURFACE_REACH', 'sighting'],
  ['MANIFEST_PARSE', 'sighting'],
  ['MANIFEST_KIND', 'sighting'],
  ['DIGEST_INPUT_SET', 'sighting'],
  ['DIGEST_PER_FILE', 'sighting'],
  ['DIGEST_CONCAT', 'sighting'],
  ['VERB_DISPATCH', 'sighting'],
  ['ERROR_CODES', 'sighting'],
  ['PIN_DIGEST', 'sighting'],
  ['STATUS_REACH', 'dispatcher'],
  ['STATUS_SHAPE', 'dispatcher'],
  ['STATUS_QUEUE_SCHEMA', 'dispatcher'],
];

const USAGE = `usage: node scripts/surface-probe.mjs [options]

  --src DIR       origin tree to probe (default: $UFO_SRC or ${DEFAULT_SRC})
  --self DIR      this repo, for --checklists (default: repo root containing this script)
  --json          machine output: {schema:"${SCHEMA}",src,self,options,surfaces,checks,findings,totals,verdict}
  --checklists    parse + run this repo's SKILL.md GFM task items (frozen v1 grammar)
  --selftest      run the hermetic fixture suite (alias: --self-test)
  --strict        DRIFT also on warn-level findings (PIN_DRIFT and ERROR_CODE_OFF_MANIFEST never gate)
  -h, --help      this help
`;

/* ---------------------------------------------------------------- primitives */

function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function sha256File(file) {
  return sha256Hex(readFileSync(file));
}

/** Canonical JSON — byte-identical to `sync-ufo-contracts.mjs:853-862`. */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function canonicalDigest(value) {
  return `sha256:${sha256Hex(Buffer.from(canonicalJson(value), 'utf8'))}`;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function typeName(value) {
  return Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
}

function statKind(dir) {
  try { return statSync(dir).isDirectory() ? 'dir' : 'not-dir'; } catch (e) { return e.code === 'ENOENT' ? 'missing' : 'unreadable'; }
}

/* -------------------------------------------------------------- source bytes */

/** The digest-covered byte set, derived from disk: shim, module, sorted libs. */
function sightingBytePaths(src) {
  const libDir = join(src, SIGHTING_LIB);
  let libs = [];
  try {
    libs = readdirSync(libDir)
      .filter((entry) => entry.endsWith('.mjs'))
      .map((entry) => join(libDir, entry))
      .filter((file) => { try { return lstatSync(file).isFile(); } catch { return false; } })
      .sort();
  } catch { libs = []; }
  const paths = [join(src, SIGHTING_SHIM), join(src, SIGHTING_MODULE), ...libs];
  return { paths, rel: paths.map((p) => relative(src, p).split('\\').join('/')) };
}

function readTextOrNull(file) {
  try { return readFileSync(file, 'utf8'); } catch { return null; }
}

function skipString(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (c === '\\') { i++; continue; }
    if (c === quote) return i;
  }
  return text.length - 1;
}

/** Index of the `}` closing the `{` at `open`, ignoring strings and comments. */
function matchBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(text, i); continue; }
    if (c === '/' && text[i + 1] === '/') { const nl = text.indexOf('\n', i); if (nl < 0) return -1; i = nl; continue; }
    if (c === '/' && text[i + 1] === '*') { const end = text.indexOf('*/', i + 2); if (end < 0) return -1; i = end + 1; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** Top-level (depth-1) entry names of an object literal body. Spreads are skipped. */
function topLevelKeys(body) {
  const keys = [];
  let i = 0;
  let depth = 0;
  let expectEntry = true;
  while (i < body.length) {
    const c = body[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(body, i) + 1; continue; }
    if (c === '/' && body[i + 1] === '/') { const nl = body.indexOf('\n', i); i = nl < 0 ? body.length : nl; continue; }
    if (c === '/' && body[i + 1] === '*') { const end = body.indexOf('*/', i + 2); i = end < 0 ? body.length : end + 2; continue; }
    if (c === '{' || c === '[' || c === '(') { depth++; i++; continue; }
    if (c === '}' || c === ']' || c === ')') { depth--; i++; continue; }
    if (depth === 0 && c === ',') { expectEntry = true; i++; continue; }
    if (depth === 0 && expectEntry) {
      if (body.startsWith('...', i)) { expectEntry = false; i += 3; continue; }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i;
        while (j < body.length && /[\w$]/.test(body[j])) j++;
        const name = body.slice(i, j);
        let k = j;
        while (k < body.length && /\s/.test(body[k])) k++;
        if (body[k] === ':' || body[k] === ',') keys.push(name);
        expectEntry = false;
        i = j;
        continue;
      }
    }
    i++;
  }
  return keys;
}

/**
 * The dispatcher's own declared status contract, read from its source: the
 * `output({...})` projection keys of the `command === "status"` arm and the
 * `QUEUE_SCHEMA` constant. Returns null when the source or the projection is
 * not parseable (callers fall back to the frozen v1 shape).
 */
function statusContractFromSource(source) {
  if (typeof source !== 'string' || !source) return null;
  const schemaMatch = /const QUEUE_SCHEMA = "([^"]+)"/u.exec(source);
  const arm = source.indexOf('if (command === "status") {');
  if (arm < 0) return null;
  const out = source.indexOf('output({', arm);
  if (out < 0) return null;
  const open = source.indexOf('{', out);
  const close = open < 0 ? -1 : matchBrace(source, open);
  if (open < 0 || close < 0) return null;
  const keys = topLevelKeys(source.slice(open + 1, close));
  if (keys.length < 5) return null;
  return { keys, queueSchema: schemaMatch ? schemaMatch[1] : null };
}

/* -------------------------------------------------------------- live readers */

function readSightingSurface(src) {
  const host = join(src, SIGHTING_SHIM);
  if (!existsSync(host)) return { ok: false, detail: `sighting shim is missing: ${SIGHTING_SHIM}` };
  const result = spawnSync('bash', [host, 'surface', '--json'], {
    cwd: src, encoding: 'utf8', timeout: SPAWN_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
  });
  if (result.error) return { ok: false, detail: `surface invocation failed: ${result.error.code ?? result.error.message}` };
  if (result.status !== 0) {
    const noise = (result.stderr ?? '').trim().split('\n').filter(Boolean).at(-1);
    return { ok: false, detail: `surface --json exited ${result.status}${noise ? `: ${noise.slice(0, 120)}` : ''}` };
  }
  return { ok: true, text: result.stdout ?? '' };
}

function readDispatcherStatus(src) {
  const host = join(src, DISPATCHER);
  if (!existsSync(host)) return { ok: false, detail: `dispatcher is missing: ${DISPATCHER}` };
  const result = spawnSync(process.execPath, [host, 'status'], {
    cwd: src, encoding: 'utf8', timeout: SPAWN_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
  });
  if (result.error) return { ok: false, detail: `status invocation failed: ${result.error.code ?? result.error.message}` };
  if (result.status !== 0) {
    const noise = (result.stderr ?? '').trim().split('\n').filter(Boolean).at(-1);
    return { ok: false, detail: `status exited ${result.status}${noise ? `: ${noise.slice(0, 120)}` : ''}` };
  }
  return { ok: true, text: result.stdout ?? '' };
}

const LIVE_READERS = { sighting: readSightingSurface, dispatcher: readDispatcherStatus };

/* -------------------------------------------------------------- conformance */

function probeConformance({ src, strict, readers = LIVE_READERS }) {
  const findings = [];
  const slots = new Map();
  const note = (severity, kind, surface, check, message, detail) => {
    findings.push({ severity, kind, surface, check, message, ...(detail === undefined ? {} : { detail }) });
  };
  const set = (id, ok, detail) => { slots.set(id, { ok, ...(detail === undefined ? {} : { detail }) }); };

  /* --- surface 1: the sighting manifest --------------------------------- */
  const sighting = readers.sighting(src);
  set('SURFACE_REACH', sighting.ok, sighting.ok ? undefined : sighting.detail);
  if (!sighting.ok) note('error', 'SURFACE_UNREACHABLE', 'sighting', 'SURFACE_REACH', sighting.detail);

  let manifest = null;
  let failClosed = null;
  if (!sighting.ok) {
    set('MANIFEST_PARSE', false, 'surface unreachable');
    set('MANIFEST_KIND', false, 'surface unreachable');
    failClosed = `sighting surface unreachable (${sighting.detail})`;
  } else {
    try {
      manifest = JSON.parse(sighting.text);
    } catch (e) {
      note('error', 'MANIFEST_UNPARSED', 'sighting', 'MANIFEST_PARSE', `surface --json stdout is not JSON: ${String(e.message).slice(0, 100)}`);
    }
    const parsed = manifest !== null;
    set('MANIFEST_PARSE', parsed, parsed ? undefined : 'stdout is not JSON');
    if (!parsed) {
      set('MANIFEST_KIND', false, 'manifest unparsed');
      set('DIGEST_INPUT_SET', false, 'manifest unparsed');
      set('DIGEST_PER_FILE', false, 'manifest unparsed');
      set('DIGEST_CONCAT', false, 'manifest unparsed');
      set('VERB_DISPATCH', false, 'manifest unparsed');
      set('ERROR_CODES', false, 'manifest unparsed');
      set('PIN_DIGEST', false, 'manifest unparsed');
      failClosed = 'sighting manifest unparsable';
    }
  }

  if (manifest !== null) {
    const kindOk = manifest.kind === SURFACE_KIND;
    set('MANIFEST_KIND', kindOk, kindOk ? undefined : `kind=${JSON.stringify(manifest.kind)}`);
    if (!kindOk) {
      note('error', 'MANIFEST_KIND', 'sighting', 'MANIFEST_KIND', `manifest kind is ${JSON.stringify(manifest.kind)}, expected "${SURFACE_KIND}"`);
      for (const id of ['DIGEST_INPUT_SET', 'DIGEST_PER_FILE', 'DIGEST_CONCAT', 'VERB_DISPATCH', 'ERROR_CODES', 'PIN_DIGEST']) set(id, false, 'manifest kind mismatch');
      failClosed = `manifest kind is ${JSON.stringify(manifest.kind)}`;
    } else {
      checkDigests({ src, manifest, note, set });
      checkVerbs({ src, manifest, note, set });
      checkErrorCodes({ src, manifest, note, set });
      checkPin({ src, manifest, note, set });
    }
  }

  /* --- surface 2: the dispatcher status projection ---------------------- */
  const status = readers.dispatcher(src);
  set('STATUS_REACH', status.ok, status.ok ? undefined : status.detail);
  if (!status.ok) {
    note('error', 'SURFACE_UNREACHABLE', 'dispatcher', 'STATUS_REACH', status.detail);
    set('STATUS_SHAPE', false, 'surface unreachable');
    set('STATUS_QUEUE_SCHEMA', false, 'surface unreachable');
  } else {
    checkStatus({ src, text: status.text, note, set });
  }

  const checks = CHECK_ORDER
    .filter(([id]) => slots.has(id))
    .map(([id, surface]) => ({ id, surface, ...slots.get(id) }));
  const checksPassed = checks.filter((c) => c.ok).length;
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  const nonGatingWarnings = findings
    .filter((f) => f.severity === 'warn' && NON_GATING_WARNS.has(f.kind)).length;
  const gatingWarnings = warnings - nonGatingWarnings;
  const notes = findings.filter((f) => f.severity === 'note').length;

  if (failClosed === null && checks.length === 0) failClosed = 'zero checks executed';
  const verdict = failClosed !== null ? 'FAIL-CLOSED'
    : errors > 0 || (strict && gatingWarnings > 0) ? 'DRIFT' : 'CLEAN';
  const exitCode = failClosed !== null ? 2 : verdict === 'CLEAN' ? 0 : 1;

  return {
    schema: SCHEMA,
    src,
    self: null,
    options: { strict, checklists: false, selftest: false },
    surfaces: buildSurfaces(src, manifest, status.ok),
    checks,
    findings,
    totals: {
      surfaces: SURFACE_NAMES.length,
      checks: checks.length,
      checksPassed,
      errors,
      warnings,
      nonGatingWarnings,
      gatingWarnings,
      notes,
      byKind: countBy(findings, (f) => f.kind),
      bySeverity: { error: errors, warn: warnings, note: notes },
      bySurface: countBy(findings, (f) => f.surface),
      failClosed,
    },
    verdict,
    exitCode,
  };
}

function countBy(list, key) {
  const out = {};
  for (const item of list) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Exact-set membership test for the digest-covered byte set. */
function digestSetDiff(expectedRel, listedPaths) {
  const expected = new Set(expectedRel);
  const listed = new Set(listedPaths);
  return {
    missingFromList: expectedRel.filter((p) => !listed.has(p)),
    extraInList: [...listed].filter((p) => !expected.has(p)),
  };
}

function checkDigests({ src, manifest, note, set }) {
  const { paths, rel } = sightingBytePaths(src);
  const listed = Array.isArray(manifest.digestInputs) ? manifest.digestInputs : [];
  const listedPaths = listed.map((e) => (isPlainObject(e) && typeof e.path === 'string' ? e.path : null));
  const { missingFromList, extraInList } = digestSetDiff(rel, listedPaths.filter(Boolean));
  const setOk = missingFromList.length === 0 && extraInList.length === 0;
  const setDetail = setOk ? undefined : `missing=${missingFromList.join(',') || '-'} extra=${extraInList.join(',') || '-'}`;
  set('DIGEST_INPUT_SET', setOk, setDetail);
  if (!setOk) note('error', 'DIGEST_SET_INCOMPLETE', 'sighting', 'DIGEST_INPUT_SET',
    `digestInputs set != {shim, module} ∪ lib/*.mjs (${setOk ? '' : setDetail})`,
    { expected: rel.length, listed: listedPaths.length });
  else if (listedPaths.length !== rel.length || listedPaths.some((p, i) => p !== rel[i])) {
    note('note', 'DIGEST_ORDER', 'sighting', 'DIGEST_INPUT_SET', 'digestInputs set matches disk but the order is not shim → module → sorted lib/*.mjs');
  }

  const perFile = [];
  for (const [index, entry] of listedPaths.entries()) {
    if (entry === null) { perFile.push('entry without a string path'); continue; }
    const abs = join(src, entry);
    if (!existsSync(abs)) {
      perFile.push(`absent: ${entry}`);
      note('error', 'DIGEST_INPUT_MISSING', 'sighting', 'DIGEST_PER_FILE', `digestInputs lists ${entry}, which does not exist in the source tree`);
      continue;
    }
    let actual;
    try { actual = sha256File(abs); } catch (e) { perFile.push(`unreadable: ${entry} (${e.code ?? e.message})`); continue; }
    const declared = isPlainObject(listed[index]) ? listed[index].sha256 : undefined;
    if (actual !== declared) {
      perFile.push(`digest differs: ${entry}`);
      note('error', 'DIGEST_MISMATCH', 'sighting', 'DIGEST_PER_FILE', `${entry}: listed sha256 != sha256 of the file on disk`, { declared, computed: actual });
    }
  }
  set('DIGEST_PER_FILE', perFile.length === 0, perFile.length ? perFile.join('; ') : undefined);

  let concatOk = false;
  let concatDetail = 'expected bytes unreadable';
  if (paths.every((p) => existsSync(p))) {
    let digest = null;
    try { digest = `sha256:${sha256Hex(Buffer.concat(paths.map((p) => readFileSync(p))))}`; } catch { digest = null; }
    if (digest === null) {
      concatDetail = 'expected bytes unreadable';
    } else if (digest === manifest.scriptDigest) {
      concatOk = true;
      concatDetail = undefined;
    } else {
      concatDetail = `concatenated-byte digest ${digest} != manifest.scriptDigest ${JSON.stringify(manifest.scriptDigest)}`;
      note('error', 'SCRIPT_DIGEST_MISMATCH', 'sighting', 'DIGEST_CONCAT', concatDetail, { computed: digest, declared: manifest.scriptDigest });
    }
  }
  set('DIGEST_CONCAT', concatOk, concatDetail);
}

function checkVerbs({ src, manifest, note, set }) {
  const source = readTextOrNull(join(src, SIGHTING_MODULE));
  if (source === null) {
    set('VERB_DISPATCH', false, `${SIGHTING_MODULE} is unreadable`);
    note('error', 'SURFACE_UNREACHABLE', 'sighting', 'VERB_DISPATCH', `${SIGHTING_MODULE} is unreadable`);
    return;
  }
  const dispatch = new Set();
  for (const m of source.matchAll(/\bcommand\s*===\s*"([A-Za-z0-9_-]+)"/gu)) dispatch.add(m[1]);
  for (const m of source.matchAll(/\bargv\s*\[\s*0\s*\]\s*===\s*"([A-Za-z0-9_-]+)"/gu)) dispatch.add(m[1]);
  const verbs = isPlainObject(manifest.verbs) ? Object.keys(manifest.verbs) : [];
  const extras = (Array.isArray(manifest.extras) ? manifest.extras : []).filter(isPlainObject);
  const declared = new Set([...verbs, ...extras.map((e) => e.name).filter((n) => typeof n === 'string')]);
  const alias = new Set([
    ...extras.filter((e) => typeof e.resolves === 'string').map((e) => e.name),
    '--help', '-h',
  ]);
  const internal = (name) => name.startsWith('__');
  const undeclared = [...dispatch].filter((x) => !declared.has(x) && !alias.has(x) && !internal(x)).sort();
  const undispatched = [...declared].filter((v) => !dispatch.has(v) && !alias.has(v) && !internal(v)).sort();
  const ok = undeclared.length === 0 && undispatched.length === 0;
  set('VERB_DISPATCH', ok, ok ? undefined
    : `source-only=${undeclared.join(',') || '-'} declared-only=${undispatched.join(',') || '-'}`);
  if (undeclared.length) note('error', 'VERB_UNDECLARED', 'sighting', 'VERB_DISPATCH',
    `dispatched in ${SIGHTING_MODULE} but undeclared in the manifest: ${undeclared.join(', ')}`, { sourceArms: [...dispatch].sort() });
  if (undispatched.length) note('error', 'VERB_UNDISPATCHED', 'sighting', 'VERB_DISPATCH',
    `declared in the manifest but with no dispatch arm: ${undispatched.join(', ')}`);
}

function checkErrorCodes({ src, manifest, note, set }) {
  const { paths, rel } = sightingBytePaths(src);
  // The generator scans module + lib modules only (`surface.mjs:62-69`); the
  // shim carries no `fail(` arm and is excluded on purpose.
  const payload = paths.filter((_, i) => rel[i] !== SIGHTING_SHIM);
  const raw = payload.map((p) => readTextOrNull(p));
  if (raw.some((t) => t === null)) {
    set('ERROR_CODES', false, 'payload bytes unreadable');
    return;
  }
  const present = new Set();
  for (const text of raw) {
    for (const m of text.matchAll(/\bfail\(\s*"([A-Z][A-Z0-9_]*)"/gu)) present.add(m[1]);
  }
  const declared = new Set((Array.isArray(manifest.errors) ? manifest.errors : []).filter((c) => typeof c === 'string'));
  const undeclared = [...present].filter((c) => !declared.has(c)).sort();
  const phantom = [...declared].filter((c) => !present.has(c)).sort();
  const ok = undeclared.length === 0 && phantom.length === 0;
  set('ERROR_CODES', ok, ok ? undefined : `undeclared=${undeclared.join(',') || '-'} phantom=${phantom.join(',') || '-'}`);
  if (undeclared.length) note('error', 'ERROR_CODE_UNDECLARED', 'sighting', 'ERROR_CODES',
    `fail("X") codes in the digest-covered bytes but absent from manifest.errors: ${undeclared.join(', ')}`,
    { present: present.size, declared: declared.size });
  if (phantom.length) note('error', 'ERROR_CODE_PHANTOM', 'sighting', 'ERROR_CODES',
    `manifest.errors codes with no fail("X") site in the digest-covered bytes: ${phantom.join(', ')}`);

  // Off-manifest vocabulary census (warn, non-gating): the manifest declares
  // its error names from `fail("X")` literals alone, so a refusal assigned to
  // a `code:` field is reachable but undeclared. The pattern deliberately
  // tolerates a ternary right-hand side (`code: known ? error.code :
  // "UNEXPECTED_ERROR"`), which a strict `code:\s*"X"` scan misses.
  const offManifest = [];
  for (const [i, text] of raw.entries()) {
    const file = rel[paths.indexOf(payload[i])];
    for (const [lineIndex, lineText] of text.split('\n').entries()) {
      for (const m of lineText.matchAll(/\bcode:[^,\n]*"([A-Z][A-Z0-9_]*)"/gu)) {
        if (!declared.has(m[1])) offManifest.push(`${file}:${lineIndex + 1}:${m[1]}`);
      }
    }
  }
  if (offManifest.length) {
    const distinct = [...new Set(offManifest.map((e) => e.split(':').at(-1)))].sort();
    note('warn', 'ERROR_CODE_OFF_MANIFEST', 'sighting', 'ERROR_CODES',
      `assigned to a code: field as a literal but absent from manifest.errors (which is derived from fail("X") only): ${offManifest.join(', ')}`,
      { definedBy: 'literal', notBy: 'fail()', distinct, occurrences: offManifest.length, owner: 'origin tree (manifest generator)' });
  }
}

function checkPin({ src, manifest, note, set }) {
  const computed = canonicalDigest(manifest);
  const configFile = join(src, MACHINE_CONFIG);
  let declared = null;
  let reason = null;
  if (!existsSync(configFile)) reason = `${MACHINE_CONFIG} is missing`;
  else {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf8'));
      const pin = config?.sighting?.surfaceDigest;
      if (typeof pin === 'string') declared = pin;
      else reason = 'sighting.surfaceDigest is absent or untyped';
    } catch (e) { reason = `${MACHINE_CONFIG} is unreadable JSON (${String(e.message).slice(0, 60)})`; }
  }
  if (declared === null) {
    set('PIN_DIGEST', false, reason);
    note('warn', 'PIN_MISSING', 'sighting', 'PIN_DIGEST', `${reason}; the pin is the origin tree's declared contract — never repaired here`, { computed });
    return;
  }
  const ok = declared === computed;
  set('PIN_DIGEST', ok, ok ? undefined : `pin=${declared} canonical=${computed}`);
  if (ok) {
    note('note', 'PIN_MATCH', 'sighting', 'PIN_DIGEST', `config/ufo.json sighting.surfaceDigest matches sha256(canonicalJson(manifest)) = ${computed}`);
  } else {
    note('warn', 'PIN_DRIFT', 'sighting', 'PIN_DIGEST',
      'config/ufo.json sighting.surfaceDigest != sha256(canonicalJson(manifest))',
      { declared, computed, owner: 'origin tree (scripts/ufo-sighting*)', authority: `${DISPATCHER.replace('fleet-dispatcher.mjs', 'sync-ufo-contracts.mjs')} --check` });
  }
}

function checkStatus({ src, text, note, set }) {
  let status = null;
  try { status = JSON.parse(text); } catch { status = null; }
  if (!isPlainObject(status)) {
    set('STATUS_SHAPE', false, 'stdout is not a JSON object');
    set('STATUS_QUEUE_SCHEMA', false, 'stdout is not a JSON object');
    note('error', 'STATUS_SHAPE', 'dispatcher', 'STATUS_SHAPE', 'fleet-dispatcher status stdout is not a JSON object');
    return;
  }
  const source = readTextOrNull(join(src, DISPATCHER));
  const derived = statusContractFromSource(source);
  const expectedKeys = derived ? derived.keys : Object.keys(STATUS_FROZEN_TYPES);
  const expectedSchema = (derived && derived.queueSchema) || STATUS_FROZEN_QUEUE_SCHEMA;
  note('note', derived ? 'STATUS_KEYS_DERIVED' : 'STATUS_SHAPE_DERIVED', 'dispatcher', 'STATUS_SHAPE',
    derived
      ? `expected key set and queue.schema read from ${DISPATCHER} (${expectedKeys.length} projection keys, QUEUE_SCHEMA=${expectedSchema})`
      : `expected key set fell back to the frozen v1 shape (${DISPATCHER} projection not parseable)`);

  const liveKeys = Object.keys(status);
  const missing = expectedKeys.filter((k) => !liveKeys.includes(k));
  const extra = liveKeys.filter((k) => !expectedKeys.includes(k));
  const retyped = expectedKeys
    .filter((k) => k in status && STATUS_FROZEN_TYPES[k] && typeName(status[k]) !== STATUS_FROZEN_TYPES[k])
    .map((k) => `${k}: ${typeName(status[k])} != ${STATUS_FROZEN_TYPES[k]}`);
  const shapeOk = missing.length === 0 && retyped.length === 0;
  set('STATUS_SHAPE', shapeOk, shapeOk ? undefined : `missing=${missing.join(',') || '-'} retyped=${retyped.join('; ') || '-'}`);
  if (missing.length || retyped.length) {
    note('error', 'STATUS_SHAPE', 'dispatcher', 'STATUS_SHAPE',
      `fleet-dispatcher status JSON ${missing.length ? `is missing top-level ${missing.join(', ')}` : ''}${missing.length && retyped.length ? ' and ' : ''}${retyped.length ? `retyped ${retyped.join('; ')}` : ''}`);
  }
  if (extra.length) {
    note('warn', 'STATUS_KEY_EXTRA', 'dispatcher', 'STATUS_SHAPE',
      `fleet-dispatcher status JSON carries top-level keys outside the declared projection: ${extra.join(', ')}`);
  }

  const schema = isPlainObject(status.queue) ? status.queue.schema : undefined;
  const schemaOk = schema === expectedSchema;
  set('STATUS_QUEUE_SCHEMA', schemaOk, schemaOk ? undefined : `queue.schema=${JSON.stringify(schema)} expected ${JSON.stringify(expectedSchema)}`);
  if (!schemaOk) {
    note('error', 'STATUS_SHAPE', 'dispatcher', 'STATUS_QUEUE_SCHEMA',
      `fleet-dispatcher status queue.schema is ${JSON.stringify(schema)}, expected ${JSON.stringify(expectedSchema)}`);
  }
}

function buildSurfaces(src, manifest, dispatcherReachable) {
  const sightingBlock = {
    name: 'sighting',
    root: src,
    script: SIGHTING_SHIM,
    kind: isPlainObject(manifest) ? manifest.kind ?? null : null,
    reachable: isPlainObject(manifest),
    digestInputs: isPlainObject(manifest) && Array.isArray(manifest.digestInputs) ? manifest.digestInputs.length : 0,
    verbs: isPlainObject(manifest) && isPlainObject(manifest.verbs) ? Object.keys(manifest.verbs).length : 0,
    extras: isPlainObject(manifest) && Array.isArray(manifest.extras) ? manifest.extras.length : 0,
    errors: isPlainObject(manifest) && Array.isArray(manifest.errors) ? manifest.errors.length : 0,
    scriptDigest: isPlainObject(manifest) ? manifest.scriptDigest ?? null : null,
  };
  return [
    sightingBlock,
    { name: 'dispatcher', root: src, script: DISPATCHER, reachable: dispatcherReachable },
  ];
}

/* ------------------------------------------------------------------ render */

function renderText(report) {
  const L = [];
  L.push(`kumitate surface-probe — ${SCHEMA}`);
  L.push(`src=${report.src}`);
  L.push(`mode:${report.options.strict ? ' strict' : ' conformance'}`);
  L.push('');
  for (const finding of report.findings) {
    if (finding.severity === 'note') continue;
    L.push(`  ${finding.severity.toUpperCase().padEnd(5)} ${finding.kind.padEnd(22)} [${finding.surface}/${finding.check}] ${finding.message}`);
  }
  if (!report.findings.some((f) => f.severity !== 'note')) L.push('  (no error or warning findings)');
  L.push('');
  L.push('checks');
  for (const c of report.checks) L.push(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.surface.padEnd(11)} ${c.id}${c.detail ? ` — ${c.detail}` : ''}`);
  const t = report.totals;
  L.push('totals');
  L.push(`  surfaces=${t.surfaces} checks=${t.checks} passed=${t.checksPassed} errors=${t.errors} warnings=${t.warnings} notes=${t.notes}`);
  L.push(`  nonGatingWarnings=${t.nonGatingWarnings} gatingWarnings=${t.gatingWarnings}`);
  L.push(`  bySeverity=${JSON.stringify(t.bySeverity)}`);
  L.push(`  byKind=${JSON.stringify(t.byKind)}`);
  L.push('');
  L.push(t.failClosed !== null
    ? `SURFACE_PROBE: FAIL-CLOSED (${t.failClosed})`
    : `SURFACE_PROBE: ${report.verdict} (surfaces=${t.surfaces} checks=${t.checks} errors=${t.errors} warnings=${t.warnings})`);
  return `${L.join('\n')}\n`;
}

/* --------------------------------------------------------------- checklists */

function parseChecklist(text) {
  const items = [];
  for (const [index, line] of text.split('\n').entries()) {
    if (!/^\s*- \[/.test(line)) continue;
    const match = CHECKLIST_RE.exec(line);
    if (match) {
      items.push({
        line: index + 1,
        label: match.groups.label,
        command: match.groups.cmd,
        exits: match.groups.exits.split('|').map(Number),
        expect: match.groups.expect,
      });
      continue;
    }
    if (/^\s*- \[[xX]\]/.test(line)) {
      items.push({ line: index + 1, checked: true, label: line.replace(/^\s*- \[[xX]\]\s*/, '').slice(0, 80) });
      continue;
    }
    items.push({ line: index + 1, malformed: true, raw: line.trim().slice(0, 120) });
  }
  return items;
}

function runChecklistsMode(opts) {
  const findings = [];
  // `capture` is the hermetic-suite sink: the fixture arms must not spray the
  // suite's own stdout with the outputs they are asserting on.
  const out = (text) => {
    if (Array.isArray(opts.capture)) opts.capture.push(text);
    else process.stdout.write(text);
  };
  const err = (text) => {
    if (Array.isArray(opts.capture)) opts.capture.push(text);
    else process.stderr.write(text);
  };
  const skill = join(opts.self, 'SKILL.md');
  if (statKind(opts.self) !== 'dir') {
    err(`surface-probe: fail-closed — --self ${opts.self} is ${statKind(opts.self)}\n`);
    out('CHECKLIST: FAIL-CLOSED (--self is not a directory)\nVERDICT: FAIL\n');
    return 2;
  }
  if (!existsSync(skill)) {
    err(`surface-probe: fail-closed — ${skill} is missing\n`);
    out('CHECKLIST: FAIL-CLOSED (SKILL.md missing)\nVERDICT: FAIL\n');
    return 2;
  }

  const parsed = parseChecklist(readFileSync(skill, 'utf8'));
  const results = [];
  for (const item of parsed) {
    if (item.checked) { results.push({ ...item, skipped: 'SKIP(checked)' }); continue; }
    if (item.malformed) {
      results.push({ ...item, failed: true });
      findings.push({ severity: 'error', kind: 'CHECKLIST_GRAMMAR', surface: 'skill', check: 'CHECKLIST',
        message: `SKILL.md:${item.line} is a GFM task line that does not match the frozen grammar — ${item.raw}` });
      continue;
    }
    if (item.command.includes('--checklists')) { results.push({ ...item, skipped: 'SKIP(self)' }); continue; }
    const run = spawnSync('bash', ['-c', item.command], {
      cwd: opts.self, encoding: 'utf8', timeout: CHECKLIST_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
    });
    const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
    const exitOk = typeof run.status === 'number' && item.exits.includes(run.status);
    const substringOk = output.includes(item.expect);
    results.push({ ...item, status: run.status, exitOk, substringOk, failed: !(exitOk && substringOk) });
  }

  const ran = results.filter((r) => !r.skipped);
  const passed = ran.filter((r) => !r.failed).length;
  const failed = ran.length - passed;
  const skipped = results.length - ran.length;
  const verdict = failed ? 'FAIL' : 'PASS';
  if (Array.isArray(opts.captureFindings)) opts.captureFindings.push(...findings);

  const lines = [];
  for (const r of results) {
    if (r.skipped) { lines.push(`CHECKLIST  ${r.skipped}  SKILL.md:${r.line} ${r.label ?? ''}`.trimEnd()); continue; }
    if (r.malformed) { lines.push(`CHECKLIST  ERROR  SKILL.md:${r.line} grammar (${r.raw})`); continue; }
    const verdictWord = r.failed ? 'FAIL' : 'PASS';
    lines.push(`CHECKLIST  ${verdictWord.padEnd(4)} SKILL.md:${r.line} exit=${r.status} expected=${r.exits.join('|')} substring=${r.substringOk ? 'hit' : 'miss'} — ${r.label}`);
  }
  lines.push(`CHECKLIST_SKIPPED: ${skipped}`);
  lines.push(`CHECKLIST: ${passed}/${ran.length} pass`);
  lines.push(`VERDICT: ${verdict}`);

  if (opts.json) {
    out(`${JSON.stringify({
      schema: SCHEMA,
      mode: 'checklists',
      src: null,
      self: opts.self,
      options: { strict: opts.strict, checklists: true, selftest: false },
      items: results.map((r) => ({
        line: r.line, label: r.label ?? null, command: r.command ?? null, exits: r.exits ?? null,
        expect: r.expect ?? null, status: r.status ?? null, exitOk: r.exitOk ?? null,
        substringOk: r.substringOk ?? null, skipped: r.skipped ?? null, failed: Boolean(r.failed),
      })),
      findings,
      totals: { items: results.length, ran: ran.length, passed, failed, skipped, grammar: results.filter((r) => r.malformed).length },
      verdict,
      exitCode: failed ? 1 : 0,
    }, null, 2)}\n`);
    return failed ? 1 : 0;
  }
  out(`${lines.join('\n')}\n`);
  return failed ? 1 : 0;
}

/* ----------------------------------------------------------------- selftest */

const FIXTURE_MODULE_ARMS = ['open', 'status', 'peek', 'register', 'twin', 'surface', 'help'];

function fixtureModule(extraArms = []) {
  const arms = [...FIXTURE_MODULE_ARMS, ...extraArms]
    .map((name) => `if (command === "${name}") { return; }`);
  return [
    '// synthetic payload module (never executed by the probe — bytes only)',
    'import { fail } from "./ufo-sighting-lib/alpha.mjs";',
    'const argv = process.argv.slice(2);',
    'if (argv[0] === "__idle") { return; }',
    'const command = argv[0];',
    ...arms,
    'fail("FIXTURE_USAGE");',
    '',
  ].join('\n');
}

const FIXTURE_LIB = {
  'alpha.mjs': 'export function fail(code) { throw new Error(code); }\nexport const A = 1;\nfail("FIXTURE_ONE");\n',
  'beta.mjs': 'export const B = 2;\nfail("FIXTURE_TWO");\nfail("FIXTURE_THREE");\n',
};

const FIXTURE_SHIM = '#!/usr/bin/env bash\nexec node "$(dirname "$0")/ufo-sighting.mjs" "$@"\n';

function fixtureStatus(overrides = {}) {
  return {
    ok: true,
    queue: { schema: STATUS_FROZEN_QUEUE_SCHEMA, counts: {} },
    unarchivableCompleted: {},
    queueArchive: {},
    reapWithheld: {},
    emitterLatch: {},
    admissions: {},
    binaryDrift: {},
    ledgerModules: {},
    ledger: {},
    ledgerRotation: {},
    manifest: {},
    ...overrides,
  };
}

/** Materialize a synthetic origin tree and derive its real manifest. */
function buildFixture(root, { extraArms = [], moduleArms = true, moduleTail = '' } = {}) {
  mkdirSync(join(root, SIGHTING_LIB), { recursive: true });
  mkdirSync(join(root, 'config'), { recursive: true });
  if (moduleArms) writeFileSync(join(root, SIGHTING_SHIM), FIXTURE_SHIM);
  writeFileSync(join(root, SIGHTING_MODULE), `${fixtureModule(extraArms)}${moduleTail}`);
  for (const [name, body] of Object.entries(FIXTURE_LIB)) writeFileSync(join(root, SIGHTING_LIB, name), body);

  const { paths, rel } = sightingBytePaths(root);
  const digestInputs = paths.map((p) => ({ path: relative(root, p).split('\\').join('/'), sha256: sha256File(p) }));
  const present = new Set();
  for (const p of paths.filter((x) => relative(root, x).split('\\').join('/') !== SIGHTING_SHIM)) {
    for (const m of readFileSync(p, 'utf8').matchAll(/\bfail\(\s*"([A-Z][A-Z0-9_]*)"/gu)) present.add(m[1]);
  }
  const manifest = {
    kind: SURFACE_KIND,
    scriptDigest: `sha256:${sha256Hex(Buffer.concat(paths.map((p) => readFileSync(p))))}`,
    digestInputs,
    exitCodes: { 0: 'success', 2: 'typed error' },
    verbs: { open: {}, status: {}, peek: {} },
    extras: [
      { name: 'register' }, { name: 'twin' }, { name: 'surface' }, { name: 'help' },
      { name: 'trigger-alias', resolves: 'open', source: 'sighting.triggers' },
    ],
    errors: [...present].sort(),
    bounds: { textMaxBytes: 4096 },
  };
  writeFileSync(join(root, 'config', 'ufo.json'), `${JSON.stringify({ sighting: { surfaceDigest: canonicalDigest(manifest) } }, null, 2)}\n`);
  return { manifest, expectedPaths: rel };
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-surface-probe-'));
  const results = [];
  const observedCodes = new Set();
  const check = (name, fn) => {
    let ok = false;
    let detail = '';
    try {
      const r = fn();
      ok = Boolean(r.ok);
      detail = r.detail ?? '';
    } catch (e) { detail = `threw: ${e.message}`; }
    results.push({ name, ok, detail });
  };
  const runFixture = (src, { manifestText, statusText, sighting, dispatcher, strict = false }) => {
    const report = probeConformance({
      src,
      strict,
      readers: {
        sighting: () => (sighting !== undefined ? sighting : { ok: true, text: manifestText }),
        dispatcher: () => (dispatcher !== undefined ? dispatcher : { ok: true, text: statusText }),
      },
    });
    for (const f of report.findings) observedCodes.add(f.kind);
    return report;
  };
  const codesOf = (report) => [...new Set(report.findings.map((f) => f.kind))].sort();

  try {
    const tree = (name, spec) => {
      const dir = join(tmp, name);
      mkdirSync(dir, { recursive: true });
      return { dir, built: buildFixture(dir, spec) };
    };
    const statusText = JSON.stringify(fixtureStatus());

    /* fixture: clean --------------------------------------------------- */
    const clean = tree('clean');
    const cleanManifestText = JSON.stringify(clean.built.manifest, null, 2);
    const cleanReport = runFixture(clean.dir, { manifestText: cleanManifestText, statusText });
    check('clean fixture → CLEAN, zero findings, exit 0', () => ({
      ok: cleanReport.verdict === 'CLEAN' && cleanReport.findings.filter((f) => f.severity !== 'note').length === 0
        && cleanReport.exitCode === 0 && cleanReport.checks.length === 12,
      detail: `verdict=${cleanReport.verdict} exit=${cleanReport.exitCode} checks=${cleanReport.checks.length} codes=[${codesOf(cleanReport)}]`,
    }));

    /* fixture: surface unreachable ------------------------------------- */
    const unreachable = tree('unreachable');
    const unreachableReport = runFixture(unreachable.dir, {
      sighting: { ok: false, detail: 'sighting shim is missing: scripts/ufo-sighting' },
      statusText,
    });
    check('missing shim → SURFACE_UNREACHABLE, fail-closed exit 2', () => ({
      ok: codesOf(unreachableReport).includes('SURFACE_UNREACHABLE') && unreachableReport.exitCode === 2
        && unreachableReport.totals.failClosed !== null,
      detail: `exit=${unreachableReport.exitCode} failClosed=${unreachableReport.totals.failClosed}`,
    }));

    /* fixture: manifest unparsed --------------------------------------- */
    const unparsed = tree('unparsed');
    const unparsedReport = runFixture(unparsed.dir, { manifestText: '{ not json', statusText });
    check('non-JSON manifest → MANIFEST_UNPARSED, fail-closed exit 2', () => ({
      ok: codesOf(unparsedReport).includes('MANIFEST_UNPARSED') && unparsedReport.exitCode === 2,
      detail: `exit=${unparsedReport.exitCode} failClosed=${unparsedReport.totals.failClosed}`,
    }));

    /* fixture: foreign kind -------------------------------------------- */
    const foreign = tree('foreign');
    const foreignReport = runFixture(foreign.dir, {
      manifestText: JSON.stringify({ ...foreign.built.manifest, kind: 'other-surface-v1' }), statusText,
    });
    check('foreign manifest kind → MANIFEST_KIND, fail-closed exit 2', () => ({
      ok: codesOf(foreignReport).includes('MANIFEST_KIND') && foreignReport.exitCode === 2,
      detail: `exit=${foreignReport.exitCode} codes=[${codesOf(foreignReport)}]`,
    }));

    /* fixture: digestInputs lists a ghost file -------------------------- */
    const ghost = tree('ghost');
    const ghostReport = runFixture(ghost.dir, {
      manifestText: JSON.stringify({
        ...ghost.built.manifest,
        digestInputs: [...ghost.built.manifest.digestInputs, { path: `${SIGHTING_LIB}/ghost.mjs`, sha256: '0'.repeat(64) }],
      }), statusText,
    });
    check('digestInputs listing an absent file → DIGEST_INPUT_MISSING + DIGEST_SET_INCOMPLETE', () => ({
      ok: codesOf(ghostReport).includes('DIGEST_INPUT_MISSING') && codesOf(ghostReport).includes('DIGEST_SET_INCOMPLETE')
        && ghostReport.exitCode === 1,
      detail: `exit=${ghostReport.exitCode} codes=[${codesOf(ghostReport)}]`,
    }));

    /* fixture: one listed per-file digest is wrong ---------------------- */
    const perFile = tree('perfile');
    const perFileManifest = JSON.parse(JSON.stringify(perFile.built.manifest));
    perFileManifest.digestInputs = perFileManifest.digestInputs.map((d) => (d.path.endsWith('alpha.mjs')
      ? { ...d, sha256: 'a'.repeat(64) } : d));
    const perFileReport = runFixture(perFile.dir, { manifestText: JSON.stringify(perFileManifest), statusText });
    check('listed per-file sha256 != disk → DIGEST_MISMATCH', () => ({
      ok: codesOf(perFileReport).includes('DIGEST_MISMATCH') && perFileReport.exitCode === 1,
      detail: `codes=[${codesOf(perFileReport)}]`,
    }));

    /* fixture: digestInputs set incomplete ----------------------------- */
    const partial = tree('partial');
    const partialManifest = JSON.parse(JSON.stringify(partial.built.manifest));
    partialManifest.digestInputs = partialManifest.digestInputs.filter((d) => !d.path.endsWith('beta.mjs'));
    const partialReport = runFixture(partial.dir, { manifestText: JSON.stringify(partialManifest), statusText });
    check('digestInputs omitting a lib module → DIGEST_SET_INCOMPLETE (and no SCRIPT_DIGEST_MISMATCH)', () => ({
      ok: codesOf(partialReport).includes('DIGEST_SET_INCOMPLETE')
        && !codesOf(partialReport).includes('SCRIPT_DIGEST_MISMATCH') && partialReport.exitCode === 1,
      detail: `codes=[${codesOf(partialReport)}]`,
    }));

    /* fixture: digestInputs order permuted (set complete) --------------- */
    const reordered = tree('reordered');
    const reorderedManifest = JSON.parse(JSON.stringify(reordered.built.manifest));
    reorderedManifest.digestInputs = [reorderedManifest.digestInputs[1], reorderedManifest.digestInputs[0], ...reorderedManifest.digestInputs.slice(2)];
    const reorderedReport = runFixture(reordered.dir, { manifestText: JSON.stringify(reorderedManifest), statusText });
    check('digestInputs set complete but order permuted → DIGEST_ORDER note, no error', () => ({
      ok: codesOf(reorderedReport).includes('DIGEST_ORDER') && reorderedReport.exitCode === 0
        && reorderedReport.findings.filter((f) => f.severity === 'error').length === 0,
      detail: `exit=${reorderedReport.exitCode} codes=[${codesOf(reorderedReport)}]`,
    }));

    /* fixture: scriptDigest wrong -------------------------------------- */
    const badScript = tree('badscript');
    const badScriptReport = runFixture(badScript.dir, {
      manifestText: JSON.stringify({ ...badScript.built.manifest, scriptDigest: `sha256:${'b'.repeat(64)}` }), statusText,
    });
    check('scriptDigest != concatenated bytes → SCRIPT_DIGEST_MISMATCH', () => ({
      ok: codesOf(badScriptReport).includes('SCRIPT_DIGEST_MISMATCH') && badScriptReport.exitCode === 1,
      detail: `codes=[${codesOf(badScriptReport)}]`,
    }));

    /* fixture: pin compared against a wrong canonical digest ------------ */
    // A pin equal to scriptDigest is the classic trap: it must still fire PIN_DRIFT.
    const trap = tree('pintrap');
    writeFileSync(join(trap.dir, 'config', 'ufo.json'),
      `${JSON.stringify({ sighting: { surfaceDigest: trap.built.manifest.scriptDigest } }, null, 2)}\n`);
    const trapReport = runFixture(trap.dir, { manifestText: JSON.stringify(trap.built.manifest, null, 2), statusText });
    check('pin set to scriptDigest (the digest trap) → PIN_DRIFT warn, exit 0 — never CLEAN-by-accident', () => ({
      ok: codesOf(trapReport).includes('PIN_DRIFT') && trapReport.verdict === 'CLEAN' && trapReport.exitCode === 0,
      detail: `verdict=${trapReport.verdict} exit=${trapReport.exitCode} codes=[${codesOf(trapReport)}]`,
    }));
    const trapStrict = runFixture(trap.dir, { manifestText: JSON.stringify(trap.built.manifest, null, 2), statusText, strict: true });
    check('--strict does NOT gate PIN_DRIFT (non-gating origin-owned warn, exit 0)', () => ({
      ok: trapStrict.exitCode === 0 && trapStrict.verdict === 'CLEAN'
        && trapStrict.totals.nonGatingWarnings === 1 && trapStrict.totals.gatingWarnings === 0
        && trapStrict.findings.filter((f) => f.kind === 'PIN_DRIFT').every((f) => f.severity === 'warn'),
      detail: `verdict=${trapStrict.verdict} exit=${trapStrict.exitCode} nonGating=${trapStrict.totals.nonGatingWarnings} gating=${trapStrict.totals.gatingWarnings}`,
    }));
    const noPin = tree('nopin');
    rmSync(join(noPin.dir, 'config', 'ufo.json'));
    const noPinReport = runFixture(noPin.dir, { manifestText: JSON.stringify(noPin.built.manifest), statusText });
    check('absent config pin → PIN_MISSING warn', () => ({
      ok: codesOf(noPinReport).includes('PIN_MISSING'),
      detail: `codes=[${codesOf(noPinReport)}]`,
    }));

    /* fixture: verb drift ---------------------------------------------- */
    const sneaky = tree('sneaky', { extraArms: ['sneaky'] });
    const sneakyReport = runFixture(sneaky.dir, { manifestText: JSON.stringify(sneaky.built.manifest), statusText });
    check('dispatch arm without a declaration → VERB_UNDECLARED', () => ({
      ok: codesOf(sneakyReport).includes('VERB_UNDECLARED') && sneakyReport.exitCode === 1,
      detail: `codes=[${codesOf(sneakyReport)}]`,
    }));
    const vanish = tree('vanish');
    const vanishReport = runFixture(vanish.dir, {
      manifestText: JSON.stringify({ ...vanish.built.manifest, verbs: { ...vanish.built.manifest.verbs, vanish: {} } }), statusText,
    });
    check('declared verb with no dispatch arm → VERB_UNDISPATCHED', () => ({
      ok: codesOf(vanishReport).includes('VERB_UNDISPATCHED') && vanishReport.exitCode === 1,
      detail: `codes=[${codesOf(vanishReport)}]`,
    }));
    const aliasOnly = runFixture(vanish.dir, { manifestText: JSON.stringify(vanish.built.manifest), statusText });
    check('trigger-alias (resolves) + __idle internal arm are never verb findings', () => ({
      ok: !codesOf(aliasOnly).includes('VERB_UNDISPATCHED') && !codesOf(aliasOnly).includes('VERB_UNDECLARED'),
      detail: `codes=[${codesOf(aliasOnly)}]`,
    }));

    /* fixture: error-code drift ---------------------------------------- */
    const undeclaredCode = tree('undeclaredcode');
    const declaredErrors = undeclaredCode.built.manifest.errors;
    const undeclaredCodeReport = runFixture(undeclaredCode.dir, {
      manifestText: JSON.stringify({ ...undeclaredCode.built.manifest, errors: declaredErrors.filter((c) => c !== 'FIXTURE_THREE') }),
      statusText,
    });
    check('fail("X") present but undeclared → ERROR_CODE_UNDECLARED', () => ({
      ok: codesOf(undeclaredCodeReport).includes('ERROR_CODE_UNDECLARED') && undeclaredCodeReport.exitCode === 1,
      detail: `codes=[${codesOf(undeclaredCodeReport)}]`,
    }));
    const phantomCode = tree('phantomcode');
    const phantomCodeReport = runFixture(phantomCode.dir, {
      manifestText: JSON.stringify({ ...phantomCode.built.manifest, errors: [...phantomCode.built.manifest.errors, 'GHOST_CODE'] }),
      statusText,
    });
    check('declared code with no fail("X") site → ERROR_CODE_PHANTOM', () => ({
      ok: codesOf(phantomCodeReport).includes('ERROR_CODE_PHANTOM') && phantomCodeReport.exitCode === 1,
      detail: `codes=[${codesOf(phantomCodeReport)}]`,
    }));
    const offManifest = tree('offmanifest', { moduleTail: 'const refusal = { code: "FIXTURE_LITERAL", message: "x" };\n' });
    const offManifestText = JSON.stringify(offManifest.built.manifest);
    const offManifestReport = runFixture(offManifest.dir, { manifestText: offManifestText, statusText });
    check('literal `code:` value outside manifest.errors → ERROR_CODE_OFF_MANIFEST warn, non-gating', () => {
      const strictRun = runFixture(offManifest.dir, { manifestText: offManifestText, statusText, strict: true });
      const finding = offManifestReport.findings.find((f) => f.kind === 'ERROR_CODE_OFF_MANIFEST');
      return {
        ok: Boolean(finding) && finding.severity === 'warn'
          && offManifestReport.exitCode === 0 && strictRun.exitCode === 0
          && offManifestReport.findings.filter((f) => f.severity === 'error').length === 0
          && /FIXTURE_LITERAL/u.test(finding.message),
        detail: `exit=${offManifestReport.exitCode} strict=${strictRun.exitCode} message=${finding ? finding.message : 'absent'}`,
      };
    });

    /* fixture: status shape -------------------------------------------- */
    const shapeTree = tree('shape');
    const shapeText = JSON.stringify({ ...fixtureStatus(), queue: 'retyped' });
    const shapeReport = runFixture(shapeTree.dir, { manifestText: JSON.stringify(shapeTree.built.manifest), statusText: shapeText });
    check('status queue retyped → STATUS_SHAPE error, exit 1', () => ({
      ok: codesOf(shapeReport).includes('STATUS_SHAPE') && shapeReport.exitCode === 1,
      detail: `codes=[${codesOf(shapeReport)}]`,
    }));
    const droppedKey = JSON.stringify((() => { const s = fixtureStatus(); delete s.ledgerRotation; return s; })());
    const droppedReport = runFixture(shapeTree.dir, { manifestText: JSON.stringify(shapeTree.built.manifest), statusText: droppedKey });
    check('status missing a top-level key → STATUS_SHAPE', () => ({
      ok: codesOf(droppedReport).includes('STATUS_SHAPE'),
      detail: `codes=[${codesOf(droppedReport)}]`,
    }));
    const extraKey = JSON.stringify({ ...fixtureStatus(), extraKey: 1 });
    const extraKeyReport = runFixture(shapeTree.dir, { manifestText: JSON.stringify(shapeTree.built.manifest), statusText: extraKey });
    check('status carrying an undeclared top-level key → STATUS_KEY_EXTRA warn, exit 0 (strict → 1)', () => {
      const strictRun = runFixture(shapeTree.dir, { manifestText: JSON.stringify(shapeTree.built.manifest), statusText: extraKey, strict: true });
      return {
        ok: codesOf(extraKeyReport).includes('STATUS_KEY_EXTRA') && extraKeyReport.exitCode === 0 && strictRun.exitCode === 1,
        detail: `exit=${extraKeyReport.exitCode} strict=${strictRun.exitCode} codes=[${codesOf(extraKeyReport)}]`,
      };
    });
    const schemaTree = tree('schema');
    const schemaReport = runFixture(schemaTree.dir, {
      manifestText: JSON.stringify(schemaTree.built.manifest),
      statusText: JSON.stringify(fixtureStatus({ queue: { schema: 'ufo-pending-work-v2' } })),
    });
    check('status queue.schema retyped → STATUS_SHAPE on STATUS_QUEUE_SCHEMA', () => ({
      ok: schemaReport.checks.some((c) => c.id === 'STATUS_QUEUE_SCHEMA' && !c.ok)
        && schemaReport.findings.some((f) => f.kind === 'STATUS_SHAPE' && f.check === 'STATUS_QUEUE_SCHEMA'),
      detail: `codes=[${codesOf(schemaReport)}]`,
    }));
    const statusGone = runFixture(shapeTree.dir, {
      manifestText: JSON.stringify(shapeTree.built.manifest),
      dispatcher: { ok: false, detail: 'dispatcher is missing: scripts/fleet-dispatcher.mjs' },
    });
    check('dispatcher absent → SURFACE_UNREACHABLE(dispatcher), exit 1 (sighting checks ran)', () => ({
      ok: statusGone.findings.some((f) => f.kind === 'SURFACE_UNREACHABLE' && f.surface === 'dispatcher')
        && statusGone.exitCode === 1,
      detail: `exit=${statusGone.exitCode} codes=[${codesOf(statusGone)}]`,
    }));
    const nonJsonStatus = runFixture(shapeTree.dir, { manifestText: JSON.stringify(shapeTree.built.manifest), statusText: 'not json' });
    check('non-JSON status → STATUS_SHAPE', () => ({
      ok: codesOf(nonJsonStatus).includes('STATUS_SHAPE'),
      detail: `codes=[${codesOf(nonJsonStatus)}]`,
    }));

    /* fixture: dispatcher-source-derived status contract ---------------- */
    const derivedTree = tree('derived');
    mkdirSync(join(derivedTree.dir, 'scripts'), { recursive: true });
    writeFileSync(join(derivedTree.dir, DISPATCHER), [
      'const QUEUE_SCHEMA = "fixture-queue-v9";',
      'function main(command) {',
      '  if (command === "status") {',
      '    output({',
      '      ok: true,',
      '      queue,',
      '      ledgerRotation: rotationSummary(),',
      '      manifest: manifestStatusBlock(),',
      '      binaryDrift: binaryDriftInfo(),',
      '      admissions: admissionLatchCensus(),',
      '    });',
      '    return;',
      '  }',
      '}',
      '',
    ].join('\n'));
    const derivedStatus = JSON.stringify({ ok: true, queue: { schema: 'fixture-queue-v9' }, ledgerRotation: {}, manifest: {}, binaryDrift: {}, admissions: {} });
    const derivedReport = runFixture(derivedTree.dir, { manifestText: JSON.stringify(derivedTree.built.manifest), statusText: derivedStatus });
    check('status contract derived from the dispatcher source (QUEUE_SCHEMA + projection keys), not the frozen list', () => {
      const checkRow = derivedReport.checks.find((c) => c.id === 'STATUS_SHAPE');
      const derived = derivedReport.findings.find((f) => f.kind === 'STATUS_KEYS_DERIVED');
      return {
        ok: Boolean(checkRow?.ok) && Boolean(derived) && derivedReport.findings.every((f) => f.kind !== 'STATUS_KEY_EXTRA'),
        detail: `statusShape=${checkRow?.ok} derived=${Boolean(derived)}`,
      };
    });
    const derivedDrift = runFixture(derivedTree.dir, {
      manifestText: JSON.stringify(derivedTree.built.manifest),
      statusText: JSON.stringify({ ...JSON.parse(derivedStatus), ledgerRotation: undefined, ghostKey: 1 }),
    });
    check('source-derived contract still catches drift (missing + extra key)', () => ({
      ok: codesOf(derivedDrift).includes('STATUS_SHAPE') && codesOf(derivedDrift).includes('STATUS_KEY_EXTRA'),
      detail: `codes=[${codesOf(derivedDrift)}]`,
    }));

    /* fixture: CLI-level paths, spawned hermetically -------------------- */
    const selfPath = fileURLToPath(import.meta.url);
    const spawnSelf = (args) => spawnSync(process.execPath, [selfPath, ...args], { encoding: 'utf8', timeout: 120_000 });
    const bogus = spawnSelf(['--bogus']);
    check('unknown flag → exit 64 (usage)', () => ({
      ok: bogus.status === 64 && /usage:/u.test(bogus.stderr ?? ''),
      detail: `exit=${bogus.status}`,
    }));
    const missingSrc = spawnSelf(['--src', '/nonexistent/kumitate-surface-probe']);
    check('--src /nonexistent → exit 2 fail-closed', () => ({
      ok: missingSrc.status === 2 && /fail-closed/u.test(missingSrc.stderr ?? ''),
      detail: `exit=${missingSrc.status}`,
    }));
    const help = spawnSelf(['--help']);
    check('--help → exit 0 with usage on stdout', () => ({
      ok: help.status === 0 && /usage:/u.test(help.stdout ?? ''),
      detail: `exit=${help.status}`,
    }));

    /* fixture: checklist mode ------------------------------------------ */
    const checklistTree = (name, body) => {
      const dir = join(tmp, name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'SKILL.md'), body);
      return dir;
    };
    const goodItem = (label, cmd, exits, expect) => `- [ ] ${label} — \`${cmd}\` → exit ${exits} + \`${expect}\``;
    const runChecklists = (root, extra = {}) => {
      const capture = [];
      const captureFindings = [];
      const code = runChecklistsMode({ self: root, json: false, strict: false, capture, captureFindings, ...extra });
      for (const f of captureFindings) observedCodes.add(f.kind);
      return { code, text: capture.join('') };
    };
    const clTree = checklistTree('checklists',
      ['# fixture SKILL', '', goodItem('echoes OK', 'node -e "console.log(\'OK\')"', '0', 'OK'),
        goodItem('either exit', 'node -e "console.log(\'ONLY1\'); process.exit(1)"', '0|1', 'ONLY1'), ''].join('\n'));
    const clRun = runChecklists(clTree);
    check('checklists: 2 valid items pass → `CHECKLIST: 2/2 pass`, `VERDICT: PASS`, exit 0', () => ({
      ok: clRun.code === 0 && clRun.text.includes('CHECKLIST: 2/2 pass') && clRun.text.includes('VERDICT: PASS')
        && clRun.text.includes('CHECKLIST_SKIPPED: 0'),
      detail: `exit=${clRun.code} tail=${clRun.text.trim().split('\n').slice(-2).join(' | ')}`,
    }));
    const clFail = checklistTree('checklists-fail',
      ['# fixture SKILL', '', goodItem('wrong exit', 'node -e "console.log(\'OK\')"', '3', 'OK'),
        goodItem('missing substring', 'node -e "console.log(\'OK\')"', '0', 'NOT-THERE'), ''].join('\n'));
    const clFailRun = runChecklists(clFail);
    check('checklists: exit-set miss and substring miss both fail → `CHECKLIST: 0/2 pass`, exit 1', () => ({
      ok: clFailRun.code === 1 && clFailRun.text.includes('CHECKLIST: 0/2 pass') && clFailRun.text.includes('VERDICT: FAIL'),
      detail: `exit=${clFailRun.code}`,
    }));
    const clSkip = checklistTree('checklists-skip',
      ['# fixture SKILL', '',
        `- [ ] self-recursive — \`node scripts/surface-probe.mjs --checklists\` → exit 0 + \`CHECKLIST\``,
        '- [x] checked — `node -e ""` → exit 0 + `x`',
        goodItem('substring check', 'node -e "console.log(\'OK\')"', '0', 'OK'), ''].join('\n'));
    const clSkipRun = runChecklists(clSkip);
    check('checklists: --checklists items are SKIP(self), - [x] lines SKIP(checked) → 1/1 pass, exit 0', () => ({
      ok: clSkipRun.code === 0 && clSkipRun.text.includes('CHECKLIST: 1/1 pass')
        && clSkipRun.text.includes('SKIP(self)') && clSkipRun.text.includes('SKIP(checked)'),
      detail: `exit=${clSkipRun.code} tail=${clSkipRun.text.trim().split('\n').find((l) => l.startsWith('CHECKLIST:'))}`,
    }));
    const clGrammar = checklistTree('checklists-grammar', '# fixture SKILL\n\n- [ ] broken item without the frozen shape\n');
    const clGrammarRun = runChecklists(clGrammar);
    check('checklists: unparsable task line → CHECKLIST_GRAMMAR error, `CHECKLIST: 0/1 pass`, exit 1', () => ({
      ok: clGrammarRun.code === 1 && clGrammarRun.text.includes('CHECKLIST: 0/1 pass')
        && /CHECKLIST\s+ERROR\s+SKILL\.md:3/u.test(clGrammarRun.text),
      detail: `exit=${clGrammarRun.code} line=${(clGrammarRun.text.split('\n').find((l) => l.includes('ERROR')) ?? '').trim()}`,
    }));
    const clEmpty = checklistTree('checklists-empty', '# fixture SKILL\n\nNothing to verify here.\n');
    const clEmptyRun = runChecklists(clEmpty);
    check('checklists: zero items → `CHECKLIST: 0/0 pass`, `VERDICT: PASS`, exit 0', () => ({
      ok: clEmptyRun.code === 0 && clEmptyRun.text.includes('CHECKLIST: 0/0 pass') && clEmptyRun.text.includes('VERDICT: PASS'),
      detail: `exit=${clEmptyRun.code}`,
    }));
    const clNoSkill = join(tmp, 'checklists-noskill');
    mkdirSync(clNoSkill, { recursive: true });
    const clNoSkillRun = runChecklists(clNoSkill);
    check('checklists: missing SKILL.md → fail-closed `CHECKLIST: FAIL-CLOSED`, exit 2', () => ({
      ok: clNoSkillRun.code === 2 && clNoSkillRun.text.includes('CHECKLIST: FAIL-CLOSED (SKILL.md missing)'),
      detail: `exit=${clNoSkillRun.code}`,
    }));
    const clBadSelf = join(tmp, 'checklists-not-a-dir');
    writeFileSync(clBadSelf, 'not a directory\n');
    const clBadSelfRun = runChecklists(clBadSelf);
    check('checklists: --self is a file → fail-closed exit 2', () => ({
      ok: clBadSelfRun.code === 2,
      detail: `exit=${clBadSelfRun.code}`,
    }));
    if (process.env.KUMITATE_SURFACE_PROBE_NESTED === '1') {
      results.push({ name: 'hermeticity: nested --selftest under a bogus --src', ok: true, skipped: true,
        detail: 'SKIP(nested) — the parent run already spawned this suite once' });
    } else {
      const nested = spawnSync(process.execPath, [selfPath, '--selftest', '--src', '/nonexistent/kumitate-surface-probe'],
        { encoding: 'utf8', timeout: 180_000, env: { ...process.env, KUMITATE_SURFACE_PROBE_NESTED: '1' } });
      check('hermeticity: --selftest passes with a bogus --src (never reads the live tree)', () => ({
        ok: nested.status === 0 && /VERDICT: PASS/u.test(nested.stdout ?? ''),
        detail: `exit=${nested.status} tail=${(nested.stdout ?? '').trim().split('\n').at(-2) ?? ''}`,
      }));
    }

    /* fixture: code coverage meta-check -------------------------------- */
    check('every declared finding code fires in at least one fixture', () => {
      const missing = SUITE_CODES.filter((c) => !observedCodes.has(c));
      return { ok: missing.length === 0, detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observedCodes.size} codes observed` };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  const verdict = failed.length ? 'FAIL' : 'PASS';
  const lines = ['kumitate surface-probe --selftest (hermetic)'];
  for (const r of results) lines.push(`${r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`);
  lines.push(`${results.length - failed.length}/${results.length} cases passed`);
  lines.push(`VERDICT: ${verdict}`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return verdict === 'FAIL' ? 1 : 0;
}

/* --------------------------------------------------------------------- main */

function parseArgs(argv) {
  const opts = {
    src: DEFAULT_SRC, self: DEFAULT_SELF, json: false, strict: false, checklists: false, selfTest: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const need = (name) => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`${name} requires a directory`);
      return resolve(v);
    };
    if (a === '--src') opts.src = need(a);
    else if (a === '--self') opts.self = need(a);
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--checklists') opts.checklists = true;
    else if (a === '--selftest' || a === '--self-test') opts.selfTest = true;
    else if (a === '-h' || a === '--help') { process.stdout.write(USAGE); return null; }
    else throw new Error(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`surface-probe: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts === null) return 0;
  // --selftest is hermetic: it never reads --src or --self, so both are ignored.
  if (opts.selfTest) return selfTest();
  if (opts.checklists) return runChecklistsMode(opts);

  const kind = statKind(opts.src);
  if (kind !== 'dir') {
    process.stderr.write(`surface-probe: fail-closed — --src ${opts.src} is ${kind}\n`);
    process.stdout.write(`SURFACE_PROBE: FAIL-CLOSED (--src ${opts.src} is ${kind})\n`);
    return 2;
  }

  const report = probeConformance({ src: opts.src, strict: opts.strict });
  report.self = opts.self;
  report.options = { strict: opts.strict, checklists: false, selftest: false };
  if (opts.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(renderText(report));
  return report.exitCode;
}

process.exitCode = main();