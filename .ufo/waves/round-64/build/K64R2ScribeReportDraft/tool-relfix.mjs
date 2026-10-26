#!/usr/bin/env node
/**
 * report-receipt-diff.mjs — diff a round report against the committed receipts it cites.
 * Contract: kumitate-report-receipt-diff-v2 (round 64, capability report-receipt-diff;
 * considerthese/2026-10-25.md idea 2: "diff reports against receipts").
 *
 *   node scripts/report-receipt-diff.mjs --lane <lane-dir> --round N --report <file> [--rev <lane-rev>] [--fleet <fleet-dir>]
 *   node scripts/report-receipt-diff.mjs --selftest
 *
 * Reads the report bytes and the lane's committed receipts (`git show <rev>:.ufo/waves/round-N/{base,close}/*`;
 * the worktree only when --rev is absent; a symlinked receipt is not a receipt). Findings, one line each:
 *   PLACEHOLDER        a template token left in the report (__name__, {{NAME}}, XXXX, "to be filled", <measured>,
 *                      LANE_HASH, TBD; the command-template arguments `<tip>`/`<lane>`/`<rev>` are not flagged)
 *   TALLY_UNRECEIPTED  a labelled verdict `<LABEL>_HELD|UNMET held=x/y` (case- and spacing-insensitive, table cells
 *                      included) that no receipt carries as the same (label, x, y) pair; when the claim's own line
 *                      cites receipts, only those receipts may carry it (a superseded or uncited receipt does not)
 *   TALLY_CHECKS_MISMATCH  a claim that states `checks=k` for a pair the receipt carries with another k
 *   RECEIPT_MISSING    a `.ufo/waves/round-N/(base|close)/<file>` path the report names that does not exist at the
 *                      rev, or that escapes the round tree with `..`, is a directory, or is a symlink
 *   RECEIPT_EMPTY      a cited receipt that exists but carries no bytes
 *   HASH_DEAD          a 39- or 40-hex hash (either case) that resolves in neither the lane repo nor the fleet repo
 *   HASH_ORPHAN        a 40-hex hash in the lane repo that is not an ancestor of the lane rev
 *   SECTION_MISSING    one of the six required report headings is absent from the prose (a heading inside a fenced
 *                      block is a quotation, not a section)
 *   SHONEN_COUNT       the `SHONEN` heading does not occur exactly once in the prose, or fewer than 4 box lines
 *                      follow it inside its own section
 * Output: `REPORT_RECEIPT: CLEAN (...)` exit 0 | `REPORT_RECEIPT: DRIFT <ids>` + one line per finding, exit 1 |
 * exit 2 fail-closed (unreadable report or rev) | exit 64 usage.
 * Declared limit: only labelled tallies are checked; a bare `held=9/10` is not (a plan's target and a result are
 * indistinguishable without a label), and a receipt written by the lane itself is trusted as written.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
const PLACEHOLDER = /__[A-Za-z][A-Za-z0-9_]{1,}__|\bLANE_HASH\b|\bTBD\b|\{\{[A-Za-z][A-Za-z0-9_]*\}\}|\bX{4,}\b|\bto be filled\b|<(?:measured|measured_rev|tip_hash|rev_hash|placeholder|tbd|todo)>/gi;
const TALLY = /\b([a-z][a-z0-9]*_(?:held|unmet))\s+held=(\d+)\/(\d+)/gi;
const RECEIPT_PATH = (round) => new RegExp(`\\.ufo/waves/round-${round}/(?:base|close)/[A-Za-z0-9._*/-]*`, 'g');
const HASH = /\b[0-9a-fA-F]{39,40}\b/g;
// RELFIX: a receipt cited relative to the round dir (`close/x.txt`) is bound like a full path.
const REL_RECEIPT = /(?<![\w./-])(?:base|close)\/[A-Za-z0-9._*/-]+/g;
// Scan copy: invisible characters, table pipes and spaced operators are normalised away, so a claim cannot be
// hidden from the tally parser by formatting alone (controls k1 spaced `held = 3 / 3`, k3 table cell, k4 U+200B).
const scan = (s) => s
  .replace(/[\u200B-\u200F\u2060\uFEFF]/g, '')
  .replace(/\|/g, ' ')
  .replace(/[ \t]*=[ \t]*/g, '=')
  .replace(/[ \t]*\/[ \t]*/g, '/');
// Prose copy: fenced blocks blanked, so a heading quoted as an example is not a section (controls k12/k13).
const unfence = (text) => {
  let fenced = false;
  return text.split('\n').map((l) => {
    if (/^\s*(?:```|~~~)/.test(l)) { fenced = !fenced; return ''; }
    return fenced ? '' : l;
  }).join('\n');
};
const tallyKey = (label, x, y) => `${label.toUpperCase()} held=${x}/${y}`;

