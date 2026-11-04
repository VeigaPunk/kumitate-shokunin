#!/usr/bin/env node
/**
 * probe79-c1.mjs — frozen counter C1 for kumitate round 79.
 *
 * Usage:
 *   node .ufo/waves/round-79/probe/probe79-c1.mjs [--set c1] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C1 — coverage:kimi-layer: the K score is the product of BOTH factors
 * (documentation `K_sections/K_members` AND census health
 * `(K_members − K_findings)/K_members`) — the round-78 harm repaired under the
 * operator default (b). Frozen predicate and arms: `.ufo/waves/round-79/plan.md` §C1.
 *
 * The counter never mutates the lane: every fixture root, lane copy and receipt
 * lives under --work (mkdtemp under $TMPDIR by default); the lane is read-only.
 * Exit 0 iff every arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
// `.ufo/waves/round-79/probe` → four levels up is the lane root (the r78 probes
// carried three and resolved `.ufo`; defect recorded in the round-79 lesson).
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const FIXTURE = resolve(dirname(SELF), 'kimi-fixture.json');
const SRC_PIN = process.env.PROBE79_SRC || '/fast/scratch/hyaku/kumitate-pin/src';
const MARKER = 'PROBE79_KIMI_SECRET_MARKER';
const SESSIONS_HEADING = '## `~/.kimi-code/sessions/` — the worktree-keyed session store';
const DENAMED_HEADING = '## The session store — worktree-keyed (heading de-named for the harm probe)';

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

function runNode(cwd, args, work) {
  const r = spawnSync(process.execPath, args, {
    cwd, encoding: 'utf8', timeout: 1800000,
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

/** A scoring-relevant copy of the lane (scripts, corpus, pins, scorecard, skill). */
function copyLane(lane, dest) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(join(dest, '.ufo'), { recursive: true });
  const pairs = [
    ['scripts', 'scripts'], ['corpus', 'corpus'], ['SCORECARD.md', 'SCORECARD.md'],
    ['SKILL.md', 'SKILL.md'], ['PROVINCE.md', 'PROVINCE.md'], ['README.md', 'README.md'],
    ['.ufo/pins', '.ufo/pins'],
  ];
  for (const [from, to] of pairs) {
    const r = spawnSync('cp', ['-a', join(lane, from), join(dest, to)], { encoding: 'utf8', timeout: 600000 });
    if (r.status !== 0) throw new Error(`copyLane ${from} failed: ${(r.stderr || '').slice(0, 200)}`);
  }
  return dest;
}

function proxy(lane, work, args) {
  const r = runNode(lane, [join(lane, 'scripts', 'proxy-check.mjs'), '--src', SRC_PIN, ...args], work);
  return { ...r, json: parseJson(r.stdout) };
}

const kinds = (json) => new Set((json?.findings ?? []).map((f) => f.kind));

