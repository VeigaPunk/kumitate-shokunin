# CritQ43 — round 51, wave 2

## Attack and axes

Attacked: the fix claim and evidence classification in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md:801–816` (Q43), especially whether its **Fails when** and **Shown able to fail** arms demonstrate enforcement of the new freeze discipline.

Axes: **operability** (`ATTEST_HELD` / A51: executable, discriminating counters) and **coverage** (`DOCTRINE_HELD` / D51: doctrine supported by the evidence actually exercised). No-harm constraints: frozen identity, truthful provenance, and no duplicate conformance authority. Independent reads/searches ran concurrently; no agents or additional runtime were launched.

## Findings

### F1 — Q43 is a process rule, not a mechanically demonstrated conformance check

**Answer:** the historical A51 failures have recorded execution evidence; the new Q43 failure rule does not. Q43's **Fails when** is a normative assertion. Its **Shown able to fail** cites failures of earlier counters, not an executed Q43 checker rejecting a freeze without its before-receipt or a freeze with an unexecuted declared control.

Evidence classification:

| Q43 material | What the local evidence actually establishes |
|---|---|
| A51 v1 could not parse | Recorded execution, not merely an assertion: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/CritC1.md:66–83` gives the exact base command, `SyntaxError: Unexpected token '**'`, and `exit=1`. This is a runtime failure of the old counter, not a Q43 conformance verdict. |
| CritC1 print-stub | Recorded arm-level execution: the same report, lines 119–141, explicitly distinguishes its A1–A4 in-memory diagnostic from a full counter score; distinct fabricated nonces yield `held=4,total=4`. |
| RevCounterA forger `held=5/5` | Recorded full historical A51 execution: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/RevCounterA.md:14–26` reports `ATTEST_HELD held=5/5`, exit 0, against forger revision `9cb611b7761fe04081ba9d90658f17a5b65f1ebc`. This falsifies the old discrimination claim, not the new receipt-membership rule. It is not a claim about current v3r6. |
| Two D51 index findings | Principally a structural incompatibility proof. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutClockSource.md:50–63` also records a Node row-expression observation (`fields=13`, old predicate `false`, repaired expression `true`), but does not supply an exact command/full transcript there. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutRandomSource.md:61–64` explicitly says that seat did not rerun either probe. Do not relabel these as two full-counter red/green executions. |
| Latest repaired A51 before-state | A real committed output artifact exists: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base/attest-base-v3r6.txt` records `ATTEST_UNMET held=0/9`, base revision `c90b9de94009b938fa19a089bfaa97df20b54f86`, `exit=1`. Git shows its addition in the same repair commit as the current counter change, `cbca45cc107a9b67d51e7375ea07003350d61648`. This supports this instance of manual freeze discipline; it does not enforce the discipline on the next freeze. |

**Strongest observed counterexample:** the original round-51 freeze commit `06ecbf4703fe9515ae51f36a903c58825c250ccc` and first A51 repair `1fd8ace` contain only `baseline-gates.txt` in the round-51 base directory, not an executed counter before-receipt. The first A51/D51 base receipts arrive in `3ed875d34914560d3e30ee3e80bec7fa9b9e8666`. This is a historical witness for Q43's stated missing-receipt condition, but none of the cited outputs is a machine-generated Q43 conformance failure. Do not confuse that historical witness with a claim that the latest repaired freeze is still missing its receipt.

**Mechanism search result:** no lane-local mechanical mechanism was found for “freeze commit lacks the before-receipt = conformance defect.” The bounded search of all shipped scripts and both current round-51 probes found no `Q43`, `attest-base`, `doctrine-base`, or `before-receipt` references. A broader freeze/receipt search found only the A51 header's historical before-state comment, not executable validation. Source inspection confirms:

