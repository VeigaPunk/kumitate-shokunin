#!/usr/bin/env node
/**
 * probe79-c2.mjs — frozen counter C2 for kumitate round 79.
 *
 * Usage:
 *   node .ufo/waves/round-79/probe/probe79-c2.mjs [--set c2] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C2 — operability, capability deepening `report-receipt-diff` v4: every backticked
 * repo-path pointer a report names resolves (lane tree or --rev), not only the
 * `.ufo/waves/round-N/{base,close}` receipts v3 already checked. New finding id
 * `POINTER_DEAD`. Frozen predicate and arms: plan §C2 + Amendment 1.
 *
 * The counter never mutates the lane: fixtures live under --work. Exit 0 iff every
 * arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const R78_REPORT = '/home/vgpnk/Projects/shokunin/.ufo/reports/round-78/kumitate.md';
const BASE_REV = '5019803b4e451094cf58c555408ea37490cbc07a';
const NEW_NOTE = 'corpus/knowledge/report-evidence-pointers.md';
const TOOL = (lane) => join(lane, 'scripts', 'report-receipt-diff.mjs');

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

function run(lane, args, work) {
  const r = spawnSync(process.execPath, [TOOL(lane), ...args], {
    cwd: lane, encoding: 'utf8', timeout: 600000,
    env: { ...process.env, TMPDIR: work },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}

const lines = (t) => t.split('\n');
const pointerLines = (t) => lines(t).filter((l) => l.startsWith('POINTER_DEAD '));
const ids = (t) => {
  const m = /^REPORT_RECEIPT: DRIFT ([^(]*?) \(/u.exec(t);
  return m === null ? [] : m[1].split(',').map((s) => s.trim()).filter(Boolean);
};

function writeFixture(root, rel, text) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, text);
  return abs;
}

/** A report that satisfies every v3 structural check; `body` is appended after the sections. */
function report(body = '') {
  return [
    '# fixture round report',
    '',
    '## Work performed',
    'measured work',
    body,
    '## Landed changes',
    'none',
    '## Before → after measurements',
    'none',
    '## Sources & frontier',
    'none',
    '## Trend verdicts',
    'none',
    '## SHONEN',
    '- [~] a',
    '- [~] b',
    '- [ ] c',
    '- [~] d',
    '',
  ].join('\n');
}

function buildFixtures(ctx) {
  const root = join(ctx.work, 'root');
  writeFixture(root, 'corpus/knowledge/a.md', '# a\n');
  writeFixture(root, 'corpus/knowledge/b.md', '# b\n');
  writeFixture(root, '.ufo/waves/round-79/close/x.txt', 'receipt\n');
  const clean = writeFixture(root, '.ufo/reports/round-79/kumitate.md', report('see `corpus/knowledge/a.md` and `corpus/knowledge/b.md:12`'));
  const missing = writeFixture(root, 'reports/dead.md', report('see `corpus/knowledge/a.md` and `corpus/knowledge/dead.md`'));
  const scoped = writeFixture(root, 'reports/scoped.md', report('see `close/x.txt`'));
  const urls = writeFixture(root, 'reports/urls.md', report('see `https://example.com/x.md` and `corpus/knowledge/a.md`'));
  const rev = writeFixture(root, 'reports/rev.md', report(`see \`scripts/proxy-check.mjs\` and \`${NEW_NOTE}\``));
  const placeholder = writeFixture(root, 'reports/placeholder.md', report('the tip is TBD'));
  const receipt = writeFixture(root, 'reports/receipt.md', report('see `.ufo/waves/round-79/close/absent.txt`'));
  return { root, clean, missing, scoped, urls, rev, placeholder, receipt };
}

function checkUsage(ctx) {
  const r = run(ctx.lane, ['--bogus'], ctx.work);
  return r.status === 64 && /usage: report-receipt-diff\.mjs/u.test(r.stderr)
    ? [true, 'exit=64'] : [false, `exit=${r.status} stderr=${r.stderr.slice(0, 120)}`];
}

function checkR78(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.lane, '--round', '78', '--report', R78_REPORT], ctx.work);
  const dead = pointerLines(r.stdout);
  const first = dead.find((l) => l === 'POINTER_DEAD close/proxy-json.txt');
  const ok = r.status === 1 && dead.length >= 10 && first !== undefined;
  return ok ? [true, `dead=${dead.length} first=${first}`]
    : [false, `exit=${r.status} dead=${dead.length} first=${dead[0] ?? 'none'} ids=${ids(r.stdout).join(',')}`];
}

function checkFixtureClean(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.clean], ctx.work);
  const ok = r.status === 0 && /^REPORT_RECEIPT: CLEAN \(/u.test(r.stdout);
  return ok ? [true, lines(r.stdout)[0]] : [false, `exit=${r.status} ${r.stdout.slice(0, 200)}`];
}

