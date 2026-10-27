#!/usr/bin/env node
// reanchor.mjs — read-only helper for the L1 integrating build/K68ScribeLedgerC/rows.md.
// For every closed/wontfix row it re-derives `path:line` for the row's answer quote in the
// current lane worktree. Prints OK when the cited line still holds the quote, DRIFT with the
// line that does, MISSING when no line holds it. Exit 1 if any row is not OK.
import { readFileSync, existsSync } from 'node:fs';
import { join, normalize } from 'node:path';

const lane = process.argv[2];
const rowsFile = process.argv[3];
const norm = (s) => String(s).replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const wb = (q, t) => { const n = norm(q); if (!n) return false; return new RegExp(`(^|[^A-Za-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(t)); };

let bad = 0;
const isSep = (cells) => cells.every((x) => /^:?-+:?$/.test(x));
for (const line of readFileSync(rowsFile, 'utf8').split('\n')) {
  if (!line.startsWith('| ')) continue;
  const c = line.trim().slice(1, -1).split('|').map((x) => x.trim());
  if (c.length !== 7 || c[0] === 'id' || isSep(c)) continue;   // header / separator rows
  if (c[5] === 'open') continue;
  if (!['closed', 'wontfix'].includes(c[5])) { console.log(`BADSTATUS ${c[0]} status=${c[5]}`); bad += 1; continue; }
  const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(c[6]);
  if (!m) { console.log(`BADFORMAT ${c[0]}`); bad += 1; continue; }
  const p = normalize(m[1]); const cited = Number(m[2]);
  const f = join(lane, p);
  if (!existsSync(f)) { console.log(`MISSING ${c[0]} file=${p}`); bad += 1; continue; }
  const lines = readFileSync(f, 'utf8').split('\n');
  const hits = lines.map((l, i) => (wb(m[3], l) ? i + 1 : 0)).filter(Boolean);
  if (hits.includes(cited)) { console.log(`OK ${c[0]} ${p}:${cited}`); continue; }
  bad += 1;
  console.log(hits.length ? `DRIFT ${c[0]} cited=${p}:${cited} now=${p}:${hits.join(',')}` : `MISSING ${c[0]} quote-absent-in=${p}`);
}
console.log(`REANCHOR: ${bad === 0 ? 'CLEAN' : 'DRIFT'} problems=${bad}`);
process.exit(bad === 0 ? 0 : 1);
