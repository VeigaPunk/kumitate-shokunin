# Round 61 — claim-freeze verdict (RevClaimFreeze, wave w1)

**Verdict: FREEZE REJECTED — not admissible as frozen.**
C2 (`DOCTRINE61_HELD`) is unreachable by construction (max 3/6); the C1 before
receipts were rewritten after the freeze commit and one detail line is
unreproducible; the C1 target is reachable without a dispatch. Details below,
ordered by severity, each with a reproduction.

Scope of this review: the frozen definitions only — `.ufo/waves/round-61/plan.md`,
`probe/*.mjs`, `controls/*.txt`, `base/*.txt` at HEAD vs `c2721f81`/`165b8304`.
No lane file was edited; all fixtures are under `/tmp/kumitate-r61/RevClaimFreeze/`.

---

## BLOCKER 1 — C2's counter cannot reach its own target (E3 and E4 are dead; E5 fails under the documented command)

`.ufo/waves/round-61/probe/doctrine61-probe.mjs` locates the S195 row twice with
`/^\|[[:space:]]*S195[[:space:]]*\|/` (lines 17 and 21). **JavaScript has no POSIX
character classes**: `[[:space:]]` parses as the class `{[ : s p a c e}` followed by a
literal `]`, so the pattern matches no row of `corpus/SOURCES.md`.

Reproduced (all four real row shapes → `false`):

```
$ node -e 'const re=/^\|[[:space:]]*S195[[:space:]]*\|/;
  for (const l of ["| S195 | x |","|S195|x|","|  S195  | x |","|\tS195\t| x |"])
    console.log(JSON.stringify(l),"->",re.test(l));'
"| S195 | x |" -> false      "|S195|x|" -> false
"|  S195  | x |" -> false    "|\tS195\t| x |" -> false
```

Consequence 1: E4's `pin` is always `''` → `E4` MISS for every input.
Consequence 2: E3 prints the label `row-absent` **for rows that are present** — the
receipt label does not describe the predicate it claims to evaluate.

Consequence 3 (independent, second defect): even with a whitespace-matching regex,
**E3's column indices are shifted by one**. `c[1]` is the id cell (the leading `|`
produces `c[0]=''`), so status/opened/used-by are `c[8]/c[9]/c[11]`; the probe reads
`c[9]==='mined'`, `c[10]==='2026-10-25'`, `c[12]===entry`.

```
$ # real row at c2721f81, split('|').map(trim)
NF= 13
c[8]= "mined"  c[9]= "2026-10-19"  c[10]= "on-release"  c[11]= "corpus/knowledge/omp-task-contract.md"  c[12]= ""
probe E3 as-coded: c[9]===mined -> false | c[10]===2026-10-25 -> false | c[12]===usedby -> false
```

A 12-cell row shaped to satisfy the shifted indices has NF=14 ≠ 13 and is
`E01 malformed row` under `sources-census.sh validate` — so E5 then fails. E3 has no
satisfying input.

Reproduced end-to-end on a fixture with a contract-valid 11-cell `mined` row,
`verified-at: 2026-10-25`, `used-by` exact, and a capture carrying the pin
(`/tmp/kumitate-r61/RevClaimFreeze/fx2`):

```
frozen probe:            DOCTRINE61_UNMET held=2/6   | E1 PASS E2 PASS E3 MISS(row-absent) E4 MISS(pin=) E5 MISS(exit=2) E6 MISS
same probe, [[:space:]]→\s: DOCTRINE61_UNMET held=3/6 | E1 PASS E2 PASS E3 MISS(status=2026-10-25 opened=90d used-by=) E4 PASS E5 MISS(exit=2) E6 MISS
```

Consequence 4: **E5 is unreachable through the documented counting command.** The
predicate sentence names `--root /home/vgpnk/Projects/shokunin kumitate`; the probe
defaults `censusRoot` to the lane itself and the plan's counting command passes no
`--census-root`:

```
$ sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate              -> exit 0  (6× W04, ok)
$ sources-census.sh validate --root /home/vgpnk/Projects/shokunin/kumitate-shokunin kumitate
  ERROR: config not found: …/kumitate-shokunin/shokunin.conf
  ERROR: unknown lane (not a dir, not in conf or root): kumitate                        -> exit 2
```

