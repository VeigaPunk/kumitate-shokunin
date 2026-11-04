#!/usr/bin/env node
/**
 * probe82-c2.mjs — FROZEN counter for round-82 C2 (coverage:omp, integer 10 held; the
 * OMP-plane evidence surface gains the receipt's own age on the compare path).
 *
 *   node .ufo/waves/round-82/probe/probe82-c2.mjs --set c2 [--lane DIR] [--work DIR] [--keep]
 *
 * Predicate (plan.md §C2): prints `C82_C2: HELD held=13/13` and exits 0 at the measured
 * revision M. Base tree: `--max-age` on `--compare` is usage 64 and no age field is
 * printed, so at most 1/13 arms hold. Constant-`IN_SYNC` stub: at most 5/13.
 *
 * Hermetic fixtures under `--work` (default `$HYAKU_SCRATCH/kumitate-r82/probe82-c2`, else
 * a mkdtemp under the OS temp dir). The probe shells the lane's own `omp-census` and
 * `proxy-check`; it never writes into the lane.
 *
 * Frozen at the round-82 freeze commit; never edit after a data seat has scored.
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ARMS = 13;
const DAY = 86400000;

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

const isoSecond = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/u, 'Z');

const ENTRIES = [
  { name: 'a-file', kind: 'file', mode: 0o644 },
  { name: 'b-dir', kind: 'dir', mode: 0o755 },
  { name: 'c-link', kind: 'symlink', mode: 0o777 },
];

function materialise(root, entries, { extra = [], drop = [], remode = null } = {}) {
  mkdirSync(root, { recursive: true });
  for (const e of entries) {
    if (drop.includes(e.name)) continue;
    const p = join(root, e.name);
    const mode = remode && remode.name === e.name ? remode.mode : e.mode;
    if (e.kind === 'dir') mkdirSync(p, { recursive: true, mode });
    else if (e.kind === 'symlink') symlinkSync('a-file', p);
    else writeFileSync(p, '', { mode });
    if (e.kind !== 'symlink') { try { chmodSync(p, mode); } catch { /* best effort */ } }
  }
  for (const name of extra) writeFileSync(join(root, name), '');
}

function receipt(file, capturedAt, entries = ENTRIES, legacy = false) {
  const doc = legacy
    ? { contract: 'kumitate-omp-shape-v1', entries }
    : { contract: 'kumitate-omp-shape-v2', captured_at: isoSecond(capturedAt), entries };
  writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
}