- A51 derives its verdict from A1/A2/A2c/A3/A3c/A3d/A4/A4c/A5 and never checks before-receipt membership in a counter-freeze commit. Its final decision is solely the `checks` array at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs:359–362`.
- D51 checks D1–D5 (entry shape/bindings, rows, sources checker, live census), with no freeze-commit receipt-membership or declared-control-order arm: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs:57–124`.
- The lane-local round-close gate's documented/declared finding kinds include report/commit/scorecard/log/tree/push checks, not a freeze-receipt or declared-control finding: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs:66–98,183–188`.
- `counter-rerun` checks repeated execution and final-summary agreement, not historical freeze conformance: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-rerun.mjs:15,25–44`.

**Counterexample to automatic enforcement [INFERENCE; not executed]:** omission of a before-receipt that is not otherwise a scored binding target does not itself change any A51/D51 Boolean. Likewise, running a declared control after data rather than before is not an input either counter consumes. Therefore a numerical HELD reading is not evidence that Q43's process condition was checked. No modified lane, mutant, or new HELD reading is claimed here.

**Impacted axes:** both claim axes through evidence qualification; particularly coverage/quality of Q43's own repair claim. This is not a newly measured A51/D51 predicate failure or an H1–H5 regression.

**Smallest safe correction:** keep the manual discipline, but amend Q43's own Limit to state its actual authority boundary, and rename/reword the Shown arm as historical motivating counterexamples unless a Q43-specific rejection is exercised. Suggested minimum Limit text:

> This is an L1/non-author process rule. No lane-local executable currently checks that a counter's freeze commit contains its executed before-receipt, or that every declared control ran before data; A51/D51 and round-gate do not enforce those conditions. The cited failures demonstrate the motivating counter defects, not a self-test of this rule. A numerical HELD reading does not certify Q43 conformance. Static-arm forgeability remains a separate limit.

If a mechanical fix is claimed instead, it needs one explicitly named conformance mechanism and a recorded red/green control for missing before-receipt and missing declared-control evidence, binding the exact counter identity/base command. That would be a proposed future implementation, not an existing mechanism found by this review. No external canonical Rust judgment or enforcement was inspected or invoked, so this report does not assert its behavior.

### F2 — execution at an empty base does not exercise the D51 defect named as caught

**Counterexample:** both original and current D51 return immediately on an absent doctrine entry, before reaching D3. The committed D51 before-receipt says only:

```text
DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=D51 | D1 MISS entry-absent
exit=1
```

The early-return source is present in the original freeze itself (read-only Git blame output below). Consequently **[INFERENCE; not rerun]** executing original D51 at that empty base would not exercise its bad SOURCES indexes. It could produce the expected before-state even while its honest positive state was impossible. The executed-before rule catches A51's parse failure, but does not by itself catch the D51 unsatisfiability that Q43 lists among its “Classes caught.” The seats' row-level inspection is the evidence for that defect.

**Impacted axis:** coverage of the repair's claimed failure classes; operability confidence in an executed but unexercised predicate arm.

**Smallest safe correction:** explicitly say that base execution establishes executability/negative-state behavior, not positive-state satisfiability or arm coverage. If Q43 retains a claim to catch D51's incompatibility class mechanically, it needs a conforming positive fixture that reaches the affected arms; do not present the existing `entry-absent` receipt as that test. This is an evidence limit, not a reason to modify either frozen counter during this review.

## Commands and observed output

All filesystem arguments below are absolute. Relative paths in Git output are Git's own repository-relative names. Peer transcripts above are recorded evidence I read, not executions I performed again.

### C1 — exact criterion and receipts (read tool)

```text
read /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md:787-825
```

Observed lines 809–816:

```text
counter whose before-state receipt is absent from the freeze commit is a conformance
defect, not a predicate.
  - **Fails when.** A freeze commit lacks the executed before-receipt, or a declared
    control was never run.
  - **Shown able to fail.** The round-51 wave-1 seats: two independent findings for D51's
    index bug; CritC1's stub reading; RevCounterA's held=5/5 forger.
  - **Limit.** The rule binds the L1's freeze discipline; it does not make static arms
    unforgeable (see round-51 report, forgery boundary).
