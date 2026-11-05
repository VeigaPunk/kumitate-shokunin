#!/usr/bin/env node
/**
 * mutate.mjs — generate the K89Mutation mutant battery from the v3 candidate.
 *
 *   node mutate.mjs --src <candidate.mjs> --out <mutants-dir>
 *
 * Every mutant is a SINGLE-SITE literal/expression replacement that removes or weakens exactly ONE
 * claimed behaviour of contract `kumitate-receipt-bind-v3`. The generator asserts that each `find`
 * string occurs exactly once in the candidate (a replacement that matches zero or two sites is a
 * generator bug, not a mutant), writes `mutants/<id>.mjs`, and prints a manifest of what was
 * changed. Composite mutants (two sites) are marked `kind: "composite"` and never counted as
 * single-behaviour evidence.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const src = resolve(opt('--src', ''));
const outDir = resolve(opt('--out', ''));
if (!src || !outDir) {
  console.log('USAGE: mutate.mjs --src <candidate.mjs> --out <mutants-dir>');
  process.exit(64);
}
const source = readFileSync(src, 'utf8');
const sha = (b) => createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------------------------------------
// catalogue: each entry removes/weakens ONE behaviour. `sites` is a list of exact replacements.
const M = [];
const mut = (id, behaviour, kind, sites, note) => M.push({ id, behaviour, kind, sites, note: note || '' });

// --- argument / directory / default-revision arms (probe arms usage, dir-missing, rev-bad) ------
mut('usage-exit-zero', 'usage: a bare invocation is no longer a usage error', 'single', [
  ["if (args.dir === null) { errOut(`receipt-bind: --dir is required\\n\\n${USAGE}`); return 64; }",
    "if (args.dir === null) { errOut(`receipt-bind: --dir is required\\n\\n${USAGE}`); return 0; }"],
]);
mut('dir-missing-token-swap', 'DIR_UNREADABLE: a missing --dir is reported as RECEIPT_UNREADABLE', 'single', [
  ["try { dirStat = lstatSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }",
    "try { dirStat = lstatSync(dir); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }"],
]);
mut('rev-bad-default-off', 'REV_UNRESOLVED: an unresolvable default --rev is not refused up front', 'single', [
  ["if (!revOk(rev)) throw new FailClosed('REV_UNRESOLVED', `--rev ${rev} is not a commit in ${lane}`);",
    "if (false) throw new FailClosed('REV_UNRESOLVED', `--rev ${rev} is not a commit in ${lane}`);"],
]);

// --- realpath lane membership (v3 claim; probe arm alias-proc-root) ---------------------------
mut('realpath-abs-off', 'realpath membership: the token parent directory is not realpath-resolved', 'single', [
  ['try { absReal = join(realpathSync(dirname(abs)), basename(abs)); } catch { /* parent absent */ }',
    'try { absReal = join(dirname(abs), basename(abs)); } catch { /* parent absent */ }'],
]);
mut('realpath-lane-off', 'realpath membership: the LANE is not realpath-resolved', 'single', [
  ['try { laneReal = realpathSync(lane); } catch { /* keep the lexical path */ }',
    'try { laneReal = lane; } catch { /* keep the lexical path */ }'],
]);
mut('realpath-membership-lexical', 'realpath membership: membership judged on lexical lane/abs', 'single', [
  ['const lr = absReal !== null ? laneRel(laneReal, absReal) : laneRel(lane, abs);',
    'const lr = laneRel(lane, abs);'],
]);

// --- BOM tolerance (v3 claim; probe arm bom-rev) ---------------------------------------------
mut('bom-strip-off', 'BOM strip: a leading U+FEFF is left in the text', 'single', [
  ["text = text.replace(/^\\uFEFF/, '');", 'text = text;'],
]);
mut('bom-codepoint-swap', 'BOM strip: the stripped codepoint is wrong (U+FFFE)', 'single', [
  ["text = text.replace(/^\\uFEFF/, '');", "text = text.replace(/^\\uFFFE/, '');"],
]);

