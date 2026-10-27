# K66ScribeQuality — registry-home drafts (QUALITY Q62 + SKILL + SCORECARD)

Three draft sites, one unified diff, made against the lane at freeze `621212b` from fresh copies of
`corpus/QUALITY.md`, `SKILL.md`, `SCORECARD.md`. `registry-home.patch` is `patch -p1`-ready from the
lane root (`dry_run_exit=0`, `apply_exit=0` over fresh copies: `q62-patch-apply.txt`).

## 1. `corpus/QUALITY.md` — new criterion Q62 (appended after Q51-C1, the file's last row)

Q62 is the next free number: the highest numeric row is Q61 and routed defect D4 of
`corpus/lessons/round-65-verifier-spotcheck.md` names "QUALITY Q62–Q64 … not landed" as carried debt.
Rule: every routed item of a non-author spot-check has a ledger row bound by a located quote before
the next round's report is filed; a class seen in >= 4 rounds gets a structural fix (a gate, a
criterion or a registry row — not another row). Grounding: the round-65 spot-check D2 (`:72`), D3
(`:73`), D7 (`:77`), plan §C1, `considerthese/2026-10-25.md` ideas 4–5, and the tool
`scripts/routed-ledger.mjs` (`kumitate-routed-ledger-v1`). Shape follows Q60/Q61: Who checks / Field /
Command / Fails when / Shown able to fail / Limit / Supersedes. **No bare full sha anywhere** — a bare
sha of a superseded revision in a corpus doc is read as a content pin of the nearest cited file
(Q51-C1's own note), so the freeze revision is written `<M>`.

## 2. `SKILL.md` — `## Gate registry`

Four edits:

| site | change |
|---|---|
| prose line 589 | `Twenty-four gate rows over twenty-three gate files` → `Twenty-six … over twenty-five …`, enumerating `routed-ledger` round 66 and `harm-matrix` round 65 as new |
| prose line 589 | `"all twenty-four"` (line 598) → `"all twenty-six"` |
| prose line 591 | `omp-binary-probe` named as a **probe** (no exit-1 arm) beside `cap-spawn` |
| table, after the `jj-seat-demo` row | three rows: `routed-ledger` (gate), `harm-matrix` (gate), `omp-binary-probe` (probe) |

Census after the patch (`q62-shape-check.txt`): 31 data rows = 26 `gate` over 25 gate files
(`plan-before-ready` carries two rows) + 1 `runner` + 2 `probe` + 1 `helper` + 1 `demo`; no duplicate
names; every new row has exactly 5 cells.

`## Verifiable checklist`: `Thirty-three items (round 64;` → `Thirty-four items (round 66; item 34 is
the routed-ledger gate …; round 64;` and one item appended as number 34:

```
- [ ] Routed-defect ledger gate (round 66; contract `kumitate-routed-ledger-v1`; the real run over the lane's spot-checks and ledger is the registry row's command, `--rev <M> --from 55 --to 65 --classes`) — `node scripts/routed-ledger.mjs --selftest` → exit 0 + `ROUTED_LEDGER_SELFTEST: PASS`
```

Grammar-checked against `CHECKLIST_RE` copied verbatim from `scripts/surface-probe.mjs:278`
(`checklist items=34 grammar_errors=0`, `q62-shape-check.txt`), and executed by the real runner over a
fixture carrying the patched `SKILL.md` plus a stub script: `CHECKLIST  PASS SKILL.md:746 … — Routed-
defect ledger gate` / `CHECKLIST: 1/34 pass` (`q62-checklist-runner.txt`; the other 33 fail because the
fixture has no other tools — the real lane run is the L1's). The item runs the selftest, not the gate:
the real run needs `corpus/routed-ledger.md`, which lands with C1's data.

## 3. `SCORECARD.md` — `## Capabilities`

Two rows inserted after `report-receipt-diff` (4 cells each, matching the table's column shape):
`harm-matrix` (first-working round 65, the repair of routed D2) and `routed-ledger` (round 66).
Both name their limits and the absence of a `pin.*` key.

## What the L1 must add when it integrates

1. **Q62's record arm.** The round's `## Gate` must name the structural fix carried for the
   `RECURRENT` class the gate prints (`readme-map-drift` is the expected one at 11 rounds). Q62 makes
   that a record requirement, not a machine test.
2. **Pins are absent and the rows say so.** No `pin.routed-ledger`, `pin.harm-matrix` or
   `pin.omp-binary-probe` key exists in the `kumitate-gate-pins-v1` block, so `proxy-check --strict`
   still reads `PIN_UNPINNED` for these three (routed D3). If the L1 adds keys, take the sha256 at
   integration, after any C1 fix to the tool (at the freeze: `routed-ledger.mjs` `f92a364d…`,
   `harm-matrix.mjs` `ab123486…`, `omp-binary-probe.sh` `ce12d748…`). `harm-matrix-gates.json` is
   `d9375275…`, which matches the `registry=d9375275ee2b` segment of round 65's real-run line.
3. **Table hygiene.** A raw `|` inside a GFM cell breaks the row (the first draft of the SCORECARD row
   read `cells=9`); the shipped patch escapes them as `\|`, and `q62-shape-check.mjs` is the check to
   re-run after any edit. The same applies to the regex `/\brouted\s+(defects?\|items?)\b/i` in the
   SKILL row.

## Files

- `registry-home.patch` — the three-file diff (120 lines).
- `stage/{SKILL.md,SCORECARD.md,corpus/QUALITY.md}` — patched full files, byte-identical to
  `patch -p1` over fresh copies.
- `q62-shape-check.mjs` + `q62-shape-check.txt` — grammar, cell and census check.
- `q62-patch-apply.txt`, `q62-checklist-runner.txt`, `q62-lane-at-freeze.txt`.
- `q62-fixture-clean.txt`, `q62-fixture-mutants.txt`, `q62-fixture-trivial-quote.txt` — Q62's arm
  shown green, red and weak.
