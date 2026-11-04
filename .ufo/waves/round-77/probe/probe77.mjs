#!/usr/bin/env node
/**
 * probe77.mjs — frozen counters for kumitate round 77.
 *
 * Usage:
 *   node .ufo/waves/round-77/probe/probe77.mjs --set c1 [--lane DIR] [--work DIR]
 *   node .ufo/waves/round-77/probe/probe77.mjs --set c2 [--lane DIR] [--work DIR]
 *
 * C1 — coverage:omp offline re-derivation from a committed, pinned depth-1 shape
 * receipt (`kumitate-omp-shape-v1`). Frozen predicate: plan.md §C1.
 * C2 — operability: `spotcheck-adopt` v2 adopt journal — crash-recoverable two-file
 * adoption. Frozen predicate: plan.md §C2.
 *
 * The counter never mutates the lane: every fixture and materialised root lives under
 * --work (default: a fresh mkdtemp under $TMPDIR), and the lane is read-only.
 * Exit 0 iff every check in the set passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  readdirSync, rmSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const SNAPSHOT_REL = '.ufo/pins/omp-shape.json';
const SHAPE_CONTRACT = 'kumitate-omp-shape-v1';
const TARGET = 'corpus/lessons/round-99-verifier-spotcheck.md';
const KEY = TARGET.slice('corpus/'.length);
const JOURNAL_REL = '.ufo/pins/adopt-journal';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const pair = (pair0) => `${sha(pair0.readme)}:${sha(pair0.pin)}`;
const readText = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8', timeout: 600000, cwd: opts.cwd, env: { ...process.env, ...(opts.env || {}) },
  });
  return { status: r.status, signal: r.signal, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}

function parseJson(text) { try { return JSON.parse(text); } catch { return null; } }

function readSnapshotFile(p) {
  const text = readText(p);
  if (text === null) return null;
  return parseJson(text);
}

function validSnapshot(doc) {
  return !!doc && doc.contract === SHAPE_CONTRACT && Array.isArray(doc.entries)
    && doc.entries.every((e) => e && typeof e.name === 'string'
      && ['file', 'dir', 'symlink'].includes(e.kind) && Number.isInteger(e.mode)
      && Object.keys(e).sort().join(',') === 'kind,mode,name');
}

/** Materialise a committed snapshot into a real tree (the inverse of `--snapshot`). */
function materialise(doc, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true, mode: 0o755 });
  for (const e of doc.entries) {
    const p = join(dir, e.name);
    if (e.kind === 'dir') { mkdirSync(p, { mode: 0o755 }); chmodSync(p, e.mode); }
    else if (e.kind === 'file') { writeFileSync(p, ''); chmodSync(p, e.mode); }
    else if (e.kind === 'symlink') symlinkSync('probe-missing-target', p);
    else throw new Error(`unsupported kind ${e.kind}`);
  }
}

/** Parse the independent shell lstat receipt: name<TAB>type<TAB>mode-octal. */
function parseOpenTsv(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const [name, type, mode] = line.split('\t');
    if (!name || !type || !mode) continue;
    const kind = type === 'f' ? 'file' : type === 'd' ? 'dir' : type === 'l' ? 'symlink' : 'other';
    out.push({ name, kind, mode: parseInt(mode, 8) });
  }
  return out;
}

const checks = [];
const check = (name, fn) => checks.push({ name, fn });
function pass(name, detail, map) { map.set(name, { ok: true, detail }); }
function fail(name, detail, map) { map.set(name, { ok: false, detail }); }

// ---------------------------------------------------------------------------
// C1 — offline shape receipt
// ---------------------------------------------------------------------------

