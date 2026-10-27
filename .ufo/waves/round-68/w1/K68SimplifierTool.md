VERDICT: The round's four surfaces carry seven removable/duplicated arms; one is claim-blocking — the frozen C1 `good` fixture is unsatisfiable by any implementation of its own quote rule — and every patch here is behaviour-preserving, measured against the frozen 20-mutant harness and each artifact's own selftest.

## Evidence

Harness: the frozen C1 counter's fixture machinery, sliced verbatim by marker (`receipts/fxharness.mjs`), run
against each variant with a fixed seed. Scratch: `/fast/scratch/hyaku/kumitate-r68/K68SimplifierTool` (deleted).

```
# receipts/mutants.txt   (frozen generator: A5's quote splices item-4 words with `shared`)
TOOL v1.mjs            seed=k68yagni0000a1b2 mutants=20 fail=7
TOOL <v2 draft 12:04>  seed=k68yagni0000a1b2 mutants=20 fail=2 :: good:exit=1 …; no-section:exit=1 …
TOOL ref-v2.mjs        seed=k68yagni0000a1b2 mutants=20 fail=2 :: good …; no-section …
# with P1 applied to the generator:
TOOL <v2 draft> / v2-slim.mjs / v2-mask.mjs / ref-v2.mjs   mutants=20 fail=0 :: ALL-20-MATCH
TOOL ref-v2.mjs   seeds 00112233aabbccdd, feedfacecafebeef  mutants=20 fail=0 :: ALL-20-MATCH

# receipts/selftests.txt
v1.mjs PASS (33/33)   v1-noconj / v1-r2 / v1-r3 / v1-r7  PASS (33/33)
v2draft.mjs PASS (56/56)   v2-slim.mjs PASS (56/56)   v2-mask.mjs PASS (56/56)

# receipts/parser-equivalence.txt        EQUIVALENCE PASS inputs=43
# receipts/items67.txt                   real files=34 items=234 sections=34 diffs=0
# receipts/c2-entry-runs.txt
frozen counter (f0a3142e), entry-yagni        DEPREC68_UNMET held=7/10 | M5 MISS no-live | M6 MISS rows=7!=6
P3-fixed counter,          entry-yagni        DEPREC68_UNMET held=8/10 | M5 MISS no-live | M9 MISS (no scripts/)
worktree counter (8c64f323), entry-yagni      DEPREC68_UNMET held=8/10 | M5 MISS no-live | M9 MISS (no scripts/)

$ grep -rn 'routedItems\|routedSections' scripts/ .ufo/pins/   # nothing outside scripts/routed-ledger.mjs
$ omp --version                                                # omp/18.13.1 (entry's quote reproduced)
```

## Findings

**K68SimplifierTool-1 — CRITICAL — C1's L4 `good` fixture cannot pass; the claim is unachievable as frozen.**
Attacks `LEDGER68_HELD` L4 and therefore C1. Row `A5` quotes
`${items101[2].split(' ').slice(2, 4).join(' ')} ${shared}` — two words from item 4 glued to the phrase that ends
items 4 and 5, contiguous in no item. So `QUOTE_ABSENT` fires for `good` and `no-section` under any implementation
of "quote located in that item's text": the v2 draft, my 194-line reference and v1 fail exactly those two and
nothing else. The draft's own `buildFx` already quotes D5 contiguously — the two fixture sets disagree, which is
why the draft's 56-case selftest could not see it.
*Repro:* `TMPDIR=$PWD node receipts/fxharness.mjs <frozen ledger68-probe.mjs> k68yagni0000a1b2 <v2 draft>` →
`mutants=20 fail=2 :: good:exit=1 …; no-section:exit=1 …`. *Fix:* P1 (`receipts/P1-c1-a5-fixture.diff`, 3 hunks):
capture `phrase(5)` as `d5tail`, use it in the D5 line and in `A5`. Token stream unchanged; `ambiguous-quote` stays
ambiguous; with P1 the draft reads `ALL-20-MATCH`. Strengthening ratchet proposal — the frozen file is untouched.

**K68SimplifierTool-2 — MEDIUM — C2's M6 separator filter was the round's third convention (fixed on disk 12:08, uncommitted).**
At the freeze commit C2 uses `/^\|[\s:-]+\|$/` (no `|` in the class) → only single-column separators are skipped;
the tool's `isSep`, C1's counter and C1's `ledgerParse` all include the pipe. Consequence: a delimiter row counts
as a seventh feature, so the entry draft omits its delimiter row and explains the workaround in prose — the
snapshot renders as no table. The worktree copy of the frozen counter was then changed at **12:08**
(sha `8c64f323…`, one hunk, per-cell test) while `git log -1 -- .ufo/waves/round-68/probe/deprec68-probe.mjs` still
shows freeze commit `39f61816` — the file on disk is no longer the file its base receipt (11:44, `f0a3142e`) and my
measurements describe. L1's call: record the re-freeze or revert; I did not touch it.
*Repro:* `node receipts/frozen-deprec68-probe.mjs <c2fx> 3037db46… --no-live` → `M6 MISS rows=7!=6`;
`node receipts/c2-counter-worktree-1208.mjs <c2fx> 4c65789c… --no-live` → `held=8/10`, M6 clean.
*Fix:* keep the landed 12:08 form (or my equivalent one-liner `receipts/P3-c2-m6-separator.diff`; do not stack)
plus P6 (entry: restore `|---|---|---|---|---|`, delete the counter paragraph).

