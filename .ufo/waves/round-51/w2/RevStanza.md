# RevStanza — round-51 w2: attack on the stanza re-derivation claim (A / C / C2)

Seat: `RevStanza` (reviewer). Lane `kumitate-shokunin`, read-only (this file only).
Assigned attack: the stanza re-derivation claim in `SCORECARD.md`'s `kumitate-proxy-v1`
block, and the enumeration of the frozen `RE_RUNNABLE` walk as the **R51-2 terms-line
evidence**. Also checked: C=23, C2=117/117, H3, and the claim predicates.

Tooling note: no `lsp` device is mounted in this runtime (`read xd://lsp` →
`No such tool: xd://lsp. Mounted devices: ast_edit, debug`). The object under test is a
file-count walk over a git tree, not call/definition structure, so the fallback is direct
execution of the frozen derivation + `git ls-tree`; no semantic-server claim is made.

The lane moved continuously during this review: `7d88faa` → `3304a56`/`efdd742` →
`57333ea` → `fef6707` → `9d11f4e`. Every reading below names its rev. The claim as
assigned was **A=67** (committed at `a476977`…`efdd742`); the final state at `9d11f4e` is
**A=71**.

## Verdict

- **A=67 was exactly correct for committed bytes** at `a476977`…`efdd742`: an exported
  `git archive` tree reads A=67 and
  `PROXY: MATCH (A=67 C=23 … pins=6 match)` exit 0. It was never correct for the live
  checkout, which was already 81 when measured.
- **The declared value then moved twice in three minutes.** `57333ea` (close record) set
  the stanza to **A=81** — a value that exists only in the dirty working tree — so the
  committed tree read `A_DRIFT declared=81 computed=71`; `fef6707` corrected the stanza to
  **A=71** for committed bytes. At `fef6707`, archive → `PROXY: MATCH (A=71 …)` exit 0;
  live checkout → `PROXY: DRIFT (A_DRIFT declared=71 computed=81 delta=+10)` exit 1.