// --- mode-120000 instrument refusal (v3 claim; probe arm symlink-instrument) -----------------
mut('mode-literal-swap', 'SYMLINK_INSTRUMENT: the 120000 literal never matches', 'single', [
  ["if (mode === '120000') {", "if (mode === '120001') {"],
]);
mut('mode-check-disabled', 'SYMLINK_INSTRUMENT: the refusal is disabled', 'single', [
  ["if (mode === '120000') {", "if (mode === '120000' && false) {"],
]);
mut('realpath-final-component-followed', 'realpath membership: the final component is followed (in-lane symlink identity lost)', 'single', [
  ['join(realpathSync(dirname(abs)), basename(abs))', 'realpathSync(abs)'],
]);
mut('mode-read-at-head', 'SYMLINK_INSTRUMENT: mode read at HEAD, not the judged revision', 'single', [
  ["const lsTree = git(lane, ['ls-tree', receiptRev, '--', rel]);",
    "const lsTree = git(lane, ['ls-tree', 'HEAD', '--', rel]);"],
]);

mut('external-symlink-instrument-disabled', 'SYMLINK_INSTRUMENT: a symlinked external instrument is hashed through the link', 'single', [
  ["if (est.isSymbolicLink()) throw new FailClosed('SYMLINK_INSTRUMENT', `${file} external instrument is a symlink: ${abs}`);",
    "if (est.isSymbolicLink() && false) throw new FailClosed('SYMLINK_INSTRUMENT', `${file} external instrument is a symlink: ${abs}`);"],
]);

// --- receipt size limit (v2/v3 claim; probe arms oversize, limit-edge, limit-before-read) ----
mut('limit-doubled', 'size limit: MAX_RECEIPT_BYTES 1048576 -> 2097152', 'single', [
  ['const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 2097152;'],
]);
mut('limit-lstat-ge', 'size limit: pre-read check `>` -> `>=` (refuses the exact limit)', 'single', [
  ['if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed',
    'if (st.size >= MAX_RECEIPT_BYTES) throw new FailClosed'],
]);
mut('limit-lstat-lt', 'size limit: pre-read check `>` -> `<` (refuses every small receipt)', 'single', [
  ['if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed',
    'if (st.size < MAX_RECEIPT_BYTES) throw new FailClosed'],
]);
mut('limit-preread-disabled', 'size limit: the size is judged only after the receipt is opened', 'single', [
  ['if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed',
    'if (st.size > MAX_RECEIPT_BYTES && false) throw new FailClosed'],
]);
mut('limit-fstat-ge', 'size limit: descriptor check `>` -> `>=`', 'single', [
  ['if (fst.size > MAX_RECEIPT_BYTES) {', 'if (fst.size >= MAX_RECEIPT_BYTES) {'],
]);
mut('limit-fstat-disabled', 'size limit: the descriptor re-check after open is disabled', 'single', [
  ['if (fst.size > MAX_RECEIPT_BYTES) {', 'if (fst.size > MAX_RECEIPT_BYTES && false) {'],
]);

// --- AMBIGUOUS_FIELD (probe arms duplicate-field, dup-equal-field) ----------------------------
mut('dup-gt2', 'AMBIGUOUS_FIELD: only >2 duplicate lines are ambiguous', 'single', [
  ["if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD'",
    "if (all.length > 2) throw new FailClosed('AMBIGUOUS_FIELD'"],
]);
mut('dup-equal-tolerated', 'AMBIGUOUS_FIELD: equal-valued duplicates are tolerated', 'single', [
  ["if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD'",
    "if (new Set(all.map((m) => m[1])).size > 1) throw new FailClosed('AMBIGUOUS_FIELD'"],
]);
mut('dup-disabled', 'AMBIGUOUS_FIELD: first-wins parsing, no duplicate refusal', 'single', [
  ["if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD'",
    "if (all.length > 1 && false) throw new FailClosed('AMBIGUOUS_FIELD'"],
]);

