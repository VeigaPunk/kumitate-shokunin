author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 96 — non-author verifier spot-check (closure)

Lane-round: kumitate r96. Lane HEAD before `bba139792d92604df1d83f2df3b74d53b9ed67a0`, after
`b0084b2042ec91436d85b07cdd886b6d88541c4b` (branch `master`). Report `.ufo/reports/round-96/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-96.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`):

- 2026-11-06T22:16:37-03:00 launch kumitate round=96 pgid=3401679 driver=hyaku-inline attempt=1
- 2026-11-06T23:18:38-03:00 complete kumitate round=96; hyaku-inline attempt=1

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-96/kumitate.md` | `kumitate-shokunin 37d3463afd75b7b4fd3a9e5085c0c932f8a372f0 2026-11-06 23:18:09 -0300` (after lane tip `b0084b20` at 23:17:57, before driver completion 23:18:38); same commit files the `kumitate \| round-96 \|` L0 question (`.ufo/l0-questions.md:385`) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines: 3 × `[~]` with pointers, 1 × `[ ]` (PROVINCE untouched) | pass |
| cited lane commits exist + ancestor of `master` | `git merge-base --is-ancestor <h> refs/heads/master` for `8191f90e`, `617e80cd`, `f5873bff`, `09de6791`, `6777f306`, `41600997`, `4a57390d`, `b0084b20`, `bba13979` | all 9 `anc`; `git log bba13979..b0084b20` = exactly the 8 round commits, all author `kumitate-shokunin` | pass |
| non-commit hashes in report | `aba737dc…`, `edaa115f…`, `9975be54…`, `c85f56cc…` | tool sha256 values (base / M `round-gate.mjs`, READY candidate) and the fetched-page sha256; not commit claims | n/a |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain \| wc -l`; `git ls-remote origin refs/heads/master` | `branch=master local=remote=b0084b20… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain `0`; remote `b0084b2042ec…` | pass |
| prompt carries template contract | `diff kimi-shokunin/templates/round-prompt.md <(head -n 140 .ufo/prompts/kumitate-round-96.md)` | only placeholder substitutions (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); hyaku addendum follows | pass |
| marker? | — | real report with 8 commits, receipts and measurements | not a marker → status `ok` |

## 2. Claim re-check — C1 operability (one declared claim, not exploratory)

Claim: `scripts/round-gate.mjs` declares upstream pins only from `corpus/SOURCES.md` rows inside the `## Registry`
section as the fleet census `row_pass` reads it; every row-shaped line outside it is listed (file order, repeats kept)
in the always-present `citations.outsideRows`, plus one text-mode `SOURCES_ROWS_OUTSIDE` info line.

Re-measured (plain commands over committed bytes, run by this closure):

| measurement | command | observed | reported | match |
|---|---|---|---|---|
| base gate bytes | `git show bba13979:scripts/round-gate.mjs \| sha256sum` | `aba737dc41ffbed4…` | base `aba737dc…` | yes |
| shipped gate bytes = M = tip | same at `09de6791` and `b0084b20` | `edaa115fa0537986…` both | `pin.round-gate` aba737dc… → edaa115f… | yes |
| the rule in shipped bytes vs census | read `round-gate.mjs:426-445` @ `b0084b20`; `scripts/sources-census.sh:609-622` | gate: `/^ {0,3}##[ \t]/` → `inReg = <text after ##, [ \t]-trimmed> === 'Registry'`; `/^ {0,3}#[ \t]/` → out; outside row → `outside.push(id)` before the field-count test. Census: same heading test, `in_registry=(trim(substr(line,3))=="Registry")`, `#[ \t]` exits, outside row → `E12` | same section state machine | yes |
| `outsideRows` always present + text line | `git grep -n outsideRows b0084b20 -- scripts/round-gate.mjs` | initialised `outsideRows: []` at 456 and 748 (fail-closed path); `SOURCES_ROWS_OUTSIDE` emitted at 827-829 only when non-empty | as claimed | yes |
| independent differential on counter fixture A | rebuilt fixture A (`probe96-c1.mjs:114-161`) in Python; ran `scripts/sources-census.sh validate --file` myself; evaluated only the pure `declaredPins()` function + its 4 regex constants extracted from the shipped bytes in node (the gate CLI was not run) | census `E12=[S901 S007 S020 S011 S020 S021 S022 S023 S024 S025 S028] E01=[S002]`; extracted reader `outside` = the same list in the same order, `malformed=["S002"]`, declared pins = `okA h3D ind4E nospF reopenH tabP ind3Q` (7) | `close/probe1.txt` FIX-A lists identical; 7 declared | yes |
| real registry rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\| S[0-9]{3}'` | `bba13979`: 212; `b0084b20`: 213 | 212 → 213 | yes |
| new rows | `git diff bba13979 b0084b20 -- corpus/SOURCES.md \| grep -E '^[-+]\|'` | `+S275` only; no row removed or changed | A +1, rows touched none | yes |
| live outside rows | census validate kumitate (below) | no E12 at tip | 0 outside rows in kumitate (K96Scout / K96CriticC) | yes |
| frozen inputs untouched | `git diff --stat 617e80cd b0084b20 -- .ufo/waves/round-96/{plan.md,probe,controls,open} \| wc -l` | `0` | K4 unchanged | yes |

