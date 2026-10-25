#!/usr/bin/env node
/**
 * make-dispatch-actual.mjs — emit a round's dispatch record in the schema
 * `scripts/dispatch-evidence.mjs` reads (contract kumitate-dispatch-evidence-v1).
 *
 *   node scripts/make-dispatch-actual.mjs --registry PATH --results PATH [--reports DIR]
 *        [--out DIR] [--root DIR] [--round N] [--wave NAME] [--gate PATH] [--no-verify]
 *   node scripts/make-dispatch-actual.mjs --selftest
 *
 * Why (R60-V5): a validator wave writes `swarm-registry.json` with `members` as an OBJECT
 * keyed by seat name and `agentId: null` until ids come back, while the gate reads one
 * ARRAY-keyed record (`dispatch-actual.json`) plus `launcher-progress.tsv`. An executor
 * holding the registry and the settle output still cannot hand the gate a record it can
 * read: the gate answers REGISTRY_UNREADABLE / NOT_A_DISPATCH. This tool is that
 * translation, and it re-runs the gate on exactly what it wrote.
 *
 * Inputs
 *   --registry  ufo-swarm-registry-v1: `members` as a name-keyed object or an array;
 *               per member agentId, role, kind, exit, pid
 *   --results   validator `settle` output or equivalent: an array, a
 *               {members|results|seats|settled: []} wrapper, a name-keyed object, or a
 *               launcher progress TSV in the gate's own row grammar
 *               (`name\tsession=..\texit=..\tpid=..`); per entry
 *               name/agentId|session|sessionId, exit|exitCode|code, status,
 *               pid, start|startedAt, end|endedAt|settledAt
 *   --reports   directory holding one non-empty `<name>.md` per seat (default: --out)
 * Outputs, written into --out (default: the registry's directory)
 *   dispatch-actual.json    {schema, wave, planned, sessionIds, exit0, reports, dead,
 *                            members:[{name, agentId, exit, status, pid, ...}]}
 *   launcher-progress.tsv   `<name>\tsession=<id>\texit=<n>\tpid=<p>\tstart=<..>\tend=<..>`
 *                           (session=null for a seat with no id; exit=-1 for no evidence)
 *
 * The record is faithful, never laundered: a seat the results settle non-zero keeps its
 * exit and is listed in `dead`; a registry whose members carry no id is written as the
 * non-dispatch it is, and the gate is left to say NOT_A_DISPATCH.
 *
 * Exit: 0 record written and the gate reads it CLEAN · 1 record written but the gate says
 *       DRIFT (a real defect in the inputs) · 2 fail-closed (input absent, unreadable,
 *       unusable, or an inconsistency that makes the record untrustworthy) · 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTRACT = 'kumitate-dispatch-evidence-v1';
const RECORD_SCHEMA = 'kumitate-dispatch-actual';
const REGISTRY = 'dispatch-actual.json';
const PROGRESS = 'launcher-progress.tsv';
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function usage(msg) {
  process.stderr.write(`MAKE_DISPATCH_ACTUAL: USAGE ${msg}\n`);
  process.exit(64);
}

function failClosed(id, detail) {
  process.stderr.write(`MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=${id} ${detail}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = {
    registry: null, results: null, reports: null, out: null,
    root: null, round: null, wave: null,
    gate: join(HERE, 'dispatch-evidence.mjs'), verify: true, selftest: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--selftest') out.selftest = true;
    else if (a === '--no-verify') out.verify = false;
    else if (a === '--registry') out.registry = argv[++i];
    else if (a === '--results') out.results = argv[++i];
    else if (a === '--reports') out.reports = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--root') out.root = argv[++i];
    else if (a === '--round') out.round = argv[++i];
    else if (a === '--wave') out.wave = argv[++i];
    else if (a === '--gate') out.gate = argv[++i];
    else usage(`unknown argument ${JSON.stringify(a)}`);
  }
  return out;
}

function readJson(path, id) {
  let raw;
  try { raw = readFileSync(path, 'utf8'); } catch (e) {
    failClosed(id, `path=${path} err=${e.code || e.message}`);
  }
  try { return JSON.parse(raw); } catch (e) {
    failClosed(id, `path=${path} err=invalid-json detail=${String(e.message).slice(0, 160)}`);
  }
  return null;
}

function normSession(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === 'null' || s === 'undefined') return null;
  return s;
}

/** Map a settlement status to the gate's numeric exit contract. */
function normExit(value, status = null) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  switch (String(status || '').trim().toLowerCase()) {
    case 'completed':
    case 'settled': return 0;
    case 'failed': return 1;
    case 'timeout':
    case 'timed_out': return 124;
    case 'canceled':
    case 'cancelled':
    case 'aborted': return -9;
    default: return null;
  }
}