So the closure rerun of `node .ufo/waves/round-61/probe/doctrine61-probe.mjs <lane> <rev>`
yields E3, E4 and E5 MISS unconditionally. `DOCTRINE61_HELD` is unattainable; the
best possible reading is `held=3/6`. **C2 cannot be claimed as frozen.**

Corroboration: seat `ScribeSourcesRows` (`.ufo/waves/round-61/w1/ScribeSourcesRows.md:98-114`)
found the same regex and index defects independently during the build. Both claims hold.

## BLOCKER 2 — the base receipts were rewritten after the freeze; one detail line is unreproducible

`48877b4` ("freeze claims, counters, controls and validated wave plan") rewrote
`base/dispatch61-base-probe.txt` and `base/doctrine61-base.txt`:

```
-== C1 probe at base ==
-DISPATCH61: … held=1/4 … rev=165b83044d33cbd52fc2209aefe57edfd7e6590a rule=P61
+== C1 frozen probe at base c2721f81 ==
+DISPATCH61: … held=1/4 … rev=c2721f812cebd97ab67a1dd8cd8492a193f82d42 rule=P61
- | P3 MISS | `dispatch-evidence` | Read a round's **actual** dispatch record and judge it: …
+ | P3 MISS row-absent
```

Two separate problems:

1. The measured revision label was changed from `165b8304` (the actual measurement
   commit, the parent that landed round-60 close work) to `c2721f81` (the freeze
   commit that *contains* the probes, plan and receipts). A "before" state cannot be
   the commit that already carries the instrument.
2. `row-absent` is **not a line the counter can print** at either revision. At
   `c2721f81` the row is present inside `## Capabilities` (SCORECARD.md:1794):

```
$ # exact P3 expression, rev=c2721f81
git status: 0 stdout bytes: 294155
P3 row found: true
P3 pass would be: false
row head: | `dispatch-evidence` | Read a round's **actual** dispatch record …
```

The pre-rewrite receipt at `c2721f81` shows the row text (the truthful detail); the
current file shows `row-absent`. The verdict (MISS) is unchanged, the evidence line
was fabricated. That is a receipt edit, not a measurement.

## HIGH 1 — the frozen plan relabels the base revision

`plan.md` was rewritten in the same commit: `Base: 165b8304…` → `Base revision:
c2721f81…`, and both "Before (measured at base …)" headers followed. The plan now
asserts before-values were measured at `c2721f81`; they were measured at `165b8304`
and relabelled. `165b8304` *is* an ancestor of `c2721f81` (`git merge-base --is-ancestor`
→ yes), so the relabel is not a different tree for the claimed artifacts, but the
sentence "measured at base c2721f81" is false as a matter of record and cannot be
re-derived.

## HIGH 2 — C1's P3 sentence is false-by-record and its code is satisfiable cosmetically

