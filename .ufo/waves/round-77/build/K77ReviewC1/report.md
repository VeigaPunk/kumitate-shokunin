# K77ReviewC1 — adversarial C1 review

Axes: coverage:omp + operability (orchestration/tooling). Recommendation only; no admission or approval.

## Decisive findings first

These are **frozen-counter defects**, not findings against an unavailable executor implementation. The K77ExecShape artifact directory was absent at both inspections, including the final inspection. Do not mistake this report for candidate verification.

### HIGH — c1.1 can pass without writing its requested receipt (DECISIVE)

Hypothesis: the counter trusts the printed digest rather than the output file, and permits multiple stdout lines despite the one-line contract.

Evidence: `.ufo/waves/round-77/probe/probe77.mjs:102-110` uses `one.find(...)`, compares the printed hash to the committed receipt, and never opens `live-snapshot.json`. The attack writer emitted `EXTRA OUTPUT` plus the matching WROTE line, and deliberately created no output when `--root` was absent. It copied the committed receipt only for the roundtrip arm, without enumerating that root. Observed `c1.1 PASS`, `c1.3 PASS`, and `live_snapshot_created=false`. Thus checks 1+3 do not establish the writer property asserted by plan.md:67-70; even the staged-write requirement remains unobserved. Requires an independent writer challenge on final bytes, not a frozen-probe edit.

### HIGH — c1.10 accepts a pin outside the gate-pin block and never tests enforcement (DECISIVE)

Hypothesis: a matching free-standing line suffices even when no gate parser/comparator consumes it.

Evidence: `.ufo/waves/round-77/probe/probe77.mjs:230-235` matches against all of SCORECARD.md. The attack appended `pin.omp-shape=<digest>` at EOF, outside the gate-pin block. The stub proxy had no pin comparator at all. Observed `c1.10 PASS`. This does not establish plan.md:42-44 or its kill rule “gate pin absent or unchecked.” Run final-byte default-mode tamper/removal tests independently.

## Commands and observed attacks

Revision for the following execution: `4dc470a131e10900fdd456b6b68d7ba27151d9d2` plus explicit attack fixtures, **not** an executor revision. Scratch receipt was generated from the independent open TSV; its digest was `5980a0c8430ea0132a220f0b6517e35a2b60426f8321570d69e37b62a06b54f3`.

Command actually run:

```sh
node /fast/scratch/hyaku/kumitate-r77/K77ReviewC1/lane/.ufo/waves/round-77/probe/probe77.mjs --set c1 --lane /fast/scratch/hyaku/kumitate-r77/K77ReviewC1/lane --work /fast/scratch/hyaku/kumitate-r77/K77ReviewC1/work
```

The census's shape arm printed the fixed clean line without reading the requested receipt; proxy printed fixed JSON without reading any root or receipt. Snapshot behavior is described above. Full captured command/status/stdout/revision: `constant-probe.json` beside this report.

Observed output:

```text
CHECK c1.1-snapshot-writer: PASS entries=64 sha256=5980a0c8430ea0132a220f0b6517e35a2b60426f8321570d69e37b62a06b54f3 line==file
CHECK c1.2-snapshot-is-open-shape: PASS entries=64 equal to independent lstat receipt
CHECK c1.3-writer-roundtrip: PASS byte-identical regeneration sha256=5980a0c8430ea0132a220f0b6517e35a2b60426f8321570d69e37b62a06b54f3
CHECK c1.4-census-shape-clean: PASS OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)
CHECK c1.5-proxy-shape-terms: PASS source=snapshot O=64/0/35 coverage_omp=10
CHECK c1.6-offline-equals-root: PASS six O terms equal (1,1,64,0,35,10)
CHECK c1.7-negative-discriminates: FAIL census exit=0 out="OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)"
CHECK c1.9-selftests: FAIL census exit=0 "OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)"
CHECK c1.10-no-content-pinned: PASS pin.omp-shape=5980a0c8430ea013… name/kind/mode only
C77_C1: UNMET held=7/10
```

Check c1.8 also failed on all four exercised malformed/missing arms (full text in receipt). Exit was 1.

**Constant-printer attack: INEFFECTIVE against the full predicate.** Yes, it meets checks 1–6 with the trivial writer-copy setup. Check 7 actually runs the changed receipt and kills the constant census before its proxy-negative arm executes; check 8 kills it too. However, plan.md:67-68 literally kills “a constant printer meeting 5 or 6,” and both pass here. Do not describe those two individual checks as anti-printer evidence. No assertion that this mutant obtained 10/10.

## Determinism and malformed-receipt matrix

No candidate existed; every candidate-result below is **UNRUN**, not silently accepted or rejected by an implementation. The frozen probe's own `validSnapshot` at lines 52–56 is permissive; that is not the candidate loader.