/** Epoch seconds for the TSV; '-' when unknown. Accepts ints, numeric strings, ISO times. */
function normTime(v) {
  if (v === null || v === undefined || v === '') return '-';
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v));
  const s = String(v).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return String(Math.trunc(Number(s)));
  const t = Date.parse(s);
  return Number.isFinite(t) ? String(Math.floor(t / 1000)) : '-';
}

function pick(obj, keys) {
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
}

function consistentValue(obj, keys, normalize, label, name) {
  const raw = keys.filter((key) => Object.hasOwn(obj, key)).map((key) => obj[key]);
  const present = raw.map(normalize);
  if (present.some((value) => value === null)) {
    failClosed('RESULT_FIELD_UNREADABLE', `name=${name} field=${label}`);
  }
  if (new Set(present).size > 1) {
    failClosed('RESULT_FIELDS_CONFLICT', `name=${name} field=${label}`);
  }
  return present[0] ?? null;
}

function resolveResultExit(name, status, rawExit) {
  const explicit = normExit(rawExit);
  if (rawExit !== null && rawExit !== undefined && explicit === null) {
    failClosed('RESULT_EXIT_UNREADABLE', `name=${name}`);
  }
  const normalizedStatus = normSession(status);
  const statusExit = normExit(undefined, normalizedStatus);
  if (normalizedStatus && statusExit === null) {
    failClosed('RESULT_STATUS_UNREADABLE', `name=${name} status=${normalizedStatus}`);
  }
  const statusLower = String(normalizedStatus || '').toLowerCase();
  const success = ['completed', 'settled'];
  const failure = ['failed', 'timeout', 'timed_out', 'canceled', 'cancelled', 'aborted'];
  if ((success.includes(statusLower) && explicit !== null && explicit !== 0)
      || (failure.includes(statusLower) && explicit === 0)) {
    failClosed('RESULT_STATUS_MISMATCH', `name=${name} status=${normalizedStatus} exit=${explicit}`);
  }
  return explicit ?? statusExit;
}

/** [name, entry] pairs for an object map, an array of entries, or a wrapper object. */
function entriesOf(raw, wrappers) {
  if (Array.isArray(raw)) return raw.map((e) => [normSession(e && e.name) || null, e]);
  if (!raw || typeof raw !== 'object') return null;
  for (const w of wrappers) {
    if (Array.isArray(raw[w])) return raw[w].map((e) => [normSession(e && e.name) || null, e]);
    if (raw[w] && typeof raw[w] === 'object' && !Array.isArray(raw[w])) {
      return Object.entries(raw[w]);
    }
  }
  return Object.entries(raw);
}

/** A registry-shaped object whose `members` is missing is not a bare member map. */
function containerOf(raw, wrapper, metaKeys, id) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    failClosed(id, 'detail=not-an-object');
  }
  if (raw[wrapper] !== undefined) return raw[wrapper];
  if (metaKeys.some((k) => raw[k] !== undefined)) failClosed(id, `detail=${wrapper}-absent`);
  return raw;
}

