#!/usr/bin/env node
/**
 * mutants.mjs — single-literal mutant battery for scripts/report-receipt-diff.mjs (claim C1 subject).
 * Each mutant changes exactly ONE literal in a fresh copy of the pristine tool, then runs
 *   (a) the tool's own selftest, and
 *   (b) the 16 frozen control cases with the invocation the frozen counter's P2 uses:
 *       node <tool> --lane <case>/lane --round 9 --report <case>/report.md
 * Killed-by-selftest: selftest non-zero / FAIL / pass<total / N<20.
 * Killed-by-controls: any case whose (exit code, sorted finding ids or CLEAN) differs from its `expect`.
 *
 *   node mutants.mjs <work-dir> <controls-dir> [--only M01,M02]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WORK = resolve(process.argv[2] || '.');
const CONTROLS = resolve(process.argv[3] || '');
const only = (() => { const i = process.argv.indexOf('--only'); return i > 0 ? new Set(process.argv[i + 1].split(',')) : null; })();
const SRC = join(WORK, 'report-receipt-diff.mjs');
const pristine = readFileSync(SRC, 'utf8');

const cases = readdirSync(CONTROLS).filter((n) => existsSync(join(CONTROLS, n, 'expect'))).sort();
if (!cases.length) { process.stderr.write('no control cases\n'); process.exit(64); }

const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');

function selftest(file) {
  const r = spawnSync('node', [file, '--selftest'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const m = /REPORT_RECEIPT_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(r.stdout);
  const killed = r.status !== 0 || !m || m[1] !== m[2] || Number(m[1]) < 20;
  return { killed, why: killed ? `exit=${r.status} line=${(r.stdout.trim().split('\n').pop() || r.stderr.trim().split('\n')[0] || '').slice(0, 90)}` : `${m[1]}/${m[2]}` };
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

// one single-literal change each: [id, target, find, replace, note]
const M = [
  ['M01', 'REQUIRED Work performed', '\\s*Work performed/im', '\\s*Work performd/im', 'heading literal misspelled'],
  ['M02', 'REQUIRED Landed changes', '\\s*Landed changes/im', '\\s*Landed change/im', 'heading literal truncated'],
  ['M03', 'REQUIRED Before->after arrow alt', 'Before\\s*(?:→|->)\\s*after', 'Before\\s*(?:→)\\s*after', 'drops the ASCII -> alternative'],
  ['M04', 'REQUIRED Before->after whitespace', 'Before\\s*(?:→|->)', 'Before (?:→|->)', 'requires exactly one space after the label'],
  ['M05', 'REQUIRED Sources & frontier amp', 'Sources\\s*&\\s*frontier', 'Sources\\s*frontier', 'drops the ampersand requirement'],
  ['M06', 'REQUIRED Trend verdicts', '\\s*Trend verdicts/im', '\\s*Trend verdict/im', 'heading literal truncated'],
  ['M07', 'REQUIRED SHONEN heading', '\\s*SHONEN/im],', '\\s*SHONENN/im],', 'REQUIRED entry renamed (SHONEN detect arm untouched)'],
  ['M08', 'REQUIRED heading anchor', "'Work performed', /^#{1,6}", "'Work performed', /#{1,6}", 'drops the ^ anchor'],
  ['M09', 'REQUIRED heading quantifier', "'Landed changes', /^#{1,6}", "'Landed changes', /^#{1,3}", 'narrows #{1,6} to #{1,3}'],
  ['M10', 'REQUIRED bold-marker arm', '\\s*\\**\\s*Sources', '\\s*Sources', 'drops the optional ** bold marker'],
  ['M11', 'PLACEHOLDER quantifier', '[A-Z0-9_]{2,}__', '[A-Z0-9_]{3,}__', 'two-char token no longer flagged'],
  ['M12', 'PLACEHOLDER LANE_HASH boundary', '\\bLANE_HASH\\b', '\\bLANE_HASH', 'trailing \\b dropped (LANE_HASHX matches)'],
  ['M13', 'PLACEHOLDER TBD boundary', '\\bTBD\\b', '\\bTBD', 'trailing \\b dropped (TBDs matches)'],
  ['M14', 'PLACEHOLDER char class', '[A-Z0-9_]{2,}', '[A-Z0-9]{2,}', 'underscore removed from the class'],
  ['M15', 'TALLY leading boundary', 'const TALLY = /\\b(', 'const TALLY = /(', 'leading \\b dropped'],
  ['M16', 'TALLY separator', ')\\s+held=', ') held=', 'requires exactly one space'],
  ['M17', 'TALLY y quantifier', 'held=(\\d+)\\/(\\d+)/g', 'held=(\\d+)\\/(\\d)/g', 'single-digit y only'],
  ['M18', 'TALLY verdict alternation', '(?:HELD|UNMET))', '(?:HELD))', 'UNMET no longer tallied'],
  ['M19', 'TALLY label class', '([A-Z][A-Z0-9]*_', '([A-Z]+_', 'digits removed from the label class'],
  ['M20', 'RECEIPT_PATH dir alternation', '(?:base|close)', '(?:base)', 'close/ receipts unreachable'],
  ['M21', 'RECEIPT_PATH name class', '[A-Za-z0-9._-]+', '[A-Za-z0-9._]+', 'dash removed from the name class'],
  ['M22', 'RECEIPT_PATH name quantifier', '[A-Za-z0-9._-]+', '[A-Za-z0-9._-]{1,8}', 'names longer than 8 chars unreachable'],
  ['M23', 'RECEIPT_PATH anchor', '`\\\\.ufo/waves/round-', '`ufo/waves/round-', 'leading dot anchor dropped'],
  ['M24', 'HASH40 quantifier', '[0-9a-f]{40}', '[0-9a-f]{39}', '39 hex digits'],
  ['M25', 'HASH40 trailing boundary', '[0-9a-f]{40}\\b', '[0-9a-f]{40}', 'trailing \\b dropped'],
  ['M26', 'SHONEN box threshold', 'if (boxes < 4)', 'if (boxes < 3)', 'threshold 4 -> 3'],
  ['M27', 'SHONEN box threshold', 'if (boxes < 4)', 'if (boxes < 5)', 'threshold 4 -> 5'],
  ['M28', 'SHONEN box regex space alt', '/^\\s*[-*]\\s*\\[[x~ ]\\]/', '/^\\s*[-*]\\s*\\[[x~]\\]/', 'unchecked box [ ] not counted'],
  ['M29', 'SHONEN box regex bullet alt', '[-*]\\s*\\[[x~ ]\\]', '-\\s*\\[[x~ ]\\]', 'star bullet dropped'],
  ['M30', 'SHONEN uniqueness test', 'if (sh.length !== 1)', 'if (sh.length < 1)', 'multiple headings tolerated'],
  ['M31', 'SHONEN box scan start', ".split('\\n').slice(1)", ".split('\\n')", 'heading line kept in the scan'],
  ['M32', 'line() label arm', '(l.includes(label) && new RegExp(', '(true && new RegExp(', 'label match dropped from the second arm'],
  ['M33', 'line() exact arm', 'l.includes(`${label} held=${x}/${y}`) ||', 'l.includes(label) ||', 'first arm weakened to label-only'],
  ['M34', 'line() x/y boundary', 'new RegExp(`held=${x}/${y}\\\\b`)', 'new RegExp(`held=${x}/${y}`)', 'trailing \\b dropped'],
  ['M35', 'TALLY any-line test', 'if (!allLines.some(line))', 'if (!allLines.every(line))', 'some -> every'],
  ['M36', 'RECEIPT_MISSING test', 'if (!receiptNames.has(m))', 'if (receiptNames.has(m))', 'inverted'],
  ['M37', 'receipt dirs', "const dirs = ['base', 'close'];", "const dirs = ['base'];", 'close/ receipts never read'],
  ['M38', 'round-scoped rel dir', '`.ufo/waves/round-${round}/${d}`', '`.ufo/waves/round-9/${d}`', 'round hardcoded to 9'],
  ['M39', 'round-scoped RECEIPT_PATH', '`\\\\.ufo/waves/round-${round}/', '`\\\\.ufo/waves/round-\\\\d+/', 'RECEIPT_PATH accepts any round'],
  ['M40', 'ancestor direction', "['merge-base', '--is-ancestor', h, tip]", "['merge-base', '--is-ancestor', tip, h]", 'arguments swapped'],
  ['M41', 'ancestor exit test', "'--is-ancestor', h, tip]).status !== 0", "'--is-ancestor', h, tip]).status === 0", 'inverted'],
  ['M42', 'ancestor repo gate', 'if (inLane && git(lane,', 'if (inFleet && git(lane,', 'gated on fleet resolution'],
  ['M43', 'tip fallback', "const tip = rev || git(lane, ['rev-parse', 'HEAD']).stdout.trim();", 'const tip = rev;', 'no HEAD fallback'],
  ['M44', 'tip honours rev', "const tip = rev || git(lane, ['rev-parse', 'HEAD']).stdout.trim();", "const tip = git(lane, ['rev-parse', 'HEAD']).stdout.trim();", 'rev ignored'],
  ['M45', 'HASH commit peel', "const inLane = git(lane, ['cat-file', '-e', `${h}^{commit}`])", "const inLane = git(lane, ['cat-file', '-e', `${h}`])", 'any object, not a commit'],
  ['M46', 'exit code usage', "process.exit(64);", 'process.exit(1);', 'usage exit 64 -> 1'],
  ['M47', 'exit code rev fail-closed', 'rev-unreadable ${revFull}\\n`); process.exit(2);', 'rev-unreadable ${revFull}\\n`); process.exit(1);', 'rev-unreadable exit 2 -> 1'],
  ['M48', 'exit code report fail-closed', 'report-unreadable ${report}\\n`); process.exit(2);', 'report-unreadable ${report}\\n`); process.exit(1);', 'report-unreadable exit 2 -> 1'],
  ['M49', 'exit code DRIFT', 'return { code: 1, out:', 'return { code: 2, out:', 'DRIFT exit 1 -> 2'],
  ['M50', 'exit code CLEAN', 'return { code: 0, out:', 'return { code: 3, out:', 'CLEAN exit 0 -> 3'],
  ['M51', 'main exit propagation', 'process.exit(r.code);', 'process.exit(0);', 'main always exits 0'],
  ['M52', 'selftest exit propagation', 'process.exit(pass === results.length ? 0 : 1);', 'process.exit(0);', 'selftest always exits 0'],
  ['M53', 'finding id PLACEHOLDER', "add('PLACEHOLDER', m[0])", "add('PLACEHOLDERS', m[0])", 'id renamed'],
  ['M54', 'finding id SECTION_MISSING', "add('SECTION_MISSING', name)", "add('SECTION_MISSIN', name)", 'id renamed'],
  ['M55', 'finding id SHONEN_COUNT (headings)', "add('SHONEN_COUNT', `headings=", "add('SHONEN_COUNTS', `headings=", 'id renamed on the headings arm'],
  ['M56', 'finding id RECEIPT_MISSING', "add('RECEIPT_MISSING', m)", "add('RECEIPT_MISSIN', m)", 'id renamed'],
  ['M57', 'finding id TALLY_UNRECEIPTED', "add('TALLY_UNRECEIPTED', key)", "add('TALLY_UNRECEIPT', key)", 'id renamed'],
  ['M58', 'finding id HASH_DEAD', "add('HASH_DEAD', h)", "add('HASH_DEADS', h)", 'id renamed'],
  ['M59', 'finding id HASH_ORPHAN', "add('HASH_ORPHAN', h)", "add('HASH_ORPHANS', h)", 'id renamed'],
  ['M60', 'fleet autodetect', "existsSync(join(dirname(laneAbs), '.git'))", "existsSync(join(laneAbs, '.git'))", 'probes lane/.git instead of parent'],
  ['M61', 'rev ls-tree guard', 'if (ls.status !== 0) continue;', 'if (false) continue;', 'unreadable rev no longer skipped'],
  ['M62', 'rev show guard', 'if (b.status === 0) receiptNames.set(f, b.stdout);', 'if (true) receiptNames.set(f, b.stdout);', 'failed show still registered'],
  ['M63', 'hash dedupe', 'for (const h of new Set(text.match(HASH40) || []))', 'for (const h of (text.match(HASH40) || []))', 'per-occurrence hashes'],
  ['M64', 'render id dedupe', 'const ids = [...new Set(findings.map((f) => f.id))].join(",");'.replace(/"/g, "'"), 'const ids = findings.map((f) => f.id).join(\',\');', 'duplicate ids in the DRIFT header'],
  ['M65', 'clean/drift switch', 'if (!findings.length) return { code: 0', 'if (findings.length) return { code: 0', 'inverted'],
  ['M66', 'section test inversion', 'if (!re.test(text)) add(\'SECTION_MISSING\'', "if (re.test(text)) add('SECTION_MISSING'", 'inverted'],
  ['M67', 'rev-verify guard', 'if (rv.status !== 0) {', 'if (false) {', 'unreadable rev accepted'],
  ['M68', 'SHONEN heading anchor', 'matchAll(/^#{1,6}\\s*\\**\\s*SHONEN/gim)', 'matchAll(/#{1,6}\\s*\\**\\s*SHONEN/gim)', '^ dropped from the SHONEN scan'],
  ['M69', 'SHONEN box anchor', 'rest.filter((l) => /^\\s*[-*]', 'rest.filter((l) => /\\s*[-*]', '^ dropped from the box regex'],
  ['M70', 'HASH40 leading boundary', 'const HASH40 = /\\b', 'const HASH40 = /', 'leading \\b dropped'],
];

const out = [];
for (const [id, target, find, replace, note] of M) {
  if (only && !only.has(id)) continue;
  const hits = pristine.split(find).length - 1;
  if (hits !== 1) { out.push({ id, target, note, find, replace, build: `find-occurrences=${hits}`, verdict: 'BUILD-ERROR' }); continue; }
  const file = join(WORK, 'muts', `mut-${id}.mjs`);
  writeFileSync(file, pristine.replace(find, replace));
  const s = selftest(file);
  const c = controls(file);
  const verdict = s.killed ? 'KILLED-SELFTEST' : c.killed ? 'KILLED-CONTROLS' : 'SURVIVOR';
  out.push({ id, target, note, find, replace, verdict, selftest: s.why, controls: c.killed ? c.bad.join(' ') : `all-${cases.length}-match` });
  process.stdout.write(`${id} ${verdict} selftest=${s.why} controls=${c.killed ? c.bad.length : 0}bad  [${note}]\n`);
}
writeFileSync(join(WORK, 'mutant-results.json'), JSON.stringify({ cases: cases.length, results: out }, null, 2));
const by = (v) => out.filter((r) => r.verdict === v).map((r) => r.id);
process.stdout.write(`\nTOTAL ${out.length} | KILLED-SELFTEST ${by('KILLED-SELFTEST').length} | KILLED-CONTROLS ${by('KILLED-CONTROLS').length} | SURVIVOR ${by('SURVIVOR').length} | BUILD-ERROR ${by('BUILD-ERROR').length}\n`);
process.stdout.write(`SURVIVORS: ${by('SURVIVOR').join(',') || '(none)'}\nBUILD-ERRORS: ${by('BUILD-ERROR').join(',') || '(none)'}\n`);