// --- ESCAPES_LANE (probe arms escape-relative, escape-inner-dotdot) ---------------------------
mut('escape-negated', 'ESCAPES_LANE: the membership test is negated', 'single', [
  ["if (!lr.inside) throw new FailClosed('ESCAPES_LANE'",
    "if (lr.inside) throw new FailClosed('ESCAPES_LANE'"],
]);
mut('escape-token-swap', 'ESCAPES_LANE: the escape is reported as UNRESOLVED', 'single', [
  ["if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument",
    "if (!lr.inside) throw new FailClosed('UNRESOLVED', `${file} relative instrument"],
]);
mut('escape-downgraded', 'ESCAPES_LANE: an escaping token is bound instead of refused', 'single', [
  ["if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);",
    'if (!lr.inside) rel = lr.rel;'],
]);

// --- receipt rev= precedence (probe arms rev-receipt-wins, rev-receipt-negative) --------------
mut('rev-receipt-ignored', "receipt rev=: the receipt's own rev= is discarded", 'single', [
  ['receiptRev = revField;', 'receiptRev = rev;'],
]);
mut('rev-field-skipped', 'receipt rev=: the rev= field is never read', 'single', [
  ['if (revField !== null) {', 'if (revField !== null && false) {'],
]);
mut('rev-commit-check-off', "receipt rev=: a receipt rev= that is not a commit is not refused", 'single', [
  ["if (!revOk(receiptRev)) throw new FailClosed('REV_UNRESOLVED'",
    "if (false) throw new FailClosed('REV_UNRESOLVED'"],
]);

// --- byte source: the judged revision, never HEAD / the index / the worktree ------------------
mut('blob-head', 'byte source: the blob is read at HEAD instead of the judged revision', 'single', [
  ['bytes = blobAt(lane, receiptRev, rel);', "bytes = blobAt(lane, 'HEAD', rel);"],
]);
mut('blob-index', 'byte source: the blob is read from the index, not the judged revision', 'single', [
  ["const r = git(lane, ['cat-file', 'blob', `${rev}:${rel}`], { buffer: true });",
    "const r = git(lane, ['show', `:${rel}`], { buffer: true });"],
]);
mut('blob-worktree', 'byte source: the blob is read from the worktree on disk', 'single', [
  ['bytes = blobAt(lane, receiptRev, rel);', 'bytes = readFileSync(join(lane, rel));'],
]);

// --- other fail-closed boundaries and tallies ------------------------------------------------
mut('symlink-receipt-disabled', 'SYMLINK_RECEIPT: a symlinked receipt is parsed as a receipt', 'single', [
  ["if (st.isSymbolicLink()) throw new FailClosed('SYMLINK_RECEIPT', path);",
    "if (st.isSymbolicLink() && false) throw new FailClosed('SYMLINK_RECEIPT', path);"],
]);
mut('nofollow-dropped', 'TOCTOU: the receipt is opened without O_NOFOLLOW', 'single', [
  ['fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW', 'fsConstants.O_RDONLY'],
]);
mut('unchecked-or-to-and', 'unchecked: a receipt missing cmd= or tool_sha256= is no longer unchecked', 'single', [
  ['if (cmdField === null || digestField === null) {', 'if (cmdField === null && digestField === null) {'],
]);
mut('bad-digest-unchecked-off', 'unchecked: a non-64-hex tool_sha256= is counted as a mismatch', 'single', [
  ['if (!FULL_SHA.test(declared)) {', 'if (!FULL_SHA.test(declared) && false) {'],
]);
mut('empty-dir-clean', 'verdict: an empty receipt directory reads CLEAN', 'single', [
  ['const clean = total > 0 && mismatched === 0 && unchecked === 0;',
    'const clean = mismatched === 0 && unchecked === 0;'],
]);
mut('external-count-off', 'external tally: an out-of-lane instrument is not counted external', 'single', [
  ['external += 1;', 'external += 0;'],
]);
mut('isabsolute-disabled', 'absolute tokens: every token is resolved relative to the lane', 'single', [
  ['if (isAbsolute(instrument)) {', 'if (isAbsolute(instrument) && false) {'],
]);
mut('lane-not-git-off', 'LANE_NOT_GIT: a --lane that is not a git repository is accepted', 'single', [
  ["if (git(lane, ['rev-parse', '--git-dir']).status !== 0) throw new FailClosed('LANE_NOT_GIT', lane);",
    'if (false) throw new FailClosed(\'LANE_NOT_GIT\', lane);'],
]);
mut('root-check-absolute-off', 'UNRESOLVED: an absolute token naming the lane root is accepted', 'single', [
  ["if (lr.root) throw new FailClosed('UNRESOLVED', `${file} instrument names the lane root: ${instrument}`);",
    "if (false) throw new FailClosed('UNRESOLVED', `${file} instrument names the lane root: ${instrument}`);"],
]);
mut('digest-lowercase-off', 'digest: tool_sha256= is not lowercased before comparison', 'single', [
  ['const declared = digestField.toLowerCase();', 'const declared = digestField;'],
]);
mut('git-env-drop-off', 'GIT_* hardening: inherited GIT_DIR/GIT_INDEX_FILE are honoured', 'single', [
  ['for (const k of GIT_ENV_DROP) delete env[k];', 'for (const k of []) delete env[k];'],
]);
mut('contract-string-v2', 'contract: the emitted contract id is v2, not v3', 'single', [
  ["const CONTRACT = 'kumitate-receipt-bind-v3';", "const CONTRACT = 'kumitate-receipt-bind-v2';"],
]);

