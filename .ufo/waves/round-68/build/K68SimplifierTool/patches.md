# K68SimplifierTool — YAGNI patches (round 68, wave w1)

Scope: the round's four surfaces — the v2 tool draft (`build/K68ExecToolV2/routed-ledger.mjs`, 732 lines,
SHA of the copy I measured: `v2draft.mjs`, see `receipts/selftests.txt`), the two frozen counters
(`probe/ledger68-probe.mjs`, `probe/deprec68-probe.mjs`), and the C2 entry draft
(`build/K68ScribeEntry/mcp-deprecation-registry.md`, 127 lines at 12:02). Nothing frozen or landed was edited:
every variant below is a copy in `/fast/scratch/hyaku/kumitate-r68/K68SimplifierTool/` (deleted on exit) or in
`receipts/`.

## Flag rule used (so each flag is falsifiable)

An arm is flagged **only** when removing it is behavior-preserving on every input the round can exercise:

1. it is a tautology / duplicate authority / unreachable by construction, **and**
2. with it removed the tool's own selftest stays `PASS (n/n)` and the frozen 20-mutant L4 set stays
   `ALL-20-MATCH` (measured, not argued), **and**
3. nothing else in the lane calls it (grep over `scripts/`, `.ufo/pins/`).

If removal changes behavior on an input **no case covers** (a guard), the arm is *not* flagged — it is listed
under "Kept, and the case that pins it" so a reviewer can see the decision instead of a silent gap. This is the
strict reading of "no case, no flag": a dead arm may be flagged only with the measurement that no case breaks;
a guard whose removal breaks no *case* but does change behavior is left alone.

Measurement harness: `receipts/fxharness.mjs` slices the **frozen** counter's own `buildFixture`/`MUTANTS`/`harness`
text verbatim (no reimplementation) and runs any tool path through it with a fixed `--seed`. The scratch
reference implementation `receipts/ref-v2.mjs` (194 lines) is included only as the "is the contract satisfiable
with less machinery" control — it is not a deliverable.

**Applying a hunk.** The diff headers name the copies I measured, all of them now in `receipts/`:
`p-c1-orig.mjs` = committed `probe/ledger68-probe.mjs` (sha `981f2dae…`), `p-c2-orig.mjs` = `probe/deprec68-probe.mjs`
at the freeze (sha `f0a3142e…`), `v2draft.mjs` = `build/K68ExecToolV2/routed-ledger.mjs` at 12:04 (732 lines),
`entry-now.md` = `build/K68ScribeEntry/mcp-deprecation-registry.md` at 12:02 (127 lines). Each applies with
`patch -p0` in a directory holding files under those names (verified: 6/6 `APPLIES`).

---

## P1 — CRITICAL — the frozen C1 counter's `good` fixture is unsatisfiable (blocks the claim)

**What it attacks.** `LEDGER68_HELD` L4. Two of the twenty mutants (`good`, `no-section`) ask for exit 0 /
`CLEAN`, and under any implementation of the declared quote rule ("located in that item's text") they cannot
pass: row `A5`'s quote is a *splice* of two non-adjacent words from item 4 (`items101[2]`, words 3–4) and the
`shared` phrase that ends items 4 and 5, so it is contiguous in no item of the fixture.

**Evidence.**
- `receipts/mutants.txt`: the frozen generator fails `good` and `no-section` for the v2 draft, for my 194-line
  reference, and for v1 — three independent implementations, same two mutants.
- `receipts/mutants.txt` (with P1 applied): the v2 draft, `v2-slim`, `v2-mask` and the reference all read
  `ALL-20-MATCH`, three seeds.
- The dump used for the hand proof (`fx-good/corpus/ledger` row `A5` vs `round-101` items) is reproduced by
  `node receipts/fxharness.mjs <counter> <seed> <tool>`; the counter's own line is
  `{ id: 'A5', n: 101, k: 5, q: \`${items101[2].split(' ').slice(2, 4).join(' ')} ${shared}\`, … }`.

