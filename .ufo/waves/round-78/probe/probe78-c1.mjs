#!/usr/bin/env node
/**
 * probe78-c1.mjs — frozen counter C1 for kumitate round 78.
 *
 * Usage:
 *   node .ufo/waves/round-78/probe/probe78-c1.mjs [--set c1] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C1 — coverage:kimi-layer: the proxy derives the K plane from the census
 * decision (imported, findings included), never from a duplicate table.
 * Frozen predicate and arms: .ufo/waves/round-78/plan.md §C1.
 *
 * The counter never mutates the lane: every fixture root, scorecard copy and
 * receipt lives under --work (mkdtemp under $TMPDIR by default); the lane is
 * read-only. Exit 0 iff every arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..');
const FIXTURE = resolve(dirname(SELF), 'kimi-fixture.json');
const SRC_PIN = process.env.PROBE78_SRC || '/fast/scratch/hyaku/kumitate-pin/src';
const MARKER = 'PROBE78_KIMI_SECRET_MARKER';

function parseArgs(argv) {
  const o = { set: 'c1', lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') { o.help = true; return o; }
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c1') return { error: `unknown set ${o.set}` };
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

/** Build a `~/.kimi-code`-shaped root from the frozen fixture spec (shape only). */
function buildRoot(dest, spec) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true, mode: 0o755 });
  for (const m of spec.members) {
    const abs = join(dest, m.path);
    if (m.kind === 'dir') {
      mkdirSync(abs, { recursive: true });
      chmodSync(abs, m.mode);
    } else if (m.kind === 'file') {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, '');
      chmodSync(abs, m.mode);
    } else {
      throw new Error(`fixture kind ${m.kind} unsupported`);
    }
    for (const c of m.children ?? []) {
      const p = join(abs, c);
      writeFileSync(p, '');
      chmodSync(p, 0o644);
    }
  }
  chmodSync(dest, 0o755);
}

function proxy(lane, work, args) {
  const r = runNode(lane, [join(lane, 'scripts', 'proxy-check.mjs'), '--src', SRC_PIN, ...args], work);
  return { ...r, json: parseJson(r.stdout) };
}

function census(lane, work, args) {
  return runNode(lane, [join(lane, 'scripts', 'kimi-census.mjs'), ...args], work);
}

const kinds = (json) => new Set((json?.findings ?? []).map((f) => f.kind));

