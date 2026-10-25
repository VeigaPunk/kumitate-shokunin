import { readFileSync } from 'node:fs';

const CAP = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html';
const LIVE = '/tmp/kumitate-r63/K63R2ReviewQuoteArxivA/live.html';

// verbatim copy of the frozen counter's norm() (topology63-probe.mjs)
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
  .replace(/"|&#34;/g, '"').replace(/&#39;|&#x27;|'/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

// offset-tracking equivalent: emits identical output to norm() but records, for
// each output char, the raw string index it came from.
function normTrack(rawStr) {
  const out = [];
  const map = [];
  const isSp = (ch) => /\s/.test(ch);
  const emit = (ch, at) => {
    if (isSp(ch)) { if (out.length && isSp(out[out.length - 1])) return; out.push(' '); map.push(at); return; }
    out.push(ch); map.push(at);
  };
  const ENT = [
    [/^&nbsp;/, ' '], [/^&#160;/, ' '], [/^&/, '&'], [/^</, '<'], [/^>/, '>'],
    [/^"/, '"'], [/^&#34;/, '"'], [/^&#39;/, "'"], [/^&#x27;/i, "'"], [/^'/, "'"],
  ];
  let i = 0;
  const n = rawStr.length;
  while (i < n) {
    const rest = rawStr.slice(i);
    let m;
    if ((m = /^<script[\s\S]*?<\/script>|^<style[\s\S]*?<\/style>/i.exec(rest))) { emit(' ', i); i += m[0].length; continue; }
    if (rest[0] === '<') {
      const close = rawStr.indexOf('>', i);
      if (close >= 0) { emit(' ', i); i = close + 1; continue; }
      emit(' ', i); i += 1; continue;
    }
    let decoded = null;
    for (const [re, rep] of ENT) { if ((m = re.exec(rest))) { decoded = rep; break; } }
    if (decoded !== null) { emit(decoded, i); i += m[0].length; continue; }
    const c = rest[0];
    let rep = null;
    if (c === '\u2018' || c === '\u2019') rep = "'";
    else if (c === '\u201c' || c === '\u201d') rep = '"';
    else if (c === '\u2013' || c === '\u2014') rep = '-';
    else if (c === '`') rep = null;
    else if ((c === '*' || c === '_') && rawStr[i + 1] === c) { i += 2; continue; }
    else rep = c;
    if (rep !== null) emit(rep, i);
    i += 1;
  }
  const kept = [];
  for (let k = 0; k < out.length; k++) kept.push(map[k]);
  let s = out.join('');
  let drop = 0;
  while (drop < kept.length && isSp(s[drop])) drop += 1;
  while (kept.length && isSp(s[s.length - 1])) { s = s.slice(0, -1); kept.pop(); }
  return { hay: s, map: kept };
}

const QUOTES = [
  'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
  'Finance Agent demonstrates the strongest multi-agent benefits, with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)',
  'PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)',
  'Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%)',
];

function analyze(rawStr, rawBuf, label) {
  const ref = norm(rawStr);
  const { hay, map } = normTrack(rawStr);
  console.log(`== ${label} ==`);
  console.log(`normTrack==norm: ${hay === ref}`);
  console.log(`raw bytes=${rawBuf.length} chars=${rawStr.length} normed chars=${hay.length}`);
  for (const q of QUOTES) {
    const nq = norm(q);
    const words = q.trim().split(/\s+/).length;
    const i = hay.indexOf(nq);
    if (i < 0) {
      let lo = 0, hi = nq.length;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (hay.indexOf(nq.slice(0, mid)) >= 0) lo = mid; else hi = mid - 1; }
      const pre = nq.slice(0, lo);
      const pi = pre ? hay.indexOf(pre) : -1;
      console.log(`MISS words=${words} normLen=${nq.length} prefix=${lo} "${pre}" at ${pi}`);
      if (pi >= 0) console.log(`CTX: ...${hay.slice(Math.max(0, pi - 120), pi + pre.length + 260)}...`);
      continue;
    }
    const charStart = map[i];
    const charEndIncl = i + nq.length - 1 < map.length ? map[i + nq.length - 1] : rawStr.length - 1;
    const byteStart = Buffer.byteLength(rawStr.slice(0, charStart), 'utf8');
    const byteEnd = Buffer.byteLength(rawStr.slice(0, charEndIncl + 1), 'utf8');
    const before = rawStr.slice(0, charStart);
    let sec = '(none)', secId = '(none)';
    const hre = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
    let hm, lastH = null;
    while ((hm = hre.exec(before))) lastH = hm;
    if (lastH) sec = norm(lastH[2]);
    const sre = /<section\b[^>]*\bid="([^"]+)"[^>]*>/gi;
    let sm, lastS = null;
    while ((sm = sre.exec(before))) lastS = sm;
    if (lastS) secId = lastS[1];
    // self-check: re-norm a raw window around the offset and confirm the quote is inside
    const wA = Math.max(0, charStart - 400), wB = Math.min(rawStr.length, charEndIncl + 400);
    const winOk = norm(rawStr.slice(wA, wB + 1)).includes(nq);
    console.log(`FOUND words=${words} charOff=${charStart} byteOff=${byteStart}..${byteEnd} section="${sec}" sectionId=${secId} windowSelfCheck=${winOk}`);
    console.log(`CTX: ...${hay.slice(Math.max(0, i - 240), i + nq.length + 320)}...`);
  }
}

for (const [label, path] of [['CAPTURE', CAP], ['LIVE', LIVE]]) {
  const buf = readFileSync(path);
  analyze(buf.toString('utf8'), buf, label);
}

// header facts: title, authors, dateline/version date
const raw = readFileSync(LIVE).toString('utf8');
const t = /<title>([\s\S]*?)<\/title>/i.exec(raw);
console.log('TITLE:', t ? norm(t[1]) : '(none)');
const dl = /arXiv:2512\.08296v3[^<]{0,120}/g; let dm;
while ((dm = dl.exec(raw))) console.log('DATELINE-HIT @', dm.index, ':', norm(dm[0]));
const au = /<div class="ltx_authors"[\s\S]{0,600}?<\/div>/i.exec(raw);
console.log('AUTHORS:', au ? norm(au[0]).slice(0, 400) : '(none)');
console.log('has "08 Apr 2026":', raw.includes('08 Apr 2026'));
