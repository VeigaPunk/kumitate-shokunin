#!/usr/bin/env node
// gen-cases.mjs — generates the receipt-tool forgery controls for seat K64ExecReceiptForge.
// Each case is in the frozen control format: <case>/report.md, <case>/lane/, <case>/expect, <case>/note.md.
// Every report below is FALSE (a reader calls it a lie); `expect` is what a sound tool must print
// (line 1 exit code, line 2 comma-joined sorted finding ids or CLEAN).
import { mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CASES = join(HERE, 'cases');
rmSync(CASES, { recursive: true, force: true });

const R = '.ufo/waves/round-9';
const BASE = `X9_UNMET held=0/3 checks=3 rev=aaa rule=X9\n`;
const TIP_TRUE = `X9_HELD held=1/3 checks=3 rev=aaa rule=X9\n`; // the round's real result: 1/3
const Q = `Z9_HELD held=5/5 checks=5 rev=aaa rule=Z9\n`;

const head = `# kumitate — round 9

## Work performed
claims declared.

## Landed changes
log entry.
`;

const honestMeasure = (lie) => `## Before → after measurements
X9_UNMET held=0/3 at base (\`${R}/base/p-base.txt\`); ${lie} at tip (\`${R}/close/p-tip.txt\`).
`;

const tail = `
## Sources & frontier
SOURCES: unchanged — fixture.

## Trend verdicts
expansion improved.

## SHONEN
- [~] a
- [~] b
- [ ] c
- [~] d
`;

// report builder: parts overridable per case
const report = ({ measure = honestMeasure('X9_HELD held=1/3'), extra = '', work = head, end = tail }) =>
  `${work}${measure}${extra}${end}`;

const cases = [];
const mk = (name, { text, files = {}, links = {}, expect, note }) => cases.push({ name, text, files, links, expect, note });

// ---- 19 forgeries -------------------------------------------------------------------------
mk('k1-tally-spaced-eq', {
  text: report({ measure: honestMeasure('X9_HELD held = 3 / 3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'claims held = 3 / 3 (spaces) while the receipt says 1/3; TALLY needs `held=x/y` adjacent, so the claim is never parsed.',
});
mk('k2-tally-lowercase-label', {
  text: report({ measure: honestMeasure('x9_HELD held=3/3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'label written lower-case (x9_HELD); TALLY is case-sensitive, so a false 3/3 is never parsed.',
});
mk('k3-tally-table-cell', {
  text: report({
    measure: `## Before → after measurements
| claim | tally | receipt |
| --- | --- | --- |
| C1 | X9_HELD | held=3/3 |
base: X9_UNMET held=0/3 (\`${R}/base/p-base.txt\`).
`,
  }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'the false tally sits in a markdown table cell (`| X9_HELD | held=3/3 |`); the `|` breaks the `\\s+held=` join.',
});
mk('k4-tally-zero-width', {
  text: report({ measure: honestMeasure('X9_\u200bHELD held=3/3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'a U+200B inside the label; the label regex cannot see it, so the false 3/3 reads CLEAN (and so does a human skim).',
});
mk('k5-hash-uppercase-dead', {
  text: report({ extra: '\nfrozen at 0123456789ABCDEF0123456789ABCDEF01234567 (lane).\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nHASH_DEAD',
  note: 'a dead hash printed upper-case; HASH40 matches lower-case hex only.',
});
mk('k6-hash-39-digits', {
  text: report({ extra: '\nfrozen at 0123456789abcdef0123456789abcdef0123456 (lane).\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nHASH_DEAD',
  note: 'a dead hash truncated to 39 hex digits; `{40}` misses it, so a non-resolving "commit" reads CLEAN.',
});
mk('k7-placeholder-braces', {
  text: report({ extra: '\nmeasured at {{MEASURED_REV}}.\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nPLACEHOLDER',
  note: 'the unfilled token is spelled {{MEASURED_REV}}; PLACEHOLDER knows only `__NAME__`, LANE_HASH, TBD.',
});
mk('k8-placeholder-angle-measured', {
  text: report({ extra: '\nthe measured revision is <measured>.\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nPLACEHOLDER',
  note: 'a result placeholder in angle brackets; only `<tip>` was declared legitimate, `<measured>` is an unfilled value.',
});
mk('k9-placeholder-prose', {
  text: report({ extra: '\nthe tip hash is to be filled after the wave.\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nPLACEHOLDER',
  note: 'the unfilled token is prose ("to be filled"), invisible to the token regex.',
});
mk('k10-placeholder-xxxx', {
  text: report({ extra: '\nthe tip revision is XXXX.\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nPLACEHOLDER',
  note: 'the unfilled token is XXXX.',
});
mk('k11-placeholder-lowercase-token', {
  text: report({ extra: '\nthe tip revision is __measured__.\n' }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nPLACEHOLDER',
  note: 'the unfilled token is lower-case `__measured__`; the regex demands an upper-case head and two more chars.',
});
mk('k12-sections-in-fence', {
  text: `# kumitate — round 9

\`\`\`
## Work performed
## Landed changes
## Before → after measurements
X9_UNMET held=0/3 at base (\`${R}/base/p-base.txt\`); X9_HELD held=1/3 at tip (\`${R}/close/p-tip.txt\`).
## Sources & frontier
## Trend verdicts
## SHONEN
- [~] a
- [~] b
- [ ] c
- [~] d
\`\`\`

No prose headings: the six required sections exist only inside a fenced block.
`,
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nSECTION_MISSING,SHONEN_COUNT',
  note: 'all six headings (and the SHONEN block) live inside one fenced code block; the prose report has no sections at all.',
});
mk('k13-shonen-in-fence', {
  text: `${head}${honestMeasure('X9_HELD held=1/3')}
## Sources & frontier
SOURCES: unchanged — fixture.

## Trend verdicts
expansion improved.

\`\`\`
## SHONEN
- [~] a
- [~] b
- [ ] c
- [~] d
\`\`\`
`,
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nSECTION_MISSING,SHONEN_COUNT',
  note: 'the SHONEN ceremony is quoted inside a fence (an example, not a performed ceremony); the tool counts it as the section.',
});
mk('k14-receipt-path-escape', {
  text: report({
    extra: `\nthe same bytes are mirrored at \`${R}/close/p-tip.txt/../../../round-8/close/old.txt\`.\n`,
  }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nRECEIPT_MISSING',
  note: 'the cited receipt escapes the round-9 tree (`p-tip.txt/../../../round-8/close/old.txt`); the path regex stops at the first `/`, sees the valid prefix and reads CLEAN.',
});
mk('k15-receipt-symlink', {
  text: report({ measure: honestMeasure('X9_HELD held=3/3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/q-tip.txt`]: Q, 'outside/tip.txt': 'X9_HELD held=3/3 checks=3 rev=zzz rule=X9\n' },
  links: { [`${R}/close/p-tip.txt`]: '../../../../outside/tip.txt' },
  expect: '1\nRECEIPT_MISSING,TALLY_UNRECEIPTED',
  note: 'the round-9 tip receipt is a symlink to a file outside the lane tree (uncommitted, unaudited); readFileSync follows it, so the false 3/3 is "receipted".',
});
mk('k16-receipt-empty', {
  text: report({
    measure: `## Before → after measurements
X9_UNMET held=0/3 at base (\`${R}/base/p-base.txt\`); Z9_HELD held=5/5 at tip (\`${R}/close/q-tip.txt\`); the C1 tip receipt \`${R}/close/p-tip.txt\` confirms the claim.
`,
  }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: '', [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nRECEIPT_EMPTY',
  note: 'the report cites a zero-byte receipt as its confirmation; existence alone satisfies RECEIPT_MISSING, so the tool reads CLEAN.',
});
mk('k17-tally-base-only', {
  text: report({ measure: honestMeasure('X9_HELD held=3/3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/base/p-target.txt`]: 'X9_HELD held=3/3 target=plan\n', [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'a tip HELD claimed from a plan-target line in a base file; the cited close receipt says 1/3 and no close receipt says 3/3 — the wave results file for that claim is absent.',
});
mk('k18-tally-cited-mismatch', {
  text: report({ measure: honestMeasure('X9_HELD held=3/3') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/r-tip.txt`]: 'X9_HELD held=3/3 checks=3 rev=bbb rule=X9\n', [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_UNRECEIPTED',
  note: 'the claim 3/3 is carried by a superseded receipt (close/r-tip.txt) while the cited receipt (close/p-tip.txt) says 1/3; the tool never binds a tally to the file the report cites.',
});
mk('k19-shonen-boxes-outside', {
  text: `${head}${honestMeasure('X9_HELD held=1/3')}
## Sources & frontier
SOURCES: unchanged — fixture.

## Trend verdicts
expansion improved.

## SHONEN

## Appendix
- [~] a
- [~] b
- [ ] c
- [~] d
`,
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: TIP_TRUE, [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nSHONEN_COUNT',
  note: 'the SHONEN section is empty; four checkboxes sit under a later `## Appendix` heading and are counted as the ceremony.',
});

mk('k20-tally-checks-mismatch', {
  text: report({ measure: honestMeasure('X9_HELD held=3/3 checks=9') }),
  files: { [`${R}/base/p-base.txt`]: BASE, [`${R}/close/p-tip.txt`]: 'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\n', [`${R}/close/q-tip.txt`]: Q },
  expect: '1\nTALLY_CHECKS_MISMATCH',
  note: 'the claim inflates the check count (held=3/3 checks=9) while the receipt carrying 3/3 states checks=3; the tool compares x/y only.',
});

// ---- write -------------------------------------------------------------------------------
for (const c of cases) {
  const dir = join(CASES, c.name);
  mkdirSync(join(dir, 'lane'), { recursive: true });
  writeFileSync(join(dir, 'report.md'), c.text);
  writeFileSync(join(dir, 'expect'), `${c.expect}\n`);
  writeFileSync(join(dir, 'note.md'), `# ${c.name}\n\n${c.note}\n\nexpect: ${c.expect.replace('\n', ' / ')}\n`);
  for (const [rel, body] of Object.entries(c.files)) {
    mkdirSync(join(dir, 'lane', dirname(rel)), { recursive: true });
    writeFileSync(join(dir, 'lane', rel), body);
  }
  for (const [rel, target] of Object.entries(c.links)) {
    mkdirSync(join(dir, 'lane', dirname(rel)), { recursive: true });
    symlinkSync(target, join(dir, 'lane', rel));
  }
}
process.stdout.write(`cases=${cases.length} at ${CASES}\n`);
