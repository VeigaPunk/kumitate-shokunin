CRITIC separability C1-alone=fail C2-alone=pass shared=SCORECARD.md,scripts/claims-check.mjs,.ufo/pins/fidelity-ratchet.json

# CriticSeparability — kumitate round 36, build wave (critic seat, scratch only)

The claims are separable in content and not in verdict. No file is touched by both executor
patch sets, and the sets apply cleanly in either order.
- **C2 alone passes** its declared counting commands: R5=4, R7=5, R=92/92, `coverage_runtime=10`.
- **C1 alone fails.** Most causes are C1-internal: missing and conflicting patches. One is
  C2-caused: checklist item 8 (`PROXY: MATCH`) reads three C2-owned keys in the shared
  SCORECARD stanza.
- **C2's own falsifier fires under C1's delivered fidelity arm.** R5 reads nonok=1 and ok=0,
  because the arm's FINAL pairing rule departs from frozen FIDELITY v1. Under the frozen rule,
  C2 reads 80/80 ok.

Impacted axes: operability (C1 verdicts) and coverage:runtime-layer (C2 fidelity clause, evidence form).

## Setup (/fast/scratch/kumitate-r36/w/CriticSeparability/)
- **Trees.** `git -C <lane> archive 0614092e… | tar -x` → base, c1, c2, both, bothrev, each given a
  `.git` (`git clone --no-checkout --no-hardlinks` + `update-ref HEAD` + `read-tree`; `git status
  --porcelain` = 0 lines, so archive equals commit; round-gate needs the history).
- **env A (guard):** fake `HOME` (only a `.kimi-code` symlink), `UFO_SRC` unset, so an unpinned bare
  default fails closed. **env B (checklists):** `UFO_SRC=` clone, real HOME (kimi-census refuses a
  symlinked root). Pin clone `find|sort|sha256sum` = `2da4f6a3f655477f` before and after all runs;
  0 `/tmp/kumitate-surface-*` left. Scripts: `apply.sh`, `stanza.mjs`/`sim.sh`, `measure.sh` (logs/).

## Patch inventory (final apply 02:44 on 0614092)
| set | patch sha12 | files | status |
|---|---|---|---|
| C1 | ExecPinFiles 3a18251413e6 | .ufo/pins/{origin,surface-known,fidelity-ratchet}.json | applied |
| C1 | ExecSurfaceDigestOrder 73c66f9ac6b5 + ExecSurfaceDispatcherState 64f54075ac23 | surface-probe.mjs (+ live-surface-probe.md) | applied |
| C1 | ExecSurfaceKnown a1e91936acd5, ExecSurfacePin 84e6b7dbd45f | surface-probe.mjs | CONFLICT (`:590`, `:53`) |
| C1 | ExecClaimsPin 4b355c17996e | claims-check.mjs | applied |
| C1 | ExecClaimsFidelity fddfb98ec56d | claims-check.mjs | CONFLICT with ClaimsPin (`:54`) |
| C1 | ExecProxyPin ebc6c1a19449, ExecChecklistRewrite ef4b874ef143 | proxy-check.mjs, SKILL.md | applied |
| C1 | ExecReadmeRow 8a6dc7fabd49 | corpus/README.md + **SCORECARD.md** (`C2=80`, `C2_total=80`) | applied |
| C1 | ExecFidSighting 73e8a21a801e, ExecFidOps a35896bb4415 | sighting-wall, native-trial-launch, ops-watchers | applied |
| C1 | ExecFidRouteProbe 75937fda5d87 | route-probe-cluster, live-surface-probe | CONFLICT with DigestOrder |
| C2 | ExecR5Sections 9b3d66dfa324, ExecR7Sections f0e4b6c1542a | native-admission-detail.md / local-ship.md only | applied |

- **Missing:** ExecFidRemainder and ExecFidSmall. ExecFidSmall's WIP diff (read with
  `--no-optional-locks`) covers 10 notes and neither C2 note.
- **Path discrepancy:** ExecR7Sections' patch is at
  `w/KumitateR36.ExecR7Sections/KumitateR36.ExecR7Sections.patch`, not where its report says.
- **No overlap, order-independent:** C1-files ∩ C2-files = ∅. `bothrev` (C2 first, then C1)
  reproduces `both`.
