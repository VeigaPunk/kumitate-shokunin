#!/usr/bin/env node
/* Harness 11: measure, on the CLAIM corpus (rounds 55..65), whether each construct
 * the proposed fixes touch actually occurs — i.e. whether a fix changes the item count
 * that L2 compares against the frozen counter's own count. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const tool = await import('file:///fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs');
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;

let totalTool = 0; let totalFenceItems = 0; let totalCommentItems = 0; let totalCr = 0; let totalSepNoPipe = 0;
const perRound = [];
for (let n = 55; n <= 65; n += 1) {
  const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const raw = readFileSync(p, 'utf8');
  const crlf = raw.includes('\r');
  const L = raw.split('\n');
  const start = L.findIndex((l) => { const m = /^(#{1,6})\s+(.*)$/.exec(l); return m && HEAD_RE.test(m[2]); });
  const level = start >= 0 ? (/^(#{1,6})\s/.exec(L[start]) || ['', ''])[1].length : 0;
  let end = L.length;
  if (start >= 0) for (let j = start + 1; j < L.length; j += 1) { const m = /^(#{1,6})\s/.exec(L[j]); if (m && m[1].length <= level) { end = j; break; } }
  const sec = L.slice(start + 1, end);
  // fence / comment spans inside the section
  let inFence = false; let inComment = false;
  const fenceItems = []; const commentItems = [];
  for (const l of sec) {
    const fenceLine = /^\s*```/.test(l);
    const cOpen = /<!--/.test(l); const cClose = /-->/.test(l);
    const isItem = /^(?:[-*+]|\d+[.)])\s+\S/.test(l);
    if (inFence && isItem) fenceItems.push(l);
    if (inComment && isItem) commentItems.push(l);
    if (fenceLine) inFence = !inFence;
    if (cOpen && !cClose) inComment = true; else if (cClose) inComment = false;
  }
  // separators lacking a trailing pipe, inside the section
  const sepNoPipe = sec.filter((l) => /^\|[-: |]+\|?$/.test(l.trim()) && !l.trim().endsWith('|'));
  const t = tool.routedItems(raw).items.length;
  totalTool += t; totalFenceItems += fenceItems.length; totalCommentItems += commentItems.length;
  totalCr += crlf ? 1 : 0; totalSepNoPipe += sepNoPipe.length;
  perRound.push({ n, items: t, crlf, fenceItems: fenceItems.length, commentItems: commentItems.length, sepNoPipe: sepNoPipe.length });
}
console.log(JSON.stringify({ perRound, totals: { toolItems: totalTool, fencePhantomItems: totalFenceItems, commentPhantomItems: totalCommentItems, crlfFiles: totalCr, separatorsWithoutTrailingPipe: totalSepNoPipe } }, null, 1));