Evidence-verified (lane gate and counter not executed — §Gate standard, Closure consequence):

- Selftest 89/89 at base (`controls/ctl-nothing.txt` SELFTEST line) → 94/94 at M (`close-l1/selftest-M.txt`:
  `ROUND_GATE_SELFTEST: 94/94 pass`, `VERDICT: PASS`, exit=0).
- Frozen counter: base do-nothing `C96_C1: UNMET a=0/1 b=0/1 c=0/1 d=0/1 e=0/79 f=1/1 tool_sha256=aba737dc…`
  (`controls/ctl-nothing.txt`); M `HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1 tool_sha256=edaa115f…` ×2
  (`close/probe{1,2}.txt`) — the revision measured is the shipped bytes. Fixture A BASE declares 15 tokens vs 7 at M
  (8 from outside rows), as reported.
- Re-mutation of shipped bytes (`close-l1/integration-remut.txt`): `REMUT: killed=30/31`, survivor
  `hardcode-fixtures` (rc=0, 94/94) as disclosed; K96Mutation survivor `b20-spaceclass` killed (92/94, arm (xxvi)).
- Harm battery: at M (`close/battery-M.txt`) `PROXY: DRIFT` on `A_wave` +5, `C2`/`C2_total` +1 only; at final
  (`close/battery-final.txt`) `PROXY: MATCH (… operability=9; … coverage=10 …)` twice (incl. `--strict`),
  `README_MAP: CLEAN files=248`, `SOURCES_CHECK: CLEAN (rows=213 …)`, `COUNTER_PINS: CLEAN pins=50`,
  `SPOTCHECK_COVERAGE: CLEAN spotchecks=62 uncovered=0`, `ROUND_GATE: CLEAN` (tracked; round 95), every exit=0 — the
  report now states each revision's verdict exactly (r95 routed item 2 answered).
- Q88 own-round receipt `close/q88-r96.txt`: `ROUND_GATE: CLEAN (round=96 …)`, `Q88: PASS round=96 M=4a57390d…
  gate_sha256=edaa115f…`. Q90 receipt `close-l1/q90-round-96.txt`: `LESSON_URLS: CLEAN new=1`, exit=0.
- Wave: `w1-results.json` 11 results; 11 seat dirs committed in `41600997`.

No-harm: `git diff bba13979 b0084b20 -- SCORECARD.md` removes only the proxy bookkeeping terms (`A_wave` 1532,
`C2`/`C2_total` 245, `pin.round-gate` aba737dc…) and the r96 pre-registration pointer, each re-declared (1595, 248,
edaa115f…), and appends the r96 move-log row, disposition and r97 pre-registration. No axis integer moved
(operability 9 terminal; coverage rows 10, `PROXY: MATCH`). Spot reads: `SKILL.md` round-gate row (one line, adds the
`outsideRows` decision), `corpus/QUALITY.md` (+Q90), `corpus/README.md` (+3 map rows), `LOG.md` (+7 lines r96) —
additions only.

| axis | verdict | reason |
|---|---|---|
| operability | improved | owned gate now refuses pins from rows the census calls E12 (section state identical to `row_pass`, differential on fixture A agrees); integer 9 terminal, the move is the instrument |
| coverage | unchanged | every coverage row 10 before and after (`PROXY: MATCH` at final) |

