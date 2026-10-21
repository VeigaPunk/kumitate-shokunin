AUDIT Remainder7 anchors=16 false=6 overreverted=0 notice=bad verdict=refuted

# Scope and method

- Target: `corpus/knowledge/remaining-scripts-census.md`. Round-37 tree = HEAD 86c0676 = working tree (`cmp` equal, `git status` clean for this file).
- Base = `git show 0614092:P`. Round-36 = `git show 5833351:P` (parent of 5ceb8cd). Round-37 = `git show HEAD:P`.
- Changed anchors = anchor mentions in the round-37 tree whose `path:line` (or bare `:line`, resolved to the paragraph's last path mention) differs from every anchor of the same 0614092 paragraph. Result: 129 mentions in 33 paragraphs, numbered in document order. Group 7/8 = #97-#112, all in R37 L713 and L717.
- Pin: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (`git rev-parse HEAD`; `git status` clean).
- Truth rule: the sentence's own symbol must appear on the cited pinned line (ranges: any line in range). Scratch: `/fast/scratch/kumitate-r37/AuditRemainder7/`.
- Install/update: none.

# Group 7 table

| # | R37 L | sentence symbol | R37 as written | base 0614092 | R36 | symbol on base line (pin) | symbol on R37 line (pin, base file) | verdict |
|---|---|---|---|---|---|---|---|---|
| 97 | 713 | JSONL immutability | `:449` (no path) | ufo-state-retention.test.mjs:184 | :184 | yes, L184 "structured JSONL evidence is immutable" | NO, L449 = "cap bounds a generation held open read-only" | FALSE; base true, now false |
| 98 | 713 | true second-apply no-op | `:449` | ...test.mjs:210 | :210 | yes, L210 "cap second apply is a true no-op" | NO, L449 | FALSE; base true, now false |
| 99 | 713 | open-writer deferral | `:449` | ...test.mjs:244 | :244 | yes, L244 "cap defers ... open writable fd" | NO, L449 | FALSE; base true, now false |
| 100 | 713 | read-only holder now caps | `:449` | ...test.mjs:449 | :449 | yes, L449 | yes, L449 | value ok; path dropped |
| 101 | 713 | watch_active | `:767-771` | ...test.mjs:595 | :595 | yes, L595 | yes, L771 in range | value widened 595 to 767-771; true by range |
| 102 | 713 | verifiably live lock owner | `:767-771` | ...test.mjs:771 | :771 | yes, L771 `liveLockRun` | yes, by range | value widened; true by range |
| 103 | 713 | malformed, dead-pid, pid-0 bodies do not protect | `:767-771` | ...test.mjs:767-771 | same | yes | yes, L767 "a dead holder does not protect"; malformed/pid-0 not on range | path dropped; weak |
| 104 | 713 | ledger_incomplete | `:650` | ...test.mjs:650 | :650 | yes, L650 | yes, L650 | path dropped |
| 105 | 713 | queue_unsafe within timeout | `:795-800` | ...test.mjs:781-792 | :781-792 | yes, L791 `queue_unsafe` | NO, L795-800 = mkfifo / isFIFO; queue_unsafe is L791 | FALSE; base true, now false |
| 106 | 713 | FIFO event-log path not overwritten | `:795-800` | ...test.mjs:795-800 | same | yes, L800 | yes, L800 | path dropped |
| 107 | 717 | imports formatUf0Status, isCacheFresh, shouldStampDisplayRefresh | `:22` | ufo-statusline-hook.test.mjs:16 | :16 | yes, L16 | NO, L22 = `function test(name, fn) {` | FALSE; base true, now false |
| 108 | 717 | nine pins over a local test harness | `:22` | ...test.mjs:22 | :22 | yes, L22 | yes, L22 | path dropped |
| 109 | 717 | CLOSED | `:33` | ...test.mjs:33 | :33 | yes, L33 `const CLOSED` | yes, L33 | path dropped |
| 110 | 717 | empty object, no fabricated zeros | `:40` | ...test.mjs:40 | :40 | yes, L40 | yes, L40 | path dropped |
| 111 | 717 | missing levels / phaseCounts | `:36` | ...test.mjs:36 | :4 (also true) | yes, L36 `phaseCounts:` | yes, L36 | path dropped |
| 112 | 717 | null, strings, arrays render CLOSED | `:97-98` | ...test.mjs:44 | :44 | yes, L44 "null / non-object renders CLOSED" | NO, L97-98 = console.log / process.exit | FALSE; base true, now false |

Counting rule: "false" reads a path-less anchor against the file its base sentence named, the only file the paragraph can mean.

# Findings

1. False restored anchors: 6 (#97, #98, #99, #105, #107, #112). Every one of these base anchors was true at the pin, and R36 matched base, so the restoration broke true anchors.
2. Path dropped: 16/16 group-7 anchors are bare `:N`. L713 and L717 contain no file path at all. Note-wide: 32 path-less mentions (L661 x4, L713 x13, L717 x14, L729 x1). Ten group-7 numbers equal their base numbers, so the restoration lost the path. Six numbers are no longer their base values.
3. Overreverted (true improvement reverted to a base-false line): 0 in group 7. All 16 base anchors are true at the pin; R36 differs from base only at #111, and there R36 `:4` is also true.
4. Notice: present (census L2, dated 2026-10-21, cites spot-check D1; the D1 row is at `corpus/lessons/round-36-verifier-spotcheck.md:193`). Accuracy: BAD.
   - "Anchors in this note were reverted to the lines their 0614092 sentences named" is false. Of 521 anchor mentions, 129 (33 paragraphs) differ from their 0614092 value: 32 are path-less, 4 equal the round-36 value (never reverted), and 93 are third values. Only 16 paragraphs are exact reverts.
   - Example: `DECLARED_PRE_HOOKS` (R37 L504). Base and R36 say `scripts/check-hand-authored-sets.mjs:35`, where the pin declares it (`export const DECLARED_PRE_HOOKS`). R37 says `scripts/check-hand-authored-sets.test.mjs:14`, an import line that also contains the symbol.
   - "treat line anchors here as at their base revision" tells readers to trust values this note no longer carries.
   - The same false scope claim appears in `.ufo/waves/round-37/repairs.md` (D1 bullet).

# Outside group 7 (same scan; for the owners of those groups)

Five true-to-false reverts (base false, R36 true, R37 = base):
- R37 L556 (base L554): `BUILD_FAMILY` at `cargo-shim.sh:128` (pin L128 = `lean_frozen_cache_digest() {`; R36 `:117` = BUILD_FAMILY line). `have` at `:136` (pin L136 = `printf`; R36 `:125` = `have() {`). `rc != 0` at `:322` (pin L322 = `if [[ ! -e`; R36 `:312` is a comment).
- R37 L638 (base L636): `loadHook` at `ufo-l0-monitor-hook.test.mjs:32` (pin L32 = readFileSync line; R36 `:30` = `function loadHook`).
- R37 L639 (base L637): `REPO_ROOT` at `:37` (pin L37 is an unrelated line; R36 `:7` is a comment mention only).
Not evaluated: R37 L558 basename-only anchors `cargo-shim.sh:35/:61`; path-less base anchors at L731/L733.

# Fix (not applied; audit is read-only)

- Restore R37 L713 and L717 from `git show 5833351:corpus/knowledge/remaining-scripts-census.md` lines 711 and 715. Those lines carry the base anchors with paths, and they are true at the pin.
- Rewrite the notice to state the real scope: path loss (32), third values (93), unchanged round-36 values (4), and the five reverts above.

# Verification gaps

- Symbol assignment for group 7 was read by hand. Ranges were checked as ranges (#100-#103 true only by range).
- The 129 count depends on my extraction regex. Pin truth for the cross-group list is from line reads, not a full sweep.
