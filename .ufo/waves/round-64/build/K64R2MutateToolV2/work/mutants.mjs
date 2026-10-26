#!/usr/bin/env node
/**
 * mutants.mjs — single-literal mutant battery for scripts/report-receipt-diff.mjs v2
 * (subject sha256 faca709960bd9c132c78abf6e0f075944d3a7d35a29104cb7203802c3ca58e83,
 * integrated tree 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8).
 *
 * Each mutant changes ONE literal (or one id string at all its add() sites, count asserted)
 * in a fresh copy of the pristine tool, then runs
 *   (a) the tool's own selftest (must print PASS (N/N), N >= 20, exit 0), and
 *   (b) all 37 frozen control cases with the frozen P2 invocation:
 *       node <tool> --lane <case>/lane --round 9 --report <case>/report.md   (no --rev)
 * Killed-by-selftest / killed-by-controls / SURVIVOR / BUILD-ERROR.
 *
 * Survivors are then re-run against a "selftest-plus" draft (pristine + added killer cases,
 * built and verified here) to prove each proposed case kills its mutant.
 *
 *   node mutants.mjs <work-dir> <controls-dir> <scratch-dir> [--only M01,N02]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WORK = resolve(process.argv[2]);
const CONTROLS = resolve(process.argv[3]);
const SCRATCH = resolve(process.argv[4]);
const only = (() => { const i = process.argv.indexOf('--only'); return i > 0 ? new Set(process.argv[i + 1].split(',')) : null; })();
const SRC = join(WORK, 'report-receipt-diff.mjs');
const pristine = readFileSync(SRC, 'utf8');

const cases = readdirSync(CONTROLS).filter((n) => existsSync(join(CONTROLS, n, 'expect'))).sort();
if (!cases.length) { process.stderr.write('no control cases\n'); process.exit(64); }
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');

function selftest(file) {
  const r = spawnSync('node', [file, '--selftest'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const m = /REPORT_RECEIPT_SELFTEST: (PASS|FAIL) \((\d+)\/(\d+)\)/.exec(r.stdout);
  const killed = r.status !== 0 || !m || m[1] !== 'PASS' || m[2] !== m[3] || Number(m[2]) < 20;
  return { killed, why: killed ? `exit=${r.status} ${(r.stdout.trim().split('\n').pop() || r.stderr.trim().split('\n')[0] || 'no-output').slice(0, 80)}` : `${m[2]}/${m[3]}` };
}
function controls(file) {
  const bad = [];
  for (const c of cases) {
    const [code, want] = readFileSync(join(CONTROLS, c, 'expect'), 'utf8').split('\n');
    const r = spawnSync('node', [file, '--lane', join(CONTROLS, c, 'lane'), '--round', '9', '--report', join(CONTROLS, c, 'report.md')], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
    if (String(r.status) !== code || got !== want) bad.push(`${c}:${r.status}/${got || '-'}`);
  }
  return { killed: bad.length > 0, bad };
}

// [id, v1ref, find, replace, note, expectCount]
const M = [
  // --- remaps of the 33 wave-1 (v1) survivors; M34 (line() x/y boundary) not applicable: v2 dropped line()
  ['M02', 'v1', '\\s*Landed changes/im', '\\s*Landed change/im', 'REQUIRED heading literal truncated'],
  ['M03', 'v1', 'Before\\s*(?:→|->)\\s*after', 'Before\\s*(?:→)\\s*after', 'drops ASCII -> arm'],
  ['M04', 'v1', 'Before\\s*(?:→|->)', 'Before (?:→|->)', 'exactly one space after label'],
  ['M06', 'v1', '\\s*Trend verdicts/im', '\\s*Trend verdict/im', 'REQUIRED heading literal truncated'],
  ['M08', 'v1', "'Work performed', /^#{1,6}", "'Work performed', /#{1,6}", 'drops ^ anchor on heading'],
  ['M09', 'v1', "'Landed changes', /^#{1,6}", "'Landed changes', /^#{1,3}", 'narrows #{1,6} to #{1,3}'],
  ['M10', 'v1', '\\s*\\**\\s*Sources', '\\s*Sources', 'drops optional ** bold arm'],
  ['M12', 'v1', '\\bLANE_HASH\\b', '\\bLANE_HASH', 'trailing \\b dropped'],
  ['M13', 'v1', '\\bTBD\\b', '\\bTBD', 'trailing \\b dropped'],
  ['M15', 'v1', 'const TALLY = /\\b([a-z]', 'const TALLY = /([a-z]', 'leading \\b dropped'],
  ['M16', 'v1', ')\\s+held=', ') held=', 'single space only'],
  ['M17', 'v1', '(\\d+)\\/(\\d+)/gi', '(\\d+)\\/(\\d)/gi', 'single-digit y only'],
  ['M25', 'v1', '[0-9a-fA-F]{39,40}\\b/g', '[0-9a-fA-F]{39,40}/g', 'trailing \\b dropped'],
  ['M29', 'v1', '^\\s*[-*]\\s/', '^\\s*-\\s/', 'star bullet dropped'],
  ['M31', 'v1', ".split('\\n').slice(1)", ".split('\\n')", 'heading line kept in box scan'],
  ['M39', 'v1', 'round-${round}/(?:base|close)', 'round-\\d+/(?:base|close)', 'RECEIPT_PATH accepts any round'],
  ['M43', 'v1', 'const tip = rev || (headRes.status === 0 ? headRes.stdout.trim() : null);', 'const tip = rev;', 'no HEAD fallback'],
  ['M44', 'v1', 'const tip = rev || (headRes.status === 0 ? headRes.stdout.trim() : null);', 'const tip = headRes.status === 0 ? headRes.stdout.trim() : null;', 'tip swap; crashes when rev given (headRes null) — non-crashing rev-ignoring form needs 2 literals; contract pinned by plus case tip-honours-rev'],
  ['M45', 'v1', "['cat-file', '-e', `${h}^{commit}`]", "['cat-file', '-e', `${h}`]", 'any object resolves (2 sites)', 2],
  ['M46', 'v1', 'process.exit(64); }', 'process.exit(1); }', 'usage exit 64 -> 1'],
  ['M47', 'v1', 'rev-unreadable ${revFull}\\n`); process.exit(2);', 'rev-unreadable ${revFull}\\n`); process.exit(1);', 'rev fail-closed 2 -> 1'],
  ['M48', 'v1', 'report-unreadable ${report}\\n`); process.exit(2);', 'report-unreadable ${report}\\n`); process.exit(1);', 'report fail-closed 2 -> 1'],
  ['M52', 'v1', 'process.exit(pass === results.length ? 0 : 1);', 'process.exit(0);', 'selftest always exits 0'],
  ['M60', 'v1', "existsSync(join(dirname(laneAbs), '.git'))", "existsSync(join(laneAbs, '.git'))", 'fleet autodetect probes lane'],
  ['M61', 'v1', 'if (ls.status !== 0) continue;', 'if (false) continue;', 'ls-tree guard dropped'],
  ['M62', 'v1', 'if (b.status === 0) receiptNames.set(m[2], b.stdout);', 'if (true) receiptNames.set(m[2], b.stdout);', 'failed show registered'],
  ['M63', 'v1', 'new Set(text.match(HASH) || [])', '(text.match(HASH) || [])', 'hash dedupe dropped'],
  ['M64', 'v1', "const ids = [...new Set(findings.map((f) => f.id))].join(',');", "const ids = findings.map((f) => f.id).join(',');", 'DRIFT header dup ids'],
  ['M67', 'v1', 'if (rv.status !== 0) {', 'if (false) {', 'rev-verify guard dropped'],
  ['M68', 'v1', 'matchAll(/^#{1,6}\\s*\\**\\s*SHONEN/gim)', 'matchAll(/#{1,6}\\s*\\**\\s*SHONEN/gim)', '^ dropped from SHONEN scan'],
  ['M69', 'v1', 'if (/^\\s*[-*]\\s/.test(l)) boxes', 'if (/\\s*[-*]\\s/.test(l)) boxes', '^ dropped from box line regex'],
  ['M70', 'v1', 'const HASH = /\\b[0-9a-fA-F]', 'const HASH = /[0-9a-fA-F]', 'leading \\b dropped'],
  // --- v2-new mutants
  ['N01', 'v2', '[A-Za-z0-9_]{1,}__', '[A-Za-z0-9_]{2,}__', 'PLACEHOLDER inner min 2'],
  ['N02', 'v2', '|\\bto be filled\\b', '|', 'drops to-be-filled arm'],
  ['N03', 'v2', '|<(?:measured|measured_rev|tip_hash|rev_hash|placeholder|tbd|todo)>', '|', 'drops angle-token arm'],
  ['N04', 'v2', '\\}\\}|\\bX{4,}', '|\\bX{4,}', 'drops }} closer on {{token}}'],
  ['N05', 'v2', 'X{4,}', 'X{5,}', 'XXXX no longer flagged'],
  ['N06', 'v2', ".replace(/[\\u200B-\\u200F\\u2060\\uFEFF]/g, '')", '', 'scan: zero-width normalisation dropped'],
  ['N07', 'v2', ".replace(/\\|/g, ' ')", '', 'scan: pipe normalisation dropped'],
  ['N08', 'v2', ".replace(/[ \\t]*=[ \\t]*/g, '=')", '', 'scan: spaced = normalisation dropped'],
  ['N09', 'v2', ".replace(/[ \\t]*\\/[ \\t]*/g, '/')", '', 'scan: spaced / normalisation dropped'],
  ['N10', 'v2', '(?:```|~~~)', '(?:```)', 'unfence: tilde arm dropped'],
  ['N11', 'v2', 'fenced = !fenced', 'fenced = true', 'unfence: closing fence ignored'],
  ['N12', 'v2', '.toUpperCase()', '', 'tallyKey: case folding dropped'],
  ['N13', 'v2', "  ['Sources & frontier', /^#{1,6}\\s*\\**\\s*Sources\\s*&\\s*frontier/im],\n", '', 'REQUIRED entry deleted'],
  ['N14', 'v2', 'h[1].length <= level', 'h[1].length < level', 'SHONEN level <= to <'],
  ['N15', 'v2', 'if (boxes < 4)', 'if (boxes < 5)', 'boxes threshold 4 -> 5'],
  ['N16', 'v2', 'if (boxes < 4)', 'if (boxes < 3)', 'boxes threshold 4 -> 3'],
  ['N17', 'v2', '/`?\\[[xX~ ]\\]`?/g', '/`\\[[xX~ ]\\]`/g', 'box count requires backticks'],
  ['N18', 'v2', '[xX~ ]', '[xX]', 'box chars ~ and space dropped'],
  ['N19', 'v2', 'match(/^#+/)[0].length', 'match(/^#+/)[0].length + 1', 'SHONEN level inflated'],
  ['N20', 'v2', "m[1] === '120000'", "m[1] === '120001'", 'symlink mode skip disabled (rev mode)'],
  ['N21', 'v2', 'if (!lstatSync(p).isFile()) continue;', 'if (!existsSync(p)) continue;', 'worktree symlink arm follows links'],
  ['N22', 'v2', "const dirs = ['base', 'close'];", "const dirs = ['close'];", 'base receipts unread'],
  ['N23', 'v2', '/^(\\d{6}) \\w+ [0-9a-f]+\\t(.+)$/', '/^(\\d{5}) \\w+ [0-9a-f]+\\t(.+)$/', 'ls-tree mode regex broken'],
  ['N24', 'v2', '/(?:base|close)/[A-Za-z0-9._*/-]*', '/(?:close)/[A-Za-z0-9._*/-]*', 'RECEIPT_PATH drops base'],
  ['N25', 'v2', '[A-Za-z0-9._*/-]*`', '[A-Za-z0-9._*/-]+`', 'RECEIPT_PATH * -> +'],
  ['N26', 'v2', '[A-Za-z0-9._*/-]*', '[A-Za-z0-9_*/-]*', 'RECEIPT_PATH class drops .'],
  ['N27', 'v2', ".replace(/[.,;:]+$/, '')", ".replace(/ZZZNEVERZZZ/g, '')", 'cited(): trailing punctuation kept'],
  ['N28', 'v2', "x.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&')", "x.replace(/ZZZNEVERZZZ/g, '')", 'globRe: escaping dropped'],
  ['N29', 'v2', ".join('[^/]*')", ".join('.*')", 'globRe: crosses /'],
  ['N30', 'v2', "&& !p.split('/').includes('..')", '', "isPath: '..' test dropped"],
  ['N31', 'v2', "if (p.endsWith('/')) {", "if (!p.endsWith('/')) {", 'dir citation arm inverted'],
  ['N32', 'v2', "if (p.includes('*')) { // a glob", "if (p.includes('?')) { // a glob", 'glob arm disabled'],
  ['N33', 'v2', '!receiptNames.get(p).trim()', 'false', 'RECEIPT_EMPTY disabled'],
  ['N34', 'v2', 'scope.some((sp) =>', 'scope.every((sp) =>', 'cited-scope some -> every'],
  ['N35', 'v2', '!hits.some((h) => h.checks === null || h.checks === c[1])', 'hits.some((h) => h.checks === null || h.checks === c[1])', 'checks comparison inverted'],
  ['N36', 'v2', 'h.checks === null || ', '', 'checks: null (absent) arm dropped'],
  ['N37', 'v2', '{39,40}', '{40}', 'HASH 39-abbrev arm dropped'],
  ['N38', 'v2', '[0-9a-fA-F]', '[0-9a-f]', 'HASH uppercase hex dropped'],
  ['N39', 'v2', 'const headRes = rev ? null : git(', 'const headRes = git(', 'HEAD always resolved'],
  ['N40', 'v2', '|(?:github|gitlab)', '|(?:githxb|gitlab)', 'inUrl: bare github arm dropped'],
  ['N41', 'v2', 'Buffer.byteLength(reportText)', '0', 'render meta bytes stub'],
  ['N42', 'v2', '.flatMap((a) => (/^--[a-z]+=/', '.map((a) => (/^--[a-z]+=/', 'argv flatMap -> map'],
  ['N43', 'v2', '/^--[a-z]+=/', '/^--[A-Z]+=/', 'argv =-form regex case-flipped'],
  ['N44', 'v2', 'if (import.meta.url ===', 'if (false && import.meta.url ===', 'CLI guard disabled'],
  ['N45', 'v2', 'if (!lane || !round || !report ||', 'if (!round || !report ||', 'usage guard drops !lane'],
  ['N46', 'v2', "!/^\\d+$/.test(round)", 'false', 'numeric-round guard dropped'],
  ['N47', 'v2', 'process.exit(r.code);', 'process.exit(0);', 'main always exits 0'],
  ['N48', 'v2', 'return { code: 1, out:', 'return { code: 2, out:', 'DRIFT exit 1 -> 2'],
  ['N49', 'v2', 'if (!findings.length) return { code: 0, out:', 'if (!findings.length) return { code: 1, out:', 'CLEAN exit 0 -> 1'],
  ['N50', 'v2', 'todo)>/gi;', 'todo)>/g;', 'PLACEHOLDER case-insensitivity off'],
  ['N51', 'v2', '(\\d+)\\/(\\d+)/gi;', '(\\d+)\\/(\\d+)/g;', 'TALLY case-insensitivity off'],
  ['N52', 'v2', '([a-z][a-z0-9]*_', '([a-z]+_', 'TALLY label digits dropped'],
  ['N53', 'v2', '(?:held|unmet)', '(?:held)', 'UNMET tallies unchecked'],
  ['N54', 'v2', "if (/^\\s*(?:```|~~~)/", 'if (/^(?:```|~~~)/', 'unfence: indented fences missed'],
  // --- finding-id renames (one id each; counts asserted)
  ['I01', 'v2', "add('PLACEHOLDER', m[0])", "add('PLACEHOLD', m[0])", 'id renamed', 1],
  ['I02', 'v2', "add('TALLY_UNRECEIPTED', key)", "add('TALLY_UNRECEIPT', key)", 'id renamed', 1],
  ['I03', 'v2', "add('TALLY_CHECKS_MISMATCH',", "add('TALLY_CHECKS_MISMAT',", 'id renamed', 1],
  ['I04', 'v2', "add('RECEIPT_MISSING',", "add('RECEIPT_MISSIN',", 'id renamed (4 sites)', 4],
  ['I05', 'v2', "add('RECEIPT_EMPTY', p)", "add('RECEIPT_EMPT', p)", 'id renamed', 1],
  ['I06', 'v2', "add('HASH_DEAD',", "add('HASH_DED',", 'id renamed', 1],
  ['I07', 'v2', "add('HASH_ORPHAN', h)", "add('HASH_ORPHA', h)", 'id renamed', 1],
  ['I08', 'v2', "add('SECTION_MISSING', name)", "add('SECTION_MISSIN', name)", 'id renamed', 1],
  ['I09', 'v2', "add('SHONEN_COUNT', `headings=", "add('SHONEN_COUNTH', `headings=", 'id renamed (headings arm)', 1],
  ['I10', 'v2', "add('SHONEN_COUNT', `boxes=", "add('SHONEN_COUNTB', `boxes=", 'id renamed (boxes arm)', 1],
];

