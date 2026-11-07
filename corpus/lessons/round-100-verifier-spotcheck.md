# kumitate round 100 — verifier spot-check (non-author)

author: hyaku closure (non-author integrator, @m_zfl)

Date: 2026-11-07. Scope: lane-round kumitate r100, base `dc8b7e4aff45e7ac10193643f23b1866791d0345` →
tip `034e52b4f5dbea4686d6dc8d9e957b705f2e60da` (branch `master`). Report: fleet `.ufo/reports/round-100/kumitate.md`.
Driver digest (copied from mutable fleet `.ufo/watchdog.log`, lines 3165 and 3170):
`2026-11-07T04:17:04-03:00 launch kumitate round=100 pgid=2464492 driver=hyaku-inline attempt=1`;
`2026-11-07T05:05:45-03:00 complete kumitate round=100; hyaku-inline attempt=1`.

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %ae %H %ad' -- .ufo/reports/round-100/kumitate.md` (fleet) | `kumitate-shokunin kumitate@shokunin.local 2d46c25b9b1dbf5ed5bd2c4777e5c7d3d6c0d47a`, committed 05:05:17 -03:00 (before the 05:05:45 complete line) | pass |
| prompt | same on `.ufo/prompts/kumitate-round-100.md` | `8e3113fd` by kumitate-shokunin 04:17:02; template sections `## 1`–`## 5` (MISSION/AXES, claims, frontier, L2 floor, report contract, commit scope) + `## 6` hyaku addendum + `## 7` scratch discipline | pass |
| SHONEN | `grep -c '^## SHONEN'` on the report; `grep -nE '^\s*- \[' SHONEN.md` | heading 1; 4 report lines (3×`[~]`, 1×`[ ]`) for 4 SHONEN.md boxes | pass |
| cited lane commits | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> master` for 5e2f9856, 445196e4, 2abafa0e, 7c3bca09, 4897e20c, 173a5314, 034e52b4, base dc8b7e4a | all exist, all ancestors; `git rev-list --count dc8b7e4a..034e52b4` = 7, all authored kumitate-shokunin | pass |
| lane pushed/clean | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin` | `local=remote=034e52b4… ahead=0 behind=0 head=detached tracked=0 untracked=0` | pass |
| leftovers | `git status --porcelain \| wc -l` | `0` | pass |
| remote | `git ls-remote origin refs/heads/master` | `034e52b4f5dbea4686d6dc8d9e957b705f2e60da` | pass |
| wave | `jq` on `.ufo/waves/round-100/w1-results.json` @034e52b4 | 12 results (K100ExecTool, ExecHarm, ExecSection, ScribeSources, ScribeLesson, Scout, Connector, Reviewer, CriticA/B/C, Mutation) | pass |

Marker test: real report with seven resolvable lane commits → not a marker; status `ok`.

## 2. Claim C1 (operability) — re-check

Claim: `scripts/cite-sources.mjs` and `scripts/source-capture.mjs` recognise a SOURCES row id exactly as the census
`row_pass` does (LF record, 0–3 ASCII SP indent, SP/TAB id pad, `S`+3+ ASCII digits closed by `|`).

**Re-measured (by me):**

- Production diff: `git diff dc8b7e4a 034e52b4 -- scripts/cite-sources.mjs scripts/source-capture.mjs` — the only
  non-selftest code change is one reader line per tool:
  - cite (base :36 → tip :40): `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` → `/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/`
  - capture (base :157 → tip :159): `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` → `raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)`
- Census class read at fleet `scripts/sources-census.sh:574-640`: record per LF (gawk default `RS`), gate `^ {0,3}\|`,
  `trim` = `gsub(/^[ \t]+|[ \t]+$/,"",s)`, id valid iff `^S[0-9]{3,}$`. Census sets no `LC_ALL`; run here under
  `en_US.UTF-8`, GNU Awk 5.4.1, node v24.21.0.
