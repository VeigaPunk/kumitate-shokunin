# ReviewAxisMove — evidence log (round 57, seat w1)

All runs observed 2026-10-24 by seat ReviewAxisMove. No production file, jj/git state, or
sibling seat directory was written; lane writes here are this build dir and the w1 report only.
No tools were installed or updated (none needed).

## Environment

- Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin (jj-colocated)
- HEAD at measurement: `8c6f5b017d149b18134917378cdbed3b492d8e89`
  (`git log --oneline -5`: 8c6f5b01 "round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5";
  1238575; c42afe1 "SCORECARD measured-commit slots filled (R1 f0dc6d11…)";
  798d4d2 "close receipts"; b3bd063 "readme-map capability gate + worker-heartbeat-liveness frontier entry")
- jj: `nuxonxru` working copy 2909579f; `oxnkytrm` master 8c6f5b01
- `git status --porcelain | wc -l` → 46 (mid-wave executors; counts therefore taken from committed bytes)
- Revisions extracted (git archive, read-only) into this build dir:
  - base (round-57 freeze): `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` → scratch-base/
  - r56 close: `e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843` → scratch-r56close/
  - measured close R1: `f0dc6d1160e66af65355bd353665adac22bbf4a9` → scratch-r1/
  - bookkeeping tip: `8c6f5b017d149b18134917378cdbed3b492d8e89` → scratch-head/
  - command: `git archive <rev> | tar -x -C <scratch>` → `EXTRACT_OK`
- Origin tree env: `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha` (read-only usage); every
  proxy/claims/truth run reported `src-rev=31c465f15669` = the pinned measurement rev.

## 1. A — runnable artifacts (canonical frozen command, SCORECARD "Measurement proxies")

Command (cwd = scratch extraction):
`find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print`

- R1 (f0dc6d11) `| wc -l` → **90**, exit 0 (list saved: A-list-r1.txt, md5 e15c52d4e7895a60d252feeebfc20b10)
- base (7178bfd) `| wc -l` → **87**, exit 0 (list saved: A-list-base.txt, md5 1820bceffcea4ec322b7678ebb5d7857)
- Composition R1: 70 `.ufo` + 20 `scripts`; base: 68 `.ufo` + 19 `scripts`
- Delta (verified: `wc -l` 87/90; `LC_ALL=C sort` → Ab.s/Ar.s 87/90; `comm -23 Ab.s Ar.s` [only-in-base] → EMPTY; `comm -13 Ab.s Ar.s` [only-in-R1] → exactly):
  ```
  ./.ufo/waves/round-57/probe/attest57-probe.mjs
  ./.ufo/waves/round-57/probe/doctrine57-probe.mjs
  ./scripts/readme-map.mjs
  ```
  (Note: this host's `comm` column order is non-GNU; both earlier readings are consistent with
  it and superseded by the wc/md5/comm/diff triangulation above.)
- Working-tree drift: same command in the live lane → **6276** (uncommitted seat scratch under
  `.ufo/waves/round-57/build/*`); committed bytes are the scored surface.
- `.git` / `.jj` contributions: `find ./.git -type f \( … \) | wc -l` → 0; same for `./.jj` → 0.
  "minus .git" is a no-op; the claim's loose phrasing is equivalent to the canonical command.

## 2. C — executable checklist items in SKILL.md

Command: `grep -c '^\s*- \[' SKILL.md`
- R1 → **27**, exit 0; states: `grep -o '^\s*- \[.\]' SKILL.md | sort | uniq -c` → `27 - [ ]` (all open)
- base → **26**, exit 0
- Items 24–27 at R1 (SKILL.md:717–720) — the B7 binding, verbatim:
  ```
  - [ ] Frozen-counter registry gate (round 54; contract `kumitate-counter-pins-v1`) — `node scripts/counter-pins.mjs` → exit 0 + `COUNTER_PINS: CLEAN`
  - [ ] Opened-source byte-persistence gate (round 55; contract `kumitate-source-capture-v1`) — `node scripts/source-capture.mjs` → exit 0 + `SOURCE_CAPTURE: CLEAN`
  - [ ] SOURCES duplicate-URL ratchet (round 56; contract `kumitate-source-dupes-v1`) — `node scripts/source-dupes.mjs` → exit 0 + `SOURCE_DUPES: CLEAN`
  - [ ] Corpus coverage-map bimap gate (round 57; contract `kumitate-readme-map-v1`) — `node scripts/readme-map.mjs` → exit 0 + `README_MAP: CLEAN`
  ```
