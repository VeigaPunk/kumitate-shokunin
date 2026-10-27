#!/usr/bin/env node
// Probe v2 — hypothesis: routed-ledger.mjs's +-2-line answer window (scripts/routed-ledger.mjs:220)
// lets a closed/wontfix answer quote match a NEIGHBOURING, unrelated line of a real lane file → false CLOSED.
// Each run: all 7 round-65 items ledgered; only the probed row is 'closed' with a shifted quote.
// Control per probe: same row with a FOREIGN quote (from a distant line, absent from the window) → must be ANSWER_DEAD.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/kumitate-r66/K66LabratAnswerWindow';
const LESSON = `${S}/root/corpus/lessons/round-65.md`;
const RAW = readFileSync(LESSON, 'utf8');
const L = RAW.split('\n');

const norm = (s) => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

// candidate probes: [adjacent/answer line A (1-based), claimed line T, item ordinal k]
const CANDIDATES = [
  { A: 56,  T: 54,  k: 1 },
  { A: 134, T: 132, k: 2 },
  { A: 134, T: 133, k: 2 },
  { A: 141, T: 139, k: 3 },
  { A: 146, T: 148, k: 4 },
  { A: 151, T: 149, k: 5 },
  { A: 60,  T: 62,  k: 6 },
  { A: 115, T: 117, k: 7 },
];

const ITEM_QUOTES = {
  1: 'Gate row table contradicts the registry',
  2: 'capability row missing',
  3: 'registry home',
  4: 'proxy stanza stale',
  5: 'cite-check-fleet-dot errors 1545',
  6: 'round size / wave 2',
  7: 'README row for this file',
};

function quoteOf(lineNo) {
  let q = norm(L[lineNo - 1]);
  const w = q.split(' ');
  if (w.length > 25) q = w.slice(0, 25).join(' ');
  if (!q || q.includes('|') || q.includes('"')) return null;
  return q;
}

function ledgerRow(k, status, answer) {
  return `| P${k} | 65 | ${k} | "${ITEM_QUOTES[k]}" | probe-window | ${status} | ${answer} |`;
}
function ledger(probeRow) {
  const rows = [];
  for (let k = 1; k <= 7; k += 1) rows.push(k === probeRow.k ? probeRow.row : ledgerRow(k, 'open', '-'));
  return ['# Routed ledger (probe fixture)', '', '## Ledger', '',
    '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|',
    ...rows, ''].join('\n');
}
function run(text, tag) {
  writeFileSync(`${S}/root/corpus/routed-ledger.md`, text);
  const r = spawnSync('node', [`${S}/root/scripts/routed-ledger.mjs`, '--root', `${S}/root`, '--from', '65', '--to', '65'], { encoding: 'utf8' });
  writeFileSync(`${S}/out/${tag}.txt`, `EXIT=${r.status}\n${r.stdout}${r.stderr}`);
  return r;
}

// foreign quote for the control: line 1 of the lesson, absent from every window we use (windows are >= line 52)
const FOREIGN_LINE = 1;
const fq = quoteOf(FOREIGN_LINE);

const results = [];
const usedK = new Set();
for (const c of CANDIDATES) {
  if (results.length >= 5) break;
  if (usedK.has(c.k)) continue;
  const q = quoteOf(c.A);
  if (!q) continue;
  if (norm(L[c.T - 1]).includes(q)) continue;              // quote must NOT already be at the claimed line
  if (!fq || norm(L[c.T - 1]).includes(fq)) continue;
  usedK.add(c.k);

  const abuse = run(ledger({ k: c.k, row: ledgerRow(c.k, 'closed', `corpus/lessons/round-65.md:${c.T} — "${q}"`) }), `v2-abuse-${c.k}`);
  const ctrl = run(ledger({ k: c.k, row: ledgerRow(c.k, 'closed', `corpus/lessons/round-65.md:${c.T} — "${fq}"`) }), `v2-ctrl-${c.k}`);
  const exact = run(ledger({ k: c.k, row: ledgerRow(c.k, 'closed', `corpus/lessons/round-65.md:${c.A} — "${q}"`) }), `v2-exact-${c.k}`);

  const aDead = /ANSWER_DEAD/.test(abuse.stdout);
  const cDead = /ANSWER_DEAD/.test(ctrl.stdout);
  const eDead = /ANSWER_DEAD/.test(exact.stdout);
  const aClean = /ROUTED_LEDGER: CLEAN/.test(abuse.stdout);
  const pass = !aDead && cDead && !eDead; // window accepted adjacent quote; ANSWER_DEAD path live; exact-line legitimately passes
  results.push({ ...c, quote: q, abuseExit: abuse.status, abuseClean: aClean, abuseDead: aDead, ctrlDead: cDead, exactDead: eDead, pass });
}

writeFileSync(`${S}/out/probe-v2.json`, JSON.stringify(results, null, 2));
let n = 0;
for (const r of results) {
  if (r.pass) n += 1;
  console.log(`probe k=${r.k}: answer quote from real line ${r.A} claimed at neighbouring line ${r.T} (offset ${r.A - r.T > 0 ? '+' : ''}${r.A - r.T})`);
  console.log(`  quote: "${r.quote}"`);
  console.log(`  abuse  quote@${r.T}: exit=${r.abuseExit} CLEAN=${r.abuseClean} ANSWER_DEAD=${r.abuseDead}`);
  console.log(`  ctrl   foreign quote@${r.T}: ANSWER_DEAD=${r.ctrlDead} (path live)`);
  console.log(`  exact  quote@${r.A}: ANSWER_DEAD=${r.exactDead} (exact-line answer passes)`);
  console.log(`  → ${r.pass ? 'FALSE CLOSED — window accepts neighbouring unrelated line' : 'not reproduced'}`);
}
console.log(`VERDICT BASIS: ${n}/${results.length} probes reproduce the false CLOSED`);
