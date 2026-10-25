#!/usr/bin/env node
/**
 * dispatch-evidence.mjs — kumitate lane gate, contract kumitate-dispatch-evidence-v1.
 *
 *   node scripts/dispatch-evidence.mjs --root DIR --round N --wave NAME [--expect planned=N,sessions=N,exit0=N,reports=N]
 *   node scripts/dispatch-evidence.mjs --selftest
 *
 * Verdict: DISPATCH_EVIDENCE: CLEAN (seats=… sessions=… exit0=… reports=… dead=…)
 *          0 clean · 1 a real defect (DRIFT) · 2 fail-closed · 64 usage
 *
 * What it reads: the round's ACTUAL dispatch record — the launcher progress file the
 * dispatcher wrote seat by seat (`launcher-progress.tsv`) and the summary a report quotes
 * (`dispatch-actual.json`) — plus the seat report files the progress file's seats name.
 * A prepared spec is not a dispatch: a registry whose members carry no session id is
 * DRIFT NOT_A_DISPATCH, never a dispatch of N seats. A dead seat (exit != 0, no session
 * id) is named and never credited.
 *
 * Findings: PLAN_MISMATCH, SESSION_MISMATCH, REPORT_ABSENT, DEAD_SEAT_UNCREDITED,
 * DEAD_MISMATCH, REGISTRY_MISMATCH, NOT_A_DISPATCH, EXPECT_MISMATCH, and the
 * fail-closed ids PROGRESS_ABSENT, REGISTRY_UNREADABLE, WAVE_DIR_ABSENT.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CONTRACT = 'kumitate-dispatch-evidence-v1';
const PROGRESS = 'launcher-progress.tsv';
const REGISTRY = 'dispatch-actual.json';

function usage(msg) {
  process.stderr.write(`DISPATCH_EVIDENCE: USAGE ${msg}\n`);
  process.exit(64);
}

function parseArgs(argv) {
  const out = { root: process.cwd(), round: null, wave: null, expect: null, selftest: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--selftest') out.selftest = true;
    else if (a === '--root') out.root = argv[++i];
    else if (a === '--round') out.round = argv[++i];
    else if (a === '--wave') out.wave = argv[++i];
    else if (a === '--expect') out.expect = argv[++i];
    else usage(`unknown argument ${JSON.stringify(a)}`);
  }
  return out;
}

function parseProgress(txt) {
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const name = parts[0];
    const kv = {};
    for (const p of parts.slice(1)) {
      const i = p.indexOf('=');
      if (i > 0) kv[p.slice(0, i)] = p.slice(i + 1);
    }
    if (!name || kv.exit === undefined) return null;
    rows.push({
      name,
      session: kv.session && kv.session !== 'null' ? kv.session : null,
      exit: Number(kv.exit),
      pid: kv.pid || null,
    });
  }
  return rows;
}

function parseExpect(spec) {
  if (!spec) return null;
  const want = {};
  for (const part of spec.split(',')) {
    const i = part.indexOf('=');
    if (i <= 0) return null;
    want[part.slice(0, i).trim()] = Number(part.slice(i + 1).trim());
  }
  return want;
}

function inspect(root, round, wave, expectSpec) {
  const findings = [];
  const waveDir = join(resolve(root), '.ufo', 'waves', `round-${round}`, wave);
  if (!existsSync(waveDir)) {
    return { code: 2, findings: ['WAVE_DIR_ABSENT'], line: `DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=${waveDir}` };
  }
  const progressPath = join(waveDir, PROGRESS);
  if (!existsSync(progressPath)) {
    return { code: 2, findings: ['PROGRESS_ABSENT'], line: `DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent path=${progressPath}` };
  }
  let progressRaw = '';
  try { progressRaw = readFileSync(progressPath, 'utf8'); } catch {
    return { code: 2, findings: ['PROGRESS_ABSENT'], line: `DISPATCH_EVIDENCE: FAIL-CLOSED progress-unreadable path=${progressPath}` };
  }
  const rows = parseProgress(progressRaw);
  if (!rows || rows.length === 0) {
    return { code: 2, findings: ['PROGRESS_ABSENT'], line: `DISPATCH_EVIDENCE: FAIL-CLOSED progress-unparseable path=${progressPath}` };
  }
  const registryPath = join(waveDir, REGISTRY);
  let registry = null;
  try {
    registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  } catch {
    return { code: 2, findings: ['REGISTRY_UNREADABLE'], line: `DISPATCH_EVIDENCE: FAIL-CLOSED registry-unreadable path=${registryPath}` };
  }

  const dead = [];
  let sessions = 0;
  let exit0 = 0;
  let reports = 0;
  for (const row of rows) {
    const isDead = row.exit !== 0 || !row.session;
    if (isDead) dead.push(row.name);
    if (row.session) sessions += 1;
    if (row.exit === 0) exit0 += 1;
    const reportPath = join(waveDir, `${row.name}.md`);
    let hasReport = false;
    try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }
    if (hasReport) reports += 1;
    if (row.exit === 0) {
      if (!row.session) findings.push(`SESSION_MISMATCH:${row.name}`);
      if (!hasReport) findings.push(`REPORT_ABSENT:${row.name}`);
    } else if (hasReport) {
      findings.push(`DEAD_SEAT_UNCREDITED:${row.name}`);
    }
  }
  const withSession = rows.filter((r) => r.session).length;
  if (withSession === 0 && rows.length > 0) findings.push('NOT_A_DISPATCH');

  const members = Array.isArray(registry.members) ? registry.members : null;
  if (members) {
    const noIds = members.every((m) => !m.agentId || m.agentId === 'null');
    if (noIds && members.length > 0) findings.push('NOT_A_DISPATCH');
    if (Number(registry.planned) !== rows.length) findings.push(`PLAN_MISMATCH:declared=${registry.planned}observed=${rows.length}`);
    if (Number(registry.sessionIds) !== sessions) findings.push(`REGISTRY_MISMATCH:sessionIds=${registry.sessionIds}observed=${sessions}`);
    if (Number(registry.exit0) !== exit0) findings.push(`REGISTRY_MISMATCH:exit0=${registry.exit0}observed=${exit0}`);
    if (Number(registry.reports) !== reports) findings.push(`REGISTRY_MISMATCH:reports=${registry.reports}observed=${reports}`);
    const declaredDead = Array.isArray(registry.dead) ? registry.dead.slice().sort() : [];
    if (declaredDead.join(',') !== dead.slice().sort().join(',')) {
      findings.push(`DEAD_MISMATCH:declared=${declaredDead.join('+') || 'none'}observed=${dead.sort().join('+') || 'none'}`);
    }
  } else {
    findings.push('REGISTRY_UNREADABLE:members-absent');
  }

  const want = parseExpect(expectSpec);
  if (want) {
    const observed = { planned: rows.length, sessions, exit0, reports };
    for (const [k, v] of Object.entries(want)) {
      if (observed[k] !== v) findings.push(`EXPECT_MISMATCH:${k}=${observed[k]} expected=${v}`);
    }
  }

  const unique = [...new Set(findings.map((f) => f.split(':')[0]))];
  const line = `DISPATCH_EVIDENCE: ${unique.length ? 'DRIFT' : 'CLEAN'} (seats=${rows.length} sessions=${sessions} exit0=${exit0} reports=${reports} dead=${dead.length})`;
  return { code: unique.length ? 1 : 0, findings, unique, line, dead, rows, sessions, exit0, reports };
}

function writeFixture(dir, names, opts) {
  const waveDir = join(dir, '.ufo', 'waves', 'round-1', 'w1');
  mkdirSync(waveDir, { recursive: true });
  const lines = [];
  for (const n of names) {
    const dead = opts.dead && opts.dead.includes(n);
    lines.push(`${n}\tpid=1\tsession=${dead ? 'null' : `session_${n}`}\texit=${dead ? -9 : 0}\tstart=1\tend=2\terr=`);
    if (!dead || (opts.deadWithReport && opts.deadWithReport.includes(n))) {
      writeFileSync(join(waveDir, `${n}.md`), `# ${n}\n\nfixture report\n`);
    }
  }
  writeFileSync(join(waveDir, PROGRESS), `${lines.join('\n')}\n`);
  const members = names.map((n) => {
    const dead = opts.dead && opts.dead.includes(n);
    return { name: n, role: 'executor', kind: 'spawn', agentId: dead ? null : `session_${n}`, exit: dead ? -9 : 0, pid: '1' };
  });
  const registry = {
    schema: 'kumitate-test-dispatch-actual',
    wave: 'test',
    planned: opts.planned === undefined ? names.length : opts.planned,
    progressLines: names.length,
    sessionIds: members.filter((m) => m.agentId).length,
    exit0: members.filter((m) => m.exit === 0).length,
    dead: names.filter((n) => opts.dead && opts.dead.includes(n)),
    reports: names.filter((n) => !(opts.dead && opts.dead.includes(n)) || (opts.deadWithReport && opts.deadWithReport.includes(n))).length,
    members,
  };
  writeFileSync(join(waveDir, REGISTRY), `${JSON.stringify(registry, null, 1)}\n`);
  return waveDir;
}

function selftest() {
  const cases = [];
  const T = mkdtempSync(join(tmpdir(), 'dispatch-evidence-selftest.'));
  const run = (dir, expectSpec) => inspect(dir, 1, 'w1', expectSpec);
  try {
    {
      const d = join(T, 'clean');
      writeFixture(d, ['A', 'B', 'C'], {});
      const r = run(d);
      cases.push(['clean', r.code === 0 && r.line.includes('DISPATCH_EVIDENCE: CLEAN'), r.line]);
    }
    {
      const d = join(T, 'template');
      writeFixture(d, ['A', 'B'], {});
      const waveDir = join(d, '.ufo', 'waves', 'round-1', 'w1');
      const reg = JSON.parse(readFileSync(join(waveDir, REGISTRY), 'utf8'));
      for (const m of reg.members) m.agentId = null;
      reg.sessionIds = 0;
      writeFileSync(join(waveDir, REGISTRY), `${JSON.stringify(reg, null, 1)}\n`);
      const r = run(d);
      cases.push(['template-registry', r.code === 1 && r.unique.includes('NOT_A_DISPATCH'), r.line]);
    }
    {
      const d = join(T, 'dead');
      writeFixture(d, ['A', 'B'], { dead: ['B'], deadWithReport: ['B'] });
      const r = run(d);
      cases.push(['dead-seat-credited', r.code === 1 && r.unique.includes('DEAD_SEAT_UNCREDITED'), r.line]);
    }
    {
      const d = join(T, 'absent');
      writeFixture(d, ['A'], {});
      rmSync(join(d, '.ufo', 'waves', 'round-1', 'w1', PROGRESS));
      const r = run(d);
      cases.push(['progress-absent', r.code === 2 && r.findings.includes('PROGRESS_ABSENT'), r.line]);
    }
    {
      const d = join(T, 'plan');
      writeFixture(d, ['A', 'B'], { planned: 9 });
      const r = run(d);
      cases.push(['plan-mismatch', r.code === 1 && r.unique.includes('PLAN_MISMATCH'), r.line]);
    }
    {
      const d = join(T, 'report');
      writeFixture(d, ['A', 'B'], {});
      rmSync(join(d, '.ufo', 'waves', 'round-1', 'w1', 'B.md'));
      const r = run(d);
      cases.push(['report-absent', r.code === 1 && r.unique.includes('REPORT_ABSENT'), r.line]);
    }
    {
      const d = join(T, 'expect');
      writeFixture(d, ['A', 'B'], {});
      const r = run(d, 'planned=99');
      cases.push(['expect-mismatch', r.code === 1 && r.unique.includes('EXPECT_MISMATCH'), r.line]);
    }
    {
      const d = join(T, 'deadset');
      writeFixture(d, ['A', 'B'], { dead: ['B'] });
      const waveDir = join(d, '.ufo', 'waves', 'round-1', 'w1');
      const reg = JSON.parse(readFileSync(join(waveDir, REGISTRY), 'utf8'));
      reg.dead = [];
      writeFileSync(join(waveDir, REGISTRY), `${JSON.stringify(reg, null, 1)}\n`);
      const r = run(d);
      cases.push(['dead-mismatch', r.code === 1 && r.unique.includes('DEAD_MISMATCH'), r.line]);
    }
  } finally {
    rmSync(T, { recursive: true, force: true });
  }
  let passed = 0;
  for (const [name, ok, line] of cases) {
    process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${name} — ${line}\n`);
    if (ok) passed += 1;
  }
  const ids = ['NOT_A_DISPATCH', 'DEAD_SEAT_UNCREDITED', 'PROGRESS_ABSENT', 'PLAN_MISMATCH', 'REPORT_ABSENT', 'EXPECT_MISMATCH'];
  for (const id of ids) process.stdout.write(`FINDING ${id}\n`);
  process.stdout.write(`DISPATCH_EVIDENCE_SELFTEST: ${passed === cases.length ? 'PASS' : 'FAIL'} (${passed}/${cases.length})\n`);
  process.stdout.write(`VERDICT: ${passed === cases.length ? 'PASS' : 'FAIL'}\n`);
  process.exit(passed === cases.length ? 0 : 1);
}

const args = parseArgs(process.argv.slice(2));
if (args.selftest) selftest();
if (!args.round || !args.wave) usage('--root DIR --round N --wave NAME are required (or --selftest)');
if (!/^\d+$/.test(String(args.round))) usage('--round must be an integer');
if (!/^[A-Za-z0-9._-]+$/.test(String(args.wave))) usage('--wave must be a plain directory name');

const result = inspect(args.root, String(args.round), String(args.wave), args.expect);
process.stdout.write(`${result.line}\n`);
for (const f of result.findings) process.stdout.write(`FINDING ${f}\n`);
if (result.code === 2) process.stderr.write(`DISPATCH_EVIDENCE: FAIL-CLOSED contract=${CONTRACT}\n`);
process.exit(result.code);
