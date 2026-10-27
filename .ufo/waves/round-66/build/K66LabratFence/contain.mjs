// For each spot-check round 40..65: compute routed-section span (tool heading rule),
// then check whether any ``` fence line or any in-fence `- ` line falls inside the span.
import { readFileSync } from 'node:fs';
const dir = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons';
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;
for (let n = 40; n <= 65; n += 1) {
  const p = `${dir}/round-${n}-verifier-spotcheck.md`;
  let L;
  try { L = readFileSync(p, 'utf8').split('\n'); } catch { continue; }
  let start = -1, level = 0;
  for (let i = 0; i < L.length; i += 1) {
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m && HEAD_RE.test(m[2])) { start = i; level = m[1].length; break; }
  }
  if (start < 0) { console.log(`round-${n}: no routed section`); continue; }
  let end = L.length;
  for (let i = start + 1; i < L.length; i += 1) {
    const m = /^(#{1,6})\s/.exec(L[i]);
    if (m && m[1].length <= level) { end = i; break; }
  }
  let inFence = false; const inFenceDash = []; const fenceLines = [];
  for (let i = start + 1; i < end; i += 1) {
    if (/^\s*```/.test(L[i])) { inFence = !inFence; fenceLines.push(i + 1); continue; }
    if (inFence && /^(?:[-*+]|\d+[.)])\s+\S/.test(L[i])) inFenceDash.push(i + 1);
  }
  console.log(`round-${n}: section lines ${start + 1}..${end} | fenceLines inside: [${fenceLines}] | in-fence item-like lines: [${inFenceDash}]`);
}