function c1Checks(lane, work) {
  const snapPath = join(lane, SNAPSHOT_REL);
  const live = join(work, 'live-snapshot.json');
  const regen = join(work, 'regen-snapshot.json');
  const root = join(work, 'materialised-root');

  check('c1.1-snapshot-writer', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.1-snapshot-writer', `no valid ${SNAPSHOT_REL}`, m);
    const r = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--snapshot', live]);
    const one = r.stdout.trim().split('\n');
    const hit = one.find((l) => /^OMP_SNAPSHOT: WROTE entries=\d+ sha256=[0-9a-f]{64}( path=\S+)?$/.test(l));
    if (r.status !== 0 || !hit) return fail('c1.1-snapshot-writer', `exit=${r.status} out=${JSON.stringify(r.stdout.trim()).slice(0, 200)}`, m);
    const n = Number(hit.match(/entries=(\d+)/)[1]);
    const h = hit.match(/sha256=([0-9a-f]{64})/)[1];
    if (n !== committed.entries.length) return fail('c1.1-snapshot-writer', `live entries=${n} committed=${committed.entries.length}`, m);
    if (h !== sha(snapPath)) return fail('c1.1-snapshot-writer', `line sha256=${h} file sha256=${sha(snapPath)}`, m);
    pass('c1.1-snapshot-writer', `entries=${n} sha256=${h} line==file`, m);
  });

  check('c1.2-snapshot-is-open-shape', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.2-snapshot-is-open-shape', 'no valid snapshot', m);
    const tsv = readText(join(lane, '.ufo/waves/round-77/open/omp-shape-open.tsv'));
    if (tsv === null) return fail('c1.2-snapshot-is-open-shape', 'open tsv absent', m);
    const want = parseOpenTsv(tsv).filter((e) => e.kind !== 'other');
    if (want.length !== committed.entries.length) return fail('c1.2-snapshot-is-open-shape', `tsv=${want.length} snapshot=${committed.entries.length}`, m);
    const a = want.map((e) => `${e.name}|${e.kind}|${e.mode}`).sort();
    const b = committed.entries.map((e) => `${e.name}|${e.kind}|${e.mode}`).sort();
    const diff = a.filter((x, i) => x !== b[i]);
    if (diff.length) return fail('c1.2-snapshot-is-open-shape', `first diff ${diff[0]} vs ${b[a.indexOf(diff[0])]}`, m);
    pass('c1.2-snapshot-is-open-shape', `entries=${a.length} equal to independent lstat receipt`, m);
  });

  check('c1.3-writer-roundtrip', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.3-writer-roundtrip', 'no valid snapshot', m);
    try { materialise(committed, root); } catch (e) { return fail('c1.3-writer-roundtrip', `materialise: ${e.message}`, m); }
    const r = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--root', root, '--snapshot', regen]);
    if (r.status !== 0) return fail('c1.3-writer-roundtrip', `exit=${r.status} ${r.stdout.trim().slice(0, 120)}`, m);
    const same = existsSync(regen) && sha(regen) === sha(snapPath);
    if (!same) return fail('c1.3-writer-roundtrip', `regen sha256=${existsSync(regen) ? sha(regen) : 'absent'} committed=${sha(snapPath)}`, m);
    pass('c1.3-writer-roundtrip', `byte-identical regeneration sha256=${sha(regen)}`, m);
  });

  check('c1.4-census-shape-clean', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.4-census-shape-clean', 'no valid snapshot', m);
    const r = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--shape', snapPath]);
    const line = r.stdout.trim().split('\n').filter((l) => l.startsWith('OMP_CENSUS:')).pop() || '';
    const want = `OMP_CENSUS: CLEAN (source=snapshot entries=${committed.entries.length} findings=0 bound=35/35)`;
    if (r.status !== 0 || line !== want) return fail('c1.4-census-shape-clean', `exit=${r.status} line=${JSON.stringify(line)}`, m);
    pass('c1.4-census-shape-clean', line, m);
  });

  check('c1.5-proxy-shape-terms', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.5-proxy-shape-terms', 'no valid snapshot', m);
    const r = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--omp-shape', snapPath, '--json']);
    const j = parseJson(r.stdout);
    if (!j || !j.terms) return fail('c1.5-proxy-shape-terms', `exit=${r.status} unparseable`, m);
    const t = j.terms;
    const six = { C1o: 1, C1o_total: 1, O_members: committed.entries.length, O_findings: 0, O_bound: 35, coverage_omp: 10 };
    const bad = Object.entries(six).filter(([k, v]) => t[k] !== v).map(([k, v]) => `${k}=${t[k]} want ${v}`);
    if (bad.length) return fail('c1.5-proxy-shape-terms', bad.join('; '), m);
    if (j.source !== 'snapshot') return fail('c1.5-proxy-shape-terms', `source=${JSON.stringify(j.source)} (want "snapshot")`, m);
    if ((j.findings || []).some((f) => /COVERAGE_OMP|O_/.test(String(f.kind)))) {
      return fail('c1.5-proxy-shape-terms', `O findings ${JSON.stringify((j.findings || []).map((f) => f.kind))}`, m);
    }
    pass('c1.5-proxy-shape-terms', `source=snapshot O=${t.O_members}/${t.O_findings}/${t.O_bound} coverage_omp=${t.coverage_omp}`, m);
  });

  check('c1.6-offline-equals-root', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.6-offline-equals-root', 'no valid snapshot', m);
    try { materialise(committed, root); } catch (e) { return fail('c1.6-offline-equals-root', `materialise: ${e.message}`, m); }
    const off = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--omp-shape', snapPath, '--json']);
    const on = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--omp-root', root, '--json']);
    const a = parseJson(off.stdout), b = parseJson(on.stdout);
    if (!a || !b || !a.terms || !b.terms) return fail('c1.6-offline-equals-root', `off=${off.status} on=${on.status} parse`, m);
    const keys = ['C1o', 'C1o_total', 'O_members', 'O_findings', 'O_bound', 'coverage_omp'];
    const bad = keys.filter((k) => a.terms[k] !== b.terms[k]).map((k) => `${k}:${a.terms[k]}!=${b.terms[k]}`);
    if (bad.length) return fail('c1.6-offline-equals-root', bad.join(' '), m);
    pass('c1.6-offline-equals-root', `six O terms equal (${keys.map((k) => a.terms[k]).join(',')})`, m);
  });

  check('c1.7-negative-discriminates', (m) => {
    const committed = readSnapshotFile(snapPath);
    if (!validSnapshot(committed)) return fail('c1.7-negative-discriminates', 'no valid snapshot', m);
    const neg = join(work, 'negative.json');
    const doc = { contract: SHAPE_CONTRACT, entries: [...committed.entries, { name: 'zz-stray.txt', kind: 'file', mode: 0o644 }] };
    writeFileSync(neg, `${JSON.stringify(doc, null, 2)}\n`);
    const c = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--shape', neg]);
    if (c.status !== 1 || !c.stdout.includes('UNLISTED zz-stray.txt') || !c.stdout.includes('OMP_CENSUS: DRIFT')) {
      return fail('c1.7-negative-discriminates', `census exit=${c.status} out=${JSON.stringify(c.stdout.trim()).slice(0, 160)}`, m);
    }
    const p = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--omp-shape', neg, '--json']);
    const j = parseJson(p.stdout);
    const kinds = j ? (j.findings || []).map((f) => String(f.kind)) : [];
    if (!j || j.terms.O_findings !== 1 || j.terms.coverage_omp !== 9 || !kinds.includes('COVERAGE_OMP_DRIFT')) {
      return fail('c1.7-negative-discriminates', `proxy exit=${p.status} O_findings=${j && j.terms.O_findings} coverage_omp=${j && j.terms.coverage_omp} kinds=${kinds.join(',')}`, m);
    }
    pass('c1.7-negative-discriminates', `O_findings=1 coverage_omp=9 COVERAGE_OMP_DRIFT`, m);
  });

  check('c1.8-fail-closed', (m) => {
    const bad = join(work, 'bad.json'); const badEntry = join(work, 'bad-entry.json');
    writeFileSync(bad, '{"contract":"kumitate-omp-shape-v1"}\n');
    writeFileSync(badEntry, `${JSON.stringify({ contract: SHAPE_CONTRACT, entries: [{ name: 'x', kind: 'fifo', mode: 420 }] }, null, 2)}\n`);
    const arms = [
      ['SHAPE_INVALID', bad], ['SHAPE_NOT_FOUND', join(work, 'absent.json')], ['SHAPE_INVALID', badEntry],
    ];
    const bad0 = [];
    for (const [token, file] of arms) {
      const r = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--shape', file]);
      if (r.status !== 2 || !r.stdout.includes(token)) bad0.push(`${file.split('/').pop()}: exit=${r.status} token=${token} out=${JSON.stringify(r.stdout.trim()).slice(0, 80)}`);
    }
    const p = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--omp-shape', join(work, 'absent.json'), '--json']);
    if (!(p.status === 2 && /OMP_SHAPE_(NOT_FOUND|INVALID)/.test(p.stdout + p.stderr))) bad0.push(`proxy absent: exit=${p.status} out=${JSON.stringify((p.stdout + p.stderr).trim()).slice(0, 100)}`);
    if (bad0.length) return fail('c1.8-fail-closed', bad0.join('; '), m);
    pass('c1.8-fail-closed', 'SHAPE_INVALID x2, SHAPE_NOT_FOUND, proxy fail-closed', m);
  });

  check('c1.9-selftests', (m) => {
    const c = run(process.execPath, [join(lane, 'scripts/omp-census.mjs'), '--selftest']);
    const cm = c.stdout.match(/VERDICT: PASS \((\d+) cases\)/);
    if (c.status !== 0 || !cm || Number(cm[1]) < 53) return fail('c1.9-selftests', `census exit=${c.status} ${JSON.stringify(c.stdout.trim().split('\n').pop())}`, m);
    const p = run(process.execPath, [join(lane, 'scripts/proxy-check.mjs'), '--selftest']);
    const pm = p.stdout.match(/PROXY_SELFTEST: (\d+)\/\1 pass/);
    if (p.status !== 0 || !pm || Number(pm[1]) < 148) return fail('c1.9-selftests', `proxy exit=${p.status} ${JSON.stringify(p.stdout.trim().split('\n').pop())}`, m);
    pass('c1.9-selftests', `census ${cm[1]} cases; proxy ${pm[1]}/${pm[1]}`, m);
  });

  check('c1.10-no-content-pinned', (m) => {
    const text = readText(snapPath);
    if (text === null) return fail('c1.10-no-content-pinned', 'snapshot absent', m);
    if (/"(sha256|content|bytes|data)"/.test(text)) return fail('c1.10-no-content-pinned', 'content-shaped key in snapshot', m);
    const sc = readText(join(lane, 'SCORECARD.md')) || '';
    const pin = sc.match(/^\s*pin\.omp-shape=([0-9a-f]{64})$/m);
    if (!pin) return fail('c1.10-no-content-pinned', 'no pin.omp-shape in the gate-pin block', m);
    if (pin[1] !== sha(snapPath)) return fail('c1.10-no-content-pinned', `pin=${pin[1]} file=${sha(snapPath)}`, m);
    const doc = readSnapshotFile(snapPath);
    if (!validSnapshot(doc)) return fail('c1.10-no-content-pinned', 'entry key set is not exactly name/kind/mode', m);
    pass('c1.10-no-content-pinned', `pin.omp-shape=${pin[1].slice(0, 16)}… name/kind/mode only`, m);
  });
}

