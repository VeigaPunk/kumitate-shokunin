#!/usr/bin/env node
// CONTROL GENERATOR (frozen pre-data, round 88): derive the "worktree" forgery of ANY
// receipt-bind candidate mechanically. It rewrites the body of `function blobAt(lane, rev, rel)`
// so the instrument bytes come from the lane WORKTREE (`<lane>/<rel>`) instead of
// `git cat-file blob <rev>:<rel>`; everything else in the candidate is left byte-identical
// apart from two private imports added after the shebang. This is the round-87 critic's
// `cand-a-worktree` applied to whatever instrument is integrated, so the integrated v2
// instrument is scored against its own worktree twin, not only against v1's.
//
//   node make-worktree-variant.mjs <candidate.mjs> <out.mjs>
// exit 0 written; 3 REFUSED (the candidate has no `function blobAt(lane, rev, rel) {` with a
// balanced body — the frozen interface the v2 instrument must keep); 64 usage.
import { readFileSync, writeFileSync } from 'node:fs';

const [src, dst] = process.argv.slice(2);
if (!src || !dst) { console.log('MAKE_WORKTREE_VARIANT: USAGE <candidate.mjs> <out.mjs>'); process.exit(64); }
const text = readFileSync(src, 'utf8');
const head = 'function blobAt(lane, rev, rel) {';
const at = text.indexOf(head);
if (at < 0) { console.log('MAKE_WORKTREE_VARIANT: REFUSED NO_BLOBAT'); process.exit(3); }
let depth = 0; let end = -1;
for (let i = at + head.length - 1; i < text.length; i += 1) {
  if (text[i] === '{') depth += 1;
  else if (text[i] === '}') { depth -= 1; if (depth === 0) { end = i; break; } }
}
if (end < 0) { console.log('MAKE_WORKTREE_VARIANT: REFUSED UNBALANCED'); process.exit(3); }
const body = `${head}\n  // WORKTREE FORGERY (probe88 control): bytes from disk, not from the revision.\n  try { return __wtRead(__wtJoin(lane, rel)); } catch { return null; }\n}`;
let outText = text.slice(0, at) + body + text.slice(end + 1);
const imports = "import { readFileSync as __wtRead } from 'node:fs';\nimport { join as __wtJoin } from 'node:path';\n";
outText = outText.startsWith('#!') ? outText.replace(/^#!.*\n/, (m) => m + imports) : imports + outText;
writeFileSync(dst, outText);
console.log(`MAKE_WORKTREE_VARIANT: WROTE ${dst}`);
