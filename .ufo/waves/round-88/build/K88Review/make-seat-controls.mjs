#!/usr/bin/env node
// K88Review seat-constructed controls (round 88 kill rule): each is the integrated instrument
// (scripts/receipt-bind.mjs at 0ff3562f) with ONE claimed behaviour skipped by construction.
//   node make-seat-controls.mjs <integrated.mjs> <outdir>
// Every rewrite asserts its anchor occurs exactly once, so a silent no-op rewrite is impossible.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [src, outDir] = process.argv.slice(2);
const base = readFileSync(src, 'utf8');
function sub(text, from, to, name) {
  const n = text.split(from).length - 1;
  if (n !== 1) { console.log(`SEAT_CONTROLS: REFUSED ${name} anchor count=${n}`); process.exit(3); }
  return text.replace(from, () => to); // function replacer: `$` patterns in `to` stay literal
}
const controls = {
  // revision binding skipped: a receipt without rev= is bound at lane HEAD, never at --rev.
  'ctl-head-default': sub(base,
    "  if (!revOk(rev)) throw new FailClosed('REV_UNRESOLVED', `--rev ${rev} is not a commit in ${lane}`);\n",
    "  if (!revOk(rev)) throw new FailClosed('REV_UNRESOLVED', `--rev ${rev} is not a commit in ${lane}`);\n  rev = git(lane, ['rev-parse', 'HEAD']).stdout.trim(); // CONTROL: judge HEAD, not --rev\n",
    'head-default'),
  // revision binding skipped: a path clean in the worktree is hashed from the WORKTREE.
  'ctl-worktree-when-clean': sub(base,
    "function blobAt(lane, rev, rel) {\n",
    "function blobAt(lane, rev, rel) {\n  { // CONTROL: worktree bytes whenever the path is tracked and clean\n    const st = git(lane, ['status', '--porcelain', '--', rel]);\n    const tracked = git(lane, ['ls-files', '--error-unmatch', '--', rel]).status === 0;\n    if (st.status === 0 && st.stdout === '' && tracked) { try { return readFileSync(join(lane, rel)); } catch { /* fall through */ } }\n  }\n",
    'worktree-when-clean'),
  // RECEIPT_TOO_LARGE boundary skipped: limit 2000000 instead of 1048576.
  'ctl-limit-2mb': sub(base, 'const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 2000000; // CONTROL', 'limit'),
  // "refused before it is read" skipped: the whole receipt is read, then its length is judged.
  'ctl-size-after-read': sub(
    sub(base,
      "    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);\n",
      '', 'size-pre'),
    "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n",
    "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n    if (Buffer.byteLength(text) > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} read whole (CONTROL)`);\n",
    'size-post'),
  // AMBIGUOUS_FIELD skipped for non-adjacent duplicates (an APPENDED cmd= line stays first-wins).
  'ctl-adjacent-dup': sub(base,
    "      const all = [...text.matchAll(new RegExp(`^${key}=(.*)$`, 'gm'))];\n      if (all.length > 1)",
    "      const all = [...text.matchAll(new RegExp(`^${key}=(.*)$`, 'gm'))];\n      if (new RegExp(`^${key}=.*\\n${key}=`, 'm').test(text)) // CONTROL: adjacent duplicates only\n      if (all.length > 1)",
    'adjacent-dup'),
  // ESCAPES_LANE skipped unless the token literally starts with ../ (scripts/../../x stays external).
  'ctl-dotdot-prefix': sub(base,
    "      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n      rel = lr.rel;\n",
    "      if (!lr.inside && instrument.startsWith('../')) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n      if (lr.inside) rel = lr.rel; else fromDisk = true; // CONTROL\n",
    'dotdot'),
};
for (const [name, text] of Object.entries(controls)) {
  writeFileSync(join(outDir, `${name}.mjs`), text);
  console.log(`SEAT_CONTROLS: WROTE ${name}.mjs`);
}