**The patch** (`receipts/P1-c1-a5-fixture.diff`, 3 hunks, +1 line): capture the D5 phrase the way the *draft's*
`buildFx` already does, and let `A5` quote it contiguously. The token stream is unchanged (the captured
`phrase(5)` is the same call in the same order), so every other mutant's fixture is byte-identical.

```diff
   const fenceLine = phrase(5);
+  const d5tail = phrase(5);   // captured: A5 must quote D5 contiguously
@@
-    `- **D5 — ${phrase(5)} ${shared}.**`,
+    `- **D5 — ${d5tail} ${shared}.**`,
@@
-    { id: 'A5', n: 101, k: 5, q: `${items101[2].split(' ').slice(2, 4).join(' ')} ${shared}`, status: 'open', answer: '-' },
+    { id: 'A5', n: 101, k: 5, q: `${d5tail.split(' ').slice(3, 5).join(' ')} ${shared}`, status: 'open', answer: '-' },
```

`ambiguous-quote` (which sets `rows[1].q = shared`) is unaffected — `shared` is still in both D4 and D5. This is
a **strengthening ratchet proposal for the L1** (the frozen counter is not edited here): it makes L4 satisfiable
without relaxing what L4 demands. Until it lands, no v2 tool can hold C1, whatever its quality.

---

## P2 — LOW — C1 counter: the fenced-continuation arm of `items67` is dead on the whole real corpus

