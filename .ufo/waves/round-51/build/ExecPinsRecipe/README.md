# C1 integration recipe — pin + registry + checklist (round 51)

**Owner:** seat `ExecPinsRecipe` (wave 1, build).
**Scope:** four DELTA FILES only. **No lane file was edited.** Every snippet below was
validated on scratch clones of `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, never
on the lane itself.

## The four deliverables

| delta | target file | what it is |
|---|---|---|
| **(a)** `a-scorecard-pin-line.md` | `SCORECARD.md` (`kumitate-gate-pins-v1` block, `:312-322`) | the exact `pin.receipt-attest=<sha256>` line, plus the `pin.proxy-check` re-pin it forces, plus the stanza re-derivation |
| **(b)** `b-skill-gate-registry-row.md` | `SKILL.md` (`## Gate registry` table, rows `:602-617`) | the proposed `receipt-attest` registry row (5 cells, mirroring `bind-oracle`) and the three prose numerals it makes stale |
| **(c)** `c-skill-checklist-item-23.md` | `SKILL.md` (`## Verifiable checklist`, items `:686-707`) | the proposed checklist item 23 line |
| **(d)** `d-proxy-check-gate-pins.diff` | `scripts/proxy-check.mjs` (`GATE_PINS`, `:461-471`) | the one-line `GATE_PINS` map addition as a unified diff |

## The three lines, at a glance

```diff
--- a/SCORECARD.md
+++ b/SCORECARD.md
@@ kumitate-proxy-v1
-pin.proxy-check=0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929
+pin.proxy-check=495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9
@@ kumitate-gate-pins-v1
 pin.counter-rerun=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b
+pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
```

```diff
--- a/scripts/proxy-check.mjs
+++ b/scripts/proxy-check.mjs
@@ -467,5 +467,6 @@ const GATE_PINS = {
   'pin.counter-rerun': 'scripts/counter-rerun.mjs', // round 48: repeat-run receipt instrument (C2)
+  'pin.receipt-attest': 'scripts/receipt-attest.mjs', // round 51: invocation receipt attestation instrument (C1)
 };
```

```
- [ ] Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`) — `node scripts/receipt-attest.mjs --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

plus the registry row in delta (b).

## Order of operations (each step's output feeds the next)

1. **Stage `scripts/receipt-attest.mjs`** from
   `.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` (verbatim; do not edit).
2. **Apply delta (d)** to `scripts/proxy-check.mjs` (one line).
3. `sha256sum scripts/proxy-check.mjs` → write into `SCORECARD.md:308` as
   `pin.proxy-check=`. *(With delta (d) applied verbatim this is
   `495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9`.)*
4. `sha256sum scripts/receipt-attest.mjs` → write into the `kumitate-gate-pins-v1` block
   as `pin.receipt-attest=` (delta (a)). *(With ExecInstrument's artifact staged
   verbatim this is `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`.)*
5. **Apply delta (b)** (registry row) and **delta (c)** (checklist item 23) to `SKILL.md`.
6. **Re-derive the stanza terms** against the close commit:
   `node scripts/proxy-check.mjs --json` → set `A`, `C`, `C2`, `C2_total` from the
   `terms` object. Do not copy the numbers from these files — `A` walks the whole tree
   and moves with every runnable file the round commits.
7. **Add the missing `corpus/README.md` row** for
   `lessons/round-50-verifier-spotcheck.md` (pre-existing HEAD drift; see delta (a),
   "Companion corrections"). This is required for `C2_total` and for the `coverage`
   axis row to re-derive to 10.
8. **Gate the result:** `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0;
   `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 23/23 pass` exit 0.

Steps 3–4 cannot be reordered relative to 1–2, and step 2 must precede step 4 — see
delta (a) and delta (d) for the measured fail-closed readings.

## End-to-end rehearsal (measured, not asserted)

A scratch clone of the lane was built with deltas (a), (b), (c), (d) applied, the
`ExecInstrument` artifact staged, the three round-51 receipts generated and committed
under `.ufo/waves/round-51/receipts/` (with the `attest-run-2-replayed.txt` doctored
control), and the frozen counter run against the committed tree:

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/r51-pins-recipe/laneEI HEAD
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=HEAD rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
exit=0
```

and the two gates the recipe touches:

```
$ node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=46 C=23 operability=9; C1=19/19 C2=115/115 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0

$ node scripts/surface-probe.mjs --checklists | tail -3
CHECKLIST: 21/23 pass
VERDICT: FAIL
```

The two `CHECKLIST` failures are `SKILL.md:691` / `:692` (the `round-gate` items) and
are **an artefact of running the checklist runner inside a scratch clone**, not of the
recipe: `round-gate` resolves `--reports-dir` to `<repo>/../.ufo/reports` and
`--main-repo` to the parent directory, and in `/tmp/r51-pins-recipe/laneEI` those are
the clone's own non-existent neighbours:

```
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /tmp/r51-pins-recipe/.ufo/reports is absent
ROUND_GATE: FAIL-CLOSED (NO_CLOSED_ROUND) no round-<N>/kumitate.md under …
ROUND_GATE: FAIL-CLOSED (MAIN_REPO_NOT_GIT) --main-repo /tmp/r51-pins-recipe is not a git work tree
```

In the real lane those two items pass — the round-open baseline
(`.ufo/waves/round-51/base/baseline-gates.txt`) records `CHECKLIST: 22/22 pass`,
`VERDICT: PASS`, exit 0, with `SKILL.md:691` and `:692` both `PASS`. The recipe's own
item (23) is `PASS` in the clone:

```
CHECKLIST  PASS SKILL.md:708 exit=0 expected=0 substring=hit wall=0.420 load1=11.97 — Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`)
```

## Findings for the L1 (see the report for the full list)

1. **`pin.receipt-attest` and the `GATE_PINS` addition are mutually dependent** — one
   without the other fails closed with exit 2, not a warning.
2. **The `GATE_PINS` addition invalidates `pin.proxy-check`** — a `PIN_DRIFT` *error*
   that must be re-pinned in the same commit.
3. **Two PRE-EXISTING HEAD defects block `PROXY: MATCH`** independently of C1: the
   missing `corpus/README.md` row for `lessons/round-50-verifier-spotcheck.md`
   (`C2_total` 114 vs 115, and `coverage` re-deriving to 9), and `A`/`C` needing
   re-derivation. The close commit must clear them for H3 and A5.
4. **`SKILL.md:589/595/598` say "twelve"** — adding a 13th gate row makes them stale
   (the round-50 M3 class; prose only, no gate fails).
5. **The A2 ≥300 s receipt spread cannot be faked by editing the prelude** — the
   instrument binds the prelude to the record's own wall window, so the three receipts
   must be either genuinely spaced or re-bound consistently (prelude + `wall_start` +
   `wall_end` + recomputed digest + recomputed sidecar). Editing only the prelude
   makes the receipts read `RECEIPT: TAMPERED` and fails A2/A4 — measured.