function registryMembers(raw) {
  const entries = entriesOf(containerOf(raw, 'members', ['schema', 'wave', 'reportDir', 'createdAt', 'updatedAt'], 'REGISTRY_UNREADABLE'), ['members']);
  if (!entries) failClosed('REGISTRY_UNREADABLE', 'detail=members-absent');
  const rows = [];
  const seen = new Set();
  for (const [key, entry] of entries) {
    if (!entry || typeof entry !== 'object') failClosed('REGISTRY_UNREADABLE', `detail=member-not-an-object name=${key}`);
    const name = normSession(entry.name) || key;
    if (!name) failClosed('REGISTRY_UNREADABLE', 'detail=member-without-name');
    if (!NAME_RE.test(name)) failClosed('INVALID_NAME', `name=${JSON.stringify(name)}`);
    if (seen.has(name)) failClosed('DUPLICATE_MEMBER', `name=${name}`);
    seen.add(name);
    rows.push({
      name,
      agentId: normSession(pick(entry, ['agentId', 'agent_id', 'session', 'sessionId'])),
      role: normSession(entry.role) || '-',
      kind: normSession(entry.kind) || 'spawn',
      exit: normExit(entry.exit),
      pid: normSession(entry.pid) || '-',
      start: normTime(pick(entry, ['start', 'startedAt', 'started_at'])),
      end: normTime(pick(entry, ['end', 'endedAt', 'settledAt', 'ended_at'])),
      status: null,
    });
  }
  return rows;
}

function resultEntries(raw) {
  const entries = entriesOf(containerOf(raw, 'members', ['schema', 'wave', 'settledAt', 'createdAt', 'updatedAt'], 'RESULTS_UNREADABLE'), ['members', 'results', 'seats', 'settled']);
  if (!entries) failClosed('RESULTS_UNREADABLE', 'detail=not-an-object-or-array');
  const byName = new Map();
  for (const [key, entry] of entries) {
    if (!entry || typeof entry !== 'object') failClosed('RESULTS_UNREADABLE', `detail=entry-not-an-object name=${key}`);
    const name = normSession(entry.name) || normSession(entry.member) || normSession(entry.seat) || key;
    if (!name) failClosed('RESULTS_UNREADABLE', 'detail=entry-without-name');
    if (!NAME_RE.test(name)) failClosed('INVALID_NAME', `name=${JSON.stringify(name)}`);
    if (byName.has(name)) failClosed('DUPLICATE_MEMBER', `name=${name} source=results`);
    const status = consistentValue(entry, ['status', 'state'], normSession, 'status', name);
    const rawExit = consistentValue(entry, ['exit', 'exitCode', 'exit_code', 'code'], normExit, 'exit', name);
    const exit = resolveResultExit(name, status, rawExit);
    byName.set(name, {
      agentId: normSession(pick(entry, ['agentId', 'agent_id', 'session', 'sessionId', 'session_id'])),
      exit,
      status,
      pid: normSession(entry.pid) || '-',
      start: normTime(pick(entry, ['start', 'startedAt', 'started_at'])),
      end: normTime(pick(entry, ['end', 'endedAt', 'settledAt', 'ended_at'])),
    });
  }
  return byName;
}

/**
 * The gate's own progress grammar, so a launcher that died before writing a registry
 * still leaves a usable settlement record: `name \t session=.. \t exit=.. \t pid=..`.
 */
function parseTsvResults(text) {
  const byName = new Map();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const name = normSession(parts[0]);
    if (!name) return null;
    if (!NAME_RE.test(name)) failClosed('INVALID_NAME', `name=${JSON.stringify(name)}`);
    const kv = {};
    for (const p of parts.slice(1)) {
      const i = p.indexOf('=');
      if (i > 0) {
        const key = p.slice(0, i);
        const value = p.slice(i + 1);
        if (Object.hasOwn(kv, key) && kv[key] !== value) {
          failClosed('RESULT_FIELDS_CONFLICT', `name=${name} field=${key}`);
        }
        kv[key] = value;
      }
    }
    if (kv.exit === undefined) return null;
    if (byName.has(name)) failClosed('DUPLICATE_MEMBER', `name=${name} source=results`);
    const status = normSession(kv.status);
    const exit = resolveResultExit(name, status, kv.exit);
    byName.set(name, {
      agentId: normSession(kv.session),
      exit,
      status,
      pid: normSession(kv.pid) || '-',
      start: normTime(kv.start),
      end: normTime(kv.end),
    });
  }
  return byName.size > 0 ? byName : null;
}

