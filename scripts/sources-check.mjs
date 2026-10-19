#!/usr/bin/env node
/**
 * sources-check.mjs — validate the lane's curated source registry and its
 * knowledge-entry citations (contract `kumitate-sources-v1`).
 *
 * Reads only `corpus/SOURCES.md` and direct `corpus/knowledge/*.md` entries.
 * It does not use the network or modify the live tree. `--selftest` creates
 * and removes isolated fixtures under the operating-system temporary directory.
 *
 * Findings (fleet `sources-census.sh validate` correspondence):
 *   error ROW_MALFORMED       E01  a `| S[0-9]{3,} |` row has split-field count != 13
 *         ID_FORM             E02  a registry row id is not `S[0-9]{3,}`
 *         ID_DUPLICATE        E03  an otherwise well-formed registry id is repeated
 *         ROW_OUTSIDE_REGISTRY E12 a source-shaped row is outside `## Registry`
 *         ROW_FIELD_EMPTY      —  a required registry cell is empty
 *         KIND_ENUM           E05  kind is not in the frozen registry enum
 *         TIER_ENUM           E06  tier is not A, B, or C
 *         STATUS_ENUM         E07  status is not queued, mined, or rejected
 *         TIER_INFLATION      E10  a community source is assigned tier A
 *         OPENED_INVALID     E08  opened is not a real ISO date on/before today
 *         RECHECK_INVALID    E09  recheck is not an ISO date, Nd cadence, or on-release
 *         USED_BY_MISSING    E11  a mined row names a repo-relative path absent on disk
 *         MINED_UNUSED       W03  a mined row has used-by `—` or an empty cell
 *         REJECTED_NO_REASON  —   rejected teaches lacks `REJECTED:`
 *         REJECTED_NO_FLIP   W02  rejected teaches lacks `flip:`
 *         SECTION_MISSING      —   one of the four contract headings is absent
 *         ENTRY_SOURCE_UNKNOWN — a knowledge header cites an unregistered S id
 *         ENTRY_HEADER_REQUIRED — a non-legacy knowledge file lacks `source:`
 *         HEADER_INCOMPLETE    —   a source-header entry has missing/empty trio values
 *   warn  USED_BY_ASYMMETRY    — an entry citation is absent from that row's used-by
 *         RECHECK_OVERDUE      — an ISO recheck date or opened + Nd is before today
 *
 * Fleet codes E01-E03/E05-E12/W02/W03 retain the fleet validate meanings;
 * E04, W01 and other fleet checks are intentionally outside this contract.
 * `RECHECK_OVERDUE` maps to the fleet `overdue` report (which has no validate
 * code); `—` means no fleet validate code. The legacy-entry count is information,
 * never a finding; the only exempt identities are frozen from base `16a5441`.
 *
 * Verdict (the final text-mode stdout line):
 *   SOURCES_CHECK: CLEAN (rows=N tiers=A:a,B:b,C:c status=queued:q,mined:m,rejected:r entries_with_source=k legacy=l)
 *   SOURCES_CHECK: DRIFT (<kind list>)
 *   SOURCES_CHECK: FAIL-CLOSED (<kind>)
 * Exit map: 0 clean (warnings are advisory) · 1 drift (`--strict` promotes warnings)
 *           · 2 fail-closed · 64 usage. `--json` prints one JSON object instead.
 */
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync,
  statSync, writeFileSync, realpathSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-sources-v1';
