CRITIC known modes=13 handled=7 gaps=6

# CriticKnownStrictness: KNOWN v1 attacked (round 36 build, operability / C1)

**Target.** I attacked the KNOWN v1 wave contract and its integrated implementation. The production `scripts/surface-probe.mjs` (sha256 `c298d168…`, 1971 lines) already carries ExecSurfaceKnown's `loadKnown`/`applyKnown`/`readActivePin`/`resolveKnown`. The PIN arm (`src-rev=`, PIN_MALFORMED) is not integrated yet. `.ufo/pins/surface-known.json` declares exactly `{sighting, VERB_UNDECLARED, VERB_DISPATCH, surface}`. That tuple is genuinely upstream-owned: the dispatch arm is at `src/scripts/ufo-sighting.mjs:4484`, and `surface` is absent from both `verbs` (`ufo-sighting-lib/surface.mjs:74-202`) and `extras` (`:203-239`).

**Method.** All runs were in memory and read-only. I fed `node --input-type=module` the probe's own source on stdin, with `process.exitCode = main();` stripped. I rebound `readFileSync`/`existsSync` in memory to inject EACCES errors and to serve virtual known/pin files. I called `probeConformance` with injected readers and `src=/fast/scratch/kumitate-r36/src`. No upstream verb was spawned and no file was written. My synthetic manifest's declared-order concat is `sha256:b36559d0…`, which equals the real `manifest.scriptDigest` (`baseline/surface-pin.txt:5`). The sorted concat is `sha256:f17d1547…`, the old false mismatch. In the harness rows, `PIN_DIGEST` FAIL and `PIN_DRIFT` come from using a synthetic manifest; the real pin reads PIN_MATCH.

**Legend.**
- **HANDLED**: the contract text prevents the mode.
- **HANDLED(impl)**: only the implementation prevents it; the contract text is silent. Freeze the rule into the contract. These count as handled in the totals.
- **GAP**: reachable in production now.

## Mode table

