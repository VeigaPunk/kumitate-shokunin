#!/usr/bin/env node
/**
 * omp-census.mjs — kumitate-omp-census-v1
 *
 * A gate over the OMP harness agent root (default `$HOME/.omp/agent`). It reads the
 * SHAPE of that root — depth-1 names, kinds and permission bits — and decides CLEAN or
 * DRIFT from per-member rules. It never opens, reads or hashes a member's content: the
 * census path uses `readdir` of the root and `lstat` of each entry, nothing else.
 *
 * Contract (kumitate-omp-census-v1):
 *   node scripts/omp-census.mjs [--root DIR] [--self DIR] [--note FILE]
 *     default root = $HOME/.omp/agent; note = <self>/corpus/knowledge/omp-agent-root.md
 *   node scripts/omp-census.mjs --selftest [--work DIR]
 *   node scripts/omp-census.mjs --snapshot FILE [--root DIR]
 *   node scripts/omp-census.mjs --shape FILE [--self DIR] [--note FILE]
 *     kumitate-omp-shape-v1: canonical, content-free depth-1 receipt; atomic write.
 *     Invalid/unreadable receipts fail closed with SHAPE_INVALID/SHAPE_NOT_FOUND.
 *   node scripts/omp-census.mjs --compare FILE [--root DIR]
 *     Non-scoring live-vs-receipt diagnostic: names, kinds and modes only.
 *     One OMP_SHAPE_COMPARE line; exit 0 in sync, 1 drift, 2 fail-closed.
 *     agent.db-{shm,wal,journal} are transient in this diagnostic only: excluded
 *     from differences; transient counts distinct names in either shape.
 *     Exclusive with --snapshot/--shape/--selftest and --self/--note.
 *
 * Exit codes:
 *   0   exactly one stdout line `OMP_CENSUS: CLEAN (...)`
 *   1   exactly one stdout line `OMP_CENSUS: DRIFT (...)`, preceded by finding lines
 *       such as `UNLISTED <name>`, `KIND <name> want=dir got=file`,
 *       `MODE <name> want<=0600 got=0604`
 *   2   fail-closed: the root or binding note is unreadable (`NOTE_MISSING` for
 *       a missing/unreadable note). Never CLEAN.
 *   64  usage error
 *
 * `--selftest` runs a hermetic suite over temporary fixture roots (never the live root)
 * and ends with `VERDICT: PASS` (exit 0) or `VERDICT: FAIL` (exit 1). Every rule has a
 * case whose assertion names that rule's finding, so dropping the rule turns the case red.
 *
 * Decisions recorded here (see the seat report for the justification):
 *   - A member or chain generation that is ABSENT from the root is INFO, never DRIFT:
 *     the harness creates members lazily (an `mcp.json` exists only once a server
 *     plane is configured), so absence is not evidence of breakage.
 *   - An EMPTY root is DRIFT (`EMPTY`): a root with no member at all is not a healthy
 *     harness root and must not be reported CLEAN. The census never passes an empty or
 *     unreadable root silently.
 *   - An unreadable root is exit 2 (fail-closed), never CLEAN.
 *   - The permission rule is a CEILING: a member is DRIFT when its mode carries a bit the
 *     ceiling does not allow (`got & ~want != 0`). A member whose mode is a subset of the
 *     ceiling is fine.
 */

