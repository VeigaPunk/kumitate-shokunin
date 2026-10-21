CRITIC fidelity-heuristic sampled=40 correct=20 wrong=19 ambiguous=1

# CriticFidelityHeuristic: FIDELITY v1 pairing rule tested against real notes (round 36 build)

**Counterexample.** FIDELITY v1 pairs an anchor with the span on its RIGHT first. The notes are mostly written
as `sym` (`:N`), with the symbol on the LEFT. So in any list `a` (`:1`), `b` (`:2`), the gate scores `:1` against `b`.
Results: 19 of the 39 unambiguous sampled pairings use the wrong symbol, and 12 of the 32 sampled `elsewhere`/`absent` verdicts are false positives.
Under v1, re-anchoring to the correct line still reads nonok, while moving the anchor onto the neighbour's line reads
`ok` (see the simulation table below). A nonok=0 ratchet would therefore reward false provenance. This is a fixable defect in the pairing rule, not a tradeoff.

## Method (read-only; this report is the only file written)
- Pin: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; lane HEAD `0614092e…`, tracked tree clean.
- Harness: an in-memory Bun eval that writes no files. It imports `probeSections` from `scripts/claims-check.mjs` (entry-guarded, :919-924)
  and copies the pairing and classify code verbatim from `.ufo/waves/round-36/baseline/fidelity-reference.mjs.txt:11-45`, adding one record per anchor.
  It reproduces the reference totals exactly: `anchors=1504 ok=330 elsewhere=481 absent=96 dead=173 noid=424 nonok=577` (`baseline/fidelity-reference.txt:19`).
- Sample: mulberry32 PRNG (seed 36), stratified by note × class. 32 nonok anchors (ops-watchers 9, remaining-scripts-census 9, sighting-wall 3,
  native-trial-launch 3, route-probe-cluster 2, cost-and-profile 2, and 1 each from runtime-support, loop-driver, failure-telemetry and swarm-wave-lifecycle) plus 8 ok anchors, across 10 notes.
- Hand check: for each anchor I read the note sentence (and the previous line when the anchor opens a wrapped line) against the pinned file lines. Column meanings:
  - `intended`: the span the sentence attaches the anchor to. `(prose)` means the anchor cites a prose claim, not a backticked symbol.
  - `truth`: the verdict using the intended symbol (prose claims checked by reading the lines).
  - `G5`: the verdict under the proposed rule.

