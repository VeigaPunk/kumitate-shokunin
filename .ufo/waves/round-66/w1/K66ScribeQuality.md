VERDICT: Three registry-home drafts are ready as one `patch -p1`-clean diff — QUALITY Q62 (names `scripts/routed-ledger.mjs`, quotes-before-next-report rule, >= 4-round structural fix, grounded in the round-65 spot-check D2/D3/D7), three SKILL gate-registry rows (`routed-ledger` gate, `harm-matrix` gate, `omp-binary-probe` probe) with the registry's own counts moved 24/23 → 26/25, checklist item 34, and two SCORECARD `## Capabilities` rows — with Q62's arm shown green, red and weak by fixture, grammar-checked by `surface-probe`'s own regex and executed by its real runner.

## Evidence

Next free Q number, and Q62 is not in use (highest numeric row is Q61; routed D4 pre-names "QUALITY Q62–Q64 … not landed"):
```
$ grep -oE '^- \*\*Q[0-9]+' corpus/QUALITY.md | grep -oE '[0-9]+' | sort -n | tail -2   → 60 / 61
$ grep -c 'Q62' corpus/QUALITY.md                                                       → 0
$ grep -n 'D2 —\|D3 —\|D7 —' corpus/lessons/round-65-verifier-spotcheck.md              → :72 D2, :73 D3, :77 D7
```

Tool surfaces the drafts pin (read, not taken from any report):
```
$ node scripts/routed-ledger.mjs --selftest            → ROUTED_LEDGER_SELFTEST: PASS (33/33)   exit 0
$ grep -oE "F\('[A-Z_]+'" scripts/routed-ledger.mjs    → ANSWER_DEAD ITEM_ABSENT QUOTE_ABSENT ROW_DUPLICATE ROW_MALFORMED UNLEDGERED (6)
$ grep -c 'kv ' scripts/omp-binary-probe.sh            → 22 keys; grep -c 'exit 1' → 0
$ grep -m1 '^HARM_MATRIX: ' .ufo/waves/round-65/close/harm-matrix-47fe2383151909d31557ada118ad84f90404dc6c-2b1f416e07b743caae8bcbdd0e9a74ea128feb64.txt
  → HARM_MATRIX: CLEAN gates=36 held=27 repaired=1 carried=5 moved=2 new=1 gone=0 harm=0 harm_absent=0 new_red=0
    unmeasured=0 ancestor=yes registry=d9375275ee2b base=47fe23831519 tip=2b1f416e07b7   (sha256(gates.json)=d9375275ee2b…)
$ tail -2 .ufo/waves/round-65/close/harm-matrix-selftest.txt → HARM_MATRIX_SELFTEST: PASS (114/114) / EXIT=0
```

Q62's arm, measured on a fixture (`build/K66ScribeQuality/q62-fixture-*.txt`): four rounds x two items, one class in all four.
```
clean   → RECURRENT readme-map-drift rounds=4
          ROUTED_LEDGER: CLEAN spotchecks=4 sections=4 items=8 rows=8 open=1 closed=7 wontfix=0      exit 0
dropped row   → FINDING UNLEDGERED round-57-item-2                                    exit 1
decoy quote   → FINDING QUOTE_ABSENT R56-2@line10:round-56-item-2                     exit 1
answer→spot   → FINDING ANSWER_DEAD R57-2@line12:answer-path-not-allowed:corpus/…spotcheck.md   exit 1
one-word quote (`| R55-2 | 55 | 2 | row |`) → CLEAN … rows=8                          exit 0   (the limit, measured)
```
Lane at the freeze (`build/K66ScribeQuality/q62-lane-at-freeze.txt`), worktree and `--rev 621212bac…`:
```
ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md   exit=2 (both)
```

Draft shape and applicability (`build/K66ScribeQuality/q62-shape-check.txt`, `q62-patch-apply.txt`):
```
checklist items=34 grammar_errors=0   (CHECKLIST_RE copied verbatim from scripts/surface-probe.mjs:278)
new item parses=true cmd="node scripts/routed-ledger.mjs --selftest" exits=0 expect="ROUTED_LEDGER_SELFTEST: PASS"
SKILL rows routed-ledger/harm-matrix/omp-binary-probe cells=5; SCORECARD rows 4 and 4
registry rows=31 gate_rows=26 gate_files=25 duplicate registry names=[]     (26 − 1: plan-before-ready has two rows)
$ patch -p1 --dry-run -d appv2 < registry-home.patch   → 3 files, dry_run_exit=0; apply_exit=0
```
Real runner over the patched `SKILL.md` plus a stub script (`q62-checklist-runner.txt`):
```
CHECKLIST  PASS SKILL.md:746 exit=0 expected=0 substring=hit — Routed-defect ledger gate (round 66; …)
CHECKLIST: 1/34 pass      (the fixture holds no other tool; the lane run is the L1's)
```

## Findings

1. **K66ScribeQuality-1 — MEDIUM, attacks C1's L6 ("corpus/QUALITY.md names routed-ledger").** A Q-row that
   reuses a taken number is a silent collision, and D4 shows Q62–Q64 were pre-registered as free. Measured:
   highest numeric row 61, `Q62` count 0. Repro: `grep -oE '^- \*\*Q[0-9]+' corpus/QUALITY.md | grep -oE '[0-9]+' | sort -n | tail -1`.
