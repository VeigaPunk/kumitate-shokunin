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
const capB = norm(readFileSync(d + 'bail_live.html', 'utf8'));   // placeholder
const bailCap = norm(readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md', 'utf8'));
const bailLive = norm(readFileSync(d + 'bail_live.html', 'utf8'));
const arxCap = norm(readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html', 'utf8'));
const arxLive = norm(readFileSync(d + 'abs.html', 'utf8'));

const S200Q = [
  '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体',
  '多智能体协作让一个 coordinator（协调者）智能体编排一组成员智能体',
  '不配置 `multiagent` 或编队为空时，智能体按单智能体运行。',
  '不配置 multiagent 或编队为空时，智能体按单智能体运行。',
  '编队条目列表，1-20 个。',
  '传空数组表示清空编队。',
  '传空数组 "agents": [] 表示清空编队，智能体回退为单智能体运行。',
  '协作拓扑类型，当前仅支持 coordinator 。',
  '协作拓扑类型，当前仅支持 coordinator。',
  '条目类型： agent （引用另一个 Agent）或 self （coordinator 自身，编队中最多一个）。',
  'self（coordinator 自身，编队中最多一个）',
  '被引用的智能体版本号， type=agent 时可选（>=1，不传取最新）',
  '不传取最新',
  '在创建或更新 Agent 时通过 multiagent 字段配置编队。',
];
const S202Q = [
  'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
  'Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families',
  'five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid)',
  '260 configurations spanning six agentic benchmarks',
  'from +57% to +80.8%',
  'from -70% to -39%',
  'from -15% to -2%',
  'from -11 to +6%',
  'Independent achieves marginal gains (+2%) while Centralized degrades (-19%)',
  'with independent agents catastrophically underperforming relative to SAS (-35%)',
  'the maximum difference in architecture-specific scaling slopes between any two LLM families is',
  '0.023',
  'Comm. Overhead',
  'Parallelization Factor',
  'r ⋅ n',
  'r·n',
  'p ⋅ m',
  'p·m',
  'Δ max = 0.023',
];
const row = (label, q, cap, live) => {
  const n = norm(q);
  const c = cap.includes(n), l = live.includes(n);
  const both = c && l;
  console.log(`${both ? 'BOTH ' : c ? 'CAPONLY ' : l ? 'LIVEONLY ' : 'NEITHER '} | ${label} | ${JSON.stringify(n.slice(0, 70))}`);
};
console.log('--- S200: capture(.md) vs live(HTML page) ---');
for (const q of S200Q) row('S200', q, bailCap, bailLive);
console.log('\n--- S202: capture(html v3) vs live(abs page) ---');
for (const q of S202Q) row('S202', q, arxCap, arxLive);
