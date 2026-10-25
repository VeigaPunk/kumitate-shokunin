import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const base = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture';
const A = norm(readFileSync(base + '/arxiv-2512.08296v3.html', 'utf8'));
const B = norm(readFileSync(base + '/bailian-managed-agents-multiagent.md', 'utf8'));

const checks = [
  ['S200 quote as written', B, '多智能体协作让一个 coordinator（协调者）智能体编排一组成员智能体'],
  ['S200 quote spaced variant', B, '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体'],
  ['S200 1-20', B, '编队条目列表，1-20 个'],
  ['S200 empty array note', B, '传空数组 "agents": [] 表示清空编队，智能体回退为单智能体运行。'],
  ['S200 type only coordinator', B, '协作拓扑类型，当前仅支持 coordinator。'],
  ['S200 self at most one', B, 'self（coordinator 自身，编队中最多一个）'],
  ['S200 version default latest', B, '被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）'],
  ['S200 no multiagent single agent', B, '不配置 multiagent 或编队为空时，智能体按单智能体运行。'],
  ['S202 260 experiments quote', A, 'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures'],
  ['S202 five architectures', A, 'five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid)'],
  ['S202 260 configurations', A, '260 configurations spanning six agentic benchmarks'],
  ['S202 Finance range', A, 'with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)'],
  ['S202 BrowseComp -35', A, 'with independent agents catastrophically underperforming relative to SAS (-35%) while more structured coordination achieves modest gains'],
  ['S202 Workbench range', A, 'Workbench shows marginal effects (from -11 to +6%)'],
  ['S202 SWE range', A, 'SWE-bench Verified shows slight degradation across all MAS architectures (from -15% to -2%)'],
  ['S202 SWE 45%', A, 'consistent with high single-agent baselines ( > 45%) for most models'],
  ['S202 Terminal +2/-19', A, 'Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%), reflecting the low tool count (2 tools) where coordination overhead is less justified'],
  ['S202 PlanCraft range', A, 'PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)'],
  ['S202 comm overhead row', A, 'Comm. Overhead 0 1 d ⋅ n r ⋅ n r ⋅ n + p ⋅ m'],
  ['S202 par factor row', A, 'Parallelization Factor 1 n n n n'],
  ['S202 slope 0.023', A, 'the maximum difference in architecture-specific scaling slopes between any two LLM families is Δ max = 0.023'],
  ['S202 m def', A, 'm = average peer requests per round'],
  ['S202 central orch rounds', A, 'A single orchestrator coordinates r rounds across n sub-agents'],
  ['S202 entry formula literal r·n', A, 'r·n'],
  ['S202 entry formula literal r·n + p·m', A, 'r·n + p·m'],
  ['S202 literal 45%', A, '45%'],
  ['S202 literal +2%', A, '+2%'],
  ['S202 literal -19%', A, '-19%'],
  ['S202 literal -35%', A, '-35%'],
  ['S202 literal -11', A, '-11'],
  ['S202 literal +6%', A, '+6%'],
  ['S202 literal -15%', A, '-15%'],
  ['S202 literal -2%', A, '-2%'],
  ['S202 literal -70%', A, '-70%'],
  ['S202 literal -39%', A, '-39%'],
  ['S202 literal +57%', A, '+57%'],
  ['S202 literal +80.8%', A, '+80.8%'],
  ['S202 literal 0.023', A, '0.023'],
  ['S202 literal 260 experiments', A, '260 experiments'],
];
for (const [name, hay, needle] of checks) {
  const n = norm(needle);
  console.log((hay.includes(n) ? 'HIT ' : 'MISS') + ' | ' + name + ' | ' + JSON.stringify(n.slice(0, 90)));
}
// section anchoring
const sec = (h, marker) => { const i = h.indexOf(marker); return i; };
console.log('\n--- bailian section anchors (normalized offsets) ---');
for (const m of ['## 编队配置', '编队配置', 'agents 条目字段', '多智能体协作']) console.log(m, sec(B, m));
console.log('\n--- arxiv section anchors ---');
for (const m of ['4.1 Setup Benchmarks', 'Setup Benchmarks', 'Experiments & Results', 'Table 2: Architectural comparison']) console.log(m, sec(A, m));
