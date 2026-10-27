# Round 66 cross-claim/tool scan

Axes in the frozen plan: **operability** (C1; lowest non-retired axis) and the **coverage frontier** (C2). No score integer can move and neither axis may be harmed (plan.md:7-13).

## 1. Causal separability

**C1 can pass with C2 absent.** In the L66 counter, L1-L5 operate on the routed-ledger script, spot-checks and `corpus/routed-ledger.md`; L6 checks only the `SKILL.md` table, `corpus/QUALITY.md`, and `SCORECARD.md` capability row for `routed-ledger` (ledger66-probe.mjs:116-179, 276-290; plan.md:31-49). Nothing in these predicates requires the C2 registry entry, its SOURCES rows/captures, or the PROVINCE frontier line. Thus a valid C1 ledger/tool plus its three registry-home entries can meet L66 while C2 files are absent. C1's genuine dependency is the shared **`readme-map` invariant**: round 65's D7 report says the spot-check landed without a README row and that the round-66 opener adds row and pin (round-65-verifier-spotcheck.md:69-77); the freeze commit itself records `corpus/README.md` +1 and readme-map pin change (freeze `621212bac37f8249c72ac982d1d6534cb8d60701`, `git show --stat`). This is preparatory map maintenance, not C1's probe predicate.

**C2 can pass with C1 absent.** M1-M7 require the deprecation entry, its SOURCES rows/captures/quotes, and an installed-release section; M8 runs census, `sources-check`, `source-capture`, **`readme-map`**, and checks PROVINCE (deprec66-probe.mjs:74-230; plan.md:75-85). Neither the routed-ledger file nor its script is read. C2 therefore can meet M66 without C1's ledger/tool and L6 registry rows, provided the corpus README/pin map is correct. This is a shared gate/check, not a shared artifact dependency: `readme-map` checks only `corpus/knowledge` and `corpus/lessons` filenames against README rows and `.ufo/pins/readme-map.json` (scripts/readme-map.mjs:83-86, 132-178, 181-240). It does not scan root `corpus/routed-ledger.md`.

**Shared surface to call out:** M8's `readme-map` and C1's D7-triggered README/pin maintenance are causally coupled at the general corpus map level, but not because the new root-level ledger is included in that map. The C2 entry is under `corpus/knowledge/`, so it must receive its own README row and pin for M8. The README-map predicate is the single shared gate; one claim can pass without the other claim's substantive work, but the shared mapping changes must be correct for C2. Do not treat a C1 ledger README row as required by current readme-map: its namespace explicitly covers only `knowledge|lessons`.

## 2. Routed-ledger overlap with existing tools

No direct duplicate found among the named tools; the overlap is adjacent evidence, not equivalent behavior.

- `report-receipt-diff.mjs` validates report claims against committed wave receipts (tallies, cited receipt paths/hashes, report shape; header lines 3-37). It does not parse routed spot-check sections, bind each item to an answer, or aggregate defect classes.
- `wave-census.mjs` counts dispatch payload seats/roles and report presence (header lines 3-43), not routed findings or closures.
- `harm-matrix.mjs` runs registered gates at base/tip and classifies transitions (header lines 9-35); it can later measure routed-ledger gate regressions but does not store routed items/answers.
- `plan-before-ready.sh` enforces plan-before-marker and a readme-map check at plan revision (lines 10-46); no defect ledger semantics.
- `inline-dispatch-evidence.mjs` binds dispatch to host transcripts/logs/reports (lines 12-33); no cross-round defect tracking.

The routed-ledger's distinct work is parsing each verifier spot-check's routed section, requiring a quote-bound row for every item and quote-bound located answer for closed rows, and exposing recurrence classes (scripts/routed-ledger.mjs:11-46, 150-247). It complements, rather than replaces, the named gates.

## 3. Gate consumers (one bounded recommendation)

**Best existing consumer: `harm-matrix` registry (`scripts/harm-matrix-gates.json`).** Register `routed-ledger` as a normal gate with `needs: scripts/routed-ledger.mjs` and an argv that invokes the tool against the judged revision (`--root`/`--rev` or equivalent supported invocation). This gives existing base→tip harm accounting for the new gate: clean→red becomes HARM, and red→clean is REPAIRED, instead of leaving the tool as an unmeasured capability. The C1 plan already says `harm-matrix` is missing its round-65 row and carries that D2 debt (plan.md:98-102); integrating this gate consumer should not be confused with silently fixing that unrelated registry row. Have the L1 integration owner check exact argv/registry schema before adding it.

Do **not** wire it into `readme-map`: that gate only covers knowledge/lessons files and the root-level ledger is outside its contract. `plan-before-ready`'s existing readme-map arm is the right consumer for the knowledge entry's README/pin consistency, not for ledger semantics. Keep claim counters independent: the C1 counter should prove the routed-ledger contract, while `harm-matrix` supplies regression accounting at later base/tip comparisons.

## Evidence commands

- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --stat 621212bac37f8249c72ac982d1d6534cb8d60701` → freeze commit summary includes `corpus/README.md | 1 +` and `.ufo/pins/readme-map.json | 3 +-`, plus `scripts/routed-ledger.mjs`.
- `read` of frozen plan lines 7-13, 21-49, 63-89, 91-102; counters L66 lines 116-179, 276-290 and M66 lines 74-230; cited tool headers/implementations above.
- `scripts/readme-map.mjs` lines 83-86 and 132-178 show exact covered namespaces and row parsing; this supports the distinction between root `corpus/routed-ledger.md` and `corpus/knowledge/mcp-deprecation-registry.md`.
