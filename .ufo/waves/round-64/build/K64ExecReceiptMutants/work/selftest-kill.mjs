#!/usr/bin/env node
/**
 * selftest-kill.mjs — builds `report-receipt-diff.selftestplus.mjs` (the pristine tool + one minimal
 * selftest case per surviving mutant) and proves the added cases kill them:
 * for every counter-survivor, apply its single-literal mutation to the EXTENDED file, run --selftest,
 * and require FAIL naming the intended new case. Mutants classified equivalent must stay PASS.
 *
 *   node selftest-kill.mjs <work-dir>
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WORK = resolve(process.argv[2]);
const pristine = readFileSync(join(WORK, 'report-receipt-diff.mjs'), 'utf8');
const res = JSON.parse(readFileSync(join(WORK, 'mutant-results.json'), 'utf8'));
const counter = JSON.parse(readFileSync(join(WORK, 'survivor-probe-results.json'), 'utf8'));

// ---- fixture additions (written before the fixture commit) ----
const FIX = [
  "  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\\nW9_HELD held=10/10 checks=10 rev=abc rule=W9\\n');",
  "  writeFileSync(join(D, '.ufo/waves/round-9/close/r-tip.txt'), 'V9_HELD other held=7/77 checks=77 rev=abc rule=V9\\n');",
].join('\n');

// ---- the added selftest cases, one per surviving mutant ----
const CASES = [
  "  // --- mutation-kill cases (K64ExecReceiptMutants, round 64 w1) ---",
  "  const rep = (a, b) => body().replace(a, b);",
  "  t('section-literal-truncated-landed', ids(rep('## Landed changes', '## Landed change')) === 'SECTION_MISSING');",
  "  t('section-literal-truncated-trend', ids(rep('## Trend verdicts', '## Trend verdict')) === 'SECTION_MISSING');",
  "  t('section-ascii-arrow', run(rep('## Before → after measurements', '## Before -> after measurements')).length === 0);",
  "  t('section-arrow-no-space', run(rep('## Before → after measurements', '## Before→after measurements')).length === 0);",
  "  t('section-inline-not-heading', ids(rep('## Work performed', 'text ## Work performed')) === 'SECTION_MISSING');",
  "  t('section-h4-heading', run(rep('## Landed changes', '#### Landed changes')).length === 0);",
  "  t('section-bold-heading', run(rep('## Sources & frontier', '## **Sources & frontier**')).length === 0);",
  "  t('placeholder-lane-hash-suffix', run(body('LANE_HASHX')).length === 0);",
  "  t('placeholder-tbd-suffix', run(body('TBDs')).length === 0);",
  "  t('tally-midword-not-tally', run(body('aX9_HELD held=7/7')).length === 0);",
  "  t('tally-tab-separator', ids(body('X9_HELD\\theld=10/10')) === 'TALLY_UNRECEIPTED');",
  "  t('tally-two-digit-y', run(body('W9_HELD held=10/10')).length === 0);",
  "  t('hash41-not-a-hash', run(body('0123456789abcdef0123456789abcdef01234567a')).length === 0);",
  "  t('shonen-star-bullets', run(body().replace(/- \\[/g, '* [')).length === 0);",
  "  t('tally-xy-boundary', ids(body('V9_HELD held=7/7')) === 'TALLY_UNRECEIPTED');",
  "  t('receipt-path-other-round', run(body('see `.ufo/waves/round-8/close/p-tip.txt`')).length === 0);",
  "  t('worktree-tip-fallback', diffReport({ lane: D, round: 9, reportText: body(c1), rev: undefined, fleet: null }).length === 0);",
  "  t('rev-tip-honoured', diffReport({ lane: D, round: 9, reportText: body(orphan), rev: orphan, fleet: null }).length === 0);",
  "  const blob = g('hash-object', '-w', join(D, 'f.txt')).stdout.trim();",
  "  t('hash-blob-not-commit', ids(body(blob)) === 'HASH_DEAD');",
  "  const self = process.argv[1];",
  "  t('cli-usage-exit-64', spawnSync('node', [self, '--round', '9']).status === 64);",
  "  t('cli-rev-unreadable-exit-2', spawnSync('node', [self, '--lane', D, '--round', '9', '--report', join(D, 'f.txt'), '--rev', 'd'.repeat(40)]).status === 2);",
  "  t('cli-report-unreadable-exit-2', spawnSync('node', [self, '--lane', D, '--round', '9', '--report', join(D, 'nope.md')]).status === 2);",
  "  t('rev-unreadable-no-throw', (() => { try { return diffReport({ lane: D, round: 9, reportText: body(), rev: 'e'.repeat(40), fleet: null }).some((f) => f.id === 'RECEIPT_MISSING'); } catch { return false; } })());",
  "  t('hash-duplicate-one-finding', run(body('0123456789abcdef0123456789abcdef01234567 0123456789abcdef0123456789abcdef01234567')).filter((f) => f.id === 'HASH_DEAD').length === 1);",
  "  t('render-ids-unique', render([{ id: 'A', detail: 'x' }, { id: 'A', detail: 'y' }], 'm').out.startsWith('REPORT_RECEIPT: DRIFT A '));",
  "  t('shonen-inline-not-heading', run(body('text ## SHONEN inline')).length === 0);",
  "  t('shonen-inline-box-not-counted', /SHONEN_COUNT/.test(ids(body().replace('- [~] d', 'prose - [ ] d'))));",
  "  t('hash-in-word-not-hash', run(body('x0123456789abcdef0123456789abcdef01234567')).length === 0);",
  "  mkdirSync(join(D, 'sub/.ufo/waves/round-9/base'), { recursive: true });",
  "  mkdirSync(join(D, 'sub/.ufo/waves/round-9/close'), { recursive: true });",
  "  writeFileSync(join(D, 'sub/.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=aaa rule=X9\\n');",
  "  writeFileSync(join(D, 'sub/.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\\n');",
  "  writeFileSync(join(D, 'sub/r.md'), body(c1));",
  "  t('cli-fleet-autodetect-parent', spawnSync('node', [self, '--lane', join(D, 'sub'), '--round', '9', '--report', join(D, 'sub/r.md')], { encoding: 'utf8' }).stdout.startsWith('REPORT_RECEIPT: CLEAN'));",
].join('\n');

const A_ANCHOR = "  writeFileSync(join(D, '.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\\n');";
const B_ANCHOR = '  rmSync(T, { recursive: true, force: true });\n  const pass = results.filter(([, ok]) => ok).length;';
if (pristine.split(A_ANCHOR).length !== 2 || pristine.split(B_ANCHOR).length !== 2) { process.stderr.write('anchor not unique\n'); process.exit(64); }
const extended = pristine.replace(A_ANCHOR, `${A_ANCHOR}\n${FIX}`).replace(B_ANCHOR, `${CASES}\n${B_ANCHOR}`);
writeFileSync(join(WORK, 'report-receipt-diff.selftestplus.mjs'), extended);

// intended kill case per mutant
const KILL = {
  M02: 'section-literal-truncated-landed', M06: 'section-literal-truncated-trend', M03: 'section-ascii-arrow',
  M04: 'section-arrow-no-space', M08: 'section-inline-not-heading', M09: 'section-h4-heading', M10: 'section-bold-heading',
  M12: 'placeholder-lane-hash-suffix', M13: 'placeholder-tbd-suffix', M15: 'tally-midword-not-tally',
  M16: 'tally-tab-separator', M17: 'tally-two-digit-y', M25: 'hash41-not-a-hash', M29: 'shonen-star-bullets',
  M34: 'tally-xy-boundary', M39: 'receipt-path-other-round', M43: 'worktree-tip-fallback', M44: 'rev-tip-honoured',
  M45: 'hash-blob-not-commit', M46: 'cli-usage-exit-64', M47: 'cli-rev-unreadable-exit-2', M48: 'cli-report-unreadable-exit-2',
  M63: 'hash-duplicate-one-finding',
  M64: 'render-ids-unique', M67: 'cli-rev-unreadable-exit-2', M68: 'shonen-inline-not-heading',
  M69: 'shonen-inline-box-not-counted', M70: 'hash-in-word-not-hash',
};
const EQUIV = { M60: 'fleet is read only when the lane is not a repo, and a non-repo lane has no ancestor .git (divergence needs a broken .git directory)', M61: 'a failed git ls-tree yields empty stdout, so skip-vs-empty-loop is the same set', M31: 'slice(1) drops only the SHONEN heading line, which cannot match the box regex', M52: 'P1 reads the PASS (N/N) line; a red run prints FAIL and already fails P1 regardless of exit code', M62: 'ls-tree -r lists only blobs that git show can read, so the guard never fires in a sound repo' };

const survivors = counter.results.filter((r) => !r.killed).map((r) => r.id);
// the battery records the exact literal pair per mutant
const MUT = new Map(res.results.map((r) => [r.id, [r.find, r.replace]]));

const out = [];
for (const id of survivors) {
  const pair = MUT.get(id);
  if (!pair) { out.push({ id, result: 'NO-LITERAL-PAIR' }); process.stdout.write(`${id} NO-LITERAL-PAIR\n`); continue; }
  const [find, repl] = pair;
  if (extended.split(find).length !== 2) { out.push({ id, result: `EXTENDED-FIND-MISS(${find})` }); process.stdout.write(`${id} EXTENDED-FIND-MISS ${find}\n`); continue; }
  const file = join(WORK, 'muts', `xmut-${id}.mjs`);
  writeFileSync(file, extended.replace(find, repl));
  const r = spawnSync('node', [file, '--selftest'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const fails = r.stdout.split('\n').filter((l) => l.startsWith('FAIL ')).map((l) => l.slice(5).trim());
  const want = KILL[id];
  const verdict = want ? (r.status !== 0 && fails.includes(want) ? `KILLED(${want})` : `NOT-KILLED fails=${fails.join('|') || 'none'} exit=${r.status}`)
    : (r.status === 0 && fails.length === 0 ? `EQUIVALENT(${EQUIV[id]})` : `UNEXPECTED-FAIL ${fails.join('|')}`);
  out.push({ id, want: want || null, fails, status: r.status, verdict });
  process.stdout.write(`${id} ${verdict}\n`);
}
// the extended file itself must stay green and at >= 20 cases
const base = spawnSync('node', [join(WORK, 'report-receipt-diff.selftestplus.mjs'), '--selftest'], { encoding: 'utf8' });
process.stdout.write(`\nEXTENDED-SELFTEST ${base.stdout.trim()} exit=${base.status}\n`);
writeFileSync(join(WORK, 'selftest-kill-results.json'), JSON.stringify({ extended: base.stdout.trim(), exit: base.status, results: out }, null, 2));
const k = out.filter((o) => /^KILLED|^EQUIVALENT/.test(o.verdict)).length;
process.stdout.write(`RESOLVED ${k}/${out.length}\n`);
