import { spawnSync } from 'node:child_process';
import { routedItems } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '621212bac37f8249c72ac982d1d6534cb8d60701';
const show = (p) => { const r = spawnSync('git', ['-C', LANE, 'show', `${REV}:${p}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); return r.status === 0 ? r.stdout : null; };

// verbatim counter parser (frozen probe, items66) for comparison
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

let tot = 0, tot66 = 0;
for (let n = 55; n <= 65; n += 1) {
  const p = `corpus/lessons/round-${n}-verifier-spotcheck.md`;
  const t = show(p);
  if (t == null) { console.log(`round ${n}: ABSENT at rev`); continue; }
  const r = routedItems(t);
  const c66 = items66(t) || [];
  tot += r.items.length; tot66 += c66.length;
  const L = t.split('\n');
  let start = -1, level = 0;
  for (let i = 0; i < L.length; i += 1) { const m = /^(#{1,6})\s+(.*)$/.exec(L[i]); if (m && /\brouted\s+(defects?|items?)\b/i.test(m[2])) { start = i; level = m[1].length; break; } }
  let end = L.length;
  if (start >= 0) for (let i = start + 1; i < L.length; i += 1) { const m = /^(#{1,6})\s/.exec(L[i]); if (m && m[1].length <= level) { end = i; break; } }
  const sec = start >= 0 ? L.slice(start, end) : [];
  const fences = sec.filter((l) => /^\s*```/.test(l)).length;
  const pipeNoTrail = sec.filter((l) => /^\|/.test(l) && !/\|\s*$/.test(l));
  const hashInFence = [];
  let inf = false;
  for (const l of sec) { if (/^\s*```/.test(l)) { inf = !inf; continue; } if (inf && /^#{1,6}\s/.test(l)) hashInFence.push(l); }
  const itemPipe = r.items.filter((s) => s.includes('|'));
  const agree = r.items.length === c66.length && r.items.every((s, i) => s === c66[i]);
  console.log(`round ${n}: found=${r.found} toolItems=${r.items.length} counterItems=${c66.length} agree=${agree} fences=${fences} pipeNoTrail=${pipeNoTrail.length} hashInFence=${hashInFence.length} itemsContainingPipe=${itemPipe.length}`);
  if (fences || pipeNoTrail.length || hashInFence.length) console.log('  RAW-SEC: ' + JSON.stringify(sec));
  if (pipeNoTrail.length) console.log('  NO-TRAIL-PIPE-LINES: ' + JSON.stringify(pipeNoTrail));
  if (!agree) console.log('  TOOL: ' + JSON.stringify(r.items) + '\n  C66:  ' + JSON.stringify(c66));
}
console.log('TOTAL tool=', tot, ' counter=', tot66);