const TOOL_FILE = fileURLToPath(import.meta.url);
const HERE = dirname(TOOL_FILE);
const DEFAULT_SELF = resolve(HERE, '..');
const TODAY_UTC = new Date().toISOString().slice(0, 10);
const REQUIRED_SECTIONS = ['Registry', 'Paths', 'Search log', 'Leads (unopened)'];
/** Direct knowledge paths present at frozen base 16a5441; appended material stays legacy, not a new admission. */
const LEGACY_KNOWLEDGE_FILES = Object.freeze([
  'corpus/knowledge/cost-and-profile.md',
  'corpus/knowledge/dispatch-shapes.md',
  'corpus/knowledge/distill-and-l3.md',
  'corpus/knowledge/enqueue-admission.md',
  'corpus/knowledge/executable-scorecard.md',
  'corpus/knowledge/failure-telemetry.md',
  'corpus/knowledge/gate-verdict.md',
  'corpus/knowledge/kimi-binary-secrets.md',
  'corpus/knowledge/kimi-config-plane.md',
  'corpus/knowledge/kimi-lane-definitions.md',
  'corpus/knowledge/kimi-modes-machinery.md',
  'corpus/knowledge/kimi-residue-files.md',
  'corpus/knowledge/kimi-session-state.md',
  'corpus/knowledge/kimi-skills-plugins.md',
  'corpus/knowledge/layer-axes.md',
  'corpus/knowledge/live-surface-probe.md',
  'corpus/knowledge/local-ship.md',
  'corpus/knowledge/loop-driver.md',
  'corpus/knowledge/member-claims-gate.md',
  'corpus/knowledge/native-admission-detail.md',
  'corpus/knowledge/native-judge-pipeline.md',
  'corpus/knowledge/native-transcript-ledger-seats.md',
  'corpus/knowledge/native-trial-launch.md',
  'corpus/knowledge/ops-watchers.md',
  'corpus/knowledge/queue-and-claim.md',
  'corpus/knowledge/queue-summary.md',
  'corpus/knowledge/reconcile-and-cycle.md',
  'corpus/knowledge/remaining-scripts-census.md',
  'corpus/knowledge/round-close-gate.md',
  'corpus/knowledge/route-probe-cluster.md',
  'corpus/knowledge/route-resolution.md',
  'corpus/knowledge/runtime-remainder-census.md',
  'corpus/knowledge/runtime-support.md',
  'corpus/knowledge/sighting-wall.md',
  'corpus/knowledge/singleton-and-queue-ownership.md',
  'corpus/knowledge/successor-chain.md',
  'corpus/knowledge/swarm-wave-lifecycle.md',
  'corpus/knowledge/test-inventories.md',
]);
const KINDS = Object.freeze({
  spec: true, docs: true, paper: true, code: true, tool: true,
  dataset: true, talk: true, book: true, community: true, 'own-work': true,
});
const TIERS = Object.freeze({ A: true, B: true, C: true });
const STATUSES = Object.freeze({ queued: true, mined: true, rejected: true });
const FINDING_KINDS = [
  'ROW_MALFORMED', 'ID_FORM', 'ID_DUPLICATE', 'ROW_OUTSIDE_REGISTRY', 'ROW_FIELD_EMPTY',
  'KIND_ENUM', 'TIER_ENUM', 'STATUS_ENUM', 'TIER_INFLATION', 'OPENED_INVALID',
  'RECHECK_INVALID', 'USED_BY_MISSING', 'MINED_UNUSED', 'REJECTED_NO_REASON',
  'REJECTED_NO_FLIP', 'SECTION_MISSING', 'ENTRY_SOURCE_UNKNOWN',
  'ENTRY_HEADER_REQUIRED', 'HEADER_INCOMPLETE', 'USED_BY_ASYMMETRY',
  'RECHECK_OVERDUE',
];
const FAIL_CLOSED_KINDS = ['SOURCES_MISSING', 'SELF_NOT_A_DIR', 'READ_FAILED'];
const USAGE = `usage: node scripts/sources-check.mjs [options]
       node scripts/sources-check.mjs --selftest
       node scripts/sources-check.mjs -h|--help
contract id: ${CONTRACT}

options
  --self DIR      lane root (default: this script's parent directory)
  --today DATE    ISO YYYY-MM-DD used for opened/recheck validation (default: UTC today)
  --json          print one machine-readable JSON object
  --strict        promote warning findings to errors
  --selftest      run hermetic fixtures under the OS temporary directory
  -h, --help      print this help

findings: ${FINDING_KINDS.join(' ')}
exit map: 0 clean · 1 drift (warnings too under --strict) · 2 fail-closed · 64 usage
`;

function trim(value) { return value.trim(); }

/** Real proleptic-Gregorian ISO date -> integer UTC day; null for invalid dates. */
function isoDay(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > monthDays[month - 1]) return null;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return Math.floor(date.getTime() / 86_400_000);
}

function splitUsedBy(value) {
  return value.split(',').map(trim).filter((part) => part !== '' && part !== '—');
}

function repoPathExists(root, repoPath) {
  const candidate = resolve(root, repoPath);
  const rel = relative(root, candidate);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return false;
  return existsSync(candidate);
}

function failClosed(kind, detail) {
  return { failClosed: { kind, detail }, findings: [], counts: null, info: null };
}