function checkCleanFixture(ctx) {
  const r = census(ctx.lane, ctx.work, ['--root', ctx.clean]);
  const line = r.stdout.trim().split('\n').pop() || '';
  const ok = r.status === 0 && /^KIMI_CENSUS: CLEAN \(members=55 checked=55 /u.test(line);
  return ok ? [true, line] : [false, `exit=${r.status} line=${line}`];
}

function checkModeViolationCensus(ctx) {
  const r = census(ctx.lane, ctx.work, ['--root', ctx.mode]);
  const ok = r.status === 1 && /SHAPE_DRIFT/u.test(r.stdout) && /mcp\.json/u.test(r.stdout);
  return ok ? [true, `exit=${r.status}`] : [false, `exit=${r.status} out=${r.stdout.slice(0, 200)}`];
}

function checkProxyClean(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--json']);
  const j = r.json;
  const t = j?.terms ?? {};
  const ok = r.status === 0 && j?.verdict === 'MATCH' && t.K_members === 55
    && t.K_sections === 55 && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `exit=${r.status} K=${t.K_sections}/${t.K_members} findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} verdict=${j?.verdict} terms=${JSON.stringify({ K_members: t.K_members, K_sections: t.K_sections, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkProxyModeViolation(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.mode, '--json']);
  const j = r.json;
  const t = j?.terms ?? {};
  const k = kinds(j);
  const ok = t.K_findings === 1 && t.coverage_kimi === 9
    && k.has('K_FINDINGS_DRIFT') && k.has('COVERAGE_KIMI_DRIFT');
  return ok ? [true, `K_findings=${t.K_findings} cov=${t.coverage_kimi} kinds=${[...k].join(',')}`]
    : [false, `exit=${r.status} terms=${JSON.stringify({ K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })} kinds=${[...k].join(',')}`];
}

function checkProxyStray(ctx) {
  const c = census(ctx.lane, ctx.work, ['--root', ctx.stray]);
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.stray, '--json']);
  const t = r.json?.terms ?? {};
  const ok = c.status === 1 && /UNLISTED/u.test(c.stdout)
    && t.K_members === 55 && t.K_findings === 1 && t.coverage_kimi === 9;
  return ok ? [true, `census=${c.status} K_findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `census=${c.status} terms=${JSON.stringify({ K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkProxyMissing(ctx) {
  const c = census(ctx.lane, ctx.work, ['--root', ctx.missing]);
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.missing, '--json']);
  const t = r.json?.terms ?? {};
  const ok = c.status === 1 && /MEMBER_MISSING/u.test(c.stdout)
    && t.K_members === 54 && t.K_findings === 1 && t.coverage_kimi === 9;
  return ok ? [true, `K_members=${t.K_members} K_findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `census=${c.status} terms=${JSON.stringify({ K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkSingleDerivation(ctx) {
  const src = readText(join(ctx.lane, 'scripts', 'proxy-check.mjs')) ?? '';
  const dup = (src.match(/K_MEMBER_RULES/gu) ?? []).length;
  const url = pathToFileURL(join(ctx.lane, 'scripts', 'kimi-census.mjs')).href;
  const code = `import(${JSON.stringify(`${url}?probe=1`)}).then((m) => {
    const d = typeof m.decide === 'function' ? m.decide(${JSON.stringify(ctx.clean)}) : null;
    const ids = d && d.identities ? (d.identities instanceof Set ? [...d.identities] : d.identities) : null;
    process.stdout.write(JSON.stringify({ members: d ? d.members : null,
      findings: d && Array.isArray(d.findings) ? d.findings.length : null,
      hasMcp: Array.isArray(ids) ? ids.includes('mcp.json') : false }) + '\\n');
  }).catch((e) => { process.stdout.write(JSON.stringify({ error: String(e && e.message) }) + '\\n'); });`;
  const r = runNode(ctx.lane, ['--input-type=module', '-e', code], ctx.work);
  const d = parseJson(r.stdout.trim().split('\n').pop() || '');
  const ok = dup === 0 && d !== null && d.members === 55 && d.findings === 0 && d.hasMcp === true;
  return ok ? [true, `K_MEMBER_RULES=${dup} decide.members=${d.members} findings=${d.findings}`]
    : [false, `K_MEMBER_RULES=${dup} decide=${JSON.stringify(d)} exit=${r.status}`];
}

function scorecardCopy(ctx, from, to, dest) {
  const text = readText(join(ctx.lane, 'SCORECARD.md'));
  if (text === null) return null;
  writeFileSync(dest, text.replace(from, to));
  return dest;
}

function checkStanzaTamper(ctx) {
  const copy = scorecardCopy(ctx, /K_findings=0/u, 'K_findings=1', join(ctx.work, 'scorecard-kfindings.md'));
  if (copy === null) return [false, 'scorecard unreadable'];
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--scorecard', copy, '--json']);
  const k = kinds(r.json);
  const t = r.json?.terms ?? {};
  const ok = r.status === 1 && k.has('K_FINDINGS_DRIFT') && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `kinds=${[...k].join(',')}`]
    : [false, `exit=${r.status} kinds=${[...k].join(',')} terms=${JSON.stringify({ K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkAxesCrosscheck(ctx) {
  const copy = scorecardCopy(ctx, /^\| coverage:kimi-layer \| 10 \|/mu, '| coverage:kimi-layer | 9 |', join(ctx.work, 'scorecard-axes.md'));
  if (copy === null) return [false, 'scorecard unreadable'];
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--scorecard', copy, '--json']);
  const k = kinds(r.json);
  const axes = (r.json?.findings ?? []).find((f) => f.kind === 'AXES_DRIFT' && f.key === 'coverage_kimi');
  const ok = r.status === 1 && k.has('AXES_DRIFT') && axes !== undefined;
  return ok ? [true, axes.detail] : [false, `exit=${r.status} kinds=${[...k].join(',')}`];
}

function checkContentBlind(ctx) {
  const c = census(ctx.lane, ctx.work, ['--root', ctx.content]);
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.content, '--json']);
  const marker = MARKER;
  const leaked = [c.stdout, c.stderr, r.stdout, r.stderr].some((t) => t.includes(marker));
  const ok = !leaked && /KIMI_CENSUS: CLEAN/u.test(c.stdout) && r.json?.terms?.K_findings === 0;
  return ok ? [true, 'shape-only'] : [false, `leaked=${leaked} census=${/KIMI_CENSUS: CLEAN/u.test(c.stdout)}`];
}

function checkLiveStrict(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.live, '--strict', '--json']);
  const t = r.json?.terms ?? {};
  const ok = r.status === 0 && r.json?.verdict === 'MATCH' && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `exit=0 K_findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} verdict=${r.json?.verdict} notes=${r.stdout.slice(0, 300)}`];
}