- **C1 does not compose internally:** at most 2 of the 4 surface-probe patches apply together.

## C2 alone (tree c2 = 0614092 + R5 + R7, base gates, no pin, explicit --src)
```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict
ROW R5   form=section   notes=1 sections=4 adv=0
ROW R7   form=section   notes=1 sections=5 adv=0
CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)      EXIT=0   (base: sections=0, DRIFT ROW_NO_SECTIONS×2, EXIT=1)
$ node scripts/proxy-check.mjs --src … --json   → R_sections=92 R_members=92 coverage_runtime=10   (base 83/92, 9)
$ node scripts/proxy-check.mjs --src …          → PROXY: DRIFT (C2_TOTAL_DRIFT 79→80; R_SECTIONS_DRIFT 83→92;
    COVERAGE_RUNTIME_DRIFT 9→10; AXES_DRIFT coverage 10/9; AXES_DRIFT coverage:runtime-layer 9/10; PIN_UNPINNED) EXIT=1
```
The C2 terms hold against the C1-modified tools too. In tree `both`, the `ROW R5`/`ROW R7` lines
are identical and R_members/R_sections/coverage_runtime read 92/92/10. Only C (13→14),
C2 (79→80) and coverage (9→10) move, and all three are C1's.

## C1 alone (tree c1 = 0614092 + the applied C1 patches above)
```
c1    PROXY: DRIFT (C_DRIFT 13→14; PIN_DRIFT surface-probe/proxy-check/claims-check; …; src-rev=31c465f15669)  # no executor re-pins
c1s = c1 + C1-only stanza delta (repin, C=14):
      PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=80/80 coverage=10; S=88/88 coverage:script-layer=10;
      R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)  EXIT=0
c1x = c1 + integrated stanza (C1 delta + R_sections=92, coverage_runtime=10, Axes runtime-layer 10):
      PROXY: DRIFT (R_SECTIONS_DRIFT term=R_sections declared=92 computed=83 delta=-9; COVERAGE_RUNTIME_DRIFT
      declared=10 computed=9 delta=-1; AXES_DRIFT term=coverage:runtime-layer declared=10 computed=9; …)  EXIT=1
boths = both + integrated stanza: PROXY: MATCH (… R=92/92 coverage:runtime-layer=10; pins=6 match; src-rev=31c465f15669)
c1    CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669)   EXIT=0
c1    SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=1 warnings=1)  VERB_UNDECLARED only, STATUS_REACH ok
      (--src clone; output byte-identical in `both`: no C2 input)
checklist (env B, 02:35–02:40): c1s 12/14 (FAIL :629 --known exit 64, :640 fidelity exit 64); c1L 11/14 (also FAIL
      :634 Proxy recompute exit 1); bothL 12/14
```
- **c1L** = c1 + the L1's live lane SCORECARD.md (sha `fcf77449…`, re-pinned). It reproduced
  c1x exactly. So the integrated file already declares `R_sections=92` (`SCORECARD.md:293`),
  `coverage_runtime=10` (`:295`) and `| coverage:runtime-layer | 10 |` (`:316`).
- **Environment drift from 02:43.** The live SCORECARD moved to `C2=82` (L1 notes in flight),
  and `.ufo/reports/round-36/kumitate.md` appeared. round-gate now audits round 36, so `:632`
  fails in every tree. The c1s→c1L delta is still exactly `:634`.

## Entanglement evidence
- **E1, SCORECARD.md (verdict-level, proven).** `SKILL.md:634` requires `PROXY: MATCH`, which
  compares 17 terms, the pins and the 5 Axes rows.
  - C1 owns `:285`, `:288-289` and `:301-306`; C2 owns `:293`, `:295` and `:316`. The keys are
    disjoint, and `git merge-file` of the c1s and c2s stanzas gives 0 conflicts and equals boths.
  - The verdict is joint all the same: c1s MATCH, c1x DRIFT.
  - Reverse: C2 against the integrated file prints `PROXY: DRIFT (C_DRIFT declared=14
    computed=13; C2_DRIFT …)` and never shows `R=92/92` in text, so C2's proxy evidence must
    come from `--json`. No C2-only state can MATCH (c2s): the README row is C1's.