function runCheck(opts) {
  let selfStat;
  try { selfStat = statSync(opts.self); } catch {
    return failClosed('SELF_NOT_A_DIR', `${opts.self} is not a directory`);
  }
  if (!selfStat.isDirectory()) return failClosed('SELF_NOT_A_DIR', `${opts.self} is not a directory`);

  const sourcesPath = join(opts.self, 'corpus', 'SOURCES.md');
  let sourcesStat;
  try { sourcesStat = statSync(sourcesPath); } catch (error) {
    if (error?.code === 'ENOENT') return failClosed('SOURCES_MISSING', 'corpus/SOURCES.md is absent');
    return failClosed('READ_FAILED', `cannot inspect corpus/SOURCES.md (${error?.code ?? 'unknown error'})`);
  }
  if (!sourcesStat.isFile()) return failClosed('READ_FAILED', 'corpus/SOURCES.md is not a readable file');

  let sourceText;
  try { sourceText = readFileSync(sourcesPath, 'utf8'); } catch (error) {
    return failClosed('READ_FAILED', `cannot read corpus/SOURCES.md (${error?.code ?? 'unknown error'})`);
  }
  const sourceLines = sourceText.split(/\r?\n/);
  const findings = [];
  const add = (severity, kind, path, line, detail) => {
    findings.push({ severity, kind, path, ...(line === null ? {} : { line }), detail });
  };
  const headings = Object.create(null);
  const sectionAtLine = [];
  let activeSection = null;
  for (let index = 0; index < sourceLines.length; index += 1) {
    const match = /^## (.+?)\s*$/.exec(sourceLines[index]);
    if (match) {
      activeSection = match[1];
      headings[activeSection] = true;
    } else if (/^#(?:\s|$)/.test(sourceLines[index])) {
      activeSection = null;
    }
    sectionAtLine[index] = activeSection;
  }
  for (const section of REQUIRED_SECTIONS) {
    if (!Object.hasOwn(headings, section)) {
      add('error', 'SECTION_MISSING', 'corpus/SOURCES.md', null, `missing ## ${section}`);
    }
  }

  const counts = {
    rows: 0,
    tiers: { A: 0, B: 0, C: 0 },
    status: { queued: 0, mined: 0, rejected: 0 },
    entriesWithSource: 0,
    legacy: 0,
  };
  const rowsById = Object.create(null);
  const declaredIds = Object.create(null);
  const seenIds = Object.create(null);
  const seenDuplicates = Object.create(null);

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    if (!line.startsWith('|')) continue;
    const fields = line.split('|');
    const id = trim(fields[1] ?? '');
    if (sectionAtLine[index] !== 'Registry') {
      if (/^\|[ \t]*S\d{3,}[ \t]*\|/.test(line)) {
        add('error', 'ROW_OUTSIDE_REGISTRY', 'corpus/SOURCES.md', index + 1, `id=${id} row outside Registry section`);
      }
      continue;
    }
    if (id === '') {
      if (fields.slice(2, -1).some((field) => trim(field) !== '')) {
        add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, 'id=(empty)');
      }
      continue;
    }
    if (id.toLowerCase() === 'id' || /^:?-{3,}:?$/.test(id)) continue;
    const validId = /^S\d{3,}$/.test(id);
    if (validId) {
      counts.rows += 1;
      declaredIds[id] = true;
      if (Object.hasOwn(seenIds, id)) {
        if (!Object.hasOwn(seenDuplicates, id)) {
          add('error', 'ID_DUPLICATE', 'corpus/SOURCES.md', index + 1, `id=${id}`);
          seenDuplicates[id] = true;
        }
      } else seenIds[id] = true;
      const censusTier = trim(fields[4] ?? '');
      const censusStatus = trim(fields[8] ?? '');
      if (Object.hasOwn(TIERS, censusTier)) counts.tiers[censusTier] += 1;
      if (Object.hasOwn(STATUSES, censusStatus)) counts.status[censusStatus] += 1;
    } else add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, `id=${id || '(empty)'}`);

    if (fields.length !== 13) {
      if (validId) add('error', 'ROW_MALFORMED', 'corpus/SOURCES.md', index + 1, `id=${id} split-fields=${fields.length}; expected 13`);
      continue;
    }

    const row = {
      id,
      source: trim(fields[2]),
      kind: trim(fields[3]),
      tier: trim(fields[4]),
      scope: trim(fields[5]),
      anchor: trim(fields[6]),
      teaches: trim(fields[7]),
      status: trim(fields[8]),
      opened: trim(fields[9]),
      recheck: trim(fields[10]),
      usedBy: trim(fields[11]),
      line: index + 1,
    };
    if (validId && !Object.hasOwn(rowsById, id)) rowsById[id] = row;
    for (const [field, value] of Object.entries({
      source: row.source, kind: row.kind, tier: row.tier, scope: row.scope,
      anchor: row.anchor, teaches: row.teaches, status: row.status,
      opened: row.opened, recheck: row.recheck, 'used-by': row.usedBy,
    })) {
      if (value === '') add('error', 'ROW_FIELD_EMPTY', 'corpus/SOURCES.md', row.line, `id=${id} field=${field}`);
    }

    if (Object.hasOwn(KINDS, row.kind) === false) {
      add('error', 'KIND_ENUM', 'corpus/SOURCES.md', row.line, `id=${id} kind=${row.kind}`);
    }
    if (!Object.hasOwn(TIERS, row.tier)) {
      add('error', 'TIER_ENUM', 'corpus/SOURCES.md', row.line, `id=${id} tier=${row.tier}`);
    }
    if (!Object.hasOwn(STATUSES, row.status)) {
      add('error', 'STATUS_ENUM', 'corpus/SOURCES.md', row.line, `id=${id} status=${row.status}`);
    }
    if (row.kind === 'community' && row.tier === 'A') {
      add('error', 'TIER_INFLATION', 'corpus/SOURCES.md', row.line, `id=${id} community at tier A`);
    }

    const openedDay = isoDay(row.opened);
    if (openedDay === null || openedDay > opts.todayDay) {
      add('error', 'OPENED_INVALID', 'corpus/SOURCES.md', row.line, `id=${id} opened=${row.opened}`);
    }
    const recheckDay = isoDay(row.recheck);
    const cadence = /^(\d+)d$/.exec(row.recheck);
    if (recheckDay === null && cadence === null && row.recheck !== 'on-release') {
      add('error', 'RECHECK_INVALID', 'corpus/SOURCES.md', row.line, `id=${id} recheck=${row.recheck}`);
    }
    if (row.status === 'mined') {
      if (row.usedBy === '' || row.usedBy === '—') {
        add('error', 'MINED_UNUSED', 'corpus/SOURCES.md', row.line, `id=${id} mined with no used-by path`);
      } else {
        for (const usedPath of splitUsedBy(row.usedBy)) {
          if (!repoPathExists(opts.self, usedPath)) {
            add('error', 'USED_BY_MISSING', 'corpus/SOURCES.md', row.line, `id=${id} missing used-by ${usedPath}`);
          }
        }
      }
    }
    if (row.status === 'rejected') {
      if (!row.teaches.includes('REJECTED:')) {
        add('error', 'REJECTED_NO_REASON', 'corpus/SOURCES.md', row.line, `id=${id} rejected teaches lacks REJECTED:`);
      }
      if (!row.teaches.includes('flip:')) {
        add('error', 'REJECTED_NO_FLIP', 'corpus/SOURCES.md', row.line, `id=${id} rejected teaches lacks flip:`);
      }
    }
    if (recheckDay !== null && recheckDay < opts.todayDay) {
      add('warn', 'RECHECK_OVERDUE', 'corpus/SOURCES.md', row.line, `id=${id} recheck=${row.recheck}`);
    } else if (cadence !== null && openedDay !== null) {
      try {
        if (BigInt(openedDay) + BigInt(cadence[1]) < BigInt(opts.todayDay)) {
          add('warn', 'RECHECK_OVERDUE', 'corpus/SOURCES.md', row.line, `id=${id} opened=${row.opened} recheck=${row.recheck}`);
        }
      } catch { /* An arbitrarily large valid cadence cannot be overdue. */ }
    }
  }

  const knowledgeDir = join(opts.self, 'corpus', 'knowledge');
  let knowledgeFiles;
  try {
    knowledgeFiles = readdirSync(knowledgeDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    return failClosed('READ_FAILED', `cannot read corpus/knowledge (${error?.code ?? 'unknown error'})`);
  }

  for (const name of knowledgeFiles) {
    const relPath = `corpus/knowledge/${name}`;
    let text;
    try { text = readFileSync(join(knowledgeDir, name), 'utf8'); } catch (error) {
      return failClosed('READ_FAILED', `cannot read ${relPath} (${error?.code ?? 'unknown error'})`);
    }
    const lines = text.split(/\r?\n/);
    const hasSourceHeader = lines[0]?.startsWith('source:') === true;
    if (!hasSourceHeader) {
      if (LEGACY_KNOWLEDGE_FILES.includes(relPath)) {
        counts.legacy += 1;
      } else {
        add('error', 'ENTRY_HEADER_REQUIRED', relPath, 1, 'non-legacy knowledge file lacks source: header');
      }
      continue;
    }
    counts.entriesWithSource += 1;
    const header = lines.slice(0, 5);
    const sourceIds = [...new Set((lines[0].match(/\bS\d{3,}\b/g) ?? []))];
    for (const id of sourceIds) {
      if (!Object.hasOwn(declaredIds, id)) {
        add('error', 'ENTRY_SOURCE_UNKNOWN', relPath, 1, `source header cites unregistered ${id}`);
        continue;
      }
      const row = rowsById[id];
      if (row && !splitUsedBy(row.usedBy).includes(relPath)) {
        add('warn', 'USED_BY_ASYMMETRY', relPath, 1, `${id} used-by omits ${relPath}`);
      }
    }
    const hasSourceValue = /^source:\s*\S/.test(lines[0] ?? '');
    const hasVerifiedAt = header.some((line) => /^verified-at:\s*\S/.test(line));
    const hasRecheck = header.some((line) => /^recheck:\s*\S/.test(line));
    if (!hasSourceValue || !hasVerifiedAt || !hasRecheck) {
      const missing = [
        !hasSourceValue ? 'source:' : '',
        !hasVerifiedAt ? 'verified-at:' : '',
        !hasRecheck ? 'recheck:' : '',
      ].filter(Boolean).join(', ');
      add('error', 'HEADER_INCOMPLETE', relPath, 1, `source header missing/empty ${missing} in first 5 lines`);
    }
  }

  return {
    failClosed: null,
    findings,
    counts,
    info: { legacyEntriesWithoutHeader: counts.legacy },
  };
}

