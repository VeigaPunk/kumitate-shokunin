# Round 61 — plan (frozen before any data seat scored)

Round: kumitate 61, attempt 1. Base revision \`c2721f812cebd97ab67a1dd8cd8492a193f82d42\`.
Frozen 2026-10-25 before wave data. The lane's axes are operability and coverage;
the stagnation nudge waives lowest-axis obligation because all owned axes are at
or above saturation. Claims are distinct axes, each with its own counter.

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

**Before (measured at base `c2721f81`):** the round-60 equivalent read
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

**Before (base `c2721f81`):** registry 133 rows (A=110 B=15 C=8), no entry, no
S195, README map missing the round-60 spot-check row (`PROXY` already reads
`C2_TOTAL_DRIFT declared=145 computed=146`). Receipts: `base/census-before.txt`,
`base/proxy-before.txt`.

**Control:** an entry that cites an unopened/unmined row (or a fake row with no
capture) must fail E3/E4 — receipt `controls/ctl-c2-unopened-row.txt`.

**Sourced claim:** C2's evidence cites S195 (opened 2026-10-25 in-round).

## Assimilation

This round opens one Temporal Worker Versioning source, adopts one entry on
durable-execution band-4 ground, and re-grounded evidence appears as S195. The
two round-60 standing rejects remain refused: exactly-once attribution has a
same-document collision (S134/S211); coordinator topology remains a separate
theme, to be re-opened only in a topology round. Quarantine slice is re-derived
from the absent-defect register; each row's verdict appears in the lesson.

## Round shape

One v1 wave, 32 seats, build + falsifiers; dispatched by the validated taskCall.
Wave 2 only if wave 1 yields at least 32 distinct attack items; any residual
review ≤8 seats in a normal task call. Round total ≤128. No seat spawns.

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. No seat
touches the fleet repo, sibling lanes, lane jj state/git index, `.ufo/state/`,
`.scratch/`, fleet templates/scripts, or campaign tree.
## Work Plan (frozen before data)

Base revision: \`c2721f812cebd97ab67a1dd8cd8492a193f82d42\`.

### C1 — operability, capability acquisition \`dispatch-evidence\`

Frozen predicate \`DISPATCH61_HELD\` (P61 v1): P1, \`dispatch-evidence --selftest\`
prints \`DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)\`, exit 0; P2 the real round-61
wave gate prints \`CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)\`, exit 0,
and the measured revision contains a progress file, dispatch-actual.json, and 32
seat reports; P3 SCORECARD capabilities row names round 61; P4 committed tip
receipt contains that same CLEAN line. Count command:
\`node .ufo/waves/round-61/probe/dispatch61-probe.mjs <lane> <rev>\`.
Any MISS fails as declared; no edits after seats score. Base: gate fails closed
at round-61/w1; the round-60 equivalent reads 8/10 at a745a3b0 (A7 and A10
missed). Control: fabricated registry without progress fails closed; 32 null
session records read NOT_A_DISPATCH. Receipts under base/ and controls/.

### C2 — coverage, frontier move: one sourced band-4 entry

Frozen predicate \`DOCTRINE61_HELD\` (D61 v1): E1 entry exists; E2 source,
verified-at and recheck header trio; E3 S195 is mined/opened 2026-10-25/used-by
exactly the entry; E4 in-round source capture hash matches the S195 row; E5
sources-census validates; E6 README-map row and readme-map CLEAN. Count command:
\`node .ufo/waves/round-61/probe/doctrine61-probe.mjs <lane> <rev>\`; any MISS
fails as declared. Base: 133 rows, A=110 B=15 C=8; no S195 or entry; readme-map
missing R60 verifier row. Control: no captured bytes means E4 MISS. Receipt
under base/ and controls/.

### Frontier and assimilation

One source: Temporal Worker Versioning docs. One entry adopted from
\`merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md\`,
re-grounded with this round's access date and located quote. S195 is the sourced
claim. Re-derive the quarantine slice; record a verdict for each row. Round-60
standing rejects stay refused unless their flip condition is met.

### Shape

One v1 wave of 32, build + falsifiers, dispatched from the validator's taskCall.
Wave 2 only on ≥32 distinct attack items; residual review ≤8 seats. No spawns.
