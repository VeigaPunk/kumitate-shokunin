import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const S = join(process.env.HOME, '.omp', 'agent', 'sessions', '-Projects-shokunin', '2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b');
const userText = (r) => { const c = r.message && r.message.content; if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n'); return ''; };
function parse(p) { const t = { user: '', ts: null, id: null, yielded: false, exit: null };
  for (const line of readFileSync(p, 'utf8').split('\n')) { if (!line) continue; let r; try { r = JSON.parse(line); } catch { continue; }
    if (r.type === 'session' && !t.ts) { t.ts = r.timestamp; t.id = r.id; }
    else if (r.type === 'message' && r.message) { if (r.message.role === 'user' && !t.user) t.user = userText(r);
      else if (r.message.role === 'assistant' && Array.isArray(r.message.content)) for (const x of r.message.content) if (x && x.type === 'toolCall' && x.name === 'yield') t.yielded = true; }
    else if (r.type === 'custom' && r.customType === 'session_exit') t.exit = (r.data && r.data.kind) || '?'; }
  return t; }
const lcp = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i += 1; return i; };
const lcs = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i += 1; return i; };
const [root, round, wave, seat] = process.argv.slice(2);
const d = JSON.parse(readFileSync(join(root, '.ufo', 'waves', `round-${round}`, `${wave}-dispatch.json`), 'utf8'));
const t = d.taskCall.tasks.find((x) => x.name === seat);
const ctxHead = d.taskCall.context.trim().slice(0, 200);
const tail = (s, n) => s.trim().slice(-n);
const expected = `${d.taskCall.context}\n\n# Seat ${seat}\n${t.task}`;
const files = readdirSync(S).filter((f) => f.endsWith('.jsonl')).filter((f) => { const s = f.slice(0, -6); return s === seat || (s.startsWith(seat + '-') && /^\d+$/.test(s.slice(seat.length + 1))); });
console.log('seat', seat, 'taskLen', t.task.length, 'expectedLen', expected.length);
for (const f of files.sort()) {
  const tr = parse(join(S, f));
  const p = lcp(tr.user, expected), s = lcs(tr.user, expected);
  console.log(` ${f} ts=${tr.ts} len=${tr.user.length} ctxHead=${tr.user.includes(ctxHead)} tail=${tr.user.includes(tail(String(t.task), 120))} marker=${tr.user.includes(`# Seat ${seat}\n`)} lcp=${p} lcs=${s} yield=${tr.yielded} exit=${tr.exit}`);
  if (p < 120) console.log('    userHead', JSON.stringify(tr.user.slice(0, 160)));
  else if (tr.user.length - p - s > 0) console.log('    userMiddle', JSON.stringify(tr.user.slice(p, Math.min(p + 160, tr.user.length - s))), '...expMiddle', JSON.stringify(expected.slice(p, Math.min(p + 160, expected.length - s))));
}
