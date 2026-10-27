// extract.mjs — slice items67 verbatim from the frozen counter + routedItems verbatim
// from scripts/routed-ledger.mjs, run both on the committed bytes of rounds 59..62.
// Also captures the routed-section heading text and full section body, using the
// counter's own fence-aware heading rule re-derived here (same regexes, same scan).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '39f61816d4ee7a8d401df42c1818c91a9c537bce'; // lane tip at freeze (commit 39f61816)
const OUT = process.env.OUT;
const ROUNDS = [59, 60, 61, 62];

// ---- slice a top-level `function NAME(...) {` … `^}` block verbatim from a file
function sliceFn(src, name, pat = `function ${name}(`) {
  const start = src.indexOf(pat);
  if (start < 0) throw new Error(`no ${name}`);
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

const probeSrc = readFileSync(`${LANE}/.ufo/waves/round-68/probe/ledger68-probe.mjs`, 'utf8');
const toolSrc = readFileSync(`${LANE}/scripts/routed-ledger.mjs`, 'utf8');
const items67Src = sliceFn(probeSrc, 'items67');
const routedSrc = sliceFn(toolSrc, 'routedItems', 'export function routedItems(').replace(/^export /, '');
const headReSrc = 'const HEAD_RE = /\\brouted\\s+(defects?|items?)\\b/i;';
const items67 = eval(`(${items67Src})`);
const routedItems = eval(`${headReSrc}; ${routedSrc}; routedItems`);

// counter-identical heading finder (same fence scan + same regex as items67's first pass)
function routedHeads(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const f = lines[i].match(/^ {0,3}(```|~~~)/);
    if (f) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) heads.push({ line: i + 1, text: m[2] });
  }
  return heads;
}

const show = (rev, rel) => {
  const r = spawnSync('git', ['-C', LANE, 'show', `${rev}:${rel}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git show ${rev}:${rel} failed`);
  return r.stdout;
};

const labelOf = (t) => {
  const m = /\*\*([A-Z][A-Za-z0-9]*-V\d+)/.exec(t) || /\*\*([A-Z][A-Za-z0-9]*-D\d+)/.exec(t);
  return m ? m[1] : null;
};

mkdirSync(OUT, { recursive: true });
const summary = [];
for (const n of ROUNDS) {
  const rel = `corpus/lessons/round-${n}-verifier-spotcheck.md`;
  const committed = show(REV, rel);
  const worktree = readFileSync(`${LANE}/${rel}`, 'utf8');
  const c67 = items67(committed);
  const v1 = routedItems(committed);
  const heads = routedHeads(committed);
  const rec = {
    round: n,
    rev: REV,
    spotcheck: rel,
    committed_equals_worktree: committed === worktree,
    counter_items67: {
      section_count: c67.sections.length,
      section_headings: heads,
      item_count: c67.items.length,
      items: c67.items.map((t, k) => ({ k: k + 1, routedId: labelOf(t), words: t.trim().split(/\s+/).filter(Boolean).length, text: t })),
      section_text: c67.sections.map((sec) => sec.map((x) => (x.fence ? `[fence]${x.l}` : x.l)).join('\n')),
    },
    v1_routedItems: { found: v1.found, item_count: v1.items.length },
    parsers_agree: v1.found && v1.items.length === c67.items.length,
  };
  writeFileSync(`${OUT}/round-${n}-items.json`, JSON.stringify(rec, null, 2) + '\n');
  summary.push({ n, sections: c67.sections.length, items: c67.items.length, v1: v1.items.length, agree: rec.parsers_agree });
}
console.log(JSON.stringify(summary));
console.log('total items', summary.reduce((a, s) => a + s.items, 0));