## 3. Discernment spot-check (`corpus/lessons/round-96.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S275 CommonMark 0.31.2 | admit | `curl https://spec.commonmark.org/0.31.2/` → HTTP 200, sha256 `c85f56cc2101f761…` (= `close-l1/l1-open-commonmark.txt`); tag-stripped, whitespace-collapsed body: "The opening sequence of # characters must be followed by spaces or tabs, or by the end of line." found right after Example 61 (offset 24509); the closing-sequence sentence follows it (offset 24605, raw HTML byte 62879) | agree | both quotes verbatim at the stated §4.2 location, 19 and 22 words (my count) as stated; they ground exactly the clause the census shares (`##` + space/tab) and the one it departs from (closing `#`s kept in text) |
| CommonMark-aware section reader | reject | `scripts/sources-census.sh:609-622`: `in_registry=(trim(substr(line,3))=="Registry")`, no closing-sequence strip, no `\r` strip, no fence tracking | agree | the census is the registry authority and emits E12 for `## Registry ##` / `## Registry\r` / fenced-heading rows; a CommonMark reader would declare pins from rows the census refuses |
| "the frozen counter pins the rule's clauses" | reject | `K96CriticA/receipts/*.txt`: `grep -h C96_C1 \| sort \| uniq -c` → 8 distinct `tool_sha256` constructions at `HELD a=1/1 … e=79/79 f=1/1`, 6 UNMET, plus base UNMET | agree | 8 of 14 wrong gates pass the counter, so it cannot certify clauses; the shipped bytes rest on selftest arms (xxiii)–(xxvii) + re-mutation 30/31, with `hardcode-fixtures` disclosed |

New `corpus/SOURCES.md` row re-opened: S275 (above; `SOURCES.md:230`, URL present in both the row and the lesson
`## Gate` — r95 routed item 1 answered). The ≤25-word quotes live in the lesson with location; both re-found verbatim.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 8 × `W04` duplicate-url
warnings (S034, S068, S084, S095, S123, S126, S247, S271 — all pre-existing) and `kumitate ok …/corpus/SOURCES.md`,
rc=0; matches the report.

## 4. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | new `corpus/knowledge/round-gate-registry-section.md` citing mined S275 (re-opened above), README map row; SOURCES 212 → 213 |
| quality | improved | gate section rule matches the census (differential re-run here), selftest 89 → 94, re-mutation 30/31 + b20 killed; r95 routed items 1–3 answered (lesson URL + Q90, per-revision battery verdicts, `verified-at` re-pointed) |
| discernment | improved | the outside spot-check agrees with the gate on the admit and both rejects sampled; census self-disagreement (`\r`) found and filed as an L0 question |

## 5. Defects (status-neutral) and routed items

1. `close/q88-r96.txt` labels `M=4a57390d` while the lesson, report and SCORECARD name M = `09de6791`; the gate bytes
   are identical (`edaa115f…`) so the verdict holds, but the label is inconsistent. Route: kumitate, one name for M.
2. The frozen plan still names a `labrat` seat the validator refused (rode K96CriticC) — disclosed in the report, plan
   not edited after the freeze (correct); route: kumitate, check seat roles against the validator before the freeze.
3. Counter controls were generated at `8191f90e` (the freeze commit's parent; `controls/ctl-nothing.txt` `freeze=`
   line) and committed in the freeze `617e80cd`; consistent with "pre-data", noted for traceability only.
4. Carried (lane's own r97 routing): census-grammar-derived counter battery + nonce fixtures (M96-2, third recurrence),
   lane `sources-check.mjs` CRLF / `##<TAB>` disagreement with the census, census `\r` internal disagreement (L0),
   `\s` vs `[ \t]` row-id class (`SOURCES_ROW_RE` at `round-gate.mjs:410`), sibling transfer (report only).
5. This spot-check is not yet in the lane's README map; the lane adopts it before its r97 freeze (M94-1 ordering).

SHONEN: boxes 1–3 (`[~]`) look checkable by a non-author from committed bytes (SKILL decision row, LOG end-to-end
entry, `--selftest` 94/94 receipt); box 4 has no evidence this round. Promotion stays operator-owned.