## Sample (rsc = remaining-scripts-census, ntl = native-trial-launch, rpc = route-probe-cluster)
| id | note:line | anchor | v1 cls:side | v1 paired | intended | pairing | truth | G5 | note |
|---|---|---|---|---|---|---|---|---|---|
| S01 | ops-watchers:424 | `:586` | absent:R | `ufo_runtime_path_not_priv…` | `ufo_runtime_path_owner` | wrong | absent | absent | codes absent from file |
| S02 | ops-watchers:423 | `:503` | absent:R | `ufo_socket_mode_not_priva…` | `ufo_socket_not_owned` | wrong | absent | noid | symbol on prev line 422 |
| S03 | ops-watchers:211 | `:1279` | absent:L | `respawn_skipped_bad_path …` | same | correct | elsewhere | absent | real 1361; `<title>` defeats match |
| S04 | ops-watchers:196 | `:150` | elsewhere:R | `MAX_LANE_ENQUEUES_HOUR = 4` | `MAX_ENQUEUES_HOUR = 48` | wrong | elsewhere | elsewhere | real 199; v1 hint 202 |
| S05 | ops-watchers:359 | `:145` | elsewhere:L | `path_ping` | same | correct | elsewhere | elsewhere | real 132-134 |
| S06 | ops-watchers:372 | `:490-497` | elsewhere:R | `the-tick-chat-result-v1` | `the-tick-health-result-v1` | wrong | elsewhere | noid | prev line; real 437 |
| S07 | ops-watchers:246 | `:1615` | elsewhere:L | `process.exitCode = 64` | same | correct | elsewhere | elsewhere | real 2160 |
| S08 | ops-watchers:425 | `:605` | absent:R | `ufo_runtime_path_escape` | `ufo_runtime_path_xdg_unset` | wrong | absent | absent | |
| S09 | ops-watchers:320 | `:155` | elsewhere:L | `"runner returned trailing…` | same | correct | elsewhere | elsewhere | real 102 |
| S10 | rsc:530 | `:109` | elsewhere:R | `coldVia` | `ufo-ledger-rotation-v1` | wrong | ok **FP** | ok | |
| S11 | rsc:611 | `:32-36` | elsewhere:R | `UFO_PROJECTION_ROOT` | (prose) | wrong | ok **FP** | noid | stderr + exit 64 on 32-36 |
| S12 | rsc:566 | `scripts/local-helper.mjs:332` | elsewhere:L | `UFO_LOCAL_HELPER_URL` | same | correct | elsewhere | elsewhere | read at 325 |
| S13 | rsc:472 | `:56` | elsewhere:R | `END_MARKER` | `BEGIN_MARKER` | wrong | ok **FP** | ok | |
| S14 | rsc:754 | `:17` | elsewhere:R | `decideRow` | `STABLE_REFUSAL_REASONS` | wrong | ok **FP** | ok | |
| S15 | rsc:468 | `:7` | elsewhere:R | `{{HEAD}}` | `{{DATE}}` | wrong | ok **FP** | ok | |
| S16 | rsc:721 | `scripts/ufo-swarm-collect.test.mjs:16` | absent:R | `test()` | `SCRIPT` | wrong | ok **FP** | noid | symbol on prev line |
| S17 | rsc:750 | `:341-345` | elsewhere:R | `STABLE_REFUSAL_REASONS` | (prose) | wrong | ok **FP** | noid | prune on 341-345 |
| S18 | rsc:707 | `:441-456` | elsewhere:R | `cap` | `appendEvent` | wrong | ok **FP** | ok | |
| S19 | sighting-wall:121 | `:3511` | elsewhere:R | `peekMission` | `steerMission` | wrong | elsewhere | elsewhere | real 3543; v1 hint 3576 |
| S20 | sighting-wall:209 | `:59` | elsewhere:R | `kind` | `surfaceManifest` | wrong | ok **FP** | ok | |
| S21 | sighting-wall:211 | `:318` | elsewhere:L | `runLegacyNativeDirect` | same | correct | elsewhere | elsewhere | real 325 |
| S22 | ntl:357 | `:171` | elsewhere:R | `resolveNativeDispatchPoli…` | `snapshotDispatchInputs` | wrong | elsewhere | noid | prev line; real 176 |
| S23 | ntl:372 | `:951` | elsewhere:R | `persistEvidenceWrites` | `writeEvidenceFile` | wrong | elsewhere | noid | prev line; real 955 |
| S24 | ntl:355 | `:958` | elsewhere:L | `planLaunchMode` | same | correct | elsewhere | elsewhere | JSDoc line; def 965 |
| S25 | rpc:111 | `:784` | elsewhere:L | `mapPool` | same | correct | elsewhere | elsewhere | inside body; def 775 |
| S26 | rpc:195 | `:60` | elsewhere:R | `SUCCESS_MODES` | `catalogHasRoute` | wrong | ok **FP** | ok | |
| S27 | cost-and-profile:151 | `native_profile.rs:204-209` | elsewhere:L | `nativeProfiles.{profile}.…` | same | correct | elsewhere | elsewhere | real 218 |
| S28 | cost-and-profile:16 | `:481` | elsewhere:R | `require_cost_ledger_when_…` | same | correct | elsewhere | elsewhere | list cites native.rs (call at 430) |
| S29 | runtime-support:248 | `live_tests.rs:496` | absent:L | `crate::test_env::explicit…` | (prose) | wrong | ok **FP** | noid | test fn on 496; left span sits across `); ` |
| S30 | loop-driver:44 | `loop_driver_open.rs:69` | elsewhere:L | `LoopDriver::open` | same | correct | ok **FP** | elsewhere | `pub fn open` inside `impl LoopDriver` (:61) |
| S31 | failure-telemetry:60 | `scripts/ufo-mission-result.mjs:1308` | elsewhere:L | `acquireSingletonLock` | same | correct | elsewhere | elsewhere | JSDoc; def 1311 |
| S32 | swarm-wave:92 | `scripts/ufo-swarm-wave.mjs:166` | elsewhere:L | `GODSPEED_MARKER` | same | correct | elsewhere | elsewhere | real 159 |
| S33 | rsc:542 | `:120` | ok:L | `touchedPaths()` | same | correct | ok | ok | |
| S34 | rsc:534 | `:48` | ok:L | `SIDECAR` | same | correct | ok | ok | |
| S35 | rsc:574 | `:189` | ok:L | `evidenceSection` | same | correct | ok | ok | |
| S36 | sighting-wall:142 | `:65` | ok:L | `MAX_COMPLETED_MISSIONS = …` | same | correct | ok | ok | |
| S37 | ntl:430 | `:212` | ok:L | `collectStrings` | same | correct | ok | ok | |
| S38 | rpc:144 | `:24` | ok:L | `fail` | same | correct | ok | ok | |
| S39 | loop-driver:49 | `loop_driver_open.rs:253` | ok:L | `validate_local_roster` | same | correct | ok | ok | |
| S40 | ops-watchers:311 | `:30-41` | ok:R | `present: 0` | (group) | ambiguous | ok | noid | "**Exit codes** (`:30-41`): …" |

