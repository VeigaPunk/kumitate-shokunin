REVIEW fid-sighting anchors=122 label-fail=0 fidelity=0

# ReviewFidSighting — ExecFidSighting patch (sighting-wall.md + native-trial-launch.md)

Patch: `/fast/scratch/kumitate-r36/w/ExecFidSighting.patch` (9 hunks, 2 files, only corpus notes).
Applied clean on base `0614092` in `/fast/scratch/kumitate-r36/w/ReviewFidSighting/lane`
(`git apply --check` clean); patch-applied md5s `9624db2c…` / `608cc820…` are byte-identical to the
executor's own lane at generation time. Pin asserted: `git -C /fast/scratch/kumitate-r36/src
rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
Verifier: read-only. Every check below was run against the applied patch, never the lane tree.

## FIDELITY note lines (re-run)

Shipped gate build (ExecClaimsFidelity lane, ambiguity-aware pairing), `--self <applied tree> --src <pin>`:

```
FIDELITY note=corpus/knowledge/native-trial-launch.md anchors=52 ok=50 elsewhere=0 absent=0 dead=0 noid=2 nonok=0
FIDELITY note=corpus/knowledge/sighting-wall.md anchors=70 ok=65 elsewhere=0 absent=0 dead=0 noid=5 nonok=0
FIDELITY: DRIFT (nonok=316)   # corpus-wide; other notes' debt, not these two
```
Same run under my independent implementation of the amended rule: `sighting nonok=0`, `native-trial nonok=0`.
Before (unchanged notes, same gate): `sighting nonok=16`, `native-trial nonok=25`.

**Frozen-contract rule (right-first, no ambiguity term) on the same patched text:**
```
FIDELITY note=corpus/knowledge/sighting-wall.md anchors=70 ok=46 elsewhere=18 absent=1 dead=0 noid=5 nonok=19
FIDELITY note=corpus/knowledge/native-trial-launch.md anchors=52 ok=38 elsewhere=12 absent=0 dead=0 noid=2 nonok=12
```
All 31 of those are pairing artifacts, not provenance errors: I re-read each cited pin line and it contains
the sentence's intended subject (`:19`=SHIM_PATH, `:21`=MODULE_PATH, `:27`=TMUX_TARGET, `:49`=MAX_MANIFEST_BYTES,
`:73`=LOCK_TIMEOUT_MS, `:63`=MAX_TEXT_BYTES, `:71`=DEFAULT_ATTACH_TIMEOUT_MS, `:37`=parseOpenCodeArgv,
`:131`=isOpenCodeExecutable, `:198`=appearsToLaunchOpenCode, `:35`=missionOmpSessionDirectory,
`:270`=scanMissionTasks, `:411`=sparkStateRoot, `:59`=surfaceManifest, `:3616`=stopMission, `:3794`=resumeMission,
`:1991`=reconcileLocked, `:3543`=steerMission; NT: `:65`=ADMITTED_PROFILES, `:838`=die, `:120`=collector parseArgs,
`:955`=writeEvidenceFile, `:96`=PROPOSAL_WAVE_CEILING, `:173`=DEADLINE_CLASS_BY_ROLE, `:217`=ROUTING_HEALTH_OUTCOMES,
`:120`=GODSPEED_MARKER, `:265`=taskCalls, `:16`=normalizeTranscriptEvent, `:637`=resolveNativeProfile,
`:897`=loadCanonicalDirective). The 7 `noid` anchors are likewise correct (`:2386` launchMission, `:4730` re-export
block, `:317` output, `:321` requireNoArgs, `:301` usage; NT `:25` DEFAULT_SCREENING_CLASSES, `:194` directiveScreeningNeedle).

## Changed anchors re-opened at the pin (51 renumbered, 1 folded)