function readResults(path) {
  let raw;
  try { raw = readFileSync(path, 'utf8'); } catch (e) {
    failClosed('RESULTS_UNREADABLE', `path=${path} err=${e.code || e.message}`);
  }
  const t = raw.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    let json;
    try { json = JSON.parse(t); } catch (e) {
      failClosed('RESULTS_UNREADABLE', `path=${path} err=invalid-json detail=${String(e.message).slice(0, 160)}`);
    }
    return resultEntries(json);
  }
  const tsv = parseTsvResults(raw);
  if (!tsv) failClosed('RESULTS_UNREADABLE', `path=${path} detail=not-json-not-gate-tsv`);
  return tsv;
}

function mergeRows(members, results) {
  for (const name of results.keys()) {
    if (!members.some((m) => m.name === name)) {
      failClosed('UNPLANNED_SEAT', `name=${name} detail=settled-but-not-in-registry`);
    }
  }
  return members.map((m) => {
    const r = results.get(m.name) || null;
    const session = r && r.agentId !== null ? r.agentId : m.agentId;
    const rawExit = r && r.exit !== null ? r.exit : m.exit;
    const exit = rawExit === null ? -1 : rawExit;
    const settled = rawExit !== null;
    const status = (r && r.status ? r.status.toLowerCase() : null) || (settled ? (exit === 0 ? 'settled' : 'failed') : 'unknown');
    return {
      name: m.name,
      agentId: session,
      exit,
      settled,
      status,
      pid: r && r.pid !== '-' ? r.pid : m.pid,
      start: r && r.start !== '-' ? r.start : m.start,
      end: r && r.end !== '-' ? r.end : m.end,
      role: m.role,
      kind: m.kind,
    };
  });
}

function countReports(dir, rows) {
  let reports = 0;
  for (const row of rows) {
    let size = 0;
    try { size = statSync(join(dir, `${row.name}.md`)).size; } catch { size = 0; }
    if (size > 0) reports += 1;
  }
  return reports;
}

function buildRecord(rows, reports, wave) {
  const sessions = rows.filter((r) => r.agentId).length;
  const exit0 = rows.filter((r) => r.exit === 0).length;
  const dead = rows.filter((r) => r.exit !== 0 || !r.agentId).map((r) => r.name);
  return {
    schema: RECORD_SCHEMA,
    contract: CONTRACT,
    wave,
    generatedAt: new Date().toISOString(),
    planned: rows.length,
    progressLines: rows.length,
    sessionIds: sessions,
    exit0,
    reports,
    dead,
    members: rows.map((r) => ({
      name: r.name,
      agentId: r.agentId,
      exit: r.exit,
      settled: r.settled,
      status: r.status,
      pid: r.pid,
      start: r.start,
      end: r.end,
      role: r.role,
      kind: r.kind,
    })),
  };
}

function progressText(rows) {
  const lines = rows.map((r) => [
    r.name,
    `session=${r.agentId === null ? 'null' : r.agentId}`,
    `exit=${r.exit}`,
    `pid=${r.pid}`,
    `start=${r.start}`,
    `end=${r.end}`,
  ].join('\t'));
  return `${lines.join('\n')}\n`;
}