// --- the selftest's own assertions ------------------------------------------------------------
mut('selftest-held-tautology', 'selftest: the PASS verdict is a tautology (every arm counts held)', 'single', [
  ['const held = results.filter((r) => r.ok).length;', 'const held = results.length;'],
]);
mut('selftest-drop-symlink-instrument-arm', 'selftest: the SYMLINK_INSTRUMENT arm is deleted', 'single', [
  ["  expect('symlink-instrument-120000', runTool(['--dir', rcSymlinkInstrument, '--rev', c3]), 2, FC('SYMLINK_INSTRUMENT'));\n",
    '  // mutant: symlink-instrument-120000 selftest arm removed\n'],
]);
mut('selftest-drop-dup-equal-arm', 'selftest: the equal-valued duplicate rev= arm is deleted', 'single', [
  ["  expect('ambiguous-rev-equal', runTool(['--dir', rcDupRev, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));\n", ''],
]);
mut('selftest-drop-external-symlink-arm', 'selftest: the external-symlink SYMLINK_INSTRUMENT arm is deleted', 'single', [
  ["  expect('symlink-instrument-external', runTool(['--dir', rcExtLink, '--rev', c2]), 2, FC('SYMLINK_INSTRUMENT'));\n", ''],
]);
mut('selftest-drop-receipt-is-directory-arm', 'selftest: the RECEIPT_UNREADABLE directory arm is deleted', 'single', [
  ["  expect('receipt-is-directory', runTool(['--dir', rcDirReceipt, '--rev', c2]), 2, FC('RECEIPT_UNREADABLE'));\n", ''],
]);
mut('selftest-relax-bom-arm', 'selftest: the BOM precedence arm accepts any RECEIPT_BIND line', 'single', [
  ["expect('bom-rev-precedence', runTool(['--dir', rcBomRev, '--rev', c2]), 0, CLE(1));",
    "expect('bom-rev-precedence', runTool(['--dir', rcBomRev, '--rev', c2]), 0, /RECEIPT_BIND:/);"],
]);