- The `dispatch-evidence` row **already exists at the base commit** with
  `First-working round = 60` (`git show c2721f81:SCORECARD.md | sed -n 1794p`, cell 5
  = `60`). The plan's P3 requires "a row whose evidence pointer names round 61
  (first-working round 61)" — that requires rewriting a provenance cell from 60 → 61.
  The plan does not disclose that P3 is a rewrite of an existing row rather than an
  append, and `AXES.md` §Capabilities defines the cell as the round that demonstrated
  the capability running (the gate's selftest is `PASS (8/8)` at base).
- The code does not check the cell at all: `P3 = !!row && /round 61/.test(row)` —
  any occurrence of the substring `round 61` anywhere in the row (the evidence cell
  suffices) turns P3 PASS with zero capability acquisition. Predicate sentence and
  counter disagree, and the code's arm is reachable by a label edit.

## HIGH 3 — C1's target is reachable without a dispatch (no committed control covers it)

The committed controls cover two shapes: no progress file (→ `FAIL-CLOSED
progress-absent`, exit 2) and null sessions (→ `NOT_A_DISPATCH`, exit 1). Both are
real gate runs and both fail closed — **the C1 controls themselves are sound**. But a
third shape reaches the exact target:

```
$ # /tmp/kumitate-r61/RevClaimFreeze/fab — 32 fabricated rows, session=sess-N, exit=0,
$ # 32 fabricated non-empty reports, a matching dispatch-actual.json with non-null agentIds
$ node scripts/dispatch-evidence.mjs --root <fab> --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

`NOT_A_DISPATCH` fires only when *every* `agentId` is null, and the gate has no
binding to the launcher. So P2's CLEAN is a record-consistency verdict, not evidence
that 32 seats ran; a record that skips the claimed work reaches the target. The plan's
sentence ("the real round-61 wave gate", "Read a round's actual dispatch record") is
stronger than the instrument. This is a limit to disclose or control, not a bug in the
gate's own contract.

## MEDIUM 1 — C2's control is not a counter run and cannot discriminate

`controls/ctl-c2-unopened-row.txt` is a hand-written text (no generator in the repo;
unchanged since `c2721f81`):

```
== C2 control: unopened fake row cannot pass E4 (sha pin) ==
row pin: (none)
capture sha: (absent)
E4 PASS: false
exit=0
```

It never executes `doctrine61-probe.mjs`, it tests only E4 (not E3 as the plan
states), and it exits 0. Because E4 is permanently MISS (BLOCKER 1), the same output
is produced for a *correct* row — the control cannot separate "rejects an unopened
row" from "rejects every row". The plan's C2 control claim is therefore unproven.

## MEDIUM 2 — four checks are bound to the worktree, not to the measured revision

| Check | Plan sentence | Code |
|---|---|---|
| C1 P2 (gate half) | "the committed revision carries …" | `spawnSync(node, … --root lane …)` — reads the working tree; only the `git ls-tree` half is rev-bound |
| C1 P4 | "exists at the measured revision and contains the same CLEAN line" | `readFileSync(join(lane, …/close/dispatch61-tip.txt))` — worktree only |
| C2 E4 | "the opened-source capture exists at … and its sha256 equals the pin" | `readFileSync(join(lane, …build/ScoutSourceWorkerVersioning/body.md))` — sha computed from an **uncommitted** file; proved on `fx2`: `sha=30cce406…` printed while `git ls-tree HEAD` shows no `body.md` |
| C2 E6 | "`node scripts/readme-map.mjs` prints …" | run with `cwd: lane` on the worktree, not `rev` |

E4 also weakens "equals" to a 16-hex prefix (`pin.includes(sha.slice(0,16))`).

## MEDIUM 3 — the stagnation-nudge waiver drops the nudge's second conjunct

`plan.md` §Axis state: "Every owned axis sits at or above the lane's saturation line,
so the lowest-axis obligation is **waived by the stagnation nudge** (AXES.md)".

- The five-axis enumeration is correct and matches `SCORECARD.md ## Axes` (operability
  9; coverage, coverage:script-layer, coverage:runtime-layer, coverage:kimi-layer 10);
  the saturation line is 9 (`SCORECARD.md:1948`), so the first conjunct holds even
  under the base proxy's `AXES_DRIFT coverage row=10 derived=9` (9 ≥ 9).
- `AXES.md` §The stagnation nudge requires **two** conjuncts: axes at/above the line
  **and** "no capability has entered the table within the lane's stagnation window".
  `SCORECARD.md:1948` declares **N = 3** rounds. The capability table records rows at
  `receipt-evidence` 58, `cite-sources` 59, `dispatch-evidence` 60 — inside the
  three-round window preceding round 61. The plan never states the line (9), N (3) or
  the window, so the waiver cannot be re-derived, and on the lane's own record the
  second conjunct is not satisfied.
- Mitigation (calibration): the lowest-axis obligation is met substantively anyway —
  operability (9) is the lowest live axis and C1 is on operability. The defect is in
  the stated ground, not in the round's compliance.

## MEDIUM 4 — before-values that no committed receipt carries

- C2's "registry 133 rows (A=110 B=15 C=8)" is **true** (verified at `c2721f81`:
  133 rows, tiers 110/15/8) but appears in **no** receipt: `base/census-before.txt`
  is a `validate` run (W04 warnings + `ok`, exit 0) and carries no counts. The cited
  receipt does not contain the value it is cited for.
- `base/census-before.txt` and `base/proxy-before.txt` carry no lane revision at all
  (`proxy-before.txt` names only the upstream `src-rev=31c465f15669`).
- `base/proxy-before.txt` is `DRIFT` with three terms; the plan quotes only
  `C2_TOTAL_DRIFT declared=145 computed=146` and omits `A_DRIFT declared=105
  computed=107` and `AXES_DRIFT coverage row=10 derived=9`. Selective citation of a
  committed receipt.
