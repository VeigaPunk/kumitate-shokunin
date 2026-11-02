author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# Round 71 verifier spot-check — kumitate (counter-side recovery, measured budgets)

Non-author closure verification of kumitate round 71. Base `e1e8e3047eb4d41c81afa40a43397d3d6b1c619b`,
tip `e700e5fc2700df1dd03661e7b6f3f392426fc36c` (local `refs/heads/master` == `origin` `refs/heads/master`,
verified by `ls-remote`). Work revs `f4f67ec5931ee2aa5e0da088f4e3f444e234d08e` (attempt 1) and
`798a5bb4bac8eeb4dbf0517d38a466b177a54dc7` (attempt 2 = measured revision M). All checks below were
re-derived by this verifier from committed bytes (`git show` / `cat-file` / `diff-tree` / `ls-remote`
only — index-free; no mutating git anywhere) plus live re-execution of the frozen counters.

## 1. Step-1 conformance

| check | command (abridged) | result |
|---|---|---|
| report committed by lane identity | `git -C <fleet> log --format='%an %ae %H' -1 -- .ufo/reports/round-71/kumitate.md` | `kumitate-shokunin <kumitate@shokunin.local> ec90cae4236f…`; the commit touches only that one file (`diff-tree -r --name-status` → `A .ufo/reports/round-71/kumitate.md`) |
| SHONEN heading | read of the report | `## SHONEN` present, four boxes, all `[~]` with pointers and "verifier: pending non-author closure judge" |
| cited lane commits exist + ancestor | `merge-base --is-ancestor <h> refs/heads/master` for `e700e5fc…`, `f4f67ec5…`, `798a5bb4…` | all ANCESTOR-OK; cited r70 revs `78b98d76…`, `3b148380…`, `89cbd998…` all resolve (`cat-file -t` = commit) |
| branch tip pushed | `ls-remote origin refs/heads/master` vs local `rev-parse refs/heads/master` | both `e700e5fc2700df1dd03661e7b6f3f392426fc36c` |
| round work reachable | `git log e1e8e3047eb4..e700e5fc2700` | exactly the three round commits (`f4f67ec`, `798a5bb`, `e700e5f`), all under the lane identity |
| dispatch/complete digest | `grep 'kumitate round=71' .ufo/watchdog.log` (fleet) | `2026-11-01T01:22:40-07:00 launch kumitate round=71 base=e1e8e3047eb4 (zcode run14)` / `2026-11-01T10:46:34-08:00 complete kumitate round=71 head=e700e5fc2700 pushed=True` — matches the closure digest |
| lands-last ordering | commit timestamps | work 10:56:47 UTC → work-2 15:48:03 UTC → close 18:40:28 UTC → report commit 18:46:36 UTC (receipt `endedAt` values ≤ their commits) |
| no uncommitted round work | sha256 of 20 round files (worktree) vs `git show e700e5fc2700:<path>` | all 20 MATCH |

Conformance: PASS. No marker predicate; the report names real committed work.

## 2. Claim re-check

The round declares exactly one claim: **C1 — operability (lowest non-retired axis, 9, terminal integer),
capability `control-replay` ratchet: versioned counter v3 (`replay71-probe`, rule R71) with measured
budgets.** Verified **re-measured** (this verifier re-executed the committed green counter end-to-end)
plus **evidence-verified** for the red receipt and the budget arm.

### 2a. Green — re-executed by the verifier (the decisive after-state)

Byte extraction and pin checks (both counter blobs match their committed pins exactly):

```
git show 798a5bb4…:.ufo/waves/round-71/probe/replay71-probe.mjs  → sha256 75094e4a8669e8ba…  (= pin.replay71-probe)
git show 89cbd998…:.ufo/waves/round-70/probe/replay70-probe-v2.mjs → sha256 8e5ad95d1af35e65…  (= pin.replay70-probe-v2)
```

