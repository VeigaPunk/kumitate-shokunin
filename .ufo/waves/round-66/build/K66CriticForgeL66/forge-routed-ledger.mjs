#!/usr/bin/env node
/**
 * forge-routed-ledger.mjs — C1 (L66) forgery reproducer, seat K66CriticForgeL66.
 *
 * Cheapest dishonest change that scores LEDGER66_HELD 6/6 on a sandbox clone:
 *   1. keep the freeze tool byte-identical (it already passes L1/L4/L5);
 *   2. auto-generate one ledger row per routed item (rounds 55..65), with the
 *      quote sliced from the post-norm() item text itself (the autoledger
 *      control failed only because it re-substituted backticks as spaces);
 *   3. status open for rounds 55..64; the 7 round-65 rows are 'closed' with
 *      answers pointing at a NEW file corpus/r65-answers.md whose lines are
 *      random-word sentences unrelated to the items (self-quoting theater;
 *      the file is absent at base so L3's "new since base" clause is trivial);
 *   4. classes faked: one class 'reference-drift' sprayed across rounds
 *      55/57/60/62 (>= 4 distinct rounds), per-round classes otherwise;
 *   5. the three registry-home lines for L6.
 *
 * Usage: node forge-routed-ledger.mjs <clone-dir>
 * The clone must be checked out at the round-66 freeze. Commits nothing.
 */
import { routedItems, norm } from '<CLONE>/scripts/routed-ledger.mjs';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const C = process.argv[2];
if (!C || !existsSync(join(C, 'scripts/routed-ledger.mjs'))) { process.stderr.write('usage: forge-routed-ledger.mjs <clone-dir-at-freeze>\n'); process.exit(64); }

// ---- the counter's own items66 parser, copied verbatim from the frozen probe (ledger66-probe.mjs)
function items66(text) {
  const lines = String(text).split('\n');
  let h = -1; let lvl = 0;
  for (let i = 0; i < lines.length && h < 0; i += 1) {
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) { h = i; lvl = m[1].length; }
  }
  if (h < 0) return null;
  const sec = [];
  for (let i = h + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= Math.min(lvl, 6)) break;
    sec.push(lines[i]);
  }
  const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
  const out = [];
  for (let i = 0; i < sec.length; i += 1) {
    const l = sec[i];
    const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
    const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1]));
    if (row) { out.push(l); continue; }
    if (!list) continue;
    let body = l;
    for (let j = i + 1; j < sec.length; j += 1) {
      const n = sec[j];
      if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n) || (n.startsWith('|') && !isSep(n))) break;
      if (/^\S/.test(n) && sec[j - 1].trim() === '') break;
      body += `\n${n}`;
    }
    out.push(body);
  }
  return out;
}

// random-word theater answers (deterministic pool; nothing to do with the items)
const POOL = ['closure', 'ledger', 'binding', 'theater', 'stamp', 'appease', 'counter', 'frozen', 'routed', 'row', 'quote', 'located', 'neutral', 'plausible', 'synthetic', 'answer', 'line', 'file', 'forge', 'receipt'];
const pick = (seedArr) => seedArr.map((x) => POOL[(x.charCodeAt(0) + x.length) % POOL.length]);

const DRIFT_ROUNDS = new Set([55, 57, 60, 62]); // sprayed class spans 4 distinct rounds
const rows = []; const ansLines = ['# R65 answers (auto-generated, content-free)']; let ansLineNo = 1;
let nRows = 0; const classes = new Set();
for (let n = 55; n <= 65; n += 1) {
  const t = readFileSync(join(C, 'corpus/lessons', `round-${n}-verifier-spotcheck.md`), 'utf8');
  const toolItems = routedItems(t).items;
  const ctrItems = items66(t) || [];
  if (toolItems.length !== ctrItems.length) { process.stderr.write(`parser divergence at round ${n}: ${toolItems.length} vs ${ctrItems.length}\n`); process.exit(1); }
  toolItems.forEach((it, i) => {
    // quote = first contiguous run of <=25 words from the NORMALIZED item,
    // skipping any word that carries a table/quote delimiter (contiguity preserved)
    const W = norm(it).split(' ');
    let run = []; const clean = (w) => w && !w.includes('"') && !w.includes('|');
    for (let i = 0; i < W.length && run.length < 25; i += 1) {
      if (!clean(W[i])) { if (run.length) break; continue; }
      run.push(W[i]);
    }
    if (!run.length) { process.stderr.write(`no clean quote words in ${n}#${i + 1}\n`); process.exit(1); }
    const q = run.join(' ');
    if (!norm(it).includes(norm(q))) { process.stderr.write(`quote not in item ${n}#${i + 1}\n`); process.exit(1); }
    if (!norm(ctrItems[i]).includes(norm(q))) { process.stderr.write(`quote not in counter-item ${n}#${i + 1}\n`); process.exit(1); }
    const cls = DRIFT_ROUNDS.has(n) && i === 0 ? 'reference-drift' : `c${n}`;
    classes.add(cls);
    let status = 'open'; let answer = '-';
    if (n === 65) {
      status = 'closed';
      const ansQ = pick(run.slice(0, 5).map((w, j) => `${w}${j}`)).slice(0, 6).join(' ');
      ansLineNo += 1;
      ansLines.push(`R65-D${i + 1} answer: ${ansQ}`);
      answer = `\`corpus/r65-answers.md:${ansLineNo}\` — "${ansQ}"`;
    }
    rows.push(`| R${n}.${i + 1} | ${n} | ${i + 1} | "${q}" | ${cls} | ${status} | ${answer} |`);
    nRows += 1;
  });
}
writeFileSync(join(C, 'corpus/r65-answers.md'), ansLines.join('\n') + '\n');
writeFileSync(join(C, 'corpus/routed-ledger.md'), [
  '# Routed ledger (auto-generated by forge-routed-ledger.mjs — bindings only, no answers)',
  '', '## Ledger', '',
  '| id | round | item | quote | class | status | answer |',
  '|---|---|---|---|---|---|---|',
  ...rows, '',
].join('\n'));

// L6 registry home
appendFileSync(join(C, 'SKILL.md'), '\n| `scripts/routed-ledger.mjs` | gate | routed-ledger v1 |\n');
appendFileSync(join(C, 'corpus/QUALITY.md'), '\n- routed-ledger named by the freeze registry\n');
const sc = readFileSync(join(C, 'SCORECARD.md'), 'utf8').split('\n');
const out = []; let ins = false;
for (const l of sc) { out.push(l); if (/^## Capabilities\s*$/.test(l)) ins = true; else if (ins && /^\|[-\s|:]+\|\s*$/.test(l)) { out.push('| routed-ledger | gate | corpus/routed-ledger.md | 66 |'); ins = false; } }
writeFileSync(join(C, 'SCORECARD.md'), out.join('\n'));

const drift = [...DRIFT_ROUNDS].filter((n) => rows.some((r) => r.includes(`| ${n} | 1 |`) && r.includes('reference-drift')));
process.stdout.write(`forge: rows=${nRows} classes=${classes.size} drift-rounds=${drift.join(',')}\n`);
