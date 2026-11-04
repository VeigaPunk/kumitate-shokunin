#!/usr/bin/env node
/**
 * probe78-c2.mjs — frozen counter C2 for kumitate round 78.
 *
 * Usage:
 *   node .ufo/waves/round-78/probe/probe78-c2.mjs [--set c2] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C2 — operability: capability `omp-shape-compare` — a count-only, non-scoring
 * live-vs-receipt drift diagnostic. Frozen predicate and arms:
 * .ufo/waves/round-78/plan.md §C2.
 *
 * Node/git-free counters; the lane is read-only, every fixture lives under
 * --work (mkdtemp under $TMPDIR by default). Exit 0 iff every arm passes; 1
 * otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..');
const RECEIPT_REL = '.ufo/pins/omp-shape.json';
const SHAPE_CONTRACT = 'kumitate-omp-shape-v1';
const MARKER = 'PROBE78_OMP_CONTENT_MARKER';

function parseArgs(argv) {
  const o = { set: 'c2', lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') { o.help = true; return o; }
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c2') return { error: `unknown set ${o.set}` };
  return o;
}

const readText = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const parseJson = (t) => { try { return JSON.parse(t); } catch { return null; } };

function runNode(lane, args, work) {
  const r = spawnSync(process.execPath, args, {
    cwd: lane, encoding: 'utf8', timeout: 900000,
    env: { ...process.env, TMPDIR: work },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}

const tool = (lane) => join(lane, 'scripts', 'omp-census.mjs');

function census(lane, work, args) {
  return runNode(lane, [tool(lane), ...args], work);
}

function validShape(doc) {
  return !!doc && doc.contract === SHAPE_CONTRACT && Array.isArray(doc.entries)
    && doc.entries.length > 0
    && doc.entries.every((e) => e && typeof e.name === 'string'
      && ['file', 'dir', 'symlink'].includes(e.kind) && Number.isInteger(e.mode)
      && Object.keys(e).sort().join(',') === 'kind,mode,name');
}

/** Materialise a shape receipt into a real tree (the inverse of `--snapshot`). */
function materialise(doc, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true, mode: 0o755 });
  for (const e of doc.entries) {
    const p = join(dir, e.name);
    if (e.kind === 'dir') { mkdirSync(p, { mode: 0o755 }); chmodSync(p, e.mode); }
    else if (e.kind === 'file') { writeFileSync(p, ''); chmodSync(p, e.mode); }
    else if (e.kind === 'symlink') { spawnSync('ln', ['-s', 'probe-missing-target', p]); }
    else throw new Error(`unsupported kind ${e.kind}`);
  }
}

const lastLine = (r) => (r.stdout.trim().split('\n').pop() || '');

function checkUsageListsCompare(ctx) {
  const help = census(ctx.lane, ctx.work, ['--help']);
  const ok = help.status === 0 && /--compare/u.test(help.stdout);
  return ok ? [true, 'help names --compare'] : [false, `exit=${help.status} help=${help.stdout.slice(0, 160)}`];
}

function checkInSync(ctx) {
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', ctx.root]);
  const line = lastLine(r);
  const ok = r.status === 0
    && line === 'OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0';
  return ok ? [true, line] : [false, `exit=${r.status} line=${line}`];
}

function checkAdded(ctx) {
  writeFileSync(join(ctx.root, 'probe-extra'), '');
  chmodSync(join(ctx.root, 'probe-extra'), 0o644);
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', ctx.root]);
  const line = lastLine(r);
  const ok = r.status === 1 && /^OMP_SHAPE_COMPARE: DRIFT /u.test(line)
    && /entries=65 receipt=64 /u.test(line) && /added=1 removed=0 changed=0 /u.test(line)
    && /first=probe-extra$/u.test(line);
  return ok ? [true, line] : [false, `exit=${r.status} line=${line}`];
}

function checkRemoved(ctx) {
  const victim = ctx.doc.entries.find((e) => e.kind === 'file').name;
  materialise(ctx.doc, ctx.root);
  unlinkSync(join(ctx.root, victim));
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', ctx.root]);
  const line = lastLine(r);
  const ok = r.status === 1 && /entries=63 receipt=64 /u.test(line)
    && /added=0 removed=1 changed=0 /u.test(line) && line.includes(`first=${victim}`);
  return ok ? [true, line] : [false, `exit=${r.status} line=${line} victim=${victim}`];
}

function checkChanged(ctx) {
  const victim = ctx.doc.entries.find((e) => e.kind === 'file');
  materialise(ctx.doc, ctx.root);
  chmodSync(join(ctx.root, victim.name), (victim.mode & 0o777) ^ 0o004);
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', ctx.root]);
  const line = lastLine(r);
  const ok = r.status === 1 && /entries=64 receipt=64 /u.test(line)
    && /added=0 removed=0 changed=1 /u.test(line) && line.includes(`first=${victim.name}`);
  return ok ? [true, line] : [false, `exit=${r.status} line=${line} victim=${victim.name}`];
}

function checkInvalidReceipt(ctx) {
  const bad = join(ctx.work, 'bad-shape.json');
  writeFileSync(bad, '{"contract":"kumitate-omp-shape-v1","entries":[');
  const r = census(ctx.lane, ctx.work, ['--compare', bad, '--root', ctx.root]);
  const ok = r.status === 2 && /SHAPE_INVALID/u.test(r.stdout + r.stderr);
  return ok ? [true, `exit=2`] : [false, `exit=${r.status} out=${(r.stdout + r.stderr).slice(0, 200)}`];
}