function parseArgs(argv) {
  const opts = { self: DEFAULT_SELF, today: TODAY_UTC, json: false, strict: false, selftest: false, help: false };
  const need = (flag, value) => (value === undefined || value.trim() === '' || value.startsWith('-'))
    ? { error: `${flag} needs a value` }
    : { value };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self') {
      const result = need(arg, argv[++i]);
      if (result.error) return result;
      opts.self = resolve(result.value);
      continue;
    }
    if (arg === '--today') {
      const result = need(arg, argv[++i]);
      if (result.error) return result;
      opts.today = result.value;
      continue;
    }
    if (arg === '--json') { opts.json = true; continue; }
    if (arg === '--strict') { opts.strict = true; continue; }
    if (arg === '--selftest' || arg === '--self-test') { opts.selftest = true; continue; }
    if (arg === '-h' || arg === '--help') { opts.help = true; continue; }
    return { error: `unsupported argument: ${arg}` };
  }
  const todayDay = isoDay(opts.today);
  if (todayDay === null) return { error: `--today must be an ISO YYYY-MM-DD date: ${opts.today}` };
  opts.todayDay = todayDay;
  return { opts };
}

function scrub(value) { return String(value).replace(/[\r\n\t]+/g, ' '); }
function effectiveSeverity(finding, strict) { return strict && finding.severity === 'warn' ? 'error' : finding.severity; }
function unique(values) { return [...new Set(values)]; }

