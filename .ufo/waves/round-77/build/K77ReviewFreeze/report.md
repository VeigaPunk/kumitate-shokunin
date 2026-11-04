# K77ReviewFreeze — pre-data freeze review

Reviewed revision: `4dc470a131e10900fdd456b6b68d7ba27151d9d2`; base: `a321ed8006083be1086a3b991a78d3b4c26f0be9`. Axes: **coverage:omp + operability**. This is a recommendation, not approval or admission. No plan, counter, implementation, index, or lane state was edited.

All line references below are to those frozen bytes. `probe` means `.ufo/waves/round-77/probe/probe77.mjs`; `plan` means the adjacent `plan.md`.

## Findings — verdict blockers first

### FREEZE-FIX 1 — blocking: C2's target is unreachable

`probe:387` registers `c2.11-placement-and-map`, but the registry at `probe:429` names `c2.11-live-adoption-and-placement`. The loop at `probe:431` skips the actual check; the reporting loop emits `FAIL not run`. Consequently no implementation can attain the frozen `11/11` target (`plan:117-128`). The base and printer receipts already expose this exact defect at their line 15; my independent executions reproduce it.

Required change: an explicitly recorded instrument repair aligning the registry with the existing check name, followed by controls scored with the repaired, pinned instrument. Do not lower the denominator or report the unchanged counter as HELD. The frozen original and failed receipts must remain available.

### FREEZE-FIX 2 — blocking: the explicit C1 constant-printer kill rule fires

`plan:67` kills the claim on “a constant printer meeting 5 or 6.” A constant JSON printer, with no root or receipt I/O, passes **both** `c1.5` and `c1.6`. My attack also passes `c1.1`, `c1.2`, and `c1.10`, producing `C77_C1: UNMET held=5/10`. The whole target is not forged, but the separately frozen kill rule is satisfied. This is not an approval merely because check 7 kills the full attack.

Evidence: `printer-c1.txt`, `attack-proxy-check.mjs.txt`, `attack-omp-census.mjs.txt`, `attack-shape.json`. The receipt is independently reconstructed from the open TSV without using the claimed writer; the proxy always prints the same six terms. `probe:148-176` only checks fixed positive values and equality between two calls to the same printer.

Required disposition: record this kill-rule hit as an honest stop under the unchanged declaration. Any successor instrument must make the positive/equality surface vary with independently changed root and receipt inputs. Do not silently reinterpret the rule as requiring the printer to pass the entire set.

### FREEZE-FIX 3 — high: the writer check does not check a write

`plan:31-33,56` requires an actual staged receipt write and exactly one output line. `probe:102-110` uses `find` among output lines, makes `path=` optional, and compares the printed hash only with the already committed receipt. It never checks that `live-snapshot.json` exists or hashes its bytes. My census printer writes nothing and nevertheless passes `c1.1`. `c1.3` catches this particular printer at roundtrip, but cannot establish the missing live-write contract or atomicity.

Required change: check one exact line including the required path, hash the produced live file, compare that file with the pinned receipt, and exercise unreadable-root/usage behavior and non-partial writes. Preserve the specified entry-count/hash requirements rather than substituting output text for file evidence.

### FREEZE-FIX 4 — high: C1 fail-closed, provenance, and pin contracts are incompletely measured

The contract at `plan:36-44` promises distinct census invalid/not-found diagnostics, distinct proxy invalid/not-found diagnostics, source provenance in both JSON and printed output, mutual exclusion of root/shape flags, and real gate-pin verification. The counter checks census invalid/missing/bad-kind and proxy **absent only**, and `probe:211` accepts either proxy diagnostic for absence. It never calls a non-JSON shape proxy, malformed shape proxy, both mutually exclusive flags, or an input with an added content key. Thus the explicit malformed-MATCH/content-key kills at `plan:68-70` lack executable discriminators.

Also `probe:231` searches for `pin.omp-shape` anywhere in SCORECARD, not within the named block. It checks declaration equality, not enforcement. `compareGatePins` is the canonical enforcement logic (`scripts/proxy-check.mjs:1225-1240`), but the counter does not mutate the receipt/pin and observe that logic reject the mismatch. `validSnapshot` (`probe:52-56`) does not enforce top-level exact keys, sorted names, nonempty entries, or mode range; no added-content input is sent to either implementation.

Required change: executable negative arms for these already declared obligations, including distinct proxy tokens, printed `source=snapshot`, content-key refusal through both tools, flag exclusivity, block-local pin parsing, and a tamper that reaches `compareGatePins`. Counted selftest output alone is not evidence that these particular assertions run.

### FREEZE-FIX 5 — high: C2 checks weaken recovery and placement contracts

`plan:93-103` requires recovery on check/adopt/predict, verified preimage hashes, exact target-bearing recovery lines, and row insertion immediately after the last lesson row. `probe:290-292,307-309,352-353` only inspect a suffix/substring of the first recovery line; they do not verify its target, uniqueness, or requested-arm continuation. Recovery is only exercised through `--check`, never `--predict` or recovery before `--adopt`. No corrupted preimage/hash case exists. `probe:264-267` searches for the seam token anywhere, not header documentation.