- C1's round-60 `held=8/10` **is** backed at base — by
  `corpus/lessons/round-60-verifier-spotcheck.md:48` and
  `.ufo/waves/round-60/close/dispatch60-work.txt` (both present at `c2721f81`) — but
  the plan points at `base/dispatch61-base.txt`, which contains only the gate's
  `FAIL-CLOSED wave-dir-absent`. Wrong receipt pointer (value not fabricated).

## LOW

- **P2 "non-empty"**: the plan says "≥32 non-empty `<seat>.md` seat report files";
  the probe's `reports.length>=32` counts top-level `*.md` names at the rev with no
  emptiness check and no seat-name constraint. Emptiness is enforced only by the
  worktree gate (`statSync(...).size > 0`).
- **E2 "opens with the provenance trio"**: the code tests line-anchored `^source:` /
  `^verified-at:` / `^recheck:` anywhere in the file, not the opening lines.
- **E6 literal**: the frozen sentence requires the gate to print
  ``README_MAP: CLEAN files=rows=covered`` — a non-literal placeholder; the code tests
  `/README_MAP: CLEAN/`.
- **Control fixtures are not committed**: `ctl-c1-*` fixtures live only under
  `/tmp/kumitate-r61/controls/{c1-fab,c1-null}` (and `/tmp/kumitate-r61/controls/c1-fab`
  is now empty), so the C1 controls cannot be re-run from the repository.

---

## The four freeze checks, stated

1. **Same predicate sentence in plan, counter code, receipt labels — FAIL.**
   Divergences: C1 P2 (non-empty), C1 P3 (first-working 61 vs substring), C1 P4
   (rev vs worktree), C2 E3 (indices + dead regex, label `row-absent` for present
   rows), C2 E4 (equals vs 16-hex prefix; rev vs worktree), C2 E5 (fleet root vs lane
   root), C2 E6 (literal vs prefix regex), C2 E2 (opens-with vs anywhere).
2. **A control that skips the claimed work cannot reach the target — C1 PASS, C2 FAIL.**
   C1's two committed controls are real gate runs and fail closed as claimed; the
   un-controlled consistent-fabrication shape *does* reach CLEAN (HIGH 3). C2's control
   is a hand computation, tests one of two named arms, exits 0, and cannot discriminate
   because the arm it tests is dead for every input.
3. **No `all/complete/every/no-harm` clause without full enumeration — FAIL on the
   nudge clause.** The axis enumeration is complete and the values check out, but
   "so the lowest-axis obligation is waived by the stagnation nudge" suppresses the
   nudge's second conjunct and the declared N=3, which the capability rows at 58/59/60
   contradict. "No score integer can move" and "every claim is a capability acquisition
   or a frontier move" are enumerated (2 claims, both disclosed) — accepted.
4. **Before-values are receipts at the base commit — FAIL.** The base receipts were
   rewritten after the freeze (rev relabel `165b8304`→`c2721f81`, P3 detail replaced by
   an unreproducible `row-absent`); the 133/A=110/B=15/C=8 before-value has no receipt;
   the two receipt files carry no lane rev; the proxy receipt is quoted selectively;
   E5's before-PASS cannot be produced by the documented counting command.

## Minimal repairs (for the integrator, not applied here)

1. `doctrine61-probe.mjs`: `\s*` for both row regexes; indices `c[8]/c[9]/c[11]`;
   `git show <rev>:<capture>` instead of the worktree read; full 64-hex equality; add
   `--census-root /home/vgpnk/Projects/shokunin` to the plan's counting command (or
   default the probe to the fleet root).
2. Regenerate both base receipts at `165b8304` and label them with that revision; do
   not hand-edit a detail line.
3. Rewrite P3 to the row's actual provenance: keep `first-working 60`, append a
   round-61 note, and have the counter test that note (not `/round 61/` anywhere).
4. Add a C2 control that runs the committed counter against a fixture (unopened row →
   E3 MISS; no capture → E4 MISS) and exits non-zero on an unexpected PASS.
5. Either narrow C1's sentence to "record consistency, not dispatch authentication" and
   disclose the limit, or add a control for the consistent-fabrication shape.
6. State the saturation line (9) and N (3) in the plan, and either re-derive the nudge
   or drop the waiver (C1 already works the lowest live axis).
