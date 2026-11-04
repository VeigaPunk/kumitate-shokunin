#!/usr/bin/env node
/**
 * probe80-c2.mjs — frozen counter C2 for kumitate round 80.
 *
 * Usage:
 *   node .ufo/waves/round-80/probe/probe80-c2.mjs [--set c2] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C2 — coverage:omp: the O terms (`O_members`, `O_findings`, `O_bound`, `coverage_omp`) re-derive
 * from the committed shape receipt by default (`source=snapshot` disclosed), the live root is an
 * explicit opt-in (`--omp-live`), and the receipt stays pinned. Frozen predicate and arms:
 * `.ufo/waves/round-80/plan.md` §C2.
 *
 * The lane is read-only: every fixture (live roots, receipts, scorecard copies) lives under --work.
 * Exit 0 iff every arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const KIMI_FIXTURE = resolve(dirname(SELF), '..', '..', 'round-79', 'probe', 'kimi-fixture.json');
const RECEIPT_REL = '.ufo/pins/omp-shape.json';

function parseArgs(argv) {
  const o = { set: 'c2', tool: null, lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--tool') o.tool = resolve(argv[++i]);
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') { o.help = true; return o; }
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c2') return { error: `unknown set ${o.set}` };
  o.tool = o.tool ?? o.lane;
  return o;
}

const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const sha256 = (p) => { try { return createHash('sha256').update(readFileSync(p)).digest('hex'); } catch { return null; } };

function runProxy(work, tool, lane, args, extraEnv = {}) {
  const r = spawnSync(process.execPath, [join(tool, 'scripts/proxy-check.mjs'), '--self', lane, ...args], {
    encoding: 'utf8', timeout: 1800000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, TMPDIR: work, ...extraEnv },
  });
  let json = null;
  try { json = JSON.parse(r.stdout || ''); } catch { /* not json */ }
  return { code: r.status, json, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function runCensus(work, tool, args, extraEnv = {}) {
  const r = spawnSync(process.execPath, [join(tool, 'scripts/omp-census.mjs'), ...args], {
    encoding: 'utf8', timeout: 600000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, TMPDIR: work, ...extraEnv },
  });
  return { code: r.status, out: (r.stdout || '').trim() };
}

/* ------------------------------------------------------------------ fixtures */

/** Materialise a `kumitate-omp-shape-v1` receipt as a live root (names, kinds, modes only). */
function materialise(dest, entries) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true, mode: 0o755 });
  for (const e of entries) {
    const p = join(dest, e.name);
    if (e.kind === 'dir') mkdirSync(p, { recursive: true, mode: e.mode });
    else writeFileSync(p, '');
    chmodSync(p, e.mode);
  }
  chmodSync(dest, 0o755);
}

function receiptEntries(lane) {
  const doc = readJson(join(lane, RECEIPT_REL));
  return doc && Array.isArray(doc.entries) ? doc.entries : null;
}

/** Build a `~/.kimi-code`-shaped root from the round-79 frozen fixture spec. */
function buildKimi(dest, spec) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true, mode: 0o755 });
  for (const m of spec.members) {
    const abs = join(dest, m.path);
    if (m.kind === 'dir') { mkdirSync(abs, { recursive: true }); chmodSync(abs, m.mode); }
    else { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, ''); chmodSync(abs, m.mode); }
    for (const c of m.children ?? []) {
      const p = join(abs, c);
      writeFileSync(p, '');
      chmodSync(p, 0o644);
    }
  }
  chmodSync(dest, 0o755);
}

const withExtra = (entries, n, suffix = '20261104') => [
  ...entries,
  ...Array.from({ length: n }, (_, i) => ({ name: `config.yml.pre-arm80-${i}-${suffix}`, kind: 'file', mode: 0o600 })),
];

function writeReceipt(file, entries) {
  writeFileSync(file, `${JSON.stringify({ contract: 'kumitate-omp-shape-v1', entries }, null, 2)}\n`);
}

function stanzaOf(lane) {
  const text = read(join(lane, 'SCORECARD.md')) || '';
  const out = {};
  for (const m of text.matchAll(/^([A-Za-z0-9_.]+)=(\d+)$/gm)) out[m[1]] = Number(m[2]);
  return out;
}

/* ---------------------------------------------------------------------- arms */