The placement fixture (`probe:251-253`) has no existing lesson row. The assertion (`probe:393-397`) only requires the new row to precede Known gaps; it can accept insertion before the coverage table or anywhere earlier. The lane-map assertion (`probe:400`) accepts arbitrary equal counts rather than the declared `184/184/184` at `plan:128`. The fixture also does not check the map oracle after fixture adoption.

Required change: exercise recovery on every declared arm, exact single recovery lines and requested-arm completion, corrupted-preimage refusal before destination mutation, header seam documentation, a table fixture containing existing lesson rows, exact adjacency/table placement plus oracle cleanliness, and the specified lane counts. These are existing obligations, not new claim scope.

### FREEZE-FIX 6 — medium: complete pre-data provenance cannot be established from the freeze

The committed probe hash is `95316919bb5f54a6dd9b01b9b3be74b3c93b08b8add424b2e106e36b3b6ccb9b`, identical to both committed base receipt headers. Independent runs reproduce C1 `0/10`, C2 `2/11`, and the recovery printer `0/11`. There is **no** r76-style base-count discrepancy here.

However, plan `7-9,155-156,185` asserts a pre-data committed freeze and GREEN readiness. The live lane had `open/plan-before-ready-freeze.txt`, but that path is absent in the requested frozen clone and absent from the scaffolding change list. Its later presence cannot be treated as committed pre-data evidence. The plan's `open/c1-usage-base.txt` citation at line 48 is also wrong: the actual committed file is `controls/c1-usage-base.txt`.

Required change: retain and disclose the distinction between committed freeze evidence and later readiness evidence, attach a revision/timing-grounded readiness receipt, and record the bad citation as an erratum without modifying the original frozen plan. Do not claim dispatch chronology was proved by this review.

## Executed controls and failed attacks

All commands used the **unchanged frozen probe** at the revision/hash above; exact absolute command lines, stdout, and exit statuses are in the named sibling receipts. Commands were executed concurrently with TMPDIR inside my scratch root:

```text
node <scratch>/lane/.ufo/waves/round-77/probe/probe77.mjs --set c1 --lane <scratch>/base --work <scratch>/work-base-c1
node <scratch>/lane/.ufo/waves/round-77/probe/probe77.mjs --set c2 --lane <scratch>/base --work <scratch>/work-base-c2
node <scratch>/lane/.ufo/waves/round-77/probe/probe77.mjs --set c1 --lane <scratch>/attack --work <scratch>/work-printer-c1
node <scratch>/lane/.ufo/waves/round-77/probe/probe77.mjs --set c2 --lane <scratch>/attack --work <scratch>/work-printer-c2
```

Here `<scratch>` is `/fast/scratch/hyaku/kumitate-r77/K77ReviewFreeze`. Base files came from `git archive a321ed8006083be1086a3b991a78d3b4c26f0be9`; the independent open TSV supplied the attack receipt entries, not an implementation snapshot.

- `base-c1.txt`: `C77_C1: UNMET held=0/10`, exit 1.
- `base-c2.txt`: `C77_C2: UNMET held=2/11`, exit 1; only checks 7 and 10 pass.
- `printer-c1.txt`: `C77_C1: UNMET held=5/10`, exit 1. Whole-target forgery failed at checks 3, 4, 7, 8, 9; positive terms/equality and nonwriting snapshot assertion were fooled. Explicit kill rule triggered.
- `printer-c2.txt`: `C77_C2: UNMET held=0/11`, exit 1. Check 7 rejects the unconditional RECOVERED printer; crash checks reject the absence of SIGKILL/journal. Check 11 is not run at all, not a successful placement discriminator.

The initial full archive extraction stopped on a historical absolute symlink; subsequent extraction selected only required base scripts/corpus/pins/top-level inputs. No fixture commit was made. All scratch is removed after receipts/report publication.

## Separability, arithmetic, and residual risk

C1 examines only the six O terms and O findings (`probe:155-175`), not global MATCH or C2/C2_total drift. C2 uses its adopter/readme-map fixture and the lane map (`probe:244-254,398-400`), not O terms. Both read lane files/SCORECARD indirectly, but neither counter requires the other's landing. The scaffolding map repair already exists; it is not evidence of v2 placement. Reachability still fails independently because of FREEZE-FIX 1.

Axis names match SCORECARD `349-358`. C1's `10→10` agrees with the recorded six O terms in `open/proxy-open.json:41-46`; C2's `9→9` agrees with `terms.operability=9` at line 28. The operability terminal-integer explanation is mathematically honest for finite A+C (`SCORECARD:22,353`). The retired aggregate coverage is distinct from the live coverage:omp row (`SCORECARD:1636-1669`); neither claim should count an aggregate integer increase. The receipt's four offline fail-closed arms are a capability count, not four new axis points.

Semantic-tool gap: attempted `xd://lsp` discovery returned “No such tool”; no LSP status/references/definition/diagnostics device is mounted. Findings therefore use direct frozen source and executed controls, not grep as semantic proof. No new tooling was installed. No implementation-after-freeze verdict, canonical runtime rerouting assessment, or `resume_continuity_v1` behavior was in this assigned diff; none is claimed verified. Staged rename durability under power loss and hostile concurrent adopters are not established by these SIGKILL fixtures.

Self-check: findings distinguish observed failures from unexercised contract paths; exact receipts support every reported probe total. Freeze chronology and post-freeze implementation behavior remain explicit gaps.

FREEZE: FIXES-REQUIRED