```js
if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\n${n.l}`; continue; }   // ledger68-probe.mjs:200
```

**Why it is dead.** The counter's own parser is exercised only by the twelve real spot-checks (L4 uses the
*tool*, never `items67`), and no routed section in the lane has a fence inside an item body: all fences in rounds
60/61 sit above the routed heading (`grep -nE '^ *```' corpus/lessons/round-{55..66}-…` → 60:46,51,93,103;
61:19,24, both before the headings at 60:163 and 61:211).

**Measurement** (`receipts/items67.txt`, slices `items67` out of the frozen counter verbatim and compares with
and without the arm): `real files=34 items=234 sections=34 diffs=0`. The only input that distinguishes the two is
a fence inside an item body (`with-arm items[0] = "- D1 line\n```\n- fenced bullet\n```"` vs
`no-arm "- D1 line\n```"`).

**Verdict: record, do not spend a re-freeze.** Land it only in the same re-freeze as P1 (zero marginal cost);
on its own it is not worth re-freezing a counter that already measured a base receipt. Hunk:
`receipts/P2-c1-fence-body-arm.diff` (1 line).

---

## P3 — MEDIUM — C2 counter M6: the separator filter is single-column only, a third convention

> **Status at the end of this pass (12:11):** the worktree copy of `probe/deprec68-probe.mjs` was changed at
> **12:08** (sha `8c64f323…`, one hunk) to a per-cell separator test — `git log -1 -- <file>` still shows the
> freeze commit `39f61816`, i.e. the change is **uncommitted**. That fixes M6, but it means the file the
> counter's own base receipt (`base/deprec68-base.txt`, 11:44) and my measurements describe is no longer the file
> on disk. Diff of record: `receipts/P3-worktree-change-since-freeze.diff`; the version I measured is
> `receipts/frozen-deprec68-probe.mjs` (sha `f0a3142e…`). The L1 owns this: either record the re-freeze or revert
> the edit. The entry consequence below is unchanged — with the 12:08 bytes the delimiter row is accepted
> (`receipts/c2-entry-runs.txt`, last line).

**What it attacks.** `DEPREC68_HELD` M6 and every entry that wants a rendering markdown table. The filter at the
freeze commit is `/^\|[\s:-]+\|$/` — the class omits `|`, so only a **one-column** separator (`|---|---|`) is skipped:

```js
const snapRows = snapSec ? snapSec.split('\n').filter((l) => l.startsWith('|') && !/^\|[\s:-]+\|$/.test(l.trim()) && …)
```

Every sibling parser in the same round already includes the pipe in the class — `scripts/routed-ledger.mjs`
(`/^\|[\s:|-]+\|\s*$/`, twice), the v2 draft (`isSep`: `/^[|\s:-]+$/`), and C1's counter (`/^[|\s:-]+$/`,
`/^\|[\s:|-]+\|\s*$/`). C2's copy is the odd one out, and the consequence is on the page: the entry draft
correctly omits its delimiter row and carries a paragraph explaining the workaround, so its snapshot is not a
table to any reader.

**Evidence** (measured on a fixture lane carrying the entry, its seven SOURCES rows, the seven captures and the
pins; `receipts/c2-entry-runs.txt`):
- as landed (no delimiter): frozen counter `held=8/10 … | M5 MISS no-live | M9 MISS …` (the 8 is the draft
  passing M1–M4, M6–M8; M5/M9 are fixture/network artifacts, not draft defects);
- delimiter row restored: frozen counter `M6 MISS rows=7!=6` — the seventh "row" is the separator;
- with P3 applied: `held=8/10` again, M6 clean, entry keeps its delimiter row.

**The patch** — two equivalent forms; prefer the one already on disk (12:08) and **do not** stack mine on top:

```diff
# mine (1 line, receipts/P3-c2-m6-separator.diff) — pipe in the class, one regex:
-  … !/^\|[\s:-]+\|$/.test(l.trim()) && …
+  … !/^[|\s:-]+$/.test(l.trim()) && …
# already applied in the worktree (receipts/P3-worktree-change-since-freeze.diff) — per-cell test:
+  const isSepRow = (c) => c.every((x) => /^[\s:-]+$/.test(x) || x === '') && c.some((x) => /-/.test(x));
+  … .map(…).filter((c) => !isSepRow(c)) …
```

Strictly a strengthening (it excludes *more* lines from being read as data rows; a real snapshot row cannot
consist only of `|`, spaces, colons and hyphens). Pair it with P6: the entry edit is only valid on a counter
that skips a multi-column separator. This is a frozen-counter change; it needs an L1 re-freeze decision like P1.

---

## P4 — MEDIUM — v2 tool draft: three dead/duplicated arms (`-7 lines`, no behavior change)

Each was proved by removal + full measurement: `receipts/selftests.txt` (`v2-slim.mjs ROUTED_LEDGER_SELFTEST:
PASS (56/56)`) and `receipts/mutants.txt` (`v2-slim.mjs … ALL-20-MATCH`).

**(a) `routedItems` is a dead compatibility export.** The doc comment says "kept for callers"; there are none —
`evaluate` and the 56 selftest cases call `routedSections` directly (`grep -n 'routedItems' routed-ledger.mjs`
→ only its own definition), and no lane file imports the tool module
(`grep -rn 'routedItems\|routedSections' scripts/ .ufo/pins/` → nothing outside `scripts/routed-ledger.mjs`).
Keeping a v1-shaped adapter for callers that do not exist is the second convention this seat exists to prevent.

**(b) The `--ledger` escape pre-check duplicates `contained()`.** `readFileInside`/`readRev` both go through
`contained(base, rel)`, which rejects absolute and `..`-leading paths with `why: 'escape'`; the caller renders
`ledger-${lr.why}:${ledgerRel}` = `ledger-escape:…`, byte-identical to the pre-check's own message. The selftest
case that pins the behavior (`--ledger outside the root → FAIL-CLOSED exit 2`, asserting `/ledger-escape/`) still
passes with the pre-check gone — same reason string from the remaining single rule.

**(c) `words()` normalises twice.** `norm(s) === '' ? 0 : norm(s).split(' ').length` → normalise once.

```diff
-export const words = (s) => norm(s) === '' ? 0 : norm(s).split(' ').length;
+export const words = (s) => { const n = norm(s); return n === '' ? 0 : n.split(' ').length; };
@@
-/** v1 name, kept for callers: one file → { found, items }. `found` = at least one routed heading. */
-export const routedItems = (text) => {
-  const r = routedSections(text);
-  return { found: r.sections > 0, sections: r.sections, items: r.items };
-};
-
@@
-  if (isAbsolute(ledgerRel) || ledgerRel === '..' || ledgerRel.startsWith(`..${sep}`)) return failClosed(out, `ledger-escape:${ledgerRel}`);
```

Full diff: `receipts/P4-v2-slim.diff` (732 → 725 lines).

---

## P5 — OPTIONAL — v2 draft: one fence mask instead of two toggles in `routedSections`

`routedSections` keeps two independent fence state machines: the heading scan (`fence`) and the per-section body
scan (`f`). They cannot currently disagree (a routed heading is never inside a fence), but nothing in the code
or the cases says so — that is precisely the duplicated-rule risk. `receipts/P5-v2-mask-parser.diff` computes
one mask (`del`/`inside`) and derives headings, section ends and item bodies from it.

**Measurement:** `receipts/parser-equivalence.txt` — `EQUIVALENCE PASS inputs=43` (34 real spot-checks,
2 fixture files, 7 synthetic adversarial inputs: fence inside an item body, two sections with a shallower second
one, unbalanced fence at EOF, table only, heading inside a fence, prose/list/prose, `~~~` fence), JSON-identical
`{sections, items}`; plus `PASS (56/56)` and `ALL-20-MATCH`.

**Tradeoff, stated plainly:** it is **+2 lines** (734 vs 732) because the mask has to be recomputed, and it buys
one instead of two fence rules. Land it only if the file is already open for P4; on its own it is a lateral move,
not a saving. My first attempt at this patch did **not** reproduce the original (it dropped fence *delimiter*
lines from item bodies, 2 of 43 inputs differed) — the equivalence receipt is the guard that caught it.

---

## P6 — MEDIUM — entry draft: restore the delimiter row and delete the workaround paragraph

Depends on P3. With P3 landed, the entry's `## Registry snapshot` becomes a real markdown table and the paragraph
that documents the counter's quirk goes away (it is prose about the *gate*, in the deliverable, checkable only by
reading the counter's source — the reader of the entry cannot verify it).