function arms(work, tool, lane) {
  const list = [];
  const add = (name, fn) => list.push({ name, fn });
  const receipt = receiptEntries(lane);
  const root68 = join(work, 'root68');
  const root65 = join(work, 'root65');
  if (receipt) {
    materialise(root65, receipt);
    materialise(root68, withExtra(receipt, 3));
  }

  add('default-snapshot', () => {
    const r = runProxy(work, tool, lane, ['--json'], { OMP_AGENT_ROOT: root68 });
    const t = r.json?.terms ?? {};
    const text = runProxy(work, tool, lane, [], { OMP_AGENT_ROOT: root68 });
    return {
      ok: r.code === 0 && r.json?.ok === true && r.json?.source === 'snapshot'
        && t.O_members === 65 && t.O_findings === 0 && t.coverage_omp === 10
        && text.code === 0 && /source=snapshot/.test(text.out),
      detail: `exit=${r.code} source=${r.json?.source} O_members=${t.O_members} O_findings=${t.O_findings} coverage=${t.coverage_omp} text_exit=${text.code}`,
    };
  });

  add('live-opt-in', () => {
    const r = runProxy(work, tool, lane, ['--json', '--omp-live'], { OMP_AGENT_ROOT: root68 });
    const t = r.json?.terms ?? {};
    return {
      ok: r.code === 1 && r.json?.source === 'live' && t.O_members === 68
        && (r.json?.findings ?? []).some((f) => f.kind === 'O_MEMBERS_DRIFT'),
      detail: `exit=${r.code} source=${r.json?.source} O_members=${t.O_members} kinds=${(r.json?.findings ?? []).map((f) => f.kind).join(',')}`,
    };
  });

  add('offline-default', () => {
    const kimiSpec = readJson(KIMI_FIXTURE);
    const kimi = join(work, 'kimi-offline');
    buildKimi(kimi, kimiSpec);
    const home = join(work, 'home-empty');
    mkdirSync(home, { recursive: true });
    const r = runProxy(work, tool, lane, ['--json', '--kimi-root', kimi],
      { OMP_AGENT_ROOT: '/nonexistent/omp-arm80', HOME: home });
    const t = r.json?.terms ?? {};
    return {
      ok: r.code === 0 && r.json?.source === 'snapshot' && t.O_members === 65 && t.coverage_omp === 10,
      detail: `exit=${r.code} source=${r.json?.source} O_members=${t.O_members} kinds=${(r.json?.findings ?? []).map((f) => f.kind).join(',')}`,
    };
  });

  add('receipt-pinned', () => {
    const text = read(join(lane, 'SCORECARD.md')) || '';
    const m = /^pin\.omp-shape=([0-9a-f]{64})$/m.exec(text);
    const actual = sha256(join(lane, RECEIPT_REL));
    if (!m || !actual) return { ok: false, detail: 'no pin.omp-shape line or no receipt' };
    if (m[1] !== actual) return { ok: false, detail: `pin differs from receipt sha (${m[1].slice(0, 12)} vs ${actual.slice(0, 12)})` };
    const tampered = text.replace(/^pin\.omp-shape=[0-9a-f]{64}$/m, `pin.omp-shape=${'0'.repeat(64)}`);
    const copy = join(work, 'scorecard-tampered-pin.md');
    writeFileSync(copy, tampered);
    const r = runProxy(work, tool, lane, ['--json', '--scorecard', copy], { OMP_AGENT_ROOT: root65 });
    return {
      ok: r.code === 1 && (r.json?.findings ?? []).some((f) => f.kind === 'GATE_PIN_DRIFT'),
      detail: `exit=${r.code} kinds=${(r.json?.findings ?? []).map((f) => f.kind).join(',')}`,
    };
  });

  add('receipt-absent', () => {
    const empty = join(work, 'self-empty');
    mkdirSync(empty, { recursive: true });
    const r = runProxy(work, tool, empty, ['--json']);
    return { ok: r.code === 2 && /OMP_SHAPE_NOT_FOUND/.test(r.out + r.err), detail: `exit=${r.code} out=${JSON.stringify(r.out.slice(0, 120))}` };
  });

  add('receipt-invalid', () => {
    const bad = join(work, 'receipt-invalid.json');
    writeFileSync(bad, '{"contract":"kumitate-omp-shape-v1"}\n');
    const r = runProxy(work, tool, lane, ['--json', '--omp-shape', bad]);
    return { ok: r.code === 2 && /OMP_SHAPE_INVALID/.test(r.out + r.err), detail: `exit=${r.code} out=${JSON.stringify(r.out.slice(0, 160))}` };
  });

  add('stanza-off-by-one', () => {
    const text = read(join(lane, 'SCORECARD.md')) || '';
    const copy = join(work, 'scorecard-off-by-one.md');
    writeFileSync(copy, text.replace(/^O_members=\d+$/m, 'O_members=64'));
    const r = runProxy(work, tool, lane, ['--json', '--scorecard', copy], { OMP_AGENT_ROOT: root68 });
    return {
      ok: r.code === 1 && (r.json?.findings ?? []).some((f) => f.kind === 'O_MEMBERS_DRIFT' && f.declared === 64),
      detail: `exit=${r.code} kinds=${(r.json?.findings ?? []).map((f) => f.kind).join(',')}`,
    };
  });

  add('finding-on-receipt', () => {
    const entries = receipt.map((e) => (e.name === 'mcp.json' ? { ...e, mode: 0o644 } : e));
    if (!entries.some((e) => e.name === 'mcp.json')) return { ok: false, detail: 'mcp.json not in receipt' };
    const file = join(work, 'receipt-mode.json');
    writeReceipt(file, entries);
    const r = runProxy(work, tool, lane, ['--json', '--omp-shape', file]);
    const t = r.json?.terms ?? {};
    return {
      ok: r.code === 1 && t.O_findings === 1 && t.coverage_omp === 9 && t.O_members === 65,
      detail: `exit=${r.code} O_findings=${t.O_findings} coverage=${t.coverage_omp}`,
    };
  });

  add('snapshot-equals-census', () => {
    const c = runCensus(work, tool, ['--shape', join(lane, RECEIPT_REL)]);
    const m = /entries=(\d+) findings=(\d+)(?: bound=(\d+)\/(\d+))?/.exec(c.out);
    const r = runProxy(work, tool, lane, ['--json'], { OMP_AGENT_ROOT: root68 });
    const t = r.json?.terms ?? {};
    const ok = c.code === 0 && !!m && Number(m[1]) === t.O_members
      && Number(m[2]) === t.O_findings && Number(m[3]) === t.O_bound;
    return { ok, detail: `census_exit=${c.code} census=${m ? `${m[1]}/${m[2]}/${m[3]}` : c.out.slice(0, 120)} proxy=${t.O_members}/${t.O_findings}/${t.O_bound}` };
  });

  add('compare-non-scoring', () => {
    const cmp = runCensus(work, tool, ['--compare', join(lane, RECEIPT_REL), '--root', root68]);
    const r = runProxy(work, tool, lane, ['--json'], { OMP_AGENT_ROOT: root68 });
    return {
      ok: cmp.code === 1 && /OMP_SHAPE_COMPARE: DRIFT/.test(cmp.out) && /added=3/.test(cmp.out) && r.code === 0,
      detail: `compare_exit=${cmp.code} compare=${JSON.stringify(cmp.out)} proxy_exit=${r.code}`,
    };
  });

  add('selftest', () => {
    const p = spawnSync(process.execPath, [join(tool, 'scripts/proxy-check.mjs'), '--selftest'], {
      encoding: 'utf8', timeout: 1800000, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, TMPDIR: work },
    });
    const c = spawnSync(process.execPath, [join(tool, 'scripts/omp-census.mjs'), '--selftest'], {
      encoding: 'utf8', timeout: 1800000, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, TMPDIR: work },
    });
    return { ok: p.status === 0 && c.status === 0, detail: `proxy=${p.status} census=${c.status}` };
  });

  add('live-opt-in-clean', () => {
    const r = runProxy(work, tool, lane, ['--json', '--omp-live'], { OMP_AGENT_ROOT: root65 });
    const t = r.json?.terms ?? {};
    return {
      ok: r.code === 0 && r.json?.source === 'live' && t.O_members === 65 && t.coverage_omp === 10,
      detail: `exit=${r.code} source=${r.json?.source} O_members=${t.O_members}`,
    };
  });

  return { list, receipt };
}

/* ---------------------------------------------------------------------- main */

function main(argv) {
  const o = parseArgs(argv);
  if (o.error) { console.log(`probe80-c2: ${o.error}`); return 64; }
  if (o.help) { console.log('usage: node probe80-c2.mjs [--set c2] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]'); return 0; }
  const work = o.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe80-c2-'));
  mkdirSync(work, { recursive: true });
  const { list, receipt } = arms(work, o.tool, o.lane);
  if (!receipt) { console.log('probe80-c2: receipt absent or invalid at ' + join(o.lane, RECEIPT_REL)); rmSync(work, { recursive: true, force: true }); return 1; }
  let passed = 0;
  try {
    list.forEach((arm, i) => {
      let r;
      try { r = arm.fn(); } catch (e) { r = { ok: false, detail: `threw ${e && e.message}` }; }
      if (r.ok) passed++;
      console.log(`C80_C2 arm ${String(i + 1).padStart(2, '0')} ${arm.name}: ${r.ok ? 'PASS' : 'FAIL'} ${r.detail}`);
    });
  } finally {
    if (!o.keep) rmSync(work, { recursive: true, force: true });
  }
  console.log(`C80_C2: HELD held=${passed}/${list.length}`);
  return passed === list.length ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