const out = [];
const apply = (src, find, replace) => src.split(find).join(replace);

// 0) baseline parity
const baseSelf = selftest(SRC);
const baseCtrl = controls(SRC);
if (baseSelf.killed || baseCtrl.killed) {
  process.stdout.write(`BASELINE RED: selftest=${JSON.stringify(baseSelf)} controls=${JSON.stringify(baseCtrl.bad)}\n`);
  process.exit(1);
}
process.stdout.write(`BASELINE GREEN: selftest ${baseSelf.why}, controls ${cases.length}/${cases.length} parity\n`);

// 1) battery
for (const [id, v1ref, find, replace, note, cnt] of M) {
  if (only && !only.has(id)) continue;
  const want = cnt || 1;
  const n = pristine.split(find).length - 1;
  if (n !== want) { out.push({ id, v1ref, note, verdict: 'BUILD-ERROR', why: `find-count=${n} expected=${want}` }); process.stdout.write(`${id} BUILD-ERROR (find-count=${n})\n`); continue; }
  const f = join(SCRATCH, 'mutant-live.mjs');
  writeFileSync(f, apply(pristine, find, replace));
  const st = selftest(f);
  let verdict, killedBy = null;
  if (st.killed) verdict = 'KILLED-SELFTEST';
  else {
    const c = controls(f);
    if (c.killed) { verdict = 'KILLED-CONTROLS'; killedBy = c.bad.slice(0, 4); }
    else verdict = 'SURVIVOR';
  }
  rmSync(f, { force: true });
  out.push({ id, v1ref, note, verdict, killedBy, why: verdict === 'KILLED-SELFTEST' ? st.why : undefined });
  process.stdout.write(`${id} ${verdict}${killedBy ? ' ' + killedBy.join(';') : ''}\n`);
}

