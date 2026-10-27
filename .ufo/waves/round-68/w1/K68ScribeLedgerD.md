VERDICT: Twelve paste-ready ledger rows (round 64's 5 items, round 65's 7) are drafted and mechanically verified — the committed v1 tool reads `ROUTED_LEDGER: CLEAN … items=12 rows=12 open=6 closed=5 wontfix=1` exit 0 on the slice, every closed/wontfix answer quote sits at its exact named line, and six items are recorded `open` because their named work is still unlanded at the round-68 freeze.

## Evidence

Lane read at `39f61816d4ee7a8d401df42c1818c91a9c537bce` (round-68 freeze; base `d23892ad`, `git merge-base --is-ancestor d23892ad HEAD` → exit 0; `git status --porcelain` shows only `.ufo/waves/round-68/` wave output). Nothing written outside `.ufo/waves/round-68/build/K68ScribeLedgerD/` and this report; scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerD` deleted.

Item ordinals come from the frozen counter's `items67()` (verbatim copy in scratch) and the committed tool's `routedItems()` — both agree:

```
items: r64=5 r65=7
tool routedItems: r64=5 r65=7
rows parsed: 12 all 7-cell
```

Slice verdict — committed v1 tool (`scripts/routed-ledger.mjs`, worktree mode, minimal scratch tree
`--from 64 --to 65 --classes`):

```
CLASS reference-drift rows=3 rounds=64,65        CLASS registry-home rows=2 rounds=65
CLASS carried-unaddressed rows=2 rounds=64       CLASS report-fidelity rows=1 rounds=65
CLASS citation-integrity rows=1 rounds=65        CLASS verification-gap rows=1 rounds=64
CLASS dangling-pointer rows=1 rounds=64          CLASS wave-shape rows=1 rounds=65
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=12 rows=12 open=6 closed=5 wontfix=1
EXIT=0
```

Independent L3 replica (word-boundary, in-section uniqueness, id↔round, one non-open row per item, **exact-line**
answer quote): all twelve rows pass; the only red line is the union-only clause:

```
ok R64-D1 closed .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3
ok R64-D2 closed corpus/README.md:192
ok R65-D1 closed .ufo/waves/round-66/d1-gate-correction.md:11
ok R65-D4 wontfix corpus/lessons/round-65.md:158
ok R65-D5 closed .ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19
ok R65-D7 closed corpus/README.md:195
L3-REPLICA: FAIL 1 no-class-spans-4-rounds
```

That clause is satisfiable only by the union: on the canonical slugs (round-66 seat `K66ScribeClasses`, 57 rows over
rounds 55–65) `reference-drift` spans 7 rounds (56, 58, 60, 61, 63, 64, 65), `carried-unaddressed` 6,
`dispatch-accounting` 5, and four classes span 4. My twelve rows carry that table's slug for the same item, so the
union reaches the span; a 2-round slice cannot, and re-slugging by a sibling seat would break it.

Independent cross-check — peer seat `K68ScribeLedgerC`'s `reanchor.mjs` (read-only, different parser) re-derives all
six non-open answers at their cited lines: `OK R64-D1 …:3`, `OK R64-D2 corpus/README.md:192`, `OK R65-D1 …:11`,
`OK R65-D4 corpus/lessons/round-65.md:158`, `OK R65-D5 …:19`, `OK R65-D7 corpus/README.md:195`; its one
`BADFORMAT id` line is that helper mis-reading the table header, not a row (its only skip is `c[5] === 'open'`; that
seat has since fixed the header/separator case and re-ran CLEAN — the `EXIT=0` in my piped run was `tail`'s).

Provenance of the closed answers (all tracked at HEAD):

```
$ git log --format='%h %s' -1 -- .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt
2ca91a0c round-65: freeze — plan, counters H65/O65 with pins, 16 controls, base receipts, …
$ git diff --stat a004902d77d17741b807069fa2bd9ce2e310e424 47fe2383151909d31557ada118ad84f90404dc6c -- scripts/report-receipt-diff.mjs
(empty — the tool is identical at round 64's after-hash and round 65's base)
$ sed -n '3p' .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt
REPORT_RECEIPT_SELFTEST: PASS (125/125)
$ git log --format='%h %s' -1 -- .ufo/waves/round-66/d1-gate-correction.md
6c79d68c round-66: capture opened sources and record r65 D1 correction evidence
$ git log --format='%h %s' -1 -- .ufo/waves/round-66/w1/K66ExecCiteCheckD5.md
a3d76c03 round-66 w1: seat outputs and build artifacts (salvage after honest-stop report)
```

Open-row reproductions (full table in `answers-evidence.md` §2):

```
$ ls .ufo/waves/round-64/close/supplementary-c2.txt      -> No such file or directory (exit 2)
$ grep -c 're-deriv' /home/vgpnk/Projects/shokunin/.ufo/reports/round-64/kumitate.md -> 0
$ SCORECARD.md ## Capabilities scan -> capat [1776] rows 19 harm-matrix in first cell: []
$ grep -c 'harm-matrix\|omp-binary-probe' SKILL.md -> 0 (exit 1)
$ grep -oE '\*\*Q[0-9]+' corpus/QUALITY.md | sort -t Q -k2 -n | tail -1 -> **Q61
$ ls scripts/class-recurrences.sh -> No such file or directory
$ sed -n '17p' .ufo/waves/round-66/w1-dispatch.json -> "spawn": 66,   (no w2* under round-66)
```

## Findings

**K68ScribeLedgerD-1 (medium) — the plan's own count sentence mis-splits the 61 it declares; the counter is right.**
Plan §C1 says the 61 items are "rounds 55..65's 58 plus round 66's D1–D3". The frozen counter's fence-aware parser
reads **57** items over 55..65 (3,4,4,8,0,9,6,5,6,5,7) and **4** in round 66 (D1–D3 + the operator note). Total 61
either way, so L2's `items=` binding is unaffected; the prose is wrong and a reader auditing L2 will trip on it.
Reproduce: `grep '^### round' .ufo/waves/round-68/build/K68ScribeLedgerD/item-census.txt` (the frozen counter's
`items67()` over rounds 55–66). Strengthening ratchet for the L1: correct the sentence, never the counter.

**K68ScribeLedgerD-2 (low) — the seat blurb routes defects the file does not contain.**
The dispatch text says "Round 64: D1–D7 (jj forge limits, kimi-layer degradation D4, incident note)"; the routed
section has **five** items (D1–D5), and no item is about "jj forge limits" (that is `CHANGES-AFTER-FREEZE.md` prose).
Reproduce: `awk '/^--- 64#/{p=1} p' item-census.txt`. Attacks the wave spec, not the claim; my rows follow the
counter's ordinals.

**K68ScribeLedgerD-3 (low) — R65-D1's correction is committed, but not where the item named it.**
The item asks for "an appended correction in the round-66 lesson". The per-row S204–S206 Gate record (URL, date,
≤25-word quote, capture sha256/bytes) landed at `.ufo/waves/round-66/d1-gate-correction.md` and that file says
"does not edit the round-65 lesson"; `corpus/lessons/round-66.md` carries no correction. The row is `closed` on the
substance and this divergence is named, not hidden. Reproduce: `sed -n '3,11p' .ufo/waves/round-66/d1-gate-correction.md`;
`grep -c 'S205' corpus/lessons/round-66.md` → 0.

**K68ScribeLedgerD-4 (medium) — round 65's `registry-home` items are still unlanded, so the ledger carries 6 open rows.**
`SCORECARD.md` `## Capabilities` has 19 data rows and none whose first cell is `harm-matrix`; `SKILL.md` has zero
`harm-matrix`/`omp-binary-probe` occurrences and no pins; `QUALITY.md` ends at Q61 and `scripts/class-recurrences.sh`
does not exist. Marking these `closed` (as the round-66 draft did on drafted row text) would record closures the
lane's own L6-style test contradicts. Reproduce: the four commands in § Evidence. Flip instructions are in
`rows.md` § Integrator notes.

