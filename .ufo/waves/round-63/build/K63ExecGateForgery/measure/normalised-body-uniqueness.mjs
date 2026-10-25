import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename } from 'node:path';
const files = [];
const walk = (d, depth) => { let e = []; try { e = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const x of e) { const p = join(d, x.name); if (x.isDirectory()) { if (depth < 4) walk(p, depth + 1); } else if (x.name.endsWith('.jsonl')) files.push(p); } };
walk(process.argv[2], 0);
const norm = (p) => {
  const stem = basename(p, '.jsonl');
  const rows = readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const out = rows.map((r) => {
    const c = { ...r };
    delete c.id; delete c.parentId; delete c.timestamp; delete c.updatedAt; delete c.runtime;
    if (c.type === 'session') { delete c.id; delete c.cwd; delete c.parentSession; }
    if (c.type === 'custom' && c.customType === 'system-prompt-digest') delete c.data;
    let s = JSON.stringify(c);
    return s.split(stem).join('@');
  });
  return createHash('sha256').update(out.join('\n')).digest('hex');
};
const seen = new Map(); let dup = 0;
for (const f of files) {
  let yielded = false, exitKind = null;
  const rows = readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  for (const r of rows) {
    if (r.type === 'custom' && r.customType === 'session_exit') exitKind = (r.data && r.data.kind) || 'unknown';
    if (r.type === 'message' && r.message && r.message.role === 'assistant' && Array.isArray(r.message.content)) for (const c of r.message.content) if (c && c.type === 'toolCall' && c.name === 'yield') yielded = true;
  }
  if (!(exitKind === 'normal' && yielded)) continue;
  const h = norm(f);
  if (seen.has(h)) { dup += 1; if (dup <= 5) console.log('DUP', basename(seen.get(h)), basename(f)); }
  else seen.set(h, f);
}
console.log('finished=' + seen.size + ' duplicateNormalised=' + dup);