## Observed false-positive rates (v1; 32 sampled nonok)
- `elsewhere`: 10/26 FP = 38.5% (Wilson 95% interval 22–57%). `absent`: 2/6 FP = 33% (10–70%). All nonok: 12/32 = 37.5% (23–55%).
- Causes: 11 of the 12 FPs are wrong-symbol pairings (10 took the right-hand span; S29 took a left-hand span across `); `). S30 is a matcher FP: the
  qualified path `LoopDriver::open` never appears verbatim on the line `pub fn open`.
- The other 8 wrong pairings (S01 S02 S04 S06 S08 S19 S22 S23) are real drift scored against the wrong symbol. Their `elsewhere` hint names the
  neighbour's line, so a repair that follows it goes to the wrong place.
- By note: 8 of 9 sampled rsc nonok are FP. ops-watchers is 0/9 FP (genuinely stale; dead=158), but 5 of its 9 pairings are wrong-symbol.
- Mechanism, all 1504 anchors:
  - Right-paired: 338 → ok 23, nonok 315 (93%). Left-paired: 569 → ok 307, nonok 262.
  - 286 of the 338 right-hand gaps start with `)`: `), ` 85, `) and ` 31, `). ` 30, `); ` 22.
  - For 127 of the 315 right-paired nonok anchors, the LEFT span is inside the cited range. These are certain FPs: 22% of all 577 nonok.

## v1 rewards false provenance (simulated: rewrite the anchor in the note line, re-pair, re-score at the pin)
| id | correct anchor under v1 | anchor on neighbour's line under v1 | same two under G5 |
|---|---|---|---|
| S04 | `:199` (`MAX_ENQUEUES_HOUR = 48`) → elsewhere | `:202` → ok | ok / elsewhere |
| S13 | `:56` (`BEGIN_MARKER`) → elsewhere | `:57` → ok | ok / elsewhere |
| S14 | `:17` (`STABLE_REFUSAL_REASONS`) → elsewhere | `:18` → ok | ok / elsewhere |
| S19 | `:3543` (`steerMission`) → elsewhere | `:3576` → ok | ok / elsewhere |
| S26 | `:60` (`catalogHasRoute`) → elsewhere | `:58` → ok | ok / elsewhere |

## Proposed rule (G5): a single clause-guard predicate that removes the wrong-symbol class
> Refuse a candidate span when the text between it and the anchor contains a clause or list boundary. For a right-hand candidate the boundaries are `)` `,` `;` `.` `|`
> `—` `–` `→`. For a left-hand candidate they are `)` and `;`. Tokens of the form `<name>:<N>` (`config:49`, `hub:2279`) count as anchors, never symbols.
- Search order no longer matters. Right-first plus the guard and left-first plus the guard produce 0 differing pairings over 1331 non-dead anchors.
  Refusing whenever both sides qualify also changes 0 pairings, so no case of two candidates in one clause remains.
- Sample: 34 correct / 0 wrong / 5 noid / 1 ambiguous. The 5 noid are wrapped-line anchors (S02 S06 S16 S22 S23). Sampled nonok FP falls to 1/17 (S30).
- Population, v1 → G5:
  - ok 330→448, elsewhere 481→275, absent 96→77, noid 424→531, nonok 577→352.
  - No ok anchor becomes nonok. 9 ok anchors become noid, all right-hand pairs across `)` (e.g. S40). 127 nonok become ok; 97 nonok become noid.