import {
  chmodSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Rules. Each rule cites the `corpus/SOURCES.md` row it rests on (S053-S061, opened in
// round 44; oh-my-pi rows are pinned at v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99). Rules are anchored to a member name (exact)
// or to a chain template owned by a member; a chain template is the owning member's
// name plus a placeholder (UTC stamp, epoch milliseconds + UUID, 64-hex digest).
// ---------------------------------------------------------------------------

/** Base members: exact name, kind, permission ceiling. */
export const BASE_MEMBERS = [
  { name: 'RULES.md', kind: 'file', mode: 0o644, note: 'user rules file OMP reads from the agent root' }, // source: S060 (discovery/builtin.ts:423 reads it; no upstream writer: operator-authored)
  { name: 'agent.db', kind: 'file', mode: 0o600, note: 'OMP settings and auth database' }, // source: S053 (dirs.ts:952-955) + S055 (chmod 0o600)
  { name: 'agents', kind: 'dir', mode: 0o755, note: 'user agent definitions' }, // source: S060 (cli/agents-cli.ts:52)
  { name: 'blobs', kind: 'dir', mode: 0o755, note: 'session blob store' }, // source: S053 (dirs.ts agentSubdir blobs)
  { name: 'cache', kind: 'dir', mode: 0o755, note: 'harness cache' }, // source: S053 (dirs.ts:972-983)
  { name: 'config.yml', kind: 'file', mode: 0o600, note: 'OMP harness configuration' }, // source: S060 (config/settings.ts:3571 open 0o600)
  { name: 'custom-session-files', kind: 'dir', mode: 0o755, note: 'markers for --session-dir/--session transcripts' }, // source: S053 (dirs.ts:1042-1050)
  { name: 'history.db', kind: 'file', mode: 0o644, note: 'session history database' }, // source: S053 (dirs.ts:962-965); no chmod upstream, so umask 0644
  { name: 'hooks', kind: 'dir', mode: 0o755, note: 'user hook scripts' }, // source: S060 (discovery/builtin.ts:720 reads it; no upstream writer)
  { name: 'kimi-device-id', kind: 'file', mode: 0o600, note: 'Kimi OAuth device identity' }, // source: S060 (ai/src/registry/oauth/kimi.ts:12,47 mode 0o600)
  { name: 'last-changelog-version', kind: 'file', mode: 0o644, note: 'last seen OMP version marker' }, // source: S053 (dirs.ts:957-960)
  { name: 'lsp.json', kind: 'file', mode: 0o600, note: 'native agent dir user-wide LSP config' }, // source: S224
  { name: 'mcp.json', kind: 'file', mode: 0o600, note: 'MCP server definitions' }, // source: S060 (mcp/config-writer.ts:71 mode 0o600)
  { name: 'mcp.json.rea.backup', kind: 'file', mode: 0o600, note: 'REA first backup of the MCP server definitions' }, // source: S057 (REA first backup `<config>.rea.backup`)
  { name: 'models.db', kind: 'file', mode: 0o644, note: 'model cache database' }, // source: S053 (dirs.ts:967-970); no chmod upstream, so umask 0644
  { name: 'models.yml', kind: 'file', mode: 0o644, note: 'custom providers and models' }, // source: S060 (config/model-registry.ts:542)
  { name: 'predict', kind: 'dir', mode: 0o755, note: 'text-predict engine state' }, // source: S053 (dirs.ts:989-991)
  { name: 'sessions', kind: 'dir', mode: 0o755, note: 'session directories' }, // source: S053 (dirs.ts agentSubdir sessions)
  { name: 'skill-descriptions.db', kind: 'file', mode: 0o600, note: 'skill descriptions database' }, // source: S053 (dirs.ts:984-987)
  { name: 'terminal-sessions', kind: 'dir', mode: 0o755, note: 'terminal session breadcrumbs' }, // source: S053 (dirs.ts:1037-1040)
  // Optional harness subdirectories (agentSubdir). Absent is INFO, never drift: the harness
  // creates them on demand. Each is gated by exact name, kind and permission ceiling.
  { name: 'themes', kind: 'dir', mode: 0o755, note: 'optional harness subdirectory (agentSubdir)' }, // source: S053 (dirs.ts:1007-1035 agentSubdir)
  { name: 'tools', kind: 'dir', mode: 0o755, note: 'optional harness subdirectory (agentSubdir)' }, // source: S053 (dirs.ts:1007-1035 agentSubdir)
  { name: 'commands', kind: 'dir', mode: 0o755, note: 'optional harness subdirectory (agentSubdir)' }, // source: S053 (dirs.ts:1007-1035 agentSubdir)
  { name: 'prompts', kind: 'dir', mode: 0o755, note: 'optional harness subdirectory (agentSubdir)' }, // source: S053 (dirs.ts:1007-1035 agentSubdir)
  { name: 'memories', kind: 'dir', mode: 0o755, note: 'optional harness subdirectory (agentSubdir)' }, // source: S053 (dirs.ts:1007-1035 agentSubdir)
  { name: 'extensions', kind: 'dir', mode: 0o755, note: 'user extension modules OMP discovers' }, // source: S060 (discovery/builtin.ts:516,608 reads <agent dir>/extensions); S059 (cmux docs) rejected as its source
];

/**
 * Chain families: a template anchored to its owning member. A family may hold any
 * number of generations; each generation is optional. A chain may also carry the
 * SQLite sidecars `-shm` / `-wal`, which are optional too.
 */
export const CHAIN_FAMILIES = [
  { id: 'agent-pre-restore', owner: 'agent.db', re: /^agent\.db\.pre-restore-\d{8}T\d{6}Z$/, kind: 'file', mode: 0o600, note: 'agent.db snapshot taken by the operator before a restore (not an OMP writer)' }, // source: S058 (fleet PHASE4.md:112 recovery record)
  { id: 'agent-recovered', owner: 'agent.db', re: /^agent\.db\.recovered-\d{8}T\d{6}Z$/, kind: 'file', mode: 0o600, note: 'agent.db rebuilt by the operator with sqlite3 .recover (not an OMP writer)' }, // source: S058 (fleet PHASE4.md:112 recovery record)
  { id: 'history-corrupt', owner: 'history.db', re: /^history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, kind: 'file', mode: 0o600, note: 'history.db quarantined after a corruption, epoch ms + uuid' }, // source: S054 (sqlite.ts:193, chmod 0o600 at :197-199)
  { id: 'agent-corrupt', owner: 'agent.db', re: /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, kind: 'file', mode: 0o600, note: 'agent.db quarantined after a corruption, epoch ms + uuid' }, // source: S054 (sqlite.ts:193) + S055 (recoverCorruption for agent.db)
  { id: 'mcp-pre-disable', owner: 'mcp.json', re: /^mcp\.json\.pre-disable-\d{8}T\d{4}$/, kind: 'file', mode: 0o600, note: 'operator pre-edit copy of mcp.json (not an OMP writer)' }, // source: S061 (fleet lane-addendum.md:82-84)
  { id: 'mcp-rea-backup-recovery', owner: 'mcp.json.rea.backup', re: /^mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery$/, kind: 'file', mode: 0o600, note: 'REA backup recovery copy, 64-hex digest' }, // source: S057 (SetupRecoveryBackup.js:36)
  { id: 'config-pre', owner: 'config.yml', re: /^config\.yml\.pre-[a-z0-9][a-z0-9-]*-20\d{6}$/, kind: 'file', mode: 0o600, note: 'operator pre-edit copies of the harness config' }, // source: S225
  { id: 'agent-pre-named', owner: 'agent.db', re: /^agent\.db\.pre-[a-z0-9][a-z0-9-]*-20\d{6}$/, kind: 'file', mode: 0o600, note: 'operator pre-edit copies of the credentials/settings database' }, // source: S225; UTC restore/recovered forms do not match
  { id: 'models-corrupt', owner: 'models.db', re: /^models\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, kind: 'file', mode: 0o600, note: 'generic SQLite quarantine template applied to the model-cache store' }, // source: S054; live artifact corroborates; per-store opt-in not located
];

/** SQLite sidecar suffixes of a member or of a chain generation. Optional. */
const SIDECAR_RE = /-(shm|wal)$/; // source: S054 (sqlite.ts:12 SQLITE_STORE_SUFFIXES) + S056 (SQLite WAL: sidecars come and go)

const BASE_BY_NAME = new Map(BASE_MEMBERS.map((r) => [r.name, r]));
const DECLARED_NAMES = [...BASE_MEMBERS.map((r) => r.name), ...CHAIN_FAMILIES.map((r) => r.id)];

/**
 * Binding is by VISIBLE identifier token, not by substring (round-75 critic counterexample:
 * a note whose only content is an HTML comment listing every name read `bound=35/35`).
 * HTML comments render nothing, so they are stripped before the scan, and a name must be
 * delimited by a non-identifier character on both sides (so `NOT_A_BINDING_models.db_SUFFIX`
 * binds nothing). A fenced code block is visible text and still binds.
 */
function visibleNoteText(text) {
  return text.replace(/<!--[\s\S]*?-->/gu, '\n');
}
const BIND_EDGE = '[^\\w.\\-]';
function bindsName(visible, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return new RegExp(`(?:^|${BIND_EDGE})${escaped}(?:$|${BIND_EDGE})`, 'u').test(visible);
}
const DEFAULT_SELF = fileURLToPath(new URL('../', import.meta.url));

// ---------------------------------------------------------------------------
// Shape reading. `readdir` of the root, `lstat` of each entry: names, kinds and
// permission bits only. No member content is opened.
// ---------------------------------------------------------------------------

const KIND_OF = (st) => (st.isDirectory() ? 'dir'
  : st.isFile() ? 'file'
    : st.isSymbolicLink() ? 'symlink' : 'other');

function oct4(mode) { return (mode & 0o7777).toString(8).padStart(4, '0'); }

/** Read the depth-1 shape of `root`. Throws on an unreadable root (fail-closed). */
function readShape(root) {
  const st = lstatSync(root);
  if (!st.isDirectory()) {
    const e = new Error(`root is not a directory: ${root}`);
    e.code = 'ENOTDIR';
    throw e;
  }
  const names = readdirSync(root).sort();
  const entries = [];
  for (const name of names) {
    const mst = lstatSync(join(root, name));
    entries.push({ name, kind: KIND_OF(mst), mode: mst.mode & 0o777 });
  }
  return entries;
}

const SHAPE_CONTRACT = 'kumitate-omp-shape-v2';
const LEGACY_SHAPE_CONTRACT = 'kumitate-omp-shape-v1';
const ISO_SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;

function validateShape(doc) {
  const keys = doc && typeof doc === 'object' ? Object.keys(doc).sort().join(',') : '';
  const legacy = doc && doc.contract === LEGACY_SHAPE_CONTRACT && keys === 'contract,entries';
  const current = doc && doc.contract === SHAPE_CONTRACT && keys === 'captured_at,contract,entries'
    && typeof doc.captured_at === 'string' && ISO_SECOND.test(doc.captured_at)
    && !Number.isNaN(Date.parse(doc.captured_at));
  if (!legacy && !current) {
    throw Object.assign(new Error('invalid shape contract, captured_at or entries'), { code: 'SHAPE_INVALID' });
  }
  if (!Array.isArray(doc.entries) || !doc.entries.length) {
    throw Object.assign(new Error('invalid shape contract or entries'), { code: 'SHAPE_INVALID' });
  }
  let previous = null;
  for (const e of doc.entries) {
    if (!e || Object.keys(e).sort().join(',') !== 'kind,mode,name'
        || typeof e.name !== 'string' || !e.name || /[/\\\0]/u.test(e.name)
        || e.name === '.' || e.name === '..' || (previous !== null && previous >= e.name)
        || !['file', 'dir', 'symlink'].includes(e.kind)
        || !Number.isInteger(e.mode) || e.mode < 0 || e.mode > 0o777) {
      throw Object.assign(new Error('invalid or unsorted shape entry'), { code: 'SHAPE_INVALID' });
    }
    previous = e.name;
  }
  return doc.entries;
}

/** Read the receipt document (contract + captured_at + entries); never follows its names. */
export function readShapeDoc(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch {
    throw Object.assign(new Error(`cannot read ${file}`), { code: 'SHAPE_NOT_FOUND' });
  }
  let doc;
  try { doc = JSON.parse(text); } catch {
    throw Object.assign(new Error('malformed shape JSON'), { code: 'SHAPE_INVALID' });
  }
  validateShape(doc);
  return doc;
}

/** Read only the entries of the receipt; never follow its names into the live agent root. */
export function shapeFromFile(file) {
  return readShapeDoc(file).entries;
}

/** Whole days between the receipt's capture instant and `now` (0 for the same day). */
export function receiptAgeDays(doc, now = Date.now()) {
  const captured = Date.parse(doc.captured_at);
  return Math.floor((now - captured) / 86400000);
}

function snapshot(root, file, io, now = new Date()) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  try {
    const entries = readShape(root);
    const captured_at = now.toISOString().replace(/\.\d{3}Z$/u, 'Z');
    validateShape({ contract: SHAPE_CONTRACT, captured_at, entries });
    const bytes = `${JSON.stringify({ contract: SHAPE_CONTRACT, captured_at, entries }, null, 2)}\n`;
    writeFileSync(tmp, bytes, { flag: 'wx', mode: 0o600 });
    renameSync(tmp, file);
    const digest = createHash('sha256').update(bytes).digest('hex');
    io.out(`OMP_SNAPSHOT: WROTE entries=${entries.length} sha256=${digest} path=${file}`);
    return 0;
  } catch (e) {
    io.err(`OMP_SNAPSHOT: ERROR reason=${e.code || e.message}`);
    return 2;
  } finally {
    rmSync(tmp, { force: true });
  }
}

/**
 * Compare only depth-1 metadata; neither member content nor census rules apply.
 * Round 82: the receipt's own capture instant is disclosed on the compare line, and an
 * opt-in `--max-age DAYS` gates a receipt that has aged past the caller's bound. The age
 * never scores (the census verdict is unchanged); a legacy v1 receipt carries no instant,
 * so a caller that names a bound gets `SHAPE_AGE_UNKNOWN` rather than a guessed age.
 */
function compareShape(root, file, io, maxAge = null) {
  let doc;
  try { doc = readShapeDoc(file); } catch (e) {
    io.out(e.code);
    return 2;
  }
  const receipt = doc.entries;
  const captured = typeof doc.captured_at === 'string' ? doc.captured_at : null;
  const ageDays = captured === null ? null : receiptAgeDays(doc);
  const stamp = `receipt_captured=${captured === null ? 'absent' : captured.slice(0, 10)} age_days=${ageDays === null ? 'absent' : ageDays}`;
  if (maxAge !== null) {
    if (ageDays === null) {
      io.out(`OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=${maxAge}`);
      return 2;
    }
    if (ageDays < 0) {
      io.out(`OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=${ageDays} max_age=${maxAge}`);
      return 2;
    }
    if (ageDays > maxAge) {
      io.out(`OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=${receipt.length} age_days=${ageDays} max_age=${maxAge}`);
      return 1;
    }
  }
  let live;
  try { live = readShape(root); } catch {
    io.out('ROOT_NOT_A_DIR');
    return 2;
  }
  const isTransient = (name) => /^agent\.db-(?:shm|wal|journal)$/u.test(name);
  const transients = new Set();
  const remaining = new Map(receipt.map((entry) => [entry.name, entry]));
  const differences = [];
  for (const name of remaining.keys()) {
    if (isTransient(name)) {
      transients.add(name);
      remaining.delete(name);
    }
  }
  let added = 0;
  let changed = 0;
  for (const entry of live) {
    if (isTransient(entry.name)) {
      transients.add(entry.name);
      continue;
    }
    const prior = remaining.get(entry.name);
    if (!prior) {
      added++;
      differences.push(entry.name);
    } else if (entry.kind !== prior.kind || (entry.mode & 0o777) !== (prior.mode & 0o777)) {
      changed++;
      differences.push(entry.name);
    }
    remaining.delete(entry.name);
  }
  const removed = remaining.size;
  differences.push(...remaining.keys());
  // LC_ALL=C compares UTF-8 bytes, not locale collation or UTF-16 code units.
  differences.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const drift = differences.length > 0;
  io.out(`OMP_SHAPE_COMPARE: ${drift ? 'DRIFT' : 'IN_SYNC'} entries=${live.length} receipt=${receipt.length} added=${added} removed=${removed} changed=${changed}${drift ? ` first=${differences[0]}` : ''} transient=${transients.size} ${stamp}`);
  return drift ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Rule matching
// ---------------------------------------------------------------------------

function matchFamily(name) {
  for (const fam of CHAIN_FAMILIES) {
    if (fam.re.test(name)) return fam;
  }
  return null;
}

/**
 * Resolve one entry name to the rule that governs it, or null when no rule covers it.
 * A sidecar is governed by the rule of the member it shadows: a base member, or the
 * chain generation whose name it repeats.
 */
function ruleFor(name) {
  const base = BASE_BY_NAME.get(name);
  if (base) return { kind: base.kind, mode: base.mode, via: 'base member', owner: base.name };

  const side = SIDECAR_RE.exec(name);
  if (side) {
    const stem = name.slice(0, name.length - side[0].length);
    const stemBase = BASE_BY_NAME.get(stem);
    if (stemBase) {
      return { kind: 'file', mode: stemBase.mode, via: `sidecar of ${stemBase.name}`, owner: stemBase.name };
    }
    const stemFam = matchFamily(stem);
    if (stemFam) {
      return { kind: 'file', mode: stemFam.mode, via: `sidecar of ${stemFam.id}`, owner: stemFam.owner };
    }
    return null;
  }

  const fam = matchFamily(name);
  if (fam) return { kind: fam.kind, mode: fam.mode, via: `chain ${fam.id}`, owner: fam.owner };

  return null;
}

/**
 * Decide the census for one root.
 * Returns { verdict, findings[], infos[], counts }.
 */
export function census(root, noteText) {
  return censusEntries(readShape(root), noteText);
}

/** Apply exactly the live census rules and binding to an already-read shape. */
export function censusEntries(entries, noteText) {
  const findings = [];
  const infos = [];
  const present = new Set(entries.map((e) => e.name));

  if (entries.length === 0) {
    findings.push('EMPTY root holds no member');
  }

  for (const e of entries) {
    const rule = ruleFor(e.name);
    if (!rule) {
      findings.push(`UNLISTED ${e.name}`);
      continue;
    }
    if (rule.kind !== e.kind) {
      findings.push(`KIND ${e.name} want=${rule.kind} got=${e.kind}`);
      continue;
    }
    if ((e.mode & ~rule.mode) !== 0) {
      findings.push(`MODE ${e.name} want<=${oct4(rule.mode)} got=${oct4(e.mode)}`);
    }
  }

  for (const r of BASE_MEMBERS) {
    if (!present.has(r.name)) infos.push(`INFO ${r.name} absent`);
  }
  for (const fam of CHAIN_FAMILIES) {
    const hasGeneration = entries.some((e) => matchFamily(e.name) === fam);
    if (!hasGeneration) infos.push(`INFO chain ${fam.id} has no generation`);
  }

  let bound = 0;
  const visible = visibleNoteText(noteText);
  for (const name of DECLARED_NAMES) {
    if (bindsName(visible, name)) bound++;
    else findings.push(`NOTE_UNBOUND ${name}`);
  }

  const verdict = findings.length === 0 ? 'CLEAN' : 'DRIFT';
  return {
    verdict,
    findings,
    infos,
    counts: { entries: entries.length, base: BASE_MEMBERS.length, families: CHAIN_FAMILIES.length, bound, declared: DECLARED_NAMES.length },
  };
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------

const USAGE = 'usage: node scripts/omp-census.mjs [--root DIR] [--self DIR] [--note FILE] | --snapshot FILE [--root DIR] | --shape FILE [--max-age DAYS] [--self DIR] [--note FILE] | --compare FILE [--root DIR] [--max-age DAYS] | --selftest [--work DIR]';

function parseArgs(argv) {
  const o = { root: null, self: DEFAULT_SELF, note: null, snapshot: null, shape: null, compare: null, maxAge: null, selftest: false, work: null };
  let bindingSpecified = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') {
      if (i + 1 >= argv.length) return { error: '--root needs a directory argument' };
      o.root = argv[++i];
    } else if (a.startsWith('--root=')) {
      o.root = a.slice('--root='.length);
    } else if (a === '--snapshot' || a === '--shape' || a === '--compare' || a === '--self' || a === '--note') {
      if (i + 1 >= argv.length) return { error: `${a} needs a path argument` };
      if (a === '--self' || a === '--note') bindingSpecified = true;
      o[a.slice(2)] = argv[++i];
    } else if (['--snapshot=', '--shape=', '--compare=', '--self=', '--note='].some((prefix) => a.startsWith(prefix))) {
      const eq = a.indexOf('=');
      if (a.startsWith('--self=') || a.startsWith('--note=')) bindingSpecified = true;
      o[a.slice(2, eq)] = a.slice(eq + 1);
    } else if (a === '--max-age') {
      if (i + 1 >= argv.length) return { error: '--max-age needs a day count' };
      o.maxAge = Number(argv[++i]);
    } else if (a.startsWith('--max-age=')) {
      o.maxAge = Number(a.slice('--max-age='.length));
    } else if (a === '--selftest') {
      o.selftest = true;
    } else if (a === '--work') {
      if (i + 1 >= argv.length) return { error: '--work needs a directory argument' };
      o.work = argv[++i];
    } else if (a === '--help' || a === '-h') {
      return { error: null, help: true };
    } else {
      return { error: `unknown argument ${a}` };
    }
  }
  if ([o.snapshot !== null, o.shape !== null, o.compare !== null, o.selftest].filter(Boolean).length > 1
      || (o.shape !== null && o.root !== null)
      || (o.compare !== null && bindingSpecified)) return { error: 'incompatible modes' };
  for (const key of ['snapshot', 'shape', 'compare']) {
    if (o[key] !== null && (!o[key] || o[key].startsWith('-'))) return { error: `--${key} needs a file argument` };
  }
  if (o.maxAge !== null && (!Number.isInteger(o.maxAge) || o.maxAge < 0)) return { error: '--max-age must be a non-negative integer' };
  if (o.maxAge !== null && o.shape === null && o.compare === null) return { error: '--max-age is only meaningful with --shape or --compare' };
  return o;
}

/**
 * Run the census for one root and render it.
 * `io` is { out, err } so the selftest can capture output without a child process.
 */
function runCensus(root, io, note = join(DEFAULT_SELF, 'corpus', 'knowledge', 'omp-agent-root.md')) {
  let noteText;
  try {
    noteText = readFileSync(note, 'utf8');
  } catch (e) {
    io.err(`NOTE_MISSING ${note} reason=${e.code || e.message}`);
    return 2;
  }
  let res;
  try {
    res = census(root, noteText);
  } catch (e) {
    io.err(`OMP_CENSUS: ERROR root=${root} reason=${e.code || e.message}`);
    return 2;
  }
  for (const i of res.infos) io.out(i);
  for (const f of res.findings) io.out(f);
  const binding = res.verdict === 'CLEAN' ? ` bound=${res.counts.bound}/${res.counts.declared}` : '';
  io.out(`OMP_CENSUS: ${res.verdict} (root=${root} entries=${res.counts.entries} findings=${res.findings.length}${binding})`);
  return res.verdict === 'CLEAN' ? 0 : 1;
}

function runShape(file, io, note, maxAge = null) {
  let doc;
  try { doc = readShapeDoc(file); } catch (e) {
    io.out(e.code);
    return 2;
  }
  if (doc.contract !== SHAPE_CONTRACT) {
    io.out(`SHAPE_VERSION want=${SHAPE_CONTRACT} got=${doc.contract}`);
    return 2;
  }
  const age = receiptAgeDays(doc);
  if (age < 0) {
    io.out(`SHAPE_CLOCK captured_at=${doc.captured_at} is in the future`);
    return 2;
  }
  let stale = false;
  if (maxAge !== null && age > maxAge) {
    stale = true;
    io.out(`SHAPE_STALE age_days=${age} max_age=${maxAge}`);
  }
  const entries = doc.entries;
  let noteText;
  try { noteText = readFileSync(note, 'utf8'); } catch (e) {
    io.err(`NOTE_MISSING ${note} reason=${e.code || e.message}`);
    return 2;
  }
  const res = censusEntries(entries, noteText);
  for (const f of res.findings) io.out(f);
  const binding = res.verdict === 'CLEAN' ? ` bound=${res.counts.bound}/${res.counts.declared}` : '';
  io.out(`OMP_CENSUS: ${res.verdict} (source=snapshot entries=${res.counts.entries} findings=${res.findings.length}${binding} captured=${doc.captured_at.slice(0, 10)} age_days=${age})`);
  return res.verdict === 'CLEAN' && !stale ? 0 : 1;
}

// ---------------------------------------------------------------------------
// Selftest: hermetic fixture roots under a scratch directory. Fixture files are
// created empty; the census never reads a member's content, and the fixtures are
// removed when the suite ends.
// ---------------------------------------------------------------------------

const FIXTURE = [
  { name: 'RULES.md', kind: 'file', mode: 0o644 },
  { name: 'agent.db', kind: 'file', mode: 0o600 },
  { name: 'agent.db-wal', kind: 'file', mode: 0o600 },
  { name: 'agent.db.pre-restore-20260101T010101Z', kind: 'file', mode: 0o600 },
  { name: 'agent.db.pre-restore-20260101T010101Z-shm', kind: 'file', mode: 0o600 },
  { name: 'agents', kind: 'dir', mode: 0o755 },
  { name: 'config.yml', kind: 'file', mode: 0o600 },
  { name: 'history.db', kind: 'file', mode: 0o644 },
  { name: 'history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b', kind: 'file', mode: 0o600 },
  { name: 'mcp.json', kind: 'file', mode: 0o600 },
  { name: 'mcp.json.rea.backup', kind: 'file', mode: 0o600 },
  { name: 'mcp.json.rea.backup.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.recovery', kind: 'file', mode: 0o600 },
  { name: 'models.db', kind: 'file', mode: 0o644 },
];

function materialise(dir, entries) {
  mkdirSync(dir, { recursive: true, mode: 0o755 });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.kind === 'dir') mkdirSync(p, { mode: 0o755 });
    else writeFileSync(p, '', { mode: 0o600 });
    chmodSync(p, e.mode);
  }
}