function checkSelftests(ctx) {
  const c = runNode(ctx.lane, [join(ctx.lane, 'scripts', 'kimi-census.mjs'), '--selftest'], ctx.work);
  const p = runNode(ctx.lane, [join(ctx.lane, 'scripts', 'proxy-check.mjs'), '--selftest'], ctx.work);
  const ok = c.status === 0 && p.status === 0;
  return ok ? [true, `census=${c.status} proxy=${p.status}`]
    : [false, `census=${c.status} proxy=${p.status} p=${p.stdout.slice(-300)}`];
}

const ARMS = [
  ['census-clean-fixture', checkCleanFixture],
  ['census-mode-violation', checkModeViolationCensus],
  ['proxy-clean-terms', checkProxyClean],
  ['proxy-mode-violation', checkProxyModeViolation],
  ['proxy-stray', checkProxyStray],
  ['proxy-missing', checkProxyMissing],
  ['single-derivation', checkSingleDerivation],
  ['stanza-tamper', checkStanzaTamper],
  ['axes-crosscheck', checkAxesCrosscheck],
  ['content-blind', checkContentBlind],
  ['live-strict', checkLiveStrict],
  ['selftests', checkSelftests],
];

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error !== undefined) {
    process.stderr.write(`probe78-c1: ${opts.error}\n`);
    process.exit(64);
  }
  if (opts.help) {
    process.stdout.write('usage: node probe78-c1.mjs [--set c1] [--lane DIR] [--work DIR] [--keep-work]\n');
    process.exit(0);
  }
  const lane = opts.lane;
  const work = opts.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe78c1-'));
  mkdirSync(work, { recursive: true });

  const raw = readText(FIXTURE);
  const spec = raw === null ? null : parseJson(raw);
  if (spec === null || !Array.isArray(spec.members)) {
    process.stderr.write(`probe78-c1: fixture ${FIXTURE} unreadable\n`);
    process.exit(2);
  }

  const ctx = {
    lane, work,
    live: join(process.env.HOME || '', '.kimi-code'),
    clean: join(work, 'k-clean'),
    mode: join(work, 'k-mode'),
    stray: join(work, 'k-stray'),
    missing: join(work, 'k-missing'),
    content: join(work, 'k-content'),
  };

  buildRoot(ctx.clean, spec);
  buildRoot(ctx.mode, spec);
  buildRoot(ctx.stray, spec);
  buildRoot(ctx.missing, spec);
  buildRoot(ctx.content, spec);
  chmodSync(join(ctx.mode, 'mcp.json'), 0o200);
  writeFileSync(join(ctx.stray, 'probe-stray.bin'), '');
  rmSync(join(ctx.missing, 'region'), { force: true });
  writeFileSync(join(ctx.content, 'mcp.json'), MARKER);
  chmodSync(join(ctx.content, 'mcp.json'), 0o400);

  let held = 0;
  for (const [name, fn] of ARMS) {
    let ok = false;
    let detail = '';
    try {
      [ok, detail] = await fn(ctx);
    } catch (e) {
      ok = false;
      detail = `threw ${e && e.message}`;
    }
    if (ok) held += 1;
    process.stdout.write(`C78_C1 arm ${name} ${ok ? 'ok' : 'FAIL'} ${detail}\n`);
  }
  process.stdout.write(`C78_C1: HELD held=${held}/${ARMS.length}\n`);

  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  process.exit(held === ARMS.length ? 0 : 1);
}

await main();
