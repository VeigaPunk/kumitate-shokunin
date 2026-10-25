#!/usr/bin/env node
// check-s196-live.mjs — seat K63R2ReviewQuoteBail, round 63 w2.
// Re-opens the Bailian page LIVE and attacks every S196 claim in
// corpus/knowledge/multi-agent-coordinator-topologies.md and corpus/SOURCES.md row S196.
// norm() is EXTRACTED AT RUNTIME from the frozen counter
// .ufo/waves/round-63/probe/topology63-probe.mjs — no transcription, no edits.
// Exit nonzero on any miss.
import { readFileSync } from 'node:fs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const LIVE = process.argv[2] || '/tmp/kumitate-r63/K63R2ReviewQuoteBail/live.md';

const probeSrc = readFileSync(`${LANE}/.ufo/waves/round-63/probe/topology63-probe.mjs`, 'utf8');
const nm = probeSrc.match(/const norm = \(s\) =>[\s\S]*?\.trim\(\);/);
if (!nm) { console.error('FATAL: norm() not found in frozen probe'); process.exit(2); }
const norm = eval('(' + nm[0].slice('const norm = '.length).replace(/;\s*$/, '') + ')');

const live = norm(readFileSync(LIVE));
const entry = readFileSync(`${LANE}/corpus/knowledge/multi-agent-coordinator-topologies.md`, 'utf8');

// Extract bullets exactly as the frozen counter does (T4 parser).
const bullets = [];
{
  const at = entry.search(/^##\s+Located quotes\s*$/m);
  const rest = entry.slice(at).split('\n').slice(1);
  for (const l of rest) {
    if (/^##\s/.test(l)) break;
    const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
    if (m) bullets.push({ id: m[1], q: m[2] });
  }
}
const s196 = bullets.filter((b) => b.id === 'S196');

let fail = 0;
const say = (ok, tag, detail) => { console.log(`${ok ? 'VERIFIED' : 'NOT-FOUND'} ${tag} :: ${detail}`); if (!ok) fail = 1; };

// 1. Every S196 Located-quotes bullet occurs in the LIVE bytes (norm both sides, T5 semantics).
console.log(`# S196 bullets found in entry: ${s196.length}`);
for (const b of s196) {
  const words = b.q.trim().split(/\s+/).length;
  const ok = live.includes(norm(b.q));
  say(ok && words <= 25, 'bullet', `"${b.q}" (words=${words})`);
}

// 2. Every S196 claim in the entry's prose + roster table, located with exact Chinese text.
const claims = [
  ['type-coordinator-only', '协作拓扑类型，当前仅支持 coordinator。'],
  ['roster-1-20-empty-clears', '编队条目列表，1-20 个。传空数组表示清空编队。'],
  ['self-at-most-one', '条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。'],
  ['id-required-max-64', '被引用的智能体 ID，type=agent 时必填（最长 64 字符）；type=self 时不可传。'],
  ['version-ge1-default-latest', '被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）；type=self 时不可传。'],
  ['absent-or-empty-single-agent', '不配置 multiagent 或编队为空时，智能体按单智能体运行。'],
  ['note-empty-array-reverts', '传空数组 "agents": [] 表示清空编队，智能体回退为单智能体运行。'],
  ['roster-attached-to-agent', '在创建或更新 Agent 时通过 multiagent 字段配置编队。'],
];
for (const [tag, phrase] of claims) say(live.includes(norm(phrase)), `claim:${tag}`, phrase);

// 3. SOURCES.md row S196 anchor quote (the h1 blockquote subtitle).
say(live.includes(norm('通过 coordinator 编队，让一个协调者智能体编排多个成员智能体协同完成任务。')),
  'anchor:subtitle-blockquote', '通过 coordinator 编队，让一个协调者智能体编排多个成员智能体协同完成任务。');

// 4. Limits bullet says S196 "states no fan-out performance, no cost, no failure behaviour" —
//    verify by absence in the live bytes.
const absent = ['性能', '成本', '费用', '价格', '失败', '重试', '超时', '并发', '吞吐', '延迟'];
const present = absent.filter((w) => live.includes(w));
say(present.length === 0, 'limits:no-performance-cost-failure',
  present.length ? `page DOES contain: ${present.join(', ')}` : `none of ${absent.join(',')} occurs in live bytes`);

// 5. The page's own example id, for the opaque-id finding.
console.log(`# page example id present: ${live.includes('agent_researcher') ? 'yes (agent_researcher)' : 'no'}`);

process.exit(fail);
