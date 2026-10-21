FIDELITY-OVERLAP samples=50 risky=48

# ConnectorFidelityOverlap — can the fidelity repair contradict a note's own prose?

Axes: **operability (C1)** — repair must not move correct anchors or buy CLEAN with
diagnostics; **coverage (C2)** — the 9 new R5/R7 sections inherit whichever anchor form the brief sets.
Read-only seat: no write except this report; no scratch dir; no installs. Source read only from `/fast/scratch/kumitate-r36/src` @ `31c465f1` (chmod a-w, untouched).

## Reproduction (before trusting any number)

- `node --input-type=module -` importing `probeSections({self:<lane>,src:/fast/scratch/kumitate-r36/src})`
  → `ok=true sections=175 totals={rows:19,yes:19,notes:27,sections:175,errors:0,warnings:6}`.
- Python reimplementation of the frozen FIDELITY v1 span/pair/classify rules over those sections
  reproduces the prototype exactly: `anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429
  nonok=588`, and every per-note line in `baseline/fidelity-prototype-v1.txt` (ops-watchers 189,
  remaining-scripts-census 177, sighting-wall 35, native-trial-launch 35, route-probe-cluster 31, …).
- Sample: the 5 highest-nonok notes, 10 non-ok anchors each, evenly spaced by note line →
  **50 samples, 48 risky**. Shapes counted on the sample, then weighted on all 588.
- Mechanism (measured span gaps): notes write `` `sym` (`:N`), `sym2` `` with 2–3 chars between
  anchor and next backtick, so the frozen right-first ADJ=14 pairing takes **the next symbol**.

## S1 — pairing contradiction (anchor is correct; the gate pairs the next symbol)

127/588 non-ok (21.6%) have the *left* span — the sentence subject — verbatim on the cited
line; they read elsewhere/absent only because right-first pairing grabbed the following span.
Per note: remaining-scripts-census 101/177, sighting-wall 12/35, route-probe-cluster 6/31,
native-trial-launch 4/35, runtime-support 2/14, ops-watchers 1/189, loop-driver 1/11.

- `corpus/knowledge/native-trial-launch.md:384` — `` `GODSPEED_MARKER` (`:120`) ``; pinned
  `scripts/collect-omp-native-handoff-lib/base.mjs:120` IS `export const GODSPEED_MARKER = "| godspeed";`.
  Gate pairs `EVIDENCE_KIND` (`base.mjs:133`), gap 3. **Repair would move a correct citation.**
- `corpus/knowledge/remaining-scripts-census.md:607` — `` `scripts/sync-global-routing.mjs:14-16` ``
  is the no-CLI evidence (`sync-global-routing.mjs:14` = "This module deliberately has no CLI…");
  gate pairs `MIRROR_PATH` (gap 3), defined `sync-global-routing.mjs:41`.
- `corpus/knowledge/remaining-scripts-census.md:534` — `` (`:47`) `` pairs `SIDECAR`
  (`fleet-ledger-rotate.test.mjs:48`); line 47 is `const BASE = "fleet-ledger.jsonl";`, the subject.
- `corpus/knowledge/ops-watchers.md:236` — `` `WHIP_DRIFT_UNREADABLE` (`:248`) `` pairs
  `driftWhipText(kind)` from the next clause (`:255`); nearest `driftWhipText` is `ufo-l0-watch.mjs:304`.

## S2 — "nearest occurrence" lands inside a different function/item

316/492 elsewhere anchors: nearest occurrence is in a different top-level item than the cited
line (278/492 span ≥2 items; 145/492 are >49 lines away). A line-only repair changes *which code
the sentence describes*.

- `corpus/knowledge/sighting-wall.md:117` — `scripts/ufo-sighting.mjs:3584` sits in
  `function peekMission` (`fail("MISSION_NOT_LIVE", …)`); nearest `resumeMissionLocked` is
  `ufo-sighting.mjs:3714` in `function resumeMissionLocked` (d=130).
- `corpus/knowledge/native-trial-launch.md:357` — `` `:171` `` pairs `resolveNativeDispatchPolicy`;
  nearest `run-omp-native-trial.mjs:639` (d=468, 6 distinct items) vs prose
  `snapshotDispatchInputs (:171) → resolve… (:646)`.
- `corpus/knowledge/ops-watchers.md:287` — `` `:613` `` pairs `"handoffs"`; nearest
  `ufo-l0-watch.mjs:536` is in `function parseCli`, cited 613 in `async function main()`.
- `corpus/knowledge/remaining-scripts-census.md:651` — 12 anchors in one shifted enumeration, 4
  nonok: `:35` pairs the next claim's `validateTaskReceipt` (true `:18`), `:1465` pairs
  `row = (state) => ({ state })` (true `:59`), `:59` pairs `scratchMonitorJson` (true `:1275`).
  The same sentence asserts "re-anchored at 31c465f1 (round 35)" — the prose claim is false exactly
  where mechanical repair would cite a neighbour's symbol 1200+ lines away and read `ok`.

## S3 — comment landings read `ok`

50/492 elsewhere anchors have their nearest occurrence inside a comment; the gate is a
substring test, so moving the anchor there yields `ok` while proving nothing about code.

