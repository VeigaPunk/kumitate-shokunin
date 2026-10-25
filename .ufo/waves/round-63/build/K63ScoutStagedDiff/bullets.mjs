import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const d = '/tmp/kumitate-r63/K63ScoutStagedDiff/';
const capB = norm(readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md', 'utf8'));
const liveB = norm(readFileSync(d + 'bail_live.html', 'utf8'));          // row URL = HTML page
const capA = norm(readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html', 'utf8'));
const liveA = norm(readFileSync(d + 'abs.html', 'utf8'));                // row URL = abs page
const liveA_html = norm(readFileSync(d + 'arxiv_live_v3.html', 'utf8')); // alternative row URL = html v3

const B = [
  '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体',
  '不配置 multiagent 或编队为空时，智能体按单智能体运行。',
  '编队条目列表，1-20 个。',
  '传空数组表示清空编队。',
  '传空数组 "agents": [] 表示清空编队，智能体回退为单智能体运行。',
  '在创建或更新 Agent 时通过 multiagent 字段配置编队。',
  '不传取最新',
];
const A_abs = [
  'Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families',
  'five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid)',
  '260 configurations spanning six agentic benchmarks',
  'The resulting model achieves a cross-validated R2 = 0.373 across all six benchmarks',
];
const A_html = [
  'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
  'from +57% to +80.8%',
  'from -70% to -39%',
  'from -15% to -2%',
  'from -11 to +6%',
  'Independent achieves marginal gains (+2%) while Centralized degrades (-19%)',
  'the maximum difference in architecture-specific scaling slopes between any two LLM families is',
  '0.023',
  'Comm. Overhead',
  'Parallelization Factor',
  'r ⋅ n',
  'p ⋅ m',
];
const rep = (label, q, cap, live, liveAlt) => {
  const n = norm(q);
  const w = n.trim().split(/\s+/).length;
  const c = cap.includes(n);
  const l = live.includes(n);
  const la = liveAlt ? liveAlt.includes(n) : null;
  console.log(`${c ? 'cap ' : 'CAP-'} ${l ? 'live' : 'LIVE-'} ${la === null ? '    ' : (la ? 'alt ' : 'ALT-')} words=${String(w).padStart(2)} | ${label} | ${JSON.stringify(n.slice(0, 78))}`);
};
console.log('== S200 bullets: capture(.md) vs live(row URL = HTML page) ==');
for (const q of B) rep('S200', q, capB, liveB, null);
console.log('\n== S202 bullets: capture(html v3) vs live(row URL = ABS page) ==');
for (const q of A_abs) rep('S202-absURL', q, capA, liveA, liveA_html);
console.log('\n== S202 body-only quotes: live on html-v3 URL? ==');
for (const q of A_html) rep('S202-body', q, capA, liveA, liveA_html);
