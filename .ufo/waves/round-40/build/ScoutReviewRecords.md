RESULT ScoutReviewRecords rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=mapped review_entries=138 bound=138 unbound=0 no_seat_report=1

# C1 / R39-1 planning data: what a `review:<seat>` binding rule costs today

Question: at the round-open revision, list every pin entry whose `source` starts `review:`, and for each find (a) a committed review record with the same note, seat and token and (b) a committed seat report `<seat>.md` under `.ufo/waves/`.

## Observed structure
- The pin is `.ufo/pins/anchor-truth.json` (`kumitate-anchor-truth-v1`), keyed `notes[<note path>] -> {anchors, entries[]}`; each entry carries `ord, raw, path, a, b, token, source, expect, key`.
- The only two committed JSON files anywhere in the revision that carry a `seat` key are `.ufo/waves/round-38/anchor-reviews.json` (object `<note>#<ord> -> {seat, token}`) and `.ufo/waves/round-38/evidence/review-decisions.json` (`decisions[] -> {note(short), ord, act, val, why, seat}`). Every other candidate file was checked; none carries per-anchor seat records.
- The gate never reads the record at check time: `overrideValid` (scripts/anchor-truth.mjs:284-289) only requires the token word-bounded in the note sentence and `judge(...) === 'true'`; `checkNote` calls it at :306; `--reviews` is parsed at :398 and used only inside `--write-pin` at :474. This is the mechanism behind R39-1, consistent with that falsifier's X1.

