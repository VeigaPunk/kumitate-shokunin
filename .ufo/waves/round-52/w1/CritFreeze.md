# CritFreeze — independent freeze audit

## Axes and scope

Axes: frozen-byte integrity; baseline replay reproducibility; snapshot provenance/hermeticity; predicate identity. Review only: no lane source, plan, counter, index, jj state, or sibling artifact changed. All evidence writes are under `build/CritFreeze/` and this report. No tools installed or updated.

Freeze commit: `f539a71e236a4d66810851c1f2fb6e1abe61ec19`. Round-open baseline named by the plan and committed receipts: `02c01258464cac3804faf177d0cfbf113cd59706`. These are different measurement targets.

## Exact SHA-256 receipts

The first three hashes were independently computed over both working-tree bytes and `git show f539a71e:<path>` bytes; they agree.

| Frozen path under `.ufo/waves/round-52/` | SHA-256 |
|---|---|
| `plan.md` | `563d086bf1f59c60bb556501c0676597ec0df551eb03df57caacf1455c336565` |
| `probe/attest52-probe.mjs` | `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428` |
| `probe/doctrine52-probe.mjs` | `e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169` |
| `base/attest52-base.txt` (675 bytes, committed freeze blob) | `57355f3d6a1cc669e39993513e4fd9433a2a8c9d9c6cd9363d0fb468f1b0167d` |
| `base/doctrine52-base.txt` (124 bytes, committed freeze blob) | `4c7f1363791498e450608cef3ce7c1fc0273b08d02db84aa23081c5f6367a6f9` |

## Executed replay evidence

Executed copies obtained from the freeze commit, not subsequently edited probe bytes. `TMPDIR` pointed inside this seat's allowed build directory. Compared captured stdout bytes directly against the committed freeze's base-receipt blobs; all runs below exited 1 with empty stderr.

| Target argument | A52 | D52 | Byte-for-byte against committed base receipts |
|---|---|---|---|
| `f539a71e` (literal assigned short revision) | UNMET 5/13 | UNMET 0/5 | neither equal |
| full freeze SHA | UNMET 5/13 | UNMET 0/5 | neither equal |
| full round-open baseline SHA | UNMET 5/13 | UNMET 0/5 | both exactly equal |
| full baseline SHA, isolated minimal lane | UNMET 5/13 | UNMET 0/5 | both exactly equal |

Literal `f539a71e` stdout hashes: A52 `8d02b2c2596feca4b562cdc5f88cdc214688d7092a397e57467dc63f4da0654b` (643 bytes); D52 `2dc0bccd1f5c1408cc3a3c402cb085fdcae3aa84414d2b18fc1cf090995c2e4d` (92 bytes).

Full-freeze stdout hashes: A52 `7e13811d8b100a8c143370c499866011fb86a30d0ff8c62dd42a5335eb6a4d8d`; D52 `edf698e0580f3b56f1f5a238098280937e3602a17e81ac15fb356918afd2796e`.

Machine-readable details and raw stdout: `build/CritFreeze/{rerun-comparison.json,freeze-short-comparison.json,minimal-lane-comparison.json,*-stdout.txt}`.

## Findings

### F1 — MEDIUM: promised exact predicate sentences are absent from both probe headers

**Counterexample:** literal membership tests of each frozen plan predicate against its corresponding frozen probe header, and against the entire probe, are false.

**Evidence:** plan lines 51–53 explicitly require the C1 predicate to be byte-identical in the probe header. Plan lines 53 and 59 contain the full predicate sentences. A52 header lines 76–81 instead say `Predicate ATTEST52_HELD = held=13/13, exit 0`; D52 header lines 30–32 say `Predicate DOCTRINE52_HELD = held=5/5, exit 0`. Neither contains the frozen sentence. Exact extracted strings and membership results are in `build/CritFreeze/predicate-comparison.json`.