- SKILL.md diff base→R1: exactly two hunks — (a) new gate-registry row
  `| readme-map | gate | node scripts/readme-map.mjs …` at line 624 (+ blank line),
  (b) the new checklist item at line 720. No other change. `diff` exit 0.
  (artifact of the diff: artifact://21170)

## 3. Score arithmetic (awk)

```
R1:  A+C=117  f=0.975000  10f=9.7500  score=9      # floor(10*117/120) = floor(9.75) = 9
base:A+C=113  f=0.974138  10f=9.7414  score=9      # floor(10*113/116)
score9 iff A+C>=27: 27->9
score=10 impossible: yes (f_O<1 for finite x)
x=20..26 -> 8 ; x=27 -> 9 (threshold) ; x=28..30 -> 9
```
Matches SCORECARD `kumitate-proxy-v1` block (A=90, C=27) and `## Axes` operability=9
("9 is this proxy's terminal integer").

## 4. Lane-gate re-derivations (all read-only, run inside scratch extractions)

- `UFO_SRC=… node scripts/proxy-check.mjs --strict` @ R1 →
  `PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`, **exit 0**
- `node scripts/proxy-check.mjs` @ base 7178bfd →
  `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=132 computed=133 delta=+1`;
  `PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`;
  `PROXY: DRIFT (…)`, **exit 1** — the routed R56-V3 defect at base (pre-existing harm, repaired by round 57)
- `node scripts/proxy-check.mjs` @ r56 close e74ea6b8 →
  `PROXY: MATCH (A=87 C=26 operability=9; C1=19/19 C2=132/132 coverage=10; S=88/88 …10; R=92/92 …10; K=53/53 …10; pins=6 match; src-rev=31c465f15669)`, **exit 0** — formal before-state
- `node scripts/readme-map.mjs` @ R1 → `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0;
  `--selftest` → 14 cases PASS, `README_MAP_SELFTEST: PASS (14/14)` + `VERDICT: PASS`, exit 0

## 5. Checklist battery and anchor-truth (item 707 environment sensitivity)

- Close receipt `.ufo/waves/round-57/close/harm-battery.txt` (lane root, canonical runtime):
  `CHECKLIST: 27/27 pass` / `VERDICT: PASS`; `PROXY: MATCH` identical to the R1 scratch run above;
  sources census `census_exit=0` (4 known W04); `COUNTER_PINS: CLEAN pins=14`.
- Battery rerun from a git-less scratch extraction (`node scripts/surface-probe.mjs --checklists`
  @ R1 scratch): `CHECKLIST: 24/27 pass`, `VERDICT: FAIL`, exit 1. Decomposition:
  - 2 fails = lane-root misdetection from the git-less scratch: `ROUND_GATE: FAIL-CLOSED
    (REPORTS_DIR_MISSING) --reports-dir <build/ReviewAxisMove>/.ufo/reports is absent`
    (items "Round-close artifact audit", "Filed-report tracking");
  - 1 fail = "Per-anchor truth burn-down" (`node scripts/anchor-truth.mjs --base e18ff1af…`):
    `TRUTH: DRIFT (138 findings: REVIEW_UNBOUND …)` — see below.
- anchor-truth, identical argv, four runs — totals byte-identical in all four
  (`TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13`):
  | tree | verdict | exit |
  |---|---|---|
  | base 7178bfd (scratch) | `TRUTH: DRIFT (138 findings …)` | 1 (per battery item record) |
  | R1 f0dc6d11 (scratch) | `TRUTH: DRIFT (138 findings …)` | 1 (per battery item record) |
  | tip 8c6f5b01 (scratch) | `TRUTH: DRIFT (138 findings …)` + `TRUTH_WARN … pass --open REV` | 1 (`node_exit=1`, measured directly) |
  | **live lane working tree** | **`TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 …)`** | **0 (`node_exit=0`, measured directly)** |
  The binding review records are lane-working-tree wave artifacts; committed-only extractions
  lack them. Round 57 added zero anchor debt (identical totals at base and R1).
- `.ufo` IS committed at R1 (`git ls-tree -r f0dc6d11 --name-only | grep -c '^\.ufo/reports/'` → 1,
  namely `.ufo/reports/round-33/kumitate.md`); the REPORTS_DIR_MISSING failures were pure
  root-misdetection, not a missing committed dir.

## 6. Rejected hypothesis (recorded for honesty)

First delta pass used inverted `comm` flags for this host's column order and printed the
three added files as both "+" and "-". Superseded by the verified decomposition in §1/§2
(wc/md5/comm/diff triangulation); conclusions unchanged.