## Counts (all 138 rows in the table)
| metric | count |
|---|---|
| review-sourced pin entries | 138 of 811 anchors (17.0%), all `expect=true` |
| by note | census 88, route-probe-cluster 48, sighting-wall 1, native-trial-launch 1 |
| distinct seats | 37 |
| bound by a committed record (note#ord key, same seat and token) | 138 |
| unbound (no record) | 0 |
| bound by `review-decisions.json` TOKEN/MOVE_TOKEN (same seat, token, ord) | 134 |
| seat report `<seat>.md` exists under `.ufo/waves/` | 137 |
| seat report names `<note-short>#<ord>` | 137 |
| seat report contains the pin token | 136 |
| seat report has a `VERDICT <note>#<ord> ... <token>` line agreeing | 136 |

The record join is exact at the key: all 138 pin entries have `anchor-reviews.json[<note>#<ord>]` with `value.seat === pin seat` and `value.token === pin token`; 0 mismatches, 0 missing keys. The record file itself has exactly 138 keys, 0 null tokens and 37 seats, i.e. it and the pin are 1:1.

## Entries without a record (the honest cost of the strictest honest rule)
None. No review entry is unbound.

## Entries that a stronger rule would refuse, with the exact selector
| rule addition | refused | entries |
|---|---|---|
| A: record at `<note>#<ord>` with same seat and token | 0 | none |
| A + report `<seat>.md` exists | 1 | `remaining-scripts-census.md#100` seat L1 token `cold` raw `scripts/fleet-ledger-rotate.mjs:393` (expect true) |
| A + report names `<note-short>#<ord>` | 1 | same L1 entry |
| A + report contains the token | 2 | L1 entry, plus `route-probe-cluster.md#43` seat Check74 token `targets.every` |
| A + a TOKEN/MOVE_TOKEN act in `review-decisions.json` | 4 | `census#103` FixS818 `record`; `census#228` FixS826 `devin-native-v1`; `route-probe#43` Check74 `targets.every`; `route-probe#152` Prose12 `standalone` |

Details of the three non-record gaps:
- L1 (`remaining-scripts-census.md#100`): bound by record and by `TOKEN@100`, but there is no `L1.md` anywhere in the tree; L1's committed evidence is `.ufo/waves/round-38/evidence/L1-all-anchor-reopen.json` and `L1-Check40.txt`. A report-required rule needs an L1 exemption or an L1 report.
- Check74 (`route-probe-cluster.md#43`): its report is a falsifier report at `.ufo/waves/round-38/falsify/Check74.md`; it names the anchor on an `OBS route-probe-cluster#43 refute` line and proposes `:182-190` plus `:223-237`. It never contains `targets.every`; the pin adopted the contiguous span `:182-237` with the token the note itself uses at `:223`. So the record's seat/token is an integration choice, not a sentence in the seat's report.
- The other two (`census#103`, `census#228`) have normal `VERDICT ... MOVE_TOKEN <lines> <token>` lines in their reports and are bound by the record; only the decisions file omits them.

## Design constraints observed for the binding rule (facts, then one inference)
- `.ufo/waves/round-38/anchor-reviews.json` is ABSENT at the frozen base `e18ff1af3392e3823227644c977c237737fe65c9` (`git cat-file -e` fails: "exists on disk, but not in e18ff1af..."), and the base pin has 0 `review:` sources. A rule that resolves the record from `--base` therefore refuses all 138.
- The record is not digest-pinned: `frozen/expected.json` `input_digests` lists only the pin, `origin.json`, the four notes and `scripts/anchor-truth.mjs`; `source_digests` are 80 upstream files. Nothing else in the tree references the record path as an input.
- The record's `ord` lives only in the map key, not in the value, so a rule must key on `<note>#<ord>`; comparing value seat+token is enough to refuse a seat rename such as `review:NoSuchSeat` at an existing ord.
- [INFERENCE] Reading the record from the measured worktree, which is the only option that keeps the 138 true today, binds a file the same committer can edit alongside the pin; non-repudiation needs the record's digest frozen somewhere that predates the pin edit (e.g. added to `input_digests`), not a base-revision read.

## Unknowns
- Whether the L1 wants the rule to require a seat report as well; that choice costs exactly one entry (L1#100) and needs a stated exemption.
- Whether `route-probe-cluster#43` should keep `review:Check74` now that Check74's report proposes a different span/token; the record says Check74, the report does not carry that token.
- No committed seat roster exists in the round-38 build plan (zero `seat` occurrences), so a rule must derive valid seats from record values or report filenames.

## Evidence
E1 `git -C <lane> rev-parse HEAD` -> `f69817edf687c8ce4f87ed7953a353399232f69e`; `git diff --stat f69817ed... -- .ufo/pins/anchor-truth.json` -> empty; both worktree and blob are 231663 bytes, sha256 `a905d2c59557ba1d61be87e15cfb06919afe7b2a6efd7b4da38776e2e6b09ab5`.
E2 `grep -c '"review:' .ufo/pins/anchor-truth.json` -> `138`.
E3 Node extraction over `notes[*].entries`: 138 rows, expect distribution `{true:138}`, seats 37, notes census 88 / route-probe-cluster 48 / sighting-wall 1 / native-trial-launch 1, distinct raw 127.
E4 `.ufo/waves/round-38/anchor-reviews.json`: 138 keys, 0 null-token values, 37 distinct seats; `git rev-parse f69817ed:.ufo/waves/round-38/anchor-reviews.json` -> `d29147b85551465f663fd2121197551bceb9a100`; worktree sha256 `9cc5e0d12741c3fc70c302ea95a3839c1fd46ac7a80b5da5acfcf5087d1fa499`; `git show f69817ed:... | cmp - .ufo/.../anchor-reviews.json` -> `IDENTICAL`.
E5 Strict join pin -> record on `<note>#<ord>` + seat + token: `record-vs-pin mismatches: 0`.
E6 `review-decisions.json`: 342 decisions, 80 seats; 134 of 138 review pins have a TOKEN/MOVE_TOKEN act with the same seat, token and ord; the 4 absentees are census#103 (FixS818), census#228 (FixS826), route-probe-cluster#43 (Check74), route-probe-cluster#152 (Prose12).
E7 Seat reports: `git ls-tree -r f69817ed -- .ufo/waves | grep '\.md$'` -> 488 files; 137 of 138 seats match `<seat>.md` (136 in `round-38/build/`, Check74 in `round-38/falsify/`); `git ls-tree -r f69817ed | grep -E '(^|/)L1\.md$'` -> no output.
E8 Report naming: generic `\b<note-short>#<ord>\b` -> 137/138 (only the L1 entry missing); token present in the same report -> 136/138 (Check74.md lacks `targets.every`).
E9 Strict `^VERDICT <note>#<ord> ` parse with `TOKEN <tok>` or `MOVE_TOKEN <lines> <tok>` -> 136/138 agree; the two misses are L1 (no report) and Check74 (`OBS ... refute` line only).
E10 `git show e18ff1af:.ufo/pins/anchor-truth.json | grep -c '"review:'` -> `0`; `git cat-file -e e18ff1af:.ufo/waves/round-38/anchor-reviews.json` -> fatal "exists on disk, but not in 'e18ff1af...'", so the record has no base copy.
E11 `frozen/expected.json` `input_digests` keys -> `.ufo/pins/anchor-truth.json, .ufo/pins/origin.json, corpus/knowledge/{native-trial-launch,remaining-scripts-census,route-probe-cluster,sighting-wall}.md, scripts/anchor-truth.mjs`; the review record is not among them.
E12 Record history: `git log --oneline --follow -- .ufo/waves/round-38/anchor-reviews.json` -> `01aab4b`, `c938c06` (added round 38, unchanged since).
E13 Gate code: `sed -n '284,289p' scripts/anchor-truth.mjs` -> `overrideValid` returns `inSentence && judge(...) === 'true'`; `:306` `if (String(e.source).startsWith('review:') && !overrideValid(live, src))`; `:474` is the only read of `--reviews`, inside `--write-pin`.
E14 Committed JSON census: 59 `*.json` under `.ufo`; `git grep -l '"seat"' f69817ed -- '*.json'` -> exactly the two record files; whole-tree filenames matching `review*.json` -> 2 (same two).
E15 Table artifact `/fast/scratch/hyaku/kumitate-r40/seats/ScoutReviewRecords/bindings.tsv` (14 columns: note, ord, raw, seat, token, expect, binding, record_ord, record_seat_token, decisions, seat_report, report_names_anchor, report_has_token, strict_verdict_token), regenerated from the same script; summary line printed `rows 138 bound 138 unbound 0 no_report 1 names_anchor 137 has_token 136 strict_verdict 136 with_decisions 134`.
E16 No lane write except this report; no clone commit; no tool installs or upgrades (none needed); read-only git only (`rev-parse`, `show`, `ls-tree`, `cat-file`, `grep`, `log`), no jj, no pacman.