/** Write via a sibling temp file + rename so a half-written record never lands. */
function writeAtomic(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

function deriveContext(outDir) {
  const m = /^(.*)[\\/]\.ufo[\\/]waves[\\/]round-(\d+)[\\/]([^\\/]+)$/.exec(resolve(outDir));
  if (!m) return null;
  return { root: m[1], round: m[2], wave: m[3] };
}

function verify(gate, root, round, wave) {
  const r = spawnSync(process.execPath, [gate, '--root', root, '--round', round, '--wave', wave], { encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error || null };
}

function main(argv) {
  const args = parseArgs(argv);
  if (args.selftest) return selftest();
  if (!args.registry) usage('--registry PATH is required (or --selftest)');
  if (!args.results) usage('--results PATH is required (or --selftest)');

  const registryPath = resolve(args.registry);
  if (!existsSync(registryPath)) failClosed('REGISTRY_UNREADABLE', `path=${registryPath} detail=absent`);
  const resultsPath = resolve(args.results);
  if (!existsSync(resultsPath)) failClosed('RESULTS_UNREADABLE', `path=${resultsPath} detail=absent`);

  const registryJson = readJson(registryPath, 'REGISTRY_UNREADABLE');
  const members = registryMembers(registryJson);
  if (members.length === 0) failClosed('MEMBERS_ABSENT', `path=${registryPath} detail=registry-has-no-members`);
  const results = readResults(resultsPath);
  const rows = mergeRows(members, results);

  const outDir = resolve(args.out || dirname(registryPath));
  const reportsDir = resolve(args.reports || outDir);
  if (!existsSync(reportsDir) || !statSync(reportsDir).isDirectory()) {
    failClosed('REPORTS_ABSENT', `path=${reportsDir} detail=not-a-directory`);
  }
  const reports = countReports(reportsDir, rows);

  const ctx = deriveContext(outDir);
  const root = args.root ? resolve(args.root) : ctx && ctx.root;
  const round = args.round || (ctx && ctx.round);
  const wave = args.wave || (ctx && ctx.wave) || normSession(registryJson && registryJson.wave) || '-';

  mkdirSync(outDir, { recursive: true });
  const record = buildRecord(rows, reports, wave);
  writeAtomic(join(outDir, REGISTRY), `${JSON.stringify(record, null, 1)}\n`);
  writeAtomic(join(outDir, PROGRESS), progressText(rows));

  const summary = `seats=${record.planned} sessions=${record.sessionIds} exit0=${record.exit0} reports=${record.reports} dead=${record.dead.length}`;
  if (!args.verify) {
    process.stdout.write(`MAKE_DISPATCH_ACTUAL: WROTE out=${outDir} ${summary} members=${record.members.length} verify=skipped\n`);
    return 0;
  }
  if (!root || !round) {
    failClosed('ROOT_UNRESOLVED', `out=${outDir} detail=pass --root DIR --round N --wave NAME`);
  }
  if (!existsSync(args.gate)) failClosed('GATE_ABSENT', `path=${args.gate}`);
  if (!/^\d+$/.test(String(round))) usage('--round must be an integer');
  if (!NAME_RE.test(String(wave))) usage('--wave must be a plain directory name');

  const v = verify(args.gate, root, round, wave);
  if (v.error) failClosed('GATE_UNRUNNABLE', `path=${args.gate} err=${v.error.code || v.error.message}`);
  const verdict = v.code === 0 ? 'CLEAN' : 'DRIFT';
  process.stdout.write(`MAKE_DISPATCH_ACTUAL: ${verdict} out=${outDir} ${summary} members=${record.members.length} gate=${v.code}\n`);
  process.stdout.write(v.stdout);
  if (v.stderr) process.stderr.write(v.stderr);
  return v.code === 0 ? 0 : 1;
}

// ---------------------------------------------------------------- selftest fixtures

function writeFixtureWave(base, opts) {
  const waveDir = join(base, '.ufo', 'waves', 'round-1', 'w1');
  mkdirSync(waveDir, { recursive: true });
  const registry = {
    schema: 'ufo-swarm-registry-v1',
    wave: 'kumitate-r1-w1',
    createdAt: '2026-10-25T00:00:00.000Z',
    reportDir: '.ufo/waves/round-1/w1',
    members: {},
  };
  for (const m of opts.members) {
    registry.members[m.name] = { kind: 'spawn', agentId: m.agentId, role: 'executor', item: null };
    if (m.report) writeFileSync(join(waveDir, `${m.name}.md`), `# ${m.name}\n\nfixture report\n`);
  }
  const registryPath = join(waveDir, 'swarm-registry.json');
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
  const resultsPath = join(base, 'settle.json');
  writeFileSync(resultsPath, `${JSON.stringify({ schema: 'ufo-settle-v1', members: opts.results }, null, 1)}\n`);
  return { waveDir, registryPath, resultsPath };
}

function runTool(args) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...args], { encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error || null };
}