```diff
-cells are the page's own cells, quote for quote, backticks included; only the links are removed. The delimiter row is
-deliberately absent: the round-68 counter counts every `|`-starting line that is not the `Feature` header, so a
-standard `|---|` row would be read as a seventh feature (finding K68ScribeEntry-2).
+cells are the page's own cells, quote for quote, backticks included; only the links are removed.
 
 | Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
+|---|---|---|---|---|
```

Measured on the fixture lane: `receipts/c2-entry-runs.txt` (as above).

---

## P7 — LOW — entry draft: one clause asserts a fact the entry's evidence chain cannot check

`## The live clock` ends with: "the pull merged as commit `219f8242` while the SEP still read `Draft`". Both
facts are true — `build/K68ScribeEntry/pr2596-api.json` has `"merged_at": "2026-05-18T18:09:21Z"` and
`"merge_commit_sha": "219f82421ce13f6b0d9f786e603cf9a659fd5216"`, and `build/K68ScoutSsepFinal/sep2596-at-merge.md`
hashes `0dace4d43d42…` ≠ the Final body's `6608969be121…` — but **neither file is a pinned capture** (M3 pins only
S207–S213), and no M-check reads them, so the sentence is exactly "prose that asserts something nothing in the
chain checks". The same argument survives without it, because S213 *is* the status flip:

```diff
-value. The merge timestamp of PR #2596 (the `merged_at` field of the pull record) is also the wrong event: the pull
-merged as commit `219f8242` while the SEP still read `Draft`, and the `Final` flip is a *later* commit, S213, which
-is the only artifact in this chain that both dates the transition and shows the changed line.
+value. The merge timestamp of PR #2596 is the wrong event for the same reason: Final is dated by the commit that
+flips `Status: Draft` to `Status: Final` — S213, the only artifact in this chain that both dates the transition and
+shows the changed line — not by when the pull was merged.
```

Alternative if the drawdown must stay documented: open the PR record as a seventh row (S214) with a pinned
capture — M2/M3/M4 accept it (absent at base, 11 cells, `mined`, a capture, a bullet), at the cost of one more
row and one more live URL in M5. The cut is the cheaper honest move.