The verifier's frozen-reference inputs (12 files: r69 c1/c2 controls, r69 inner probes, r70 v1/v2
counters, five frozen r69 receipts) were hash-compared on-disk vs `e700e5fc2700` — all MATCH — before
running. Re-run command: `node replay71-probe.mjs <lane-repo> 798a5bb4bac8eeb4dbf0517d38a466b177a54dc7`.
Observed (verifier's own run, ~2.5 h wall on this host):

```
REPLAY71_HELD held=17/17 checks=17 rev=798a5bb4bac8eeb4dbf0517d38a466b177a54dc7 rule=R71
V01 PASS frozen bytes match reference
V02 PASS selftest exit=0
V03 PASS family=c1 mode=donothing exit=0 digest=ok childExit=0
V04 PASS family=c1 mode=autoledger exit=0 digest=ok childExit=0
V05 PASS family=c2 mode=donothing exit=0 digest=ok childExit=0
V06 PASS family=c2 mode=autoorigin exit=0 digest=ok childExit=0
V07 PASS family=c2 mode=forgecapture exit=0 digest=ok childExit=0
V08 PASS two runs diverge
V09 PASS probe-local exit=0 receipt-childExit=0 normalized equal
V10 PASS all six shapes exit 64 side-effect-free
V11 PASS existing=true link=true
V12 PASS decoy-unchanged=true tool-exit=0
V13 PASS exits=0,1 childExits=0,0 distinctChildren=true
V14 PASS SKILL + SCORECARD rows and tool/v2/v3 pins
V15-print-only PASS REPLAY71_UNMET held=3/14 … exit=1
V16-canned-writer PASS REPLAY71_UNMET held=3/14 … exit=1
V17-mutate-then-refuse PASS REPLAY71_UNMET held=3/14 … exit=1
```

This matches the committed receipt `.ufo/waves/round-71/close/replay71-AT-M-win32.txt` arm-for-arm;
the only differing bytes are the three attack-fixture revs (fresh `mkdtemp` fixtures — expected).
The `held=17/17` verdict deterministically maps to exit 0 per the counter's exit map. **The green
after-state is a non-author reproduction, not a quoted receipt.**

### 2b. Red — receipt verified from committed bytes; decisive conjuncts live-observed

The committed red receipt `.ufo/waves/round-70/close/replay70-v2-AT-M-win32.txt` reads
`REPLAY70V2_UNMET held=8/17 checks=17 rev=89cbd998ff956965634b14368231c6d117d6437e rule=R70v2`;
`grep -c MISS` over the committed bytes → **9** (V03–V09, V12, V13), exactly as reported. The v2
counter blob is hash-pinned (`8e5ad95d…`, verified). Byte cites confirmed in the pinned blob:
`replay70-probe-v2.mjs:227` = `&& rec.childExit === 1 && rec.nonce && rec.workChild` (the base-era
constant) and `:240` = `const first = receipts[0]?.rec;` (the V08 cascade). The tool's exit map at
`798a5bb4…` line 23 reads `0 replay performed and CONTROL-PASS`, grounding the `childExit===0`
contract fix.

The verifier launched two full red re-runs (`node replay70-probe-v2.mjs <lane> 89cbd998…`). Both
progressed identically through V03–V08 and then **aborted at arm V09** with
`REPLAY70V2_ERROR … reason=EPERM … local-XXXX` in the temp-dir cleanup. Mechanism, byte-cited:
v2's probe-side local runner still carries the stale r70 budget — `replay70-probe-v2.mjs:150`
`timeout: 900000` — while this host's c1/donothing control now takes ~900–921 s (this round's own
receipts: `measure/m1-c1-donothing.txt` killed at 900046 ms; `measure/s1-c1-donothing.txt` completed
at 921210 ms). The local run hits the 900 s kill, the orphaned inner probe holds the temp dir, and
`rmTree` fails with EPERM — reproduced twice, deterministically. The five live control receipts the
aborted runs produced carry `childExit=0`, which fails v2's `=== 1` conjunct — the red verdict's
V03–V07 MISS mechanism, observed live.