function countsVerdict(counts) {
  return `rows=${counts.rows} tiers=A:${counts.tiers.A},B:${counts.tiers.B},C:${counts.tiers.C} `
    + `status=queued:${counts.status.queued},mined:${counts.status.mined},rejected:${counts.status.rejected} `
    + `entries_with_source=${counts.entriesWithSource} legacy=${counts.legacy}`;
}

function emitResult(result, opts) {
  if (result.failClosed) {
    const { kind, detail } = result.failClosed;
    if (opts.json) {
      process.stdout.write(`${JSON.stringify({ schema: CONTRACT, verdict: 'FAIL-CLOSED', exitCode: 2, failClosed: { kind, detail }, findings: [], counts: null })}\n`);
    } else {
      process.stdout.write(`SOURCES  fail-closed  ${kind}  ${scrub(detail)}\n`);
      process.stdout.write(`SOURCES_CHECK: FAIL-CLOSED (${kind})\n`);
    }
    return 2;
  }

  const errors = result.findings.filter((f) => f.severity === 'error');
  const warnings = result.findings.filter((f) => f.severity === 'warn');
  const driftFindings = result.findings.filter((f) => effectiveSeverity(f, opts.strict) === 'error');
  const exitCode = driftFindings.length ? 1 : 0;
  const verdict = exitCode === 1 ? 'DRIFT' : 'CLEAN';
  const driftKinds = unique(driftFindings.map((f) => f.kind));
  if (opts.json) {
    const findings = result.findings.map((f) => ({ ...f, severity: effectiveSeverity(f, opts.strict) }));
    process.stdout.write(`${JSON.stringify({
      schema: CONTRACT,
      verdict,
      exitCode,
      findings,
      totals: { errors: driftFindings.length, warnings: opts.strict ? 0 : warnings.length },
      counts: result.counts,
      info: result.info,
    })}\n`);
    return exitCode;
  }

  for (const finding of result.findings) {
    const severity = effectiveSeverity(finding, opts.strict);
    const location = `${finding.path}${finding.line === undefined ? '' : `:${finding.line}`}`;
    process.stdout.write(`SOURCES  ${severity}  ${finding.kind}  ${location}  ${scrub(finding.detail)}\n`);
  }
  if (result.info.legacyEntriesWithoutHeader > 0) {
    process.stdout.write(`SOURCES  info  LEGACY_NO_HEADER  count=${result.info.legacyEntriesWithoutHeader}\n`);
  }
  if (exitCode === 1) process.stdout.write(`SOURCES_CHECK: DRIFT (${driftKinds.join(',')})\n`);
  else process.stdout.write(`SOURCES_CHECK: CLEAN (${countsVerdict(result.counts)})\n`);
  return exitCode;
}

function runCli(argv) {
  const parsed = parseArgs(argv);
  if (parsed.error) {
    process.stdout.write(`sources-check: ${parsed.error}\n${USAGE}`);
    return 64;
  }
  const opts = parsed.opts;
  if (opts.help) { process.stdout.write(USAGE); return 0; }
  if (opts.selftest) return selfTest();
  return emitResult(runCheck(opts), opts);
}

/* ---------------------------------------------------------------- selftest */
const FIXTURE_TODAY = '2026-10-19';
const BASE_ENTRY = `source: S001 https://example.test/one\nverified-at: ${FIXTURE_TODAY} fixture r1\nrecheck: on-release\n\n# Fixture knowledge\n`;

function makeRow({
  id = 'S002', kind = 'docs', tier = 'A', scope = 'fixture scope', anchor = '§ Fixture; r1',
  teaches = 'fixture teaches', status = 'queued', opened = FIXTURE_TODAY,
  recheck = 'on-release', usedBy = '—',
} = {}) {
  return `| ${[id, 'Fixture — https://example.test/source', kind, tier, scope, anchor, teaches, status, opened, recheck, usedBy].join(' | ')} |`;
}

function fixtureSources(rows, omittedSections = [], outsideRows = []) {
  const sections = REQUIRED_SECTIONS.filter((section) => !omittedSections.includes(section));
  const lines = ['# SOURCES — fixture', ''];
  for (const section of sections) {
    lines.push(`## ${section}`);
    if (section === 'Registry') {
      lines.push('', '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |');
      lines.push('|---|---|---|---|---|---|---|---|---|---|---|');
      lines.push(...rows, '');
    } else {
      lines.push(...(section === 'Paths' ? outsideRows : []), '');
    }
  }
  return `${lines.join('\n')}\n`;
}

