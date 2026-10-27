# Round 66 LOG + SCORECARD integration note — seat K66ScribeLog

Three paste targets, two blocks, one verification script. The L1 is the only writer of `LOG.md`,
`SCORECARD.md`, `SKILL.md` and `corpus/QUALITY.md`; this seat wrote none of them.

## 1. Insertion points (measured at the freeze, lane HEAD `88041bc9f45b06560bbd807bd1ea7b44126aa49f`)

| target | where | how |
|---|---|---|
| `LOG.md` | after the last line of the round-65 entry (`2\.\n` — the file ends `… proxy stanza refresh, wave 2.` + one newline) | one blank line, then `LOG-66.md` body, then one newline. No trailing blank line. The file must stay a flat sequence of `## <date> — round N` sections, one paragraph each. |
| `SCORECARD.md` | after the round-65 C2 paragraph (`… O6 depends on the host binary.` + one newline) | one blank line, then `SCORECARD-66.md` body. No trailing blank line. |
| `SCORECARD.md` `## Capabilities` | a new row at the end of that table (before the `Rows enter only through a round …` line at `SCORECARD.md:1801`) | `capability-row` text in `registry-homes-66.md §3`. Required by L6. |

Delete the `<!-- … -->` draft comment before pasting; nothing else in the two files is draft text.

## 2. Placeholder inventory — every `MEASURE_ME`, and what replaces it

`LOG-66.md` (10), all on the entry paragraph (line 11):

