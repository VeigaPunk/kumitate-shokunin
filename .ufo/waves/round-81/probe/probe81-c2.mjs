#!/usr/bin/env node
/**
 * probe81-c2.mjs — frozen counter C2 for kumitate round 81.
 *
 * Usage:
 *   node .ufo/waves/round-81/probe/probe81-c2.mjs [--set c2] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C2 — coverage:omp: the shape receipt becomes self-describing
 * (`kumitate-omp-shape-v2`: `captured_at` beside `entries`), `--shape`
 * discloses its age and can gate staleness, and the O score never reacts to
 * the age. Frozen predicate and arms: `.ufo/waves/round-81/plan.md` §C2.
 *
 * Read-only: fixtures live under --work. Exit 0 iff every arm passes; 1
 * otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const RECEIPT_REL = '.ufo/pins/omp-shape.json';
const V2 = 'kumitate-omp-shape-v2';
const V1 = 'kumitate-omp-shape-v1';
const NEUTRAL = '2025-01-01T00:00:00Z';

function parseArgs(argv) {
  const o = { set: 'c2', tool: null, lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--tool') o.tool = resolve(argv[++i]);
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') return { help: true };
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c2') return { error: `unknown set ${o.set}` };
  o.tool = o.tool ?? o.lane;
  return o;
}

const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString().replace(/\.\d{3}Z$/u, 'Z');

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) { process.stderr.write(`${opts.error}\n`); return 64; }
  if (opts.help) {
    process.stdout.write('usage: probe81-c2.mjs [--set c2] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]\n');
    return 0;
  }
  const censusTool = join(opts.tool, 'scripts', 'omp-census.mjs');
  const proxyTool = join(opts.tool, 'scripts', 'proxy-check.mjs');
  const work = opts.work ?? mkdtempSync(join(tmpdir(), 'k81c2-'));
  if (opts.work) mkdirSync(work, { recursive: true });
  const run = (bin, args) => {
    const r = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
    return { code: r.status ?? 64, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(), error: r.error };
  };
  const arms = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try { ({ ok, detail } = fn()); } catch (e) { ok = false; detail = `threw ${e.message}`; }
    arms.push({ name, ok, detail });
  };
  const entriesFor = () => JSON.parse(readFileSync(join(opts.lane, RECEIPT_REL), 'utf8')).entries;
  const receipt = (name, doc) => {
    const file = join(work, name);
    writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
    return file;
  };
  const materialise = (name, entries) => {
    const root = join(work, name);
    mkdirSync(root, { recursive: true });
    for (const e of entries) {
      if (e.kind === 'dir') mkdirSync(join(root, e.name), { recursive: true, mode: e.mode });
      else writeFileSync(join(root, e.name), '');
    }
    return root;
  };

  // 01 — a snapshot writes the v2 document with captured_at.
  arm('snapshot-v2', () => {
    const entries = entriesFor();
    const root = materialise('snap-root', entries);
    const out = join(work, 'snap.json');
    const r = run(censusTool, ['--snapshot', out, '--root', root]);
    const doc = JSON.parse(readFileSync(out, 'utf8'));
    return {
      ok: r.code === 0 && r.out.includes('OMP_SNAPSHOT: WROTE')
        && doc.contract === V2 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(doc.captured_at)
        && Object.keys(doc).sort().join(',') === 'captured_at,contract,entries'
        && doc.entries.length === entries.length,
      detail: `exit=${r.code} contract=${doc.contract} captured=${doc.captured_at} entries=${doc.entries.length}/${entries.length}`,
    };
  });

  // 02 — DISCRIMINATING: --shape discloses the receipt's age.
  arm('shape-age-disclosed', () => {
    const file = receipt('fresh.json', { contract: V2, captured_at: iso(0), entries: entriesFor() });
    const r = run(censusTool, ['--shape', file]);
    const today = new Date().toISOString().slice(0, 10);
    return { ok: r.code === 0 && r.out.includes(`captured=${today} age_days=0`) && r.out.includes('OMP_CENSUS: CLEAN'), detail: `exit=${r.code} out=${r.out.split('\n').at(-1)}` };
  });

  // 03 — a legacy v1 receipt no longer grades the axis: re-capture, not silent read.
  arm('shape-v1-refused', () => {
    const file = receipt('v1.json', { contract: V1, entries: entriesFor() });
    const r = run(censusTool, ['--shape', file]);
    return { ok: r.code === 2 && r.out.includes(`SHAPE_VERSION want=${V2} got=${V1}`), detail: `exit=${r.code} out=${r.out}` };
  });

  // 04 — the non-scoring compare still reads a legacy receipt (report-only surface).
  arm('compare-v1-accepted', () => {
    const file = receipt('v1-compare.json', { contract: V1, entries: entriesFor() });
    const root = materialise('v1-compare-root', entriesFor());
    const r = run(censusTool, ['--compare', file, '--root', root]);
    return { ok: r.code === 0 && r.out.includes('OMP_SHAPE_COMPARE: IN_SYNC'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 05 — DISCRIMINATING: a backdated receipt carries its true age.
  arm('shape-age-backdated', () => {
    const file = receipt('backdated.json', { contract: V2, captured_at: iso(45 * 86400000), entries: entriesFor() });
    const r = run(censusTool, ['--shape', file]);
    return { ok: r.code === 0 && r.out.includes('age_days=45'), detail: `exit=${r.code} out=${r.out.split('\n').at(-1)}` };
  });

  // 06 — DISCRIMINATING: the staleness gate is opt-in and names the window.
  arm('max-age-stale', () => {
    const file = receipt('backdated-30.json', { contract: V2, captured_at: iso(45 * 86400000), entries: entriesFor() });
    const r = run(censusTool, ['--shape', file, '--max-age', '30']);
    return { ok: r.code === 1 && r.out.includes('SHAPE_STALE age_days=45 max_age=30'), detail: `exit=${r.code} out=${r.out.split('\n').slice(-2).join(' | ')}` };
  });

  // 07 — a window the receipt meets stays green.
  arm('max-age-pass', () => {
    const file = receipt('backdated-60.json', { contract: V2, captured_at: iso(45 * 86400000), entries: entriesFor() });
    const r = run(censusTool, ['--shape', file, '--max-age', '60']);
    return { ok: r.code === 0 && r.out.includes('OMP_CENSUS: CLEAN') && !r.out.includes('SHAPE_STALE'), detail: `exit=${r.code} out=${r.out.split('\n').at(-1)}` };
  });

  // 08 — a future capture instant is a clock error, not a fresh receipt.
  arm('clock-future-refused', () => {
    const file = receipt('future.json', { contract: V2, captured_at: iso(-2 * 86400000), entries: entriesFor() });
    const r = run(censusTool, ['--shape', file]);
    return { ok: r.code === 2 && r.out.includes('SHAPE_CLOCK'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 09 — a v2 document without its capture instant is invalid.
  arm('captured-at-required', () => {
    const file = receipt('uncaptured.json', { contract: V2, entries: entriesFor() });
    const r = run(censusTool, ['--shape', file]);
    return { ok: r.code === 2 && r.out.includes('SHAPE_INVALID'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 10 — DISCRIMINATING: compare stays content-free on a v2 receipt.
  arm('compare-v2', () => {
    const entries = entriesFor();
    const file = receipt('v2-compare.json', { contract: V2, captured_at: iso(0), entries });
    const root = materialise('v2-compare-root', entries);
    const r = run(censusTool, ['--compare', file, '--root', root]);
    return { ok: r.code === 0 && new RegExp(`IN_SYNC entries=${entries.length} receipt=${entries.length} added=0 removed=0 changed=0`).test(r.out), detail: `exit=${r.code} out=${r.out}` };
  });

  // 11 — DISCRIMINATING: the age never scores — a 45-day-old receipt still reads coverage:omp 10.
  arm('stale-does-not-score', () => {
    const entries = entriesFor();
    const file = receipt('score.json', { contract: V2, captured_at: iso(45 * 86400000), entries });
    const r = run(proxyTool, ['--json', '--lane', opts.lane, '--omp-shape', file]);
    let j;
    try { j = JSON.parse(r.out.slice(r.out.indexOf('{'))); } catch { return { ok: false, detail: `unparsable json exit=${r.code}` }; }
    return {
      ok: r.code === 0 && j.verdict === 'MATCH' && j.terms.coverage_omp === 10 && j.terms.O_members === entries.length,
      detail: `exit=${r.code} verdict=${j.verdict} coverage_omp=${j.terms.coverage_omp} O_members=${j.terms.O_members}`,
    };
  });

  // 12 — the age is a census surface, not a proxy term (no score widening).
  arm('proxy-terms-unchanged', () => {
    const r = run(proxyTool, ['--json', '--lane', opts.lane]);
    let j;
    try { j = JSON.parse(r.out.slice(r.out.indexOf('{'))); } catch { return { ok: false, detail: `unparsable json exit=${r.code}` }; }
    const keys = Object.keys(j.terms ?? {});
    const injected = keys.filter((k) => /O_age|O_captured|O_stale/.test(k));
    return { ok: r.code === 0 && injected.length === 0 && typeof j.terms.O_members === 'number', detail: `exit=${r.code} injected=${injected.join(',') || 'none'} O_members=${j.terms?.O_members}` };
  });

  // 13 — the receipt stays pinned to its bytes.
  arm('receipt-pinned', () => {
    const bytes = readFileSync(join(opts.lane, RECEIPT_REL));
    const digest = createHash('sha256').update(bytes).digest('hex');
    const scorecard = readFileSync(join(opts.lane, 'SCORECARD.md'), 'utf8');
    const m = /pin\.omp-shape=([0-9a-f]{64})/u.exec(scorecard);
    const doc = JSON.parse(bytes.toString('utf8'));
    return { ok: Boolean(m) && m[1] === digest && doc.contract === V2, detail: `pin=${m?.[1]?.slice(0, 12)} computed=${digest.slice(0, 12)} contract=${doc.contract}` };
  });

  // 14 — the census suite still passes, including the new v2 cases.
  arm('selftest', () => {
    const r = run(censusTool, ['--selftest', '--work', join(work, 'selftest')]);
    return { ok: r.code === 0 && /VERDICT: PASS \(\d+ cases\)/.test(r.out), detail: `exit=${r.code} out=${r.out.split('\n').at(-1)}` };
  });

  // 15 — --max-age outside --shape is a usage error.
  arm('usage-max-age', () => {
    const r = run(censusTool, ['--root', work, '--max-age', '30']);
    return { ok: r.code === 64 && r.out.includes('--max-age is only meaningful with --shape'), detail: `exit=${r.code} out=${r.out}` };
  });

  const held = arms.filter((a) => a.ok).length;
  for (const a of arms) process.stdout.write(`C81_C2 arm ${a.name} ${a.ok ? 'PASS' : 'FAIL'} ${a.detail.replace(/\s+/g, ' ').slice(0, 260)}\n`);
  process.stdout.write(`C81_C2: ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length} tool=${censusTool}\n`);
  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  return held === arms.length ? 0 : 1;
}

process.exit(main(process.argv.slice(2)));
