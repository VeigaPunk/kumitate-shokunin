# Verification — R66 rows (K68ScribeLedgerE)

Lane `39f61816d4ee7a8d401df42c1818c91a9c537bce` (frozen plan commit). No git write of any kind was made in the
lane or the fleet; the fixture is a hand-built directory under scratch, deleted before yield.

## V1 — the counter's own item count, per round (probe's `items67` extracted verbatim, `items67.mjs`)

    $ node counter-count.mjs
    round=55 items=3 sections=1
    round=56 items=4 sections=1
    round=57 items=4 sections=1
    round=58 items=8 sections=1
    round=59 items=0 sections=1
    round=60 items=9 sections=1
    round=61 items=6 sections=1
    round=62 items=5 sections=1
    round=63 items=6 sections=1
    round=64 items=5 sections=1
    round=65 items=7 sections=1
    round=66 items=4 sections=1
    counter-own items=61 sections=12

The tool's own `routedItems()` gives the same per-round numbers (`items.mjs` run, round 66 items=4). 55..65 = 57.
The plan's prose ("rounds 55..65's 58 plus round 66's D1–D3") is wrong on both terms; its total 61 is right.

## V2 — the four rows read CLEAN on a fixture root (v1 tool, range narrowed to round 66)

Fixture: `fx/corpus/lessons/round-66-verifier-spotcheck.md` (lane copy), `fx/corpus/routed-ledger.md`
(= `fixture-ledger.md`), `fx/corpus/QUALITY.md` (lane copy + `quality-append.md` appended), `fx/PROVINCE.md`
(lane copy + `province-append.md` clause applied in place).

    $ node /…/kumitate-shokunin/scripts/routed-ledger.mjs --root $S/fx --from 66 --to 66
    ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=4 rows=4 open=1 closed=3 wontfix=0
    EXIT=0

## V3 — the counter's exact-line / uniqueness conditions (probe primitives `norm`, `nwords`, `wb` copied
verbatim from `ledger68-probe.mjs:120-131` into `prims.mjs`; row loop mirrors `ledger68-probe.mjs:235-272`)

Runs V3–V4 predate the V9 class-slug swap; only the `classes=` line changes with it, not the quote/answer arms.

    $ node l3check.mjs /path/to/fx
    exact-line-ok R66-D1 corpus/QUALITY.md:1066 answer-words=12
    exact-line-ok R66-D2 corpus/QUALITY.md:1072 answer-words=7
    exact-line-ok R66-D3 PROVINCE.md:21 answer-words=6
    open-ok R66-N1 quote-words=6
    classes=4 wave-leftover,receipt-precision,unlanded-claim,promotion-owned
    ALL L3 ROW CONDITIONS PASS
    CHECKER-EXIT=0

(Checker prints `BAD …` lines when a condition fails; it does not set a non-zero exit — read the last line.)

## V4 — control A: the pin is an exact line, not a window

Shifting D1's answer from `QUALITY.md:1066` to `:1067` (it would still pass the v1 tool's ±2-line window):

    $ sed -i 's/QUALITY.md:1066/QUALITY.md:1067/' fx/corpus/routed-ledger.md; node l3check.mjs
    exact-line-ok R66-D2 corpus/QUALITY.md:1072 answer-words=7
    exact-line-ok R66-D3 PROVINCE.md:21 answer-words=6
    open-ok R66-N1 quote-words=6
    classes=4 wave-leftover,receipt-precision,unlanded-claim,promotion-owned
    BAD R66-D1:answer-quote-not-at-exact-line ; r66-item-1-not-answered-this-round

## V5 — control B: item 4 is load-bearing (drop `R66-N1`)

    $ node …/scripts/routed-ledger.mjs --root $S/fx --from 66 --to 66
    FINDING UNLEDGERED round-66-item-4
    ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=4 rows=3 open=0 closed=3 wontfix=0 findings=1 first=UNLEDGERED:round-66-item-4
    EXIT=1

Restored fragment → `ROUTED_LEDGER: CLEAN … rows=4 open=1 closed=3 wontfix=0` EXIT=0.