| # | reads | replace with |
|---|---|---|
| 1 | `<n> seats` | validated seats in the round (wave census: `node scripts/wave-census.mjs` on `w1-dispatch.json`, plus any residual call) |
| 2 | `<n> attack seats` | attack-role seats (reviewer/critic/mutation-tester/labrat) from the same census |
| 3 | `(<n>%)` | attack share; the plan requires `>= 25%` |
| 4 | `residual call <n> seats` | residual reviewer/critic seats after integration, or `0` if none |
| 5 | `round total <n>` | seats total; the plan's band is 64–128 — if below the band, say `(below the band; disclosed)` as round 65 did |
| 6 | `M = <rev>` | the measured tip, full 40-char hash |
| 7 | `C1 <verdict>` | the C1 counter's final line at M, verbatim (`LEDGER66_HELD held=6/6 checks=6 rev=… rule=L66`, or `LEDGER66_UNMET …` + which check missed) |
| 8 | `C2 <verdict>` | the C2 counter's final line at M, verbatim (`DEPREC66_HELD held=8/8 … rule=M66`, or `UNMET …`) |
| 9 | `Findings that changed the work:` | one sentence naming the findings that changed a landed artifact (round 65's precedent: the twelve reachable v1 misreads). Cite the seat ids. |
| 10 | `Not landed:` | what the round declared and did not land, verbatim from the report (QUALITY rows, SKILL rows, stanza refresh, wave 2 …). Never leave it empty. |

`SCORECARD-66.md` (20):

| # | line | reads | replace with |
|---|---|---|---|
| 1 | 11 | `M = <rev>` | measured tip, full hash |
| 2 | 11 | `of <n> seats` | validated wave seats |
| 3 | 11 | `residual call <n>` | residual seats or `0` |
| 4 | 13 | probe command `<rev>` | M, full hash |
| 5 | 13 | `After at M: <verdict>` | the counter's final line at M, verbatim, and the real close receipt path (the draft proposes `close/ledger66-probe-at-M.txt`; use the file actually written) |
| 6 | 13 | `Verdict by the frozen counter:` | `verifies` / `fails as declared` / `not run` — the SCORECARD vocabulary used in rounds 63–65 |
| 7 | 14 | C1 limits tail | the wave findings that constrain the verdict (stub, forged answer key, adequacy); name the seat ids |
| 8 | 16 | probe command `<rev>` | M |
| 9 | 16 | `After at M: …` | final line + real close receipt path |
| 10 | 16 | `Verdict by the frozen counter:` | as #6 |
| 11 | 16 | `carries <n> rows` | the captured 2026-07-28 Deprecated table row count as M6 measured it (>= 5) |
| 12 | 17 | C2 limits tail | wave findings (live fetch failure, wrong reading, run-time non-use) |
| 13 | 19 | `at the close it reads …` | the proxy verdict line at close (`PROXY: MATCH …` or `PROXY: DRIFT (…)`), verbatim |
| 14 | 19 | `at the close …` (census) | `EXIT=0` + the W04 count at close |
| 15 | 19 | `at the close …` (sources) | `SOURCES_CHECK: …` and `SOURCE_CAPTURE: …` lines at close |
| 16 | 19 | `Not refreshed / not landed this round:` | the list; keep `PIN_UNPINNED scripts/routed-ledger.mjs` in view (see §3, item 6) |
| 17 | 21 | `**Waves.** <n> seats` | census seats |
| 18 | 21 | `<n> attack` | attack seats |
| 19 | 21 | `findings that changed the work` | one sentence, seat ids |
| 20 | 21 | `not landed` | the list, or `none` — never blank |

## 3. Landing checklist the counters actually read

1. `corpus/routed-ledger.md` must exist with a `## Ledger` 7-cell GFM table; absent reads `FAIL-CLOSED reason=ledger-absent` (L2), which is what the freeze probe got (`close/ledger66-freeze-harness.txt`).
2. L3's round-65 clause: **every** round-65 item D1–D7 needs a closed/wontfix row whose answer `path:line` is **new since the base** and located outside the ledger and the spot-checks. The autoledger control fails exactly here (`r65-item-1-not-answered-this-round`).
3. `SKILL.md` gate-table row naming `routed-ledger.mjs` (L6) — draft in `registry-homes-66.md §1`.
4. `corpus/QUALITY.md` must name `routed-ledger` (L6) — draft in `registry-homes-66.md §2`.
5. `SCORECARD.md` `## Capabilities` row whose first cell names `routed-ledger` (L6) — draft in `registry-homes-66.md §3`.
6. `proxy-check` will emit `PROXY  warn  PIN_UNPINNED  scripts/routed-ledger.mjs` once the new script is on the measured tree: `PIN_UNPINNED` is a `scripts/*.mjs` file no pin key covers (`scripts/proxy-check.mjs:204`), warn-level and promoted only by `--strict` (`:631`; selftest `:2578-2590`). A pin key means editing the `PINS` map in `scripts/proxy-check.mjs` (`:452-484`), which itself carries `pin.proxy-check`'s hash — the L1's call, and it changes the `pins=<n> match` verdict count. This is the same class the round already carries for `scripts/harm-matrix.mjs`; do not paste a `PROXY: MATCH` line without re-running.
7. `node scripts/counter-pins.mjs` must stay `CLEAN`; the four round-66 probe paths and their sha256 are frozen (`COUNTER_PINS: CLEAN pins=34` at `88041bc9`, verified this seat).
8. The header paragraph quotes a `PLAN_BEFORE_READY` line that this seat ran but did **not** commit. Commit its output (e.g. `close/plan-before-ready.txt`) before landing the section, or QUALITY Q53/Q61's "report = receipt = SCORECARD section" has a quote with no receipt. The run at `88041bc9`, verbatim: `PLAN_BEFORE_READY: PASS rev=88041bc9f45b06560bbd807bd1ea7b44126aa49f round=66 dir=.ufo/waves/round-66 plan=621212bac37f8249c72ac982d1d6534cb8d60701 plan_ct=1793081939 marker=88041bc9f45b06560bbd807bd1ea7b44126aa49f marker_kind=ready marker_ct=1793082316 marker_path=.ufo/waves/round-66/w1.ready map=CLEAN files=160 rows=160 covered=160` + `PLAN_BEFORE_READY_SUMMARY: pass=1 fail=0 na=0 rounds=66-66 rev=88041bc9f45b06560bbd807bd1ea7b44126aa49f exit=0 failed= na_rounds= map_red=`, exit 0.

## 4. Commands, with the flags each accepts (read from the files, not guessed)

```
node .ufo/waves/round-66/probe/ledger66-probe.mjs <lane> <M>            # usage at ledger66-probe.mjs:39 (--tool, --seed)
node .ufo/waves/round-66/probe/deprec66-probe.mjs <lane> <M>            # usage at deprec66-probe.mjs:42 (--no-live)
node scripts/routed-ledger.mjs --rev <M> --from 55 --to 65 --classes    # L2's own re-count
node scripts/routed-ledger.mjs --selftest                               # L1: PASS (n/n), n >= 30 (33/33 at freeze)
bash .ufo/waves/round-66/probe/c1-controls.sh <lane> donothing          # control, not a claim
bash .ufo/waves/round-66/probe/c1-controls.sh <lane> autoledger
bash .ufo/waves/round-66/probe/c2-donothing.sh <lane>
bash scripts/plan-before-ready.sh --round 66                            # Q58/Q60
node scripts/counter-pins.mjs
node scripts/readme-map.mjs ; node scripts/sources-check.mjs ; node scripts/source-capture.mjs ; node scripts/proxy-check.mjs
```
Both control scripts default `SCRATCH` to `/fast/scratch/hyaku/kumitate-r66/controls`; a seat running them sets `SCRATCH=/fast/scratch/hyaku/kumitate-r66/<Seat>` and deletes it. They clone the lane `--shared` and commit only inside the clone. Give the counters `TMPDIR` on `/fast` (they `git archive`) with free space; the host is loaded, so give them a generous timeout and run once.

## 5. Paste check

```
bash .ufo/waves/round-66/build/K66ScribeLog/assert-no-placeholders.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin
```
Exit 0 only when `MEASURE_ME` is gone from both files and each new heading appears exactly once.