**Impacted axes:** predicate identity, freeze provenance. This is a fixable textual freeze defect, not evidence that either observed score changed.

**Smallest safe correction:** copy the exact plan sentence into each header without changing scoring logic. Record a numbered freeze-repair addendum and regenerate both base receipts as plan lines 150–153 require. Do not silently edit a frozen counter.

### F2 — LOW: assigned freeze-target comparison does not reproduce the committed base receipts

**Counterexample:** both literal `f539a71e` and its full SHA produce different stdout from the committed base receipts. First differing byte offsets, zero-based: A52 49; D52 51. The revision field differs in both. A52 also changes the B5 diagnostic from `C2_TOTAL_DRIFT term=C2_total declared=117 ...` to `A_DRIFT term=A declared=71 computed=73 ...`.

**Evidence:** raw stdout and byte comparisons above. The read-only base-to-freeze name diff contains exactly the plan, two `.mjs` probes, and three base transcripts. Proxy documentation lines 93–95 count `.mjs` files anywhere in the extracted tree, explaining the additional two A members. Scores and exits do not change.

**Impacted axes:** receipt/target identity and strict replay reproducibility.

**Smallest safe correction:** distinguish the freeze commit carrying the artifacts from the round-open revision actually measured. Preserve the authentic round-open receipts; if freeze-revision receipts are required, add separately named receipts rather than relabel the old ones. This is a finding under the assignment's any-byte-deviation rule, not a demonstrated nondeterministic baseline failure: rerunning the receipts' actual baseline target matches both exactly.

### F3 — MEDIUM conditional provenance limitation: D52's eventual E5 reads live lane bytes

**Evidence:** D52 lines 118–120 invoke the live fleet `scripts/sources-census.sh` with fixed root `/home/vgpnk/Projects/shokunin` and lane `kumitate`, not the extracted target tree or `laneArg`. The census resolves live lane `corpus/SOURCES.md` (census lines 467–468 and 513–523). Thus the header's blanket “committed bytes of <rev>, never the working tree” description is not true of E5. The plan explicitly calls E5 a live census (line 135), so this is also an intentional design tradeoff, not an undisclosed base prerequisite.

**Counterexample boundary:** base and freeze runs exit at D52 lines 66–69 because the entry is absent, before E5. No changed-live-lane E5 experiment was performed. [INFERENCE] Once an entry exists, the same archived target can gain or lose E5 when live lane census inputs change, without its commit changing.

**Impacted axes:** snapshot provenance, later replay reproducibility. Under a strict no-post-freeze-bytes interpretation this is a counter defect; it does not invalidate the observed base replay. A52 B5 likewise explicitly uses live external proxy substrates, so neither counter should be advertised as globally hermetic.

**Smallest safe correction:** if revision-only scoring is required, perform a versioned freeze repair making the census validate the extracted tree with a pinned validator, retaining the live census as separately labelled harm evidence. Keeping the frozen plan's live term instead requires acknowledging that provenance tradeoff; this review does not change the contract or make an admission decision.

## Strongest base-dependency test

Constructed `build/CritFreeze/minimal-lane/` containing only the frozen `round-52/{plan.md,probe/,base/}` files plus a temporary `.git` pointer to the existing read-only object database. Ran both probes with this minimal directory as `<lane>` at the full round-open baseline SHA. Both stdout streams exactly matched the committed base receipts, including all B5 detail. The original baseline tree contains no round-52 paths (`git ls-tree` returned none).

This demonstrates no post-freeze working-lane file outside the permitted frozen subtree is required to execute either counter at base. Historical target files still come from Git objects; A52 retains its documented external live proxy dependencies. D52's early exit means this test does not establish E5 hermeticity. The temporary `.git` pointer was removed after the experiment to avoid leaving a nested-repository artifact; all counter evidence remains in the aux directory.

No semantic freeze-byte drift or baseline stdout-reproducibility defect was observed. The exact-header defect and the specified freeze-target byte deviations remain as above.
