# K90Mutation: boundary-removal mutation of the frozen C1 probe (round 90)

Scope: read-only on the lane. Writes confined to `round-90/K90Mutation/`. Scratch under `/fast/scratch/hyaku/kumitate-r90/K90Mutation/`, removed before yield.

## Result
- Ten mutants of receipt-bind v3 (base `7218699…`), one boundary removed each. **All ten print `C90_C1: UNMET`, exit 1. No survivor at 47/47.**
- Base control re-run by this seat: `C90_C1: UNMET held=39/47`, exactly the 8 K89-V1 prefix arms (matches the plan's pre-data row).
- Per-mutant verdict, exit, failing arms and `diff -u` line counts: `mutants.txt`.

| mutant | boundary removed | held | arms that kill it beyond base | diff -u lines |
|---|---|---|---|---|
| M1 | ESCAPES_LANE | 36/47 | escape-relative, escape-inner-dotdot | 11 |
| M2 | mode-120000 SYMLINK_INSTRUMENT | 35/47 | symlink-instrument, symlink-instrument-space-target, abs-symlink-instrument | 12 |
| M3 | AMBIGUOUS_FIELD | 36/47 | duplicate-field, dup-equal-field | 10 |
| M4 | RECEIPT_TOO_LARGE (both checks) | 35/47 | oversize, limit-edge, limit-before-read | 20 |
| M5 | BOM strip | 37/47 | bom-rev | 10 |
| M6 | realpath membership to lexical | 34/47 | alias-proc-root, alias-proc-root-clean, alias-ancestor, alias-ancestor-worktree | 13 |
| M7 | receipt rev= precedence | 35/47 | rev-receipt-wins, clean-r87-at-rev, bom-rev | 10 |
| M8 | O_NOFOLLOW single-descriptor read | 39/47 | none (probe-blind) | 17 |
| M9 | SYMLINK_DIR | 37/47 | symlink-dir | 10 |
| M10 | unchecked counted as matched | 39/47 | unchecked | 19 |

Commands: `node --check Mk.mjs`; `diff -u base.mjs Mk.mjs > Mk.diff`; `TMPDIR=<scratch>/tmp-Mk node …/probe90-c1.mjs --lane <lane> --work <scratch>/w-Mk --rev 7218699cfbdec702ba42f35ceac0a8e52d1bd564 --tool <seat>/Mk.mjs`. Base self-check: `node base.mjs --selftest` → `held=68/68`.

## Findings
1. **M8 is a probe gap.** Removing O_NOFOLLOW and the one-descriptor read leaves the verdict set identical to base v3 on all 47 arms. Base v3 says so itself (receipt-bind.mjs lines 533-534: "that branch needs a race and has no arm"). The descriptor read is not in the plan's claimed-behaviour list, so this is a declared-scope gap. A race defence cannot be probed black-box without scheduling hooks. Recommend stating it as out of scope in the C1 knowledge section.
2. **Kill attribution is boundary-specific.** Every mutant (except M8) fails at least one arm that base v3 passes and that targets its removed boundary. `selftest` also fails for each of them, but only because the mutant's own suite shrank. It is not an independent kill.
3. **M4 kills `limit-before-read` for a different reason.** The mutant returns `RECEIPT_UNREADABLE` (mode-0000 open fails first) instead of `RECEIPT_TOO_LARGE`. The arm still fails, but the size-before-read order is not isolated by that kill once the size check is gone.
4. **M10 side effect.** Counting unchecked as matched flips `single-zwsp` and `single-nbsp` to PASS, since their receipts now bind. The prefix-twin arms are sensitive to unchecked handling.
5. **Scale limit.** All mutants derive from v3, so the 8 K89-V1 arms fail before any mutation. The v4 prefix-normalisation boundaries are not exercised by this set. They need the same mutation run against the v4 candidate.

## Verification of mutants
- Each `Mk.mjs` differs from base by a non-empty `diff -u` (line counts above) and passes `node --check`.
- Probe sha256 before and after: `70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694` (unchanged).
- Base sha256 on the copy: `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3`.

## Note on report path
The task named `.ufo/waves/round-90/w1/K90Mutation.md`, but the contract confines writes to `round-90/K90Mutation/`. This report is at `round-90/K90Mutation/K90Mutation.md`.