2. **K66ScribeQuality-2 — MEDIUM, attacks D3's `PIN_UNPINNED`.** Registry-home text cannot pin a tool: no
   `pin.routed-ledger` / `pin.harm-matrix` / `pin.omp-binary-probe` key exists, so `proxy-check --strict` stays red
   for these surfaces after the rows land. The rows therefore state the absence instead of inventing a hash, and
   `NOTES.md` lists the freeze sha256s for the L1 to take at integration. Repro:
   `grep -cE 'pin\.(routed-ledger|harm-matrix|omp-binary-probe)' SCORECARD.md` → `0`.
3. **K66ScribeQuality-3 — MEDIUM, attacks the registry's self-consistency.** Inserting rows while leaving the prose
   alone makes the registry contradict itself: the table then holds 31 data rows / 26 gate rows while the paragraph
   says "Twenty-four gate rows over twenty-three gate files" and `"all twenty-four"`. The patch moves both counts;
   any L1 edit that adds a row must re-run `q62-shape-check.mjs`. Repro: `node .ufo/waves/round-66/build/K66ScribeQuality/q62-shape-check.mjs`.
4. **K66ScribeQuality-4 — MEDIUM, attacks the gate count.** `omp-binary-probe.sh` has no exit-1 arm
   (`grep -c 'exit 1'` → `0`), so filing it as `gate` would break the registry's own rule ("each can exit 1 on a real
   defect") and inflate the count the prose quotes. Filed as `probe`, with the no-exit-1 reason in the kind cell.
   Repro: `grep -c 'exit 1' scripts/omp-binary-probe.sh`.
5. **K66ScribeQuality-5 — MEDIUM, attacks Q62's strength (Q18's "lexical truth is not admission").** The tool binds
   location and the 25-word ceiling, not specificity: the same fixture with the quote `row` reads `ROUTED_LEDGER:
   CLEAN … rows=8` exit 0 (`q62-fixture-trivial-quote.txt`). Q62 therefore states the limit and keeps adequacy with
   the non-author closure; the gate must never be cited as a prose oracle.
6. **K66ScribeQuality-6 — LOW, attacks the checklist item's operability.** A `--checklists` item that ran the real
   gate would be red on every honest lane until `corpus/routed-ledger.md` lands, and the frozen grammar has no slot
   for a revision (`grammar: \<cmd\> → exit N + \<expect\>`). Item 34 is the selftest; the real run stays in the
   registry row. Repro: `q62-lane-at-freeze.txt` (FAIL-CLOSED exit 2) and `q62-shape-check.txt` (grammar).
7. **K66ScribeQuality-7 — LOW, attacks object truth in the registry rows (Q52 class).** The tool has six finding ids
   and no `QUOTE_OVER_LONG`; an over-long quote is `ROW_MALFORMED`. A row naming an id the tool never prints is an
   unresolvable object a closure cannot reproduce — the rows list exactly the six. Repro: `grep -oE "F\('[A-Z_]+'" scripts/routed-ledger.mjs`.
8. **K66ScribeQuality-8 — LOW, two drafting hazards the next scribe will hit.** (a) A raw `|` inside a GFM cell
   silently adds cells: my first SCORECARD draft read `cells=9` before escaping (`\| R55-2 \| …`); the same applies to
   `/\brouted\s+(defects?\|items?)\b/i`. (b) A bare full sha of a superseded revision in `QUALITY.md` becomes a content
   pin of the nearest cited file (Q51-C1's own note), so Q62 writes the freeze revision as `<M>`, not as hex.
   Repro: `node q62-shape-check.mjs` (passes at 4/5/5 cells) and
   `sed -n '/^- \*\*Q62 /,/^- \*\*Supersedes/p' stage/corpus/QUALITY.md | grep -cE '[0-9a-f]{40}'` → `0` (the file as a
   whole carries 14 older 40-hex tokens, none of them mine).

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeQuality/registry-home.patch` — the three-file draft (120 lines, `patch -p1`).
- `.ufo/waves/round-66/build/K66ScribeQuality/stage/{SKILL.md,SCORECARD.md,corpus/QUALITY.md}` — patched full files.
- `.ufo/waves/round-66/build/K66ScribeQuality/NOTES.md` — site-by-site draft notes, L1 integration steps, pin caveat.
- Receipts: `q62-shape-check.{mjs,txt}`, `q62-patch-apply.txt`, `q62-checklist-runner.txt`, `q62-lane-at-freeze.txt`,
  `q62-fixture-clean.txt`, `q62-fixture-mutants.txt`, `q62-fixture-trivial-quote.txt`.
- Report: `.ufo/waves/round-66/w1/K66ScribeQuality.md`.

## Limits

- No lane gate was run over the drafts: Q6's per-file cite-check delta, `round-gate`, `readme-map` and
  `proxy-check --strict` judge the integrated tree, which is the L1's step. `surface-probe --checklists` ran only
  against a fixture (one stub tool), never the lane.
- Q62's "structural fix" clause is a record requirement (the round's `## Gate` names it), not a machine test; the
  drafts say so rather than implying the gate enforces it.
- `harm-matrix`'s row cites round 65's committed selftest and real-run receipts; I did not re-run either (114 gate
  executions across two revisions), so its `PASS (114/114)` is a committed receipt, not my measurement.
- `omp-binary-probe.sh` was read, not executed (it would run `<omp.real> --version` plus ~20 binary sweeps); its
  22-key and no-exit-1 facts are static reads of the script.
- Q62's `RECURRENT` evidence is a scratch fixture; the real class set depends on `corpus/routed-ledger.md`, which
  another seat drafts and the L1 commits.