## V6 — base negatives (answer quotes are NEW this round)

    $ git show 8d557f85:corpus/QUALITY.md | grep -c -F "uncommitted seat leftovers are committed or reverted under the closing LOG entry"
    0
    $ git show 8d557f85:corpus/QUALITY.md | grep -c -F "every receipt names the revision it measured"
    0
    $ git show 8d557f85:PROVINCE.md | grep -c -F "second entry \`corpus/knowledge/mcp-deprecation-registry.md\` (round 68, S207-S213)"
    0
    $ git show 8d557f85:corpus/lessons/round-68.md ; echo exit=$?
    fatal: path 'corpus/lessons/round-68.md' does not exist in '8d557f85'
    exit=128

## V7 — the D1 facts the Q63 grounding asserts

    $ git show --stat --oneline e9ff2719 | grep -i "INCONCLUSIVE\|results.tsv"
     .../build/K66MutHarmMatrix/mutant-results.tsv      |   30 +
     .../results-INCONCLUSIVE-attempt.tsv               |   15 +
     .../results-INCONCLUSIVE-attempt.tsv.README        |    1 +
     .../round-66/build/K66MutLedgerProbe/results.tsv   |   22 -
    $ git log --oneline HEAD -- .ufo/waves/round-66/build/K66MutLedgerProbe/results-INCONCLUSIVE-attempt.tsv
    e9ff2719 hyaku run9 wrap-up: final late-seat outputs
    $ git log --oneline -1 -- .ufo/waves/round-66/build/K66ReviewStagedClaims/captures/timeline.json
    d23892ad hyaku run9 wrap-up: last staged-claims capture
    $ git show e9ff2719^:…/results.tsv | sha256sum   → bc010bddd09387f0b3d052f13e2adced0bed40e65af97af39beca151209b5f04
    $ git show e9ff2719:…/results-INCONCLUSIVE-attempt.tsv | sha256sum
                                                     → 5a4bac545fbb46511d9ac14ce928cdf243b345819f6bab72c3164640a833133d
    $ git show e9ff2719:…/results-INCONCLUSIVE-attempt.tsv | grep -c INCONCLUSIVE   → 14   (15 lines: header + 14)
    $ grep -rln "timeline\.json\|results\.tsv" LOG.md corpus/lessons/
    corpus/lessons/round-66-verifier-spotcheck.md

Bytes differ → the landed file is a **re-run**, not a rename; the 22-line `results.tsv` is deleted. No LOG entry
or lesson names either path (only the spot-check that routed the defect).

## V8 — anchors exist and are unique in the answer files (fixture, post-append)

    $ grep -n "Q63 —\|Q64 —" fx/corpus/QUALITY.md
    1066:- **Q63 — a wave's uncommitted seat leftovers …
    1072:- **Q64 — every receipt names the revision it measured …
    $ wc -l fx/corpus/QUALITY.md → 1077      (lane QUALITY.md = 1064 lines at 39f61816)

## V9 — re-run after adopting the canonical class slugs (K66ScribeClasses taxonomy)

Rows now carry `uncommitted-work` (D1), `report-fidelity` (D2), `carried-unaddressed` (D3),
`verification-gap` (item 4, open) — the 13-slug vocabulary of
`.ufo/waves/round-66/build/K66ScribeClasses/table.md`.

    $ node …/scripts/routed-ledger.mjs --root $S/fx --from 66 --to 66
    ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=4 rows=4 open=1 closed=3 wontfix=0
    EXIT=0
    $ node l3check.mjs $S/fx
    exact-line-ok R66-D1 corpus/QUALITY.md:1066 answer-words=12
    exact-line-ok R66-D2 corpus/QUALITY.md:1072 answer-words=7
    exact-line-ok R66-D3 PROVINCE.md:21 answer-words=6
    open-ok R66-N1 quote-words=6
    classes=4 uncommitted-work,report-fidelity,carried-unaddressed,verification-gap
    ALL L3 ROW CONDITIONS PASS
