import { readFileSync } from 'node:fs';

const LIVE = '/tmp/kumitate-r63/K63R2ReviewQuoteArxivA/live.html';
const probeSrc = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/probe/topology63-probe.mjs', 'utf8');
const nm = /const norm = \(s\) =>[\s\S]*?\.trim\(\);/.exec(probeSrc);
const norm = eval('(' + nm[0].replace(/^const norm = /, '').replace(/;\s*$/, '') + ')');

const raw = readFileSync(LIVE).toString('utf8');
const hay = norm(raw);

const allIdx = (s) => { const r = []; let i = hay.indexOf(s); while (i >= 0) { r.push(i); i = hay.indexOf(s, i + 1); } return r; };

const H = {};
for (const s of ['3.2 Agentic Tasks and Benchmarks', '4.1 Setup', '4.2 Main Results', '4.3 Scaling', '5 Limitations', 'Critical Threshold']) {
  H[s] = allIdx(s);
  console.log(`HEADING "${s}" occurrences=${H[s].length} at=${H[s].join(',')}`);
  const last = H[s][H[s].length - 1];
  if (last >= 0) console.log(`  last CTX: ...${hay.slice(Math.max(0, last - 40), last + 70)}...`);
}

// body slices from LAST occurrences
const i41 = H['4.1 Setup'].at(-1), i42 = H['4.2 Main Results'].at(-1), i43 = H['4.3 Scaling'].at(-1);
const i5 = H['5 Limitations'].at(-1), iC3 = H['Critical Threshold'].at(-1);
const body42 = i42 >= 0 && i43 > i42 ? hay.slice(i42, i43) : null;
const body43 = i43 >= 0 && i5 > i43 ? hay.slice(i43, i5) : null;
const bodyC3 = iC3 >= 0 ? hay.slice(iC3, Math.min(hay.length, iC3 + 6000)) : null;
console.log(`body42=${body42 ? body42.length : 'BAD'} body43=${body43 ? body43.length : 'BAD'} bodyC3=${bodyC3 ? bodyC3.length : 'BAD'}`);

const chk = (name, body, nums) => {
  if (!body) { console.log(`${name}: BAD SLICE`); return; }
  const absent = nums.filter((n) => !body.includes(n));
  console.log(`${name} absent: ${absent.join(', ') || '(none — all present)'}`);
};
chk('4.2', body42, ['+80.8', '0.631', '0.349', '+57', '+9.2', '+0.2', '+5.6', '-1.2', '-11', '+6', '-70.0', '-50.3', '-41.5', '-39.1', '+1.7', '0.350', '-19.2', '0.278', '-2.1', '-14.9', 'exceeds 45%', 'negative returns', 'coordination tax', '-0.3', '-58.7', '+77.2', '37.5', '4,800', 'up to nine', '87%', '54%', '20%']);
chk('4.3', body43, ['87%', '54%', '20%', 'coordination tax', 'tool-rich', 'amplif', '1.0', '4.4', '5.1', '7.8', '17.2', 'up to nine', '-0.236', '0.004', '-0.096', '0.002']);
chk('C.3', bodyC3, ['0.40', 'critical domain complexity', 'PlanCraft']);

const ctx = (name, body, needle, pre, post) => {
  if (!body) return;
  const j = body.indexOf(needle);
  if (j < 0) { console.log(`${name} CTX ${needle}: ABSENT`); return; }
  console.log(`${name} CTX [${needle}]: ...${body.slice(Math.max(0, j - pre), j + post)}...`);
};
ctx('4.2', body42, 'Finance Agent', 200, 500);
ctx('4.2', body42, 'PlanCraft', 200, 500);
ctx('4.2', body42, 'Terminal-Bench', 200, 500);
ctx('4.2', body42, 'exceeds 45%', 260, 240);
ctx('4.2', body42, '-0.3', 260, 240);
ctx('4.3', body43, 'coordination tax', 260, 300);
ctx('4.3', body43, '87%', 260, 260);
ctx('C.3', bodyC3, '0.40', 300, 300);

// whole-doc checks for the headline numbers
for (const n of ['-58.7', '+77.2', '37.5', 'heterogeneity']) {
  const i = hay.indexOf(n);
  console.log(`DOC "${n}" @${i}: ${i >= 0 ? '...' + hay.slice(Math.max(0, i - 160), i + 200) + '...' : 'ABSENT'}`);
}
// four variants named?
for (const v of ['Independent', 'Centralized', 'Decentralized', 'Hybrid']) {
  console.log(`variant "${v}" normed count=${hay.split(v).length - 1}`);
}
// raw byte offsets of body headings (tolerant to span tags)
for (const [tag, re] of [['4.1 Setup', /4\.1\s*(?:<[^>]+>\s*)?Setup/g], ['4.2 Main Results', /4\.2\s*(?:<[^>]+>\s*)?Main\s+Results/g], ['4.3 Scaling', /4\.3\s*(?:<[^>]+>\s*)?Scaling/g]]) {
  const hits = [];
  let m;
  while ((m = re.exec(raw))) hits.push(Buffer.byteLength(raw.slice(0, m.index), 'utf8'));
  console.log(`RAW-BYTES "${tag}": ${hits.join(', ')}`);
}
// Figure 1 caption position vs 4.1 body heading
console.log(`caption-quote raw bytes: Q2=183470 Q3=183677 Q4=184486; Q1(4.1 body)=185162`);