// 2) selftest-plus draft: pristine + fixture additions + killer cases for the survivors
function buildPlus(src) {
  let s = src;
  s = s.replace(
    "  symlinkSync('../../../outside.txt', join(D, '.ufo/waves/round-9/close/link.txt'));\n",
    "  symlinkSync('../../../outside.txt', join(D, '.ufo/waves/round-9/close/link.txt'));\n" +
    "  mkdirSync(join(D, '.ufo/waves/round-9/close/sub'), { recursive: true });\n" +
    "  writeFileSync(join(D, '.ufo/waves/round-9/close/sub/deep.receipt'), 'DEEP9_HELD held=2/2 checks=2\\n');\n");
  s = s.replace(
    "  const c1 = g('rev-parse', 'HEAD').stdout.trim();\n",
    "  const c1 = g('rev-parse', 'HEAD').stdout.trim();\n  const blobSha = g('rev-parse', 'HEAD:f.txt').stdout.trim();\n");
  s = s.replace(
    "  g('checkout', '-q', '-'); g('checkout', '-q', '-B', 'main2', c1);\n",
    "  g('checkout', '-q', '-'); g('checkout', '-q', '-B', 'main2', c1);\n" +
    "  writeFileSync(join(D, 'h.txt'), 'c'); g('add', '-A'); g('commit', '-q', '-m', 'two');\n  const c2 = g('rev-parse', 'HEAD').stdout.trim();\n");
  s = s.replace(
    "skip === 'wp' ? '' : '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements',",
    "skip === 'wp' ? '' : '## Work performed', 'x', skip === 'lc' ? '' : '## Landed changes', 'x', '## Before → after measurements',");
  s = s.replace(
    "'## Sources & frontier', 'x', '## Trend verdicts', 'x',",
    "skip === 'sf' ? '' : '## Sources & frontier', 'x', '## Trend verdicts', 'x',");
  const extra = `  // wave-2 mutant-killers (K64R2MutateToolV2)
  t('heading-landed-skip', ids(body('', 'lc')) === 'SECTION_MISSING');
  t('heading-sources-skip', ids(body('', 'sf')) === 'SECTION_MISSING');
  t('heading-before-ascii-arrow', ids(body().replace('Before → after', 'Before -> after')) === '');
  t('heading-before-double-space', ids(body().replace('Before → after', 'Before  → after')) === '');
  t('heading-bold-sources', ids(body().replace('## Sources & frontier', '## **Sources & frontier**')) === '');
  t('heading-h4-landed', ids(body().replace('## Landed changes', '#### Landed changes')) === '');
  t('heading-midline-not-heading', ids(body('see ## Work performed in docs', 'wp')) === 'SECTION_MISSING');
  t('placeholder-lane-hash-adjacent', ids(body('LANE_HASHX and TBDs')) === '');
  t('placeholder-lowercase-angle-todo', ids(body('fix <TODO> and tbd soon')) === 'PLACEHOLDER');
  t('placeholder-unclosed-brace-clean', ids(body('at {{unclosed brace')) === '');
  t('tally-tab-separator', ids(body('X9_HELD\\theld=6/6')) === 'TALLY_UNRECEIPTED');
  t('tally-label-case-folded', ids(body('x9_held held=3/3')) === '');
  t('tally-digit-prefixed-clean', ids(body('9X9_HELD held=8/8')) === '');
  t('tally-detail-two-digit', run(body('Z9_HELD held=10/11')).some((f) => f.id === 'TALLY_UNRECEIPTED' && f.detail === 'Z9_HELD held=10/11'));
  t('tally-checks-null-ok', ids(body('W9_HELD held=4/4 checks=9 (\\\`.ufo/waves/round-9/base/p-target.txt\\\`)')) === '');
  t('hash-blob-not-commit', ids(body(blobSha)) === 'HASH_DEAD');
  t('hash-embedded-not-hash', ids(body('x0123456789abcdef0123456789abcdef012345678')) === '');
  t('hash-suffixed-clean', ids(body('0123456789abcdef0123456789abcdef01234567x')) === '');
  t('hash-dedupe', run(body('0123456789abcdef0123456789abcdef01234567 and again 0123456789abcdef0123456789abcdef01234567')).filter((f) => f.id === 'HASH_DEAD').length === 1);
  t('hash-in-bare-github-url', ids(body('see github.com/org/repo/commit/0123456789abcdef0123456789abcdef01234567')) === '');
  t('tip-honours-rev', ids(body(c2)) === 'HASH_ORPHAN');
  t('tip-head-fallback', diffReport({ lane: D, round: 9, reportText: body(orphan), fleet: null }).some((f) => f.id === 'HASH_ORPHAN'));
  t('receipt-citation-trailing-period', ids(body('see .ufo/waves/round-9/close/p-tip.txt.')) === '');
  t('receipt-glob-escape', ids(body('see \\\`.ufo/waves/round-9/close/p.tip*\\\`')) === 'RECEIPT_MISSING');
  t('receipt-glob-no-crossdir', ids(body('see \\\`.ufo/waves/round-9/close/*.receipt\\\`')) === 'RECEIPT_MISSING');
  t('receipt-other-round-clean', ids(body('see \\\`.ufo/waves/round-8/base/x.txt\\\`')) === '');
  t('receipt-dir-empty-round8', diffReport({ lane: D, round: 8, reportText: body('see \\\`.ufo/waves/round-8/close/\\\`'), rev: c1, fleet: null }).some((f) => f.id === 'RECEIPT_MISSING'));
  t('receipt-escape-claim-scope', ids(body('X9_HELD held=3/3 (\\\`.ufo/waves/round-9/close/p-tip.txt/../../../x\\\`)')) === 'RECEIPT_MISSING');
  t('shonen-star-bullet', ids(body().replace('- [~] b', '* [~] b')) === '');
  t('shonen-nested-heading-clean', ids(['# report', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '### nested', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\\n')) === '');
  t('shonen-inline-not-heading', ids(body('text ## SHONEN text')) === '');
  t('shonen-midline-not-box', /SHONEN_COUNT/.test(ids(body().replace('- [~] d', 'see - [ ] here'))));
  t('fence-tilde-arm', ids(fenceAll.replace(/\\\`\\\`\\\`/g, '~~~')) === 'SECTION_MISSING,SHONEN_COUNT');
  t('fence-indented', ids(fenceAll.replace(/^\\\`\\\`\\\`/gm, ' \\\`\\\`\\\`')) === 'SECTION_MISSING,SHONEN_COUNT');
  t('fence-closed-reopens', ids(['\\\`\\\`\\\`', 'example', '\\\`\\\`\\\`', '## Work performed', 'x', '## Landed changes', 'x', '## Before → after measurements', 'x', '## Sources & frontier', 'x', '## Trend verdicts', 'x', '## SHONEN', '- [~] a', '- [~] b', '- [ ] c', '- [~] d'].join('\\n')) === '');
  t('cli-usage-missing-args', spawnSync(process.execPath, [process.argv[1]], { encoding: 'utf8' }).status === 64);
  t('cli-usage-missing-lane', spawnSync(process.execPath, [process.argv[1], '--round', '9', '--report', rf], { encoding: 'utf8' }).status === 64);
  t('cli-usage-bad-round', spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', 'abc', '--report', rf], { encoding: 'utf8' }).status === 64);
  t('cli-report-missing-fail-closed', spawnSync(process.execPath, [process.argv[1], '--lane', D, '--round', '9', '--report', join(T, 'nope.md')], { encoding: 'utf8' }).status === 2);
  t('render-header-unique', !render([{ id: 'PLACEHOLDER', detail: 'a' }, { id: 'PLACEHOLDER', detail: 'b' }], 'm').out.includes('DRIFT PLACEHOLDER,PLACEHOLDER'));
`;
  s = s.replace('  rmSync(T, { recursive: true, force: true });\n', extra + '  rmSync(T, { recursive: true, force: true });\n');
  return s;
}

