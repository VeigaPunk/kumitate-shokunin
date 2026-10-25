# Round 61 — plan (frozen before any data seat scored)

Round: kumitate 61 (attempt 1). Base: `165b83044d33cbd52fc2209aefe57edfd7e6590a`
(the round-61 commit landing the inherited round-60 close work; round-60 tip
`a745a3b0`). Working dir: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

Frozen 2026-10-25 before any wave seat scored. These sentences are the claims;
the same words appear in the counters' code and in the receipts' labels.

## Axis state and stagnation nudge

Owned axes (SCORECARD `## Axes`): operability 9 (terminal integer of the frozen
`f_O` proxy), coverage retired at 10 (aggregate), coverage:script-layer 10
(88/88), coverage:runtime-layer 10 (92/92), coverage:kimi-layer 10 (53/53).
Every owned axis sits at or above the lane's saturation line, so the lowest-axis
obligation is **waived by the stagnation nudge** (AXES.md): this round is a
capability/frontier move. No score integer can move this round; every claim is
therefore a capability acquisition or a frontier move, disclosed as such.

## C1 — operability, capability acquisition `dispatch-evidence` (completes round-60's unprovable C1)

**Axis:** operability (capability acquisition). **Type:** capability.

**Frozen predicate `DISPATCH61_HELD`** (P61 v1, checks P1..P4):

- P1 — `node scripts/dispatch-evidence.mjs --selftest` prints
  `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` and exits 0.
- P2 — `node scripts/dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 61 --wave w1`
  prints `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` and exits 0, **and**
  the committed revision carries `.ufo/waves/round-61/w1/` with
  `launcher-progress.tsv`, `dispatch-actual.json` and ≥32 non-empty `<seat>.md`
  seat report files (`git ls-tree -r --name-only <rev> -- .ufo/waves/round-61/w1`).
- P3 — the SCORECARD capabilities table has a `dispatch-evidence` row whose
  evidence pointer names round 61 (first-working round 61).
- P4 — `.ufo/waves/round-61/close/dispatch61-tip.txt` exists at the measured
  revision and contains the same `CLEAN` line.

**Counting command** (what the closure re-runs):
`node .ufo/waves/round-61/probe/dispatch61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
**Kill rule:** any check MISS → the claim fails as declared. A rule changed
after any seat scored is not this claim's rule.

**Before (measured at base `165b8304`):** the round-60 equivalent read
`DISPATCH60_HELD` **unmet** — `held=8/10` at `a745a3b0` (A7 row-absent, A10
wave-dir-absent), and the gate itself reads `FAIL-CLOSED wave-dir-absent` for
`round-61/w1` (no wave dir at base). Receipts: `base/dispatch61-base.txt`.

**Control (committed before data):** a fabricated `dispatch-actual.json`
claiming `planned=32 sessions=32 exit0=32 reports=32` with no progress file and
no seat reports must NOT reach CLEAN — the gate must fail closed
(`FAIL-CLOSED progress-absent`, exit 2); a progress file whose seats carry no
session ids must read `NOT_A_DISPATCH`. Receipts: `controls/ctl-c1-*.txt`.

## C2 — coverage, frontier move: one assimilated entry on band 4 ground (sourced claim)

**Axis:** coverage (frontier; the retired aggregate and its successors stay at
their terminal integers). **Type:** frontier ground into core.

**Frozen predicate `DOCTRINE61_HELD`** (D61 v1, checks E1..E6):

- E1 — `corpus/knowledge/temporal-worker-versioning-pinning.md` exists at the
  measured revision.
- E2 — it opens with the provenance trio `source:`, `verified-at: 2026-10-25`,
  `recheck:`.
- E3 — its `source:` cites `S195`; row S195 exists in `corpus/SOURCES.md`,
  `status` is `mined`, `opened` is `2026-10-25`, and its `used-by` names exactly
  that entry.
- E4 — the opened-source capture exists at
  `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` and its sha256
  equals the pin the S195 row carries.
- E5 — `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  exits 0 at the measured revision.
- E6 — `corpus/README.md` carries the map row for the entry and
  `node scripts/readme-map.mjs` prints `README_MAP: CLEAN files=rows=covered`
  (the round-60 V8 spot-check file row and this entry land in the same change).

**Counting command:** `node .ufo/waves/round-61/probe/doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
**Kill rule:** any check MISS → fails as declared.

**Before (base `165b8304`):** registry 133 rows (A=110 B=15 C=8), no entry, no
S195, README map missing the round-60 spot-check row (`PROXY` already reads
`C2_TOTAL_DRIFT declared=145 computed=146`). Receipts: `base/census-before.txt`,
`base/proxy-before.txt`.

**Control:** an entry that cites an unopened/unmined row (or a fake row with no
capture) must fail E3/E4 — receipt `controls/ctl-c2-unopened-row.txt`.

**Sourced claim:** C2's evidence cites S195 (opened 2026-10-25 in-round).

## Assimilation

First adoption round under item 10 (round 60 hand-checked the quarantine slice
and adopted nothing). This round adopts exactly one entry from the package
(`merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md`),
re-grounded in-round: the only cited source (Temporal Worker Versioning docs,
`docs.temporal.io/worker-versioning.md`) is re-opened by this lane with a fresh
access date and ≤25-word located quote. Quarantine slice re-derived from the
absent-defect register; all slice rows stay quarantined unless hand-checked.

## Round shape

Default two-v1-wave shape, adjusted to evidence: **one v1 wave (32 seats)** —
build + first falsifiers. Wave 2 is dispatched only if wave 1 yields ≥32 distinct
attack items; expected residual: one ordinary `task` call of ≤8 reviewer/critic
seats. Round total ≤128. All seats leaf-only; no seat spawns. The dispatch
record for C1 is this wave's own record, produced through the validator's
`taskCall` (never a custom launcher).

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Seats never
touch the fleet repo, sibling lanes, lane jj state or lane git index, `.ufo/state/`,
`.scratch/`, templates/ or scripts/ in the fleet root. Reports at
`.ufo/waves/round-61/w1/<SeatName>.md` (absolute path given in each item).
