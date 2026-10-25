import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const S = join(process.env.HOME, '.omp', 'agent', 'sessions', '-Projects-shokunin', '2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b');
const [root, round, wave] = process.argv.slice(2);
const d = JSON.parse(readFileSync(join(root, '.ufo', 'waves', `round-${round}`, `${wave}-dispatch.json`), 'utf8'));
const files = readdirSync(S).filter((f) => f.endsWith('.jsonl'));
const userText = (r) => { const c = r.message && r.message.content; if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n'); return ''; };
function parse(p) { const t = { user: '', ts: null, id: null, yielded: false, exit: null };
  for (const line of readFileSync(p, 'utf8').split('\n')) { if (!line) continue; let r; try { r = JSON.parse(line); } catch { continue; }
    if (r.type === 'session' && !t.ts) { t.ts = r.timestamp; t.id = r.id; }
    else if (r.type === 'message' && r.message) { if (r.message.role === 'user' && !t.user) t.user = userText(r);
      else if (r.message.role === 'assistant' && Array.isArray(r.message.content)) for (const x of r.message.content) if (x && x.type === 'toolCall' && x.name === 'yield') t.yielded = true; }
    else if (r.type === 'custom' && r.customType === 'session_exit') t.exit = (r.data && r.data.kind) || '?'; }
  return t; }
const ctxHead = d.taskCall.context.trim().slice(0, 200);
const tail = (s, n) => s.trim().slice(-n);
const hist = {}; const batches = {}; let matchedTotal = 0; const multi = [];
const ids = new Set(); let allClean = true;
for (const t of d.taskCall.tasks) {
  const cands = files.filter((f) => { const s = f.slice(0, -6); return s === t.name || (s.startsWith(t.name + '-') && /^\d+$/.test(s.slice(t.name.length + 1))); });
  const ms = [];
  for (const f of cands) { const tr = parse(join(S, f));
    if (tr.user.includes(ctxHead) && tr.user.includes(tail(String(t.task), 120))) ms.push({ f, ts: tr.ts, id: tr.id, y: tr.yielded, e: tr.exit }); }
  hist[ms.length] = (hist[ms.length] || 0) + 1; matchedTotal += ms.length;
  if (ms.length > 1) multi.push({ seat: t.name, n: ms.length, files: ms.map((m) => `${m.f}@${String(m.ts).slice(11, 19)}`), clean: ms.every((m) => m.y && m.e === 'normal') });
  for (const m of ms) { ids.add(m.id); const k = String(m.ts).slice(0, 16); batches[k] = (batches[k] || 0) + 1; if (!(m.y && m.e === 'normal')) allClean = false; }
}
console.log(JSON.stringify({ wave: `${root.split('/').pop()} r${round} ${wave}`, seats: d.taskCall.tasks.length, matchedTranscripts: matchedTotal, distinctSessionIds: ids.size, filesPerSeatHistogram: hist, multiMatchedSeats: multi.length, everyDuplicateClean: allClean, startBatchesByMinute: Object.fromEntries(Object.entries(batches).sort()) }));
console.log('sample', JSON.stringify(multi.slice(0, 3)));
