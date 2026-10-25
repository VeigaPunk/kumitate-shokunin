import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const LIVE = '/tmp/kumitate-r63/K63R2ReviewQuoteArxivA/live.html';
const probeSrc = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/probe/topology63-probe.mjs', 'utf8');
const nm = /const norm = \(s\) =>[\s\S]*?\.trim\(\);/.exec(probeSrc);
const norm = eval('(' + nm[0].replace(/^const norm = /, '').replace(/;\s*$/, '') + ')');

const raw = readFileSync(LIVE).toString('utf8');
const hay = norm(raw);

// 1) both '260 experiments' occurrences with context
let i = hay.indexOf('260 experiments'), n = 0;
while (i >= 0) { n++; console.log(`260experiments#${n} @${i}: ...${hay.slice(Math.max(0, i - 200), i + 240)}...`); i = hay.indexOf('260 experiments', i + 1); }

// 2) 'domain complexity' and 'four ... variants' wording
for (const s of ['domain complexity', 'four MAS', 'four multi-agent', 'four canonical', 'four coordination']) {
  const j = hay.indexOf(s);
  console.log(`DOC "${s}" -> ${j >= 0 ? '@' + j + ': ...' + hay.slice(Math.max(0, j - 140), j + 200) + '...' : 'ABSENT'}`);
}

// 3) figure id containing the caption quotes (raw byte 183470)
const charIdx = 42762; // Q2 normed index; map back roughly by searching raw for the caption start
const figRe = /<figure[^>]*id="([^"]+)"[^>]*>/gi;
let fm, lastFig = null;
while ((fm = figRe.exec(raw.slice(0, 183470)))) lastFig = fm;
console.log(`FIGURE before Q2: id=${lastFig ? lastFig[1] : 'none'}`);
const capLbl = hay.lastIndexOf('Figure 1', 42762);
console.log(`caption label CTX: ...${hay.slice(Math.max(0, capLbl - 60), capLbl + 320)}...`);

// 4) pin cross-check for S197
const pins = JSON.parse(readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/source-captures.json', 'utf8'));
const s197 = pins.captures.filter((c) => c.sourceId === 'S197');
for (const c of s197) {
  const b = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/' + c.path);
  const sha = createHash('sha256').update(b).digest('hex');
  console.log(`PIN S197 path=${c.path} pinSha=${c.sha256} pinBytes=${c.bytes} actualSha=${sha} actualBytes=${b.length} match=${sha === c.sha256 && b.length === c.bytes}`);
}
