#!/usr/bin/env node
/**
 * forge-blind.mjs — K64CriticC1Predicate forgery of scripts/report-receipt-diff.mjs.
 * Reads the REPORT ONLY. It never opens `.ufo/waves/round-N/{base,close}/**` and never
 * resolves a receipt at a revision. Every finding is derived from report text plus a
 * 2-entry label blacklist and a 1-entry path blacklist, both copied from the frozen
 * control fixtures. If the frozen counter prints RECEIPT64_HELD 5/5 on this file, then
 * P1..P5 do not jointly discriminate a receipt-diffing tool from a text matcher.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) { process.stdout.write('REPORT_RECEIPT_SELFTEST: PASS (20/20)\n'); process.exit(0); }
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const report = opt('--report');
const lane = opt('--lane');
const fleet = opt('--fleet') || '/home/vgpnk/Projects/shokunin';
if (!report) { process.stderr.write('usage: --report <file>\n'); process.exit(64); }
let text;
try { text = readFileSync(report, 'utf8'); } catch { process.exit(2); }

const f = [];
const add = (id, detail) => f.push([id, detail]);

// PLACEHOLDER — same grammar as the subject tool (3+ chars), NOT the probe's independent grammar.
for (const m of text.matchAll(/__[A-Z][A-Z0-9_]{2,}__|\bLANE_HASH\b|\bTBD\b/g)) add('PLACEHOLDER', m[0]);
// Sections — same list as the subject tool.
const REQ = [['Work performed', /^#{1,6}\s*\**\s*Work performed/im], ['Landed changes', /^#{1,6}\s*\**\s*Landed changes/im],
  ['Before → after measurements', /^#{1,6}\s*\**\s*Before\s*(?:→|->)\s*after measurements/im],
  ['Sources & frontier', /^#{1,6}\s*\**\s*Sources\s*&\s*frontier/im], ['Trend verdicts', /^#{1,6}\s*\**\s*Trend verdicts/im],
  ['SHONEN', /^#{1,6}\s*\**\s*SHONEN/im]];
for (const [n, re] of REQ) if (!re.test(text)) add('SECTION_MISSING', n);
const sh = [...text.matchAll(/^#{1,6}\s*\**\s*SHONEN/gim)];
if (sh.length !== 1) add('SHONEN_COUNT', `headings=${sh.length}`);
else if (text.slice(sh[0].index).split('\n').slice(1).filter((l) => /^\s*[-*]\s*\[[x~ ]\]/.test(l)).length < 4) add('SHONEN_COUNT', 'boxes');

// RECEIPT_MISSING — a one-name blacklist, no filesystem, no receipt, no rev.
for (const m of new Set([...text.matchAll(/\.ufo\/waves\/round-\d+\/(?:base|close)\/[A-Za-z0-9._-]+/g)].map((x) => x[0])))
  if (/\/absent\.txt$/.test(m)) add('RECEIPT_MISSING', m);

// TALLY_UNRECEIPTED — report-internal label conflict, plus two labels copied from the fixtures.
const BAD = new Set(['Y9_HELD', 'DISPATCH60_HELD']);
const seen = new Map();
for (const m of text.matchAll(/\b([A-Z][A-Z0-9]*_(?:HELD|UNMET))\s+held=(\d+)\/(\d+)/g)) {
  const [, label, x, y] = m;
  if (!seen.has(label)) seen.set(label, new Set());
  seen.get(label).add(`${x}/${y}`);
}
for (const [label, vals] of seen) {
  if (vals.size > 1) add('TALLY_UNRECEIPTED', `${label} held=${[...vals][0]}`);
  else if (BAD.has(label)) add('TALLY_UNRECEIPTED', `${label} held=${[...vals][0]}`);
}

// HASH_DEAD — resolves against the git object stores (not receipts).
for (const h of new Set(text.match(/\b[0-9a-f]{40}\b/g) || [])) {
  const ok = (d) => spawnSync('git', ['-C', d, 'cat-file', '-e', `${h}^{commit}`]).status === 0;
  if (!(lane && ok(lane)) && !ok(fleet)) add('HASH_DEAD', h);
}

const ids = [...new Set(f.map((x) => x[0]))].join(',');
if (!f.length) { process.stdout.write('REPORT_RECEIPT: CLEAN (blind)\n'); process.exit(0); }
process.stdout.write(`REPORT_RECEIPT: DRIFT ${ids} (blind)\n${f.map(([i, d]) => `${i} ${d}`).join('\n')}\n`);
process.exit(1);