// ---------------------------------------------------------------------------
// C2 — adopt journal
// ---------------------------------------------------------------------------

function fixture(lane, dir) {
  rmSync(dir, { recursive: true, force: true });
  for (const d of ['scripts', 'corpus/knowledge', 'corpus/lessons', '.ufo/pins']) mkdirSync(join(dir, d), { recursive: true });
  copyFileSync(join(lane, 'scripts/readme-map.mjs'), join(dir, 'scripts/readme-map.mjs'));
  copyFileSync(join(lane, 'scripts/spotcheck-adopt.mjs'), join(dir, 'scripts/spotcheck-adopt.mjs'));
  writeFileSync(join(dir, 'corpus/knowledge/base.md'), '# Base\n');
  writeFileSync(join(dir, TARGET), '# Spotcheck\n');
  writeFileSync(join(dir, 'corpus/lessons/round-01-verifier-spotcheck.md'), '# Fixture lesson\n');
  writeFileSync(join(dir, 'corpus/README.md'),
    `# Corpus\n\n## Coverage map\n\n| \`knowledge/base.md\` | Base | fixture |\n| \`lessons/round-01-verifier-spotcheck.md\` | Fixture lesson | fixture |\n\n## Known gaps\n\n- none\n`);
  writeFileSync(join(dir, '.ufo/pins/readme-map.json'), `${JSON.stringify({ version: 2, covered: ['knowledge/base.md', 'lessons/round-01-verifier-spotcheck.md'] }, null, 2)}\n`);
  return { dir, readme: join(dir, 'corpus/README.md'), pin: join(dir, '.ufo/pins/readme-map.json'), journal: join(dir, JOURNAL_REL) };
}