function checkFixtureMissing(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.missing], ctx.work);
  const dead = pointerLines(r.stdout);
  const ok = r.status === 1 && ids(r.stdout).includes('POINTER_DEAD')
    && dead.includes('POINTER_DEAD corpus/knowledge/dead.md') && dead.length === 1;
  return ok ? [true, `dead=${dead[0]}`] : [false, `exit=${r.status} ids=${ids(r.stdout).join(',')} lines=${dead.join('|')}`];
}

function checkRoundScoped(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.scoped], ctx.work);
  const ok = r.status === 0 && /^REPORT_RECEIPT: CLEAN \(/u.test(r.stdout);
  return ok ? [true, 'round-scoped resolved'] : [false, `exit=${r.status} ${r.stdout.slice(0, 200)}`];
}

function checkUrlIgnored(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.urls], ctx.work);
  const dead = pointerLines(r.stdout);
  const ok = r.status === 0 && dead.length === 0 && /^REPORT_RECEIPT: CLEAN \(/u.test(r.stdout);
  return ok ? [true, 'url skipped'] : [false, `exit=${r.status} dead=${dead.join('|')}`];
}

function checkRevMode(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.lane, '--round', '79', '--report', ctx.fx.rev, '--rev', BASE_REV], ctx.work);
  const dead = pointerLines(r.stdout);
  const ok = r.status === 1 && dead.includes(`POINTER_DEAD ${NEW_NOTE}`) && dead.length === 1;
  return ok ? [true, `dead=${dead[0]}`] : [false, `exit=${r.status} dead=${dead.join('|')}`];
}

function checkRevUnverifiable(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.lane, '--round', '79', '--report', ctx.fx.clean, '--rev', '0000000000000000000000000000000000000000'], ctx.work);
  return r.status === 2 && /FAIL-CLOSED rev-unreadable/u.test(r.stdout)
    ? [true, 'exit=2'] : [false, `exit=${r.status} out=${r.stdout.slice(0, 160)}`];
}

function checkReportMissing(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', join(ctx.work, 'absent.md')], ctx.work);
  return r.status === 2 && /FAIL-CLOSED report-unreadable/u.test(r.stdout)
    ? [true, 'exit=2'] : [false, `exit=${r.status} out=${r.stdout.slice(0, 160)}`];
}

function checkPlaceholderRegression(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.placeholder], ctx.work);
  return r.status === 1 && ids(r.stdout).includes('PLACEHOLDER')
    ? [true, 'PLACEHOLDER fires'] : [false, `exit=${r.status} ids=${ids(r.stdout).join(',')}`];
}

function checkReceiptNoDuplicate(ctx) {
  const r = run(ctx.lane, ['--lane', ctx.fx.root, '--round', '79', '--report', ctx.fx.receipt], ctx.work);
  const dead = pointerLines(r.stdout);
  const ok = r.status === 1 && ids(r.stdout).includes('RECEIPT_MISSING') && dead.length === 0;
  return ok ? [true, 'RECEIPT_MISSING only'] : [false, `exit=${r.status} ids=${ids(r.stdout).join(',')} dead=${dead.join('|')}`];
}

function checkSelftest(ctx) {
  const r = run(ctx.lane, ['--selftest'], ctx.work);
  const m = /REPORT_RECEIPT_SELFTEST: (PASS|FAIL) \((\d+)\/(\d+)\)/u.exec(r.stdout);
  const ok = r.status === 0 && m !== null && m[1] === 'PASS' && Number(m[2]) >= 125 && m[2] === m[3];
  return ok ? [true, m[0]] : [false, `exit=${r.status} ${lines(r.stdout).slice(-2).join('|')}`];
}

const ARMS = [
  ['usage', checkUsage],
  ['r78-pointers', checkR78],
  ['fixture-clean', checkFixtureClean],
  ['fixture-missing', checkFixtureMissing],
  ['round-scoped', checkRoundScoped],
  ['url-ignored', checkUrlIgnored],
  ['rev-mode', checkRevMode],
  ['rev-unverifiable', checkRevUnverifiable],
  ['report-missing', checkReportMissing],
  ['placeholder-regression', checkPlaceholderRegression],
  ['receipt-no-duplicate', checkReceiptNoDuplicate],
  ['selftest', checkSelftest],
];

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error !== undefined) {
    process.stderr.write(`probe79-c2: ${opts.error}\n`);
    process.exit(64);
  }
  if (opts.help) {
    process.stdout.write('usage: node probe79-c2.mjs [--set c2] [--lane DIR] [--work DIR] [--keep-work]\n');
    process.exit(0);
  }
  const lane = opts.lane;
  const work = opts.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe79c2-'));
  mkdirSync(work, { recursive: true });
  const ctx = { lane, work, fx: null };
  ctx.fx = buildFixtures(ctx);

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
    process.stdout.write(`C79_C2 arm ${name} ${ok ? 'ok' : 'FAIL'} ${detail}\n`);
  }
  process.stdout.write(`C79_C2: HELD held=${held}/${ARMS.length}\n`);

  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  process.exit(held === ARMS.length ? 0 : 1);
}

await main();
