import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const quotes = [
 '协作拓扑类型，当前仅支持 `coordinator`。',
 '编队条目列表，1-20 个。传空数组表示清空编队。',
 '条目类型：`agent`（引用另一个 Agent）或 `self`（coordinator 自身，编队中最多一个）。',
 '被引用的智能体 ID，`type=agent` 时必填（最长 64 字符）',
 '被引用的智能体版本号，`type=agent` 时可选（>=1，不传取最新）',
 '不配置 `multiagent` 或编队为空时，智能体按单智能体运行。',
 '表示清空编队，智能体回退为单智能体运行',
];
const urls = [
 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md',
 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent',
];
for (const u of urls) {
  const r = spawnSync('curl', ['-fsSL','--max-time','90','--retry','2','-A','Mozilla/5.0 (kumitate-topology63)', u], { maxBuffer: 128*1024*1024 });
  console.log('URL', u, 'exit', r.status, 'bytes', r.stdout.length);
  if (r.status !== 0) continue;
  const t = norm(r.stdout);
  for (const q of quotes) {
    const nq = norm(q);
    const count = t.split(nq).length - 1;
    console.log('   ', t.includes(nq) ? 'FOUND  ' : 'MISSING', 'count=' + count, '|', q);
  }
}
