# K100ExecHarm — harm battery for the two reader swaps (K3), kumitate round 100

Seat dir (receipts): `.ufo/waves/round-100/K100ExecHarm/` — `base.txt`, `cand.txt`, `battery-diff.txt`,
`history.txt`, `consumers.txt`. Lane rev: frozen `445196e4609b76f23d706403b7bebf1135066952`.
Scratch `/fast/scratch/hyaku/kumitate-r100/K100ExecHarm` (clone + per-rev raw I/O) removed before yield.

**Candidate note:** `K100ExecTool/READY` never appeared during this seat's run (checked 04:34/04:35/04:38;
the dir held in-progress files whose mtimes advanced, so the builder was live — I did not sleep-wait).
Per seat spec, the battery attacks **ctl-positive** (frozen L1 reference rule R100), regenerated into my
scratch via `probe/make-controls100.py`; sha256 `865ba7e5…` (cite) / `59ca1a3b…` (capture) byte-match
`controls/controls-sha256.txt`; line 36 = `/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/`, line 157 = the split('\n')
+ same-match form — exactly the L1 reference in plan.md. All "candidate" statements below mean ctl-positive.

## 1. Battery (K3), base vs candidate in a `git clone --shared` sandbox at the frozen rev

`bash close/battery.sh <clone> base` → `base.txt`; candidates copied over `scripts/{cite-sources,source-capture}.mjs`;
rerun → `cand.txt`; diff → `battery-diff.txt` (28 lines, hunks only at: header label, proxy-check ×2, counter-pins).

| # | battery command | base→cand exit | verdict |
|---|---|---|---|
| 1 | `node scripts/cite-sources.mjs` | 0→0 | same (CLEAN cited=282, byte-identical) |
| 2 | `node scripts/source-capture.mjs` | 1→1 | same (DRIFT bad=11 first=S269:uncaptured, pre-existing, identical) |
| 3 | `node scripts/cite-sources.mjs --selftest` | 0→0 | same (PASS 8/8) |
| 4 | `node scripts/source-capture.mjs --selftest` | 0→0 | same (PASS 13/13) |
| 5 | `node scripts/proxy-check.mjs` | 1→1 | expected: +2 GATE_PIN_DRIFT (pin.source-capture, pin.cite-sources); A_wave/C2 bookkeeping lines unchanged; verdict word still DRIFT |
| 6 | `node scripts/proxy-check.mjs --strict` | 1→1 | expected: same +2 pin lines |
| 7 | `node scripts/readme-map.mjs` | 0→0 | same (CLEAN files=258 rows=258) |
| 8 | `node scripts/sources-check.mjs` | 0→0 | same (CLEAN rows=217) |
| 9 | `node scripts/counter-pins.mjs` | 0→1 | **expected-pin-bookkeeping but beyond the stated expectation**: `COUNTER_PINS: DRIFT pins=50 bad=1 first=source-capture:hash-mismatch` |
| 10 | `node scripts/spotcheck-adopt.mjs --check` | 0→0 | same (CLEAN spotchecks=66) |
| 11 | `node scripts/round-gate.mjs --tracked …` | 0→0 | same (CLEAN checked=82) |
| 12 | `node scripts/round-gate.mjs --round 99 …` | 0→0 | same (CLEAN checks=10) |
| 13 | `sources-census.sh validate --file corpus/SOURCES.md` | 0→0 | same (ok; same two W04 lines) |

**Finding for L1 (K3 input, not judged here):** 12/13 commands byte-identical apart from the two anticipated
proxy pin lines; command 9 (`counter-pins`) additionally flips CLEAN→DRIFT exit 0→1 because
`.ufo/pins/counter-pins.json` pins `scripts/source-capture.mjs` (round 55, sha256 `39bdeb39…`) against
working-tree bytes. Any byte change to that gate — including the R100 fix — drifts this pin until re-declared
in the adoption commit (same bookkeeping class as the proxy pins, but it is a battery-command exit flip the
assignment's expected-diff sentence did not list). cite-sources is NOT counter-pinned.

## 2. History walk — every committed revision of corpus/SOURCES.md (79 revs)

`git log --format=%H -- corpus/SOURCES.md` (79 revs, newest `2cf2e2aa…`); per rev: extract `corpus/SOURCES.md`,
`corpus/README.md`, `.ufo/pins/source-captures.json` (where present) via `git show` from the lane; run
BASE (frozen bytes) vs candidate (ctl-positive) with stdout+exit compared:

- cite-sources `--readme/--sources`: **79/79 same** (0 differ)
- source-capture with that revision's pin registry: **51/51 same** (28 revs predate the pin file → NOREG, recorded)
- source-capture with an all-ids exemption registry built by the frozen R100 row rule: **79/79 same**
- total: **209 comparisons, 209 same, 0 differ, 0 skip** (`history.txt` ends `COUNTS same=209 differ=0 skip=0`;
  per-rev raw stdout/rc retained in scratch during the run, receipt is `history.txt`)

## 3. Consumers (`consumers.txt`)

Runtime consumers of the tools' output in the lane: `harm-matrix-gates.json` (source-capture plain + both
selftests; NO plain cite-sources entry), `proxy-check.mjs:563,567` (sha pins of both tools),
`.ufo/pins/counter-pins.json`→`counter-pins.mjs` (source-capture only), `close/battery.sh` (harness),
SKILL.md rows 628/634/743/751 (prose docs; verdict formats unchanged by R100). Nothing else parses
`SOURCE_CAPTURE:`/`CITE_SOURCES:` lines (grep-negative). Verdict formats, exit maps and contract ids are
preserved by R100, so no consumer reads differently except the two-to-three pin-sha surfaces above.

## Bottom line for K3

Measured on ctl-positive: no battery command reads worse except pin bookkeeping — the two anticipated proxy
pin lines **plus one not-anticipated counter-pin line** (source-capture). No regression in any functional
reader across 79 historical revisions (209/209 identical). If K100ExecTool's candidates differ in bytes from
ctl-positive, the pin-line counts stand (any byte change drifts the same pins); the history walk should be
re-pointed at the real candidates before close if they land — my harness (`history-walk.sh` logic above,
7 s runtime) makes that a re-run, not new work.
