# kumitate round 89 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Closed 2026-11-04 against lane HEAD `082f01a4db1ba4ddae67a155e9cf21ba3d3306f2` (base
`a5d2503393fc5646acb6468888d8b12a445bf62d`, freeze `adfc2f55675f760eaf8b59f80033f926500cd951`, wave
`9c3b64e44024869937a827d588fe1b75e6692ef7`, measured revision M
`7a8afb5fa02975e75cb2f33faf6d211a9680fc92`). Report `.ufo/reports/round-89/kumitate.md` (fleet repo).
Driver digest (copied from the mutable `.ufo/watchdog.log`):

```
2026-11-04T20:13:42-03:00 launch kumitate round=89 pgid=238576 driver=hyaku-inline attempt=1
2026-11-04T20:35:59-03:00 lane-dead-no-report kumitate round=89; retry same round (hyaku-inline attempt=1: L1 ended without a landed report: FAIL report_of (missing, unchanged, no SHONEN heading, or < 400B): .ufo/reports/round-89/kumitate.md)
2026-11-04T20:36:02-03:00 launch kumitate round=89 pgid=1027971 driver=hyaku-inline attempt=2
2026-11-04T21:20:12-03:00 complete kumitate round=89; hyaku-inline attempt=2
```

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report landed by the lane | `git log --format='%an %H' -- .ufo/reports/round-89/kumitate.md` | `kumitate-shokunin <kumitate@shokunin.local> b6b3bfacfd7c8fd2c8d93237f556283cfd1cba41` (2026-11-04 21:19:31 -0300) | ok |
| report lands last | lane `git log -1 --format='%ci'` vs report commit | lane tip `082f01a4` 21:19:20 < report 21:19:31 < `complete` 21:20:12; report cites `082f01a4` = lane branch tip | ok |
| report pushed (fleet) | `git branch -r --contains b6b3bfac` | `origin/main`, `origin/master` | ok |
| SHONEN heading + one line per box | `grep -c '^## SHONEN'` / `grep -c '^- \['` on the report; `grep -c '^- \[' SHONEN.md` | 1 / 4 / 4; all four are `[~]` with pointers | ok |
| cited commits exist + ancestry | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> master` for `adfc2f55`, `9c3b64e4`, `7a8afb5f`, `082f01a4`, base `a5d25033` | all `ANCESTOR-OK` against `master` (git HEAD is detached; tested against the branch ref, never `@{u}`) | ok |
| lane pushed, clean | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain` | `branch=master local=082f01a4 remote=082f01a4 ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain → 0 lines | ok |
| prompt carries the template contract | `.ufo/prompts/kumitate-round-89.md` (committed by `kumitate-shokunin` `6fbaa133` attempt 1, `334c9692` attempt 2) | §1 MISSION/AXES (l.3), §2 claims 1–3 + lowest axis + exploratory rule (l.9–41), §2b frontier step (l.42–78), §3 ≥8 L2 in one batch + godspeed + planner mapping (l.80–98), §4 report contract incl. `SHONEN` (l.99–130), §5 commit-then-push / push scope / L0 (l.131–140), hyaku addendum §6 with write scope (l.449), report-lands-last + `landed <hash>` citation rule (l.480–516) | ok |
| L2 floor vs MISSION | prompt §3 + addendum round size; `MISSION.md:53-65` | prompt requires 8–16 seats with "8 is the protocol L2 floor", ≥ MISSION's 8; names no model alias, routes through the host table; MISSION bucket unchanged | ok |
| marker? | — | real report: 6 cited lane commits, evidence dirs under `.ufo/waves/round-89/`, per-claim counting command | not a marker; status `ok` |
| round shape | `.ufo/waves/round-89/w1-spec.json` (13 items) + `w1-results.json` | 13 seats = 4 executor, 2 scribe, 1 scout, 1 reviewer, 2 critic, 1 mutation-tester, 1 sentinel, 1 connector; attack 4/13 = 31 %; 4 dead seats (`K89ScribeSources` 68 B, `K89ScribeLesson` 67 B, `K89Critic` 101 B, `K89Sentinel` 577 B), none replaced; L1 holds the planner seat | ok |
| no lane leftover in the fleet root | `git status --porcelain` at the fleet root | untracked `.scratch/*` (orchestrator-owned), `.ufo/reports/round-79/chousa.md`, `.ufo/reports/round-60/souji.md`, and a 24-byte `after` ("== SCORECARD diff base-", 2026-11-03 20:05) — none names this lane or round 89 | ok |
| append-only discipline | `git diff --numstat a5d25033 082f01a4 -- LOG.md corpus/QUALITY.md corpus/SOURCES.md SCORECARD.md` | LOG +54/−0, QUALITY +34/−0, SOURCES +5/−0, SCORECARD +84/−12 (pinned proxy block + `pin.*` re-pins + appended round-89 sections); SKILL +2/−2 (registry row v2→v3, checklist item) | ok |

Conformance defects are status-neutral and routed in §6.

## 2. Claims

One declared claim. **C1 operability (lowest non-retired axis) — capability acquisition `receipt-bind`
v3; lane-reported UNMET (frozen kill rule fired) → rejected-honest-stop.**

Re-measured myself, read-only, in my own scratch `/fast/scratch/hyaku/kumitate-r89-verify` (no lane
file written; lane `git status --porcelain` still 0 lines afterwards):

| reading | command I ran | observed | agrees with the report |
|---|---|---|---|
| **after** | `node .ufo/waves/round-89/probe/probe89-c1.mjs --lane …/kumitate-shokunin --work <my scratch> --rev 082f01a4` | 30 `ARM … PASS` lines; `C89_C1: HELD held=30/30`, `exit=0` | yes (report: 30/30 at M, twice, `PROBE_DETERMINISM SAME`) |
| **before** (do-nothing) | same probe with `--tool <my scratch>/base-v2.mjs` (`git show a5d25033:scripts/receipt-bind.mjs`, sha256 `1f11f124…5880ea`) | `C89_C1: UNMET held=27/30`, `exit=1`, failing exactly `alias-proc-root`, `bom-rev`, `symlink-instrument` | yes (`controls/ctl-base-v2-at-rev.txt`) |
| instrument bytes at the judged rev | `git show 082f01a4:scripts/receipt-bind.mjs \| sha256sum` | `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` = `pin.receipt-bind` = the selftest receipt's `tool_sha256` | yes |
| selftest suite size | `grep -c 'RECEIPT_BIND_SELFTEST arm' close/bind-selftest.txt`; all-pass count | 68 arms, 68 `ok`; `RECEIPT_BIND_SELFTEST: PASS held=68/68` (base 59/59 in `.ufo/waves/round-88` receipts) | yes |
| **kill rule fired** | same probe with `--tool build/K89Review/cand-probe-keyed.mjs` and `…/cand-skip-mode.mjs` | both `C89_C1: HELD held=30/30`, `exit=0` (the keyed one prints the literal string `keyed` as the symlink path) | yes — C1 is UNMET |
| kill rule was frozen before data | `grep -n -A6 'Kill rule (frozen)' .ufo/waves/round-89/plan.md` at `adfc2f55` | the rule names "any seat-constructed control … that reaches 30/30 makes C1 UNMET (rejected-honest-stop)" | yes |
| harm rules | `close/proxy.txt`, `close/checklists.txt`, `close/sources-check.txt`, `close/source-capture.txt`, `close/census.txt` | `PROXY: MATCH` (operability=9, coverage rows 10, C2 224→227); `SOURCES_CHECK: CLEAN rows=197`; `SOURCE_CAPTURE: CLEAN captures=86`; census `exit=0` | yes, with the checklist caveat in §6 (K89-V5) |
| gate repairs (red-before shown) | `build/K89ExecDebt/receipts/spotcheck-adopt-selftest-head-raw.txt` vs `…-patched.txt`; `close/map.txt`; `open/gate-counter-pins.txt` vs `close/*` | `SPOTCHECK_ADOPT_SELFTEST: FAIL (33/34)` → `PASS (34/34)`; `README_MAP: DRIFT files=225 rows=224` → `CLEAN files=227 rows=227 covered=227`; `COUNTER_PINS: DRIFT pins=45 bad=1` → `CLEAN pins=45`; `OMP_CENSUS` findings 7 → 2 | yes |
| corpus delta | `git show <rev>:corpus/SOURCES.md \| grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` | 192 → 197; tier `A=165 B=22 C=10`; status `queued=13 mined=156 rejected=28`; malformed rows 0 | yes |
| census | `scripts/sources-census.sh validate --root … kumitate` | `kumitate ok …/corpus/SOURCES.md`, `exit=0`, 7 `W04` duplicate-url warnings (identical at round start) | yes |

Verdict: **the claim does not verify — C1 UNMET.** The lane's own frozen kill rule, written against the
scorer's score and frozen at `adfc2f55` before any data, fires on three independent seat constructions
(two of which I re-ran myself at 30/30). The instrument is stronger than the scorer (my re-run also
reproduces 30/30 with the integrated v3 and 27/30 with the do-nothing v2), but the claim's unit of work
is the capability row, and no row enters. This is an honest stop, not a harm.

## 3. Axis verdicts

| axis | verdict | evidence |
|---|---|---|
| operability | `unchanged` | `close/proxy.txt` → `operability=9` at M; no capability row entered (claim UNMET); the 59 → 68 selftest arms and the three new boundaries are instrument quality, booked under the quality trend, not a scored axis move |
| coverage | `unchanged` | `close/proxy.txt` → `C1=19/19`, `C2=227/227`, `S=88/88`, `R=92/92`, `K=55/55`, `O=1/1` — every coverage row still 10; `git diff a5d25033 082f01a4 -- SCORECARD.md` changes no axis score row |

No axis is harmed: no score decreases anywhere in the SCORECARD diff, no admitted entry is found false,
and every red gate at M is either inherited or repaired (K89-V5, K89-V8).

## 4. Discernment spot-check (LEARNING.md, from outside)

Sampled from `corpus/lessons/round-89.md` `## Gate`: three admits and the one reject. Each source was
re-opened (live URL or the committed capture, whose sha256 matches the row's pin).

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S255 `proc_pid_root(5)`, A, mined | admit | live https://man7.org/linux/man-pages/man5/proc_pid_root.5.html § DESCRIPTION + capture `open/proc-root.html` (sha256 `1a71736f…c251ac`) | **agree** | the quoted sentence is verbatim on the live page: "This file is a symbolic link that points to the process's root directory, and behaves in the same way as exe, and fd/*"; it grounds `alias-proc-root` exactly as `teaches` claims. Location is imprecise (see K89-V7) |
| S257 `gitformat-index`, A, mined | admit | capture `open/gitformat-index.html:1625` (sha256 `723e4e71…76d2c`) | **agree** | "valid values in binary are 1000 (regular file), 1010 (symbolic link)" is verbatim at the cited line and is the only source of the mode test the instrument now performs; A tier is right for a primary format spec |
| S258 Unicode 15.0 ch.3, A, mined | admit | capture `open/unicode-ch03.txt:2583` (sha256 `cca252ce…635030`), § 3.9 | **agree** | "Its usage at the beginning of a UTF-8 data stream is neither required nor recommended … but its presence does not affect conformance" is verbatim and grounds the BOM strip; the ≤25-word quote (21 words) is inside the cap |
| S259 `git-ls-tree`, B, rejected | reject | live https://git-scm.com/docs/git-ls-tree § Output Format + capture `open/git-ls-tree.html` (sha256 `ff06fbc8…818267`) | **agree** | the page says only "The mode of the object."; `grep -c 120000 git-ls-tree.html` → 0 and `grep -ci 'symbolic link'` → 0, so it cannot ground a mode test. The recorded flip (gitformat-index, adopted as S257) is the correct replacement |

Both directions agree, and the lane's own kill rule was applied against its own 30/30 rather than
narrowed — the discernment signal is real, not self-assessed.

## 5. Trend verdicts

- **expansion — `unchanged` (agree).** 192 → 197 rows, but no admitted `knowledge/` entry on ground the
  coverage map did not hold: the new entry deepens the receipt-binding band that `corpus/README.md`
  already carries (frontier list unchanged), no capability row entered (claim UNMET), assimilation none.
  +4 A rows and +1 rejection in held bands are curation.
- **quality — `improved` (agree).** Independently visible in committed receipts: the instrument gained
  real-path membership, the mode-120000 refusal and BOM tolerance with the suite 59 → 68 arms, and four
  repairs each show a red-before state (`SPOTCHECK_ADOPT_SELFTEST` 33/34 → 34/34, `COUNTER_PINS`
  bad=1 → CLEAN, `README_MAP` 2 findings → CLEAN, `OMP_CENSUS` 7 → 2). Tempered honestly by the lane:
  the capability is UNMET, so this is instrument and gate quality, not a capability.
- **discernment — `improved` (agree).** The frozen kill rule fired against the lane's own terminal
  score, three constructions were recorded, and the failure became a grounded criterion (Q82: a scorer
  may not hand the candidate its fixture's identity) instead of a narrowed rule; four dead seats took no
  credit. My outside sample agrees on every admit and the reject (§4).

## 6. Routed defects — kumitate must fix in round 90

1. **K89-V5 — the M checklist receipt is summary-only, and the named red set contradicts the tally.**
   `close/checklists.txt` is 5 lines (`CHECKLIST: 43/46 pass`, `VERDICT: FAIL`) with no per-item lines,
   so the per-item pass set at M is not re-derivable; `open/checklists.txt` has the 10 open reds
   (`723, 725, 737, 741, 744, 745, 746, 748, 755, 756`), while the report and SCORECARD name five
   remaining reds (`723/737/741/755/756`) against a 43/46 tally that implies three. Fix: commit the
   per-item `CHECKLIST` lines at M and reconcile the named red set with the tally.
2. **K89-V6 — a stale expected output in a `recheck:` field.**
   `corpus/knowledge/receipt-lane-membership-and-link-binding.md` `recheck:` states
   `RECEIPT_BIND_SELFTEST: PASS held=64/64`; the instrument at the same commit prints 68/68 (my re-run,
   `close/bind-selftest.txt`), and `--work` only relocates the fixture root, so the count is
   unconditional. Fix: a named correction (append-only) carrying the measured 68/68.
3. **K89-V7 — quote location drift.** S255's row and the lesson name `open/proc-root.html` line 70, but
   line 70 is the `</pre>` closing the NAME block and the quoted sentence begins at line 75. Fix: name
   the section only, or correct the line.
4. **K89-V8 — a red gate receipt filed without its verdict.** `close/plan.txt` reads
   `PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT … map_first=uncovered:lessons/round-88-verifier-spotcheck.md`
   at PLAN `adfc2f55`; the drift was repaired at M (`README_MAP: CLEAN files=227 rows=227`), but the
   report cites the receipt as if it were green. Fix: quote each cited gate receipt with its verdict;
   the arm judges at the freeze commit, so the repair only shows up in the next round's plan.
5. **Carried, already queued by the lane in `SCORECARD.md`** (acknowledged, not re-routed): K89-V1
   BOM/ZWSP-prefixed duplicate `cmd=`/`rev=` bypassing `AMBIGUOUS_FIELD`; K89-V2 the scorer's missing
   arms (absolute in-lane symlink token, in-lane `..` that stays inside, alias through a symlinked
   ancestor); K89-V3 the stale `limit-before-read` docstring; K89-V4 the `usage`/`selftest` text stubs
   and the worktree-reading arms #3/#5.

## 7. Promotion note

`SHONEN.md` is unchanged (4 boxes, byte-canonical) and the report marks all four `[~]` — correct, since
no named non-author verifier had reviewed the round when it was filed. As the non-author integrator I
spot-checked this round end to end and found boxes 1–4 checkable (decision tables/registry row and
68-arm suite, a logged end-to-end instrument task, self-contained corpus instructions with resolvable
pointers, no cross-domain bleed in the diff or the connector's sibling scan). No `[x]` was written: the
promotion decision is the operator's, not the closure's.