function makeFixture(parent, name, {
  rows = [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' })],
  entry = BASE_ENTRY,
  omittedSections = [],
  knowledgeIsFile = false,
  omitSources = false,
  outsideRows = [],
  knowledgeName = 'alpha.md',
} = {}) {
  const root = join(parent, name);
  mkdirSync(join(root, 'corpus'), { recursive: true });
  if (knowledgeIsFile) writeFileSync(join(root, 'corpus', 'knowledge'), 'not a directory\n');
  else {
    mkdirSync(join(root, 'corpus', 'knowledge'), { recursive: true });
    if (entry !== null) writeFileSync(join(root, 'corpus', 'knowledge', knowledgeName), entry);
  }
  if (!omitSources) writeFileSync(join(root, 'corpus', 'SOURCES.md'), fixtureSources(rows, omittedSections, outsideRows));
  return root;
}

function runTool(args) {
  const result = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout: 15_000 });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error };
}

function finalLine(run) { return run.stdout.trim().split('\n').at(-1) ?? ''; }
function textKinds(run) {
  return run.stdout.split('\n').flatMap((line) => {
    const match = /^SOURCES\s+(?:error|warn)\s+([A-Z_]+)\s/.exec(line);
    return match ? [match[1]] : [];
  });
}

function selfTest() {
  const results = [];
  const observed = new Set();
  const failClosedSeen = new Set();
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-sources-check-'));
  const check = (label, fn) => {
    try {
      const result = fn();
      if (result.skip) results.push({ label, skip: true, detail: result.detail ?? '' });
      else results.push({ label, ok: Boolean(result.ok), detail: result.detail ?? '' });
    } catch (error) {
      results.push({ label, ok: false, detail: error?.stack ?? String(error) });
    }
  };
  const expectKind = (run, kind, status) => {
    const kinds = textKinds(run);
    for (const seen of kinds) observed.add(seen);
    return {
      ok: run.status === status && kinds.includes(kind),
      detail: `exit=${run.status} kinds=[${kinds.join(',')}] last=${finalLine(run)}`,
    };
  };
  const makeDefault = (name, overrides = {}) => makeFixture(tmp, name, overrides);

  try {
    const clean = makeDefault('clean');
    check('clean fixture returns CLEAN', () => {
      const run = runTool(['--self', clean, '--today', FIXTURE_TODAY]);
      return { ok: run.status === 0 && finalLine(run).startsWith('SOURCES_CHECK: CLEAN (rows=1 '), detail: `exit=${run.status} last=${finalLine(run)}` };
    });

    const cases = [
      ['ROW_MALFORMED', () => {
        const malformed = makeRow({ id: 'S002' }).slice(0, -2);
        const root = makeDefault('malformed', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), malformed] });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['ID_FORM', () => {
        const root = makeDefault('id-form', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S01' })] });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['ID_DUPLICATE', () => {
        const root = makeDefault('duplicate', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S001' })] });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['ROW_OUTSIDE_REGISTRY', () => {
        const root = makeDefault('row-outside-registry', {
          outsideRows: [makeRow({ id: 'S999' })],
        });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['ROW_FIELD_EMPTY', () => runCase('row-field-empty', { scope: '' })],
      ['KIND_ENUM', () => runCase('kind-enum', { kind: 'invalid' })],
      ['TIER_ENUM', () => runCase('tier-enum', { tier: 'D' })],
      ['STATUS_ENUM', () => runCase('status-enum', { status: 'watch' })],
      ['TIER_INFLATION', () => runCase('tier-inflation', { kind: 'community', tier: 'A' })],
      ['OPENED_INVALID', () => runCase('opened-invalid', { opened: '2026-02-30' })],
      ['RECHECK_INVALID', () => runCase('recheck-invalid', { recheck: '90 days' })],
      ['USED_BY_MISSING', () => runCase('used-by-missing', { status: 'mined', usedBy: 'corpus/knowledge/missing.md' })],
      ['MINED_UNUSED', () => runCase('mined-unused', { status: 'mined', usedBy: '—' })],
      ['REJECTED_NO_REASON', () => runCase('rejected-no-reason', { status: 'rejected', teaches: 'flip: new evidence changes scope' })],
      ['REJECTED_NO_FLIP', () => runCase('rejected-no-flip', { status: 'rejected', teaches: 'REJECTED: outside scope' })],
      ['SECTION_MISSING', () => {
        const root = makeDefault('section-missing', { omittedSections: ['Paths'] });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['ENTRY_SOURCE_UNKNOWN', () => {
        const root = makeDefault('entry-source-unknown', {
          rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })],
          entry: BASE_ENTRY.replace('S001', 'S999'),
        });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['HEADER_INCOMPLETE', () => {
        const root = makeDefault('header-incomplete', { entry: `source: S001 https://example.test/one\nverified-at: ${FIXTURE_TODAY} fixture r1\n\n# Fixture knowledge\n` });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }, 'missing recheck'],
      ['HEADER_INCOMPLETE', () => {
        const root = makeDefault('header-empty-trio-value', { entry: 'source:  \nverified-at:  \nrecheck:  \n# Fixture knowledge\n' });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }, 'empty header trio'],
      ['ENTRY_HEADER_REQUIRED', () => {
        const root = makeDefault('new-headerless', { entry: '# New knowledge\n' });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }, 'new headerless file'],
      ['ENTRY_HEADER_REQUIRED', () => {
        const root = makeDefault('new-source-header-removed', {
          entry: BASE_ENTRY.replace(/^source:[^\n]*\n/u, ''),
        });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }, 'source header removed from new entry'],
      ['USED_BY_ASYMMETRY', () => {
        const root = makeDefault('used-by-asymmetry', { rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })] });
        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
      }],
      ['RECHECK_OVERDUE', () => runCase('recheck-overdue', { recheck: '2026-10-18' })],
    ];
    function runCase(name, overrides) {
      const root = makeDefault(name, {
        rows: [
          makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }),
          makeRow({ id: 'S002', ...overrides }),
        ],
      });
      return runTool(['--self', root, '--today', FIXTURE_TODAY]);
    }
    for (const [kind, makeRun, label = kind] of cases) {
      const caseName = label === kind ? kind : `${kind} (${label})`;
      check(`${caseName}: fixture reports kind with expected exit`, () => {
        const run = makeRun();
        const expectedExit = kind === 'USED_BY_ASYMMETRY' || kind === 'RECHECK_OVERDUE' ? 0 : 1;
        return expectKind(run, kind, expectedExit);
      });
    }
    check('opened + Nd overdue uses a strict before-today boundary', () => {
      const run = runCase('recheck-overdue-cadence', { opened: '2026-10-17', recheck: '1d' });
      return expectKind(run, 'RECHECK_OVERDUE', 0);
    });
    check('opened + Nd exactly due today is not overdue', () => {
      const run = runCase('recheck-due-today', { opened: '2026-10-18', recheck: '1d' });
      const kinds = textKinds(run);
      for (const seen of kinds) observed.add(seen);
      return { ok: run.status === 0 && !kinds.includes('RECHECK_OVERDUE'), detail: `exit=${run.status} kinds=[${kinds.join(',')}] last=${finalLine(run)}` };
    });
    check('frozen 16a5441 legacy identity set has 38 unique paths', () => {
      const unique = new Set(LEGACY_KNOWLEDGE_FILES);
      return {
        ok: LEGACY_KNOWLEDGE_FILES.length === 38 && unique.size === 38,
        detail: `base=${LEGACY_KNOWLEDGE_FILES.length} unique=${unique.size}`,
      };
    });
    check('frozen base identity remains legacy and counted after append-only growth', () => {
      const root = makeDefault('legacy-base-note', {
        entry: '# Grandfathered knowledge\n',
        knowledgeName: 'cost-and-profile.md',
        rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })],
      });
      const run = runTool(['--self', root, '--today', FIXTURE_TODAY]);
      return {
        ok: run.status === 0 && finalLine(run).includes('entries_with_source=0 legacy=1'),
        detail: `exit=${run.status} last=${finalLine(run)}`,
      };
    });
    check('ROW_MALFORMED: an over-wide row (an extra cell, 14 split fields) is flagged', () => {
      const wide = `${makeRow({ id: 'S002' })} extra |`;
      const root = makeDefault('malformed-wide', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), wide] });
      return expectKind(runTool(['--self', root, '--today', FIXTURE_TODAY]), 'ROW_MALFORMED', 1);
    });
    check('ISO recheck exactly today is not overdue', () => {
      const run = runCase('recheck-iso-today', { recheck: FIXTURE_TODAY });
      const kinds = textKinds(run);
      for (const seen of kinds) observed.add(seen);
      return { ok: run.status === 0 && !kinds.includes('RECHECK_OVERDUE'), detail: `exit=${run.status} kinds=[${kinds.join(',')}] last=${finalLine(run)}` };
    });

    const missingKinds = FINDING_KINDS.filter((kind) => !observed.has(kind));
    check('every declared finding kind fires in a fixture', () => ({ ok: missingKinds.length === 0, detail: `unfired=[${missingKinds.join(',')}]` }));

    const failSelf = join(tmp, 'not-a-directory');
    writeFileSync(failSelf, 'file\n');
    const missingSources = makeDefault('sources-missing', { omitSources: true });
    const unreadable = makeDefault('read-failed', { knowledgeIsFile: true });
    const failArms = [
      ['SELF_NOT_A_DIR', ['--self', failSelf]],
      ['SOURCES_MISSING', ['--self', missingSources]],
      ['READ_FAILED', ['--self', unreadable]],
    ];
    for (const [kind, args] of failArms) {
      check(`${kind}: fail-closed exit 2`, () => {
        const run = runTool([...args, '--today', FIXTURE_TODAY]);
        if (run.status === 2 && finalLine(run) === `SOURCES_CHECK: FAIL-CLOSED (${kind})`) failClosedSeen.add(kind);
        return { ok: run.status === 2 && finalLine(run) === `SOURCES_CHECK: FAIL-CLOSED (${kind})`, detail: `exit=${run.status} last=${finalLine(run)}` };
      });
    }
    const missingArms = FAIL_CLOSED_KINDS.filter((kind) => !failClosedSeen.has(kind));
    check('every fail-closed arm fires in a fixture', () => ({ ok: missingArms.length === 0, detail: `unfired=[${missingArms.join(',')}]` }));

    const warningFixture = makeDefault('strict-warning', { rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })] });
    check('--strict promotes warnings to drift', () => {
      const run = runTool(['--self', warningFixture, '--today', FIXTURE_TODAY, '--strict']);
      return expectKind(run, 'USED_BY_ASYMMETRY', 1);
    });

    const jsonFixture = makeDefault('json');
    check('--json prints one parseable contract object', () => {
      const run = runTool(['--self', jsonFixture, '--today', FIXTURE_TODAY, '--json']);
      const parsed = JSON.parse(run.stdout);
      return { ok: run.status === 0 && parsed.schema === CONTRACT && parsed.verdict === 'CLEAN' && parsed.counts.rows === 1, detail: `exit=${run.status} verdict=${parsed.verdict} rows=${parsed.counts.rows}` };
    });

    const s1000 = makeDefault('s1000', {
      rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S1000' })],
    });
    check('S1000 is accepted and counted', () => {
      const run = runTool(['--self', s1000, '--today', FIXTURE_TODAY]);
      return { ok: run.status === 0 && finalLine(run).startsWith('SOURCES_CHECK: CLEAN (rows=2 '), detail: `exit=${run.status} last=${finalLine(run)}` };
    });

    check('invalid/missing option value uses usage exit 64', () => {
      const run = runTool(['--self']);
      return { ok: run.status === 64 && run.stdout.includes('usage: node scripts/sources-check.mjs'), detail: `exit=${run.status}` };
    });
    check('unknown option uses usage exit 64', () => {
      const run = runTool(['--no-such-option']);
      return { ok: run.status === 64 && run.stdout.includes('unsupported argument'), detail: `exit=${run.status}` };
    });
    check('-h prints usage and exits 0', () => {
      const run = runTool(['-h']);
      return { ok: run.status === 0 && run.stdout.includes(`contract id: ${CONTRACT}`), detail: `exit=${run.status}` };
    });

    check('frozen awk census parity: rows, malformed, duplicate ids', () => {
      const rows = [
        makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }),
        makeRow({ id: 'S002' }).slice(0, -2),
        makeRow({ id: 'S001' }),
        makeRow({ id: 'S1000' }),
      ];
      const root = makeDefault('parity', { rows });
      const checked = runCheck({ self: root, today: FIXTURE_TODAY, todayDay: isoDay(FIXTURE_TODAY) });
      if (checked.failClosed) return { ok: false, detail: `checker fail-closed=${checked.failClosed.kind}` };
      const fixtureFile = join(root, 'corpus', 'SOURCES.md');
      const script = [
        'file=$1',
        'command -v awk >/dev/null 2>&1 || { printf "SKIP\\n"; exit 0; }',
        'rows=$(grep -cE "^\\|[[:space:]]*S[0-9]{3,}[[:space:]]*\\|" "$file") || exit 10',
        'malformed=$(awk -F"|" \'/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13 {n++} END{print n+0}\' "$file") || exit 11',
        'duplicates=$(awk -F"|" \'/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}\' "$file" | sort | uniq -d | wc -l) || exit 12',
        'printf "%s %s %s\\n" "$rows" "$malformed" "$(printf "%s" "$duplicates" | tr -d "[:space:]")"',
      ].join('\n');
      const parity = spawnSync('sh', ['-c', script, 'sources-check-parity', fixtureFile], { encoding: 'utf8', timeout: 10_000 });
      if (parity.error) return { ok: false, detail: `spawn sh: ${parity.error.message}` };
      if (parity.status === 0 && parity.stdout.trim() === 'SKIP') return { skip: true, detail: 'awk is unavailable' };
      if (parity.status !== 0) return { ok: false, detail: `sh exit=${parity.status} stderr=${parity.stderr.trim()}` };
      const [rowsN, malformedN, duplicatesN] = parity.stdout.trim().split(/\s+/).map(Number);
      const jsMalformed = checked.findings.filter((finding) => finding.kind === 'ROW_MALFORMED').length;
      const jsDuplicateIds = checked.findings.filter((finding) => finding.kind === 'ID_DUPLICATE').length;
      const ok = checked.counts.rows === rowsN && jsMalformed === malformedN && jsDuplicateIds === duplicatesN;
      return {
        ok,
        detail: `node=${checked.counts.rows}/${jsMalformed}/${jsDuplicateIds} awk=${rowsN}/${malformedN}/${duplicatesN}`,
      };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const active = results.filter((result) => !result.skip);
  const failed = active.filter((result) => !result.ok);
  for (const result of results) {
    if (result.skip) process.stdout.write(`SKIP ${result.label}: ${result.detail}\n`);
    else if (result.ok) process.stdout.write(`PASS ${result.label}: ${result.detail}\n`);
    else process.stdout.write(`FAIL ${result.label}\n     ${result.detail}\n`);
  }
  process.stdout.write(`SOURCES_SELFTEST: ${active.length - failed.length}/${active.length} pass\n`);
  process.stdout.write(`VERDICT: ${failed.length === 0 ? 'PASS' : 'FAIL'}\n`);
  return failed.length === 0 ? 0 : 1;
}

function main() { process.exitCode = runCli(process.argv.slice(2)); }

/** Importing this module is silent; the CLI runs only when it started the process. */
const isEntry = (() => {
  if (process.argv[1] === undefined) return false;
  const invoked = resolve(process.argv[1]);
  if (invoked === TOOL_FILE) return true;
  try { return realpathSync(invoked) === TOOL_FILE; } catch { return false; }
})();
if (isEntry) main();
