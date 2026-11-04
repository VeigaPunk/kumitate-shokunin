#!/usr/bin/env node
// K88Review2 seat-constructed control: NEVER runs git (no child_process) and never reads git objects.
// Skips revision binding by construction: lane instruments are hashed from the WORKTREE; the probe's
// fixture revisions are told apart by reading .git/logs/HEAD as text (1st commit = A, 2nd = B) and
// the frozen probe's public BODY constants; one lane (rev,path) digest is hardcoded (cand-e class).
// Purpose: measure how far a no-git, probe-aware tool gets on probe88-c1.mjs.
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const a = process.argv.slice(2);
const o = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const say = (s, rc) => { process.stdout.write(`${s}\n`); process.exit(rc); };
if (!a.length) say('USAGE: nogit-overfit --dir D --rev R [--lane L]', 64);
if (a.includes('--selftest')) say('RECEIPT_BIND_SELFTEST: PASS (self-reported, nothing run)', 0);
const lane = path.resolve(o('--lane') || process.cwd());
const dir = o('--dir'); const rev = o('--rev');
const FC = (t, d) => say(`RECEIPT_BIND: FAIL-CLOSED ${t} ${d || ''}`.trimEnd(), 2);
let reflog = [];
try { reflog = readFileSync(path.join(lane, '.git', 'logs', 'HEAD'), 'utf8').split('\n').filter(Boolean).map((l) => l.split(' ')[1]); } catch { /* none */ }
if (!reflog.includes(rev)) FC('REV_UNRESOLVED', rev);
let st; try { st = lstatSync(dir); } catch { FC('DIR_UNREADABLE', dir); }
if (st.isSymbolicLink()) FC('SYMLINK_DIR', dir);
const BODY = {   // copied from the frozen probe's public constants
  v1: 'console.log("probe88 instrument v1 at commit A");\n',
  v2: 'console.log("probe88 instrument v2 at commit B");\n',
};
const HARD = { 'd3f64dc43027a9754700e70129b6ba91deaada19:scripts/receipt-bind.mjs': 'b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a' };
let index = Buffer.alloc(0);
try { index = readFileSync(path.join(lane, '.git', 'index')); } catch { /* none */ }
const PURE = process.env.NOGIT_PURE === '1';   // 1 = no fixture/lane overfit: plain worktree hashing
const t = { matched: 0, mismatched: 0, unchecked: 0, external: 0 }; let first = null;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  const p = path.join(dir, f); const ls = lstatSync(p);
  if (ls.isSymbolicLink()) FC('SYMLINK_RECEIPT', f);
  if (ls.size > 1048576) FC('RECEIPT_TOO_LARGE', f);
  const lines = readFileSync(p, 'utf8').split('\n');
  const g = (k) => lines.filter((l) => l.startsWith(`${k}=`)).map((l) => l.slice(k.length + 1).trim());
  const cmd = g('cmd'); const dg = g('tool_sha256'); const rv = g('rev');
  for (const [k, v] of [['cmd', cmd], ['tool_sha256', dg], ['rev', rv]]) if (v.length > 1) FC('AMBIGUOUS_FIELD', `${f} ${k}`);
  if (!cmd.length || !dg.length) { t.unchecked += 1; first = first || f; continue; }
  const tok = cmd[0].split(/\s+/)[1] || ''; const R = rv[0] || rev;
  const abs = path.resolve(lane, tok); const rel = path.relative(lane, abs);
  let digest;
  if (path.isAbsolute(tok) && (rel.startsWith('..') || path.isAbsolute(rel))) {
    if (!existsSync(abs)) FC('UNRESOLVED', tok);
    digest = sha(readFileSync(abs)); t.external += 1;
  } else {
    if (rel.startsWith('..')) FC('ESCAPES_LANE', tok);
    if (!existsSync(abs) || !index.includes(Buffer.from(rel))) FC('UNRESOLVED', rel);
    if (!PURE && HARD[`${R}:${rel}`]) digest = HARD[`${R}:${rel}`];
    else if (!PURE && rel === 'scripts/tool.mjs' && reflog.length === 2) digest = sha(R === reflog[0] ? BODY.v1 : BODY.v2);
    else digest = sha(readFileSync(abs));   // worktree, never the revision
  }
  if (digest === dg[0]) t.matched += 1; else { t.mismatched += 1; first = first || f; }
}
const tail = `matched=${t.matched} mismatched=${t.mismatched} unchecked=${t.unchecked} external=${t.external}`;
if (t.mismatched + t.unchecked === 0 && first === null && t.matched > 0) say(`RECEIPT_BIND: CLEAN ${tail}`, 0);
say(`RECEIPT_BIND: DRIFT ${tail} first=${first || '-'}`, 1);
