#!/usr/bin/env node
// K88Mutation: derive mutants of receipt-bind.mjs (pristine = blob 0ff3562f:scripts/receipt-bind.mjs).
// Each mutant is one exact-match string substitution (asserted to hit exactly once) applied to the
// pristine bytes; writes mutants/<id>.mjs + mutants/<id>.diff-spec.json. Never touches scripts/.
//   node make-mutants.mjs <pristine.mjs> <outdir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [src, outDir] = process.argv.slice(2);
const P = readFileSync(src, 'utf8');

const L_ESC = "      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n";
const L_SYMDIR = "  if (dirStat.isSymbolicLink()) throw new FailClosed('SYMLINK_DIR', dir);\n";
const L_READDIR = "  try { entries = readdirSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }\n";
const L_SIZE = "    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);\n";
const L_READ = "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n";
const L_AMB = "      if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD', `${file} carries ${all.length} ${key}= lines`);\n";
const FIELD_V2 = `    const field = (key) => {
      const all = [...text.matchAll(new RegExp(\`^\${key}=(.*)$\`, 'gm'))];
${L_AMB}      return all.length ? all[0][1].trim() : null;
    };
`;

const M = [
  ['M01-del-escapes-lane', 'ESCAPES_LANE check deleted', [[L_ESC, '']]],
  ['M02-del-symlink-dir', 'SYMLINK_DIR check deleted', [[L_SYMDIR, '']]],
  ['M03-del-too-large', 'RECEIPT_TOO_LARGE check deleted', [[L_SIZE, '']]],
  ['M04-del-ambiguous', 'AMBIGUOUS_FIELD check deleted (first-wins by fallthrough)', [[L_AMB, '']]],
  ['M05-size-gt-to-ge', 'size check > flipped to >=', [['st.size > MAX_RECEIPT_BYTES', 'st.size >= MAX_RECEIPT_BYTES']]],
  ['M06-size-gt-to-lt', 'size check > flipped to <', [['st.size > MAX_RECEIPT_BYTES', 'st.size < MAX_RECEIPT_BYTES']]],
  ['M07-amb-gt1-to-gt2', 'AMBIGUOUS length>1 flipped to >2', [['all.length > 1', 'all.length > 2']]],
  ['M08-amb-gt1-to-ge1', 'AMBIGUOUS length>1 flipped to >=1', [['all.length > 1', 'all.length >= 1']]],
  ['M09-esc-negated', 'ESCAPES_LANE condition negated (!lr.inside -> lr.inside)', [["if (!lr.inside) throw new FailClosed('ESCAPES_LANE'", "if (lr.inside) throw new FailClosed('ESCAPES_LANE'"]]],
  ['M10-symdir-negated', 'SYMLINK_DIR condition negated', [['if (dirStat.isSymbolicLink())', 'if (!dirStat.isSymbolicLink())']]],
  ['M11-symdir-after-readdir', 'SYMLINK_DIR check moved after readdir', [[L_SYMDIR + L_READDIR, L_READDIR + L_SYMDIR]]],
  ['M12-esc-v1-external', 'ESCAPES_LANE branch replaced by v1 external branch (relative outside lane -> disk + external=)',
    [[L_ESC + '      rel = lr.rel;\n', '      if (lr.inside) rel = lr.rel; else fromDisk = true;\n']]],
  ['M13-blobat-head', 'blobAt reads HEAD instead of rev', [['`${rev}:${rel}`], { buffer: true });\n  return r.status', '`HEAD:${rel}`], { buffer: true });\n  return r.status']]],
  ['M14-receipt-rev-ignored', 'receipt rev= ignored (validated but never adopted)', [['      receiptRev = revField;\n', '']]],
  ['M15-field-v1-first-wins', 'field() restored to v1 single String.match (first-wins)',
    [[FIELD_V2, "    const field = (key) => {\n      const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'));\n      return m ? m[1].trim() : null;\n    };\n"]]],
  ['M16-size-x2', 'MAX_RECEIPT_BYTES x2 (2097152)', [['const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 2097152;']]],
  ['M17-size-minus1', 'MAX_RECEIPT_BYTES off-by-one low (1048575)', [['const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 1048575;']]],
  ['M18-size-plus1', 'MAX_RECEIPT_BYTES off-by-one high (1048577)', [['const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 1048577;']]],
  ['M19-field-last-wins', 'AMBIGUOUS check deleted and field() last-wins', [[L_AMB + '      return all.length ? all[0][1].trim() : null;', '      return all.length ? all[all.length - 1][1].trim() : null;']]],
  ['M20-amb-cmd-only', 'AMBIGUOUS check only for cmd= (rev=/tool_sha256= first-wins)', [['if (all.length > 1) throw', "if (all.length > 1 && key === 'cmd') throw"]]],
  ['M21-amb-distinct-values', 'AMBIGUOUS only when duplicated values differ (equal duplicates pass)', [['if (all.length > 1) throw', 'if (new Set(all.map((x) => x[1].trim())).size > 1) throw']]],
  ['M22-esc-also-absolute', 'ESCAPES_LANE also raised for absolute tokens outside the lane', [['if (lr.inside) rel = lr.rel; else fromDisk = true;', "if (lr.inside) rel = lr.rel; else throw new FailClosed('ESCAPES_LANE', instrument);"]]],
  ['M23-size-after-read', 'size check moved after the whole receipt is read', [[L_SIZE + '\n    let text;\n' + L_READ, '\n    let text;\n' + L_READ + L_SIZE]]],
  ['M24-size-on-chars', 'size check uses text.length after read (UTF-16 units, not bytes)', [[L_SIZE + '\n    let text;\n' + L_READ, '\n    let text;\n' + L_READ + L_SIZE.replace(/st\.size/g, 'text.length')]]],
  ['M25-receipt-rev-unverified', 'receipt rev= adopted without revOk check (unknown rev -> UNRESOLVED, not REV_UNRESOLVED)', [["      if (!revOk(receiptRev)) throw new FailClosed('REV_UNRESOLVED', `${file} rev=${receiptRev} is not a commit in ${lane}`);\n", '']]],
];

const index = [];
for (const [id, desc, subs] of M) {
  let t = P;
  for (const [a, b] of subs) {
    const n = t.split(a).length - 1;
    if (n !== 1) { console.error(`MAKE_MUTANTS: ${id} anchor hits=${n}`); process.exit(3); }
    t = t.replace(a, () => b);
  }
  if (t === P) { console.error(`MAKE_MUTANTS: ${id} no-op`); process.exit(3); }
  writeFileSync(join(outDir, `${id}.mjs`), t);
  index.push({ id, desc });
}
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`MAKE_MUTANTS: WROTE ${index.length}`);
