#!/usr/bin/env node
/**
 * report-receipt-diff.mjs — diff a round report against the committed receipts it cites.
 * Contract: kumitate-report-receipt-diff-v3 (round 64, capability report-receipt-diff; v2 + the wave-2 ratchet)
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
 *   HASH_DEAD          a 39-, 40- or 41-hex hash (either case) that resolves in neither the lane repo nor the fleet repo
 *                      (41 is one character too long for a commit id: a typo is not a commit)
 *   HASH_ORPHAN        a 40-hex hash in the lane repo that is not an ancestor of the lane rev
 *   HASH_FOREIGN       a hash that is a commit of another repository under the fleet root, cited as this lane's
 *                      (a line naming `fleet` next to it is a fleet citation and is not flagged)
 *   SECTION_MISSING    one of the six required report headings is absent from the prose (a heading inside a fenced
 *                      block is a quotation, not a section)
 *   SHONEN_COUNT       the `SHONEN` heading does not occur exactly once in the prose, or fewer than 4 box lines
 *                      follow it inside its own section
 * Output: `REPORT_RECEIPT: CLEAN (...)` exit 0 | `REPORT_RECEIPT: DRIFT <ids>` + one line per finding, exit 1 |
 * exit 2 fail-closed (unreadable report or rev) | exit 64 usage.
 * Declared limit: only labelled tallies are checked; a bare `held=9/10` is not (a plan's target and a result are
 * indistinguishable without a label), and a receipt written by the lane itself is trusted as written — nothing in the
 * tree binds a receipt to a counter run (the frozen fixtures carry `rev=aaa rule=X9`, so any syntactic binding is
 * copyable at the same cost). Residuals: a label whose separator is not `_` (`X9-HELD`), a label spelled in a script
 * outside the confusable table, a citation of another round's receipt that carries the pair, and a label split across
 * two lines (only `held=`/`checks=` continuations are folded).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REQUIRED = [
  ['Work performed', /^#{1,6}\s*\**\s*Work performed/im],
  ['Landed changes', /^#{1,6}\s*\**\s*Landed changes/im],
  ['Before → after measurements', /^#{1,6}\s*\**\s*Before\s*(?:→|->)\s*after measurements/im],
  ['Sources & frontier', /^#{1,6}\s*\**\s*Sources\s*&\s*frontier/im],
  ['Trend verdicts', /^#{1,6}\s*\**\s*Trend verdicts/im],
  ['SHONEN', /^#{1,6}\s*\**\s*SHONEN/im],
];
const PLACEHOLDER = /__[A-Za-z][A-Za-z0-9_]{1,}__|\bLANE_HASH\b|\bTBD\b|\bTODO\b|\bFIXME\b|\bREPLACE_?ME\b|\{\{[A-Za-z][A-Za-z0-9_]*\}\}|\bX{4,}\b|\bto be filled\b|<<[A-Za-z][A-Za-z0-9_]*>>|<(?:measured|measured_rev|tip_hash|rev_hash|placeholder|tbd|todo)>/gi;
const TALLY = /(?<![A-Za-z0-9])([A-Za-z0-9]+(?:_[A-Za-z0-9]+)*_(?:held|unmet))\s+held=(\d+)\/(\d+)(?![\d/])/gi;
const RECEIPT_PATH = (round) => new RegExp(`\\.ufo/waves/round-${round}/(?:base|close)/[A-Za-z0-9._*/-]*`, 'gi');
const HASH = /\b[0-9a-fA-F]{39,41}\b/g;
// Confusables (Cyrillic/Greek lookalikes of the Latin letters a verdict label is spelled with) and non-ASCII digit
// blocks are folded to ASCII in the scan copy only: a claim cannot be hidden from the parser by spelling `HELD` in
// another script or writing the numbers in another block (forgeries f2 confusable `Н`, f3 full-width, f4 Arabic-Indic).
const CONFUSABLE = {
  '\u0410': 'A', '\u0412': 'B', '\u0415': 'E', '\u041A': 'K', '\u041C': 'M', '\u041D': 'H', '\u041E': 'O',
  '\u0420': 'P', '\u0421': 'C', '\u0422': 'T', '\u0423': 'Y', '\u0425': 'X', '\u0406': 'I', '\u0408': 'J',
  '\u0405': 'S', '\u0430': 'a', '\u0432': 'b', '\u0435': 'e', '\u043A': 'k', '\u043C': 'm', '\u043D': 'h',
  '\u043E': 'o', '\u0440': 'p', '\u0441': 'c', '\u0442': 't', '\u0443': 'y', '\u0445': 'x', '\u0456': 'i',
  '\u0458': 'j', '\u0455': 's', '\u0391': 'A', '\u0392': 'B', '\u0395': 'E', '\u0396': 'Z', '\u0397': 'H',
  '\u0399': 'I', '\u039A': 'K', '\u039C': 'M', '\u039D': 'N', '\u039F': 'O', '\u03A1': 'P', '\u03A4': 'T',
  '\u03A5': 'Y', '\u03A7': 'X', '\u03B1': 'a', '\u03B5': 'e', '\u03B9': 'i', '\u03BA': 'k', '\u03BD': 'v',
  '\u03BF': 'o', '\u03C1': 'p', '\u03C4': 't', '\u03C5': 'u', '\u03C7': 'x', '\u03B6': 'z',
};
const DIGIT_BLOCK = [0x0660, 0x06F0, 0x0966, 0xFF10];
const foldDigits = (s) => s.replace(/[\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\uFF10-\uFF19]/g, (d) => {
  const c = d.codePointAt(0);
  return String(c - DIGIT_BLOCK.find((b) => c >= b && c < b + 10));
});
// Scan copy: invisible characters, table pipes and spaced operators are normalised away, so a claim cannot be
// hidden from the tally parser by formatting alone (controls k1 spaced `held = 3 / 3`, k3 table cell, k4 U+200B).
const scan = (s) => foldDigits(s
  .normalize('NFKC')
  .replace(/[\u200B-\u200F\u00AD\u2060-\u2064\uFEFF]/g, '')
  .replace(/[\u0391-\u03C9\u0400-\u045F]/g, (c) => CONFUSABLE[c] || c))
  .replace(/\|/g, ' ')
  .replace(/[ \t]*=[ \t]*/g, '=')
  .replace(/[ \t]*\/[ \t]*/g, '/');
// A claim's pair or check count may sit on the line after its label (`X9_HELD` / `held=9/9` / `checks=9`, forgeries
// f5 and f12): a continuation line that starts with either is folded into the claim line, keeping its citation scope.
const claimLines = (s) => {
  const out = [];
  for (const l of s.split('\n')) {
    if (out.length && /^\s*(?:held=\d+(?:\/\d+)?|checks=\d+)\b/.test(l)) out[out.length - 1] += ` ${l.trim()}`;
    else out.push(l);
  }
  return out;
};
// Prose copy: fenced blocks and HTML comments blanked, so a heading quoted as an example or hidden in a comment is
// not a section (controls k12/k13, forgery f6). Newlines are kept, so line structure survives.
const unfence = (text) => {
  let fenced = false;
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, (m) => m.replace(/[^\n]/g, '')).split('\n').map((l) => {
    if (/^\s*(?:```|~~~)/.test(l)) { fenced = !fenced; return ''; }
    return fenced ? '' : l;
  }).join('\n');
};
// Leading zeros are the same number (`03/03` is `3/3`), so a pair is keyed numerically: an honest report is not
// flagged (forgery f11) and a padded forgery is not excused.
const num = (d) => String(Number(d));
const tallyKey = (label, x, y) => `${label.toUpperCase()} held=${num(x)}/${num(y)}`;

