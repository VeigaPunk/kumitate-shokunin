# Patch — `scripts/report-receipt-diff.mjs` v2 → v3 (structure arms)

Proposed by seat `K64R2CriticForgeStruct` (round 64, wave 2). Contract string would become
`kumitate-report-receipt-diff-v3`. Nothing here relaxes an existing check: every arm is additive, and the one
changed check (`SHONEN_COUNT` box counting) is a tightening.

Verification of this patch as written: `structure-arms.mjs` (same code, exported), `patched-tool.mjs` (v2
`diffReport` + these arms, same CLI/render), `forge.mjs` (14 one-lie fixtures), `matrix.mjs` (24 real fleet
reports rounds 40..63 + the fixtures). Output in `matrix.txt`; the round-64 report draft
(`build/K64R2ScribeReportDraft/report-draft.md`) reads CLEAN under every arm.

## 1. Doc comment — add to the findings list

```
 *   SECTION_EMPTY      a required heading whose section carries no content of its own (a heading with an empty
 *                      body is a table of contents, not a report)
 *   SECTION_ORDER      the six required headings out of the contract order
 *   SHONEN_NO_POINTER  a SHONEN box whose bullet carries no evidence pointer (backticked token, path with an
 *                      extension, 7..40 hex citation, or a verifier marker)
 *   SHONEN_UNASSERTED  a SHONEN section whose boxes are all `[ ]` — the assessment asserts nothing
 *   SHONEN_X_VERIFIER  an `[x]` box naming no verifier (PROTOCOL: "Each checked box names its reviewer")
 *   SHONEN_X_SELF      an `[x]` box that admits the verifier is the lane itself ("still the lane",
 *                      "author attestation") — PROTOCOL: "a subagent the lane dispatched is still the lane"
 *   CITE_ABSENT        no 39/40-hex commit citation anywhere in the prose (PROTOCOL: the report "must cite
 *                      that commit's hash"; a checkable citation is required)
 *   SOURCES_UNRECORDED the `Sources & frontier` section carries neither rows before→after nor a `SOURCES:` line
 *   TREND_MISSING      the `Trend verdicts` section omits one of Expansion / Quality / Discernment
 *   ROUND_UNNAMED      the report never names its own round (`round <N>`) — bytes for another round are not
 *                      this round's report
 *   STALE_LANE_UNNAMED no progressing/silent statement (PROTOCOL stale-lane actuator)
 *   LOG_UNNAMED        no `LOG.md` tie (PROTOCOL: changes landed "each tied to a `LOG.md` entry") — OPTIONAL,
 *                      see §6
```

## 2. Constants — paste after `const HASH = ...`