const journalEntries = (fx) => (existsSync(fx.journal) ? readdirSync(fx.journal) : []);

function c2Checks(lane, work) {
  const tool = join(lane, 'scripts/spotcheck-adopt.mjs');
  check('c2.1-journal-surface', (m) => {
    const text = readText(tool);
    if (text === null) return fail('c2.1-journal-surface', 'tool absent', m);
    const need = ['kumitate-spotcheck-adopt-v2', 'adopt-journal', 'RECOVERED', 'SPOTCHECK_ADOPT_TEST_CRASH'];
    const miss = need.filter((t) => !text.includes(t));
    if (miss.length) return fail('c2.1-journal-surface', `missing ${miss.join(',')}`, m);
    pass('c2.1-journal-surface', 'contract v2, journal dir, RECOVERED, test seam present', m);
  });

  const crash = (fx, stage) => run(process.execPath, [tool, '--lane', fx.dir, '--adopt', TARGET],
    { env: { SPOTCHECK_ADOPT_TEST_CRASH: stage } });
  const recoveryLine = (out) => out.split('\n').find((l) => l.startsWith('RECOVERED ')) || '';

  for (const [name, stage, expectHalf, expectLine] of [
    ['c2.2-crash-journal', 'journal', 'clean', 'rolled-back'],
    ['c2.3-crash-after-row', 'row', 'row-only', 'rolled-back'],
    ['c2.4-crash-after-pin', 'pin', 'complete', 'complete'],
  ]) {
    check(name, (m) => {
      const fx = fixture(lane, join(work, name));
      const before = pair(fx);
      const r = crash(fx, stage);
      if (!(r.signal === 'SIGKILL' || r.status === 137)) return fail(name, `child not killed: status=${r.status} signal=${r.signal}`, m);
      const rows = readText(fx.readme).includes(`| \`${KEY}\` |`);
      const pinned = (readText(fx.pin) || '').includes(`"${KEY}"`);
      const half = rows && pinned ? 'complete' : rows ? 'row-only' : !rows && !pinned ? 'clean' : 'pin-only';
      if (half !== expectHalf) return fail(name, `half-state ${half} want ${expectHalf}; journal=${journalEntries(fx).join(',') || 'absent'}`, m);
      if (journalEntries(fx).length === 0) return fail(name, 'no journal after crash', m);
      const post = pair(fx);
      const rec = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
      const line = recoveryLine(rec.stdout);
      if (!line.includes(` ${expectLine}`)) return fail(name, `recovery line ${JSON.stringify(line)} want ${expectLine}`, m);
      if (journalEntries(fx).length !== 0) return fail(name, `journal not removed: ${journalEntries(fx).join(',')}`, m);
      const now = pair(fx);
      if (expectLine === 'rolled-back' && now !== before) return fail(name, `bytes not restored ${now} != ${before}`, m);
      if (expectLine === 'complete' && now !== post) return fail(name, `bytes changed ${now} != ${post}`, m);
      pass(name, `${stage}: ${half} → ${line} journal removed`, m);
    });
  }

  check('c2.5-stale-tmp', (m) => {
    const fx = fixture(lane, join(work, 'c2.5-stale-tmp'));
    const before = pair(fx);
    mkdirSync(fx.journal, { recursive: true });
    const tmpDir = join(fx.journal, `${Date.now()}-stale.tmp`);
    mkdirSync(tmpDir); writeFileSync(join(tmpDir, 'manifest.json'), '{}\n');
    const r = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
    const line = recoveryLine(r.stdout);
    if (!/ stale$/.test(line)) return fail('c2.5-stale-tmp', `line ${JSON.stringify(line)}`, m);
    if (existsSync(tmpDir)) return fail('c2.5-stale-tmp', 'stale .tmp retained', m);
    if (pair(fx) !== before) return fail('c2.5-stale-tmp', 'bytes changed', m);
    pass('c2.5-stale-tmp', `${line}; stale removed; bytes unchanged`, m);
  });

  check('c2.6-foreign-journal', (m) => {
    const fx = fixture(lane, join(work, 'c2.6-foreign-journal'));
    const before = pair(fx);
    mkdirSync(fx.journal, { recursive: true });
    const jdir = join(fx.journal, 'foreign-0001');
    mkdirSync(jdir);
    writeFileSync(join(jdir, 'manifest.json'), `${JSON.stringify({
      contract: 'kumitate-adopt-journal-v1', lane: '/nonexistent/foreign-lane',
      target: TARGET, key: KEY,
      pre: [
        { path: 'corpus/README.md', file: 'README.pre', sha256: sha(fx.readme) },
        { path: '.ufo/pins/readme-map.json', file: 'readme-map.pre', sha256: sha(fx.pin) },
      ],
    }, null, 2)}\n`);
    copyFileSync(fx.readme, join(jdir, 'README.pre'));
    copyFileSync(fx.pin, join(jdir, 'readme-map.pre'));
    const r = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
    if (r.status !== 2 || !r.stdout.includes('REFUSED_JOURNAL_FOREIGN')) return fail('c2.6-foreign-journal', `exit=${r.status} out=${JSON.stringify(r.stdout.trim()).slice(0, 120)}`, m);
    if (pair(fx) !== before) return fail('c2.6-foreign-journal', 'bytes changed', m);
    if (!existsSync(jdir)) return fail('c2.6-foreign-journal', 'foreign journal removed (evidence destroyed)', m);
    pass('c2.6-foreign-journal', 'REFUSED_JOURNAL_FOREIGN exit 2; bytes and journal retained', m);
  });

  check('c2.7-no-journal-no-line', (m) => {
    const fx = fixture(lane, join(work, 'c2.7-no-journal-no-line'));
    const before = pair(fx);
    const r = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
    if (r.stdout.includes('RECOVERED ')) return fail('c2.7-no-journal-no-line', `spurious recovery: ${recoveryLine(r.stdout)}`, m);
    if (existsSync(fx.journal)) return fail('c2.7-no-journal-no-line', 'journal dir created by a read arm', m);
    if (pair(fx) !== before) return fail('c2.7-no-journal-no-line', 'bytes changed', m);
    pass('c2.7-no-journal-no-line', `exit=${r.status} no RECOVERED line, no journal`, m);
  });

  check('c2.8-recovery-idempotent', (m) => {
    const fx = fixture(lane, join(work, 'c2.8-recovery-idempotent'));
    const r = crash(fx, 'pin');
    if (!(r.signal === 'SIGKILL' || r.status === 137)) return fail('c2.8-recovery-idempotent', 'child not killed', m);
    const first = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
    if (!/ complete$/.test(recoveryLine(first.stdout))) return fail('c2.8-recovery-idempotent', 'first recovery missing', m);
    const post = pair(fx);
    const second = run(process.execPath, [tool, '--lane', fx.dir, '--check']);
    if (second.stdout.includes('RECOVERED ')) return fail('c2.8-recovery-idempotent', 'second recovery line', m);
    if (pair(fx) !== post) return fail('c2.8-recovery-idempotent', 'bytes changed on second run', m);
    pass('c2.8-recovery-idempotent', 'one RECOVERED, then stable', m);
  });

  check('c2.9-selftest-and-refusals', (m) => {
    const s = run(process.execPath, [tool, '--selftest']);
    const st = s.stdout.match(/SPOTCHECK_ADOPT_SELFTEST: PASS \((\d+)\/\1\)/);
    if (s.status !== 0 || !st || Number(st[1]) < 22 || !/VERDICT: PASS/.test(s.stdout)) {
      return fail('c2.9-selftest-and-refusals', `exit=${s.status} ${JSON.stringify(s.stdout.trim().split('\n').slice(-2))}`, m);
    }
    const fx = fixture(lane, join(work, 'c2.9-refusals'));
    const before = pair(fx);
    const arms = [['SCORECARD.md', 'REFUSED_OUT_OF_SCOPE'], ['corpus/lessons/round-75.md', 'REFUSED_NOT_SPOTCHECK'], ['corpus/lessons/round-98-verifier-spotcheck.md', 'REFUSED_ABSENT']];
    const bad = [];
    for (const [p, token] of arms) {
      const r = run(process.execPath, [tool, '--lane', fx.dir, '--adopt', p]);
      if (r.status !== 2 || !r.stdout.includes(token)) bad.push(`${p}: ${r.status}/${JSON.stringify(r.stdout.trim())}`);
    }
    if (pair(fx) !== before) bad.push('refusal wrote bytes');
    if (bad.length) return fail('c2.9-selftest-and-refusals', bad.join('; '), m);
    pass('c2.9-selftest-and-refusals', `${st[1]}/${st[1]} cases; three refusals exit 2, bytes unchanged`, m);
  });

  check('c2.10-usage', (m) => {
    const a = run(process.execPath, [tool, '--lane', join(work, 'c2.7-no-journal-no-line'), '--predict', 'bad']);
    const b = run(process.execPath, [tool, '--lane', join(work, 'c2.7-no-journal-no-line'), '--bogus']);
    if (a.status !== 64 || b.status !== 64) return fail('c2.10-usage', `predict=${a.status} bogus=${b.status}`, m);
    pass('c2.10-usage', 'bad --predict and unknown arm exit 64', m);
  });

  check('c2.11-placement-and-map', (m) => {
    const fx = fixture(lane, join(work, 'c2.11-placement'));
    const r = run(process.execPath, [tool, '--lane', fx.dir, '--adopt', TARGET]);
    if (r.status !== 0 || !/^SPOTCHECK_ADOPT: ADOPTED /m.test(r.stdout)) {
      return fail('c2.11-placement-and-map', `fixture adopt exit=${r.status} ${JSON.stringify(r.stdout.trim().slice(0, 120))}`, m);
    }
    const lines = readText(fx.readme).split('\n');
    const row = lines.findIndex((l) => l.startsWith(`| \`${KEY}\` |`));
    const gap = lines.findIndex((l) => l === '## Known gaps');
    if (row < 0) return fail('c2.11-placement-and-map', 'adopted row absent', m);
    if (gap < 0 || row > gap) return fail('c2.11-placement-and-map', `fixture row line ${row + 1} after ## Known gaps line ${gap + 1}`, m);
    const map = run(process.execPath, [join(lane, 'scripts/readme-map.mjs')]);
    const ml = map.stdout.trim().split('\n').find((l) => l.startsWith('README_MAP:')) || '';
    if (map.status !== 0 || !/^README_MAP: CLEAN files=(\d+) rows=\1 covered=\1$/.test(ml)) {
      return fail('c2.11-placement-and-map', `lane readme-map exit=${map.status} ${JSON.stringify(ml)}`, m);
    }
    pass('c2.11-placement-and-map', `fixture row at ${row + 1} before gaps at ${gap + 1}; ${ml}`, m);
  });
}