- Own differential (generator mine, not the lane's counter): 11040 one-row `## Registry` documents over 4 record
  prefixes (`''`, `x\r`, `x\u2028`, `x\u2029`) × 10 indents (0–4 SP, TAB, NBSP, U+2003, CR, LS) × 14 left pads
  (SP, TAB, NBSP, U+2003, VT, FF, CR, BOM, LS, PS, U+3000, NEL, …) × 6 right pads × 7 ids (`S101`, `S1234`, `S12`,
  fullwidth digits, `s123`, `S123x`, 8 digits). Oracle = gawk running the `row_pass` id extraction verbatim. Output:
  `{"cases":11040,"disagree_vs_gawk_census_class":{"oldCite":324,"oldCap":3996,"nu":0}}` — base cite 324 and base
  capture 3996 disagreements, R100 reader **0**. Direction and sign match the report (42/64 → 0/0 on its 135-row
  battery; CriticC 115/203 → 0).
- K99 draft fix reject reproduced: `/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/gm` via `matchAll` on `x<sep>| S777 | x |\n`
  returns `["S777"]` for sep = CR, U+2028, U+2029; R100 returns `[]`; gawk on `x\r| S777 | x |` → not a row.
- Tool bytes: `git show <rev>:scripts/{cite-sources,source-capture}.mjs | sha256sum` → `da16e32b…`/`c9f22275…` at both
  4897e20c and 034e52b4 (= `pin.cite-sources` / `pin.source-capture` in SCORECARD; no script change after M2).
- SOURCES rows: `git show <rev>:corpus/SOURCES.md | grep -cE '^ {0,3}\| S[0-9]{3}'` → 217 at 5e2f9856, 219 at 034e52b4.
- `git diff dc8b7e4a 034e52b4 -- SCORECARD.md`: proxy `A_wave` 1755→1839, `C2`/`C2_total` 257→260, two pin lines, an
  appended r100 disposition and r101 pre-registration. No axis or coverage row changed.

Differential source (run from `/fast/scratch/hyaku/kumitate-r100-closure/`, sha256 `5346cc2f…`; reproduced here
because scratch is not citable):

```js
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const pads = ['', ' ', '\t', '  \t ', '\u00A0', '\u2003', '\u000B', '\f', '\r', '\uFEFF', '\u2028', '\u2029', '\u3000', '\u0085'];
const indents = ['', ' ', '  ', '   ', '    ', '\t', '\u00A0', '\u2003', '\r', '\u2028'];
const ids = ['S101', 'S1234', 'S12', 'S１２３', 's123', 'S123x', 'S12345678'];
const prefixes = ['', 'x\r', 'x\u2028', 'x\u2029'];
const cases = []; let n = 0;
for (const pre of prefixes) for (const ind of indents) for (const lp of pads) for (const rp of ['', ' ', '\t', '\u00A0', '\u2003', '\r']) for (const id of ids) {
  if ((n++ % 3) && !(lp === '' || rp === '')) continue; // thin the cross-product
  cases.push(pre + ind + '|' + lp + id + rp + '| x |');
}
const oldCite = (t) => { const s = new Set(); for (const l of t.split('\n')) { const m = l.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/); if (m) s.add(m[1]); } return s; };
const oldCap = (t) => { const s = new Set(); for (const m of t.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)) s.add(m[1]); return s; };
const nu = (t) => { const s = new Set(); for (const m of t.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)) s.add(m[1]); return s; };
let dis = { oldCite: 0, oldCap: 0, nu: 0 }, tot = 0;
for (const c of cases) {
  const doc = '## Registry\n\n' + c + '\n';
  writeFileSync('row.md', doc);
  const out = execFileSync('gawk', ['-F|', '/^ {0,3}##[ \\t]/{next} { line=$0; if (line !~ /^ {0,3}\\|/) next; sub(/^ {0,3}/,"",line); $0=line; id=$2; gsub(/^[ \\t]+|[ \\t]+$/,"",id); if (id ~ /^S[0-9]{3,}$/) print id }', 'row.md']).toString();
  const cen = new Set(out.split('\n').filter(Boolean));
  const eq = (a) => a.size === cen.size && [...a].every((x) => cen.has(x));
  tot++;
  if (!eq(oldCite(doc))) dis.oldCite++;
  if (!eq(oldCap(doc))) dis.oldCap++;
  if (!eq(nu(doc))) { dis.nu++; console.log('NEW-DISAGREE', JSON.stringify(c)); }
}
console.log(JSON.stringify({ cases: tot, disagree_vs_gawk_census_class: dis }));
```

**Evidence-verified (committed receipts read, lane gates/selftests not executed — §Gate standard, Closure consequence):**

- Frozen counter at M2: `close/probe-m2-1.txt` / `-2.txt` → `C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 … a_miss=0 b_miss=0`,
  seeds `cba6defb…`/`fba6e6ae…`, `cite_sha256=da16e32b… capture_sha256=c9f22275…` (revision named by tool hash).
- Do-nothing BASE: `controls/ctl-nothing.txt` → `UNMET a=0 b=0 c=1 d=1 … a_miss=42 b_miss=64`, base hashes `7211be84…`/`39bdeb39…`.
- Controls: `controls/OBSERVED.txt` → 16/16 `match=yes` (positive HELD, 15 UNMET incl. `ctl-k99`).
- Selftests: `close-l1/selftest-M2.txt` (header `M2 4897e20c…`) → `CITE_SOURCES_SELFTEST: PASS (45/45)`, `SOURCE_CAPTURE_SELFTEST: PASS (54/54)`.
- Teeth: `close-l1/m2-teeth.txt` 18 `killed=YES` lines; `close-l1/m2-survivors.txt` `M2_SURVIVORS: killed=2/2`;
  `close-l1/integration-remut.txt` every control `killed`.
- Battery: `close/battery-final.txt` all exit 0 (cite CLEAN cited=289, source-capture CLEAN captures=106 exemptions=113,
  PROXY MATCH incl. `--strict`, sources-check rows=219, source-dupes CLEAN groups=8). Its header names rev `4897e20c`,
  yet it reports rows=219 (S280/S281 landed only at `173a5314`): it graded an uncommitted worktree — defect D1.

## 3. Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | improved | claim re-measured (own 11040-case differential: 324/3996 → 0 disagreements vs the census class; diff = one reader line per tool) + gate evidence verified; 9→9 terminal, instruments repaired, no score inflation |
| coverage | unchanged | SCORECARD coverage rows 10→10; no axis row in the diff |

No owned axis harmed.

## 4. Discernment spot-check (`corpus/lessons/round-100.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S280 MDN Input boundary assertion | admit | `curl -sSL https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion` → HTTP 200, 201815 bytes, sha256 `bd32f83a…c6c0` (= row and L1 capture) | agree | tag-stripped text contains the 20-word quote "If the m flag is set, ^ also matches if the character to the left is a line terminator character" (≤25 words); it grounds exactly the `m`-flag record hole the claim removes |
| S281 MDN Lexical grammar | admit | `curl -sSL …/Reference/Lexical_grammar` → HTTP 200, 254916 bytes, sha256 `fe8f2813…b188` (= row) | agree | 13-word quote "Only the following Unicode code points are treated as line terminators in ECMAScript." present verbatim; Tier B secondary to S276 is right |
| R100 readers at M/M2 | admit | `git diff` + my differential (§2) | agree | single reader line per tool; 0/11040 disagreements with the census class |
| K99ExecSibling draft fix (`…/gm`) | reject | my `k99.mjs` run (§2) | agree | keeps `^`-after-CR/LS/PS rows that gawk does not see as records; the reject is correct |
| "HELD certifies R100" | reject | `.ufo/waves/round-100/K100CriticA/constructions.md` (14 constructions) + `close-l1/m2-teeth.txt` (18 killed) | agree | a U+2000-pad reader is outside the census `[ \t]` class yet the 135-row battery never draws it; the counter is a refutation budget |
| GNU gawk manual | unreachable | not re-opened | — | recorded as unreachable, not rejected — correct handling |

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
→ 8 `W04` cross-scope duplicate-URL warnings (S034, S068, S084, S095, S123, S126, S247, S271) + `kumitate ok …/corpus/SOURCES.md`,
exit 0; matches the report and `open/census-before.txt` = `close/census-after.txt` (md5 `f69539d5…` both).

## 5. Trend verdicts

- **expansion: improved** — new knowledge `corpus/knowledge/row-id-reader-class.md` (180 lines) on ground the map did not
  hold (four row readers vs census; `m`-flag record hole), citing mined S274/S276/S277/S280/S281; map row
  `corpus/README.md:296`; SOURCES 217→219 by grep count.
- **quality: improved** — two readers brought into the census class (re-measured); source-capture and source-dupes, red
  since r93/r94, now CLEAN in the committed battery; no admitted entry failed re-check in this sample.
- **discernment: improved** — this outside spot-check agrees with the gate on 3 admits and 2 rejects sampled; Q94/Q95
  each rest on a mined mistake (M100-2, M100-4) with failing-before receipts.

## 6. Routed defects / items for round 101

- D1 — `close/battery-final.txt` names rev `4897e20c` but measured an uncommitted worktree (rows=219, captures=106 include
  `173a5314` content). §Gate standard "a verdict names the revision it was measured against": re-run the battery on
  the committed tip and name that hash.
- D2 — `corpus/QUALITY.md` (+63 lines at `173a5314`) carries a splice artifact before Q94: a broken heading
  "### Q94` registration. Freeze `445196e4…`; lane base `5e2f9856…`." and a `## Mistakes` table (M100-1..3) that
  belongs in the lesson. Append a correction that removes/relocates it; QUALITY.md is criteria, not a mistakes log.
- D3 — stale line pointers: report and S281 `teaches` cite `scripts/cite-sources.mjs:36` / `source-capture.mjs:157`
  (base line numbers); at the tip the readers are at :40 / :159. Name the revision with each line pointer.
- Carried from the lane's own routing: section scope (K100ExecSection), census-oracle hash pin in counter receipts
  (K100CriticB), remaining `surface-probe --checklists` reds, L0 `kumitate | round-99` and `kumitate | round-96`.
- SHONEN: boxes 1–3 look checkable by a non-author from committed evidence (SKILL registry rows, LOG `## Round 100`,
  knowledge recheck command); box 4 (PROVINCE accuracy) was not assessed here. Promotion is operator-owned.
