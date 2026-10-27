#!/usr/bin/env node
/**
 * verify.mjs — re-locate every answer quote in answers.md at its cited path:line (±2).
 * Reads the freeze revision with `git show` (untracked files fall back to the worktree),
 * normalises both sides with routed-ledger.mjs's own `norm()`, and prints one line per row.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { norm } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '621212bac37f8249c72ac982d1d6534cb8d60701';
const HERE = `${LANE}/.ufo/waves/round-66/build/K66RevengerAnswers`;

const read = (p) => {
  const r = spawnSync('git', ['-C', LANE, 'show', `${REV}:${p}`], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  if (r.status === 0) return { text: r.stdout, src: 'rev' };
  try { return { text: readFileSync(`${LANE}/${p}`, 'utf8'), src: 'worktree' }; } catch { return { text: null, src: 'absent' }; }
};

const rows = readFileSync(`${HERE}/answers.md`, 'utf8').split('\n')
  .map((l) => l.trim())
  .filter((l) => /^\|\s*\d+\s*\|\s*\d+\s*\|/.test(l))
  .map((l) => {
    const c = l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim());
    return { round: c[0], ord: c[1], label: c[2], answer: c[3], status: c[4], conf: c[5], quote: c.slice(6).join('|').trim() };
  });

let located = 0; let missing = 0; let skipped = 0;
for (const r of rows) {
  const id = `R${r.round}.${r.ord}`;
  if (r.answer === 'none found') { skipped += 1; console.log(`SKIP ${id} ${r.label} :: none found`); continue; }
  const m = /^(.*):(\d+)/.exec(r.answer.replace(/\*\*/g, ''));
  if (!m) { console.log(`BAD  ${id} unparsable answer ${r.answer}`); missing += 1; continue; }
  const path = m[1]; const line = Number(m[2]);
  const file = read(path);
  if (file.text === null) { console.log(`MISS ${id} ${path} absent at ${REV} and in the worktree`); missing += 1; continue; }
  const L = file.text.split('\n');
  const win = L.slice(Math.max(0, line - 3), line + 2).join('\n');
  const q = norm(r.quote.replace(/\\\|/g, '|'));
  const ok = q && norm(win).includes(q);
  console.log(`${ok ? 'OK  ' : 'MISS'} ${id} ${r.label} ${path}:${line} src=${file.src} :: ${ok ? '' : 'quote not in window :: '}${r.quote.slice(0, 60)}`);
  if (ok) located += 1; else missing += 1;
}
console.log(`ANSWERS_VERIFY: located=${located}/${located + missing} skipped_none_found=${skipped} rows=${rows.length}`);
process.exitCode = missing === 0 ? 0 : 1;
