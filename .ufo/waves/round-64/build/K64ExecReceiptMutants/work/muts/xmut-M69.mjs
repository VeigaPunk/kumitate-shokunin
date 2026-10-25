#!/usr/bin/env node
/**
 * report-receipt-diff.mjs — diff a round report against the committed receipts it cites.
 * Contract: kumitate-report-receipt-diff-v1 (round 64, capability report-receipt-diff;
 * considerthese/2026-10-25.md idea 2: "diff reports against receipts").
 *
 *   node scripts/report-receipt-diff.mjs --lane <lane-dir> --round N --report <file> [--rev <lane-rev>] [--fleet <fleet-dir>]
 *   node scripts/report-receipt-diff.mjs --selftest
 *
 * Reads the report bytes and the lane's committed receipts (`git show <rev>:.ufo/waves/round-N/{base,close}/*`;
 * the worktree only when --rev is absent). Findings, one line each:
 *   PLACEHOLDER        a template token left in the report (__NAME__, LANE_HASH, TBD; an angle-bracket `<tip>` is a legitimate command template and is not flagged)
 *   TALLY_UNRECEIPTED  a labelled verdict `<LABEL>_HELD|UNMET held=x/y` that no receipt line carries with the same label
 *                      and the same x/y (a result quoted in the report that no committed receipt says)
 *   RECEIPT_MISSING    a `.ufo/waves/round-N/(base|close)/<file>` path the report names that does not exist at the rev
 *   HASH_DEAD          a 40-hex hash that resolves in neither the lane repo nor the fleet repo
 *   HASH_ORPHAN        a 40-hex hash in the lane repo that is not an ancestor of the lane rev
 *   SECTION_MISSING    one of the six required report headings is absent
 *   SHONEN_COUNT       the `SHONEN` heading does not occur exactly once, or fewer than 4 box lines follow it
 * Output: `REPORT_RECEIPT: CLEAN (...)` exit 0 | `REPORT_RECEIPT: DRIFT <ids>` + one line per finding, exit 1 |
 * exit 2 fail-closed (unreadable report or rev) | exit 64 usage.
 * Declared limit: only labelled tallies are checked; a bare `held=9/10` is not (a plan's target and a result are
 * indistinguishable without a label), and a receipt written by the lane itself is trusted as written.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const REQUIRED = [
  ['Work performed', /^#{1,6}\s*\**\s*Work performed/im],
  ['Landed changes', /^#{1,6}\s*\**\s*Landed changes/im],
  ['Before → after measurements', /^#{1,6}\s*\**\s*Before\s*(?:→|->)\s*after measurements/im],
  ['Sources & frontier', /^#{1,6}\s*\**\s*Sources\s*&\s*frontier/im],
  ['Trend verdicts', /^#{1,6}\s*\**\s*Trend verdicts/im],
  ['SHONEN', /^#{1,6}\s*\**\s*SHONEN/im],
];
const PLACEHOLDER = /__[A-Z][A-Z0-9_]{2,}__|\bLANE_HASH\b|\bTBD\b/g;
const TALLY = /\b([A-Z][A-Z0-9]*_(?:HELD|UNMET))\s+held=(\d+)\/(\d+)/g;
const RECEIPT_PATH = (round) => new RegExp(`\\.ufo/waves/round-${round}/(?:base|close)/[A-Za-z0-9._-]+`, 'g');
const HASH40 = /\b[0-9a-f]{40}\b/g;

function git(dir, args) { return spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }

export function diffReport({ lane, round, reportText, rev, fleet }) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });
  const text = reportText;
  // PLACEHOLDER
  for (const m of text.matchAll(PLACEHOLDER)) add('PLACEHOLDER', m[0]);
  // sections
  for (const [name, re] of REQUIRED) if (!re.test(text)) add('SECTION_MISSING', name);
  const sh = [...text.matchAll(/^#{1,6}\s*\**\s*SHONEN/gim)];
  if (sh.length !== 1) add('SHONEN_COUNT', `headings=${sh.length}`);
  else {
    const rest = text.slice(sh[0].index).split('\n').slice(1);
    const boxes = rest.filter((l) => /\s*[-*]\s*\[[x~ ]\]/.test(l)).length;
    if (boxes < 4) add('SHONEN_COUNT', `boxes=${boxes}`);
  }
  // receipts at rev
  const receiptNames = new Map();
  const dirs = ['base', 'close'];
  for (const d of dirs) {
    const rel = `.ufo/waves/round-${round}/${d}`;
    if (rev) {
      const ls = git(lane, ['ls-tree', '-r', '--name-only', rev, '--', rel]);
      if (ls.status !== 0) continue;
      for (const f of ls.stdout.split('\n').filter(Boolean)) {
        const b = spawnSync('git', ['-C', lane, 'show', `${rev}:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
        if (b.status === 0) receiptNames.set(f, b.stdout);
      }
    } else if (existsSync(join(lane, rel))) {
      for (const n of readdirSync(join(lane, rel))) {
        try { receiptNames.set(`${rel}/${n}`, readFileSync(join(lane, rel, n), 'utf8')); } catch { /* directory */ }
      }
    }
  }
  // RECEIPT_MISSING
  for (const m of new Set([...text.matchAll(RECEIPT_PATH(round))].map((x) => x[0]))) if (!receiptNames.has(m)) add('RECEIPT_MISSING', m);
  // TALLY_UNRECEIPTED
  const allLines = [...receiptNames.values()].flatMap((t) => t.split('\n'));
  for (const m of text.matchAll(TALLY)) {
    const [, label, x, y] = m;
    const key = `${label} held=${x}/${y}`;
    const line = (l) => l.includes(`${label} held=${x}/${y}`) || (l.includes(label) && new RegExp(`held=${x}/${y}\\b`).test(l));
    if (!allLines.some(line)) add('TALLY_UNRECEIPTED', key);
  }
  // hashes
  const tip = rev || git(lane, ['rev-parse', 'HEAD']).stdout.trim();
  for (const h of new Set(text.match(HASH40) || [])) {
    const inLane = git(lane, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    const inFleet = fleet && git(fleet, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    if (!inLane && !inFleet) { add('HASH_DEAD', h); continue; }
    if (inLane && git(lane, ['merge-base', '--is-ancestor', h, tip]).status !== 0) add('HASH_ORPHAN', h);
  }
  return findings;
}

function render(findings, meta) {
  if (!findings.length) return { code: 0, out: `REPORT_RECEIPT: CLEAN (${meta})\n` };
  const ids = [...new Set(findings.map((f) => f.id))].join(',');
  return { code: 1, out: `REPORT_RECEIPT: DRIFT ${ids} (${meta})\n${findings.map((f) => `${f.id} ${f.detail}`).join('\n')}\n` };
}

function selftest() {
  const results = [];
  const t = (name, ok) => results.push([name, ok]);
  const T = mkdtempSync(join(tmpdir(), 'rrd-self.'));
  const D = realpathSync(T);
  const g = (...a) => spawnSync('git', ['-C', D, '-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...a], { encoding: 'utf8' });
  g('init', '-q');
  if (git(D, ['rev-parse', '--show-toplevel']).stdout.trim() !== D) { process.stdout.write('REPORT_RECEIPT_SELFTEST: FAIL (fixture root)\n'); process.exit(1); }
  mkdirSync(join(D, '.ufo/waves/round-9/close'), { recursive: true });
  mkdirSync(join(D, '.ufo/waves/round-9/base'), { recursive: true });
  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\nW9_HELD held=10/10 checks=10 rev=abc rule=W9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/r-tip.txt'), 'V9_HELD other held=7/77 checks=77 rev=abc rule=V9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=abc rule=X9\n');
  writeFileSync(join(D, 'f.txt'), 'a');
  g('add', '-A'); g('commit', '-q', '-m', 'one');
  const c1 = g('rev-parse', 'HEAD').stdout.trim();
  g('checkout', '-q', '-b', 'side'); writeFileSync(join(D, 'g.txt'), 'b'); g('add', '-A'); g('commit', '-q', '-m', 'side');
  const orphan = g('rev-parse', 'HEAD').stdout.trim();
  g('checkout', '-q', '-'); g('checkout', '-q', '-B', 'main2', c1);
  const body = (extra = '', skip = '') => [
    '# report', skip === 'wp' ? '' : '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements',
    'X9_UNMET held=0/3 base; X9_HELD held=3/3 tip (`.ufo/waves/round-9/close/p-tip.txt`)', '## Sources & frontier', 'x', '## Trend verdicts', 'x',
    skip === 'sh' ? '' : '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d', extra,
  ].join('\n');
  const run = (text) => diffReport({ lane: D, round: 9, reportText: text, rev: c1, fleet: null });
  const ids = (text) => [...new Set(run(text).map((f) => f.id))].join(',');
  t('honest-clean', run(body()).length === 0);
  t('placeholder-measured', ids(body('rev __MEASURED__')) === 'PLACEHOLDER');
  t('placeholder-lane-hash', ids(body('LANE_HASH')) === 'PLACEHOLDER');
  t('placeholder-tbd', ids(body('tip TBD')) === 'PLACEHOLDER');
  t('placeholder-count', run(body('__A_B__ and __C_D__')).filter((f) => f.id === 'PLACEHOLDER').length === 2);
  t('tally-wrong-xy', ids(body('X9_HELD held=10/10')) === 'TALLY_UNRECEIPTED');
  t('tally-wrong-label', ids(body('Y9_HELD held=3/3')) === 'TALLY_UNRECEIPTED');
  t('tally-verdict-flip', ids(body('X9_UNMET held=3/3')) === 'TALLY_UNRECEIPTED');
  t('tally-bare-not-checked', run(body('held=10/10')).length === 0);
  t('receipt-missing', ids(body('see `.ufo/waves/round-9/close/none.txt`')) === 'RECEIPT_MISSING');
  t('receipt-present', run(body('see `.ufo/waves/round-9/base/p-base.txt`')).length === 0);
  t('hash-dead', ids(body('0123456789abcdef0123456789abcdef01234567')) === 'HASH_DEAD');
  t('hash-orphan', ids(body(orphan)) === 'HASH_ORPHAN');
  t('hash-live', run(body(c1)).length === 0);
  t('section-missing', ids(body('', 'wp')) === 'SECTION_MISSING');
  t('shonen-absent', /SHONEN_COUNT/.test(ids(body('', 'sh'))) && /SECTION_MISSING/.test(ids(body('', 'sh'))));
  t('shonen-twice', ids(body('## SHONEN\n- [~] a')) === 'SHONEN_COUNT');
  t('shonen-short', /SHONEN_COUNT/.test(ids(body().replace('- [~] d', ''))));
  t('round-scoped', diffReport({ lane: D, round: 8, reportText: body(), rev: c1, fleet: null }).some((f) => f.id === 'TALLY_UNRECEIPTED'));
  t('render-clean-exit', render([], 'm').code === 0 && render([{ id: 'PLACEHOLDER', detail: 'x' }], 'm').code === 1);
  // --- mutation-kill cases (K64ExecReceiptMutants, round 64 w1) ---
  const rep = (a, b) => body().replace(a, b);
  t('section-literal-truncated-landed', ids(rep('## Landed changes', '## Landed change')) === 'SECTION_MISSING');
  t('section-literal-truncated-trend', ids(rep('## Trend verdicts', '## Trend verdict')) === 'SECTION_MISSING');
  t('section-ascii-arrow', run(rep('## Before → after measurements', '## Before -> after measurements')).length === 0);
  t('section-arrow-no-space', run(rep('## Before → after measurements', '## Before→after measurements')).length === 0);
  t('section-inline-not-heading', ids(rep('## Work performed', 'text ## Work performed')) === 'SECTION_MISSING');
  t('section-h4-heading', run(rep('## Landed changes', '#### Landed changes')).length === 0);
  t('section-bold-heading', run(rep('## Sources & frontier', '## **Sources & frontier**')).length === 0);
  t('placeholder-lane-hash-suffix', run(body('LANE_HASHX')).length === 0);
  t('placeholder-tbd-suffix', run(body('TBDs')).length === 0);
  t('tally-midword-not-tally', run(body('aX9_HELD held=7/7')).length === 0);
  t('tally-tab-separator', ids(body('X9_HELD\theld=10/10')) === 'TALLY_UNRECEIPTED');
  t('tally-two-digit-y', run(body('W9_HELD held=10/10')).length === 0);
  t('hash41-not-a-hash', run(body('0123456789abcdef0123456789abcdef01234567a')).length === 0);
  t('shonen-star-bullets', run(body().replace(/- \[/g, '* [')).length === 0);
  t('tally-xy-boundary', ids(body('V9_HELD held=7/7')) === 'TALLY_UNRECEIPTED');
  t('receipt-path-other-round', run(body('see `.ufo/waves/round-8/close/p-tip.txt`')).length === 0);
  t('worktree-tip-fallback', diffReport({ lane: D, round: 9, reportText: body(c1), rev: undefined, fleet: null }).length === 0);
  t('rev-tip-honoured', diffReport({ lane: D, round: 9, reportText: body(orphan), rev: orphan, fleet: null }).length === 0);
  const blob = g('hash-object', '-w', join(D, 'f.txt')).stdout.trim();
  t('hash-blob-not-commit', ids(body(blob)) === 'HASH_DEAD');
  const self = process.argv[1];
  t('cli-usage-exit-64', spawnSync('node', [self, '--round', '9']).status === 64);
  t('cli-rev-unreadable-exit-2', spawnSync('node', [self, '--lane', D, '--round', '9', '--report', join(D, 'f.txt'), '--rev', 'd'.repeat(40)]).status === 2);
  t('cli-report-unreadable-exit-2', spawnSync('node', [self, '--lane', D, '--round', '9', '--report', join(D, 'nope.md')]).status === 2);
  t('rev-unreadable-no-throw', (() => { try { return diffReport({ lane: D, round: 9, reportText: body(), rev: 'e'.repeat(40), fleet: null }).some((f) => f.id === 'RECEIPT_MISSING'); } catch { return false; } })());
  t('hash-duplicate-one-finding', run(body('0123456789abcdef0123456789abcdef01234567 0123456789abcdef0123456789abcdef01234567')).filter((f) => f.id === 'HASH_DEAD').length === 1);
  t('render-ids-unique', render([{ id: 'A', detail: 'x' }, { id: 'A', detail: 'y' }], 'm').out.startsWith('REPORT_RECEIPT: DRIFT A '));
  t('shonen-inline-not-heading', run(body('text ## SHONEN inline')).length === 0);
  t('shonen-inline-box-not-counted', /SHONEN_COUNT/.test(ids(body().replace('- [~] d', 'prose - [ ] d'))));
  t('hash-in-word-not-hash', run(body('x0123456789abcdef0123456789abcdef01234567')).length === 0);
  mkdirSync(join(D, 'sub/.ufo/waves/round-9/base'), { recursive: true });
  mkdirSync(join(D, 'sub/.ufo/waves/round-9/close'), { recursive: true });
  writeFileSync(join(D, 'sub/.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=aaa rule=X9\n');
  writeFileSync(join(D, 'sub/.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\n');
  writeFileSync(join(D, 'sub/r.md'), body(c1));
  t('cli-fleet-autodetect-parent', spawnSync('node', [self, '--lane', join(D, 'sub'), '--round', '9', '--report', join(D, 'sub/r.md')], { encoding: 'utf8' }).stdout.startsWith('REPORT_RECEIPT: CLEAN'));
  rmSync(T, { recursive: true, force: true });
  const pass = results.filter(([, ok]) => ok).length;
  for (const [n, ok] of results) if (!ok) process.stdout.write(`FAIL ${n}\n`);
  process.stdout.write(`REPORT_RECEIPT_SELFTEST: ${pass === results.length ? 'PASS' : 'FAIL'} (${pass}/${results.length})\n`);
  process.exit(pass === results.length ? 0 : 1);
}

const argv = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  if (argv.includes('--selftest')) selftest();
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const lane = opt('--lane'); const round = opt('--round'); const report = opt('--report');
  if (!lane || !round || !report || !/^\d+$/.test(round)) { process.stderr.write('usage: report-receipt-diff.mjs --lane DIR --round N --report FILE [--rev REV] [--fleet DIR] | --selftest\n'); process.exit(64); }
  const laneAbs = resolve(lane);
  let revFull = opt('--rev');
  if (revFull) {
    const rv = git(laneAbs, ['rev-parse', '--verify', `${revFull}^{commit}`]);
    if (rv.status !== 0) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED rev-unreadable ${revFull}\n`); process.exit(2); }
    revFull = rv.stdout.trim();
  }
  let reportText;
  try { reportText = readFileSync(resolve(report), 'utf8'); } catch { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED report-unreadable ${report}\n`); process.exit(2); }
  const fleet = opt('--fleet') ? resolve(opt('--fleet')) : (existsSync(join(dirname(laneAbs), '.git')) ? dirname(laneAbs) : null);
  const findings = diffReport({ lane: laneAbs, round, reportText, rev: revFull, fleet });
  const r = render(findings, `round=${round} rev=${revFull || 'worktree'} bytes=${Buffer.byteLength(reportText)}`);
  process.stdout.write(r.out);
  process.exit(r.code);
}