- Per-note nonok, v1 → G5: rsc 177→49 (101 become ok), ops-watchers 189→162, sighting-wall 35→16, ntl 35→25, rpc 31→18,
  cost-and-profile 25→10, runtime-support 14→7, failure-telemetry 11→10, loop-driver 11→9, swarm-wave-lifecycle 10→9, distill-and-l3 8→6.
  Unchanged: runtime-remainder-census 11, queue-and-claim 8, route-resolution 8, native-judge-pipeline 4.
- Rejected alternatives:
  - Guard on `)`/`;` only, right-first: 34/0/5 on the sample, but it keeps at least 10 wrong pairs after a comma in the full population, e.g.
    `` `openTmpExclusive` (`:66`, `O_EXCL`) `` → `O_EXCL`, `` `--once` (`:159`, declared in `FLAG_ARGS…` `` → `FLAG_ARGS…`, `` `dead_pid` (`lease_tests.rs:6` — spawn `true` `` → `true`.
  - Left-first plus a `)`/`;`-only guard: 34/0/5 on the sample, but it keeps rsc:611 `:2136` → `!report.ok` (which belongs to `:2137`) and
    rsc:707 `:184` → `appendEvent` (which belongs to `:441-456`).
- Residuals under G5. I audited all 8 right-hand pairs, all 32 left pairs with a comma gap and 49 left pairs with unusual gaps:
  - 2 wrong pairs, both in anchor-first value lists: runtime-support.md:88 `lane_overlay_tests.rs:196` → `None` and :89 `:206` → `Some("x")`.
  - 6 qualified-symbol FPs whose last segment is on the cited line: `LoopDriver::open`, `LoopDriver::resume`, `grokWeb.bin`, `grokWeb.launcher`, `kimi.bridge`, `report.validationErrors`.
  - 28 placeholder symbols (`<title>`, `{profile}`) read `absent` where the drift is really `elsewhere` (as in S03). The drift is real; only the hint is wrong.
- Optional coverage step (not needed to remove the class): pair within the soft-wrapped paragraph instead of the physical line.
  - 116 anchors open a wrapped line whose symbol ends the previous line. With this step the sample reads 38 correct / 0 wrong / 1 ambiguous
    (S06 pairs `advisoryOnly: true`, which is part of its compound referent).
  - Population: ok 500, elsewhere 324, absent 92, noid 415, nonok 416. Nonok rises because more real drift becomes checkable.
  - It also fixes 8 lines (10 anchors) where a code span wraps across a newline and line-by-line tokenizing pairs the wrong backticks (cost-and-profile.md:148-149).

## Impacted axes
- operability (C1): reaching v1's nonok=0 would take at least 127 edits to prose that is already correct (101 of them in rsc), and the gate scores a re-anchor onto the neighbour's line as `ok`.
  A burn-down done under v1 would record false provenance as CLEAN. Under G5 the true before is nonok=352.
- coverage (C2): the 9 new R5/R7 sections must read nonok=0. If written in house style, `` `a` (`:N`), `b` (`:M`) ``, they read nonok under v1 even when exact.
  [INFERENCE: no R5/R7 member section exists in the lane tree yet to run.]

## Smallest safe correction
Amend the FIDELITY v1 pairing sentence with the clause guard and the alias-token rule before minting the ratchet ceilings or the before number. Recompute the before under the amended rule;
the expected result is `anchors=1504 ok=448 elsewhere=275 absent=77 dead=173 noid=531 nonok=352`. If the contract stays frozen, the judge must reject any re-anchor
whose new line contains the right-hand neighbour's symbol but not the left one (the S04/S13/S14/S19/S26 pattern).

## Commands run
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669…`; `git -C <lane> rev-parse HEAD` → `0614092e…`; `git status --porcelain=v1 --untracked-files=no` → empty.
- Bun eval harness as described: 1504 records; each variant re-paired and re-scored over the same records.
- `grep -n "impl LoopDriver\|pub fn open" crates/ufo-core-runtime/src/loop_driver_open.rs` → `61:impl LoopDriver {`, `69:    pub fn open(` (S30).
- `grep -n UFO_LOCAL_HELPER_URL scripts/local-helper.mjs` → env read at `325` (S12). `sed -n 1305,1312p scripts/ufo-mission-result.mjs` → JSDoc `1308`, def `1311` (S31).
- Tools installed or updated: none.