- **E2, scripts/claims-check.mjs (instrument).** C2's "symbol on the cited line" clause needs
  C1's arm; C2-only trees refuse with `claims-check: unsupported argument: --fidelity` (exit 64).
  Borrowing the delivered arm (fddfb98ec56d) into C2-only tree f2:
  `FIDELITY note=corpus/knowledge/local-ship.md anchors=42 ok=42 … nonok=0`;
  `FIDELITY note=corpus/knowledge/native-admission-detail.md anchors=38 ok=0 elsewhere=1 … noid=37 nonok=1`.
  - **Counterexample:** `native-admission-detail.md:113` reads
    `` `process`. At `crates/ufo-core-runtime/src/native_text.rs:17`, `json_lower` is … ``,
    and the pinned `:17` is `pub(crate) fn json_lower(`.
  - The arm's FINAL rule (`claims-check.mjs:610-631` patched) refuses the comma-separated right
    span and pairs the previous sentence's `process` across ". At", giving `elsewhere`. The
    frozen contract ("next span within 14 chars, right first") pairs `json_lower`, giving `ok`.
  - My read-only re-implementation (`pair.mjs`): R5 38/38 ok under the contract, 37 noid +
    1 elsewhere under FINAL; R7 42/42 ok under both.
  - WIP `d17adc390384` (02:31) still read R5 at nonok=0: the C2 outcome moves with the
    instrument revision.
- **E3, .ufo/pins/fidelity-ratchet.json (one-way).** Neither C2 note is in `notes`, so each has
  an implicit ceiling of 0.
  - f1 = pins + arm + FidSighting + FidRouteProbe + FidOps: `nonok=192 … +8` over-ceiling notes.
  - f12 = f1 + C2: `nonok=193 … +9`, so C2 adds exactly one over-ceiling note.
  - C2's absence cannot break C1: before C2 the two notes hold no member section (0 anchors).
- **E4, notes touched by both: none observed.** ExecFidSmall's scope lists both C2 notes, but
  no patch or WIP edits them.

## Counterexample to claims.md:44-47
- `:46-47` says "C1's checklist can pass with C2's sections absent (the checklist does not
  assert R5/R7)". False against the integrated SCORECARD: item `:634` asserts `R_sections` and
  `coverage_runtime` through the stanza (c1x, c1L).
- `:44-45` leave SCORECARD.md out of both file sets, yet ExecReadmeRow (C1) edits it and C2's
  score needs `:293/:295/:316`.
- "README.md (C2 row)" means the proxy term C2, not claim C2: a naming hazard.

## Smallest safe corrections
1. Measure C1 on a C1-only stanza (c1s: `R=83/92 … runtime-layer=9`, MATCH), then land C2's three
   keys as a separate measured delta. Or state that item 8 is a joint C1∧C2 verdict and keep the
   c1s/c1x pair as evidence.
2. Read C2's proxy evidence from `--json` terms, not from the text verdict.
3. Make the arm implement the frozen pairing: right-first, no clause guards, no "both→noid". The
   guarded rule is a contract change the judge must reject this round. Under the frozen rule,
   C2's nine sections read 80/80 ok, nonok=0.

## Side findings (C1-internal, independent of C2)
- **C1 falsifier:** `SKILL.md:624` (patched) says item 1 "still takes an explicit `--src`", but `:627`
  runs bare `node scripts/cite-check.mjs`. env A: exit 2 (`…/Projects/ufo-fsd-alpha` absent).
- ops-watchers still reads `nonok=56` under the delivered arm [INFERENCE: repairs scored with own
  pairers]. FINAL turns paired anchors into ungated `noid` (R5: 37 of 38 ok → noid).
- Surface-probe ×4, claims-check ×2 and live-surface-probe.md need an L1 merge; even bothL is 12/14.

## Commands run (cwd = each scratch tree; outputs in logs/)
`git archive|tar -x`; `git clone --no-checkout --no-hardlinks`; `apply.sh`; `git apply --3way` (c1m: 9
conflict regions); `node scripts/{claims-check,proxy-check,surface-probe,round-gate}.mjs` with the flags
above (`--checklists` in envs A and B); `node stanza.mjs`; `node pair.mjs`; `git merge-file`. Lane reads
only (`git show 0614092:…`, `git --no-optional-locks diff --stat`); no lane/jj/index writes; no installs.