Ruling: the red after-state is **evidence-verified** (authentic receipt, correct arithmetic, pinned
counter bytes, provenance at the r70 close rev), its decisive failing conjuncts are **live-observed**,
and a full red traversal is currently host-blocked by the very stale-budget calibration this round
diagnosed and fixed — a corroboration of the round's thesis, not a discrepancy. The before→after
claim (red 8/17 → green 17/17) therefore **verifies**.

### 2c. Budget arm — evidence-verified

All raw receipts read and cross-checked against `measure/MEASUREMENTS.md`: m1 kills (c1/donothing
`durationMs=900046 childExit=-1 childSignal=SIGTERM`; c1/autoledger `900040` SIGTERM), scaffold
completions (`s1-*.txt`: 921210 / 922358 ms, `childExit=0`, CONTROL-PASS present), the 2-way pair
(`conc-c2d-*.txt`: 689670 / 689597 ms, both `childExit=0`, distinct `workChild`/`nonce`;
`conc-scaffold.txt` `exits=1,0 wallMs=713995 workEntriesAfter=0`). Derivation recomputed:
`ceil(1.25 × 922358 / 60000) × 60000 = 1 200 000` ms. The tool diff in the range is exactly the
budget recalibration (900000 → 1200000 + receipt-cited comment, 13 lines) with `pin.control-replay`
re-pinned in the same commit `f4f67ec5` (r70 precedent `89cbd998`); counter waits 1 260 000 ms and
failsafe 2 520 000 ms appear verbatim in the v3 header. Receipt timestamps (08:51–10:28 UTC) sit
inside the mission window and at-or-before their commit. The disclosed invalid column in
`m1-sequence.log` (exit=0 rows for SIGTERM-killed runs) matches the receipts' timeline and is honestly
marked invalid.

### 2d. Routed defects D1–D5

| item | re-check | result |
|---|---|---|
| D1 dead pointer | `.ufo/waves/round-70/close/replay70-v1-AT-BASE-win32.txt` now committed; sha256 == `base/replay70-base.txt` | BYTE-IDENTICAL (0b37e114…) — closed |
| D2 attribution | `replay70-v1-AT-M-win32.txt` head = `…held=6/10 … rev=3b148380… live=exercised`; `…AT-M2…` = `…held=5/10 … rev=89cbd998…` with the Node crash tail | reads exactly as corrected — closed (append-only) |
| D3 anatomy | v2:240 cascade cite confirmed (above) | closed with byte cite |
| D4 selftest count | authority `.ufo/waves/round-70/close/control-replay-selftest.txt` = `CONTROL_REPLAY_SELFTEST: PASS (21/21)`; SKILL `control-replay` row corrected 20/20 → 21/21 with dated r71 note; knowledge entry gained an append-only `## Correction (round 71…)` section | closed |
| D5 SHONEN box 4 | round-70 report not rewritten (correct — filed reports are immutable); `[~]` annotation recorded in SCORECARD r71 section, r71 report, lesson | closed |

### 2e. Other landed-change checks

- `diff-tree -r e1e8e3047eb4 e700e5fc2700`: 31 paths, all lane-scoped (round-71 wave tree, pins,
  LOG/SCORECARD/SKILL, corpus, `scripts/control-replay.mjs`, the r70 D1 receipt). PROVINCE.md,
  SHONEN.md, MANIFEST and other lanes' files untouched.
- SCORECARD diff is purely additive (one round-71 declaration section; the axis table region is
  byte-identical before→after — `operability 9`, `coverage 10 (retired)`, the three coverage
  successors 10). **No owned axis harmed.** No new capabilities-table row (correct: this is a
  ratchet of the existing `control-replay` capability, not a new entry).
- LOG diff is a pure 21-line append. Attempt-1 honesty verified: the preserved receipt reads
  `REPLAY71_UNMET held=10/17 … rev=f4f67ec5…` and the fix commit `798a5bb4` re-pins the counter.