sighting-wall: writeManifest 548→533, readManifest 379→423, loadStatusView 531→516,
acquireOperationLock 663→648, withOperationLock 781→767, spawnPaneForMission 2225→2239,
launchMissionLocked 2347→2361, launchMission 2372→2386, stopMission 3584→3616,
resumeMissionLocked 3682→3714, resumeMission 3762→3794, completeMission 3339→3361,
reconcileLocked 1976→1991, scheduleReconcile 3572→3604, steerMission 3511→3543,
peekMission 3544→3576, main 4399→4432, re-export block 4714→4730, emitFatal 111→116,
runLegacyNativeDirect 318→325, output 310→317, requireNoArgs 314→321, usage 294→301;
`surface.mjs:13`–`:18` folded to `:13-18` (array occupies 13–18, verified).
native-trial-launch: main 3229→3234, PROFILE 50→56, ADMITTED_PROFILES 59→65,
PROPOSAL_WAVE_CEILING 109→115, parseArgs 844→851, planLaunchMode 958→965, snapshotDispatchInputs 171→176,
resolveNativeDispatchPolicy 646→639, handOffToSightingWall 1282→1289, die 831→838,
validateDispatches 869→873, writeEvidenceFile 951→955, persistEvidenceWrites 973→977,
ROUTING_HEALTH_OUTCOMES 223→217, classifyFailure 682→758, base `die` 303→297, taskCalls 260→265,
taskDispatches 381→396, modelEvidence 275→276, attemptLedgerEntry 70→71, seatStatus 474→476,
verifyEffectiveLaunch 631→633, nativeReceiptDigests 520→522, buildCostLedger 1003→1005,
appendRoutingHealth 1067→1071, splitRoute 39→66, loadSeatRoutingMirror 155→173,
verifyLaunchSeatRouting 283→301, resolveNativeProfile 619→637, readRoundPlan 704→722,
waveTokenFromContext 780→798, loadCanonicalDirective 879→897, parseRateCard 908→926.
Each target was read at the pin and is the symbol's own declaration line, e.g.
`31c465f1:scripts/ufo-sighting.mjs:533` = `function writeManifest(state, env = process.env) {`,
`31c465f1:scripts/collect-omp-native-handoff-lib/policy.mjs:926` = `export function parseRateCard(budgets) {`.

Behavior sentences checked against the cited lines, not just the numbers:
- `sighting-wall.md:102-107` writeManifest→:533: the line's body bumps `registryRevision`, validates, refuses a
  symlinked leaf, writes `wx` 0600 tmp→fsync→rename→chmod→fsync(dir), fails `MANIFEST_TOO_LARGE` past
  `MAX_MANIFEST_BYTES` — sentence still exact.
- `:118` scheduleReconcile→:3604: :3605 spawns `[MODULE_PATH, "__reconcile", …]` — "spawns detached
  `__reconcile`" still true. `:329/`:48 `FAIL_CODE_PATTERN` live in surface.mjs.
- `native-trial-launch.md:352-363` launcher symbols all resolve at the pin; `main` at :3234 is
  `function main() {`, and the section's "Symbols re-verified live at the pin" list all exist.
- Collector/lib sections: every `:N` resolves inside its own member file (the gate rejects cross-file pairs;
  0 such anchors here).

## Revision labels

All 7 `(N L at \`964f443e\`)` headings verified against `git show 964f443e:<file> | wc -l`:
4304/1804/955/383/1163/924/745 = OK, none false. Sighting has no size headings. Every section that now carries
pin anchors also states the pin (`31c465f1`) in the section text, and the two notices say the 964f443e numbers are
retained as labelled numbers. `## Boundary crossings (still true at HEAD \`964f443e\`)` and the round-32 records
remain explicitly attributed to `964f443e`. **label-fail=0.**

## Findings

