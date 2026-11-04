# K80ReviewFreeze — FREEZE-FIX findings (recommendation only)

Axes: operability + coverage:omp (orchestration/tooling). Scope: historical pre-data freeze c6a7ebd3, scaffolding 6d03402f, and explicitly assigned control reruns. No approval/admission; no lane implementation edits or git mutations.

## Findings, by severity

### MEDIUM — FREEZE-FIX F1: round-start sources census was not in the freeze

`c6a7ebd3`'s complete round-80 tree has no `open/sources-census.txt`; `open/base-receipts.txt` contains only spotcheck/proxy/offline-proxy outputs. The frozen plan nevertheless says the open receipts were committed at freeze and reports sources census exit 0. The sources receipt was added later in `509afb1d` (not in scaffolding either). Its header identifies measured lane tip `ed64ddcabf4e4f6a0d860d288d083fdad34f61c7`, not base `1968689f`. The current receipt does contain six W04 lines, an `ok` line, and `census_exit=0`; that later addition does not make it a pre-data frozen receipt. This is the requested r79 D7 FREEZE-FIX: disclose the late capture and precise measured revision; do not describe it as present at freeze.

Evidence: `K80ReviewFreeze/freeze-tree.txt`, `sources-first-added.txt`; current `open/sources-census.txt:1-9`; frozen plan `## Open state` and `## Freeze`.

### MEDIUM — FREEZE-FIX F2: named C2 live arm is actually a synthetic-root arm

Frozen plan C2 arm 12 names `live-clean`, explicitly against the **real live root**. The frozen counter emits `live-opt-in-clean` and sets `OMP_AGENT_ROOT: root65` (`probe/probe80-c2.mjs:255-260`), where `root65` is materialised from the committed receipt (`:127-132`). Thus all 12 arm definitions exist, but only 11/12 names match; the named real-root observation is absent from that arm. A 12/12 result cannot substantiate the plan's real-root acceptance condition. Record a named erratum and separate actual live-root evidence rather than silently renaming/editing frozen counter bytes.

### MEDIUM — FREEZE-FIX F3: named C1 journal-retirement condition is not asserted

Frozen plan C1 arm 11 promises corrupt-journal refusal, both halves unchanged, **journal retired**. `probe/probe80-c1.mjs:216-232` checks only exit 2, `REFUSED_ORACLE`, and the two file byte comparisons; it never checks journal removal. An implementation that leaves the corrupt journal behind can satisfy this arm. Likewise the plan's selftest minimum is n >= 25 while the counter requires >= 26 (`:239-240`). Disclose these predicate mismatches; frozen arm success is not evidence of retirement.

### LOW — FREEZE-FIX F4: base-control citations and numeric after-state are false as written

Frozen plan C1 after-state says base reads **0/13**, but committed `open/c1-base.txt` and this rerun read **6/13**. Both claims cite `controls/c1-base.txt` / `controls/c2-base.txt`, which do not exist in the freeze: the receipts are `open/c1-base.txt` / `open/c2-base.txt`. Fix via explicit erratum/citation correction, not historical overwrite. Both controls still satisfy their actual below-target kill rule.

### LOW — FREEZE-FIX F5: C1 described constant stub is not the recorded control

The plan describes an unconditional single-line clean printer. Recreated literally, it holds **1/13**, exit 1. The committed control receipt instead shows a second `MAP: CLEAN` line and a special selftest response (`controls/c1-stub.txt:1,12`); reconstructing those observed behaviors reproduces **3/13**, exit 1. The original runnable stub bytes are not committed, so exact source reproduction is unavailable. Publish the precise behavioral recipe/provenance, not a claim that the unconditional printer produced the committed 3/13. C2's reconstructed constant JSON reproduces 1/12, but its original full runnable source is likewise absent.

## Verified structural and control facts

- Commit order holds: freeze c6a7ebd3 at 05:41:58 -0300 precedes scaffolding 6d03402f at 05:47:52 -0300. The requested base..scaffolding log contains exactly these two commits.
- Counter SHA-256, identical at freeze and scaffolding (also matched the inspected worktree):
  - C1 `9cbd0281d835f68107567891f5a3492b4a0620b6005704d4b0f86756d97c0139`
  - C2 `ad514cf410c6065601157f96933958e95e72193002f54fefe7af1061e690b470`
- Both frozen claims have an explicit claim sentence, a one-command after-state (`--set c1` / `--set c2`), all-arms kill rule, base control, and constant-output control. C1 has 13 definitions/output arms, all 13 names match the plan. C2 has 12, with arm 12 mismatch described above.
- Base archive was extracted exactly with `git -C <lane> archive 1968689f9097f839457e242b41f83879e99af58e scripts | tar -x -C <scratch>/base`. Each counter ran with explicit `--tool`, `--lane`, `--work`, TMPDIR under this seat's scratch.
- Reruns (all exit 1, all below target): C1 base **6/13**; literal C1 stub **1/13**; receipt-behavior C1 stub **3/13**; C2 base **5/12**; C2 stub **1/12**. The committed C2 base receipt says 4/12; this rerun's selftest arm 11 passes. That is a surprise, not an exact reproduction of the original count; no historical receipt was rewritten. These runs combine archived tool scripts with current lane data, as `--tool` does not freeze `--lane`.

## Evidence and residual gaps

Raw commands, stdout/stderr and exit codes are preserved in this report's sibling `K80ReviewFreeze/` directory: `c1-base-rerun.txt`, `c2-base-rerun.txt`, `c1-stub-rerun.txt`, `c1-receipt-stub-rerun.txt`, `c2-stub-rerun.txt`, plus historical tree/plan/order/hash receipts. Scratch paths in commands are provenance only; evidence is the copied report-directory bytes.

The `xd://lsp` device is unavailable (`No such tool`), so definitions were inspected textually; no semantic references/diagnostics claim is made. No runtime-resume, rerouting or saturation claim is introduced or evaluated by this scoped freeze ticket. No tools were installed/upgraded. No subagents dispatched. The historical absence of the sources receipt and plan/counter predicate mismatches cannot be repaired retroactively by a current worktree addition.

Self-evaluation: accuracy 4/5 (C2 base count is host/current-lane-sensitive, explicitly disclosed); completeness 4/5 (original runnable stub source unavailable); clarity/actionability 4/5 (findings identify concrete predicates and erratum action); conciseness 4/5 (raw evidence delegated to attachments).