// survivor -> killing case name in the plus draft (E = argued equivalent, no case)
const KILLER = {
  M03: 'heading-before-ascii-arrow', M04: 'heading-before-double-space', M08: 'heading-midline-not-heading',
  M09: 'heading-h4-landed', M10: 'heading-bold-sources', M12: 'placeholder-lane-hash-adjacent',
  M13: 'placeholder-lane-hash-adjacent', M15: 'tally-digit-prefixed-clean', M16: 'tally-tab-separator',
  M17: 'tally-detail-two-digit', M25: 'hash-suffixed-clean', M29: 'shonen-star-bullet',
  M39: 'receipt-other-round-clean', M43: 'tip-head-fallback', M44: 'tip-honours-rev',
  M45: 'hash-blob-not-commit', M46: 'cli-usage-missing-args', M48: 'cli-report-missing-fail-closed',
  M63: 'hash-dedupe', M64: 'render-header-unique', M68: 'shonen-inline-not-heading',
  M69: 'shonen-midline-not-box', M70: 'hash-embedded-not-hash',
  N04: 'placeholder-unclosed-brace-clean', N10: 'fence-tilde-arm',
  N11: 'fence-closed-reopens', N12: 'tally-label-case-folded', N13: 'heading-sources-skip', N19: 'shonen-nested-heading-clean',
  N25: 'receipt-dir-empty-round8', N27: 'receipt-citation-trailing-period', N28: 'receipt-glob-escape', N29: 'receipt-glob-no-crossdir',
  N30: 'receipt-escape-claim-scope', N36: 'tally-checks-null-ok', N40: 'hash-in-bare-github-url',
  N45: 'cli-usage-missing-lane', N46: 'cli-usage-bad-round', N50: 'placeholder-lowercase-angle-todo',
  N54: 'fence-indented',
};