- **Composition of 67** (the value the round's own terms line claims):
  **16 shipped scripts + 51 `.ufo` wave artifacts** = 28 legacy artifacts (rounds 43–50)
  + 23 round-51 (2 frozen probes + 21 wave-1 build files). **Only 1 of 67 is the new
  shipped instrument.** At 71 the four files added by `57333ea` are more
  `build/ExecForgerControl/*.mjs` builders.
- **The SCORECARD terms sentence is factually wrong**: it says "computed A=67 = 44
  shipped/instrument files + 23 round-51 probe files, enumerated in `w2/RevStanza.md`".
  The 44 is `16 scripts + 28 legacy .ufo artifacts`, and only **2** of the 23 round-51
  files are probe files. This report, which it cites, refutes that decomposition.
- **The close evidence contradicts its own claim.** All four close receipts are now
  committed at HEAD `9d11f4e`; none of them supports the SCORECARD's claim set:
  `A51-cd7f69d3.txt` 9/9 but at `cd7f69d`; `D51-cd7f69d3.txt` **DOCTRINE_UNMET 4/5,
  exit=1**; `FINAL-57333ea…txt` **ATTEST_UNMET 8/9** (`A5 MISS pin match; proxy exit=1
  PROXY: DRIFT (declared=81 computed=71)`) with its next line `PROXY: MATCH (A=81 …)`
  taken from the dirty live tree, plus D51 5/5; `FINAL-harm-census.txt`
  **`CHECKLIST: 22/23 pass`, `VERDICT: FAIL`**. At `9d11f4e` both probes read HELD
  (9/9, 5/5) — measured by me — but no receipt binds that rev.
- **C=23 verified** (23 task lines, 0 checked) and item 23 executes and passes.
- **C2=117/117 verified exactly**: 117 README rows, 117 corpus notes, identical path sets.
- **H1's `23/23` is contradicted by the round's own close receipt**: SCORECARD says
  `CHECKLIST: 23/23 pass` exit 0 "at the close commit on the idle host (`close/`)", while
  `close/FINAL-harm-census.txt` reads `CHECKLIST: 22/23 pass`, `VERDICT: FAIL`. My two full
  runs also read 22/23 exit 1 (gate-mutants exit 2 under load); alone at lower load
  `GATE_MUTANTS: CLEAN (frozen=41/41)`. Converges with RevHarm (never 23/23 in three runs)
  and RevChecklist23.
- **H5's declared `R50 8/8` is also not the close reading**: the close records
  `R50 LEDGER_HELD 7/8` and routes a supersession (R52-4). Harmful or not, the declared
  harm rule and the committed reading diverge; the plan text still says 8/8.

## Evidence

### 1. The frozen derivation (reproduced, no re-implementation drift)

`scripts/proxy-check.mjs:495` `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/`; `:682` `walkFiles(root)`
skips only entries named `.git`; `:935` `A = walkFiles(self).filter(RE_RUNNABLE).length`
— over the **checkout**, not a commit.

```
$ node -e '<walkFiles clone: skip .git, RE_RUNNABLE over the checkout>'
A=81
  37 .ufo/waves/round-51     (23 committed + 14 untracked scratch)
  12 .ufo/waves/round-48
   4 .ufo/waves/round-44
   4 .ufo/waves/round-46
   3 .ufo/waves/round-47
   2 .ufo/waves/round-49
   2 .ufo/waves/round-50
   1 .ufo/waves/round-43
  16 scripts/*.mjs
```

Term ledger per commit (`git ls-tree -r --name-only <rev> | grep -cE '\.(mjs|js|sh|py)$'`):

| rev | event | A (committed) |
|---|---|---|
| `c90b9de9` | base / round open | **43** (15 scripts + 28 .ufo) |
| `06ecbf4` | freeze plan + counters A51/D51 | **45** (+2 probes) |
| `1fd8ace`…`8f3c692` | six freeze repairs (counter/text edits) | 45 |
| `a476977` | C1/C2 integration, stanza `A=67` | **67** (+1 script + 21 build) |
| `7d88faa`…`efdd742` | receipts, w2 evidence, w2 reports | 67 |
| `57333ea` | close record, stanza `A=81` | **71** (+4 `build/ExecForgerControl/*.mjs`) |
| `fef6707` | stanza corrected to `A=71` (SCORECARD only) | 71 |
| `9d11f4e` | entry span nit + committed FINAL receipts | 71 |

Plan §"Terms expected to move" declared **A 43 → 44**. The frozen walk reaches 71:
**+28 over base**, of which 1 is the shipped instrument, 2 are the frozen probes, and 25
are build artifacts. Over the declared close it is **+27**, 26 of them scratch.

### 2. The 44 framing is wrong

```
$ git ls-files scripts | grep -cE '\.(mjs|js|sh|py)$'                 → 16
$ git ls-tree -r --name-only HEAD | grep -cE …                         → 71
$ git ls-tree -r --name-only HEAD -- scripts | grep -cE …               → 16
$ git ls-tree -r --name-only HEAD -- .ufo     | grep -cE …               → 55
$ git ls-tree -r --name-only HEAD -- .ufo/waves/round-51 | grep -cE …   → 27
```
Legacy `.ufo`: rounds 43–50 = 1+4+4+3+12+2+2 = **28**. Round-51 = 27 = **2 probes + 25
build files**. The shipped set is 16; the term is 4.4× that set. The 44 in the SCORECARD
sentence is `16 scripts + 28 legacy artifacts`, not "shipped/instrument files"; of the 23
round-51 files the sentence calls "probe files", the two probes are `probe/*.mjs` and 21
are `build/*`.

### 3. Committed tree vs live tree (H3), final state

```
$ d=$(mktemp -d /tmp/mktemp-r51-stanza.XXXXXX); git archive HEAD | tar -x -C "$d"
$ (cd "$d" && find . -type f -regex '.*\.(mjs|js|sh|py)$' | wc -l)
71
$ (cd "$d" && node scripts/proxy-check.mjs --strict); echo exit=$?
PROXY: MATCH (A=71 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88
coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10;
pins=6 match; src-rev=31c465f15669)
exit=0
```
```
$ node scripts/proxy-check.mjs --strict      # lane checkout, live
PROXY  error  A_DRIFT  A: declared=71 computed=81 delta=+10
PROXY: DRIFT (A_DRIFT term=A declared=71 computed=81 delta=+10; src-rev=31c465f15669)
exit=1
```
At the earlier tip (`57333ea`) the same pair read committed 71 vs declared 81
(`delta=+10`, recorded in the FINAL receipt) and live MATCH at 81. The 10 live-only files
are one per copy:
`.ufo/waves/round-51/build/ExecForgerControl/lanes/{honest-baseline,F1-argv-hashing-forger,
C1-identical-nonce-distinct-bytes,C2-distinct-nonce-static-stub,C3-filename-keyed-stub}/
scripts/{proxy-check,receipt-attest}.mjs`.

Mechanism, verified: each `lanes/<name>/` is a **nested git repository** (five `.git`
dirs). `walkFiles` skips the `.git` entry and walks everything else, so the copies count;
`git status --porcelain -uall | grep -E '\.(mjs|js|sh|py)$'` reports only **4** files
(the top-level builders, now committed), because nested repositories collapse to one
directory entry. A "tree is clean" check based on `git status` is off by 10, and
`PROXY: MATCH` can be earned by leaving them in place.

Historical note: at `3304a56:efdd742` the committed walk was 67 and the live walk 81, same
mechanism (`+14` = 4 builders + 10 lane copies). Seat RevHarm records the same live
A=81/A_DRIFT (`w2/RevHarm.md:24,99`); this report adds the exact composition and the
nested-repo mechanism. The scratch also violates the wave-2 bounds ("no file with a
runnable extension under the lane tree") independently of who deletes it.

### 4. C=23

```
$ grep -cE '^[[:space:]]*- \[' SKILL.md           → 23
$ grep -cE '^[[:space:]]*- \[ \]' SKILL.md        → 23
$ grep -cE '^[[:space:]]*- \[[xX]\]' SKILL.md     → 0
```
Item 23 is `SKILL.md:709` (`node scripts/receipt-attest.mjs --selftest` → exit 0 +
`ATTEST_SELFTEST: PASS`). In both full checklist runs it executed and passed:
`CHECKLIST PASS SKILL.md:709 exit=0 expected=0 substring=hit wall=1.512 — Receipt-attest
hermetic suite`. No checked-item masking is live (0 checked). Structural note: `C` counts
checked items too (`RE_CHECKLIST = /^\s*- \[/`), so C=23 alone cannot prove 23 executed
items (CritHarm).

### 5. C2=117/117

```
$ grep -cE '^\| `(knowledge|lessons)/' corpus/README.md            → 117
$ find corpus/knowledge corpus/lessons -name '*.md' -type f | wc -l → 117
$ diff <(README row paths) <(corpus note paths)                     → (empty)
```
Exact set equality, not just equal counts; `PROXY: MATCH` corroborates.

### 6. Claim predicates and close evidence

```
$ sha256sum scripts/receipt-attest.mjs
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
   == pin.receipt-attest (SCORECARD.md:322)
$ node .ufo/waves/round-51/probe/attest51-probe.mjs "$PWD" HEAD      # fef6707
ATTEST51: ATTEST_HELD held=9/9 … rev=HEAD rule=A51 version=v3 | all nine PASS   (exit 0)
$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs "$PWD" HEAD
DOCTRINE51: DOCTRINE_HELD held=5/5 … rev=HEAD rule=D51 | D1..D5 PASS             (exit 0)
$ ls .ufo/waves/round-51/close/         # committed at HEAD
A51-cd7f69d3.txt   D51-cd7f69d3.txt
$ cat .ufo/waves/round-51/close/D51-cd7f69d3.txt
DOCTRINE51: DOCTRINE_UNMET held=4/5 … D2 MISS clauses=12 bound=2 … exit=1
```
The final receipts (committed at `cb6c472`/`9d11f4e`):
```
# close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt
ATTEST51: ATTEST_UNMET held=8/9 … rev=57333ea | … A5 MISS pin match; proxy exit=1
  PROXY: DRIFT (A_DRIFT term=A declared=81 computed=71 …)
DOCTRINE51: DOCTRINE_HELD held=5/5 … rev=57333ea | D1..D5 PASS
PROXY: MATCH (A=81 C=23 …)                    ← the dirty live tree
# close/FINAL-harm-census.txt
CHECKLIST: 22/23 pass
VERDICT: FAIL
census=0
```
So the committed evidence set binds neither claim at a rev where the other close
conditions also hold: `cd7f69d` gives A51 held / D51 UNMET; `57333ea` gives D51 held /
A51 UNMET; the H1 receipt is FAIL. At HEAD `9d11f4e` both probes read HELD (9/9, 5/5) but
no committed receipt names that rev.

### 7. H1 observation (own runs, high wave load)

```
$ node scripts/surface-probe.mjs --checklists            # load1 8.5, then 5.9
CHECKLIST  FAIL SKILL.md:704 exit=2 expected=0 substring=miss wall=70.217 — Gate-mutants battery …
  | MUTANT cite-check:exit2-zerores unstable … confirm=differs
CHECKLIST_SKIPPED: 0
CHECKLIST: 22/23 pass
VERDICT: FAIL                                             exit=1
$ node scripts/gate-mutants.mjs                           # alone, lower load
GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 …)   exit=0
```
Both full runs 22/23 exit 1; failing item is the gate-mutants battery (exit 2 =
environment fault by its own map) on an unstable cite-check mutant. Item 23 passes.
The declared `CHECKLIST: 23/23 pass` (SCORECARD round-51 section) has no committed
transcript behind it; the one committed rerun reads 22/23 FAIL.

## Proposed R51-2 terms line (declared vs computed, with revs) — corrected

> **Terms.** A 43 (base `c90b9de9`: 15 scripts + 28 legacy `.ufo` artifacts) →
> 45 (`06ecbf4`: two frozen probes) → 67 (`a476977`: +1 shipped instrument
> `scripts/receipt-attest.mjs`, +21 wave-1 build artifacts) → 71 (`57333ea`: +4 committed
> `build/ExecForgerControl/*.mjs` builders). Declared close 44, computed 71, delta +27
> over declaration = 1 instrument + 2 probes + 24 build artifacts. Shipped instruments
> alone are 16 (`git ls-files scripts | grep -cE '\.(mjs|js|sh|py)$'`); 55/71 of A is
> `.ufo` wave scratch. C 22 → 23 (`a476977`: checklist item 23). C2 114/114 → 117/117
> (`a476977` + round-50 spot-check row; README rows == corpus notes). Operability holds 9
> for A ∈ {44, 67, 71, 81} (`f_O` 0.957…0.966). H3 is `PROXY: MATCH` only on an exported
> commit tree; the live checkout additionally counts untracked wave-2 scratch (A=81 →
> `A_DRIFT`). Every close claim receipt must name the rev it was run against.

## Findings by severity

- **HIGH — the committed close evidence does not bind either predicate at the close rev.**
  `A51-cd7f69d3.txt` is 9/9 at `cd7f69d` (where `D51-cd7f69d3.txt` is UNMET 4/5);
  `FINAL-57333ea…txt` is **ATTEST_UNMET 8/9** (A5 MISS because the stanza then declared 81
  while the commit computed 71) with D51 5/5, and its `PROXY: MATCH (A=81)` line is the
  dirty tree — a claim arm passing on untracked scratch. At HEAD `9d11f4e` both probes read
  HELD (9/9, 5/5) but no receipt names that rev. Fix: commit A51 and D51 receipts at the
  final close rev, and retire the stale `cd7f69d` pair so a reader cannot take it as the
  close reading.
- **HIGH — the SCORECARD terms sentence misstates the composition and cites this report.**
  "A=67 = 44 shipped/instrument files + 23 round-51 probe files" is wrong on both terms:
  67 = 16 shipped + 28 legacy wave artifacts + 23 round-51 (2 probes, 21 build), and A is
  now 71. Replace with the corrected terms line above.
- **HIGH — H3 is red in the live tree and the drift is invisible to `git status`.**
  `PROXY: DRIFT (A_DRIFT declared=71 computed=81 delta=+10)` exit 1. The 10 files sit in
  five nested git repos under `build/ExecForgerControl/lanes/`; `walkFiles` skips only
  `.git`, while `git status -uall` collapses each nested repo. Deleting the 4 top-level
  builders is not enough. Measure H3 on an exported commit tree, or remove the directory —
  and never let a `PROXY: MATCH` line from the dirty tree stand as close evidence.
- **HIGH (convergent, not mine alone) — H1's `23/23` is contradicted by the round's own
  close receipt.** `close/FINAL-harm-census.txt` reads `CHECKLIST: 22/23 pass`,
  `VERDICT: FAIL`, while SCORECARD claims 23/23 exit 0 "at the close commit on the idle
  host (`close/`)". My two runs read 22/23 FAIL; gate-mutants alone reads CLEAN 41/41, so
  the item is load sensitivity, but the declared value is not the committed measurement
  (also RevHarm.md:30, RevChecklist23.md:86).
- **MED — A double-counts one implementation.** `build/ExecInstrument/receipt-attest.mjs`
  is byte-identical to `scripts/receipt-attest.mjs` (sha256 `4491976…`), with four more
  copies/variants (`ExecSelftestArms/scratch`, `ExecSelftestExec`,
  `LabratM2Replay/scratch-receipt-attest`, `MutInstrument/reference-receipt-attest`).
  5 of the 27 round-51 entries are one instrument; A counts files, not capabilities.
- **MED — definition vs stanza mismatch.** `SCORECARD.md:25` defines A as files "with a
  documented invocation that exits with a verdict"; the frozen term is an extension count.
  The round-45 note (`SCORECARD.md:364-370`) reconciles this in prose, but its own
  shipped-only command now reads 16 vs 71, and the round-51 increment (43 → 71, +65%) is
  almost entirely scratch.
- **MED — the term is a moving target with no ledger.** A moved 43 → 45 → 67 → 81 → 71
  inside one round, twice pinned to a working-tree value (`57333ea` A=81; the final
  receipt's MATCH line). Only committed-tree measurement is stable; the round record should
  state the term at a named rev and stop re-deriving it from the checkout.
- **LOW — C's regex admits checked items.** `RE_CHECKLIST = /^\s*- \[/` counts `- [x]`;
  the tree has 0 checked, so C=23 is currently sound. H1 is item-count, not identity.
- **LOW/INFO — H1 load sensitivity.** gate-mutants exit 2 under load on an unstable
  cite-check mutant; CLEAN alone. A quiesced close rerun is required before declaring H1.

## Residual risk and gaps

- The lane tip moved through seven revs during this review; the live-tree readings (A=81,
  H3 DRIFT, checklist 22/23) are snapshots and can change if the scratch owner deletes its
  files. Committed readings are pinned to `9d11f4e` (A=71, archive MATCH, both probes HELD).
- I verified `pin.receipt-attest` by sha equality and the probes' A5 PASS; I did not
  re-derive the other nine gate pins. H2/H4/H5 were outside this assignment.
- `DOCTRINE_HELD 5/5` at HEAD was measured through the frozen probe (`git archive` of the
  rev); I did not independently audit the 13 receipt bindings (other w2 seats own D2).
- Unrun check: I did not run a quiesced `--checklists`, so H1's close value is unverified
  here; the observed FAIL is load-correlated, not shown to be a tree defect.