function checkCleanTerms(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--json']);
  const t = r.json?.terms ?? {};
  const ok = r.status === 0 && r.json?.verdict === 'MATCH'
    && t.K_sections === 55 && t.K_members === 55 && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `K=${t.K_sections}/${t.K_members} findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} verdict=${r.json?.verdict} terms=${JSON.stringify({ K_sections: t.K_sections, K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkDenamed(ctx) {
  const note = join(ctx.denamed, 'corpus', 'knowledge', 'kimi-session-state.md');
  const before = readText(note);
  if (before === null || !before.includes(SESSIONS_HEADING)) return [false, 'heading absent in the copy'];
  writeFileSync(note, before.replace(SESSIONS_HEADING, DENAMED_HEADING));
  const r = proxy(ctx.denamed, ctx.work, ['--kimi-root', ctx.clean, '--json']);
  const t = r.json?.terms ?? {};
  const k = kinds(r.json);
  const ok = r.status === 1 && t.K_sections === 54 && t.K_members === 55
    && t.coverage_kimi === 9 && k.has('K_SECTIONS_DRIFT') && k.has('COVERAGE_KIMI_DRIFT');
  return ok ? [true, `K=${t.K_sections}/${t.K_members} cov=${t.coverage_kimi} kinds=${[...k].join(',')}`]
    : [false, `exit=${r.status} K=${t.K_sections}/${t.K_members} cov=${t.coverage_kimi} kinds=${[...k].join(',')}`];
}

function checkFindingsFactor(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.mode, '--json']);
  const t = r.json?.terms ?? {};
  const k = kinds(r.json);
  const ok = r.status === 1 && t.K_members === 55 && t.K_findings === 1 && t.coverage_kimi === 9
    && k.has('K_FINDINGS_DRIFT') && k.has('COVERAGE_KIMI_DRIFT');
  return ok ? [true, `K_findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} terms=${JSON.stringify({ K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })} kinds=${[...k].join(',')}`];
}

function checkBothFactors(ctx) {
  const r = proxy(ctx.denamed, ctx.work, ['--kimi-root', ctx.mode, '--json']);
  const t = r.json?.terms ?? {};
  const ok = r.status === 1 && t.K_sections === 54 && t.K_members === 55
    && t.K_findings === 1 && t.coverage_kimi === 9;
  return ok ? [true, `K=${t.K_sections}/${t.K_members} findings=${t.K_findings} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} terms=${JSON.stringify({ K_sections: t.K_sections, K_members: t.K_members, K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

/** The K score's computation must carry a sections ratio AND a findings ratio. */
function checkFormula(ctx) {
  const src = readText(join(ctx.lane, 'scripts', 'proxy-check.mjs')) ?? '';
  const call = /coverage_kimi:\s*([A-Za-z_$][\w$]*)\(/u.exec(src);
  if (call === null) return [false, 'coverage_kimi is not a named-helper call'];
  const name = call[1];
  const def = new RegExp(`function\\s+${name}\\s*\\(([^)]*)\\)\\s*\\{`, 'u').exec(src);
  if (def === null) return [false, `helper ${name} not defined in the same file`];
  const start = def.index + def[0].length;
  let depth = 1;
  let i = start;
  for (; i < src.length && depth > 0; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') depth -= 1;
  }
  const body = src.slice(start, i - 1);
  const sections = /sections\s*\/\s*members/u.test(body);
  const findings = /\(\s*members\s*-\s*findings\s*\)\s*\/\s*members/u.test(body);
  return sections && findings
    ? [true, `helper=${name} sections=${sections} findings=${findings}`]
    : [false, `helper=${name} sections=${sections} findings=${findings} body=${body.replace(/\s+/gu, ' ').slice(0, 160)}`];
}

function scorecardCopy(ctx, pairs, dest) {
  const text = readText(join(ctx.lane, 'SCORECARD.md'));
  if (text === null) return null;
  let out = text;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  writeFileSync(dest, out);
  return dest;
}

function checkStanzaTamper(ctx) {
  const copy = scorecardCopy(ctx, [['K_findings=0', 'K_findings=1']], join(ctx.work, 'scorecard-kfindings.md'));
  if (copy === null) return [false, 'scorecard unreadable'];
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--scorecard', copy, '--json']);
  const k = kinds(r.json);
  const t = r.json?.terms ?? {};
  const ok = r.status === 1 && k.has('K_FINDINGS_DRIFT') && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `kinds=${[...k].join(',')}`]
    : [false, `exit=${r.status} kinds=${[...k].join(',')} terms=${JSON.stringify({ K_findings: t.K_findings, coverage_kimi: t.coverage_kimi })}`];
}

function checkAxesCrosscheck(ctx) {
  const copy = scorecardCopy(ctx, [['| coverage:kimi-layer | 10 |', '| coverage:kimi-layer | 9 |']], join(ctx.work, 'scorecard-axes.md'));
  if (copy === null) return [false, 'scorecard unreadable'];
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.clean, '--scorecard', copy, '--json']);
  const axes = (r.json?.findings ?? []).find((f) => f.kind === 'AXES_DRIFT' && f.key === 'coverage_kimi');
  return r.status === 1 && axes !== undefined
    ? [true, axes.detail]
    : [false, `exit=${r.status} kinds=${[...kinds(r.json)].join(',')}`];
}

function checkZeroDenominator(ctx) {
  const copy = scorecardCopy(ctx, [
    ['K_members=55', 'K_members=0'],
    ['K_sections=55', 'K_sections=0'],
    ['coverage_kimi=10', 'coverage_kimi=0'],
    ['| coverage:kimi-layer | 10 |', '| coverage:kimi-layer | 0 |'],
  ], join(ctx.work, 'scorecard-zero.md'));
  if (copy === null) return [false, 'scorecard unreadable'];
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.zero, '--scorecard', copy, '--json']);
  const t = r.json?.terms ?? {};
  const ok = t.K_members === 0 && t.coverage_kimi === 0 && Number.isInteger(t.coverage_kimi)
    && r.status !== 64 && r.json !== null;
  return ok ? [true, `exit=${r.status} K_members=${t.K_members} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} terms=${JSON.stringify({ K_members: t.K_members, K_sections: t.K_sections, coverage_kimi: t.coverage_kimi })}`];
}

