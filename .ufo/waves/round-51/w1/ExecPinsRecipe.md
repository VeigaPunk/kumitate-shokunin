# ExecPinsRecipe — C1 pin + registry + checklist integration recipe

**Seat:** `ExecPinsRecipe` (wave 1, build, executor).
**Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin` — **read-only for this seat**.
**Lane files edited: none.** Four DELTA FILES delivered under
`.ufo/waves/round-51/build/ExecPinsRecipe/`, plus this report.

## What I built

The integration recipe for C1's three surface changes, as snippets the L1 applies:

| delta | file | target |
|---|---|---|
| (a) | `build/ExecPinsRecipe/a-scorecard-pin-line.md` | `SCORECARD.md` `kumitate-gate-pins-v1` block (`:312-322`) — the `pin.receipt-attest=` line, the forced `pin.proxy-check` re-pin, the stanza re-derivation, and two companion corrections |
| (b) | `build/ExecPinsRecipe/b-skill-gate-registry-row.md` | `SKILL.md` `## Gate registry` table (`:602-617`) — the `receipt-attest` row, mirroring `bind-oracle` |
| (c) | `build/ExecPinsRecipe/c-skill-checklist-item-23.md` | `SKILL.md` `## Verifiable checklist` (`:686-707`) — checklist item 23 |
| (d) | `build/ExecPinsRecipe/d-proxy-check-gate-pins.diff` | `scripts/proxy-check.mjs` `GATE_PINS` (`:461-471`) — the one-line map addition, unified diff |

`build/ExecPinsRecipe/README.md` carries the order of operations and the end-to-end
rehearsal transcript.

## The three deliverables, verbatim

**(a) The pin line** — sha256 of
`.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` (37954 bytes; **named
source: ExecInstrument's delivered build artifact**, which had landed by the time I
computed it; my own scratch copy is *not* the source of this digest):

```
pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
```

This is the digest of the **build artifact**; the probe's A5 arm compares the declared
pin against the sha256 of the **committed `scripts/receipt-attest.mjs`**, so the
integrator must re-derive it from the staged file (`sha256sum scripts/receipt-attest.mjs`).
The recipe says so explicitly and gives the command. My scratch implementation
(`/tmp/r51-pins-recipe/scratch/receipt-attest.mjs`, sha256 `4ecd2563…`) was written
before the artifact landed, used only to rehearse the recipe's mechanics, and its digest
must **not** appear in the SCORECARD.

**(b) The registry row** — 5 cells, mirroring the `bind-oracle` row at `SKILL.md:616`:

```
| receipt-attest | gate | `node scripts/receipt-attest.mjs run --out <base> -- <cmd...>` → `RECEIPT: WROTE <base>.txt`; `node scripts/receipt-attest.mjs verify [--ledger <dir>] <file>` → `RECEIPT: VALID\|REPLAY\|TAMPERED` (0 valid · 1 replayed or tampered · 2 unreadable · 64 usage), contract `kumitate-receipt-attest-v1`: … | `--selftest` (`ATTEST_SELFTEST: PASS`; 27 hermetic cases, one per contract clause — among them the flake-injection arm that must read `RECEIPT: REPLAY` and the sidecar-mismatch arm that must read `RECEIPT: TAMPERED`) | the receipt bytes' inner digest, the sidecar digest and the clock ordering inside the script; `pin.receipt-attest` in the `kumitate-gate-pins-v1` block |
```

(The cell-3 text is long; delta (b) carries it in full.)

**(c) Checklist item 23** — GFM task, command `node scripts/receipt-attest.mjs
--selftest`, accepted exit `0`, expected substring `ATTEST_SELFTEST: PASS`:

```
- [ ] Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`) — `node scripts/receipt-attest.mjs --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

**(d) The proxy-check addition** — unified diff, one added line inside `GATE_PINS`:

```diff
@@ -467,5 +467,6 @@ const GATE_PINS = {
   'pin.counter-rerun': 'scripts/counter-rerun.mjs', // round 48: repeat-run receipt instrument (C2)
+  'pin.receipt-attest': 'scripts/receipt-attest.mjs', // round 51: invocation receipt attestation instrument (C1)
 };
```

## Evidence — commands run and their output

**Frozen grammar check on (c)** (regex lifted from `scripts/surface-probe.mjs:280`,
`CHECKLIST_RE`): the line matches; `cmd = node scripts/receipt-attest.mjs --selftest`,
`exits = 0`, `expect = ATTEST_SELFTEST: PASS`.

**Diff (d) applies cleanly and predicts its own re-pin.** On a fresh scratch clone:

```
$ git apply --check gp.diff && echo "APPLIES CLEANLY"
APPLIES CLEANLY
$ sha256sum scripts/proxy-check.mjs
495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9  scripts/proxy-check.mjs
```

— exactly the `pin.proxy-check` value delta (d) says to write. `495e5164…` is valid
only for this one-line addition; re-derive if the file differs by any byte.

**ExecInstrument's artifact passes its own selftest** (run in a fresh temp dir, script
only):

```
$ node receipt-attest.mjs --selftest | tail -2
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
exit=0
```

27 cases, ≥ 10 as the contract requires, with the flake-injection arm (case 07) and the
sidecar arm (case 09) present.

**End-to-end rehearsal against the frozen counter.** Scratch clone of the lane with
(a)+(b)+(c)+(d) applied, ExecInstrument's artifact staged at `scripts/receipt-attest.mjs`,
three receipts + the doctored control committed under
`.ufo/waves/round-51/receipts/`, everything committed, then the frozen probe run against
the **committed** tree:

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/r51-pins-recipe/laneEI HEAD
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=HEAD rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
exit=0
```