function selftest(work, io) {
  const base = work || process.env.OMP_CENSUS_SELFTEST_DIR || tmpdir();
  if (work) mkdirSync(work, { recursive: true });
  const scratch = mkdtempSync(join(base, 'omp-census-selftest-'));
  const note = join(scratch, 'note.md');
  writeFileSync(note, DECLARED_NAMES.join('\n'));
  const failures = [];
  let ran = 0;

  const capture = (argv) => {
    const out = [];
    const err = [];
    const ioCapture = { out: (s) => out.push(s), err: (s) => err.push(s) };
    const code = argv.compare
      ? compareShape(argv.root, argv.compare, ioCapture, argv.maxAge ?? null)
      : argv.shape
        ? runShape(argv.shape, ioCapture, argv.note ?? note, argv.maxAge)
        : runCensus(argv.root, ioCapture, argv.note ?? note);
    return { code, stdout: out.join('\n'), stderr: err.join('\n') };
  };

  const check = (name, argv, want) => {
    ran++;
    const r = capture(argv);
    const problems = [];
    if (r.code !== want.code) problems.push(`exit ${r.code} want ${want.code}`);
    const output = `${r.stdout}\n${r.stderr}`;
    for (const line of want.has || []) {
      if (!output.includes(line)) problems.push(`missing ${JSON.stringify(line)}`);
    }
    for (const line of want.lacks || []) {
      if (output.includes(line)) problems.push(`unexpected ${JSON.stringify(line)}`);
    }
    if (problems.length) {
      failures.push(`${name}: ${problems.join('; ')}`);
      io.out(`SELFTEST FAIL ${name}: ${problems.join('; ')}`);
    } else {
      io.out(`SELFTEST ok ${name}`);
    }
  };

  const fixtureCase = (name, mutate, want) => {
    const dir = join(scratch, name);
    const entries = mutate(FIXTURE.map((e) => ({ ...e })));
    materialise(dir, entries);
    check(name, { root: dir }, want);
  };

  const without = (list, name) => list.filter((e) => e.name !== name);
  const replace = (list, name, patch) => list.map((e) => (e.name === name ? { ...e, ...patch } : e));

  // Baseline: the fixture is a healthy root.
  fixtureCase('clean-fixture', (l) => l, { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: ['OMP_CENSUS: DRIFT'] });

  // Rule: base member kind.
  fixtureCase('kind-base-dir-as-file', (l) => replace(l, 'agents', { kind: 'file' }),
    { code: 1, has: ['KIND agents want=dir got=file', 'OMP_CENSUS: DRIFT'], lacks: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('kind-base-file-as-dir', (l) => replace(l, 'agent.db', { kind: 'dir' }),
    { code: 1, has: ['KIND agent.db want=file got=dir', 'OMP_CENSUS: DRIFT'] });

  // Rule: base member permission ceiling.
  fixtureCase('mode-base-too-wide', (l) => replace(l, 'agent.db', { mode: 0o604 }),
    { code: 1, has: ['MODE agent.db want<=0600 got=0604', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('mode-base-narrower-is-fine', (l) => replace(l, 'models.db', { mode: 0o600 }),
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });

  // Rule: a name no rule covers.
  fixtureCase('unlisted-name', (l) => [...l, { name: 'stray-note.txt', kind: 'file', mode: 0o644 }],
    { code: 1, has: ['UNLISTED stray-note.txt', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('unlisted-chain-on-another-owner', (l) => [...l, { name: 'RULES.md.pre-restore-20260101T010101Z', kind: 'file', mode: 0o600 }],
    { code: 1, has: ['UNLISTED RULES.md.pre-restore-20260101T010101Z', 'OMP_CENSUS: DRIFT'] });

  // Rule: chain family generations are accepted, fresh ones included.
  fixtureCase('chain-generation-fresh', (l) => [...l, { name: 'agent.db.pre-restore-20260202T020202Z', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('chain-generation-fresh-uuid', (l) => [...l, { name: 'history.db.corrupt-1792715399999-11111111-2222-4333-8444-555555555555', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('chain-generation-fresh-digest', (l) => [...l, { name: 'mcp.json.rea.backup.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.recovery', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });

  // Rule: chain family kind and permission ceiling.
  fixtureCase('kind-chain-as-dir', (l) => replace(l, 'agent.db.pre-restore-20260101T010101Z', { kind: 'dir' }),
    { code: 1, has: ['KIND agent.db.pre-restore-20260101T010101Z want=file got=dir', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('mode-chain-too-wide', (l) => replace(l, 'agent.db.pre-restore-20260101T010101Z', { mode: 0o604 }),
    { code: 1, has: ['MODE agent.db.pre-restore-20260101T010101Z want<=0600 got=0604', 'OMP_CENSUS: DRIFT'] });

  // Rule: sidecars are optional, and follow their owner's ceiling.
  fixtureCase('sidecar-absent-is-clean', (l) => without(l, 'agent.db-wal'),
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('sidecar-of-chain-absent-is-clean', (l) => without(l, 'agent.db.pre-restore-20260101T010101Z-shm'),
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('sidecar-mode-too-wide', (l) => replace(l, 'agent.db-wal', { mode: 0o604 }),
    { code: 1, has: ['MODE agent.db-wal want<=0600 got=0604', 'OMP_CENSUS: DRIFT'] });

  // Rule: the agent.db corrupt-quarantine family (epoch ms + uuid) and its sidecars.
  fixtureCase('agent-corrupt-generation-ok', (l) => [...l, { name: 'agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('agent-corrupt-sidecar-ok', (l) => [...l, { name: 'agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a-wal', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('agent-corrupt-mode-too-wide', (l) => [...l, { name: 'agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a', kind: 'file', mode: 0o604 }],
    { code: 1, has: ['MODE agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a want<=0600 got=0604', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('agent-corrupt-sidecar-mode-too-wide', (l) => [...l, { name: 'agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a-wal', kind: 'file', mode: 0o604 }],
    { code: 1, has: ['MODE agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a-wal want<=0600 got=0604', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('agent-corrupt-as-dir-is-drift', (l) => [...l, { name: 'agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a', kind: 'dir', mode: 0o700 }],
    { code: 1, has: ['KIND agent.db.corrupt-1792474833850-9f8e7d6c-5b4a-4392-8180-7f6e5d4c3b2a want=file got=dir', 'OMP_CENSUS: DRIFT'] });

  // Rule: the optional harness subdirectories, each by exact name, kind and ceiling.
  fixtureCase('optional-dir-ok', (l) => [...l,
    { name: 'themes', kind: 'dir', mode: 0o755 },
    { name: 'tools', kind: 'dir', mode: 0o755 },
    { name: 'commands', kind: 'dir', mode: 0o755 },
    { name: 'prompts', kind: 'dir', mode: 0o755 },
    { name: 'memories', kind: 'dir', mode: 0o755 },
    { name: 'extensions', kind: 'dir', mode: 0o755 }],
  { code: 0, has: ['OMP_CENSUS: CLEAN'] });
  fixtureCase('optional-dir-absent-is-clean', (l) => l,
    { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: ['OMP_CENSUS: DRIFT'] });
  fixtureCase('optional-dir-as-file-is-drift', (l) => [...l, { name: 'themes', kind: 'file', mode: 0o644 }],
    { code: 1, has: ['KIND themes want=dir got=file', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('optional-dir-mode-too-wide', (l) => [...l, { name: 'tools', kind: 'dir', mode: 0o777 }],
    { code: 1, has: ['MODE tools want<=0755 got=0777', 'OMP_CENSUS: DRIFT'] });
  fixtureCase('optional-dir-unlisted-name-is-drift', (l) => [...l, { name: 'themesx', kind: 'dir', mode: 0o755 }],
    { code: 1, has: ['UNLISTED themesx', 'OMP_CENSUS: DRIFT'] });

  // Rule: an absent member is INFO, not DRIFT.
  fixtureCase('absent-member-is-info', (l) => without(l, 'config.yml'),
    { code: 0, has: ['INFO config.yml absent', 'OMP_CENSUS: CLEAN'] });

  // Rule: an empty root must not pass silently.
  fixtureCase('empty-root-is-drift', (l) => [],
    { code: 1, has: ['EMPTY root holds no member', 'OMP_CENSUS: DRIFT'], lacks: ['OMP_CENSUS: CLEAN'] });


  // New declarations: each acceptance case must turn red when its rule is dropped.
  fixtureCase('lsp-absent-no-MODE-lsp.json', (l) => l,
    { code: 0, has: ['INFO lsp.json absent'], lacks: ['MODE lsp.json'] });
  fixtureCase('lsp-present-no-UNLISTED-lsp.json', (l) => [...l, { name: 'lsp.json', kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: ['UNLISTED lsp.json'] });
  fixtureCase('lsp-MODE-lsp.json', (l) => [...l, { name: 'lsp.json', kind: 'file', mode: 0o644 }],
    { code: 1, has: ['MODE lsp.json want<=0600 got=0644'] });

  for (const [id, generation, malformed] of [
    ['config-pre', 'config.yml.pre-editor-20261104', 'config.yml.pre-editor-2026114'],
    ['agent-pre-named', 'agent.db.pre-editor-20261104', 'agent.db.pre-editor-2026114'],
    ['models-corrupt', 'models.db.corrupt-1792715399999-11111111-2222-4333-8444-555555555555',
      'models.db.corrupt-179271539999-11111111-2222-4333-8444-555555555555'],
  ]) {
    fixtureCase(`${id}-generation-no-UNLISTED`, (l) => [...l, { name: generation, kind: 'file', mode: 0o600 }],
      { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: [`UNLISTED ${generation}`] });
    fixtureCase(`${id}-sidecar-no-UNLISTED`, (l) => [...l,
      { name: `${generation}-wal`, kind: 'file', mode: 0o600 },
      { name: `${generation}-shm`, kind: 'file', mode: 0o600 }],
    { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: [`UNLISTED ${generation}-`] });
    fixtureCase(`${id}-wrong-date-UNLISTED`, (l) => [...l, { name: malformed, kind: 'file', mode: 0o600 }],
      { code: 1, has: [`UNLISTED ${malformed}`] });
    fixtureCase(`${id}-MODE`, (l) => [...l, { name: generation, kind: 'file', mode: 0o644 }],
      { code: 1, has: [`MODE ${generation} want<=0600 got=0644`] });
  }

  check('binding-total-35-no-NOTE_UNBOUND', { root: join(scratch, 'clean-fixture') },
    { code: 0, has: ['bound=35/35'], lacks: ['NOTE_UNBOUND'] });
  const unboundNote = join(scratch, 'unbound.md');
  writeFileSync(unboundNote, DECLARED_NAMES.filter((name) => name !== 'models-corrupt').join('\n'));
  check('NOTE_UNBOUND-models-corrupt', { root: join(scratch, 'clean-fixture'), note: unboundNote },
    { code: 1, has: ['NOTE_UNBOUND models-corrupt', 'OMP_CENSUS: DRIFT'], lacks: ['OMP_CENSUS: CLEAN'] });
  // Round-75 critic counterexample (K75CriticClaims): a note whose ONLY content is an HTML
  // comment listing every declared name must not read CLEAN — comments render nothing.
  const commentNote = join(scratch, 'comment-only.md');
  writeFileSync(commentNote, `<!-- ${DECLARED_NAMES.join(' ')} -->\n`);
  check('NOTE_UNBOUND-comment-only-note', { root: join(scratch, 'clean-fixture'), note: commentNote },
    { code: 1, has: ['NOTE_UNBOUND models.db', 'OMP_CENSUS: DRIFT'], lacks: ['OMP_CENSUS: CLEAN', 'bound=35/35'] });
  // Superstring decoys bind nothing: a name must be an identifier token.
  const decoyNote = join(scratch, 'superstring.md');
  writeFileSync(decoyNote, DECLARED_NAMES.map((name) => `NOT_A_BINDING_${name}_SUFFIX`).join('\n'));
  check('NOTE_UNBOUND-superstring-decoys', { root: join(scratch, 'clean-fixture'), note: decoyNote },
    { code: 1, has: ['NOTE_UNBOUND config.yml', 'OMP_CENSUS: DRIFT'], lacks: ['OMP_CENSUS: CLEAN'] });
  check('NOTE_MISSING-fail-closed', { root: join(scratch, 'clean-fixture'), note: join(scratch, 'missing.md') },
    { code: 2, has: ['NOTE_MISSING'], lacks: ['OMP_CENSUS: CLEAN'] });


  const receipt = join(scratch, 'shape.json');
  const receiptAgain = join(scratch, 'shape-again.json');
  ran++;
  const quiet = { out: () => {}, err: () => {} };
  const NOW = new Date(); NOW.setMilliseconds(0);
  const wrote = snapshot(join(scratch, 'clean-fixture'), receipt, quiet, NOW);
  const regeneratedRoot = join(scratch, 'regenerated-root');
  materialise(regeneratedRoot, shapeFromFile(receipt));
  const wroteAgain = snapshot(regeneratedRoot, receiptAgain, quiet, NOW);
  if (wrote !== 0 || wroteAgain !== 0
      || readFileSync(receipt, 'utf8') !== readFileSync(receiptAgain, 'utf8')
      || JSON.stringify(shapeFromFile(receipt)) !== JSON.stringify(readShape(join(scratch, 'clean-fixture')))) {
    failures.push('snapshot-roundtrip: shape or canonical bytes differ');
  } else io.out('SELFTEST ok snapshot-roundtrip');
  check('shape-clean', { shape: receipt }, { code: 0, has: ['source=snapshot', 'bound=35/35', `captured=${NOW.toISOString().slice(0, 10)} age_days=0`] });
  const shapeDoc = readShapeDoc(receipt);
  if (shapeDoc.contract !== SHAPE_CONTRACT || shapeDoc.captured_at !== NOW.toISOString().replace(/\.\d{3}Z$/u, 'Z')
      || Object.keys(shapeDoc).sort().join(',') !== 'captured_at,contract,entries') {
    failures.push('snapshot-v2: contract/captured_at/keys are not the v2 shape');
    ran++;
  } else io.out('SELFTEST ok snapshot-v2-fields');
  const legacy = join(scratch, 'legacy-v1.json');
  writeFileSync(legacy, JSON.stringify({ contract: LEGACY_SHAPE_CONTRACT, entries: shapeFromFile(receipt) }));
  check('shape-v1-version', { shape: legacy }, { code: 2, has: ['SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1'], lacks: ['OMP_CENSUS'] });
  check('compare-accepts-v1', { compare: legacy, root: join(scratch, 'clean-fixture') },
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC'] });
  const backdated = join(scratch, 'backdated.json');
  writeFileSync(backdated, JSON.stringify({ contract: SHAPE_CONTRACT,
    captured_at: new Date(Date.now() - 45 * 86400000).toISOString().replace(/\.\d{3}Z$/u, 'Z'),
    entries: shapeFromFile(receipt) }));
  check('shape-age-disclosed', { shape: backdated }, { code: 0, has: ['age_days=45', 'OMP_CENSUS: CLEAN'] });
  check('shape-max-age-stale', { shape: backdated, maxAge: 30 }, { code: 1, has: ['SHAPE_STALE age_days=45 max_age=30'] });
  check('shape-max-age-pass', { shape: backdated, maxAge: 60 }, { code: 0, has: ['OMP_CENSUS: CLEAN'], lacks: ['SHAPE_STALE'] });
  // CLI dispatch: parseArgs -> main -> runShape must carry --max-age (round-81 reviewer finding;
  // the 97-case suite passed while main() dropped the flag).
  {
    const out = [];
    const err = [];
    const code = main(['--shape', backdated, '--max-age', '30'], { out: (x) => out.push(x), err: (x) => err.push(x) });
    ran++;
    if (code !== 1 || !out.join('\n').includes('SHAPE_STALE age_days=45 max_age=30')) {
      failures.push(`cli-max-age: exit=${code} out=${out.join(' | ').slice(0, 160)}`);
    } else io.out('SELFTEST ok cli-max-age');
  }
  const future = join(scratch, 'future.json');
  writeFileSync(future, JSON.stringify({ contract: SHAPE_CONTRACT,
    captured_at: new Date(Date.now() + 2 * 86400000).toISOString().replace(/\.\d{3}Z$/u, 'Z'),
    entries: shapeFromFile(receipt) }));
  check('shape-clock-future', { shape: future }, { code: 2, has: ['SHAPE_CLOCK'] });
  const noCaptured = join(scratch, 'no-captured.json');
  writeFileSync(noCaptured, JSON.stringify({ contract: SHAPE_CONTRACT, entries: shapeFromFile(receipt) }));
  check('shape-v2-missing-captured', { shape: noCaptured }, { code: 2, has: ['SHAPE_INVALID'] });
  const invalid = join(scratch, 'invalid.json');
  writeFileSync(invalid, '{"contract":"kumitate-omp-shape-v1"}');
  check('shape-invalid', { shape: invalid }, { code: 2, has: ['SHAPE_INVALID'] });
  check('shape-not-found', { shape: join(scratch, 'absent.json') }, { code: 2, has: ['SHAPE_NOT_FOUND'] });
  const negative = join(scratch, 'negative.json');
  writeFileSync(negative, JSON.stringify({ contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z',
    entries: [...shapeFromFile(receipt), { name: 'zz-stray.txt', kind: 'file', mode: 0o644 }] }));
  check('shape-negative', { shape: negative }, { code: 1, has: ['UNLISTED zz-stray.txt', 'OMP_CENSUS: DRIFT'] });
  for (const [name, doc] of [
    ['content-key', { contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: [{ name: 'agent.db', kind: 'file', mode: 384, content: '' }] }],
    ['bad-kind', { contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: [{ name: 'agent.db', kind: 'fifo', mode: 384 }] }],
    ['wrong-contract', { contract: 'kumitate-omp-shape-v0', captured_at: '2025-01-01T00:00:00Z', entries: [{ name: 'agent.db', kind: 'file', mode: 384 }] }],
    ['bad-captured', { contract: SHAPE_CONTRACT, captured_at: '2026-11-04', entries: [{ name: 'agent.db', kind: 'file', mode: 384 }] }],
    ['empty', { contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: [] }],
    ['unsorted', { contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: [...shapeFromFile(receipt)].reverse() }],
    ['extra-key', { contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: shapeFromFile(receipt), content: '' }],
  ]) {
    writeFileSync(invalid, JSON.stringify(doc));
    check(`shape-${name}`, { shape: invalid }, { code: 2, has: ['SHAPE_INVALID'] });
  }
  const compareRoot = join(scratch, 'compare-root');
  materialise(compareRoot, shapeFromFile(receipt));
  const compareArgs = { compare: receipt, root: compareRoot };
  check('compare-in-sync', compareArgs,
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC entries=13 receipt=13 added=0 removed=0 changed=0'], lacks: ['first='] });
  // Round 82: the compare path discloses the receipt's capture instant and gates age on demand.
  check('compare-age-disclosed', compareArgs,
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', `receipt_captured=${NOW.toISOString().slice(0, 10)} age_days=0`] });
  const compareBackdated = join(scratch, 'compare-backdated.json');
  writeFileSync(compareBackdated, JSON.stringify({ contract: SHAPE_CONTRACT,
    captured_at: new Date(NOW.getTime() - 45 * 86400000).toISOString().replace(/\.\d{3}Z$/u, 'Z'),
    entries: shapeFromFile(receipt) }));
  check('compare-age-backdated', { compare: compareBackdated, root: compareRoot },
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'age_days=45'] });
  check('compare-max-age-stale', { compare: compareBackdated, root: compareRoot, maxAge: 30 },
    { code: 1, has: ['SHAPE_STALE_RECEIPT', 'age_days=45', 'max_age=30'], lacks: ['OMP_SHAPE_COMPARE: IN_SYNC'] });
  check('compare-max-age-pass', { compare: compareBackdated, root: compareRoot, maxAge: 60 },
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'age_days=45'], lacks: ['SHAPE_STALE_RECEIPT'] });
  check('compare-v1-captured-absent', { compare: legacy, root: join(scratch, 'clean-fixture') },
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'captured=absent', 'age_days=absent'] });
  check('compare-v1-max-age-unknown', { compare: legacy, root: join(scratch, 'clean-fixture'), maxAge: 1 },
    { code: 2, has: ['SHAPE_AGE_UNKNOWN', 'max_age=1'], lacks: ['OMP_SHAPE_COMPARE: IN_SYNC'] });
  // CLI dispatch: parseArgs -> main -> compareShape must carry --max-age (the round-81 class).
  {
    const out = [];
    const err = [];
    const code = main(['--compare', compareBackdated, '--root', compareRoot, '--max-age', '30'], { out: (x) => out.push(x), err: (x) => err.push(x) });
    ran++;
    const text = out.join('\n');
    if (code !== 1 || !text.includes('SHAPE_STALE_RECEIPT')) {
      failures.push(`cli-compare-max-age: exit=${code} out=${text.slice(0, 160)}`);
    } else io.out('SELFTEST ok cli-compare-max-age');
  }
  // Compare-only exemption: exact live database sidecars, in either shape.
  const stableEntries = shapeFromFile(receipt)
    .filter((entry) => !/^agent\.db-(?:shm|wal|journal)$/u.test(entry.name));
  const stableReceipt = join(scratch, 'stable-shape.json');
  writeFileSync(stableReceipt, JSON.stringify({ contract: SHAPE_CONTRACT, captured_at: '2025-01-01T00:00:00Z', entries: stableEntries }));
  for (const suffix of ['shm', 'wal', 'journal']) {
    const transientRoot = join(scratch, `compare-transient-${suffix}`);
    materialise(transientRoot, [...stableEntries,
      { name: `agent.db-${suffix}`, kind: 'file', mode: 0o600 }]);
    check(`compare-transient-${suffix}-only`, { compare: stableReceipt, root: transientRoot },
      { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'added=0 removed=0 changed=0', 'transient=1'],
        lacks: ['first='] });
    const transientReceipt = join(scratch, `transient-${suffix}.json`);
    snapshot(transientRoot, transientReceipt, quiet);
    rmSync(join(transientRoot, `agent.db-${suffix}`));
    check(`compare-transient-${suffix}-removed`, { compare: transientReceipt, root: transientRoot },
      { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'added=0 removed=0 changed=0', 'transient=1'],
        lacks: ['first='] });
    writeFileSync(join(transientRoot, `agent.db-${suffix}`), '', { mode: 0o644 });
    check(`compare-transient-${suffix}-changed`, { compare: transientReceipt, root: transientRoot },
      { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC', 'added=0 removed=0 changed=0', 'transient=1'],
        lacks: ['first='] });
  }
  const realAddedRoot = join(scratch, 'compare-transient-real-added');
  materialise(realAddedRoot, [...stableEntries,
    { name: 'agent.db-shm', kind: 'file', mode: 0o600 },
    { name: 'zz-real-member', kind: 'file', mode: 0o600 }]);
  check('compare-transient-real-added', { compare: stableReceipt, root: realAddedRoot },
    { code: 1, has: ['OMP_SHAPE_COMPARE: DRIFT', 'added=1 removed=0 changed=0 first=zz-real-member',
      'transient=1'], lacks: ['first=agent.db-shm'] });
  writeFileSync(join(compareRoot, 'zz-added'), '');
  check('compare-added', compareArgs,
    { code: 1, has: ['entries=14 receipt=13 added=1 removed=0 changed=0 first=zz-added'] });
  rmSync(join(compareRoot, 'zz-added'));
  rmSync(join(compareRoot, 'RULES.md'));
  check('compare-removed', compareArgs,
    { code: 1, has: ['entries=12 receipt=13 added=0 removed=1 changed=0 first=RULES.md'] });
  writeFileSync(join(compareRoot, 'RULES.md'), '', { mode: 0o644 });
  chmodSync(join(compareRoot, 'RULES.md'), 0o600);
  check('compare-mode-changed', compareArgs,
    { code: 1, has: ['entries=13 receipt=13 added=0 removed=0 changed=1 first=RULES.md'] });
  chmodSync(join(compareRoot, 'RULES.md'), 0o644);
  rmSync(join(compareRoot, 'agents'), { recursive: true });
  writeFileSync(join(compareRoot, 'agents'), '', { mode: 0o755 });
  chmodSync(join(compareRoot, 'agents'), 0o755);
  check('compare-kind-changed', compareArgs,
    { code: 1, has: ['added=0 removed=0 changed=1 first=agents'] });
  rmSync(join(compareRoot, 'agents'));
  mkdirSync(join(compareRoot, 'agents'), { mode: 0o755 });
  chmodSync(join(compareRoot, 'agents'), 0o755);
  writeFileSync(join(compareRoot, 'agent.db'), 'SELFTEST_COMPARE_CONTENT_MARKER');
  check('compare-content-blind', compareArgs,
    { code: 0, has: ['OMP_SHAPE_COMPARE: IN_SYNC'], lacks: ['SELFTEST_COMPARE_CONTENT_MARKER'] });
  writeFileSync(invalid, '{');
  check('compare-invalid-receipt', { ...compareArgs, compare: invalid },
    { code: 2, has: ['SHAPE_INVALID'] });
  check('compare-absent-receipt', { ...compareArgs, compare: join(scratch, 'absent.json') },
    { code: 2, has: ['SHAPE_NOT_FOUND'] });
  check('compare-root-not-dir', { ...compareArgs, root: note },
    { code: 2, has: ['ROOT_NOT_A_DIR'] });
  check('compare-root-missing', { ...compareArgs, root: join(scratch, 'missing-root') },
    { code: 2, has: ['ROOT_NOT_A_DIR'] });
  for (const args of [
    ['--compare', receipt, '--snapshot', receipt],
    ['--compare', receipt, '--shape', receipt],
    ['--compare', receipt, '--selftest'],
    ['--compare', receipt, '--self', DEFAULT_SELF],
    [`--compare=${receipt}`, '--note=note.md'],
    ['--compare'], ['--compare='], ['--compare', '--root'],
  ]) {
    ran++;
    if (!parseArgs(args).error) failures.push(`compare-usage: accepted ${args.join(' ')}`);
    else io.out(`SELFTEST ok compare-usage ${args.join(' ')}`);
  }
  ran++;
  if (parseArgs([`--compare=${receipt}`, '--root', compareRoot]).compare !== receipt) {
    failures.push('compare-equals: receipt argument lost');
  } else io.out('SELFTEST ok compare-equals');
  // Check root failure before removing the hermetic binding note.
  ran++;
  const missing = join(scratch, 'does-not-exist');
  const err = [];
  const code = runCensus(missing, { out: () => {}, err: (s) => err.push(s) }, note);
  if (code !== 2 || !err.some((s) => s.includes('OMP_CENSUS: ERROR'))) {
    failures.push(`unreadable-root: exit ${code} want 2 with root ERROR`);
    io.out(`SELFTEST FAIL unreadable-root: exit ${code} want 2 with root ERROR`);
  } else {
    io.out('SELFTEST ok unreadable-root');
  }
  rmSync(scratch, { recursive: true, force: true });


  // Rule: usage errors exit 64.
  ran++;
  const usage = parseArgs(['--nonsense']);
  if (!usage.error) {
    failures.push('usage: unknown argument accepted');
    io.out('SELFTEST FAIL usage: unknown argument accepted');
  } else {
    io.out('SELFTEST ok usage');
  }

  if (failures.length) {
    io.out(`VERDICT: FAIL (${failures.length} of ${ran} cases failed)`);
    return 1;
  }
  io.out(`VERDICT: PASS (${ran} cases)`);
  return 0;
}

// ---------------------------------------------------------------------------

function main(argv, io) {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    io.out(USAGE);
    return 0;
  }
  if (parsed.error) {
    io.err(`omp-census: ${parsed.error}`);
    io.err(USAGE);
    return 64;
  }
  if (parsed.selftest) {
    return selftest(parsed.work, io);
  }
  const root = parsed.root || join(homedir(), '.omp', 'agent');
  if (parsed.snapshot !== null) return snapshot(root, parsed.snapshot, io);
  if (parsed.compare !== null) return compareShape(root, parsed.compare, io, parsed.maxAge);
  const note = parsed.note ?? join(parsed.self, 'corpus', 'knowledge', 'omp-agent-root.md');
  if (parsed.shape !== null) return runShape(parsed.shape, io, note, parsed.maxAge);
  return runCensus(root, io, note);
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  // A reader that closes the pipe first (`| grep -q`) must not surface as a crash.
  process.stdout.on('error', (e) => { if (e.code !== 'EPIPE') throw e; });
  const io = { out: (s) => process.stdout.write(`${s}\n`), err: (s) => process.stderr.write(`${s}\n`) };
  process.exitCode = main(process.argv.slice(2), io);
}