1. **HIGH (integration-conditional) — the patch is green only under the round-36 pairing amendment.**
   The gate build pairs ambiguity-aware (`scripts/claims-check.mjs:596-606` in ExecClaimsFidelity's lane:
   "Pairing is ambiguity-aware (round-36 amendment)"; both eligible sides → noid). Under the frozen contract's
   right-first rule the same notes read nonok=19/12. The notes assert the amendment in prose
   (`corpus/knowledge/sighting-wall.md:7` "adjacent-symbol ambiguity is a `noid` diagnostic by contract").
   If the L1 ships the frozen rule, C1's nonok=0 target fails on both notes and that sentence is false;
   if it ships the amendment (as implemented), the sentence is true but should cite the amendment, not "contract".
2. **MEDIUM — a false quoted literal survives on a reflowed line.** `corpus/knowledge/sighting-wall.md:205`
   still reads "`surfaceErrors` (`:50`) mines `fail(\"CODE\"` literals". Pin `scripts/ufo-sighting-lib/surface.mjs`
   has zero `fail("CODE"` occurrences at `31c465f1` and at `964f443e`; `surfaceErrors` (:50) mines
   `FAIL_CODE_PATTERN` (:48) over `MODULE_PATH` + `SURFACE_MODULE_PATHS`. The anchor is right; the quoted symbol is
   a paraphrase that never existed and is only `noid` (ungated) because it now sits between two eligible spans.
   ScoutFidSighting.md:… recommended dropping the backticks; the patch did not.
3. **LOW — "Live" table header now reads against the pin.** `corpus/knowledge/sighting-wall.md:44`
   `| Member | Live \`wc -l\` |` still holds the 964f443e values (4714/95/510/507/614/325; pin =
   4730/95/510/522/614/332). The intro/notice label the numbers 964f443e, so this is ambiguity, not a false label;
   renaming the column to "`wc -l` at `964f443e`" would remove it.
4. **LOW — one anchor token removed by the range fold.** Sighting anchors 71→70: `:13`+`:18` became `:13-18`.
   Same claim, one fewer gated token; acceptable but it is a coverage delta, not a pure renumber.
5. **VERIFICATION GAP (out of patch scope)** — the fidelity arm refuses `--pin` (`exit 64`,
   "unsupported argument: --pin"), so the two note lines carry no `src-rev=`. I supplied `--src` and asserted the
   revision separately; C1's "every verdict line names the revision it scored" still needs the PIN arm merged
   into the same file (the file's own integration note says the same).

## Residual risk
- Amended-rule `noid` anchors are ungated: 5 (sighting) + 2 (native-trial). I hand-verified all 7 against the pin;
  a future edit could break one without the gate noticing (diagnostic only by contract).
- `emitFatal` :111→:116 corrects a number that was already wrong at `964f443e` (was 116 there too); the note's
  "(region)" hedge was dropped — fine, but it means one "moved" claim is really an old defect, not a pin drift.
- Patch content equals the executor lane at generation; if the executor edits after this review, these hashes
  (`9624db2c…`/`608cc820…`) are the reviewed artifact.

## Commands (abridged, all read-only)
- `git apply --check /fast/scratch/kumitate-r36/w/ExecFidSighting.patch` → clean; `git apply` → 2 files M.
- `node scripts/claims-check.mjs --fidelity --self <applied> --src /fast/scratch/kumitate-r36/src`
  → the two lines above; process exit 1 because the corpus-wide verdict is DRIFT (other notes' debt).
- `node <review>/fid.mjs` / `fid-amended.mjs` (independent implementations, both reproduce the frozen prototype
  on the unpatched tree: 35/35) → nonok 0/0 amended, 19/12 frozen.
- `node <review>/audit.mjs` → per-anchor sentence/subject/cited-line table (31 frozen-nonok + 7 noid, all correct).
- `git -C <pin> show 964f443e:<file> | wc -l` for each labelled heading → all match.
- `node scripts/claims-check.mjs --self .=applied --src <pin>` → `CLAIMS: MATCH (rows=19 yes=19 notes=27
  sections=175 adv=6)`, errors=0; both notes' 12 member sections `live=true inFamily=true symbolHit=true`.
- No tool installs/upgrades; no writes outside my scratch dir and this report.
