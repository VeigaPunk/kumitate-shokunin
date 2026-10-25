import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
const files = [];
const walk = (d, depth) => { let e = []; try { e = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const x of e) { const p = join(d, x.name); if (x.isDirectory()) { if (depth < 4) walk(p, depth + 1); } else if (x.name.endsWith('.jsonl')) files.push(p); } };
walk(process.argv[2], 0);
const m = (p) => {
  const buf = readFileSync(p, 'utf8'); const stem = basename(p, '.jsonl');
  const rows = []; for (const l of buf.split('\n')) if (l) { try { rows.push(JSON.parse(l)); } catch { rows.push({ type: '__bad__' }); } }
  const ids = new Set(); let idCov = 0, rtCov = 0, dangling = 0;
  const calls = new Map(); const res = []; const ts = [];
  let yielded = false, exitKind = null, init = 0, initTools = 0, title = 0, digest = 0, subRole = 0, assistants = 0, sessCwd = 0;
  for (const r of rows) {
    if (typeof r.id === 'string') { ids.add(r.id); idCov += 1; }
    if (r.runtime && typeof r.runtime.version === 'string') rtCov += 1;
    if (r.type === 'session') { if (r.cwd && r.parentSession) sessCwd += 1; }
    if (r.type === 'session_init') { init += 1; if (Array.isArray(r.tools) && r.tools.length) initTools += 1; }
    if (r.type === 'title') title += 1;
    if (r.type === 'custom' && r.customType === 'system-prompt-digest') digest += 1;
    if (r.type === 'model_change' && r.role === `subagent:${stem}`) subRole += 1;
    if (r.type === 'custom' && r.customType === 'session_exit') exitKind = (r.data && r.data.kind) || 'unknown';
    if (r.type === 'message' && r.message) { const mm = r.message;
      if (mm.role === 'assistant') { assistants += 1; if (Array.isArray(mm.content)) for (const c of mm.content) if (c && c.type === 'toolCall') { calls.set(c.id, c.name); if (c.name === 'yield') yielded = true; } }
      else if (mm.role === 'toolResult') res.push({ id: mm.toolCallId || mm.tool_call_id, name: mm.toolName }); }
    const t = r.timestamp; if (typeof t === 'string') ts.push(t);
  }
  for (const r of rows) if (typeof r.parentId === 'string' && !ids.has(r.parentId)) dangling += 1;
  const orphan = res.filter((x) => !calls.has(x.id)).length;
  const nameMismatch = res.filter((x) => calls.has(x.id) && calls.get(x.id) !== x.name).length;
  const paired = new Set(res.map((x) => x.id).filter((id) => calls.has(id))).size;
  const parsed = ts.filter((t) => Number.isFinite(Date.parse(t)));
  const span = parsed.length > 1 ? Date.parse(parsed[parsed.length - 1]) - Date.parse(parsed[0]) : 0;
  return { file: p, stem, bytes: Buffer.byteLength(buf), rows: rows.length, idCov, rtCov, dangling, sessCwd, init, initTools, title, digest, subRole,
    assistants, calls: calls.size, results: res.length, paired, orphan, nameMismatch, tsN: ts.length, tsParsed: parsed.length,
    tsDistinct: new Set(ts).size, spanSec: Math.round(span / 1000), yielded, exitKind };
};
writeFileSync(process.argv[3], files.map((f) => { try { return m(f); } catch (e) { return { file: f, error: String(e && e.message) }; } }).map((o) => JSON.stringify(o)).join('\n') + '\n');
console.log('files=' + files.length);