- `corpus/knowledge/failure-telemetry.md:69` — `` | `loadSwarmPolicy` | `scripts/ufo-mission-result.mjs:2431` | ``;
  the file has `loadSwarmPolicy` only at `ufo-mission-result.mjs:2452` (comment: "These three lived
  in ufo-swarm-wave.mjs (loadSwarmPolicy)") and `:2478` (`export function loadSwarmPolicy`).
  Nearest-occurrence repair lands on the comment, gate-green, claim false.
- `corpus/knowledge/ops-watchers.md:242` — `` (`:1634`) `` pairs `process.exit(0)`; occurrences
  `ufo-l0-watch.mjs:2181` (`// writeSync(1), not process.stdout.write: the process.exit(0)`) and
  `:2193`; cited 1634 is `try {` inside `export function missionDuty`.

## S4 — collapse: two distinct claims become one duplicated citation

26 groups in the 5 notes where two anchors of one paired symbol share a nearest line; repair
erases a "here *and* here / defined here, used there" claim while both anchors read `ok`.

- `corpus/knowledge/native-trial-launch.md:354` — `:59` and `:109` both pair `PROPOSAL_WAVE_CEILING`
  → nearest `:115` for both; `:357` `:171`+`:646` both → `:639`.
- `corpus/knowledge/ops-watchers.md:236` — `driftWhipText(kind)` at `:248` and `:255` both → `:304`.

## S5 — anchors whose "symbol" is a fragment or concept (absent, 96)

58/96 absent symbols are code fragments or phrases the pairing rule manufactured; they cannot
be re-pointed — the sentence must be rewritten, and a line edit would be a lie.

- `corpus/knowledge/ops-watchers.md:32` — `` `:132` `` pairs `for (;;) { tick(); spinWait(POLL_MS); }`.
- `corpus/knowledge/route-probe-cluster.md:100` — `scripts/probe-ufo-route-health.mjs:2-3` pairs
  `Authorization`, absent from all 1189 lines; lines 2-3 are credential-authority comments — the
  claim is conceptual ("constructs an HTTP Authorization header").
- 38/96 are real identifiers (`ROUTE_TOKEN`, `ufo_cli_runner_missing`) — genuine rename/removal.

## S6 — the real prose→line dependency is invisible to FIDELITY

No sampled sentence restates a backticked anchor's number in prose (0 real hits; the 3 digit
candidates within ±2 lines were counts / "round 35" mentions, not anchor numbers). The dependency lives in
**non-backticked** `(:N)` / `(file:N)` parentheticals, which FIDELITY never sees: 370 in the 17
scanned notes (310 bare, 60 path); `local-ship.md` alone has 41.

- `corpus/knowledge/local-ship.md:12` — "`validate_bounds` (:1640)"; pinned
  `crates/ufo-core-runtime/src/local_ship.rs:1645` is `validate_bounds(`. 21/41 plain anchors there
  are not-ok with a consistent +5..+7 drift (`:1642`→1647, `:1672`→1677, `:1696`→1701, `:1729`→1736).
  `(:1639-1848)` reads ok only because the range is wide enough to contain the symbol.
- After repair one sentence can carry two registers: a moved backticked anchor at the true line
  and a stale plain `(:N)` a few numbers over — a contradiction introduced *by* the repair.
- C2 already uses the invisible form: `native-admission-detail.md:28` `` `native_admission_rules.rs:45-131` ``
  has no adjacent symbol (→ `noid`, diagnostic), so new sections can be CLEAN and unverified.

## S7 — diagnostics are not proof

`noid=429` + `dead=173` (39%) are outside the gate's claim by contract. De-pairing a hard anchor
(reposition/delete the symbol span) turns `nonok`→`noid` and yields CLEAN with zero semantic
check; only the free-text C1(f) checklist item could impose a floor.

## Proposed move (one, bounded — no contract/axis change)

Adopt a **pairing-safe anchor form** in the executor brief and in all 9 new C2 sections: subject
symbol immediately before the anchor, and the anchor is the **last backticked span on its line**
(or ≥15 non-backtick characters follow it); table rows `` | `sym` | `path:N-M` | `` qualify;
never write `` `sym` (`:N`), `sym2` `` chains. Repair by the **left** subject: for the 127 S1
anchors the repair is purely syntactic (no line moves). For the 461 true-move anchors, move only
to an occurrence in the same enclosing item as the cited line, reject comment occurrences (S3),
refuse collapses (S4); fragments (S5) are prose rewrites, not anchors.

Why non-obvious: the wave plans to burn `nonok` down by re-pointing numbers, but 21.6% of `nonok`
is a *pairing* artifact of the frozen rule — those anchors are already true. Fixing the form
removes them with zero content risk and protects the 92/92 C2 sections from the same debt.
Axes: operability (C1 nonok, no mis-repair) and coverage (C2 sections pass symbol-on-line without
line churn). Substrate/runtime: none — notes only, no gate edit, `## ` parsing untouched.

## Risks

- If executors trust the gate's paired symbol, 127 correct anchors move and 26 collapse groups
  duplicate citations; both invisible to a green gate.
- `nonok=0` is reachable by de-pairing (S7); without a `noid` floor the C1 after-target can be
  satisfied without any claim checked. L1's call whether C1(f) asserts `FIDELITY_TOTAL` noid not
  above its pre-repair value (C2 sections legitimately add anchors).
- 370 gate-invisible plain anchors (S6) stay stale under any C1 outcome; `CLEAN` does not mean the
  C2 notes are anchored — local-ship.md's call-order block is stale today.
- Anchor-last reordering lengthens dense paragraphs; registry/cite gates key on headings and
  liveness, not prose layout.

## Verification

- Post-repair rerun at the pin: `nonok` drops by ≥127 with `dead=173` unchanged and those anchors
  classified `ok` (not `noid`); then true moves reach `nonok=0`.
- Grep new sections for the unsafe adjacency: backticked anchor + ≤14 chars + another backtick.
- Every moved anchor: target line not a comment, same enclosing item as the cited line, and no two
  anchors of one symbol share a line.
