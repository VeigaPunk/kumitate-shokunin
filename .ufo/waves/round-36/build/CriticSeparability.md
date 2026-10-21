CRITIC separability C1-alone=fail C2-alone=pass shared=SCORECARD.md,scripts/claims-check.mjs,.ufo/pins/fidelity-ratchet.json

# CriticSeparability — round 36 build wave (kumitate), critic seat

The two claims are separable in content and not in verdict. No executor patch file is touched
by both claims, and patches apply cleanly in either order. C2 verifies on its own. C1 does not:
apart from its own missing and conflicting patches, its `PROXY: MATCH` (checklist item 8) reads
three C2-owned keys in the shared `kumitate-proxy-v1` stanza. The integrated SCORECARD.md in
the L1's live tree already declares those keys, so a tree with only C1 applied fails item 8.

## Setup (scratch only: /fast/scratch/kumitate-r36/w/CriticSeparability/)
- `git -C <lane> archive 0614092e0804… | tar -x -C {base,c1,c2,both,bothrev}`. A `.git` came
  from `git clone --no-checkout --no-hardlinks <lane>`, then `update-ref HEAD 0614092…` and
  `read-tree`. Result: `git status --porcelain` printed 0 lines in all four trees, so each
  archive matches the commit. round-gate needs the history (COMMIT_MISSING scan).
- env A (guard): fake `HOME` holding only a `.kimi-code` symlink, `UFO_SRC` unset. Any bare
  default that reaches for `~/Projects/ufo-fsd-alpha` fails closed (exit 2) instead of reading
  the operator checkout. env B (checklists only): `UFO_SRC=/fast/scratch/kumitate-r36/src`,
  real HOME. env B exists because kimi-census refuses a symlinked root:
  `KIMI_ROOT_MISSING … is a symlink`. Both envs set `KUMITATE_MAIN_REPO` /
  `KUMITATE_REPORTS_DIR` to the main repo, which gets read-only git queries.
- Pin clone snapshot (`find src -printf '%P %T@ %s'|sort|sha256sum`): `2da4f6a3f655477f`
  before, and the same after every run. Nothing under the pin was created or modified.
- Scripts: `apply.sh` (reset to 0614092, then `git apply` each landed patch, atomic),
  `sim.sh`/`stanza.mjs` (mechanical stanza re-pin), `measure.sh` (all runs). Logs are in `logs/`.

## Patch inventory (as landed, re-applied 02:37; `apply.sh`)
| set | patch (sha12) | files | status |
|---|---|---|---|
| C1 | ExecPinFiles 3a18251413e6 | .ufo/pins/{origin,surface-known,fidelity-ratchet}.json | applied |
| C1 | ExecSurfaceDigestOrder 73c66f9ac6b5 | scripts/surface-probe.mjs, knowledge/live-surface-probe.md | applied |
| C1 | ExecSurfaceDispatcherState 64f54075ac23 | scripts/surface-probe.mjs | applied |
| C1 | ExecSurfaceKnown a1e91936acd5 / ExecSurfacePin 84e6b7dbd45f | scripts/surface-probe.mjs | CONFLICT (`patch failed: surface-probe.mjs:590` / `:53`) |
| C1 | ExecClaimsPin 4b355c17996e (`KumitateR36.ExecClaimsPin.patch`) | scripts/claims-check.mjs | applied |
| C1 | ExecProxyPin ebc6c1a19449 | scripts/proxy-check.mjs | applied |
| C1 | ExecChecklistRewrite ef4b874ef143 | SKILL.md | applied |
| C1 | ExecReadmeRow 8a6dc7fabd49 | corpus/README.md, **SCORECARD.md** (stanza `C2=80`, `C2_total=80`) | applied |
| C1 | ExecFidRouteProbe 75937fda5d87 | knowledge/{route-probe-cluster,live-surface-probe}.md | CONFLICT (live-surface-probe.md vs DigestOrder) |
| C2 | ExecR5Sections 9b3d66dfa324 | knowledge/native-admission-detail.md only | applied |
| C2 | ExecR7Sections f0e4b6c1542a | knowledge/local-ship.md only | applied |

**Missing C1 patches:** ExecClaimsFidelity, ExecFidOps, ExecFidRemainder, ExecFidSighting,
ExecFidSmall. ExecR7Sections' report names `w/KumitateR36.ExecR7Sections.patch`, but the file
is actually at `w/KumitateR36.ExecR7Sections/KumitateR36.ExecR7Sections.patch`.
- The two executor patch sets share no file.
- `bothrev` (C2 applied, then C1) produced the same results as `both`.
- C1 does not compose internally: of the four surface-probe patches, at most 2 apply together
  (DigestOrder+DispatcherState). A 3-way merge of Known and Pin leaves 9 conflict regions.
  This is L1 integration work and has nothing to do with C2.

