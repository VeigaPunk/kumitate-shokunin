RESULT ScoutDebtIdentity rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=mapped debt=20 mapped=19 unmapped=S8#99

# R39-3 planning data: token-independent identity of the 20 open debt entries

## Method

- Read `function identities` at `scripts/anchor-truth.mjs:321-330`; reimplemented it verbatim: per note, `raw@path` plus the zero-based occurrence count of that pair in pin entry order (`#0`, `#1`, ...).
- Entry order equals `ord` order and ords are contiguous in both pins (checked all four notes, current and base), so occurrence numbering is well defined.
- Full table: `/fast/scratch/hyaku/kumitate-r40/seats/ScoutDebtIdentity/debt-map.tsv` (columns note, ord, identity, raw, token, source, expect now, base status, base ord, base raw, base expect, verdict).
- Base pin extracted with `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show e18ff1af3392e3823227644c977c237737fe65c9:.ufo/pins/anchor-truth.json` to `/fast/scratch/hyaku/kumitate-r40/seats/ScoutDebtIdentity/base-pin.json`.

## Open-state counts (observed)

- `cd /fast/scratch/hyaku/kumitate-r40/seats/ScoutDebtIdentity/lane && node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src` prints `TRUTH note=corpus/knowledge/remaining-scripts-census.md anchors=521 true=508 debt=4 unchecked=9`, `route-probe-cluster.md ... debt=16`, `sighting-wall.md ... debt=0`, `native-trial-launch.md ... debt=0`, `TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13`, `TRUTH: CLEAN`, exit 0.
- Current debt 20 = 15 `debt:false` + 5 `debt:dead`; all 20 carry `source: pair`. Base debt 208 = 192 `debt:false` + 16 `debt:dead`.

## Mapping result

- 19 of 20 debt identities exist in the frozen base pin, every one of them at a base entry that is also non-true (`debt:false`/`debt:dead`). No current debt identity maps to a base-true entry, so no current debt is a masked base-true anchor.
- No debt identity occurs beyond `#0`, and no note has duplicate identities. Only one current debt entry maps to a base ord that shifted (route-probe ord 101 maps to base ord 78); the rest land at the same ord.
- Unmapped: **S8#99**, census note `corpus/knowledge/remaining-scripts-census.md` ord 99, raw `scripts/fleet-ledger-rotate.mjs:392`, identity `scripts/fleet-ledger-rotate.mjs:392@scripts/fleet-ledger-rotate.mjs#0`, token `<segment>.<sha256>.cold`, expect `debt:false`. No entry in `e18ff1af` has that identity; the base carried `:392@scripts/fleet-dispatcher.mjs#0` (base ord 99, `debt:false`) instead.

## Why S8#99 has no base debt identity (history)

- `e18ff1af` froze census ords 98-103 as continuation raws `:107`, `:392`, `:393`, `:109`, `:591`, `:975-978` under `path: scripts/fleet-dispatcher.mjs`, all `debt:false`. The note at that time cited the ledger-rotation facts with bare line anchors inside the `scripts/fleet-ledger-rotate.mjs` section, so the pin judged dispatcher lines that do not hold those tokens.
- `git log --oneline -S'scripts/fleet-ledger-rotate.mjs:392' -- .ufo/pins/anchor-truth.json` returns only `c938c06 round-38: integrate per-anchor repairs without true-anchor regression; replace checklist ratchet with frozen truth floor`. Its pin diff rewrites ords 98-103 to `raw: scripts/fleet-ledger-rotate.mjs:<line>` with `path: scripts/fleet-ledger-rotate.mjs`; the same commit's note diff rewrites the sentence from `<segment>.<sha256>.cold` (`:392`, name template `:393`)` to the full lane paths. Ord 99 kept `expect: debt:false` through that re-attribution; ords 98, 101, 102, 103 flipped to `true`, and ord 100 moved to `source: review:L1`, token `cold`, `expect: true`.
- So the identity `...rotate.mjs:392@...rotate.mjs#0` was minted in round 38 by moving one anchor's raw and path together, and the base identity was deleted in the same edit. Round 39 (`4e34c35`) touched only S8#475 (`:560` -> `:560-572`, `debt:false` -> `true`), so ord 99 has been unchanged since round 38.
- The floor cannot see this: in `compareBase` (`scripts/anchor-truth.mjs:352-401`) the key match needs base entry `expect === 'true'` (base ord 99 was debt, so skipped), and the identity check `BASE_TRUE_LOST` also fires only for base-true entries. The per-raw@path group guard fires only for groups that held a true anchor at base; `:392@scripts/fleet-dispatcher.mjs` held none. Net effect: one base debt identity disappears and one fresh non-true identity appears, silently.
- Substantively the residual `debt:false` is honest, not a fraud: pinned `scripts/fleet-ledger-rotate.mjs:392` reads `const coldName = \`${segName}.${rawSha}.cold\`;`, which does not contain the note's prose rendering `<segment>.<sha256>.cold`. The defect is bookkeeping, not a false true-claim.

## Headroom (the R39-3 budget), base debt -> open debt

| note | base debt | open debt | headroom |
|---|---|---|---|
| corpus/knowledge/remaining-scripts-census.md | 77 | 4 | 73 |
| corpus/knowledge/route-probe-cluster.md | 74 | 16 | 58 |
| corpus/knowledge/sighting-wall.md | 22 | 0 | 22 |
| corpus/knowledge/native-trial-launch.md | 35 | 0 | 35 |
| total | 208 | 20 | 188 |

- The census headroom is exactly 73, the count of new false anchors C1/R39-3 reports reading CLEAN. `DEBT_GREW` compares per-note debt totals only, so new identities (fresh path, fresh raw@path, or a re-pointed anchor) can absorb debt until each note's total returns to its base value; a fresh path has no base group, so the group guard cannot fire either.
- Identity churn, for sizing attacks: identities absent from base are census 74, route-probe 81, sighting-wall 23, native-trial-launch 35; base debt identities that no longer exist are census 58, route-probe 49, sighting-wall 22, native-trial-launch 35 (164 of 208).

## Observations and gaps

- Observed: same-commit pin-and-note re-attribution is the mechanism that let S8#99 leave the base debt set with no finding; the 73 headroom number in C1 is exactly the census debt gap, so a fresh-path debt block sized at 73 around the census is fully inside the unguarded budget.
- Observed: the round-38 re-attribution of ord 100 used `source: review:L1` with token `cold`; `overrideValid` (`scripts/anchor-truth.mjs:284-288`) only requires the token in the note sentence and `judge === 'true'`, so that true claim rests on a self-declared review, the same class as R39-1.
- Not run here (not my assigned question): no attack execution, no probe, no judge-status recheck of the 20 debt entries against the pin beyond the checklist CLEAN above.
- Tooling: no installs or upgrades were made.
