# Round 66 — the three L6 registry-home drafts (seat K66ScribeLog)

L6 of rule L66 reads, at M: `a SKILL.md table row names routed-ledger.mjs; corpus/QUALITY.md names
routed-ledger; SCORECARD.md ## Capabilities has a row whose first cell names routed-ledger`.
At the freeze all three miss (`base/ledger66-base.txt`: `L6 MISS skill-row=false quality=false
capability-row=false`) and no file in the lane names `routed-ledger` yet:
`grep -n routed-ledger SKILL.md corpus/QUALITY.md SCORECARD.md` → no output. These are drafts for the
L1; this seat wrote none of the three files.

## 1. `SKILL.md` — gate-table row (5 columns, matching `SKILL.md:604` header, inserted at the end of the table)

```
| routed-ledger | gate | `node scripts/routed-ledger.mjs [--root DIR] [--rev REV] [--from N] [--to N] [--ledger PATH] [--classes]` → `ROUTED_LEDGER: CLEAN spotchecks=<a> sections=<b> items=<c> rows=<d> open=<e> closed=<f> wontfix=<g>` exit 0 / `DRIFT spotchecks=… findings=<k> first=<ID>:<detail>` exit 1 / `FAIL-CLOSED reason=<why>` exit 2 / `USAGE` 64, contract `kumitate-routed-ledger-v1`. The routed section is the first heading matching `/\brouted\s+(defects?\|items?)\b/i`; items are column-0 list items and table data rows (nested bullets belong to their parent, prose is not an item); every item needs >= 1 row, every row binds by a located quote (<= 25 words) found in that item, every closed/wontfix row binds by `path:line` plus a located quote on that line (+-2) in a lane file that is neither the ledger nor a spot-check | `--selftest` → `ROUTED_LEDGER_SELFTEST: PASS (33/33)` at the freeze (`base/routed-ledger-selftest-freeze.txt`); the L4 held-out fixtures are generated at counting time by `.ufo/waves/round-66/probe/ledger66-probe.mjs`, not cases in the suite | `corpus/routed-ledger.md` (rows), `corpus/lessons/round-NN-verifier-spotcheck.md` (items, rounds 55–65), `.ufo/pins/counter-pins.json` (`ledger66-probe`, `c1-controls66`) |
```

## 2. `corpus/QUALITY.md` — one criterion (Q65 is free: `grep -n '^- \*\*Q6[2-9]' corpus/QUALITY.md` → no output; renumber if the L1 prefers)

```
- **Q65 — a non-author spot-check's routed defects are counted in one ledger, and every closed row carries an answer a reader can locate.** Grounding: round 66 C1, `corpus/routed-ledger.md` under contract `kumitate-routed-ledger-v1` (`scripts/routed-ledger.mjs`); the class it exists for recurred eleven times (README map drift, R56-V3 family) and round 65 left seven routed items (D1–D7) unledgered. **Command.** `node scripts/routed-ledger.mjs --rev <rev> --from 55 --to 65 --classes` → `ROUTED_LEDGER: CLEAN …` exit 0; the frozen reading is `node .ufo/waves/round-66/probe/ledger66-probe.mjs <lane> <M>` → `LEDGER66_HELD held=6/6 checks=6 rev=<M> rule=L66`.
  - **Fails when.** An item has no row (`UNLEDGERED`), a row's quote is not located in its item (`QUOTE_ABSENT`), a closed/wontfix row's answer is self-pointing, past EOF or absent, an id repeats, an ordinal runs past its section, or `--classes` finds no class spanning >= 4 rounds. Exit 2 (`FAIL-CLOSED`) is never a pass.
  - **Shown able to fail.** The do-nothing control reads `LEDGER66_UNMET held=4/6` (`base/ledger66-donothing.txt`, L2 `items=57 rows=0`) and the autoledger control reads `held=4/6` with `first=QUOTE_ABSENT:R61.6@line40` (`base/ledger66-autoledger.txt`).
  - **Limit.** The gate verifies bindings, not adequacy: whether an answer answers its item stays the non-author closure's judgment; item ordinals assume the spot-checks stay append-only.
```

## 3. `SCORECARD.md` `## Capabilities` — row (4 columns, inserted before the `Rows enter only through a round …` line)

```
| `routed-ledger` | Count what the non-author spot-checks route back and hold every answer to a located line: every routed item of rounds 55–65 (57 items in 11 sections at base) needs >= 1 ledger row bound by a located quote (<= 25 words) found in the item; every closed/wontfix row needs `path:line` plus a quote located on that line (+-2) in a lane file that is neither the ledger nor a spot-check; `--classes` counts class recurrences (`CLASS`, `RECURRENT c rounds=k` for k >= 4); `--rev` reads committed bytes only; findings `UNLEDGERED`, `QUOTE_ABSENT`, `ANSWER_*`, duplicate id, ordinal-past-section; exit 0 CLEAN, 1 DRIFT, 2 FAIL-CLOSED, 64 usage; contract `kumitate-routed-ledger-v1` | `node scripts/routed-ledger.mjs --selftest` → `ROUTED_LEDGER_SELFTEST: PASS (33/33)`; frozen counter `node .ufo/waves/round-66/probe/ledger66-probe.mjs <lane> <M>` → `LEDGER66_HELD held=6/6 checks=6 rule=L66`; do-nothing controls `held=4/6` (`base/ledger66-donothing.txt`, `base/ledger66-autoledger.txt`) | round 66 |
```

Check before pasting: `grep -c routed-ledger SKILL.md corpus/QUALITY.md` must each be >= 1, and
`awk '/^## Capabilities/{f=1} f&&/^\| `routed-ledger`/{print;exit}' SCORECARD.md` must print the row —
that is what L6 reads.
