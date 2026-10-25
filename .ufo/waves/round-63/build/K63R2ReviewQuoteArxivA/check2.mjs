import { readFileSync } from 'node:fs';

const PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/probe/topology63-probe.mjs';
const LIVE = '/tmp/kumitate-r63/K63R2ReviewQuoteArxivA/live.html';
const CAP = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html';

// extract the TRUE norm() from the frozen probe (avoids transcription drift)
const probeSrc = readFileSync(PROBE, 'utf8');
const nm = /const norm = \(s\) =>[\s\S]*?\.trim\(\);/.exec(probeSrc);
if (!nm) { console.log('NORM-EXTRACT: FAILED'); process.exit(9); }
const norm = eval('(' + nm[0].replace(/^const norm = /, '').replace(/;\s*$/, '') + ')');
console.log('NORM-EXTRACT: ok, src chars=' + nm[0].length);

// my earlier typed copy for divergence diagnosis
const normTyped = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
  .replace(/"|&#34;/g, '"').replace(/&#39;|&#x27;|'/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const QUOTES = [
  'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
  'Finance Agent demonstrates the strongest multi-agent benefits, with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)',
  'PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)',
  'Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%)',
];

for (const [label, path] of [['LIVE', LIVE], ['CAPTURE', CAP]]) {
  const raw = readFileSync(path).toString('utf8');
  const rawBuf = readFileSync(path);
  const hay = norm(raw);
  console.log(`== ${label} == normed chars=${hay.length}`);
  for (const q of QUOTES) {
    const nq = norm(q);
    const words = q.trim().split(/\s+/).length;
    const hits = [];
    let i = hay.indexOf(nq);
    while (i >= 0) { hits.push(i); i = hay.indexOf(nq, i + 1); }
    // raw byte offsets via whitespace-tolerant regex on the raw bytes
    const re = new RegExp(q.split(/(\s+)/).map((w) => (w.trim() ? w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '\\s+')).join(''), 'g');
    const rawHits = [];
    let rm;
    while ((rm = re.exec(raw))) {
      const b = Buffer.byteLength(raw.slice(0, rm.index), 'utf8');
      const win = norm(raw.slice(Math.max(0, rm.index - 120), rm.index + rm[0].length + 120));
      rawHits.push(`${b}..${b + Buffer.byteLength(rm[0], 'utf8')}(selfCheck=${win.includes(nq)})`);
    }
    console.log(`QUOTE words=${words} normHits=${hits.length} normAt=${hits.join(',') || 'NONE'} rawByte=${rawHits.join(' | ') || 'NO-CONTIGUOUS-MATCH'}`);
    console.log(`  :: ${q}`);
  }
  // '260 experiments' count in normed text
  { let c = 0, i = hay.indexOf('260 experiments'); while (i >= 0) { c++; i = hay.indexOf('260 experiments', i + 1); } console.log(`'260 experiments' normed count=${c}`); }
  // divergence typed vs true
  const typed = normTyped(raw);
  if (typed !== hay) {
    let d = 0; while (d < Math.min(typed.length, hay.length) && typed[d] === hay[d]) d++;
    console.log(`TYPED-NORM-DIVERGES at ${d}: true=...${hay.slice(Math.max(0, d - 60), d + 80)}... typed=...${typed.slice(Math.max(0, d - 60), d + 80)}...`);
    let c = 0; for (let k = 0; k < Math.min(typed.length, hay.length); k++) if (typed[k] !== hay[k]) c++;
    console.log(`TYPED-NORM diff chars (aligned-prefix scan)=${c}`);
  } else console.log('TYPED-NORM identical to true norm');
}

// headings named by the entry header
const hay = norm(readFileSync(LIVE).toString('utf8'));
for (const s of ['3.2 Agentic Tasks and Benchmarks', '4.1 Setup', '4.2 Main Results', '4.3 Scaling', '5 Limitations', 'C.3 Critical Threshold']) {
  const i = hay.indexOf(s);
  console.log(`HEADING "${s}" -> ${i >= 0 ? 'present@' + i : 'ABSENT'}`);
}

// §4.2 body number checks
const i42 = hay.indexOf('4.2 Main Results');
const i43 = hay.indexOf('4.3 Scaling');
if (i42 >= 0 && i43 > i42) {
  const body = hay.slice(i42, i43);
  const absent = [];
  for (const num of ['+80.8', '0.631', '0.349', '+57', '+9.2', '+0.2', '+5.6', '-1.2', '-11', '+6', '-70.0', '-50.3', '-41.5', '-39.1', '+1.7', '0.350', '-19.2', '0.278', '-2.1', '-14.9', 'exceeds 45%', 'negative returns', 'coordination tax', '-0.3', '-58.7', '+77.2', '37.5', '4,800', 'up to nine', '87%', '54%']) {
    if (!body.includes(num)) absent.push(num);
  }
  console.log(`4.2-body absent numbers: ${absent.join(', ') || '(none — all present)'}`);
  const j = body.indexOf('exceeds 45%');
  if (j >= 0) console.log(`4.2 CTX 45%: ...${body.slice(Math.max(0, j - 220), j + 240)}...`);
  const k = body.indexOf('Finance Agent demonstrates');
  if (k >= 0) console.log(`4.2 CTX Finance: ...${body.slice(Math.max(0, k - 120), k + 400)}...`);
  const l = body.indexOf('PlanCraft exhibits');
  if (l >= 0) console.log(`4.2 CTX PlanCraft: ...${body.slice(Math.max(0, l - 120), l + 400)}...`);
  const m = body.indexOf('Terminal-Bench shows');
  if (m >= 0) console.log(`4.2 CTX TerminalBench: ...${body.slice(Math.max(0, m - 120), m + 400)}...`);
} else console.log(`4.2 slice bounds bad: i42=${i42} i43=${i43}`);

// authors
const raw = readFileSync(LIVE).toString('utf8');
const a = /class="ltx_authors"/i.exec(raw);
console.log(`AUTHORS-BLOCK: ${a ? norm(raw.slice(a.index, a.index + 900)).slice(0, 380) : 'no ltx_authors class'}`);
const kim = raw.match(/Kim[^<]{0,60}/g);
console.log(`KIM-HITS: ${kim ? kim.slice(0, 3).map((s) => norm(s)).join(' || ') : 'none'}`);
