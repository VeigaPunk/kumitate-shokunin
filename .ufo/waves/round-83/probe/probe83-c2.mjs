#!/usr/bin/env node
/**
 * probe83-c2.mjs — FROZEN counter for round-83 C2 (coverage:omp, the omp-census compare
 * evidence surface gains the receipt-clock guard). Contract judged: `kumitate-omp-shape-v2`
 * compare path.
 *
 *   node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 [--lane DIR] [--work DIR] [--keep]
 *
 * Predicate (plan.md §C2): prints `C83_C2: HELD held=15/15` and exits 0 at M. Base tree
 * (round-82 tip): the compare path judges a clock only under `--max-age`, so the
 * unbounded-future and one-predicate arms fail. A constant-`IN_SYNC` stub stays under half.
 *
 * Hermetic: receipts and a materialised root under `--work`; shells the lane's own tool.
 * Frozen at the round-83 freeze commit; never edit after a data seat has scored.
 */
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ARMS = 16;
const DAY = 86400000;
const iso = (ms) => `${new Date(ms).toISOString().replace(/\.\d{3}Z$/u, 'Z')}`;

function parse(argv) {
  const o = { lane: '.', set: null, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') o.lane = argv[++i];
    else if (a === '--set') o.set = argv[++i];
    else if (a === '--work') o.work = argv[++i];
    else if (a === '--keep') o.keep = true;
    else return { error: `unknown argument: ${a}` };
  }
  if (o.set !== 'c2') return { error: `--set c2 is required (got ${o.set})` };
  return o;
}

const ENTRIES = [
  { name: 'agent.db', kind: 'file', mode: 0o600 },
  { name: 'lsp.json', kind: 'file', mode: 0o600 },
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

function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.error) { process.stdout.write(`PROBE83_C2: USAGE ${opts.error}\n`); return 64; }
  const lane = resolve(opts.lane);
  const tool = join(lane, 'scripts', 'omp-census.mjs');
  const base = opts.work
    ? (mkdirSync(opts.work, { recursive: true }), opts.work)
    : (process.env.HYAKU_SCRATCH
      ? (mkdirSync(join(process.env.HYAKU_SCRATCH, 'kumitate-r83', 'probe83-c2'), { recursive: true }), join(process.env.HYAKU_SCRATCH, 'kumitate-r83', 'probe83-c2'))
      : tmpdir());
  const root = mkdtempSync(join(base, 'c83c2-'));

  const run = (args) => {
    if (!existsSync(tool)) return { code: 127, out: 'tool-absent' };
    const r = spawnSync(process.execPath, [tool, ...args], { cwd: lane, encoding: 'utf8', timeout: 60000 });
    return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };
  const receipt = (name, capturedAt, entries = ENTRIES, legacy = false) => {
    const file = join(root, name);
    const doc = legacy
      ? { contract: 'kumitate-omp-shape-v1', entries }
      : { contract: 'kumitate-omp-shape-v2', captured_at: capturedAt, entries };
    writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
    return file;
  };
  const cleanRoot = join(root, 'root-clean');
  materialise(cleanRoot, ENTRIES);
  const now = Date.now();
  const today = iso(now - 3600e3);
  const backdated = iso(now - 45 * DAY);
  const future = iso(now + 90 * DAY);
  const todayFile = receipt('today.json', today);
  const backFile = receipt('backdated.json', backdated);
  const futureFile = receipt('future.json', future);
  const legacyFile = receipt('legacy.json', null, ENTRIES, true);
  const noLsp = ENTRIES.filter((e) => e.name !== 'lsp.json');
  const driftFile = receipt('drift.json', today, noLsp);
  const driftRoot = join(root, 'root-drift');
  materialise(driftRoot, ENTRIES);
  const transientRoot = join(root, 'root-transient');
  materialise(transientRoot, ENTRIES);
  materialise(transientRoot, [{ name: 'agent.db-shm', kind: 'file', mode: 0o600 }]);

  let held = 0;
  const rows = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `throw ${e.message}`; }
    if (ok) held++;
    rows.push(`C83_C2 arm ${name} ${ok ? 'ok' : 'FAIL'}${detail ? ` ${detail}` : ''}`);
  };
  const want = (r, code, needle, lacks) => ({
    ok: r.code === code && r.out.includes(needle) && (!lacks || !r.out.includes(lacks)),
    detail: `exit=${r.code} want=${JSON.stringify(needle)}${lacks ? ` lacks=${JSON.stringify(lacks)}` : ''} out=${r.out.trim().split('\n')[0]}`,
  });
  const compare = (file, extra = [], rootDir = cleanRoot) => run(['--compare', file, '--root', rootDir, ...extra]);
  const note = join(lane, 'corpus', 'knowledge', 'omp-agent-root.md');

  arm('compare-in-sync', () => want(compare(todayFile), 0, 'OMP_SHAPE_COMPARE: IN_SYNC'));
  arm('compare-age-disclosed', () => want(compare(todayFile), 0, 'age_days=0'));
  arm('compare-future-unbounded', () => want(compare(futureFile), 2, 'SHAPE_CLOCK'));
  arm('compare-future-bounded', () => want(compare(futureFile, ['--max-age', '30']), 2, 'SHAPE_CLOCK'));
  arm('compare-clock-names-instant', () => want(compare(futureFile, ['--max-age', '30']), 2, `captured_at=${future}`));
  arm('compare-backdated-age', () => want(compare(backFile), 0, 'age_days=45'));
  arm('compare-max-age-stale', () => want(compare(backFile, ['--max-age', '30']), 1, 'SHAPE_STALE_RECEIPT'));
  arm('compare-max-age-pass', () => want(compare(backFile, ['--max-age', '60']), 0, 'IN_SYNC'));
  arm('compare-legacy-v1', () => want(compare(legacyFile), 0, 'captured=absent age_days=absent'));
  arm('compare-legacy-bounded', () => want(compare(legacyFile, ['--max-age', '30']), 2, 'SHAPE_AGE_UNKNOWN'));
  arm('compare-drift', () => want(compare(driftFile, [], driftRoot), 1, 'OMP_SHAPE_COMPARE: DRIFT'));
  arm('compare-drift-first', () => want(compare(driftFile, [], driftRoot), 1, 'first=lsp.json'));
  arm('compare-transient', () => want(compare(todayFile, [], transientRoot), 0, 'transient=1'));
  arm('shape-clock-regression', () => want(run(['--shape', futureFile, '--note', note]), 2, 'SHAPE_CLOCK'));
  arm('clock-one-predicate', () => {
    const a = run(['--shape', futureFile, '--note', note]);
    const b = compare(futureFile);
    return { ok: a.code === 2 && b.code === 2 && a.out.includes('SHAPE_CLOCK') && b.out.includes('SHAPE_CLOCK'), detail: `shape=${a.code} compare=${b.code}` };
  });
  arm('compare-missing-receipt', () => want(compare(join(root, 'nope.json')), 2, 'SHAPE_NOT_FOUND'));

  if (!opts.keep) rmSync(root, { recursive: true, force: true });
  for (const line of rows) process.stdout.write(`${line}\n`);
  const verdict = held === ARMS ? 'HELD' : 'UNMET';
  process.stdout.write(`C83_C2: ${verdict} held=${held}/${ARMS}\n`);
  return held === ARMS ? 0 : 1;
}

process.exit(main());