const plusSrc = buildPlus(pristine);
const PLUS = join(WORK, 'report-receipt-diff.selftestplus.mjs');
writeFileSync(PLUS, plusSrc);
const plusSelf = selftest(PLUS);
process.stdout.write(`PLUS-PRISTINE selftest ${plusSelf.killed ? 'RED ' + plusSelf.why : 'GREEN ' + plusSelf.why}\n`);
const plusCtrl = controls(PLUS);
process.stdout.write(`PLUS-PRISTINE controls parity: ${plusCtrl.killed ? 'BROKEN ' + plusCtrl.bad.join(';') : cases.length + '/' + cases.length}\n`);

const killResults = [];
for (const r of out.filter((x) => x.verdict === 'SURVIVOR')) {
  if (!(r.id in KILLER)) { killResults.push({ id: r.id, killer: null, verdict: 'EQUIVALENT-CASED' }); continue; }
  const [, , find, replace] = M.find((m) => m[0] === r.id);
  const f = join(SCRATCH, 'mutant-live.mjs');
  writeFileSync(f, apply(plusSrc, find, replace));
  const rr = spawnSync('node', [f, '--selftest'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const m = /REPORT_RECEIPT_SELFTEST: (PASS|FAIL) \((\d+)\/(\d+)\)/.exec(rr.stdout);
  const red = rr.status !== 0 || !m || m[1] !== 'PASS';
  const failNames = (rr.stdout.match(/^FAIL (\S+)$/gm) || []).map((l) => l.slice(5));
  const caseName = KILLER[r.id];
  killResults.push({ id: r.id, killer: caseName, verdict: red && failNames.includes(caseName) ? 'KILLED-BY-PLUS' : red ? 'KILLED-OTHER' : 'NOT-KILLED', failNames: failNames.slice(0, 6) });
  rmSync(f, { force: true });
  process.stdout.write(`PLUS ${r.id} ${killResults[killResults.length - 1].verdict} via ${caseName}${red && !failNames.includes(caseName) ? ' fails=' + failNames.join('|') : ''}\n`);
}
writeFileSync(join(WORK, 'plus-kill-results.json'), JSON.stringify({ plusSelftest: plusSelf.why, plusParity: plusCtrl.killed ? plusCtrl.bad : 'ok', results: killResults }, null, 2));

// 3) patch text pristine -> plus
const d = spawnSync('git', ['diff', '--no-index', '--src-prefix=a/', '--dst-prefix=b/', SRC, PLUS], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
writeFileSync(join(WORK, 'selftest-additions.patch'), d.stdout || '');

// 4) summaries
writeFileSync(join(WORK, 'mutant-results.json'), JSON.stringify({ baseline: { selftest: baseSelf.why, controls: cases.length }, results: out }, null, 2));
const by = (v) => out.filter((r) => r.verdict === v).map((r) => r.id);
process.stdout.write(`\nTOTAL ${out.length} | KILLED-SELFTEST ${by('KILLED-SELFTEST').length} | KILLED-CONTROLS ${by('KILLED-CONTROLS').length} | SURVIVOR ${by('SURVIVOR').length} | BUILD-ERROR ${by('BUILD-ERROR').length}\n`);
process.stdout.write(`SURVIVORS: ${by('SURVIVOR').join(',') || '(none)'}\nBUILD-ERRORS: ${by('BUILD-ERROR').join(',') || '(none)'}\n`);
process.stdout.write(`EQUIVALENT (survivor, no case): ${killResults.filter((k2) => k2.verdict === 'EQUIVALENT-CASED').map((k2) => k2.id).join(',') || '(none)'}\n`);
const v1 = out.filter((r) => r.v1ref === 'v1');
const v1Surv = v1.filter((r) => r.verdict === 'SURVIVOR').map((r) => r.id);
const v1KilledByPlus = killResults.filter((k) => v1Surv.includes(k.id) && k.verdict === 'KILLED-BY-PLUS').map((k) => k.id);
const v1Equiv = v1Surv.filter((id) => !v1KilledByPlus.includes(id));
process.stdout.write(`V1-REMAP ${v1.length}: killed-now ${v1.filter((r) => r.verdict !== 'SURVIVOR').length} (${v1.filter((r) => r.verdict !== 'SURVIVOR').map((r) => r.id).join(',')}), killed-by-plus ${v1KilledByPlus.length} (${v1KilledByPlus.join(',')}), still-uncovered ${v1Equiv.length} (${v1Equiv.join(',')})\n`);