- Gates receipt at close (`close/gates.txt`): SOURCES_CHECK CLEAN rows=159 · SOURCE_CAPTURE CLEAN
  captures=52 · README_MAP CLEAN files=172 rows=172 · CITE_SOURCES CLEAN cited=207 · COUNTER_PINS
  CLEAN pins=41, all exit 0 — lane-owned evidence, not re-executed by this verifier.
- `corpus/README.md` gained rows for `lessons/round-70-verifier-spotcheck.md` (landed at the
  previous closure) and `lessons/round-71.md`; `readme-map.json` pin updated.

## 3. Per-axis verdicts

| axis | verdict | evidence |
|---|---|---|
| operability | **improved** | C1 verified by the verifier's own green re-execution (17/17) against the receipted red 8/17; the integer is terminal-held at 9 by the frozen `f_O` arithmetic (axis cell unchanged, correct) |
| coverage (retired aggregate) | unchanged | axis cell byte-identical before→after |
| coverage:script-layer | unchanged | axis cell byte-identical before→after |
| coverage:runtime-layer | unchanged | axis cell byte-identical before→after |
| coverage:kimi-layer | unchanged | axis cell byte-identical before→after |

## 4. Discernment spot-check (non-author)

Census validator re-run by this verifier:
`bash scripts/sources-census.sh validate --root <fleet> kumitate` → six carried W04 rows + `ok` +
`EXIT=0`, byte-identical to the committed `close/census-end.txt`. SOURCES row count:
`grep -cE '^ {0,3}\| S[0-9]{3}' corpus/SOURCES.md` → base 158, tip 159 (S220 added, matches report).

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| ADMIT: counter-side ratchet v3 + measured two-step budget recalibration | admit | S220 row; pinned capture `close/captures/node-child-process.html` (sha256 `c1ba4886c43e760d…`, 224259 bytes — re-hashed, matches row and capture pin) AND the live page nodejs.org/docs/latest-v24.x/api/child_process.html (quote re-opened live: "The exit code of the subprocess, or null if the subprocess terminated due to a signal" — verbatim in §spawnSync Returns: `status`); plan.md two-step rule; m1/s1/conc receipts; verifier's own green re-run | **agree** | The admit is exactly what the frozen rule prescribes and the receipts support; the verifier's own re-execution confirms the admitted artifact runs green on measured budgets; S220's quote is genuine, located, and grounds the kill semantics (16 words — see defect note N2) |
| REJECT: derive the budget from r70's numbers or the r70:current ratio alone | reject | m1 receipts vs r70 close receipts (787137 ms max then; 900046 ms kill now) | **agree** | The ratio would have set ~900 s again — the cap that demonstrably no longer holds; the m1 kill is direct evidence the old numbers were a stale window, so fresh completions were required |
| REJECT: amending the scored v2 counter bytes in place | reject | pin `8e5ad95d…` re-hashed against the blob at `89cbd998…`; `diff-tree` range shows no change to `.ufo/waves/round-70/probe/*` | **agree** | Frozen history is the ratchet's premise; the round held it and registered v3 as a successor with its own pin `75094e4a…` |
| REJECT: weakening V13 to "receipts exist" | reject | v3 V13 code (digest + childExit=0 both + distinct workChild/nonce + clean root) and the measured corollary receipt `conc-scaffold.txt` (`exits=1,0`, root clean) | **agree** | The measured early-finisher exit-1 shows process exits are unreliable under shared-root contention; the receipt-side conjuncts are what make the arm falsifiable |

SOURCES row re-opened (contract: ≥1 new row): S220 — quote verified in both the pinned capture and
the live page; tier A appropriate (official v24.x API docs); `used-by` cells resolve
(`replay71-probe.mjs`, `plan.md`, `MEASUREMENTS.md`).

## 5. Trend verdicts (this verifier's ruling; all use the protocol vocabulary)

