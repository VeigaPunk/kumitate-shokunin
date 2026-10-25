import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
const files = [];
const walk = (d, depth) => { let e = []; try { e = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const x of e) { const p = join(d, x.name); if (x.isDirectory()) { if (depth < 4) walk(p, depth + 1); } else if (x.name.endsWith('.jsonl')) files.push(p); } };
walk(process.argv[2], 0);
const hist = {}; const bad = [];
for (const f of files) {
  const rows = readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const calls = new Map(); const res = []; let yielded = false, exitKind = null;
  for (const r of rows) {
    if (r.type === 'custom' && r.customType === 'session_exit') exitKind = (r.data && r.data.kind) || 'unknown';
    if (r.type !== 'message' || !r.message) continue;
    const m = r.message;
    if (m.role === 'assistant' && Array.isArray(m.content)) for (const c of m.content) if (c && c.type === 'toolCall') { calls.set(c.id, c.name); if (c.name === 'yield') yielded = true; }
    if (m.role === 'toolResult') res.push(m.toolCallId || m.tool_call_id);
  }
  if (!(exitKind === 'normal' && yielded)) continue;
  const paired = new Set(res.filter((id) => calls.has(id))).size;
  const yieldCalls = [...calls.values()].filter((n) => n === 'yield').length;
  const deficit = calls.size - paired;
  const ok = paired >= 1 && deficit <= 1 + yieldCalls;
  const k = `deficit=${deficit},yield=${yieldCalls}`;
  hist[k] = (hist[k] || 0) + 1;
  if (!ok) bad.push(basename(f) + ` calls=${calls.size} paired=${paired} yield=${yieldCalls}`);
}
console.log('hist', JSON.stringify(Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 12)));
console.log('rule fails', bad.length, bad.slice(0, 5));