function git(dir, args) { return spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }

function walkWorktreeReceipts(lane, round, d, receiptNames) {
  const segs = ['.ufo', 'waves', `round-${round}`, d];
  let cur = lane;
  for (const s of segs) {
    cur = join(cur, s);
    try { if (!lstatSync(cur).isDirectory()) return; } catch { return; }
  }
  const visit = (absDir, relDir) => {
    for (const n of readdirSync(absDir)) {
      const p = join(absDir, n);
      const r = `${relDir}/${n}`;
      try {
        const st = lstatSync(p);
        if (st.isDirectory()) visit(p, r);
        else if (st.isFile()) receiptNames.set(r, readFileSync(p, 'utf8'));
      } catch { /* unreadable */ }
    }
  };
  visit(cur, segs.join('/'));
}


// Structure arms kept from K64R2CriticForgeStruct's proposal: only those every frozen honest control still passes
// (the rest — CITE_ABSENT, TREND_MISSING, SHONEN_NO_POINTER, ... — would turn the frozen c0-honest control DRIFT and are
// reported as declared limits instead; see controls/CHANGES-AFTER-FREEZE.md).
function sectionBodies(prose) {
  const lines = prose.split('\n');
  return REQUIRED.map(([name, re]) => {
    const i = lines.findIndex((l) => re.test(l));
    if (i < 0) return { name, start: -1, body: '' };
    const level = lines[i].trim().match(/^#+/)[0].length;
    const body = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const h = /^(#{1,6})\s/.exec(lines[j]);
      if (h && h[1].length <= level) break;
      body.push(lines[j]);
    }
    return { name, start: i, body: body.join('\n') };
  });
}

export function diffReport({ lane, round, reportText, rev, fleet }) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });
  const text = reportText.replace(/\r\n?/g, '\n');
  const prose = unfence(text);
  // PLACEHOLDER (fence-agnostic on purpose: a token inside an example block is still an unfilled token)
  for (const m of text.matchAll(PLACEHOLDER)) add('PLACEHOLDER', m[0]);
  // sections (prose only)
  for (const [name, re] of REQUIRED) if (!re.test(prose)) add('SECTION_MISSING', name);
  const secs = sectionBodies(prose);
  for (const sx of secs) if (sx.start >= 0 && !sx.body.split('\n').some((l) => !/^\s*#{1,6}\s/.test(l) && l.trim().length >= 1)) add('SECTION_EMPTY', sx.name);
  const placed = secs.filter((sx) => sx.start >= 0);
  for (let i = 1; i < placed.length; i += 1) if (placed[i].start < placed[i - 1].start) { add('SECTION_ORDER', `${placed[i].name} before ${placed[i - 1].name}`); break; }
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
        const m = /^(100\d{3}) blob ([0-9a-f]+)\t([\s\S]+)$/.exec(row);
        if (!m) continue; // symlinks (120000) and gitlinks (160000 commit) are not receipts
        const b = spawnSync('git', ['-C', lane, 'cat-file', 'blob', m[2]], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
        if (b.status === 0) receiptNames.set(m[3], b.stdout);
      }
    } else {
      walkWorktreeReceipts(lane, round, d, receiptNames);
    }
  }
  // cited receipt paths, normalised: trailing punctuation dropped; `..` segments and bare directories are not receipts
  const REL_RECEIPT = /(?<![\w./-])(?:base|close)\/[A-Za-z0-9._*/-]+/g; // a receipt cited relative to the round dir is bound like a full path
  const stripPunct = (p) => (p.endsWith('/..') ? p : p.replace(/[.,;:]+$/, ''));
  const cited = (s) => [...new Set([
    ...[...s.matchAll(RECEIPT_PATH(round))].map((x) => stripPunct(x[0])),
    ...[...s.matchAll(REL_RECEIPT)].map((x) => `.ufo/waves/round-${round}/${stripPunct(x[0])}`),
  ])];
  const globRe = (g) => new RegExp(`^${g.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
  const isPath = (p) => Boolean(p) && !p.split('/').includes('..');
  const matchSpec = (sp, file) => (sp.endsWith('/') ? file.startsWith(sp) : sp.includes('*') ? globRe(sp).test(file) : sp === file);
  // RECEIPT_MISSING / RECEIPT_EMPTY
  for (const p of cited(text)) {
    if (!isPath(p)) { add('RECEIPT_MISSING', `${p} (escape-or-dir)`); continue; }
    if (p.endsWith('/')) { // a directory citation is satisfied by any non-empty committed receipt under it
      const hits = [...receiptNames.keys()].filter((f) => f.startsWith(p));
      if (!hits.length) add('RECEIPT_MISSING', `${p} (no receipt under it)`);
      else if (!hits.some((f) => receiptNames.get(f).trim())) add('RECEIPT_EMPTY', p);
      continue;
    }
    if (p.includes('*')) { // a glob is satisfied by any non-empty committed receipt it matches
      const hits = [...receiptNames.keys()].filter((f) => globRe(p).test(f));
      if (!hits.length) add('RECEIPT_MISSING', p);
      else if (!hits.some((f) => receiptNames.get(f).trim())) add('RECEIPT_EMPTY', p);
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
    for (const line of claimLines(scan(body))) {
      for (const m of line.matchAll(TALLY)) {
        const key = tallyKey(m[1], m[2], m[3]);
        const c = /^\s*checks=(\d+)/.exec(line.slice(m.index + m[0].length));
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ file, checks: c ? num(c[1]) : null });
      }
    }
  }
  for (const line of claimLines(scan(text))) {
    const scope = cited(line).filter(isPath);
    for (const m of line.matchAll(TALLY)) {
      const key = tallyKey(m[1], m[2], m[3]);
      const hits = (index.get(key) || []).filter((h) => !scope.length || scope.some((sp) => matchSpec(sp, h.file)));
      if (!hits.length) { add('TALLY_UNRECEIPTED', key); continue; }
      const c = /^\s*checks=(\d+)/.exec(line.slice(m.index + m[0].length));
      if (c && !hits.some((h) => h.checks === null || h.checks === num(c[1]))) add('TALLY_CHECKS_MISMATCH', `${key} checks=${c[1]}`);
    }
  }
  // hashes (strip URL tokens per-occurrence so a URL containing a hash cannot exempt a standalone claim of that hash)
  const headRes = rev ? null : git(lane, ['rev-parse', '--verify', 'HEAD^{commit}']);
  const tip = rev || (headRes.status === 0 ? headRes.stdout.trim() : null);
  const textLines = text.split('\n');
  // A hash is the URL's only when the URL is a git object URL (`…/commit|commits|tree|blob/<hash>`); a hash that merely
  // ends a path of an unrelated URL is still a commit claim (forgery f9).
  const inUrl = (raw) => textLines.some((l) => l.includes(raw) && new RegExp(`(?:https?://|(?:github|gitlab)\\.com/)[^\\s)\\]>\`]*/(?:commit|commits|tree|blob)/${raw}`, 'i').test(l));
  // A line that names the fleet is a fleet citation: a hash of another repository is the fleet's, not this lane's
  // landing (forgery f8); without that word it is a claim about this lane.
  const fleetNamed = (raw) => textLines.some((l) => l.includes(raw) && /\bfleet\b/i.test(l));
  for (const raw of new Set(text.match(HASH) || [])) {
    if (inUrl(raw)) continue;
    const h = raw.toLowerCase();
    const inLane = git(lane, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    const inFleet = fleet && git(fleet, ['cat-file', '-e', `${h}^{commit}`]).status === 0;
    if (!inLane && inFleet) { if (!fleetNamed(raw)) add('HASH_FOREIGN', raw); continue; }
    if (!inLane) { add('HASH_DEAD', raw.length === 40 ? raw : `${raw} (len=${raw.length})`); continue; }
    if (tip && git(lane, ['merge-base', '--is-ancestor', h, tip]).status !== 0) add('HASH_ORPHAN', h);
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
  // An unwritable TMPDIR (or no TMPDIR candidate) must read as a harness failure, not as a node stack trace:
  // the contract's fail-closed exit is 2, and a stack trace on stdout/stderr is indistinguishable from a crash.
  let T;
  try { T = mkdtempSync(join(tmpdir(), 'rrd-self.')); }
  catch (e) {
    process.stdout.write(`REPORT_RECEIPT_SELFTEST: ERROR (mkdtemp failed in ${tmpdir()}: ${e.code || e.message})\n`);
    process.exit(2);
  }
  const D = realpathSync(T);
  const g = (...a) => spawnSync('git', ['-C', D, '-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...a], { encoding: 'utf8' });
  if (g('init', '-q').status !== 0) { rmSync(T, { recursive: true, force: true }); process.stdout.write('REPORT_RECEIPT_SELFTEST: FAIL (git unavailable)\n'); process.exit(1); }
  if (git(D, ['rev-parse', '--show-toplevel']).stdout.trim() !== D) { process.stdout.write('REPORT_RECEIPT_SELFTEST: FAIL (fixture root)\n'); process.exit(1); }
  mkdirSync(join(D, '.ufo/waves/round-9/close/sub'), { recursive: true });
  mkdirSync(join(D, '.ufo/waves/round-9/base'), { recursive: true });
  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/sub/nested.txt'), 'SUB9_HELD held=2/2 checks=2\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/nl\nname.txt'), 'NL9_HELD held=5/5\n');
  writeFileSync(join(D, '.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=abc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/base/p-target.txt'), 'W9_HELD held=4/4 target=plan\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/r-tip.txt'), 'X9_HELD held=9/9 checks=9 rev=ccc rule=X9\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/s-tip.txt'), 'X9_HELD held=1/3 checks=3 rev=ddd rule=X9 prior X8_HELD held=7/7\n');
  writeFileSync(join(D, '.ufo/waves/round-9/close/empty.txt'), '');
  writeFileSync(join(D, '.ufo/outside.txt'), 'X9_HELD held=3/3 checks=3 rev=eee rule=X9\n');
  symlinkSync('../../../outside.txt', join(D, '.ufo/waves/round-9/close/link.txt'));
  mkdirSync(join(D, '.ufo/waves/round-9/close/sub'), { recursive: true });
  writeFileSync(join(D, '.ufo/waves/round-9/close/sub/deep.receipt'), 'DEEP9_HELD held=2/2 checks=2\n');
  writeFileSync(join(D, 'f.txt'), 'a');
  g('add', '-A'); g('commit', '-q', '-m', 'one with GL9_HELD held=8/8');
  const seed = g('rev-parse', 'HEAD').stdout.trim();
  g('update-index', '--add', '--cacheinfo', `160000,${seed},.ufo/waves/round-9/close/gitlink`);
  g('commit', '-q', '-m', 'two');
  const c1 = g('rev-parse', 'HEAD').stdout.trim();
  const blobSha = g('rev-parse', 'HEAD:f.txt').stdout.trim();
  g('checkout', '-q', '-b', 'side'); writeFileSync(join(D, 'g.txt'), 'b'); g('add', '-A'); g('commit', '-q', '-m', 'side');
  const orphan = g('rev-parse', 'HEAD').stdout.trim();
  g('checkout', '-q', '-'); g('checkout', '-q', '-B', 'main2', c1);
  writeFileSync(join(D, 'h.txt'), 'c'); g('add', '-A'); g('commit', '-q', '-m', 'two');
  const c2 = g('rev-parse', 'HEAD').stdout.trim();
  const body = (extra = '', skip = '') => [
    '# report', skip === 'wp' ? '' : '## Work performed', 'x', skip === 'lc' ? '' : '## Landed changes', 'x', '## Before → after measurements',
    'X9_UNMET held=0/3 base (`.ufo/waves/round-9/base/p-base.txt`); X9_HELD held=3/3 tip (`.ufo/waves/round-9/close/p-tip.txt`)', skip === 'sf' ? '' : '## Sources & frontier', 'x', '## Trend verdicts', 'x',
    skip === 'sh' ? '' : '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d', extra,
  ].join('\n');
  const run = (text, rv = c1) => diffReport({ lane: D, round: 9, reportText: text, rev: rv, fleet: null });
  const ids = (text, rv = c1) => [...new Set(run(text, rv).map((f) => f.id))].join(',');
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
  t('shonen-boxes-outside-section', ids(boxesElsewhere) === 'SECTION_EMPTY,SHONEN_COUNT');
  const bt = body().replace('- [~] a', '- `[~]` a').replace('- [~] b', '- `[~]` b');
  t('shonen-backticked-boxes', run(bt).length === 0);
  t('shonen-two-boxes-one-line', run(body().replace('- [~] a\n- [~] b', '- [~] a — [~] b')).length === 0);
  t('receipt-glob-match', run(body('see `.ufo/waves/round-9/close/p-*.txt`')).length === 0);
  t('receipt-glob-miss', ids(body('see `.ufo/waves/round-9/close/zz-*.txt`')) === 'RECEIPT_MISSING');
  t('receipt-dir-citation-ok', run(body('see `.ufo/waves/round-9/close/`')).length === 0);
  t('receipt-dir-citation-empty', ids(body('see `.ufo/waves/round-9/base/nope/`')) === 'RECEIPT_MISSING');
  t('hash-in-url-skipped', run(body('https://example.invalid/tree/0123456789abcdef0123456789abcdef01234567')).length === 0);
  // wave-2 ratchet (round-64 forgeries f1..f11, build/K64R2CriticForgeV2/cases)
  t('tally-digits-first-label', ids(body('64_HELD held=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-confusable-held', ids(body('X9_\u041dELD held=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-fullwidth-digits', ids(body('X9_HELD held=\uff16/\uff16')) === 'TALLY_UNRECEIPTED');
  t('tally-arabic-indic-digits', ids(body('X9_HELD held=\u0666/\u0666')) === 'TALLY_UNRECEIPTED');
  t('tally-line-split', ids(body('X9_HELD\nheld=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-leading-zeros-honest', run(body('X9_UNMET held=00/03 (`.ufo/waves/round-9/base/p-base.txt`)')).length === 0);
  t('placeholder-todo', ids(body('TODO: fill the revision')) === 'PLACEHOLDER');
  t('placeholder-angle-upper', ids(body('the tip is <<TIP>>')) === 'PLACEHOLDER');
  t('receipt-path-case-fold', ids(body('see `.ufo/waves/round-9/Close/p-tip.txt`')) === 'RECEIPT_MISSING');
  t('hash-url-non-git-tail', ids(body('0123456789abcdef0123456789abcdef01234567 (https://example.invalid/docs/0123456789abcdef0123456789abcdef01234567)')) === 'HASH_DEAD');
  t('sections-in-html-comment', ids(`# r\n<!--\n${body()}\n-->\nNothing to report.\n`) === 'SECTION_MISSING,SHONEN_COUNT');
  // fleet-side fixture repo: a commit that exists only outside the lane (forgery f8)
  const E = join(T, 'fleetrepo');
  mkdirSync(E, { recursive: true });
  const ge = (...a) => spawnSync('git', ['-C', E, '-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...a], { encoding: 'utf8' });
  ge('init', '-q'); writeFileSync(join(E, 'f.txt'), 'f'); ge('add', '-A'); ge('commit', '-q', '-m', 'fleet');
  const foreign = ge('rev-parse', 'HEAD').stdout.trim();
  const runF = (text) => diffReport({ lane: D, round: 9, reportText: text, rev: c1, fleet: E });
  const idsF = (text) => [...new Set(runF(text).map((f) => f.id))].join(',');
  t('hash-foreign', idsF(body(foreign)) === 'HASH_FOREIGN');
  t('hash-foreign-named-fleet', runF(body(`${foreign} fleet`)).length === 0);
  t('tally-checks-line-split', ids(body('X9_HELD held=3/3\nchecks=9')) === 'TALLY_CHECKS_MISMATCH');
  t('hash-41-malformed', ids(body('0123456789abcdef0123456789abcdef01234567f')) === 'HASH_DEAD');
  // wave-2 git vs worktree equivalence & trust-boundary ratchets (K64R2ReviewToolGit)
  t('nested-receipt-worktree-and-rev', run(body('SUB9_HELD held=2/2 (`.ufo/waves/round-9/close/sub/nested.txt`)'), null).length === 0 && run(body('SUB9_HELD held=2/2 (`.ufo/waves/round-9/close/sub/nested.txt`)'), c1).length === 0);
  t('newline-receipt-worktree-and-rev', run(body('NL9_HELD held=5/5 (`.ufo/waves/round-9/close/nl*`)'), null).length === 0 && run(body('NL9_HELD held=5/5 (`.ufo/waves/round-9/close/nl*`)'), c1).length === 0);
  t('gitlink-rejected-in-rev', ids(body('GL9_HELD held=8/8 (`.ufo/waves/round-9/close/gitlink`)'), c1) === 'RECEIPT_MISSING,TALLY_UNRECEIPTED');
  t('glob-empty-receipt-flagged', ids(body('see `.ufo/waves/round-9/close/empty*`'), c1) === 'RECEIPT_EMPTY');
  t('dir-citation-on-tally-line', run(body('X9_HELD held=3/3 (`.ufo/waves/round-9/close/`)'), c1).length === 0);
  t('url-does-not-exempt-standalone-dead-hash', ids(body('commit 0123456789abcdef0123456789abcdef01234567\nhttps://example.invalid/0123456789abcdef0123456789abcdef01234567'), c1) === 'HASH_DEAD');
  const rf = join(T, 'r.md'); writeFileSync(rf, body());
  const cli = (...a) => spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', '9', '--report', rf, ...a], { encoding: 'utf8' });
  t('cli-rev-space-form-bad-rev', cli('--rev', 'deadbeef00').status === 2);
  t('cli-rev-equals-form-bad-rev', cli('--rev=deadbeef00').status === 2);
  t('cli-rev-empty-equals-fails-closed', cli('--rev=').status === 2);
  t('cli-rev-trailing-fails-closed', cli('--rev').status === 2);
  t('cli-fleet-nonrepo-fails-closed', cli('--fleet', '/tmp/nonexistent-fleet-r64').status === 2);
  t('cli-rev-equals-form-good-rev', cli(`--rev=${c1}`).status === 0);
  t('render-clean-exit', render([], 'm').code === 0 && render([{ id: 'PLACEHOLDER', detail: 'x' }], 'm').code === 1);
  // wave-2 mutant-killers (K64R2MutateToolV2)
  t('heading-landed-skip', ids(body('', 'lc')) === 'SECTION_MISSING');
  t('heading-sources-skip', ids(body('', 'sf')) === 'SECTION_MISSING');
  t('heading-before-ascii-arrow', ids(body().replace('Before → after', 'Before -> after')) === '');
  t('heading-before-double-space', ids(body().replace('Before → after', 'Before  → after')) === '');
  t('heading-bold-sources', ids(body().replace('## Sources & frontier', '## **Sources & frontier**')) === '');
  t('heading-h4-landed', ids(body().replace('## Landed changes', '#### Landed changes')) === '');
  t('heading-midline-not-heading', ids(body('see ## Work performed in docs', 'wp')) === 'SECTION_MISSING');
  t('placeholder-lane-hash-adjacent', ids(body('LANE_HASHX and TBDs')) === '');
  t('placeholder-lowercase-angle-todo', ids(body('fix <TODO> and tbd soon')) === 'PLACEHOLDER');
  t('placeholder-unclosed-brace-clean', ids(body('at {{unclosed brace')) === '');
  t('tally-tab-separator', ids(body('X9_HELD\theld=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-label-case-folded', ids(body('x9_held held=3/3')) === '');
  t('tally-digit-prefixed-flagged', ids(body('9X9_HELD held=8/8')) === 'TALLY_UNRECEIPTED');
  t('tally-detail-two-digit', run(body('Z9_HELD held=10/11')).some((f) => f.id === 'TALLY_UNRECEIPTED' && f.detail === 'Z9_HELD held=10/11'));
  t('tally-checks-null-ok', ids(body('W9_HELD held=4/4 checks=9 (\`.ufo/waves/round-9/base/p-target.txt\`)')) === '');
  t('hash-blob-not-commit', ids(body(blobSha)) === 'HASH_DEAD');
  t('hash-embedded-not-hash', ids(body('x0123456789abcdef0123456789abcdef012345678')) === '');
  t('hash-suffixed-clean', ids(body('0123456789abcdef0123456789abcdef01234567x')) === '');
  t('hash-dedupe', run(body('0123456789abcdef0123456789abcdef01234567 and again 0123456789abcdef0123456789abcdef01234567')).filter((f) => f.id === 'HASH_DEAD').length === 1);
  t('hash-in-bare-github-url', ids(body('see github.com/org/repo/commit/0123456789abcdef0123456789abcdef01234567')) === '');
  t('tip-honours-rev', ids(body(c2)) === 'HASH_ORPHAN');
  t('tip-head-fallback', diffReport({ lane: D, round: 9, reportText: body(orphan), fleet: null }).some((f) => f.id === 'HASH_ORPHAN'));
  t('receipt-citation-trailing-period', ids(body('see .ufo/waves/round-9/close/p-tip.txt.')) === '');
  t('receipt-glob-escape', ids(body('see \`.ufo/waves/round-9/close/p.tip*\`')) === 'RECEIPT_MISSING');
  t('receipt-glob-no-crossdir', ids(body('see \`.ufo/waves/round-9/close/*.receipt\`')) === 'RECEIPT_MISSING');
  t('receipt-other-round-clean', ids(body('see \`.ufo/waves/round-8/base/x.txt\`')) === '');
  t('receipt-dir-empty-round8', diffReport({ lane: D, round: 8, reportText: body('see \`.ufo/waves/round-8/close/\`'), rev: c1, fleet: null }).some((f) => f.id === 'RECEIPT_MISSING'));
  t('receipt-escape-claim-scope', ids(body('X9_HELD held=3/3 (\`.ufo/waves/round-9/close/p-tip.txt/../../../x\`)')) === 'RECEIPT_MISSING');
  t('shonen-star-bullet', ids(body().replace('- [~] b', '* [~] b')) === '');
  t('shonen-nested-heading-clean', ids(['# report', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '### nested', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\n')) === '');
  t('shonen-inline-not-heading', ids(body('text ## SHONEN text')) === '');
  t('shonen-midline-not-box', /SHONEN_COUNT/.test(ids(body().replace('- [~] d', 'see - [ ] here'))));
  t('fence-tilde-arm', ids(fenceAll.replace(/\`\`\`/g, '~~~')) === 'SECTION_MISSING,SHONEN_COUNT');
  t('fence-indented', ids(fenceAll.replace(/^\`\`\`/gm, ' \`\`\`')) === 'SECTION_MISSING,SHONEN_COUNT');
  t('fence-closed-reopens', ids(['\`\`\`', 'example', '\`\`\`', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\n')) === '');
  // wave-2 L1 ratchet (K64R2ReviewToolV2, K64R2ScribeReportDraft, K64R2CriticForgeStruct): multi-word labels, relative receipt
  // citations, trailing `..`, CRLF, hollow sections, section order, symlinked invocation
  t('tally-multiword-label', ids(body('FOO_BAR_HELD held=99/99')) === 'TALLY_UNRECEIPTED');
  t('tally-prefix-number-not-matched', ids(body('X9_HELD held=3/30')) === 'TALLY_UNRECEIPTED');
  t('receipt-relative-missing', ids(body('X9_HELD held=3/3 (close/absent-tip.txt)')) === 'RECEIPT_MISSING,TALLY_UNRECEIPTED');
  t('receipt-relative-present', run(body('X9_HELD held=3/3 (close/p-tip.txt)')).length === 0);
  t('receipt-trailing-dotdot', ids(body('see `.ufo/waves/round-9/close/..`')) === 'RECEIPT_MISSING');
  t('crlf-report-clean', run(body().replace(/\n/g, '\r\n')).length === 0);
  t('section-empty', ids(body().replace('## Trend verdicts\nx', '## Trend verdicts\n')) === 'SECTION_EMPTY');
  t('section-order', ids(['# report', '## Landed changes', 'x', '## Work performed', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\n')) === 'SECTION_ORDER');
  const lnk = join(T, 'rrd-link.mjs');
  symlinkSync(process.argv[1], lnk);
  t('cli-symlink-invocation-runs', spawnSync(process.execPath, [lnk, '--lane', D, '--round', '9', '--report', rf, `--rev=${c1}`], { encoding: 'utf8' }).stdout.startsWith('REPORT_RECEIPT: CLEAN'));
  t('cli-usage-missing-args', spawnSync(process.execPath, [process.argv[1]], { encoding: 'utf8' }).status === 64);
  t('cli-usage-missing-lane', spawnSync(process.execPath, [process.argv[1], '--round', '9', '--report', rf], { encoding: 'utf8' }).status === 64);
  t('cli-usage-bad-round', spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', 'abc', '--report', rf], { encoding: 'utf8' }).status === 64);
  t('cli-report-missing-fail-closed', spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', '9', '--report', join(T, 'nope.md')], { encoding: 'utf8' }).status === 2);
  t('render-header-unique', !render([{ id: 'PLACEHOLDER', detail: 'a' }, { id: 'PLACEHOLDER', detail: 'b' }], 'm').out.includes('DRIFT PLACEHOLDER,PLACEHOLDER'));
  rmSync(T, { recursive: true, force: true });
  const pass = results.filter(([, ok]) => ok).length;
  for (const [n, ok] of results) if (!ok) process.stdout.write(`FAIL ${n}\n`);
  process.stdout.write(`REPORT_RECEIPT_SELFTEST: ${pass === results.length ? 'PASS' : 'FAIL'} (${pass}/${results.length})\n`);
  process.exit(pass === results.length ? 0 : 1);
}

const argv = process.argv.slice(2).flatMap((a) => (/^--[a-z]+=/.test(a) ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a]));
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  if (argv.includes('--selftest')) selftest();
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const lane = opt('--lane'); const round = opt('--round'); const report = opt('--report');
  if (!lane || !round || !report || !/^\d+$/.test(round)) { process.stderr.write('usage: report-receipt-diff.mjs --lane DIR --round N --report FILE [--rev REV] [--fleet DIR] | --selftest\n'); process.exit(64); }
  const laneAbs = resolve(lane);
  let revFull = opt('--rev');
  if (argv.includes('--rev')) {
    if (!revFull || revFull.startsWith('-')) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED rev-unreadable ${revFull ?? ''}\n`); process.exit(2); }
    const rv = git(laneAbs, ['rev-parse', '--verify', `${revFull}^{commit}`]);
    if (rv.status !== 0) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED rev-unreadable ${revFull}\n`); process.exit(2); }
    revFull = rv.stdout.trim();
  }
  let reportText;
  let reportBuf; try { reportBuf = readFileSync(resolve(report)); reportText = reportBuf.toString('utf8'); } catch { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED report-unreadable ${report}\n`); process.exit(2); }
  let fleet = null;
  if (argv.includes('--fleet')) {
    const fArg = opt('--fleet');
    if (!fArg || fArg.startsWith('-') || !existsSync(resolve(fArg))) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED fleet-unreadable ${fArg ?? ''}\n`); process.exit(2); }
    const fAbs = resolve(fArg);
    const ft = git(fAbs, ['rev-parse', '--show-toplevel']);
    if (ft.status !== 0 || realpathSync(ft.stdout.trim()) !== realpathSync(fAbs)) { process.stdout.write(`REPORT_RECEIPT: FAIL-CLOSED fleet-unreadable ${fArg}\n`); process.exit(2); }
    fleet = fAbs;
  } else if (existsSync(join(dirname(laneAbs), '.git'))) {
    fleet = dirname(laneAbs);
  }
  const findings = diffReport({ lane: laneAbs, round, reportText, rev: revFull, fleet });
  const sha = createHash('sha256').update(reportBuf).digest('hex').slice(0, 12);
  const r = render(findings, `round=${round} rev=${revFull || 'worktree'} bytes=${reportBuf.length} report_sha256=${sha}`);
  process.stdout.write(r.out);
  process.exit(r.code);
}