- **expansion: unchanged** — no new knowledge entries on new coverage ground (the only knowledge
  change is D4's append-only correction section); the single new SOURCES row grounds the lane's own
  instrument (`used-by` = probe/plan/measurements), no frontier band advanced. Matches the lane.
- **quality: improved** — the ratchet counter runs its full battery green on this host inside
  measured, receipt-derived budgets (re-executed by this verifier); every fix traces to a routed
  item; six mistakes mined with class · evidence · captured-by · fix; attempt 1's UNMET receipt
  preserved rather than discarded; D4's stale number corrected append-only with the receipt as
  authority. No admitted entry failed a re-check. Matches the lane.
- **discernment: improved** — the round refused to assume the r70 budget (killed twice by reality,
  then measured), corrected its own V09 anatomy and the verifier's V08 hypothesis with byte cites,
  and caught its measurement-infra defect from a receipt-vs-log discrepancy. The verifier's two red
  re-runs independently reproduced the stale-budget failure mode the round diagnosed — the round's
  central judgment call (measure, don't assume) is confirmed from outside. Matches the lane.

## 6. Notes and routed items for the next round (status-neutral)

- **N1 (number-drift, LOG):** the LOG round-71 entry's gates line cites `README_MAP files=171` /
  `CITE_SOURCES cited=206`; the committed close `gates.txt` reads 172 / 207 (the lesson + README row
  added in the same close commit moved both). LOG is append-only — correct next round with an
  appended note.
- **N2 (count nit):** the lesson annotates the S220 quote "(17 words)"; the quote is 16 words
  (the ≤25-word bound holds either way).
- **N3 (aside nit):** the round report's operability aside "A grows by the one new counter file" is
  loose — the frozen `A` stays 10 (the new counter is a `.ufo/waves` artifact, not a `scripts/`
  executable); the unchanged SCORECARD cell is the authority and is correct.
- **N4 (wording):** the v3 counter header (and the closure-note phrasing "controls/v1/v2/tool bytes
  hash-checked untouched") overstates "untouched" for the tool: `scripts/control-replay.mjs` WAS
  byte-changed this round by the measured budget recalibration (900000 → 1200000, 13 lines) and
  re-pinned in the same commit. Accurate statement: controls/v1/v2 bytes untouched and hash-checked
  (true — not in the diff range); tool pin-checked against its re-pinned sha. Disclosed everywhere
  else; wording only.
- **N5 (disclosed limit, re-confirmed live):** the frozen v2 counter cannot complete a full battery
  on this host in the current speed window — its V09 local-run timeout (`replay70-probe-v2.mjs:150`,
  900000 ms) predates the recalibration, and when c1/donothing exceeds 900 s the local run is killed
  and the run aborts with `REPLAY70V2_ERROR` (EPERM in cleanup); observed twice by this verifier on
  2026-11-01. v2's bytes are frozen history, so no fix is routed; future verifiers should treat the
  committed red receipt as the red evidence (its arithmetic and provenance check out) and re-run the
  green counter for the live after-state, as done here.
- **SHONEN (for the operator):** all four boxes now carry resolvable evidence pointers and the lane
  itself marks them `[~]` pending non-author verification. They look fully checkable by a non-author
  on the evidence this spot-check re-derived (SKILL decision tables + registry rows with cited
  sources; the end-to-end replay/measure/recovery task logged in LOG.md round 71; counter + budget
  rule executable from committed text alone; S220 grounds the lane's own instrument only — no
  cross-domain absorption, and the D5 annotation corrects the round-70 `[x]`). Per the closure
  contract this verifier does not write `[x]` into SHONEN.md; the operator or a designated non-author
  reviewer may now do so.
- Assimilation: `considerthese/2026-10-26.md` exists and the report's re-read statement is
  consistent with its content classes; `Assimilation: none — shokuknow unreachable` is the honest
  closing (the register is not reachable from this host).

**Closure ruling: C1 verifies (re-measured); no axis harmed; conformance clean with nit-level notes
only. Round 71 kumitate: admitted.**