// ---------------------------------------------------------------------------

function main(argv) {
  let lane = null, set = null, work = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lane') lane = argv[++i];
    else if (argv[i] === '--set') set = argv[++i];
    else if (argv[i] === '--work') work = argv[++i];
    else { console.log('PROBE77: USAGE'); return 64; }
  }
  if (!['c1', 'c2'].includes(set)) { console.log('PROBE77: USAGE'); return 64; }
  lane = resolve(lane || join(process.cwd()));
  const made = work ? false : true;
  work = resolve(work || mkdtempSync(join(tmpdir(), 'probe77-')));
  mkdirSync(work, { recursive: true });
  const results = new Map();
  if (set === 'c1') c1Checks(lane, work); else c2Checks(lane, work);
  const registry = set === 'c1' ? ['c1.1-snapshot-writer', 'c1.2-snapshot-is-open-shape', 'c1.3-writer-roundtrip',
    'c1.4-census-shape-clean', 'c1.5-proxy-shape-terms', 'c1.6-offline-equals-root', 'c1.7-negative-discriminates',
    'c1.8-fail-closed', 'c1.9-selftests', 'c1.10-no-content-pinned']
    : ['c2.1-journal-surface', 'c2.2-crash-journal', 'c2.3-crash-after-row', 'c2.4-crash-after-pin',
      'c2.5-stale-tmp', 'c2.6-foreign-journal', 'c2.7-no-journal-no-line', 'c2.8-recovery-idempotent',
      'c2.9-selftest-and-refusals', 'c2.10-usage', 'c2.11-placement-and-map'];
  for (const c of checks) {
    if (!registry.includes(c.name)) continue;
    try { c.fn(results); } catch (e) { fail(c.name, `threw: ${e.message}`, results); }
  }
  let held = 0;
  for (const name of registry) {
    const r = results.get(name) || { ok: false, detail: 'not run' };
    if (r.ok) held++;
    console.log(`CHECK ${name}: ${r.ok ? 'PASS' : 'FAIL'} ${r.detail}`);
  }
  const label = set.toUpperCase();
  console.log(`C77_${label}: ${held === registry.length ? 'HELD' : 'UNMET'} held=${held}/${registry.length}`);
  if (made) rmSync(work, { recursive: true, force: true });
  return held === registry.length ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