## C2 alone (tree c2 = 0614092 + ExecR5Sections + ExecR7Sections, base gates, no pin)
```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict
ROW R5   form=section   notes=1 sections=4 adv=0
ROW R7   form=section   notes=1 sections=5 adv=0
CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)            EXIT=0
  (base tree: R5/R7 sections=0, CLAIMS: DRIFT (ROW_NO_SECTIONS ×2) EXIT=1)
$ node scripts/proxy-check.mjs --src … --json   → R_sections=92 R_members=92 coverage_runtime=10   (base 83/92, 9)
$ node scripts/proxy-check.mjs --src …          → PROXY: DRIFT (C2_TOTAL_DRIFT 79→80; R_SECTIONS_DRIFT
  declared=83 computed=92; COVERAGE_RUNTIME_DRIFT 9→10; AXES_DRIFT coverage 10/9; AXES_DRIFT
  coverage:runtime-layer 9/10; PIN_UNPINNED) EXIT=1   # undeclared C2 keys + the README-row drift that only C1 fixes
$ node scripts/claims-check.mjs --src …          → CLAIMS: MATCH (rows=19 … sections=184 adv=4) EXIT=0
```
All four C2 targets are met: R5=4, R7=5, 92/92, `coverage_runtime=10`. The C2 terms come out
the same whether the base tools or the C1-modified tools compute them. In tree `both`, `ROW R5`
and `ROW R7` match tree c2 exactly, with R_members/R_sections/coverage_runtime still 92/92/10.
Only C, C2 and coverage change, and those are C1's terms.

**Fidelity clause.** C2's falsifier, "the C1 fidelity arm reads nonok>0", needs C1's arm.
ExecClaimsFidelity has not delivered a patch, so I borrowed its scratch `claims-check.mjs`
(WIP, sha `d17adc390384`) into a copy of c2. Without any C1 content:
`FIDELITY note=corpus/knowledge/local-ship.md anchors=42 ok=42 … nonok=0`;
`FIDELITY note=corpus/knowledge/native-admission-detail.md anchors=38 ok=35 … noid=3 nonok=0`.
`FIDELITY_TOTAL nonok=371` reads the same with and without C2: C2 adds 80 anchors and no
non-ok. This is [PROVISIONAL]: it needs a re-run on the delivered patch.

## C1 alone (tree c1 = 0614092 + the landed C1 patches above)
```
c1   proxy (bare, pinned)  PROXY: DRIFT (C_DRIFT 13→14; PIN_DRIFT surface-probe/proxy-check/claims-check …; src-rev=31c465f15669)
c1s  = c1 + C1-only stanza delta (repin, C=14):
     PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=80/80 coverage=10; S=88/88 coverage:script-layer=10;
     R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669) EXIT=0
c1L  = c1 + the L1's live lane SCORECARD.md (sha fcf77449b923af30) + repin:
     PROXY: DRIFT (R_SECTIONS_DRIFT term=R_sections declared=92 computed=83 delta=-9; COVERAGE_RUNTIME_DRIFT
     declared=10 computed=9; AXES_DRIFT term=coverage:runtime-layer declared=10 computed=9; …; src-rev=31c465f15669) EXIT=1
bothL = both + same live SCORECARD + repin: PROXY: MATCH (… R=92/92 coverage:runtime-layer=10; … pins=6 match; src-rev=31c465f15669)
c1   claims (bare, pinned) CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669) EXIT=0
c1   surface (--src clone) SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=1 warnings=1); VERB_UNDECLARED only; STATUS_REACH ok
     — byte-identical in tree `both`: the surface leg has no C2 input
c1   fidelity              exit 64 (arm not landed)
checklist, env B:  c1s 12/14 (FAIL :629 --known exit 64, :640 fidelity exit 64)
                   c1L 11/14 (also FAIL :634 Proxy recompute exit 1)    bothL 12/14
```

## Entanglement evidence
- **E1, SCORECARD.md (stanza and `## Axes`).** This file decides the C1 verdict. Checklist item
  `SKILL.md:634` (`node scripts/proxy-check.mjs` → `PROXY: MATCH`) compares all 17 terms and
  the 5 Axes rows. C1 owns `C`, `C2`, `C2_total` and the pins (live lane `SCORECARD.md:285`,
  `:288-289`, `:301-306`). C2 owns `R_sections` (`:293`), `coverage_runtime` (`:295`) and the
  `| coverage:runtime-layer |` row (`:316`). The keys don't overlap, but the verdict depends on
  all of them. The live integrated file already declares 92/10/10, so C1 alone loses item 8
  (c1s 12/14 versus c1L 11/14, and nothing else differs).
  - The reverse holds too. C2 alone against that file (c2L) prints
    `PROXY: DRIFT (C_DRIFT declared=14 computed=13; C2_DRIFT declared=80 computed=79; AXES_DRIFT coverage …)`.
  - In that DRIFT run the text output never prints `R=92/92 coverage:runtime-layer=10`. C2's
    proxy evidence therefore has to come from `--json`.
  - No C2-only state can reach `PROXY: MATCH`: the README row is ExecReadmeRow's (C1) (c2s, above).
