AUDIT NativeTrial4 anchors=1 false=1 overreverted=1 notice=ok verdict=partial
STATE CHANGE: the note was amended during this audit. Audited blob 2de70ea (HEAD 86c0676, restoration 5ceb8cd) was reset by 5bc40d0 (HEAD c7648c7, blob 53af1ab). §A audits HEAD c7648c7. §B records the superseded state the item was dispatched on (verdict there: refuted).

## Method
- Changed anchors = diff vs 0614092 on the audited blob: 9 `-`/`+` pairs (`git diff -U0 0614092 -- corpus/knowledge/native-trial-launch.md`). Partition anchors[⌊(g−1)·9/8⌋ : ⌊g·9/8⌋] gives group 4 = #4 = L361 `die`. Rows for all nine are in §B, so any other boundary convention can be read off.
- Pin = /fast/scratch/kumitate-r36/src @ 31c465f1 (`git status --short` empty). Also checked at 964f443e, the revision the note's sections declare.
- Symbol-on-line = token present on that exact line. Evidence: `git --no-pager grep -n -w -e SYMBOL <rev> -- <file>` and `read <file>:N-N:raw`.

## §A HEAD c7648c7 (current)
- `git diff --numstat 0614092 -- corpus/knowledge/native-trial-launch.md` → `1 0`. The only difference from base is the notice line. Changed anchors vs 0614092 = 0.
- `git merge-base --is-ancestor 0614092 91da27c` → ancestor. Base predates round 36.
- Group-4 anchor, current L360 "through local `die` (`:831`)": `read …/scripts/run-omp-native-trial.mjs:831` → `routeFamily: resolved.routeFamily,`. Symbol NOT on the line at pin. At 964f443e `die` is defined at line 831, so the anchor is true at the declared revision.
- Group-4 overreverted: R36 value `:4315` is pin line 4315, `// Every designed failure exits through die() as "BLOCKED: …"`. That is a comment-only token; the pin defines `die` at 838. Reset reverts a pin-true token to a pin-false line.
- Notice (L2): present. Each claim checks: "reset to its 0614092 bytes" (numstat); "no anchor here is a round-36 artifact" (ancestor check); "pre-existing anchors false at the pin remain as ratcheted debt" (`.ufo/pins/fidelity-ratchet.json` has `native-trial-launch.md: 31`); "re-verification owed; do not claim pin-true" (honest). → notice=ok.
- Residual risk outside group 4 (not named in the notice):
  - Ratchet for this note 25 → 31; total 186 → 200 (`git show 5bc40d0 -- .ufo/pins/fidelity-ratchet.json`). The notice says debt "remains", not that it rose.
  - Reset turns 10 R36 anchors that were pin-true into pin-false base lines. Every base line listed is true at 964f443e.

    | L | symbol | R36 (pin-true) | 0614092 (pin-false) |
    |---|---|---|---|
    | 354 | PROFILE | `:56` | `:50` |
    | 355 | PROPOSAL_WAVE_CEILING | `:115` | `:109` |
    | 356 | parseArgs | `:851` | `:844` |
    | 356 | planLaunchMode | `:965` | `:958` |
    | 358 | resolveNativeDispatchPolicy | `:639` | `:646` |
    | 359 | handOffToSightingWall | `:1289` | `:1282` |
    | 360 | die (comment at 4315) | `:4315` | `:831` |
    | 373 | persistEvidenceWrites | `:977` | `:973` |
    | 419 | readRoundPlan | `:722` | `:704` |
    | 421 | parseRateCard | `:926` | `:908` |

    Pin definitions behind the R36 column: `git grep -n -w` at 31c465f1 (PROFILE 56, parseArgs 851, planLaunchMode 965, resolveNativeDispatchPolicy 639, handOffToSightingWall 1289, persistEvidenceWrites 977 in the collector, readRoundPlan 722, parseRateCard 926). This is a floor: other R36 anchors were not checked.
  - Literal symbol-on-line on the nine lines predicts −2 nonok for 2de70ea→HEAD. The ratchet records +6. The rule difference is unresolved; re-measurement is owed. Not run here, because claims-check writes `.ufo/pins`.

## §B audited blob 2de70ea (HEAD 86c0676), superseded
Line numbers are audited-state numbers. N = symbol not on that line at pin 31c465f1; the 964f443e column is the same test at the declared revision.

| # | L | symbol | 0614092 | R36 | 2de70ea | pin 31c465f1 | 964f443e |
|---|---|---|---|---|---|---|---|
| 1 | 330 | die (run) | 831 | 831 | 303 | N (303 = "unchanged across every hop") | N |
| 2 | 356 | PROPOSAL_WAVE_CEILING (run) | 109 | 115 | 96 | N (96 = sentinel scope line) | N |
| 3 | 358–359 | snapshotDispatchInputs (run) | 171 | 639 | 639 | N (639 = resolveNativeDispatchPolicy def) | N |
| 4 | 361 | die (run) **group 4** | 831 | 4315 | 303 | N | N |
| 5 | 371 | parseArgs (collector) | 120 | 118 | 118 | N (118 = COLLECTOR_USAGE) | N |
| 6 | 374 | writeEvidenceFile (collector) | 951 | 977 | 977 | N (977 = persistEvidenceWrites def) | N |
| 7 | 387 | EVIDENCE_KIND (base.mjs) | 133 | 62 | 62 | N (62 = comment) | N |
| 8 | 420 | resolveNativeProfile (policy) | 619 | 722 | 722 | N (722 = readRoundPlan def) | N |
| 9 | 422 | loadCanonicalDirective (policy) | 879 | 926 | 926 | N (926 = parseRateCard def) | N |

- All nine restored-but-false at pin and at 964f443e.
- Rows 1, 2 and 4 were moved by the R37 commit onto base.mjs line numbers: base.mjs:303 is `die`, base.mjs:96 is PROPOSAL_WAVE_CEILING. That is a cross-file copy. Rows 3 and 5–9 were not touched by R37 and keep R36 values.
- Group 4 (row 4): restored-but-false = 1. Overreverted (pin) = 1: R36 `:4315` is a comment-literal token, and 0614092 `:831` is absent at pin.
- Notice on 2de70ea L2 says anchors "were reverted to the lines their 0614092 sentences named". False for 9/9. "(spot-check D1)" cites repair item D1 (`.ufo/waves/round-37/repairs.md:3`). The spot-check row is D8 (`repairs.md:14`). → notice=bad.
- §B verdict: refuted.

## Frame
- Pin frame (the item's instruction): §B 9/9 false. §A has 10 pin-overreversions, two of which are in the nine-row set.
- 964f443e frame (the note's declared revision): §B 9/9 still false, so the defect holds in both frames. §A: every restored line checked (nine-row set and the ten reversions) is true at 964f443e, so overreverted = 0 in this frame.

## Verification gaps
- Not run: lane claims-check and fidelity ratchet tooling (both write `.ufo/pins`). The ratchet discrepancy above is unresolved.
- R36 anchors beyond the ten were not checked; the ten are a floor.
- Peer reports were not read.
- Verdict uses the pin frame, as the item instructs.