**K68SimplifierTool-3 — MEDIUM — v2 draft: dead export, duplicated escape rule, double normalise.**
(a) `routedItems` is commented "kept for callers" — no caller exists (selftest and `evaluate` call
`routedSections`; no lane file imports the module). (b) the `--ledger` escape pre-check duplicates `contained()`
and emits the identical `ledger-escape:…`, so its pinning case still passes without it. (c) `words()` calls
`norm()` twice. *Repro:* `node receipts/v2-slim.mjs --selftest` → `PASS (56/56)`; harness → `ALL-20-MATCH`.
*Fix:* P4 (`receipts/P4-v2-slim.diff`, 732 → 725 lines).

**K68SimplifierTool-4 — LOW — C1's `items67` fenced-continuation arm is dead on the whole real corpus.**
The counter's parser is exercised only by the real spot-checks (L4 uses the tool), and no routed section has a
fence inside an item body — all six fences in rounds 60/61 sit above the routed headings (60:46,51,93,103 before
163; 61:19,24 before 211). *Repro:* `node receipts/cmp-items67.mjs` → `real files=34 items=234 sections=34 diffs=0`.
*Fix:* P2 (1 line) — record, do not buy a re-freeze; land it only alongside P1.

**K68SimplifierTool-5 — LOW — one entry sentence asserts a fact the entry's evidence chain cannot check.**
`## The live clock`: "the pull merged as commit `219f8242` while the SEP still read `Draft`". It is true —
`build/K68ScribeEntry/pr2596-api.json` has `merged_at 2026-05-18T18:09:21Z`, `merge_commit_sha 219f82421ce1…`, and
`build/K68ScoutSsepFinal/sep2596-at-merge.md` hashes `0dace4d43d42…` ≠ the Final body's `6608969be121…` — but none
of that is a pinned capture and no M-check reads it. The disproof survives on S213 alone (it *is* the flip).
*Fix:* P7 (`receipts/P6P7-entry.diff`, hunk 2), or bind a seventh row + capture.

**K68SimplifierTool-6 — INFO — `routedSections` keeps two fence state machines.**
The heading scan and the per-section body scan agree only because a routed heading is never inside a fence — an
invariant no case states. P5 (`receipts/P5-v2-mask-parser.diff`) computes one mask: `EQUIVALENCE PASS inputs=43`,
`PASS (56/56)`, `ALL-20-MATCH`, at **+2 lines** (lateral, not a saving; land only if the file is open for P4).
My first attempt was *not* equivalent (it dropped fence-delimiter lines from item bodies, 2/43 inputs) — the
receipt caught it.

*Not flagged, with the pin:* `--classes` (2 selftest cases + L1's `n >= 44`), `--rev` reader (3 cases), R-id/round
agreement (1 case); `norm`'s `<script>`/entity arms (dead on every measured input, but L3's `norm` is the same
chain — cutting one side creates a second "same text" convention); and six guards whose removal changes behaviour
on inputs no case covers (`root-not-directory`, `root-unreadable`, `spotcheck-dir-*`, `not-regular`,
`readFileInside:unreadable`). Full table in `patches.md`.

## Artifacts

- `.ufo/waves/round-68/w1/K68SimplifierTool.md` (this file).
- `.ufo/waves/round-68/build/K68SimplifierTool/patches.md` — flag rule, P1–P7 with inline hunks, kept-arms table.
- `.ufo/waves/round-68/build/K68SimplifierTool/receipts/` — `P1…P6P7 *.diff`, `P3-worktree-change-since-freeze.diff`,
  `mutants.txt`, `selftests.txt`, `parser-equivalence.txt`, `items67.txt`, `c2-entry-runs.txt`, and the runnable
  sources they cite (`fxharness.mjs`, `cmp.mjs`, `cmp-items67.mjs`, `ref-v2.mjs`, `v2draft.mjs`, `v2-slim.mjs`,
  `v2-mask.mjs`, `c1-fixed.mjs`, `c2-fixed.mjs`, `c1-noarm.mjs`, `entry-now.md`, `entry-yagni.md`,
  `v1-tool-at-base.mjs`, `frozen-ledger68-probe.mjs` `981f2dae…`, `frozen-deprec68-probe.mjs` `f0a3142e…`,
  `c2-counter-worktree-1208.mjs` `8c64f323…`).
- No frozen or landed file modified by this seat; no git/jj write outside my own scratch fixture (`c2fx`, `-C`).

## Limits

- M5 never ran live (`--no-live` on every C2 run); P3 is outside the live path, but that arm is unmeasured.
- The lane has neither `corpus/routed-ledger.md` nor the entry, so no full counter run was possible against the
  lane; C2 numbers come from a scratch fixture lane (revs `01271b52`, `3037db46`, `4c65789c`) where M9 misses
  because the fixture has no `scripts/`.
- Two C2 counter versions are in play: committed/freeze bytes `f0a3142e` (measured here, and what the 11:44 base
  receipt was produced against per `git show HEAD:`) and the uncommitted 12:08 worktree edit `8c64f323`. Any C2
  verdict produced now is against the second.
- The v2 draft and the entry were still moving during this pass (entry changed at 12:02). Patches target the 12:04
  tool (732 lines) and the 12:02 entry (127 lines); both are copied into `receipts/`.
- `fxharness.mjs` slices by marker text, not line numbers: version-proof to the P1 hunk, but re-run it if the
  counter's fixture block is renamed.