**The two gates the recipe touches**, on the same rehearsal tree:

```
$ node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=46 C=23 operability=9; C1=19/19 C2=115/115 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0

$ node scripts/proxy-check.mjs --selftest | tail -3
PROXY_SELFTEST: 122/122 pass
VERDICT: PASS
exit=0
```

**Checklist item 23 through the real runner** (same rehearsal tree):

```
CHECKLIST  PASS SKILL.md:708 exit=0 expected=0 substring=hit wall=0.420 load1=11.97 — Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`)
```

`wall=0.420 s`, far inside the runner's 120 s per-command timeout.

**Round-open baseline for comparison** (`.ufo/waves/round-51/base/baseline-gates.txt`,
read-only): `PROXY: MATCH … pins=6 match` exit 0 and `CHECKLIST: 22/22 pass` /
`VERDICT: PASS` exit 0.

## Findings (measured; no lane file edited)

1. **(a) and (d) are mutually dependent — order is forced.** `parseGatePins`
   (`scripts/proxy-check.mjs:1054`) fails closed on a `pin.*` key that is not a
   `GATE_PINS` key. Appending (a) without (d) gives, measured:
   `GATE_PIN_KEY_UNKNOWN: line 322: pin.receipt-attest is not a kumitate-gate-pins-v1
   key` → `PROXY: FAIL-CLOSED` **exit 2**. Exit 2 is fail-closed, never a score: it
   breaks harm rule H3 and probe arm A5. Apply (d) first.

2. **(d) invalidates `pin.proxy-check` — a `PIN_DRIFT` *error*, not a warning.**
   Editing `proxy-check.mjs` changes the bytes the v1 stanza pins. Measured after (d):
   `PIN_DRIFT pin.proxy-check: declared=0d5c00c2… computed=495e5164…`. The v1 stanza's
   23-key set stays frozen; only the pin **value** moves, as the block's own preamble
   requires ("re-pin those files after ANY edit, including `proxy-check.mjs` itself").
   The recipe folds this into (a)/(d) with the exact new value and the re-derive
   command.

3. **Two PRE-EXISTING HEAD defects block `PROXY: MATCH`, independent of C1.** At HEAD
   (before any of my edits) `node scripts/proxy-check.mjs --strict` already exits 1:
   `C2_TOTAL_DRIFT C2_total: declared=114 computed=115` and
   `AXES_DRIFT coverage: ## Axes row=10 derived=9`. Cause: commit `d788f74` added
   `corpus/lessons/round-50-verifier-spotcheck.md` with **no matching
   `corpus/README.md` row**, so `C2_total` (115 notes) exceeds `C2` (114 rows) and
   `coverage` re-derives to 9. The close commit must add that README row and set
   `C2=115` / `C2_total=115`, or H3 and A5 fail regardless of C1. The row text is in
   delta (a). **This is a pre-existing defect, not a C1 regression** — it is present at
   HEAD, which the round-51 freeze commits did not introduce.

4. **`SKILL.md:589/595/598` say "twelve"** and adding a 13th gate row makes them
   stale — the round-50 lesson's **M3** class ("a provisional count survives in prose
   after the row count moves"; the same three sites were swept for "all eleven" in
   round 50, `corpus/lessons/round-50.md:40-41`, `R50-5`). Prose only —
   `grep -rn "twelve\|Twelve" scripts/*.mjs` returns nothing, so no gate fails — but the
   L1 should sweep it to "thirteen" and add "`receipt-attest` round 51" to the
   round-added list at `:589`. Flagged, not silently changed.

5. **`SKILL.md:670` says "Nineteen items (round 42)"** while the list holds 22 (23
   after (c)). Also prose only; same M3 class; also already stale before this round.

6. **The A2 ≥300 s receipt spread cannot be manufactured by editing the prelude.**
   ExecInstrument's instrument binds the `run-at:` prelude to the record's own wall
   window (a prelude outside `[wall_start, wall_end]` reads `RECEIPT: TAMPERED`), so
   rewriting only the prelude makes the receipts read TAMPERED and fails A2/A4 —
   measured. The three receipts must be genuinely spaced (the plan's declared
   author-scheduled class) **or** re-bound consistently: prelude + `wall_start` +
   `wall_end` shifted together, inner digest recomputed over the canonical JSON with
   `digest` removed, sidecar recomputed. Only the second path is available to a
   rehearsal; I used it and the probe then read 9/9.