| # | Mode | Fixture (input) | Observed now (production probe) | Status | Minimal contract change → expected code |
|---|------|-----------------|------------------|--------|------------------------------------------|
| M1 | Different occurrence bundled into one finding | manifest leaves `surface` and `peek` undeclared; known=[surface] | P3: `ERROR VERB_UNDECLARED … peek, surface` and `KNOWN … surface`; DRIFT exit 1, errors=1, **known=1** | HANDLED(impl): subjects are split per entity and every subject must be listed (`:414`); the wave text never defines `subject` | A1: freeze the subject rule; `known=` should count excused findings, not entries that fired → DRIFT exit 1, known=0 |
| M2 | Different occurrence absorbed by an entity subject | known += `{sighting, ERROR_CODE_OFF_MANIFEST, ERROR_CODES, UNEXPECTED_ERROR}` | P9: one entry swallows both `ufo-sighting.mjs:2468` and `base.mjs:131` (`surface-pin.txt:7`), plus any future site. The census line vanishes; CLEAN known=4 | GAP (display only, because the warn is non-gating) | A2: KNOWN excuses error-severity kinds only; a warn/note kind → `KNOWN_MALFORMED` exit 2 |
| M3 | Two probe findings with the same tuple | digestInputs gains two extra `argv.mjs` rows with bad sha; known=[DIGEST_MISMATCH `scripts/ufo-sighting-lib/argv.mjs`] | K8-prod: one finding excused, one `ERROR DIGEST_MISMATCH` (plus DIGEST_SET_INCOMPLETE); DRIFT exit 1 | HANDLED(impl), only because `byQuad.set` overwrites and the last finding wins (`:400`) | A1: one entry excuses exactly one occurrence; two or more findings on one tuple → `KNOWN_AMBIGUOUS` error |
| M4 | Two known entries with the same tuple | `findings:[T,T]` | `KNOWN_MALFORMED` exit 2 (`:367`) | HANDLED(impl) | Freeze into the contract text |
| M5 | Exception path reports nothing | known=[surface]; `ufo-sighting-lib/observe.mjs` unreadable (EACCES) | P2b: DIGEST_PER_FILE, DIGEST_CONCAT and ERROR_CODES all FAIL with **zero findings** (`:786`, `:808-810`, `:857-859`) → `SURFACE_PROBE: CLEAN (… errors=0 warnings=1 known=1)` exit 0. The same input without `--known` was DRIFT exit 1 (H4, pre-KNOWN probe) | **GAP**: KNOWN removes the one error that kept the run red | A3: CLEAN requires every FAIL slot to carry at least one finding (gating or KNOWN). An unexplained FAIL slot → new error `CHECK_UNEXPLAINED` (add it to SEVERITY so SUITE_CODES forces a fixture); KNOWN-only slots render `KNWN`, not `FAIL`. Expected for P2b: DRIFT exit 1 |
| M6 | Probe stops before the expected check runs | known=[surface]; manifest stdout `{ not json`, or module EACCES | P4: FAIL-CLOSED exit 2. K5: DRIFT exit 1. Both print `ERROR KNOWN_STALE … did not fire`, which is false: the check never ran | HANDLED (the gate holds); the diagnostic misleads | When the entry's slot carries a skip detail (`manifest unparsed` / `unreadable` / `surface unreachable`), emit `KNOWN_UNEVALUATED` (error) instead of KNOWN_STALE |
| M7 | KNOWN excuses a reachability or whole-surface finding | known += `{dispatcher, SURFACE_UNREACHABLE, STATUS_REACH, dispatcher}`; dispatcher reader returns `status exited 1` | P1: **CLEAN exit 0, known=2**, with STATUS_REACH, STATUS_SHAPE and STATUS_QUEUE_SCHEMA all FAIL. P1b: same via `{dispatcher, STATUS_SHAPE, STATUS_SHAPE, status}`. `loadKnown` accepts any SEVERITY kind (`:365`), including SURFACE_UNREACHABLE, SCRIPT_DIGEST_MISMATCH/`scriptDigest` and KNOWN_STALE (L1) | **GAP**: P1 is exactly the move-(b) baseline (`surface-pin.txt:8`), so a failed mkdtemp fix or a regressed digest order could be laundered as "known" | A2: eligible = error kinds whose subject names one entity (verb, code, path, status key). SURFACE_UNREACHABLE, MANIFEST_*, CHECKLIST_GRAMMAR, KNOWN_*, SCRIPT_DIGEST_MISMATCH, subject `status`, and surface/check names outside SURFACE_NAMES/CHECK_ORDER → `KNOWN_MALFORMED` exit 2, before any read |
| M8 | Known set grows without failing the checklist | add any excusable entry | `SKILL.md:629` expects only `SURFACE_PROBE: CLEAN`, which is met at known=1, 2 (P1) and 4 (P9). The `claims.md:19-20` target `SURFACE_PROBE: CLEAN (known=1 …)` is never printed; the implementation prints `… warnings=N known=1)` (`:1019-1022`) | **GAP** | A5: with `--known`, open the verdict as `SURFACE_PROBE: <V> (known=<n> …)` and make item 629 expect `SURFACE_PROBE: CLEAN (known=1 `. P1 and P9 then fail the checklist |
| M9 | Upstream fixes the defect, so the expectation stops firing | `surface` added to `manifest.verbs`; known=[surface] | P6: `ERROR KNOWN_STALE`; DRIFT exit 1 | HANDLED (contract) | None. A pinned gate that keeps reading CLEAN at `31c465f15669` while upstream HEAD is fixed is the intended tradeoff: the verdict names the revision it scored |
| M10 | Upstream "fixes" the defect in a shape the probe does not read, so the expectation still fires | the pin advances; upstream declares `surface` outside `verbs ∪ extras` (the probe's declared set D, `:834`); the known file's revision is bumped by hand | The entry keeps matching → CLEAN. Strict staleness proves the finding still fires, not that upstream still owns the cause, so KNOWN launders a lane parse gap. [INFERENCE: that upstream shape is hypothetical; the `:834` mechanism is observed] | **GAP** | A6: the known file binds `inputs.sighting = manifest.scriptDigest` (`sha256:b36559d0…` today). If the live digest (verified by DIGEST_CONCAT) differs from the bound one, every sighting entry → `KNOWN_STALE` (inputs changed), DRIFT exit 1. This also catches a dirty tree at the pinned HEAD |
| M11 | Known file copied across revisions, pin active | revision `31c465f1` (abbreviated) or junk, against pin `31c465f1…70f7` | `KNOWN_REV_MISMATCH` exit 2 (R3, R4; `:1915-1926`) | HANDLED (contract) | None |
| M12 | Known file copied across revisions, no pin active | `--self` points at a directory without `.ufo/pins/origin.json`; `--src` is a git tree at another commit; or `origin.json` is corrupt | R1: revision `not-a-revision` accepted. R2: corrupt pin hits `catch { return null; }` (`:438`), becomes "no pin", and is accepted. The PIN arm refuses the same file as PIN_MALFORMED (`w/ExecSurfacePin/lane/scripts/surface-probe.mjs:352-353`), so the script has **two pin authorities** | **GAP** | A4: delete `readActivePin` (`:426-439`); KNOWN takes the PIN arm's verified pin. With no pin, `--known` itself requires `git -C <src> rev-parse HEAD` == `known.revision` (40 hex), else exit 2 `KNOWN_REV_MISMATCH` / `KNOWN_REV_UNVERIFIABLE`. [CLI path not run; `resolveKnown` is the decision point] |
| M13 | Over-matching (prefix, case, missing subject) | known subject `surf` | K7: KNOWN_STALE plus VERB_UNDECLARED; DRIFT exit 1, errors=2. A missing subject → KNOWN_MALFORMED (implementation selftest) | HANDLED ("exactly" in the contract) | Add the kill fixture below |

## Strongest counterexample (M5 and M7 combined)

The gate can read `CLEAN` exit 0 while three or four checks FAIL. The cause is that the verdict counts *findings* (`:693-698`), and the probe has slot failures that emit no finding at all. Before KNOWN, the upstream VERB_UNDECLARED error happened to keep such runs red. With `--known` excusing it, nothing does. Separately, P1 shows one excused finding hiding a whole surface (three slots).

Impact: C1 / operability. The after-target `SURFACE_PROBE: CLEAN (known=1)` is not proof that 11 of 12 checks pass unless A2 and A3 land. C2 is not touched.

This is a fixable defect, not a tradeoff. Until it is fixed, the judge should not accept a bare CLEAN as evidence for C1.

## Smallest safe correction (KNOWN v1.1 text; in priority order)

1. **A2 (M2, M7)**: an eligibility allow-list in `loadKnown`, replacing the `Object.hasOwn(SEVERITY)` test at `:365`.
2. **A3 (M5)**: add the CHECK_UNEXPLAINED term, and render KNOWN-only slots as `KNWN`. P0 currently prints `FAIL sighting VERB_DISPATCH` under a CLEAN verdict.
3. **A5 (M8)**: print `known=<n>` first in the verdict, and pin `known=1` in SKILL.md item 629.
4. **A4 (M12)**: KNOWN consumes the PIN arm's verified pin; without a pin, verify git HEAD directly.
5. **A6 (M10)**: content binding of `inputs.sighting`.
6. **A1 plus diagnostics (M1, M3, M4, M6)**: freeze the implementation's subject, cardinality and duplicate rules into the contract text; add `KNOWN_UNEVALUATED`; make `known=` count excused findings only.

## Selftest gap (feeds MutKnown mutant 2)

A subject-blind matcher survives all four implemented KNOWN fixtures. I patched `knownKey` in memory to drop `subject` and ran `applyKnown` on each fixture:

| Fixture | Original | Mutant |
|---|---|---|
| match | errors 0 | errors 0 |
| stale (clean tree) | errors 1 | errors 1 |
| two | errors 1 | errors 1 |
| both | errors 0 | errors 0 |
| **kill: tree firing `neaky`, known=[ghost]** | stale=1, errors=2 | stale=0, errors=1 |

Add the kill fixture: expect `KNOWN_STALE` plus `VERB_UNDECLARED`, errors=2, DRIFT exit 1.

## Commands run (all read-only)

- `wc`, `stat`, `cat`, `ls` and `git status --short` on the lane, plus reads of `build-spec.json` and `claims.md`, and reads and greps of `scripts/surface-probe.mjs`, `SKILL.md`, `.ufo/pins/*.json`, the `w/ExecSurfaceKnown.patch` file and the `w/ExecSurfacePin` lane probe.
- Upstream greps on the pinned clone: `ufo-sighting.mjs` dispatch arms (`:4436-4691`) and `surface.mjs` order and verbs (`:13-18`, `:74-239`).
- Three harness passes with `node --input-type=module`, source on stdin:
  - the pre-KNOWN production probe (rows H0–H6);
  - the ExecSurfaceKnown lane copy, sha256 `eec7af87…` (rows K0–K9, L1–L2, R1–R4, plus the subject-drop mutant);
  - the integrated production probe, sha256 `c298d168…` (rows P0–P9, K8-prod, L1, R1–R2).

  The quoted outputs are in the table above. Representative verdicts:
  - P1: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=2 known=2) exit=0`
  - P2b: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1) exit=0`
  - R2: `{"ok":true,"known":{…"revision":"not-a-revision"…}}`

The production file changed twice while I worked (tags #64F1 → #61D5 → #7A7D: the L1 was integrating). Line numbers above refer to #7A7D.

**Not observed:**
- I did not run the live probe at the pin. It spawns the upstream `surface` and `status` verbs, and the baseline output already exists.
- Whether EACCES can occur in a fresh clone: git stores only 644/755 modes, so M5 needs a local chmod or an I/O fault. The no-finding code path itself is observed.

Tooling: nothing installed or updated.