The other unbound-looking sentence in the earlier draft ("no revision since has removed it") was already
rewritten by the scribe to point at S207 § Removed before I measured — no patch needed.

---

## Kept, and the case that pins it (the "no flag" half of this pass)

| Arm | Pinned by | Note |
|---|---|---|
| `--classes` printer + `CLASS`/`RECURRENT` lines | selftest `--classes prints CLASS lines…`, `RECURRENT fires at 4 distinct rounds`; L1 needs `n >= 44` | no mutant exercises it; cutting it costs two cases and the capability's stated purpose (recurrence counting) |
| `--rev` reader (`readRev`, `listSpots` rev branch) | selftest `--rev reads committed bytes…`, `inherited GIT_DIR is not honoured…`, `unreadable --rev` | not in the 20 mutants; removing it breaks three cases |
| R-id vs round-cell agreement | selftest `R-id whose round cell disagrees → ROW_MALFORMED` | only the draft has this case (v1 did not); keep the case, keep the arm |
| `norm`'s `<script>/<style>` strip and HTML-entity decode | none of the 20 mutants, none of the 56 cases, 0 hits in rounds 55–66 (`grep -cE '&(amp\|lt\|gt\|nbsp\|quot);'` → 0; `grep -cE '<(script\|style)'` → 0) | **deliberately not cut**: the C1 counter's L3 `norm` is the same chain, and cutting one side only creates a second convention for "same text" between the tool and its independent re-verification |
| `root-absent` / `root-symlink` / `spotcheck-symlink` / `ledger-symlink` / answer-path `escape` guards | selftest cases exist for absent root, root symlink, row-level spot-check symlink, ledger symlink, `--ledger outside the root` | guards with cases — live |
| `root-not-directory`, `root-unreadable`, `spotcheck-dir-not-directory`, `spotcheck-dir-unreadable`, `not-regular`, `unreadable` in `readFileInside`, `readRev`'s `escape` | **no case** | not flagged: removal changes behavior on inputs no case covers (a file root, an unreadable dir, an answer path naming a directory). Cutting a guard to save 6 lines is the wrong direction for a gate. If L1 wants them gone, they should go with a case that says so. |
| C1 `items67` / the tool's `isSep` pipe-inclusive classes | real corpus (61 items / 12 sections) | the *correct* form; P3 copies it into C2 |

## Numbers

- v2 draft: 732 lines, `PASS (56/56)`, `ALL-20-MATCH` (P1 fixtures) / 18/20 (frozen fixtures).
- `v2-slim` (P4): 725 lines, `PASS (56/56)`, `ALL-20-MATCH`.
- `v2-mask` (P4+P5): 734 lines, `PASS (56/56)`, `ALL-20-MATCH`, parser `EQUIVALENCE PASS inputs=43`.
- v1 tool: 382 lines, `PASS (33/33)`, 13/20 mutants (7 known v2 gaps).
- v1 dead-arm probes (conjunct, script/style strip, entity decode, `SPOT_RE` answer arm): each `PASS (33/33)` with
  the identical 7-mutant detail strings (`receipts/mutants.txt`, `receipts/selftests.txt`). Two of them
  (the redundant `/^\s/` conjunct, the `SPOT_RE` arm) are tautology/duplicate in v1 as well; they are moot for the
  deliverable because v2 replaces v1 — listed here so the v1 file is not re-simplified on its way out.

## Limits

- All mutant runs use the *frozen* counter's fixture generator, sliced as text; if the counter is re-frozen with
  P1, re-run `receipts/fxharness.mjs` against the new file (it slices by marker names, not line numbers).
- M5 was not measured live (`--no-live` in every C2 run); P3's patch is outside the live path.
- The entry and the v2 draft are still moving while this pass ran (the entry changed between 12:00 and 12:02).
  The patches target the 12:02 text / the 12:04 tool; both were copied into `receipts/` so a reviewer can diff.
- I did not run the full counters against the lane (no `corpus/routed-ledger.md` and no entry in the lane yet);
  the C2 numbers come from a fixture lane in scratch (`c2fx`, revs `01271b52`, `3037db46`, `4c65789c`).