function checkAbsentReceipt(ctx) {
  const r = census(ctx.lane, ctx.work, ['--compare', join(ctx.work, 'absent-shape.json'), '--root', ctx.root]);
  const ok = r.status === 2 && /SHAPE_NOT_FOUND/u.test(r.stdout + r.stderr);
  return ok ? [true, 'exit=2'] : [false, `exit=${r.status} out=${(r.stdout + r.stderr).slice(0, 200)}`];
}

function checkRootNotDir(ctx) {
  const f = join(ctx.work, 'root-is-a-file');
  writeFileSync(f, '');
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', f]);
  const ok = r.status === 2 && /ROOT_NOT_A_DIR/u.test(r.stdout + r.stderr);
  return ok ? [true, 'exit=2'] : [false, `exit=${r.status} out=${(r.stdout + r.stderr).slice(0, 200)}`];
}

function checkContentBlind(ctx) {
  materialise(ctx.doc, ctx.root);
  const victim = ctx.doc.entries.find((e) => e.kind === 'file').name;
  writeFileSync(join(ctx.root, victim), MARKER);
  chmodSync(join(ctx.root, victim), ctx.doc.entries.find((e) => e.name === victim).mode & 0o777);
  const r = census(ctx.lane, ctx.work, ['--compare', ctx.receipt, '--root', ctx.root]);
  const leaked = (r.stdout + r.stderr).includes(MARKER);
  const ok = !leaked && r.status === 0 && /IN_SYNC entries=64 receipt=64 /u.test(lastLine(r));
  return ok ? [true, 'shape-only IN_SYNC'] : [false, `leaked=${leaked} exit=${r.status} line=${lastLine(r)}`];
}

function checkNonScoring(ctx) {
  const src = readText(join(ctx.lane, 'scripts', 'proxy-check.mjs')) ?? '';
  const inProxy = (src.match(/--compare/gu) ?? []).length;
  const snap = census(ctx.lane, ctx.work, ['--snapshot', join(ctx.work, 'snap.json'), '--root', ctx.root]);
  const shape = census(ctx.lane, ctx.work, ['--shape', join(ctx.work, 'snap.json'), '--self', ctx.lane,
    '--note', join(ctx.lane, 'corpus', 'knowledge', 'omp-agent-root.md')]);
  const ok = inProxy === 0 && snap.status === 0 && shape.status === 0
    && /OMP_CENSUS: CLEAN \(source=snapshot entries=64 findings=0 bound=35\/35\)/u.test(shape.stdout);
  return ok ? [true, `proxy-compare=${inProxy} snapshot=${snap.status} shape=${shape.status}`]
    : [false, `proxy-compare=${inProxy} snapshot=${snap.status} shape=${shape.status} line=${lastLine(shape)}`];
}

function checkSelftests(ctx) {
  const st = census(ctx.lane, ctx.work, ['--selftest']);
  const live = census(ctx.lane, ctx.work, ['--shape', join(ctx.lane, RECEIPT_REL)]);
  const ok = st.status === 0 && live.status === 0 && /OMP_CENSUS: CLEAN \(source=snapshot /u.test(live.stdout);
  return ok ? [true, `selftest=${st.status} live=${live.status}`]
    : [false, `selftest=${st.status} live=${live.status} ${st.stdout.slice(-200)}`];
}

const ARMS = [
  ['usage-lists-compare', checkUsageListsCompare],
  ['in-sync', checkInSync],
  ['added', checkAdded],
  ['removed', checkRemoved],
  ['changed', checkChanged],
  ['invalid-receipt', checkInvalidReceipt],
  ['absent-receipt', checkAbsentReceipt],
  ['root-not-dir', checkRootNotDir],
  ['content-blind', checkContentBlind],
  ['non-scoring', checkNonScoring],
  ['selftests', checkSelftests],
];

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error !== undefined) {
    process.stderr.write(`probe78-c2: ${opts.error}\n`);
    process.exit(64);
  }
  if (opts.help) {
    process.stdout.write('usage: node probe78-c2.mjs [--set c2] [--lane DIR] [--work DIR] [--keep-work]\n');
    process.exit(0);
  }
  const lane = opts.lane;
  const work = opts.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe78c2-'));
  mkdirSync(work, { recursive: true });

  const receipt = join(lane, RECEIPT_REL);
  const doc = parseJson(readText(receipt) ?? '');
  if (!validShape(doc)) {
    process.stderr.write(`probe78-c2: receipt ${receipt} invalid\n`);
    process.exit(2);
  }
  const ctx = { lane, work, receipt, doc, root: join(work, 'omp-root') };
  materialise(doc, ctx.root);

  let held = 0;
  for (const [name, fn] of ARMS) {
    let ok = false;
    let detail = '';
    try {
      [ok, detail] = fn(ctx);
    } catch (e) {
      ok = false;
      detail = `threw ${e && e.message}`;
    }
    if (ok) held += 1;
    process.stdout.write(`C78_C2 arm ${name} ${ok ? 'ok' : 'FAIL'} ${detail}\n`);
  }
  process.stdout.write(`C78_C2: HELD held=${held}/${ARMS.length}\n`);

  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  process.exit(held === ARMS.length ? 0 : 1);
}

main();