**K68ScribeLedgerD-5 (low) — the routed text's own number is stale by one; the row does not quote it.**
`corpus/lessons/round-65-verifier-spotcheck.md:74` says `A +103`; the committed round-66 base receipt reads
`delta=+104`. My `R65-D4` answer quotes the disposition line (`carried, not harmed`), never the delta.
Reproduce: `sed -n '8p' .ufo/waves/round-66/base/proxy-before.txt` → `PROXY: DRIFT (A_DRIFT term=A declared=351 computed=455 delta=+104; …)`.

**K68ScribeLedgerD-6 (note, durability) — the prior draft's closures would not survive the drafted homes.**
`.ufo/waves/round-66/build/K66ScribeLedger65/rows.md` marks R65-D1/D2/D3/D6 `closed`; D2/D3 close on the seat's own
`answers.md` while their home (`SCORECARD`/`SKILL`) never landed, and D6 closes on a 66-seat spawn that answers only
the band half (no falsify wave ever ran). I re-anchored D1/D5 to committed receipts, kept D4 `wontfix` on the lesson's
own disposition, and flipped D2/D3/D6 to `open`. Reproduce: `sed -n '8,15p' .ufo/waves/round-66/build/K66ScribeLedger65/rows.md`;
`ls .ufo/waves/round-66/` → `w1` only.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeLedgerD/rows.md` — the 12 paste-ready rows + integrator notes (classes,
  statuses, six flip conditions, id uniqueness).
- `.ufo/waves/round-68/build/K68ScribeLedgerD/answers-evidence.md` — row-by-row answers with reproductions, the
  open-item table, the class-span table, the validator transcript, limits.
- `.ufo/waves/round-68/build/K68ScribeLedgerD/validate.mjs` — L3 replica + scratch-tree tool runner.
- `.ufo/waves/round-68/build/K68ScribeLedgerD/validate.out`, `item-census.txt` — the transcripts cited above.
- `.ufo/waves/round-68/w1/K68ScribeLedgerD.md` — this report.

## Limits

- The replica ran over the worktree, not `git archive M`; the counter's `--rev` read path and its
  extraction/`EXTRACTION_UNSAFE` arms are unexercised by me.
- No registry gate was run (readme-map, proxy-check, sources-check, census); the `open`/`wontfix` statuses rest on
  file/line reads and the committed receipts named above, not on a gate exit.
- Whether an answer truly answers its item is the non-author closure's judgment (plan §C1 stated limit); I guarantee
  only located, unique, exact-line quotes and an explicit missing-work statement on every `open`.
- `R65-D5`'s answer quotes one file's delta line; the full attribution is on adjacent lines of the same committed
  report, and the measured patch was not applied.
- Tooling: nothing installed or upgraded this seat.
