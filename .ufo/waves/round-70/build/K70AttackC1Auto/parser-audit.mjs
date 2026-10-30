#!/usr/bin/env node
// K70AttackC1Auto — parser blind-spot analysis.
// items67 is copied VERBATIM from the frozen counter
// .ufo/waves/round-69/probe/ledger69-probe.mjs (lines 141-188) so the item
// universe is exactly the counter's own. The generator regex replicates the
// frozen control .ufo/waves/round-69/probe/c1-controls.sh autoledger arm:
//     re.match(r'^[-*+]\s+\*\*', line)
import fs from 'node:fs';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';

// ---- verbatim from frozen ledger69-probe.mjs (do not edit) ----
function items67(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const f = lines[i].match(/^ {0,3}(```|~~~)/);
    if (f) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) heads.push({ i, lvl: m[1].length });
  }
  if (!heads.length) return { sections: [], items: [] };
  const sections = heads.map((h, idx) => {
    const end = idx + 1 < heads.length ? heads[idx + 1].i : lines.length;
    const sec = []; let fence = false;
    for (let j = h.i + 1; j < end; j += 1) {
      const fv = lines[j].match(/^ {0,3}(```|~~~)/);
      if (fv) { fence = !fence; sec.push({ l: lines[j], fence: true }); continue; }
      sec.push({ l: lines[j], fence });
    }
    return sec;
  });
  const items = [];
  for (const sec of sections) {
    const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
    for (let i = 0; i < sec.length; i += 1) {
      const l = sec[i].l;
      if (sec[i].fence) continue;
      const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
      const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1].l));
      if (row) { items.push({ n: null, text: l }); continue; }
      if (!list) continue;
      let body = l;
      for (let j = i + 1; j < sec.length; j += 1) {
        const n = sec[j];
        if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\n${n.l}`; continue; }
        if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n.l) || (n.l.startsWith('|') && !isSep(n.l))) break;
        if (/^\S/.test(n.l) && sec[j - 1].l.trim() === '') break;
        body += `\n${n.l}`;
      }
      items.push({ n: null, text: body });
    }
  }
  return { sections, items: items.map((x) => x.text) };
}
// ---- end verbatim ----

// generator predicate from frozen c1-controls.sh (autoledger arm), python re.match on each line
const GEN = (line) => /^[-*+]\s+\*\*/.test(line);

let totalCounter = 0, totalGen = 0, totalNumbered = 0;
for (let n = 55; n <= 66; n += 1) {
  const p = path.join(LANE, `corpus/lessons/round-${n}-verifier-spotcheck.md`);
  const text = fs.readFileSync(p, 'utf8');
  const r = items67(text);
  const genRows = [];
  const numbered = [];
  for (const it of r.items) {
    const firstLine = it.split('\n')[0];
    if (GEN(firstLine)) genRows.push(firstLine.slice(0, 90));
    if (/^[0-9]+[.)]\s+\S/.test(firstLine)) numbered.push(firstLine.slice(0, 90));
  }
  totalCounter += r.items.length; totalGen += genRows.length; totalNumbered += numbered.length;
  console.log(`round-${n}: counter-items=${r.items.length} control-rows=${genRows.length} numbered-items=${numbered.length}`);
  for (const x of numbered) console.log(`    NUMBERED-IGNORED: ${x}`);
}
console.log(`TOTAL: counter-items=${totalCounter} control-rows=${totalGen} numbered-items=${totalNumbered}`);
