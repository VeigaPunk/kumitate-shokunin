#!/usr/bin/env node
// Exact copy of the frozen probe's norm() (topology63-probe.mjs lines 66-76) + substring checks.
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const capA = norm(readFileSync(process.argv[2]));
const liveA = norm(readFileSync(process.argv[3]));
const capB = norm(readFileSync(process.argv[4]));
const liveB = norm(readFileSync(process.argv[5]));

const A = [
  'architectures without centralized verification tend to propagate errors more than those with centralized coordination',
  'Across 260 configurations spanning six agentic benchmarks, five canonical architectures',
  'The framework identifies the best-performing architecture for 87% of held-out configurations',
  'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
  'architecture-task alignment determines collaborative success',
  'Relative performance change compared to single-agent baseline ranges from',
  'a coordination yields diminishing returns once single-agent baselines exceed certain performance',
  'Agent effectiveness depends on alignment between coordination and task structure, and that mismatched coordination degrades the performance.',
];
const B = [
  '通过 coordinator 编队，让一个协调者智能体编排多个成员智能体协同完成任务。',
  '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。',
  '不配置 multiagent 或编队为空时，智能体按单智能体运行。',
  '协作拓扑类型，当前仅支持 coordinator。',
  '编队条目列表，1-20 个。传空数组表示清空编队。',
  '条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。',
  '被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）；type=self 时不可传。',
];
let bad = 0;
const words = (q) => q.trim().split(/\s+/).length;
for (const q of A) {
  const c = capA.includes(norm(q)); const l = liveA.includes(norm(q));
  if (!c || !l) bad += 1;
  console.log(`S197 cap=${c} live=${l} tokens=${words(q)} ${q.slice(0, 70)}`);
}
for (const q of B) {
  const c = capB.includes(norm(q)); const l = liveB.includes(norm(q));
  if (!c || !l) bad += 1;
  console.log(`S196 cap=${c} live=${l} tokens=${words(q)} chars=${[...q].length} ${q.slice(0, 60)}`);
}
console.log(`QUOTE_CHECK: ${bad === 0 ? 'PASS' : 'FAIL'} misses=${bad}`);
process.exit(bad === 0 ? 0 : 1);
