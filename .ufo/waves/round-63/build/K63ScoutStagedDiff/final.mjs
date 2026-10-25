import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const CAP = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/';
const d = '/tmp/kumitate-r63/K63ScoutStagedDiff/';
const capB = norm(readFileSync(CAP + 'bailian-managed-agents-multiagent.md', 'utf8'));
const capA = norm(readFileSync(CAP + 'arxiv-2512.08296v3.html', 'utf8'));
const liveB = norm(readFileSync(d + 'bail_live.html', 'utf8'));  // row URL S200 = HTML page
const liveA = norm(readFileSync(d + 'abs.html', 'utf8'));        // row URL S202 = abs page

const V = (label, q, cap, live) => {
  const n = norm(q);
  const inCap = cap.includes(n), inLive = live.includes(n);
  const verdict = inCap ? 'SUPPORTED' : 'UNSUPPORTED';
  console.log(`${verdict.padEnd(11)} | cap=${inCap ? 'HIT ' : 'MISS'} live=${inLive ? 'HIT ' : 'MISS'} | ${label} | ${JSON.stringify(n.slice(0, 92))}`);
  return { label, verdict, inCap, inLive };
};
const rows = [];
console.log('===== S200 claims =====');
rows.push(V('S200-1 quote as written in entry', '多智能体协作让一个 coordinator（协调者）智能体编排一组成员智能体', capB, liveB));
rows.push(V('S200-1b same quote, capture spacing', '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体', capB, liveB));
rows.push(V('S200-2 type only coordinator', '协作拓扑类型，当前仅支持 `coordinator`。', capB, liveB));
rows.push(V('S200-3 roster 1-20', '编队条目列表，1-20 个。', capB, liveB));
rows.push(V('S200-4 empty array clears roster', '传空数组表示清空编队。', capB, liveB));
rows.push(V('S200-4b empty array -> single agent', '传空数组 `"agents": []` 表示清空编队，智能体回退为单智能体运行。', capB, liveB));
rows.push(V('S200-5 self at most one', '`self`（coordinator 自身，编队中最多一个）', capB, liveB));
rows.push(V('S200-6 version default latest', '`version` | 被引用的智能体版本号，`type=agent` 时可选（>=1，不传取最新）', capB, liveB));
rows.push(V('S200-7 no multiagent -> single agent', '不配置 `multiagent` 或编队为空时，智能体按单智能体运行。', capB, liveB));
rows.push(V('S200-8 multiagent field', '在创建或更新 Agent 时通过 `multiagent` 字段配置编队。', capB, liveB));
console.log('\n===== S202 claims =====');
rows.push(V('S202-1 260-experiments quote', 'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures', capA, liveA));
rows.push(V('S202-2 five architectures', 'five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid)', capA, liveA));
rows.push(V('S202-3 260 configurations', '260 configurations spanning six agentic benchmarks', capA, liveA));
rows.push(V('S202-4 Finance +57..+80.8', 'with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)', capA, liveA));
rows.push(V('S202-5 BrowseComp -35', 'with independent agents catastrophically underperforming relative to SAS (-35%) while more structured coordination achieves modest gains', capA, liveA));
rows.push(V('S202-6 Workbench -11..+6', 'Workbench shows marginal effects (from -11 to +6%)', capA, liveA));
rows.push(V('S202-7 SWE -15..-2', 'SWE-bench Verified shows slight degradation across all MAS architectures (from -15% to -2%)', capA, liveA));
rows.push(V('S202-8 45% figure caption form', 'consistent with high single-agent baselines ( > 45%) for most models', capA, liveA));
rows.push(V('S202-8b 45% body-prose form', 'most models achieve single-agent baselines above 45%, leaving limited room for coordination gains', capA, liveA));
rows.push(V('S202-9 Terminal +2/-19/2 tools', 'Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%), reflecting the low tool count (2 tools) where coordination overhead is less justified', capA, liveA));
rows.push(V('S202-9b Terminal body +1.7', 'shows marginal gains ($+1.7\%$, 0.350)', capA, liveA));
rows.push(V('S202-10 PlanCraft -70..-39', 'PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)', capA, liveA));
rows.push(V('S202-11 overhead r·n (entry form)', 'r·n', capA, liveA));
rows.push(V('S202-11b overhead r ⋅ n (capture form)', 'r ⋅ n', capA, liveA));
rows.push(V('S202-12 parallelization row', 'Parallelization Factor 1 1 n n n n n n n', capA, liveA));
rows.push(V('S202-13 slope 0.023', 'the maximum difference in architecture-specific scaling slopes between any two LLM families is Δ max = 0.023', capA, liveA));
console.log('\n===== summary =====');
console.log('supported:', rows.filter(r => r.verdict === 'SUPPORTED').length, '/', rows.length);
console.log('unsupported:', rows.filter(r => r.verdict === 'UNSUPPORTED').map(r => r.label).join(' ; '));
console.log('cap-hit but live-MISS:', rows.filter(r => r.inCap && !r.inLive).map(r => r.label).join(' ; '));