| Attack on final bytes | Frozen probe coverage | Required interpretation |
|---|---|---|
| Duplicate entry names | Not exercised | Reject; otherwise one physical member may be counted repeatedly. |
| Name `..`, `../x`, absolute path, empty name | Not exercised | Reject; invalid depth-1 names must never reach materialisation. |
| Mode 512 / negative / fractional / string | Not exercised | Reject values outside integer 0..511. |
| Extra top-level key | Not exercised | Must reject under explicit missing/extra-key contract. |
| Added entry `content` key | No invocation with it | Must reject; c1.10 only inspects the committed entry keys. |
| Empty entries | Not exercised | Must reject per plan. |
| Directory as FILE | Not exercised | Fail closed, never CLEAN. |
| Symlink FILE pointing to valid receipt | Not exercised | Policy not explicitly forbidden; following it is not by itself a claim failure. Hash changed bytes must still be detected. |
| 1 MB valid receipt | Not exercised | Size alone is not malformed; no frozen size bound. Must preserve semantic judgment or fail closed honestly. |
| Unsorted entries / changed object key order / missing final LF | Only committed writer roundtrip | Writer must output canonical sorted names, fixed key order and LF; parser normalization acceptance is not prohibited. |
| `kind=symlink` | Allowed; materialiser supports it | Preserve lstat kind; do not follow target. POSIX link mode is normally 511; materialiser cannot recreate arbitrary link modes. |

`0o644` and `0o0644` are the same JavaScript integer (420); JSON must encode the integer as decimal `420`. Literal JSON `0o644`/`0o0644` is invalid JSON. This difference cannot justify byte instability. Inherited probe materialisation uses files with chmod and symlinks to `probe-missing-target` (lines 60–68), so symlink-target content is intentionally not evidence.

Exact final-byte command pattern (UNRUN): in this seat's recreated scratch clone with the final patch applied, set `F` to each mutated JSON file and run:

```sh
node "$S/lane/scripts/omp-census.mjs" --shape "$F"
node "$S/lane/scripts/proxy-check.mjs" --omp-shape "$F" --json
```

Generate each JSON mutation from the final committed receipt, independently: append a duplicate; replace first name with `..` then empty string; set first mode to 512; add top-level `extra`; add entry `content`; set entries to []; use a directory as F; symlink F to an unchanged copy; pad valid JSON with whitespace to 1 MB. For invalid schema cases expect exit 2 and SHAPE_INVALID / OMP_SHAPE_INVALID before any MATCH line. Capture every status and byte output. Directory/missing input must fail closed. Do not classify valid large input or a readable symlink as schema-invalid solely by preference.

Writer attacks (UNRUN): materialise final entries with lstat kinds/chmod; run `node "$S/lane/scripts/omp-census.mjs" --root "$S/root" --snapshot "$S/regen.json"`; compare bytes against the committed receipt. Then independently add/remove/change-kind/change-mode members and rerun; output must follow each root, not merely copy committed bytes. Verify exactly one stdout line and actual destination creation, plus interrupted replacement retaining either old-complete or new-complete bytes. Inspect comparator ordering for locale dependence.

## Pin integrity

Static fallback only: no `lsp` device is mounted (`read xd://lsp` returned “No such tool”), so semantic references/definition/diagnostics were unavailable. Text inspection is not semantic proof. At inspected inherited `scripts/proxy-check.mjs:1171-1174`, duplicate gate keys are refused. At 1226–1240 mismatches become error-level GATE_PIN_DRIFT; at 1463 comparison is unconditional, and 1306–1310 error findings gate without `--strict`. `sha256File` at 735–736 reads bytes directly, following symlinks and ignoring file permissions. These are inherited paths, **not evidence that final pin.omp-shape is registered or retained**.

Final-byte attacks (all UNRUN): change only receipt bytes then run proxy without `--strict`; expect GATE_PIN_DRIFT. Delete only its declaration; check whether pin enforcement silently disappears. Duplicate its key; expect exit 2 GATE_PIN_MALFORMED. Move the sole declaration outside the gate block; must not count as the promised pin. Replace receipt with a same-bytes symlink, then change its target; the changed bytes must find drift. chmod 0666 alone cannot change a content hash: lack of a mode finding is not a frozen-contract violation. No candidate file existed to stat for actual writable/symlink status. Replaceability without a finding matters for changed bytes, not inode identity.

## Offline equivalence and residual risk

Weaker reading: the same judge/derivation applied through two input adapters yields matching six terms for one clean fixture. Check 6 supports this compatibility property only. Stronger reading: independent root observation and offline receipt data entail the same correct rule-table judgment for both clean and adversarial shapes. It needs challenged roots/receipts and an independent expected oracle; two calls sharing a bug or constants cannot establish it. Check 7 adds one independent stray-member expectation but does not cover kind/mode/permission changes or all rule branches.

No resume path or runtime rerouting was changed or invoked in scope. No saturation improvement is claimed: frozen coverage:omp remains 10→10; the proposed movement is evidence provenance, not a score increase.

Scratch clone and attack fixtures were removed in a `finally` block; observed `scratch_removed True`. No tool installed or updated. Only this seat's permitted artifacts were written. Candidate review, malformed-case acceptance, final diff/callsites and diagnostics remain unverified because the executor artifact was absent; the required exact attacks are above, not reported as passes.

Self-evaluation: accuracy 4 (candidate unavailable, explicitly bounded); completeness 4 (all requested dimensions covered, implementation attacks necessarily unrun); clarity 4 (separates counter defects from candidate gaps); actionability 4 (commands/mutations supplied, final bytes required); conciseness 4 (matrix avoids repeated case prose). Overall 4.0. Main should apply the final candidate only in its isolated reviewer scratch, then run the unrun matrix and pin attacks before relying on HELD.

C1_REVIEW: BROKEN 2
