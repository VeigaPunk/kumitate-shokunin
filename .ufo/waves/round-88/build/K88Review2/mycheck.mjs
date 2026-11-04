#!/usr/bin/env node
// K88Review2 independent checker (no code shared with scripts/receipt-bind.mjs or the probe).
// node mycheck.mjs <lane> <dir> <rev> [--force-rev]
// Per *.txt receipt in <dir>: token 2 of cmd= names the instrument; bytes come from
// `git -C <lane> cat-file blob <R>:<path>` where R = receipt rev= (unless --force-rev) else <rev>;
// an absolute token outside <lane> is read from disk (counted ext). Compares sha256 with tool_sha256=.
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const [lane0, dir, rev, flag] = process.argv.slice(2);
if (!lane0 || !dir || !/^[0-9a-f]{40}$/.test(rev || '')) { console.log('usage: lane dir rev40 [--force-rev]'); process.exit(64); }
const lane = path.resolve(lane0);
const force = flag === '--force-rev';
const t = { matched: 0, mismatched: 0, unchecked: 0, unresolved: 0, ext: 0, ambiguous: 0 };
const rows = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  const p = path.join(dir, f);
  if (lstatSync(p).isSymbolicLink()) { rows.push(`${f} SYMLINK`); continue; }
  const lines = readFileSync(p, 'utf8').split('\n');
  const get = (k) => lines.filter((l) => l.startsWith(`${k}=`)).map((l) => l.slice(k.length + 1));
  const cmd = get('cmd'); const dg = get('tool_sha256'); const rv = get('rev');
  if (cmd.length > 1 || dg.length > 1 || rv.length > 1) { t.ambiguous += 1; rows.push(`${f} AMBIGUOUS`); continue; }
  if (!cmd.length || !dg.length) { t.unchecked += 1; rows.push(`${f} UNCHECKED`); continue; }
  const tok = cmd[0].trim().split(/\s+/)[1] || '';
  const R = !force && rv.length ? rv[0].trim() : rev;
  let bytes = null; let how;
  const abs = path.isAbsolute(tok) ? tok : path.resolve(lane, tok);
  const rel = path.relative(lane, abs);
  if (path.isAbsolute(tok) && (rel.startsWith('..') || path.isAbsolute(rel))) {
    how = 'disk'; t.ext += 1;
    try { bytes = readFileSync(abs); } catch { bytes = null; }
  } else if (rel.startsWith('..')) {
    how = 'escape';
  } else {
    how = `${R.slice(0, 8)}:${rel}`;
    try { bytes = execFileSync('git', ['-C', lane, 'cat-file', 'blob', `${R}:${rel}`], { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }); } catch { bytes = null; }
  }
  if (bytes === null) { t.unresolved += 1; rows.push(`${f} UNRESOLVED ${how}`); continue; }
  const h = createHash('sha256').update(bytes).digest('hex');
  const ok = h === dg[0].trim();
  t[ok ? 'matched' : 'mismatched'] += 1;
  rows.push(`${f} ${ok ? 'MATCH' : 'MISMATCH'} ${how} got=${h.slice(0, 12)} claimed=${dg[0].trim().slice(0, 12)}`);
}
for (const r of rows) console.log(`ROW ${r}`);
console.log(`MYCHECK mode=${force ? 'force-rev' : 'receipt-rev'} matched=${t.matched} mismatched=${t.mismatched} unchecked=${t.unchecked} unresolved=${t.unresolved} ambiguous=${t.ambiguous} external=${t.ext}`);
process.exit(t.mismatched + t.unchecked + t.unresolved + t.ambiguous === 0 ? 0 : 1);