```

```text
read /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base/attest-base-v3r6.txt:1-45
```

Observed:

```text
run-at: 2026-10-24T02:25:50Z
ATTEST51: ATTEST_UNMET held=0/9 checks=9 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 version=v3 | A1 MISS scripts/receipt-attest.mjs absent | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A2c MISS tool absent | A3 MISS attest-run-2-replayed.txt absent | A3c MISS tool absent | A4 MISS tool or receipts dir absent | A4c MISS tool absent | A3d MISS tool absent | A5 MISS tool or SCORECARD absent
exit=1
```

### C2 — bounded executable-reference search (grep tool)

```json
{"pattern":"Q43|attest-base|doctrine-base|before-receipt","path":"/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts;/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe","case":false,"gitignore":false}
```

Observed output:

```text
No matches found
```

The broader search for `Q43|before[-_ ]?(state|receipt)|attest-base|doctrine-base|freeze.{0,100}receipt|receipt.{0,100}freeze` over the same paths returned only this source comment:

```text
attest51-probe.mjs:18: *       holds. Before-state re-measured at base with v3: instrument absent -> UNMET.
```

This negative search is not claimed to inspect an external judge, hooks outside the reviewed code, or fleet files.

### C3 — actual historical freeze trees and latest repair membership

Executed:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only 06ecbf4703fe9515ae51f36a903c58825c250ccc -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only 1fd8ace -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format='%H %s' --name-status cbca45c -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe
```

Exit 0, output:

```text
.ufo/waves/round-51/base/baseline-gates.txt
.ufo/waves/round-51/base/baseline-gates.txt
cbca45cc107a9b67d51e7375ea07003350d61648 round-51: freeze repair 6 — A3d digest-binding challenge (DistWave1 item 1); check set now 9, base 0/9

A	.ufo/waves/round-51/base/attest-base-v3r6.txt
M	.ufo/waves/round-51/probe/attest51-probe.mjs
```

Executed:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format='%H %s' --name-status 3ed875d -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -n 1 --format='%H %s' -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md
```

Exit 0, output:

```text
3ed875d34914560d3e30ee3e80bec7fa9b9e8666 round-51: freeze repair 2 — D51 SOURCES-row column indexes (status c[8], used-by c[11]) per two independent seat findings; no other semantics changed

A	.ufo/waves/round-51/base/attest-base.txt
A	.ufo/waves/round-51/base/doctrine-base.txt
M	.ufo/waves/round-51/probe/doctrine51-probe.mjs
a476977dd76ca4e1053ec787e9adbff242dc47d6 round-51: C1/C2 integration — receipt-attest instrument, GATE_PINS+pin family, stanza re-derivation (A=67 C=23 C2=117/117), S100/S101 rows, invocation-attestation entry, round-51 lesson+Q43, w1 evidence
```

### C4 — original D51 bypasses later arms at base

Executed:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin blame -L 57,62 06ecbf4703fe9515ae51f36a903c58825c250ccc -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs
```

Exit 0; these original-freeze lines were printed (Git attribution prefix omitted here; source bytes preserved):

```js
  const ep = join(T, ENTRY);
  if (!existsSync(ep)) {
    process.stdout.write(`DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=${rev} rule=${RULE} | D1 MISS entry-absent\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(1);
  }
```

## Review boundary

No lane code, counters, plan, corpus, or scorecard were edited. Only this report was created. No tests, builds, harm gates, or frozen counters were rerun; no new predicate reading or canonical disposition is asserted. The scheduled third attestation receipt is not a finding. No tool installs/updates; pacman untouched. No sibling/fleet files, state, or agent directories were touched.

Report: .ufo/waves/round-51/w2/CritQ43.md