function git(dir, args) { return spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }

export function diffReport({ lane, round, reportText, rev, fleet }) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });
  const text = reportText;
  const prose = unfence(text);
  // PLACEHOLDER (fence-agnostic on purpose: a token inside an example block is still an unfilled token)
  for (const m of text.matchAll(PLACEHOLDER)) add('PLACEHOLDER', m[0]);
  // sections (prose only)
  for (const [name, re] of REQUIRED) if (!re.test(prose)) add('SECTION_MISSING', name);
  const sh = [...prose.matchAll(/^#{1,6}\s*\**\s*SHONEN/gim)];
  if (sh.length !== 1) add('SHONEN_COUNT', `headings=${sh.length}`);
  else {
    const level = sh[0][0].match(/^#+/)[0].length;
    let boxes = 0;
    for (const l of prose.slice(sh[0].index).split('\n').slice(1)) {
      const h = /^(#{1,6})\s/.exec(l);
      if (h && h[1].length <= level) break;
      if (/^\s*[-*]\s/.test(l)) boxes += (l.match(/`?\[[xX~ ]\]`?/g) || []).length;
    }
    if (boxes < 4) add('SHONEN_COUNT', `boxes=${boxes}`);
  }
  // receipts at rev
  const receiptNames = new Map();
  const dirs = ['base', 'close'];
  for (const d of dirs) {
    const rel = `.ufo/waves/round-${round}/${d}`;
    if (rev) {
      const ls = git(lane, ['ls-tree', '-r', '-z', rev, '--', rel]);
      if (ls.status !== 0) continue;
      for (const row of ls.stdout.split('\0').filter(Boolean)) {
        const m = /^(\d{6}) \w+ [0-9a-f]+\t(.+)$/.exec(row);
        if (!m || m[1] === '120000') continue; // a symlinked receipt is not a receipt of this round
        const b = spawnSync('git', ['-C', lane, 'show', `${rev}:${m[2]}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
        if (b.status === 0) receiptNames.set(m[2], b.stdout);
      }
    } else if (existsSync(join(lane, rel))) {
      for (const n of readdirSync(join(lane, rel))) {
        const p = join(lane, rel, n);
        try {
          if (!lstatSync(p).isFile()) continue; // symlink or directory: not a receipt
          receiptNames.set(`${rel}/${n}`, readFileSync(p, 'utf8'));
        } catch { /* unreadable */ }
      }
    }
  }
  // cited receipt paths, normalised: trailing punctuation dropped; `..` segments and bare directories are not receipts
  const cited = (s) => [...new Set([...[...s.matchAll(RECEIPT_PATH(round))].map((x) => x[0].replace(/[.,;:]+$/, '')), ...[...s.matchAll(REL_RECEIPT)].map((x) => `.ufo/waves/round-${round}/${x[0]}`.replace(/[.,;:]+$/, ''))])];
  const globRe = (g) => new RegExp(`^${g.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
  const isPath = (p) => Boolean(p) && !p.split('/').includes('..');
  // RECEIPT_MISSING / RECEIPT_EMPTY
  for (const p of cited(text)) {
    if (!isPath(p)) { add('RECEIPT_MISSING', `${p} (escape-or-dir)`); continue; }
    if (p.endsWith('/')) { // a directory citation is satisfied by any committed receipt under it
      if (![...receiptNames.keys()].some((f) => f.startsWith(p))) add('RECEIPT_MISSING', `${p} (no receipt under it)`);
      continue;
    }
    if (p.includes('*')) { // a glob is satisfied by any committed receipt it matches
      if (![...receiptNames.keys()].some((f) => globRe(p).test(f))) add('RECEIPT_MISSING', p);
      continue;
    }
    if (!receiptNames.has(p)) add('RECEIPT_MISSING', p);
    else if (!receiptNames.get(p).trim()) add('RECEIPT_EMPTY', p);
  }
  // TALLY_UNRECEIPTED — exact (label, x, y) pairs parsed out of the receipts, never a substring of a line; when the
  // claim's own line cites receipts, only those may carry it (an uncited or superseded receipt does not).
  // TALLY_CHECKS_MISMATCH — a claim that states `checks=k` where the receipt carrying the same pair states another k.
  const index = new Map();
  for (const [file, body] of receiptNames) {
    for (const line of scan(body).split('\n')) {
      for (const m of line.matchAll(TALLY)) {
        const key = tallyKey(m[1], m[2], m[3]);
        const c = /^\s*checks=(\d+)/.exec(line.slice(m.index + m[0].length));
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ file, checks: c ? c[1] : null });
      }
    }
  }
  for (const line of scan(text).split('\n')) {
    const scope = cited(line).filter(isPath);
    for (const m of line.matchAll(TALLY)) {
      const key = tallyKey(m[1], m[2], m[3]);
      const hits = (index.get(key) || []).filter((h) => !scope.length || scope.some((sp) => (sp.includes('*') ? globRe(sp).test(h.file) : sp === h.file)));
      if (!hits.length) { add('TALLY_UNRECEIPTED', key); continue; }
      const c = /^\s*checks=(\d+)/.exec(line.slice(m.index + m[0].length));
      if (c && !hits.some((h) => h.checks === null || h.checks === c[1])) add('TALLY_CHECKS_MISMATCH', `${key} checks=${c[1]}`);
    }
  }
  // hashes
  const headRes = rev ? null : git(lane, ['rev-parse', '--verify', 'HEAD^{commit}']);
  const tip = rev || (headRes.status === 0 ? headRes.stdout.trim() : null);
  const textLines = text.split('\n');
  const inUrl = (raw) => textLines.some((l) => l.includes(raw) && new RegExp(`(?:https?://|(?:github|gitlab)\\.com/)[^\\s)\\]>\`]*${raw}`, 'i').test(l));
  for (const raw of new Set(text.match(HASH) || [])) {
    if (inUrl(raw)) continue; // a hash that is a path component of a URL is the URL's, not a commit claim
    const h = raw.toLowerCase();
    const inLane = git(lane, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    const inFleet = fleet && git(fleet, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    if (!inLane && !inFleet) { add('HASH_DEAD', raw.length === 40 ? raw : `${raw} (len=${raw.length})`); continue; }
    if (inLane && tip && git(lane, ['merge-base', '--is-ancestor', h, tip]).status !== 0) add('HASH_ORPHAN', h);
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
  if (g('init', '-q').status !== 0) { rmSync(T, { recursive: true, force: true }); process.stdout.write('REPORT_RECEIPT_SELFTEST: FAIL (git unavailable)\n'); process.exit(1); }
  if (git(D, ['rev-parse', '--show-toplevel']).stdout.trim() !== D) { process.stdout.write('REPORT_RECEIPT_SELFTEST: FAIL (fixture root)\n'); process.exit(1); }
  mkdirSync(join(D, '.ufo/waves/round-9/close'), { recursive: true });
  mkdirSync(join(D, '.ufo/waves/round-9/base'), { recursive: true });
  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=abc rule=X9\n');
  // ratchet fixture (round-64 wave-1 forgery controls k15..k18): a plan target in a base file, a superseded close
  // receipt, a receipt line that carries another label's tally, an empty receipt, and a receipt that is a symlink
  // out of the receipt tree.
  writeFileSync(join(D, '.ufo/waves/round-9/base/p-target.txt'), 'W9_HELD held=4/4 target=plan\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/r-tip.txt'), 'X9_HELD held=9/9 checks=9 rev=ccc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/s-tip.txt'), 'X9_HELD held=1/3 checks=3 rev=ddd rule=X9 prior X8_HELD held=7/7\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/empty.txt'), '');
  writeFileSync(join(D, '.ufo/outside.txt'), 'X9_HELD held=3/3 checks=3 rev=eee rule=X9\n');
  symlinkSync('../../../outside.txt', join(D, '.ufo/waves/round-9/close/link.txt'));
  writeFileSync(join(D, 'f.txt'), 'a');
  g('add', '-A'); g('commit', '-q', '-m', 'one');
  const c1 = g('rev-parse', 'HEAD').stdout.trim();
  g('checkout', '-q', '-b', 'side'); writeFileSync(join(D, 'g.txt'), 'b'); g('add', '-A'); g('commit', '-q', '-m', 'side');
  const orphan = g('rev-parse', 'HEAD').stdout.trim();
  g('checkout', '-q', '-'); g('checkout', '-q', '-B', 'main2', c1);
  const body = (extra = '', skip = '') => [
    '# report', skip === 'wp' ? '' : '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements',
    'X9_UNMET held=0/3 base (`.ufo/waves/round-9/base/p-base.txt`); X9_HELD held=3/3 tip (`.ufo/waves/round-9/close/p-tip.txt`)', '## Sources & frontier', 'x', '## Trend verdicts', 'x',
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
  // Ratchet arms (round-64 wave-1 controls cases/k1..k19): every one of these lies read CLEAN on the first build.
  t('tally-spaced-eq', ids(body('X9_HELD held = 6 / 6')) === 'TALLY_UNRECEIPTED');
  t('tally-lowercase-label', ids(body('x9_HELD held=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-table-cell', ids(body('| X9_HELD | held=6/6 |')) === 'TALLY_UNRECEIPTED');
  t('tally-zero-width', ids(body('X9_\u200bHELD held=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-substring-bypass', ids(body('X9_HELD held=7/7')) === 'TALLY_UNRECEIPTED');
  t('tally-cited-mismatch', ids(body('X9_HELD held=9/9 (`.ufo/waves/round-9/close/p-tip.txt`)')) === 'TALLY_UNRECEIPTED');
  t('tally-checks-mismatch', ids(body('X9_HELD held=3/3 checks=9')) === 'TALLY_CHECKS_MISMATCH');
  t('tally-base-only', ids(body('W9_HELD held=4/4 (`.ufo/waves/round-9/close/p-tip.txt`)')) === 'TALLY_UNRECEIPTED');
  t('receipt-empty', ids(body('see `.ufo/waves/round-9/close/empty.txt`')) === 'RECEIPT_EMPTY');
  t('receipt-symlink', ids(body('see `.ufo/waves/round-9/close/link.txt`')) === 'RECEIPT_MISSING');
  t('receipt-escape', ids(body('see `.ufo/waves/round-9/close/p-tip.txt/../../../base/p-base.txt`')) === 'RECEIPT_MISSING');
  t('hash-uppercase-dead', ids(body('0123456789ABCDEF0123456789ABCDEF01234567')) === 'HASH_DEAD');
  t('hash-39-abbrev-dead', ids(body('0123456789abcdef0123456789abcdef0123456')) === 'HASH_DEAD');
  t('placeholder-braces', ids(body('measured at {{MEASURED_REV}}')) === 'PLACEHOLDER');
  t('placeholder-angle-measured', ids(body('the revision is <measured>')) === 'PLACEHOLDER');
  t('placeholder-xxxx', ids(body('the revision is XXXX')) === 'PLACEHOLDER');
  t('placeholder-to-be-filled', ids(body('the hash is to be filled')) === 'PLACEHOLDER');
  t('placeholder-lowercase-token', ids(body('the revision is __measured__')) === 'PLACEHOLDER');
  t('placeholder-command-args-clean', run(body('`node probe.mjs <lane> <rev> <tip>`')).length === 0);
  const fenceAll = ['# report', '```', '## Work performed', '## Landed changes', '## Before → after measurements', '## Sources & frontier', '## Trend verdicts', '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d', '```'].join('\n');
  t('sections-in-fence', ids(fenceAll) === 'SECTION_MISSING,SHONEN_COUNT');
  const shonenFenced = ['# report', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '```', '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d', '```'].join('\n');
  t('shonen-in-fence', ids(shonenFenced) === 'SECTION_MISSING,SHONEN_COUNT');
  const boxesElsewhere = ['# report', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '', '## Appendix', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\n');
  t('shonen-boxes-outside-section', ids(boxesElsewhere) === 'SHONEN_COUNT');
  // wave-1 ratchet (L1 integration of K64ExecReceiptRealRun / K64ReviewTool findings)
  const bt = body().replace('- [~] a', '- `[~]` a').replace('- [~] b', '- `[~]` b');
  t('shonen-backticked-boxes', run(bt).length === 0);
  t('shonen-two-boxes-one-line', run(body().replace('- [~] a\n- [~] b', '- [~] a — [~] b')).length === 0);
  t('receipt-glob-match', run(body('see `.ufo/waves/round-9/close/p-*.txt`')).length === 0);
  t('receipt-glob-miss', ids(body('see `.ufo/waves/round-9/close/zz-*.txt`')) === 'RECEIPT_MISSING');
  t('receipt-dir-citation-ok', run(body('see `.ufo/waves/round-9/close/`')).length === 0);
  t('receipt-dir-citation-empty', ids(body('see `.ufo/waves/round-9/base/nope/`')) === 'RECEIPT_MISSING');
  t('hash-in-url-skipped', run(body('https://example.invalid/tree/0123456789abcdef0123456789abcdef01234567')).length === 0);
  const rf = join(T, 'r.md'); writeFileSync(rf, body());
  const cli = (...a) => spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', '9', '--report', rf, ...a], { encoding: 'utf8' });
  t('cli-rev-space-form-bad-rev', cli('--rev', 'deadbeef00').status === 2);
  t('cli-rev-equals-form-bad-rev', cli('--rev=deadbeef00').status === 2);
  t('cli-rev-equals-form-good-rev', cli(`--rev=${c1}`).status === 0);
  t('render-clean-exit', render([], 'm').code === 0 && render([{ id: 'PLACEHOLDER', detail: 'x' }], 'm').code === 1);
  rmSync(T, { recursive: true, force: true });
  const pass = results.filter(([, ok]) => ok).length;
  for (const [n, ok] of results) if (!ok) process.stdout.write(`FAIL ${n}\n`);
  process.stdout.write(`REPORT_RECEIPT_SELFTEST: ${pass === results.length ? 'PASS' : 'FAIL'} (${pass}/${results.length})\n`);
  process.exit(pass === results.length ? 0 : 1);
}

const argv = process.argv.slice(2).flatMap((a) => (/^--[a-z]+=/.test(a) ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a]));
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