function checkLiveStrict(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--strict', '--json']);
  const t = r.json?.terms ?? {};
  const ok = r.status === 0 && r.json?.verdict === 'MATCH'
    && t.K_sections === 55 && t.K_findings === 0 && t.coverage_kimi === 10;
  return ok ? [true, `exit=0 K=${t.K_sections}/${t.K_members} cov=${t.coverage_kimi}`]
    : [false, `exit=${r.status} verdict=${r.json?.verdict} ${r.stdout.slice(0, 300)}`];
}

function checkSelftests(ctx) {
  const p = runNode(ctx.lane, [join(ctx.lane, 'scripts', 'proxy-check.mjs'), '--selftest'], ctx.work);
  const c = runNode(ctx.lane, [join(ctx.lane, 'scripts', 'kimi-census.mjs'), '--selftest'], ctx.work);
  const ok = p.status === 0 && c.status === 0;
  return ok ? [true, `proxy=${p.status} census=${c.status}`]
    : [false, `proxy=${p.status} census=${c.status} ${p.stdout.slice(-300)}`];
}

function checkContentBlind(ctx) {
  const r = proxy(ctx.lane, ctx.work, ['--kimi-root', ctx.content, '--json']);
  const leaked = [r.stdout, r.stderr].some((t) => t.includes(MARKER));
  return !leaked && r.json?.terms?.K_findings === 0
    ? [true, 'shape-only']
    : [false, `leaked=${leaked} findings=${r.json?.terms?.K_findings}`];
}

const ARMS = [
  ['proxy-clean-terms', checkCleanTerms],
  ['denamed-heading', checkDenamed],
  ['findings-factor', checkFindingsFactor],
  ['both-factors', checkBothFactors],
  ['formula-composite', checkFormula],
  ['stanza-tamper', checkStanzaTamper],
  ['axes-crosscheck', checkAxesCrosscheck],
  ['zero-denominator', checkZeroDenominator],
  ['live-strict', checkLiveStrict],
  ['selftests', checkSelftests],
  ['content-blind', checkContentBlind],
];

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error !== undefined) {
    process.stderr.write(`probe79-c1: ${opts.error}\n`);
    process.exit(64);
  }
  if (opts.help) {
    process.stdout.write('usage: node probe79-c1.mjs [--set c1] [--lane DIR] [--work DIR] [--keep-work]\n');
    process.exit(0);
  }
  const lane = opts.lane;
  const work = opts.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe79c1-'));
  mkdirSync(work, { recursive: true });

  const raw = readText(FIXTURE);
  const spec = raw === null ? null : parseJson(raw);
  if (spec === null || !Array.isArray(spec.members)) {
    process.stderr.write(`probe79-c1: fixture ${FIXTURE} unreadable\n`);
    process.exit(2);
  }

  const ctx = {
    lane, work,
    clean: join(work, 'k-clean'),
    mode: join(work, 'k-mode'),
    content: join(work, 'k-content'),
    zero: join(work, 'k-zero'),
    denamed: join(work, 'lane-denamed'),
  };

  buildRoot(ctx.clean, spec);
  buildRoot(ctx.mode, spec);
  buildRoot(ctx.content, spec);
  mkdirSync(ctx.zero, { recursive: true });
  chmodSync(ctx.mode, 0o755);
  chmodSync(join(ctx.mode, 'mcp.json'), 0o200);
  writeFileSync(join(ctx.content, 'mcp.json'), MARKER);
  chmodSync(join(ctx.content, 'mcp.json'), 0o400);

  copyLane(lane, ctx.denamed);

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
    process.stdout.write(`C79_C1 arm ${name} ${ok ? 'ok' : 'FAIL'} ${detail}\n`);
  }
  process.stdout.write(`C79_C1: HELD held=${held}/${ARMS.length}\n`);

  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  process.exit(held === ARMS.length ? 0 : 1);
}

await main();
