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
 *   node scripts/omp-census.mjs [--root DIR]        default DIR = $HOME/.omp/agent
 *   node scripts/omp-census.mjs --selftest [--work DIR]
 *
 * Exit codes:
 *   0   exactly one stdout line `OMP_CENSUS: CLEAN (...)`
 *   1   exactly one stdout line `OMP_CENSUS: DRIFT (...)`, preceded by finding lines
 *       such as `UNLISTED <name>`, `KIND <name> want=dir got=file`,
 *       `MODE <name> want<=0600 got=0604`
 *   2   fail-closed: the root is unreadable (missing, not a directory, or an entry
 *       vanished mid-read). Never CLEAN.
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
  chmodSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Rules. Each rule cites the `corpus/SOURCES.md` row it rests on (S053-S061, opened in
// round 44; oh-my-pi rows are pinned at v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99). Rules are anchored to a member name (exact)
// or to a chain template owned by a member; a chain template is the owning member's
// name plus a placeholder (UTC stamp, epoch milliseconds + UUID, 64-hex digest).
// ---------------------------------------------------------------------------

/** Base members: exact name, kind, permission ceiling. */
const BASE_MEMBERS = [
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
const CHAIN_FAMILIES = [
  { id: 'agent-pre-restore', owner: 'agent.db', re: /^agent\.db\.pre-restore-\d{8}T\d{6}Z$/, kind: 'file', mode: 0o600, note: 'agent.db snapshot taken by the operator before a restore (not an OMP writer)' }, // source: S058 (fleet PHASE4.md:112 recovery record)
  { id: 'agent-recovered', owner: 'agent.db', re: /^agent\.db\.recovered-\d{8}T\d{6}Z$/, kind: 'file', mode: 0o600, note: 'agent.db rebuilt by the operator with sqlite3 .recover (not an OMP writer)' }, // source: S058 (fleet PHASE4.md:112 recovery record)
  { id: 'history-corrupt', owner: 'history.db', re: /^history\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, kind: 'file', mode: 0o600, note: 'history.db quarantined after a corruption, epoch ms + uuid' }, // source: S054 (sqlite.ts:193, chmod 0o600 at :197-199)
  { id: 'agent-corrupt', owner: 'agent.db', re: /^agent\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, kind: 'file', mode: 0o600, note: 'agent.db quarantined after a corruption, epoch ms + uuid' }, // source: S054 (sqlite.ts:193) + S055 (recoverCorruption for agent.db)
  { id: 'mcp-pre-disable', owner: 'mcp.json', re: /^mcp\.json\.pre-disable-\d{8}T\d{4}$/, kind: 'file', mode: 0o600, note: 'operator pre-edit copy of mcp.json (not an OMP writer)' }, // source: S061 (fleet lane-addendum.md:82-84)
  { id: 'mcp-rea-backup-recovery', owner: 'mcp.json.rea.backup', re: /^mcp\.json\.rea\.backup\.[0-9a-f]{64}\.recovery$/, kind: 'file', mode: 0o600, note: 'REA backup recovery copy, 64-hex digest' }, // source: S057 (SetupRecoveryBackup.js:36)
];

/** SQLite sidecar suffixes of a member or of a chain generation. Optional. */
const SIDECAR_RE = /-(shm|wal)$/; // source: S054 (sqlite.ts:12 SQLITE_STORE_SUFFIXES) + S056 (SQLite WAL: sidecars come and go)

const BASE_BY_NAME = new Map(BASE_MEMBERS.map((r) => [r.name, r]));

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
function census(root) {
  const entries = readShape(root);
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

  const verdict = findings.length === 0 ? 'CLEAN' : 'DRIFT';
  return {
    verdict,
    findings,
    infos,
    counts: { entries: entries.length, base: BASE_MEMBERS.length, families: CHAIN_FAMILIES.length },
  };
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------

const USAGE = 'usage: node scripts/omp-census.mjs [--root DIR] | --selftest [--work DIR]';

function parseArgs(argv) {
  const o = { root: null, selftest: false, work: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') {
      if (i + 1 >= argv.length) return { error: '--root needs a directory argument' };
      o.root = argv[++i];
    } else if (a.startsWith('--root=')) {
      o.root = a.slice('--root='.length);
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
  return o;
}

/**
 * Run the census for one root and render it.
 * `io` is { out, err } so the selftest can capture output without a child process.
 */
function runCensus(root, io) {
  let res;
  try {
    res = census(root);
  } catch (e) {
    io.err(`OMP_CENSUS: ERROR root=${root} reason=${e.code || e.message}`);
    return 2;
  }
  for (const i of res.infos) io.out(i);
  for (const f of res.findings) io.out(f);
  io.out(`OMP_CENSUS: ${res.verdict} (root=${root} entries=${res.counts.entries} findings=${res.findings.length})`);
  return res.verdict === 'CLEAN' ? 0 : 1;
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
  const scratch = mkdtempSync(join(base, 'omp-census-selftest-'));
  const failures = [];
  let ran = 0;

  const capture = (argv) => {
    const out = [];
    const err = [];
    const code = runCensus(argv.root, { out: (s) => out.push(s), err: (s) => err.push(s) });
    return { code, stdout: out.join('\n'), stderr: err.join('\n') };
  };

  const check = (name, argv, want) => {
    ran++;
    const r = capture(argv);
    const problems = [];
    if (r.code !== want.code) problems.push(`exit ${r.code} want ${want.code}`);
    for (const line of want.has || []) {
      if (!r.stdout.includes(line)) problems.push(`missing ${JSON.stringify(line)}`);
    }
    for (const line of want.lacks || []) {
      if (r.stdout.includes(line)) problems.push(`unexpected ${JSON.stringify(line)}`);
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

  rmSync(scratch, { recursive: true, force: true });

  // Rule: an unreadable root fails closed with exit 2.
  ran++;
  const missing = join(scratch, 'does-not-exist');
  const err = [];
  const code = runCensus(missing, { out: () => {}, err: (s) => err.push(s) });
  if (code !== 2) {
    failures.push(`unreadable-root: exit ${code} want 2`);
    io.out(`SELFTEST FAIL unreadable-root: exit ${code} want 2`);
  } else {
    io.out('SELFTEST ok unreadable-root');
  }

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
  return runCensus(root, io);
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const io = { out: (s) => process.stdout.write(`${s}\n`), err: (s) => process.stderr.write(`${s}\n`) };
  process.exitCode = main(process.argv.slice(2), io);
}