```js
// A box is a mark that opens a bullet; a mark quoted inside prose is a quotation, not an assessment
// (round-49's filed report has one: "No box is promoted to `[x]`").
const BOX_LINE = /^\s*[-*]\s+`?\[([xX~ ])\]`?/;
const BOX_MARK = /`?\[([xX~ ])\]`?/g;
const POINTER = /`[^`]+`|\b[0-9a-fA-F]{7,40}\b|[\w./-]+\.(?:md|txt|mjs|js|sh|json|ya?ml|png|bundle|log)\b|verifier/i;
const VERIFIER = /verifier|verified by|spot-check/i;
const SELF_X = /still the lane|author attestation/i;
const SOURCES_OK = /SOURCES|\b\d+\s*(?:→|->)\s*\*{0,2}\d+|rows?\s+(?:added|touched|before)/i;
const TRENDS = [['Expansion', /expansion/i], ['Quality', /quality/i], ['Discernment', /discernment/i]];
const CITE = /\b[0-9a-fA-F]{39,40}\b/;
const STALE = /stale[-\s]?lane|progressing|silent|no other mission/i;
const LOG_TIE = /LOG\.md/;
```

## 3. Helpers — paste after `unfence`

```js
// Section slice: the body of the first heading matching each REQUIRED pattern, up to the next heading of the
// same or a higher level. `start` is -1 when the heading is absent (SECTION_MISSING already covers that).
function sectionSlices(prose) {
  const lines = prose.split('\n');
  return REQUIRED.map(([name, re]) => {
    const i = lines.findIndex((l) => re.test(l));
    if (i < 0) return { name, level: 0, start: -1, body: '' };
    const level = lines[i].trim().match(/^#+/)[0].length;
    const body = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const h = /^(#{1,6})\s/.exec(lines[j]);
      if (h && h[1].length <= level) break;
      body.push(lines[j]);
    }
    return { name, level, start: i, body: body.join('\n') };
  });
}
// A body is substantive when it carries a line of its own (not a subheading) of >= 4 characters.
const substantive = (body) => body.split('\n').some((l) => !/^\s*#{1,6}\s/.test(l) && l.trim().length >= 4);
// Box bullets inside the SHONEN section: `head` is the mark-initial line, `text` adds its continuation lines.
function boxBullets(prose, sh) {
  const lines = prose.split('\n');
  const bullets = [];
  let cur = null;
  for (let j = sh.start + 1; j < lines.length; j += 1) {
    const h = /^(#{1,6})\s/.exec(lines[j]);
    if (h && h[1].length <= sh.level) break;
    if (BOX_LINE.test(lines[j])) { cur = { line: j + 1, head: lines[j], text: lines[j] }; bullets.push(cur); }
    else if (cur && lines[j].trim()) cur.text += ` ${lines[j].trim()}`;
  }
  return bullets;
}
```

## 4. Replace the existing SHONEN block in `diffReport` (the `sh.length !== 1` else-branch)

```js
  const slices = sectionSlices(prose);
  for (const s of slices) if (s.start >= 0 && !substantive(s.body)) add('SECTION_EMPTY', `${s.name} (${s.body.trim().length} bytes)`);
  const order = slices.filter((s) => s.start >= 0);
  for (let i = 1; i < order.length; i += 1) {
    if (order[i].start < order[i - 1].start) { add('SECTION_ORDER', `${order[i].name} before ${order[i - 1].name}`); break; }
  }
  const sh = slices.find((s) => s.name === 'SHONEN');
  const shCount = [...prose.matchAll(/^#{1,6}\s*\**\s*SHONEN/gim)].length;
  if (shCount !== 1) add('SHONEN_COUNT', `headings=${shCount}`);
  else {
    const bullets = boxBullets(prose, sh);
    let boxes = 0;
    for (const b of bullets) boxes += (b.head.match(BOX_MARK) || []).length; // marks on a mark-initial line only
    if (boxes < 4) add('SHONEN_COUNT', `boxes=${boxes}`);
    const marked = bullets.map((b) => ({ mark: BOX_LINE.exec(b.head)[1], line: b.line, text: b.text }));
    for (const m of marked) if (!POINTER.test(m.text)) add('SHONEN_NO_POINTER', `line ${m.line} [${m.mark}]`);
    if (marked.length && !marked.some((m) => m.mark === 'x' || m.mark === 'X' || m.mark === '~')) add('SHONEN_UNASSERTED', `boxes=${marked.length}`);
    for (const m of marked) {
      if (m.mark !== 'x' && m.mark !== 'X') continue;
      if (!VERIFIER.test(m.text)) add('SHONEN_X_VERIFIER', `line ${m.line}`);
      else if (SELF_X.test(m.text)) add('SHONEN_X_SELF', `line ${m.line}`);
    }
  }
```

Notes on the two semantic changes:
- `SHONEN_COUNT` now counts marks only on a bullet's **own** line (continuations still count for the pointer
  check, but a `[x]` quoted in a continuation is not a box). Round 48's filed report keeps 4 boxes (three
  bullets, the third carrying two boxes on one line) — verified in `matrix.txt`.
- `SHONEN_X_*` read the **leading** mark only, so a bullet that quotes `[x]` mid-sentence is not graded.

## 5. Append before `return findings;`

```js
  if (!CITE.test(prose)) add('CITE_ABSENT', 'no 39/40-hex citation in prose');
  const src = slices.find((s) => s.name === 'Sources & frontier');
  if (src.start >= 0 && !SOURCES_OK.test(src.body)) add('SOURCES_UNRECORDED', 'no rows before→after and no SOURCES line');
  const tr = slices.find((s) => s.name === 'Trend verdicts');
  if (tr.start >= 0) {
    const absent = TRENDS.filter(([, re]) => !re.test(tr.body)).map(([n]) => n);
    if (absent.length) add('TREND_MISSING', absent.join(','));
  }
  if (round && !new RegExp(`round[\\s-]*${round}\\b`, 'i').test(prose)) add('ROUND_UNNAMED', `round ${round} not named`);
  if (!STALE.test(prose)) add('STALE_LANE_UNNAMED', 'no progressing/silent statement');
  if (!LOG_TIE.test(prose)) add('LOG_UNNAMED', 'no LOG.md tie');
```

## 6. Adoption order (what each arm buys, measured)

| arm | closes | real reports flagged in 40..63 | r63 | round-64 draft |
|---|---|---|---|---|
| SECTION_EMPTY | six headings with empty bodies (174-byte report reads CLEAN today) | none | CLEAN | CLEAN |
| SECTION_ORDER | the six headings in the wrong order | none | CLEAN | CLEAN |
| SHONEN_COUNT (tightened) | four prose bullets each quoting `[x]` | none | CLEAN | CLEAN |
| SHONEN_NO_POINTER | four `[ ]` boxes claiming nothing | r41:179, r44:93, r45:156, r46:95, r47:86, r49:112 | CLEAN | CLEAN |
| SHONEN_UNASSERTED | all boxes `[ ]` | none | CLEAN | CLEAN |
| CITE_ABSENT | a report with no commit citation | none | CLEAN | CLEAN |
| SOURCES_UNRECORDED | a frontier section that records nothing | none | CLEAN | CLEAN |
| TREND_MISSING | one generic "all trends improved" | none | CLEAN | CLEAN |
| ROUND_UNNAMED | another round's bytes passed as this round's report | none | CLEAN | CLEAN |
| STALE_LANE_UNNAMED | no progressing/silent statement | r61 | CLEAN | CLEAN |
| SHONEN_X_VERIFIER | `[x]` with no named verifier | none | CLEAN | CLEAN |
| SHONEN_X_SELF | `[x]` whose verifier is the lane | r59:174, r60:193 | CLEAN | CLEAN |
| LOG_UNNAMED (OPTIONAL) | no `LOG.md` tie | r58, r60 (both write "LOG" — wording-level) | CLEAN | CLEAN |

`LOG_UNNAMED` is the only arm whose real instances are wording rather than a false claim: adopt it only if the
lane wants the literal `LOG.md` tie enforced. `SHONEN_X_SELF` and `SHONEN_X_VERIFIER` are marker checks — they
catch an honest-but-wrong `[x]`, not a determined forger (which simply omits the admission).

## 7. Selftest — the integration cost, exactly

Every existing case goes through `body()`, whose SHONEN boxes are `- [~] a` … with no pointer, no hash, no
`sources` rows, a one-word Trend section and no stale-lane line. Under the arms `body()` itself reads
`CITE_ABSENT,LOG_UNNAMED,SECTION_EMPTY,SHONEN_NO_POINTER,SOURCES_UNRECORDED,STALE_LANE_UNNAMED,TREND_MISSING`,
so **`body()` must be replaced by a conformant base** (verified CLEAN under `patched-tool.mjs` in a fixture
repo: `REPORT_RECEIPT: CLEAN (round=9 rev=c0c15dde… bytes=849)`), and the three literal fixtures must carry new
expectations.

Replacement `body()` (keeps every exact-id case's expectation):

```js
  const body = (extra = '', skip = '') => [
    '# report — round 9', skip === 'wp' ? '' : '## Work performed', '`probe.mjs` exit 0 at `' + c1 + '`.',
    '## Landed changes', '- `' + c1 + '` — round work; `LOG.md` round-9 entry.',
    '## Before → after measurements',
    'X9_UNMET held=0/3 base (`.ufo/waves/round-9/base/p-base.txt`); X9_HELD held=3/3 tip (`.ufo/waves/round-9/close/p-tip.txt`).',
    '## Sources & frontier', 'Rows 1 → 2 (`corpus/SOURCES.md`); `SOURCES_CHECK: CLEAN rows=2`.',
    '## Trend verdicts', '- **Expansion — improved.** `corpus/SOURCES.md`.', '- **Quality — improved.** `LOG.md`.',
    '- **Discernment — improved.** `LOG.md`.',
    skip === 'sh' ? '' : '## SHONEN', '- [~] a — `SKILL.md:1`; author assertion.', '- [~] b — `LOG.md`; author assertion.',
    '- [ ] c — `LOG.md`', '- [~] d — `PROVINCE.md`; author assertion.',
    'Stale-lane: no other mission of this lane is open. Tool installs: none.', extra,
  ].join('\n');
```

Two consequences to check when pasting: `t('shonen-short', …)` strips `'- [~] d'` (still matches the new text),
and `t('shonen-two-boxes-one-line', …)` merges `'- [~] a\n- [~] b'` (still matches).

The three literal fixtures change expectation as follows (arm ids unioned with the ids the v2 tool already
returns; computed, not guessed):

```js
  t('sections-in-fence', ids(fenceAll) === 'CITE_ABSENT,LOG_UNNAMED,ROUND_UNNAMED,SECTION_MISSING,SHONEN_COUNT,STALE_LANE_UNNAMED');
  t('shonen-in-fence', ids(shonenFenced) === 'CITE_ABSENT,LOG_UNNAMED,ROUND_UNNAMED,SECTION_EMPTY,SECTION_MISSING,SHONEN_COUNT,SOURCES_UNRECORDED,STALE_LANE_UNNAMED,TREND_MISSING');
  t('shonen-boxes-outside-section', ids(boxesElsewhere) === 'CITE_ABSENT,LOG_UNNAMED,ROUND_UNNAMED,SECTION_EMPTY,SHONEN_COUNT,SOURCES_UNRECORDED,STALE_LANE_UNNAMED,TREND_MISSING');
```

(cleaner: rebuild those three literals from the conformant body with the single defect each, which keeps one id
per case — the fixtures in `fixtures/` are exactly that shape.)

New cases (each backed by a fixture that reads CLEAN under v2 and DRIFT under v3):

```js
  // v3 structure arms (round-64 wave-2 forge, K64R2CriticForgeStruct)
  t('section-empty', ids(body().replace('`probe.mjs` exit 0 at `' + c1 + '`.', '')) === 'SECTION_EMPTY');
  t('section-order', ids(body().replace('## Work performed', '## TMP').replace('## Landed changes', '## Work performed').replace('## TMP', '## Landed changes')) === 'SECTION_ORDER');
  t('shonen-prose-boxes', ids(body().replace(/- \[~\] a/g, '- No box is promoted to `[x]`').replace(/- \[~\] b/g, '- No box is promoted to `[x]`').replace(/- \[ \] c/g, '- No box is promoted to `[x]`').replace(/- \[~\] d/g, '- No box is promoted to `[x]`')) === 'SHONEN_COUNT');
  t('shonen-no-pointer', ids(body().replace('- [~] a — `SKILL.md:1`; author assertion.', '- [~] a')) === 'SHONEN_NO_POINTER');
  t('shonen-unasserted', ids(body().replace(/- \[~\] /g, '- [ ] ')) === 'SHONEN_UNASSERTED');
  t('shonen-x-verifier', ids(body().replace(/- \[~\] /g, '- [x] ').replace(/; author assertion\./g, '')) === 'SHONEN_X_VERIFIER');
  t('shonen-x-self', ids(body().replace(/- \[~\] /g, '- [x] ').replace(/; author assertion\./g, '; verifier: this round\'s seats; those seats are still the lane.')) === 'SHONEN_X_SELF');
  t('cite-absent', ids(body().replace(new RegExp(c1, 'g'), 'the tip')) === 'CITE_ABSENT');
  t('sources-unrecorded', ids(body().replace('Rows 1 → 2 (`corpus/SOURCES.md`); `SOURCES_CHECK: CLEAN rows=2`.', 'Unchanged.')) === 'SOURCES_UNRECORDED');
  t('trend-missing', ids(body().replace(/- \*\*Quality — improved\.\*\* `LOG\.md`\.\n/, '')) === 'TREND_MISSING');
  t('round-unmanned', ids(body().replace(/round[- ]9/g, 'round-8')) === 'ROUND_UNNAMED');
  t('stale-lane-unmanned', ids(body().replace(/^Stale-lane:.*$/m, 'Tool installs: none.')) === 'STALE_LANE_UNNAMED');
  t('log-unmanned', ids(body().replace(/`LOG\.md`/g, '`SKILL.md`')) === 'LOG_UNNAMED');
```

All thirteen were run against `patched-tool.mjs` in a fixture repo shaped like the selftest's (`mktemp -d`,
`git init`, round-9 `base`/`close` receipts, one commit `c0c15dde4b75af8b0b63ad98c59f631bcf3635c6`); each case
printed exactly the id in its assertion and the unmodified `body()` printed
`REPORT_RECEIPT: CLEAN (round=9 rev=c0c15dde… bytes=835)`.