function selftest() {
  const cases = [];
  const T = mkdtempSync(join(tmpdir(), 'make-dispatch-actual-selftest.'));
  const gate = join(HERE, 'dispatch-evidence.mjs');
  const add = (name, ok, detail) => cases.push([name, ok, detail]);
  try {
    // A — known-good inputs round-trip to a record the gate reads CLEAN.
    {
      const base = join(T, 'good');
      const f = writeFixtureWave(base, {
        members: [
          { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true },
          { name: 'ExecBravo', agentId: 'L1Test.ExecBravo', report: true },
          { name: 'ExecCharlie', agentId: 'L1Test.ExecCharlie', report: true },
        ],
        results: [
          { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', status: 'completed', pid: 1001, start: 1790000000, end: 1790000100 },
          { name: 'ExecBravo', agentId: 'L1Test.ExecBravo', status: 'completed', pid: 1002, start: 1790000000, end: 1790000110 },
          { name: 'ExecCharlie', agentId: 'L1Test.ExecCharlie', status: 'completed', pid: 1003, start: 1790000000, end: 1790000120 },
        ],
      });
      const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
      const clean = r.code === 0 && r.stdout.includes('DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)');
      let arrayOk = false;
      let tsvOk = false;
      try {
        const rec = JSON.parse(readFileSync(join(f.waveDir, REGISTRY), 'utf8'));
        arrayOk = Array.isArray(rec.members) && rec.members.length === 3
          && rec.members[0].agentId === 'L1Test.ExecAlpha'
          && rec.planned === 3 && rec.sessionIds === 3 && rec.exit0 === 3 && rec.reports === 3
          && Array.isArray(rec.dead) && rec.dead.length === 0;
        const tsv = readFileSync(join(f.waveDir, PROGRESS), 'utf8').split('\n').filter(Boolean);
        tsvOk = tsv.length === 3 && tsv.every((l) => /^Exec[A-Za-z]+\tsession=L1Test\.\S+\texit=0\tpid=\d+\tstart=\d+\tend=\d+$/.test(l));
      } catch { arrayOk = false; }
      add('known-good-roundtrip', clean && arrayOk && tsvOk,
        `tool=${r.code} array=${arrayOk} tsv=${tsvOk} ${(r.stdout.split('\n').find((l) => l.startsWith('DISPATCH_EVIDENCE:')) || r.stderr.trim()).slice(0, 160)}`);
    }
    // B — array-vs-object members: the gate still rejects an object-keyed record.
    {
      const src = join(T, 'good');
      const base = join(T, 'object-members');
      cpSync(src, base, { recursive: true });
      const recordPath = join(base, '.ufo', 'waves', 'round-1', 'w1', REGISTRY);
      const rec = JSON.parse(readFileSync(recordPath, 'utf8'));
      const asObject = {};
      for (const m of rec.members) asObject[m.name] = m;
      rec.members = asObject;
      writeFileSync(recordPath, `${JSON.stringify(rec, null, 1)}\n`);
      const v = verify(gate, base, '1', 'w1');
      add('object-members-rejected', v.code === 1 && /REGISTRY_UNREADABLE:members-absent/.test(v.stdout),
        `gate=${v.code} ${(v.stdout.split('\n').find((l) => l.startsWith('DISPATCH_EVIDENCE:')) || '').slice(0, 160)}`);
    }
    // C — null agentId everywhere (the R60 registry shape): written as-is, gate says NOT_A_DISPATCH.
    {
      const base = join(T, 'null-ids');
      const f = writeFixtureWave(base, {
        members: [
          { name: 'ExecAlpha', agentId: null, report: false },
          { name: 'ExecBravo', agentId: null, report: false },
          { name: 'ExecCharlie', agentId: null, report: false },
        ],
        results: [
          { name: 'ExecAlpha', agentId: null, exit: -9, status: 'failed' },
          { name: 'ExecBravo', agentId: null, exit: -9, status: 'failed' },
          { name: 'ExecCharlie', agentId: null, exit: -9, status: 'failed' },
        ],
      });
      const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
      const g = verify(gate, base, '1', 'w1');
      const rejects = r.code === 1 && g.code === 1 && /NOT_A_DISPATCH/.test(g.stdout) && /NOT_A_DISPATCH/.test(r.stdout);
      add('null-agentId-rejected', rejects,
        `tool=${r.code} gate=${g.code} ${(g.stdout.split('\n').find((l) => l.startsWith('DISPATCH_EVIDENCE:')) || '').slice(0, 160)}`);
    }
    // D — a dead seat is named as dead, not credited and not drift.
    {
      const base = join(T, 'dead-seat');
      const f = writeFixtureWave(base, {
        members: [
          { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true },
          { name: 'ExecBravo', agentId: 'L1Test.ExecBravo', report: true },
          { name: 'ExecDead', agentId: null, report: false },
        ],
        results: [
          { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', exit: 0, status: 'settled', pid: 1001, start: 1790000000, end: 1790000100 },
          { name: 'ExecBravo', agentId: 'L1Test.ExecBravo', exit: 0, status: 'settled', pid: 1002, start: 1790000000, end: 1790000110 },
          { name: 'ExecDead', agentId: null, exit: -9, status: 'failed', pid: 1003, start: 1790000000, end: 1790000420 },
        ],
      });
      const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
      let deadOk = false;
      try {
        const rec = JSON.parse(readFileSync(join(f.waveDir, REGISTRY), 'utf8'));
        deadOk = rec.dead.length === 1 && rec.dead[0] === 'ExecDead' && rec.sessionIds === 2 && rec.exit0 === 2;
        const tsv = readFileSync(join(f.waveDir, PROGRESS), 'utf8');
        deadOk = deadOk && /^ExecDead\tsession=null\texit=-9\t/m.test(tsv);
      } catch { deadOk = false; }
      const clean = r.code === 0 && r.stdout.includes('DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=2 exit0=2 reports=2 dead=1)');
      add('dead-seat-named', clean && deadOk,
        `tool=${r.code} dead=${deadOk} ${(r.stdout.split('\n').find((l) => l.startsWith('DISPATCH_EVIDENCE:')) || r.stderr.trim()).slice(0, 160)}`);
    }
    // D2 — status and numeric exit must agree; contradictory evidence cannot be settled.
    {
      const base = join(T, 'status-exit-mismatch');
      const f = writeFixtureWave(base, {
        members: [{ name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true }],
        results: [{ name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', exit: 0, status: 'failed' }],
      });
      const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
      add('contradictory-status-exit-rejected',
        r.code === 2 && /RESULT_STATUS_MISMATCH/.test(r.stderr) && !existsSync(join(f.waveDir, REGISTRY)),
        `tool=${r.code} ${r.stderr.trim().slice(0, 160)}`);
    }
    // E — a settled seat the registry never planned is fail-closed, not silently added.
    {
      const base = join(T, 'unplanned');
      const f = writeFixtureWave(base, {
        members: [{ name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true }],
        results: [
          { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', exit: 0, status: 'settled' },
          { name: 'ExecGhost', agentId: 'L1Test.ExecGhost', exit: 0, status: 'settled' },
        ],
      });
      const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
      add('unplanned-seat-fail-closed', r.code === 2 && /UNPLANNED_SEAT/.test(r.stderr) && !existsSync(join(f.waveDir, REGISTRY)),
        `tool=${r.code} ${r.stderr.trim().slice(0, 160)}`);
    }
    // F — a launcher that died before writing a registry still leaves TSV rows.
    {
      const base = join(T, 'tsv-results');
      const f = writeFixtureWave(base, {
        members: [
          { name: 'ExecAlpha', agentId: null, report: true },
          { name: 'ExecBravo', agentId: null, report: true },
        ],
        results: [],
      });
      const tsv = [
        'ExecAlpha\tpid=9001\tsession=session_aaaa\texit=0\tstart=1790000000\tend=1790000100\terr=',
        'ExecBravo\tpid=9002\tsession=session_bbbb\texit=0\tstart=1790000000\tend=1790000110\terr=',
      ].join('\n');
      const tsvPath = join(base, 'launcher-progress.tsv');
      writeFileSync(tsvPath, `${tsv}\n`);
      const r = runTool(['--registry', f.registryPath, '--results', tsvPath, '--reports', f.waveDir]);
      const clean = r.code === 0 && r.stdout.includes('DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=2 exit0=2 reports=2 dead=0)');
      let idsOk = false;
      try {
        const rec = JSON.parse(readFileSync(join(f.waveDir, REGISTRY), 'utf8'));
        idsOk = rec.members[0].agentId === 'session_aaaa' && rec.members[1].agentId === 'session_bbbb';
      } catch { idsOk = false; }
      add('tsv-settle-roundtrip', clean && idsOk,
        `tool=${r.code} ids=${idsOk} ${(r.stdout.split('\n').find((l) => l.startsWith('DISPATCH_EVIDENCE:')) || r.stderr.trim()).slice(0, 160)}`);
    }
    // I — reject contradictory aliases and unparseable exits rather than laundering status.
    {
      const failures = [];
      for (const [label, result, code] of [
        ['unparseable-exit', { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', exit: 'abc', status: 'completed' }, 'RESULT_FIELD_UNREADABLE'],
        ['conflicting-exit-aliases', { name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', exit: 0, exitCode: -9, status: 'completed' }, 'RESULT_FIELDS_CONFLICT'],
      ]) {
        const base = join(T, label);
        const f = writeFixtureWave(base, {
          members: [{ name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true }],
          results: [result],
        });
        const r = runTool(['--registry', f.registryPath, '--results', f.resultsPath, '--reports', f.waveDir]);
        failures.push(r.code === 2 && r.stderr.includes(code) && !existsSync(join(f.waveDir, REGISTRY)));
      }
      add('invalid-result-fields-rejected', failures.every(Boolean), `cases=${failures.filter(Boolean).length}/2`);
    }
    // J — the TSV arm enforces the same status/exit contract as JSON.
    {
      const base = join(T, 'tsv-status-mismatch');
      const f = writeFixtureWave(base, {
        members: [{ name: 'ExecAlpha', agentId: 'L1Test.ExecAlpha', report: true }],
        results: [],
      });
      const tsvPath = join(base, 'contradictory.tsv');
      writeFileSync(tsvPath, 'ExecAlpha\tsession=L1Test.ExecAlpha\texit=0\tstatus=failed\n');
      const r = runTool(['--registry', f.registryPath, '--results', tsvPath, '--reports', f.waveDir]);
      add('tsv-status-exit-mismatch-rejected',
        r.code === 2 && r.stderr.includes('RESULT_STATUS_MISMATCH') && !existsSync(join(f.waveDir, REGISTRY)),
        `tool=${r.code} ${r.stderr.trim().slice(0, 140)}`);
    }
    // G — registry-shaped metadata without `members` is fail-closed, never a member map.
    {
      const base = join(T, 'meta-only');
      const waveDir = join(base, '.ufo', 'waves', 'round-1', 'w1');
      mkdirSync(waveDir, { recursive: true });
      const registryPath = join(waveDir, 'swarm-registry.json');
      writeFileSync(registryPath, `${JSON.stringify({ schema: 'ufo-swarm-registry-v1', wave: 'kumitate-r1-w1' }, null, 1)}\n`);
      const r = runTool(['--registry', registryPath, '--results', registryPath, '--reports', waveDir]);
      add('metadata-only-registry-fail-closed', r.code === 2 && /REGISTRY_UNREADABLE/.test(r.stderr) && !existsSync(join(waveDir, REGISTRY)),
        `tool=${r.code} ${r.stderr.trim().slice(0, 160)}`);
    }
    // H — usage.
    {
      const r = runTool([]);
      add('usage-64', r.code === 64 && /MAKE_DISPATCH_ACTUAL: USAGE/.test(r.stderr), `tool=${r.code}`);
    }
  } finally {
    rmSync(T, { recursive: true, force: true });
  }
  let passed = 0;
  for (const [name, ok, detail] of cases) {
    process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}\n`);
    if (ok) passed += 1;
  }
  process.stdout.write(`MAKE_DISPATCH_ACTUAL_SELFTEST: ${passed === cases.length ? 'PASS' : 'FAIL'} (${passed}/${cases.length})\n`);
  process.stdout.write(`VERDICT: ${passed === cases.length ? 'PASS' : 'FAIL'}\n`);
  process.exit(passed === cases.length ? 0 : 1);
}

process.exit(main(process.argv.slice(2)));