// --- composites (two sites; evidence that the probe+selftest pair is blind together) ----------
mut('composite-mode-off-and-arm-dropped', 'SYMLINK_INSTRUMENT refusal + its selftest arm both removed', 'composite', [
  ["if (mode === '120000') {", "if (mode === '120000' && false) {"],
  ["  expect('symlink-instrument-120000', runTool(['--dir', rcSymlinkInstrument, '--rev', c3]), 2, FC('SYMLINK_INSTRUMENT'));\n",
    '  // mutant: symlink-instrument-120000 selftest arm removed\n'],
]);
mut('composite-external-symlink-and-arm-dropped', 'external-symlink refusal + its selftest arm both removed', 'composite', [
  ["if (est.isSymbolicLink()) throw new FailClosed('SYMLINK_INSTRUMENT', `${file} external instrument is a symlink: ${abs}`);",
    "if (est.isSymbolicLink() && false) throw new FailClosed('SYMLINK_INSTRUMENT', `${file} external instrument is a symlink: ${abs}`);"],
  ["  expect('symlink-instrument-external', runTool(['--dir', rcExtLink, '--rev', c2]), 2, FC('SYMLINK_INSTRUMENT'));\n", ''],
]);
mut('composite-realpath-final-and-arm-dropped', 'final-component realpath lost + the absolute-token symlink selftest arm removed', 'composite', [
  ['join(realpathSync(dirname(abs)), basename(abs))', 'realpathSync(abs)'],
  ["  expect('symlink-instrument-absolute-token', runTool(['--dir', rcSymlinkInstrumentAbs, '--rev', c3]), 2, FC('SYMLINK_INSTRUMENT'));\n", ''],
]);
mut('composite-empty-dir-and-arms-dropped', 'empty-directory-reads-clean + both empty-dir selftest arms removed', 'composite', [
  ['const clean = total > 0 && mismatched === 0 && unchecked === 0;',
    'const clean = mismatched === 0 && unchecked === 0;'],
  ["  expect('empty-dir-not-clean', runTool(['--dir', rcEmpty, '--rev', c2]), 1, DRI(0, 0, 0, 0, '-'));\n", ''],
  ["  expect('non-txt-only-is-empty', runTool(['--dir', rcNotesOnly, '--rev', c2]), 1, DRI(0, 0, 0, 0, '-'));\n", ''],
]);
mut('composite-bad-digest-and-arm-dropped', 'non-64-hex tool_sha256= becomes a mismatch + its selftest arm removed', 'composite', [
  ['if (!FULL_SHA.test(declared)) {', 'if (!FULL_SHA.test(declared) && false) {'],
  ["  expect('unchecked-bad-digest', runTool(['--dir', rcBadDigest, '--rev', c2]), 1, DRI(0, 0, 1, 0, 'a.txt'));\n", ''],
]);
mut('composite-git-env-and-arm-dropped', 'inherited GIT_* honoured + its selftest arm removed', 'composite', [
  ['for (const k of GIT_ENV_DROP) delete env[k];', 'for (const k of []) delete env[k];'],
  ["  expect('git-env-canary-ignored', runTool(['--dir', rcClean, '--rev', c2, '--lane', repo], repo, {\n    GIT_DIR: join(root, 'canary-git-dir'), GIT_WORK_TREE: join(root, 'canary-work-tree'), GIT_INDEX_FILE: join(root, 'canary-index'),\n  }), 0, CLE(1));\n",
    '  // mutant: git-env-canary-ignored selftest arm removed\n'],
]);
mut('composite-limit-x2-and-arm-dropped', 'size limit doubled + the too-large selftest arm removed', 'composite', [
  ['const MAX_RECEIPT_BYTES = 1048576;', 'const MAX_RECEIPT_BYTES = 2097152;'],
  ["  expect('receipt-too-large', runTool(['--dir', rcOver, '--rev', c2]), 2, FC('RECEIPT_TOO_LARGE'));\n", ''],
]);

// ---------------------------------------------------------------------------------------------
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const manifest = [];
const problems = [];
for (const m of M) {
  let text = source;
  const applied = [];
  for (const [find, repl] of m.sites) {
    const n = text.split(find).length - 1;
    if (n !== 1) { problems.push(`${m.id}: site occurs ${n} times: ${JSON.stringify(find.slice(0, 80))}`); continue; }
    text = text.split(find).join(repl);
    applied.push({ find, replace: repl });
  }
  if (applied.length !== m.sites.length) continue;
  const file = join(outDir, `${m.id}.mjs`);
  writeFileSync(file, text);
  manifest.push({
    id: m.id, behaviour: m.behaviour, kind: m.kind, sites: applied.length, file,
    sha256: sha(Buffer.from(text)), bytes: Buffer.byteLength(text),
    identicalToCandidate: text === source, note: m.note,
  });
}
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify({ src, srcSha256: sha(Buffer.from(source)), mutants: manifest, problems }, null, 2)}\n`);
console.log(`MUTANTS: generated=${manifest.length} problems=${problems.length}`);
for (const p of problems) console.log(`PROBLEM ${p}`);