- **E2, scripts/claims-check.mjs.** C1 edits this file, and C2 uses it as its instrument. C2's
  counts don't change under C1's edits (E1 invariance). C2's "symbol on the cited line" clause
  can only be checked with C1's `--fidelity` arm. In base and C2 trees it fails:
  `claims-check: unsupported argument: --fidelity` (exit 64). The dependency runs one way, from
  C2 to C1's instrument. `scripts/proxy-check.mjs` is also shared, but it does not entangle the
  claims: C2's terms come out the same either way.
- **E3, .ufo/pins/fidelity-ratchet.json.** This is a C1 file. Neither C2 note is in `notes`,
  which means each has an implicit ceiling of 0. C2 content can therefore break C1's
  `FIDELITY: CLEAN` once both are applied. C2's absence cannot break it: before C2 the two
  notes contain no member section, so they contribute 0 anchors. Today C2's sections read
  nonok=0 [PROVISIONAL, E2].
- **E4, notes touched by both: none observed.** ExecFidSmall's scope names both C2 notes.
  ScoutFidSmall (`build/ScoutFidSmall.md:12`) reports 0 anchors in them before C2. ExecR7Sections
  flagged stale non-member line refs in local-ship.md for ExecFidSmall. If ExecFidSmall edits
  that prose, the note becomes shared, though hunk-separated from the EOF append. Not observed:
  the patch is missing.

## Counterexample to claims.md:42-47
`claims.md:47` says "C1's checklist can pass with C2's sections absent (the checklist does not
assert R5/R7)". That is false against the SCORECARD the L1 is integrating: item `:634` asserts
`R_sections` and `coverage_runtime` through the stanza (c1L above). `claims.md:44-45` also leave
SCORECARD.md out of both claims' file sets, yet ExecReadmeRow (C1) edits it and C2's score
needs `:293/:295/:316`. A naming hazard as well: "corpus/README.md (C2 row)" refers to the proxy
term `C2`, not to claim C2.

## Smallest safe correction (operability; coverage:runtime-layer evidence form)
1. Record C1's after-state on a C1-only stanza (c1s shape: `R=83/92 coverage:runtime-layer=9`,
   then MATCH). Then apply C2's three keys as a separate measured delta, as two commits or two
   recorded measurements. Alternatively, amend the separability paragraph to say that item 8 is
   a joint C1∧C2 verdict, and keep the c1s/c1L pair as the evidence.
2. Read C2's proxy evidence from `proxy-check --json` terms (`R_sections`, `coverage_runtime`),
   not from the text verdict.
3. Re-run C2's fidelity clause on ExecClaimsFidelity's delivered patch. That is the only C2
   acceptance item still provisional.

## Side findings (C1-only; independent of C2)
- C1 cannot verify even with C2 applied: bothL reads 12/14. The causes are missing fidelity
  patches and the unmerged surface patches.
- `.ufo/pins/fidelity-ratchet.json` sets ceiling 0 for loop-driver, runtime-support and
  runtime-remainder-census, but no build item assigns them: none of the 96 task texts
  mentions them. The WIP arm reads 9 + 10 + 11 = 30 non-ok there at base.
  [INFERENCE: until the L1 repairs these, FIDELITY: CLEAN cannot be reached]
- C1 falsifier hit: `SKILL.md:624` (patched) says "Item 1 (`cite-check`) still takes an
  explicit `--src`", but item `:627` runs bare `node scripts/cite-check.mjs`. Under env A it
  exits 2, `--src …/Projects/ufo-fsd-alpha` absent. In the real environment it would read the
  operator checkout.
- The live lane tree has an untracked new note, `corpus/knowledge/pinned-evidence.md` (L1, in
  flight). Unless a README row lands with it, it moves `C2_total` to 81.

## Commands run (cwd = each scratch tree; outputs in logs/*.txt)
`git archive|tar -x` (×5); `git clone --no-checkout --no-hardlinks`; `apply.sh`;
`node scripts/claims-check.mjs [--src S] [--row R5 --row R7 --strict] [--fidelity …]`;
`node scripts/proxy-check.mjs [--src S] [--json]`; `node scripts/surface-probe.mjs --src S`;
`node scripts/surface-probe.mjs --checklists` (env A and B); `node stanza.mjs <tree> repin C=14 …`;
read-only lane reads (`git show 0614092:SCORECARD.md`, `git --no-optional-locks diff --stat`).
No lane/jj/index writes; no installs.
