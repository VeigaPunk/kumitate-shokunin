VERDICT: LEDGER66 forged — the frozen counter scores `held=6/6` on a clone whose only change is 76 auto-generated data lines (mechanical ledger rows, content-free round-65 "answers", sprayed classes, 3 registry rows) with the freeze tool byte-identical and no item answered honestly.

## Evidence

Sandbox clone of the lane (`git clone --shared`), checked out at the freeze `621212bac37f8249c72ac982d1d6534cb8d60701`; all git writes inside the clone; clone deleted after receipts were copied.

Forge commit (clone-only): `0d88a9292490c3646b095b7425581e06474392cc` — 5 files, +76 lines (`SCORECARD.md` +1, `SKILL.md` +2, `corpus/QUALITY.md` +2, `corpus/r65-answers.md` +8, `corpus/routed-ledger.md` +63). `scripts/routed-ledger.mjs` untouched: `sha256sum` = `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`, identical to the freeze receipt line in `base/ledger66-donothing.txt`.

Counter runs against the clone (three seeds):
```
$ node .ufo/waves/round-66/probe/ledger66-probe.mjs <clone> 0d88a9292490c3646b095b7425581e06474392cc --seed cafebabe01234567
LEDGER66_HELD held=6/6 checks=6 rev=0d88a9292490c3646b095b7425581e06474392cc rule=L66 seed=cafebabe01234567   (exit 0)
LEDGER66_HELD held=6/6 ... seed=6db9f7f28b174155   (exit 0)
LEDGER66_HELD held=6/6 ... seed=deadbeef99          (exit 0)
```
Tool's own L2 verdict on the forged lane:
```
CLASS reference-drift rows=4 rounds=55,57,60,62   /   RECURRENT reference-drift rounds=4
ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=57 rows=57 open=50 closed=7 wontfix=0   (exit 0)
```
Theater proof — every round-65 "answer" is a 5-word pool sentence unrelated to the item (build/K66CriticForgeL66/forged-r65-answers.md):
`R65-D1 answer: frozen located frozen line forge` … `R65-D7 answer: frozen located frozen row forge`, cited as `` `corpus/r65-answers.md:2..8` — "..." ``; `git show 8d557f85...:corpus/r65-answers.md` → `fatal: path ... exists on disk, but not in '8d557f85312de4fcc82e09ff735d21436bc3746d'` (new-since-base clause trivially satisfied by a new file).

Why the committed `autoledger` control failed but this passes (same approach, one mechanical fix): its quote extractor replaced `` ` `` with a space while `norm()` deletes it, so on R61-V6 (`dead seat \`Audit19\`.`) and R65-D4 (`(\`PROXY: DRIFT\` A`) the quote `Audit19 .` / `( PROXY` is not a substring of the item's `Audit19.` / `(PROXY` — `QUOTE_ABSENT` on 2/57 rows (reproduced verbatim, receipt `base/ledger66-autoledger.txt`). The forge slices its quote from the post-`norm()` item text itself (first contiguous clean run ≤ 25 words), so inclusion holds by construction under both the tool's `routedItems` and the counter's independently written `items66` (forge asserts both before writing).

## Findings

1. **K66CriticForgeL66-1 (severity: high; attacks L3's round-65 clause + L2).** `answered-this-round` is satisfied by ANY line in ANY new file. The 7 required answers are self-quoting random-word sentences in a brand-new `corpus/r65-answers.md`; L3 checks location (±2 lines) and base-absence, never adequacy — exactly the plan's stated limit, demonstrated at full predicate scale, not just in principle. Smallest safe correction (ratchet): require the answer's target file to exist at the round base (answer must amend a pre-existing artifact), which closes the new-file theater while still allowing honest appends; residual in-place theater then needs the non-author closure's judgment — a limit, not closable by binding checks.
2. **K66CriticForgeL66-2 (severity: medium; attacks L3's class clauses).** `>= 5 classes` / `one class spans >= 4 rounds` pass with zero analysis: one row per round gets sprayed class `reference-drift` (rounds 55,57,60,62), the rest are mechanical `c<round>`; the tool's `--classes` prints `RECURRENT reference-drift rounds=4` from labels alone. Class strings are self-declared; counting cannot judge them. Limit of the frozen counter (same family as finding 1); no honest ratchet short of human review.
3. **K66CriticForgeL66-3 (severity: medium; attacks L2/L3 row semantics).** The mechanical ledger (57 rows, one per item, quotes that include the literal `- D1 -` list markers — see forged-routed-ledger.md) is indistinguishable from curated rows: the counter binds quotes to items, never provenance or curation. The `autoledger` control's 4/6 shows only a 2-row generator defect stood between the declared do-nothing control and a pass. Limit (bindings not provenance), declared in the plan.
4. **K66CriticForgeL66-4 (severity: low; attacks L4/L5 design, analyzed not run).** L4's fixtures are grammar-marked (`w<6-hex>` tokens, two fixed spot-check names, `notes/a.md`); a stub that reads `--root` bytes and computes the per-mutant verdict would pass L4 and L5 (the two shipped stubs are only always-clean/always-drift). Cheapest forge does not need it — the freeze tool passes L4 as-is — but the counter cannot distinguish a fixture-computing stub from a general tool on this grammar. Limit of any held-out-fixture harness; not closable without real spot-checks as fixtures.
5. **K66CriticForgeL66-5 (severity: low; maintenance risk observed while forging).** The tool (`routedItems`) and the counter (`items66`) are two hand-maintained copies of "the same declared rule". The forge asserts every quote against both; they agreed on all 57 items this round, but a future drift would let a row pass L2 and fail L3 (or vice versa) with no single source of truth. Not a forgery hole; a ratchet candidate is one shared parser pinned for both.

Cost accounting for "cheapest": delta over the 4/6 `donothing` control = 57 rows + 7-line answers file + 3 registry lines; delta over the 4/6 `autoledger` control = quote run-slicing + 7 closed R65 rows pointing at a new file + 4 sprayed class labels. Generator: ~110 lines of Node, seconds to run; no tool edit, no spot-check edit, no axis touched.

## Artifacts

- `build/K66CriticForgeL66/forge-routed-ledger.mjs` — the forgery reproducer (run: `node forge-routed-ledger.mjs <clone-at-freeze>`; commits nothing; includes the counter's `items66` verbatim for double-parse assertion).
- `build/K66CriticForgeL66/forged-routed-ledger.md`, `forged-r65-answers.md` — the committed forged data.
- `build/K66CriticForgeL66/counter-forge.txt` — all three `LEDGER66_HELD held=6/6` verdict lines with seeds.
- `build/K66CriticForgeL66/forge-commit.txt` — `git show --stat` of the forge commit.

## Limits

- The smart-stub L4 bypass (finding 4) was analyzed, not executed; the cheapest forge used the untouched freeze tool.
- Only the C1/L66 counter was forged (seat scope); C2/M66 untouched.
- One clone, three counter seeds; L4's 14 mutants re-ran fresh each time (seeded fixtures), so the pass is not seed-luck.
- No lane/fleet file was edited; the frozen counter, plan, controls, and receipts were read-only throughout (copied to scratch, attacked there).