function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.error) { process.stdout.write(`PROBE82_C2: USAGE ${opts.error}\n`); return 64; }
  const lane = resolve(opts.lane);
  const tool = join(lane, 'scripts', 'omp-census.mjs');
  const base = opts.work
    ? (mkdirSync(opts.work, { recursive: true }), opts.work)
    : (process.env.HYAKU_SCRATCH
      ? (mkdirSync(join(process.env.HYAKU_SCRATCH, 'kumitate-r82', 'probe82-c2'), { recursive: true }), join(process.env.HYAKU_SCRATCH, 'kumitate-r82', 'probe82-c2'))
      : tmpdir());
  const root = mkdtempSync(join(base, 'c82c2-'));

  const run = (args) => {
    const r = spawnSync(process.execPath, [tool, ...args], { cwd: lane, encoding: 'utf8', timeout: 120000 });
    return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };
  const proxy = (args) => {
    const r = spawnSync(process.execPath, [join(lane, 'scripts', 'proxy-check.mjs'), ...args], { cwd: lane, encoding: 'utf8', timeout: 180000 });
    return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };

  const now = Date.now();
  const fresh = join(root, 'fresh.json');
  const aged = join(root, 'aged.json');
  const legacy = join(root, 'legacy.json');
  receipt(fresh, now);
  receipt(aged, now - 45 * DAY);
  receipt(legacy, null, ENTRIES, true);
  const liveRoot = join(root, 'live');
  materialise(liveRoot, ENTRIES);

  let held = 0;
  const rows = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `throw ${e.message}`; }
    if (ok) held++;
    rows.push(`C82_C2 arm ${name} ${ok ? 'ok' : 'FAIL'}${detail ? ` ${detail}` : ''}`);
  };
  const want = (r, code, needles) => {
    const miss = needles.filter((n) => !r.out.includes(n));
    return { ok: r.code === code && miss.length === 0, detail: `exit=${r.code}${miss.length ? ` missing=${miss.join(',')}` : ''} out=${r.out.trim().split('\n')[0]}` };
  };

  arm('compare-baseline', () => want(run(['--compare', fresh, '--root', liveRoot]), 0, ['OMP_SHAPE_COMPARE: IN_SYNC', `receipt=${ENTRIES.length}`]));
  arm('compare-age-v2', () => want(run(['--compare', fresh, '--root', liveRoot]), 0, ['receipt_captured=', 'age_days=0']));
  arm('compare-age-45', () => want(run(['--compare', aged, '--root', liveRoot]), 0, ['age_days=45']));
  arm('compare-max-age-stale', () => want(run(['--compare', aged, '--root', liveRoot, '--max-age', '30']), 1, ['SHAPE_STALE_RECEIPT', 'age_days=45', 'max_age=30']));
  arm('compare-max-age-fresh', () => want(run(['--compare', aged, '--root', liveRoot, '--max-age', '60']), 0, ['OMP_SHAPE_COMPARE: IN_SYNC']));
  arm('compare-v1-captured-absent', () => want(run(['--compare', legacy, '--root', liveRoot]), 0, ['OMP_SHAPE_COMPARE: IN_SYNC', 'captured=absent']));
  arm('compare-v1-maxage-unknown', () => want(run(['--compare', legacy, '--root', liveRoot, '--max-age', '1']), 2, ['SHAPE_AGE_UNKNOWN']));
  arm('shape-maxage-regression', () => want(run(['--shape', aged, '--max-age', '30']), 1, ['SHAPE_STALE age_days=45 max_age=30']));

  // The score arm ages the lane's own pinned receipt: synthetic names would be census findings,
  // so only the real declared members isolate "the age never scores".
  const pin = join(lane, '.ufo', 'pins', 'omp-shape.json');
  const agedPin = join(root, 'aged-pin.json');
  let pinReady = false;
  try {
    const doc = JSON.parse(readFileSync(pin, 'utf8'));
    doc.captured_at = isoSecond(now - 45 * DAY);
    writeFileSync(agedPin, `${JSON.stringify(doc, null, 2)}\n`);
    pinReady = true;
  } catch { /* no pin in this tree: the arm fails like any base tree without one */ }

  arm('score-unchanged', () => {
    if (!pinReady) return { ok: false, detail: 'no pinned receipt' };
    const r = proxy(['--omp-shape', agedPin, '--json']);
    let doc = null;
    try { doc = JSON.parse(r.out); } catch { /* not JSON */ }
    const terms = doc?.terms ?? {};
    return {
      ok: terms.coverage_omp === 10 && doc?.source === 'snapshot',
      detail: `coverage_omp=${terms.coverage_omp} source=${doc?.source}`,
    };
  });

  const blindRoot = join(root, 'blind');
  materialise(blindRoot, ENTRIES);
  writeFileSync(join(blindRoot, 'a-file'), 'x'.repeat(4096), { mode: 0o644 });
  arm('compare-content-blind', () => want(run(['--compare', fresh, '--root', blindRoot]), 0, ['OMP_SHAPE_COMPARE: IN_SYNC']));

  const transientRoot = join(root, 'transient');
  materialise(transientRoot, ENTRIES, { extra: ['agent.db-shm'] });
  arm('compare-transient', () => want(run(['--compare', fresh, '--root', transientRoot]), 0, ['OMP_SHAPE_COMPARE: IN_SYNC', 'transient=1']));

  const deltaRoot = join(root, 'delta');
  materialise(deltaRoot, ENTRIES, { extra: ['zz-added'], drop: ['c-link'], remode: { name: 'a-file', mode: 0o600 } });
  arm('compare-counts', () => want(run(['--compare', fresh, '--root', deltaRoot]), 1, ['added=1', 'removed=1', 'changed=1', 'first=']));

  arm('selftest', () => {
    const r = run(['--selftest']);
    const m = /VERDICT: PASS \((\d+) cases\)/.exec(r.out);
    const cases = m ? Number(m[1]) : 0;
    return { ok: r.code === 0 && cases >= 100, detail: `exit=${r.code} cases=${cases}${m ? '' : ' no-tally'}` };
  });

  if (!opts.keep) rmSync(root, { recursive: true, force: true });
  for (const line of rows) process.stdout.write(`${line}\n`);
  const verdict = held === ARMS ? 'HELD' : 'UNMET';
  process.stdout.write(`C82_C2: ${verdict} held=${held}/${ARMS}\n`);
  return held === ARMS ? 0 : 1;
}

process.exit(main());