7. **The probe's ledger semantics changed after the plan body was written** — plan
   `## Freeze repair addendum` item 4 (seat `RevInstrumentContract` F1): the `--ledger`
   arm flags a nonce only when another receipt binds the **same nonce to a different
   record digest**; the target file and byte-identical duplicates are exempt.
   ExecInstrument's artifact implements this (its cases 13/14). A literal
   "reject a nonce already present" reading would make A4 unpassable, because the A3
   doctored control sits in the same directory with run-2's exact nonce. Flagged so the
   L1 does not "fix" the artifact toward the literal reading.

8. **The `A` term counts the working tree, not the git tree.** `walkFiles`
   (`proxy-check.mjs:681`) walks the extracted tree at the probe's `<rev>`, so A5's
   `PROXY: MATCH` depends on the **committed** file set; but a local
   `node scripts/proxy-check.mjs --strict` in the live lane walks the **working
   tree**, which currently holds 15 untracked runnable build artifacts
   (`git ls-files --others --exclude-standard | grep -cE '\.(mjs|js|sh|py)$'` → 15)
   that a committed tree does not. So the local and the probed readings can differ.
   The recipe therefore instructs the integrator to **derive** `A`/`C`/`C2`/`C2_total`
   from `proxy-check --json` against the close commit rather than copy numbers. The
   rehearsal's `A=46` is that tree's value, not a lane-wide constant.

9. **Plan `## Terms expected to move` says `A 43 → 44`, but the derivation gives
   `A=46`.** The plan notes "round-51 probe counters live under
   `.ufo/waves/round-51/probe/` and add to the frozen A count only by the frozen
   `RE_RUNNABLE` walk — recorded, not claimed". Measured: `c90b9de9` has 43 committed
   runnable files, `HEAD` has **45** (the two round-51 probe `.mjs` files are already
   committed), so the instrument's addition lands the committed count at 46, not 44.
   The plan's `44` is the *instrument's own* increment read against the base, which
   is consistent with its parenthetical — but a stanza that declares `A=44` would
   drift against the tree the probe extracts. The plan is frozen; per the bounds I did
   not edit it. **Proposed minimal fix for the L1 to adjudicate:** in the plan's
   `## Terms expected to move`, read "A 43 → **44**" as "A 43 → 45 (two committed
   round-51 probe counters) → **46** (the new instrument)". Severity: minor, and the
   plan text is frozen — the *stanza* must be right at the close commit either way.

## Risks

- **The pin value in (a) is only valid for ExecInstrument's artifact verbatim.** Any
  edit to the staged script changes it; the recipe's re-derive command covers this,
  but a silent divergence would make A5 read `pin 44919763…!=<other>`.
- **The `pin.proxy-check` value `495e5164…` is only valid for the exact one-line (d).**
  Any additional edit to `proxy-check.mjs` invalidates it; re-derive.
- **`A` is the most volatile term** — it moves with every committed runnable file. If
  the close commit lands other seats' `.mjs` build artifacts, `A` shifts again and the
  stanza must be re-derived *after* everything is staged. Deriving `A` early is the
  likeliest way to miss H3.
- **The round-51 receipts are the L1's to schedule.** The plan's limit (b) is honest
  about the author-scheduled ≥300 s spread; if the three runs are not genuinely spaced
  and are re-bound instead, the receipts attest to re-binding rather than to three
  spaced invocations — the same honesty caveat the plan already carries.

## Blockers

None for this item. The four deltas are complete and validated. The one open
dependency is **external to this item**: the L1's staged
`scripts/receipt-attest.mjs` bytes determine the final pin value, and the
pre-existing HEAD drift (finding 3) must be cleared in the same close commit for
`PROXY: MATCH` — the recipe carries the exact correction.

## Tools

No tools installed or upgraded. Everything used was already present: `node` v24.21.0,
`git`, `python3`, `sha256sum`, `/usr/bin/printf`, `/usr/bin/sha256sum`.

## Scratch artefacts (outside the lane, disposable)

`/tmp/r51-pins-recipe/` — `scratch/receipt-attest.mjs` (my own implementation, not
proposed for integration), `clone/`, `clone2/`, `clone3/`, `diffcheck/`,
`laneprobe/`, `laneprobe2/`, `laneEI/` (rehearsal clones), `scen/`, `gp.diff`.

## Lane write footprint

Exactly two paths, both mine:
- `.ufo/waves/round-51/build/ExecPinsRecipe/` — the five delta files.
- `.ufo/waves/round-51/w1/ExecPinsRecipe.md` — this report.

No lane script, corpus file, SCORECARD, SKILL.md, plan.md or probe was edited. No
`git`/`jj` mutation was run in the lane (`git status --porcelain` in the lane shows
only the wave's own untracked artefacts and the pre-existing
`.ufo/waves/round-51/w1/swarm-registry.json` modification, none of them mine).

Report: `.ufo/waves/round-51/w1/ExecPinsRecipe.md`
