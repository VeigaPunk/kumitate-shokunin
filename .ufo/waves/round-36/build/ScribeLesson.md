SCRIBE lesson drafted mistake-rows=5 gate-slots=16

# ScribeLesson — corpus/lessons/round-36.md draft (text for the L1; this file is the only write)

Drafted in the round-36 build wave. Counts below are quoted only from
`.ufo/waves/round-36/baseline/`, `.ufo/waves/round-36/evidence/` or the wave's own reports;
I ran no lane gate and measured nothing new. The `## Gate` section is the skeleton of the
commands that will admit C1/C2 after integration — no "after" result is asserted here,
because `.ufo/waves/round-36/build/` held only `swarm-registry.json` at draft time.

## Evidence read (read-only)

- `cat .ufo/waves/round-36/baseline/{checklists,surface-default,surface-pin,proxy-default,proxy-pin,selftest-surface,selftest-claims}.txt`
  → `CHECKLIST: 11/13 pass` (620/625 FAIL); `SURFACE_PROBE: DRIFT` errors=2 default src /
  errors=3 at the pin (`SURFACE_UNREACHABLE` dispatcher); `PROXY: DRIFT` `C2_TOTAL_DRIFT
  declared=79 computed=80` + `AXES_DRIFT coverage row=10 derived=9`.
- `git show --stat --oneline 0614092` → `1 file changed, 197 insertions(+)`,
  `corpus/lessons/round-35-verifier-spotcheck.md` only.
- `grep -n round-35-verifier corpus/README.md` → no match (exit 1).
- `ls -ld /fast/scratch/kumitate-r36/src` → `dr-xr-xr-x` (a-w clone).
- `grep -n "UFO_STATE = \|const LEDGER_PATH" /fast/scratch/kumitate-r36/src/scripts/fleet-dispatcher.mjs`
  → `:42` `resolve(process.env.UFO_STATE_DIR || join(ROOT, ".ufo"))`; `:90` ledger under it;
  `sed -n '450,466p'` → `:462 mkdirSync(dirname(LEDGER_PATH), …)` inside `assertLedgerPath()`,
  called unconditionally from `main()` (`:8955`) before the `status` branch (`:9022`).
- `grep -n "SURFACE_MODULE_PATHS\|const inputs = \[SHIM_PATH" /fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs`
  → `:13` list order `base.mjs, argv.mjs, observe.mjs, surface.mjs`; `:36` concat input order
  `[SHIM_PATH, MODULE_PATH, ...SURFACE_MODULE_PATHS]`.
- `grep -n "function sightingBytePaths\|function checkDigests\|Buffer.concat(paths" scripts/surface-probe.mjs`
  → `:290`, `:547`, `:585` (disk-derived, sorted libs).
- `grep -n "C2\b" scripts/proxy-check.mjs` → `:755` `C2 = countLines(readmeText, RE_README_ROW)`,
  `:756` `C2Total = notes.length`.
- `sed -n '1645,1655p' LOG.md` → `:1651` «Repo-wide fidelity sweep at the pin: S regressed anchors
  223 → 182.»; `.ufo/waves/round-35/final/cite.txt:4` `src=/home/vgpnk/Projects/ufo-fsd-alpha (index 1212 files)`;
  `.ufo/reports/round-35/kumitate.md:44` «per-file cite-check errors 91 (master clone) → 30», `:46`
  «Per-file cite-check vs a master clone with the same src: no edited file rose.»;
  `corpus/lessons/round-35-verifier-spotcheck.md:166-188` Routed defects 2 and 4.
- `cat .ufo/waves/round-36/evidence/c2-simulation.txt` → `ROWS: 2 YES: 2 … SECTIONS: 9`;
  `ROW R5 form=section notes=1 sections=4`, `ROW R7 form=section notes=1 sections=5`;
  `R raw 95 distinct 92 score 10` (simulation, not a final gate run).
- `.ufo/waves/round-36/claims.md` (frozen claims) and `python3 -c 'json…'` over
  `.ufo/waves/round-36/build-spec.json` for the ScribeSources/ScoutSource* item prompts (row ids).

---

# Round 36 — lessons (kumitate)

Round base: lane master `0614092e0804aaca06642cb3a263a05c1cacc98e`. Upstream source is read
only through the private read-only clone `/fast/scratch/kumitate-r36/src`, detached at
`31c465f15669f744848bd9f5d56191c5085670f7` (`chmod a-w`); the operator checkout
`~/Projects/ufo-fsd-alpha` is never a measurement source. Claims frozen before implementation
in `.ufo/waves/round-36/claims.md`: **C1 operability** (every gate verdict names the revision
it scored, gates stop writing into the tree they read, anchor fidelity becomes a gate term and
the lane's anchor debt burns down) and **C2 coverage:runtime-layer** (R5's 4 and R7's 5
members get internals-level `## ` sections at the pin). Before, in
`.ufo/waves/round-36/baseline/`: `CHECKLIST: 11/13 pass`; `SURFACE_PROBE: DRIFT` (errors=2 at
the default src, errors=3 at the pin); `PROXY: DRIFT` (`C2_TOTAL_DRIFT declared=79
computed=80`; `AXES_DRIFT coverage 10 vs 9`); `CLAIMS: MATCH (rows=19 yes=19 notes=27
sections=175 adv=6)` with R5 and R7 at `form=topic sections=0`; the fidelity prototype at
`nonok=588` (anchors=1530, ok=340, elsewhere=492, absent=96, dead=173, noid=429).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| Checklist verdict follows the operator's moving checkout (carried from round 35) | `.ufo/waves/round-36/baseline/checklists.txt`: `CHECKLIST  FAIL SKILL.md:620 … Live sighting-surface conformance` and `SKILL.md:625 … Proxy recompute`, `CHECKLIST: 11/13 pass`, exit 1; the default is derived in `scripts/claims-check.mjs:89` (`resolveSrcDefault`) and `scripts/proxy-check.mjs:265`; the class was already named in `corpus/lessons/round-35.md` §Mistakes and pre-registered for round 36 | round-36 baseline checklist run; unfixed in round 35 | Round 36 C1 pin: `--pin` (default `<self>/.ufo/pins/origin.json` when present) resolves src from the pin's clone, asserts the revision and prints `src-rev=` in the verdict; checklist item 620 gains `--known`, 625/627 inherit the pin default, and one fidelity item is added (13 → 14). Admission slot: `node scripts/surface-probe.mjs --checklists`; at draft time `SKILL.md` still carries the 13 items. |
| Probe re-sorted the manifest's declared digest order and reported a false `SCRIPT_DIGEST_MISMATCH` | `baseline/surface-default.txt` and `surface-pin.txt`: `ERROR SCRIPT_DIGEST_MISMATCH … concatenated-byte digest sha256:f17d1547… != manifest.scriptDigest "sha256:b36559d0…"` while `DIGEST_INPUT_SET` and `DIGEST_PER_FILE` are ok and `DIGEST_ORDER` is only a note; `scripts/surface-probe.mjs:290` (`sightingBytePaths`, `.sort()` on lib `*.mjs`) feeds the concat at `:585` (`checkDigests` `:547`); upstream `scripts/ufo-sighting-lib/surface.mjs:13-18` declares `base.mjs` before `argv.mjs` and `:32-40` hashes `[SHIM_PATH, MODULE_PATH, ...SURFACE_MODULE_PATHS]`; `baseline/selftest-surface.txt` records the intended rule «digestInputs set complete but order permuted → DIGEST_ORDER note, no error» | round-36 baseline; round-35 lesson §Held deferred the fix to round 36 | Concatenate the manifest's declared `digestInputs` order (DIGEST order fix); keep `DIGEST_ORDER` a note when the declared order differs from shim → module → sorted libs. |
| Read-only pin clone made the dispatcher surface unreachable because `status` wrote under `<src>/.ufo` | `baseline/surface-pin.txt`: `ERROR SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1`, with `STATUS_SHAPE`/`STATUS_QUEUE_SCHEMA` cascading (errors=3); `scripts/fleet-dispatcher.mjs:42` (state root), `:90` (ledger path), `:458-462` (`assertLedgerPath()` does `mkdirSync(dirname(LEDGER_PATH), …)`), called for every verb at `:8955` before the `status` branch `:9022`; the clone is `dr-xr-xr-x` | round-36 baseline pin run | `readDispatcherStatus` (`scripts/surface-probe.mjs:402`) spawns `node <src>/scripts/fleet-dispatcher.mjs status` with `UFO_STATE_DIR=<mkdtemp>/ufo`, `UFO_PENDING_WORK_PATH=<mkdtemp>/ufo/pending-work.json`, `UFO_PROJECT_ROOT=<src>`, removes the temp dir, and proves the `<src>` file list + mtimes are unchanged before/after. |
| 79/80 C2 row miss landed by the round-35 verifier note | `baseline/proxy-pin.txt`: `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=79 computed=80 delta=+1`; `scripts/proxy-check.mjs:755-756` (`C2` = README rows, `C2Total` = note files); `git show --stat 0614092` → one added file, `corpus/lessons/round-35-verifier-spotcheck.md`; `grep -n round-35-verifier corpus/README.md` → no row | round-36 baseline proxy run; the non-author verifier note landed at `0614092` outside the lane's README-map discipline | Add the README row for `lessons/round-35-verifier-spotcheck.md` (literal from ScoutProxyC2) and re-admit at `C2_total` 80/80, restoring `coverage=10`. |
| Round-35 asserted two comparisons with no committed command+output | `LOG.md:1651` «Repo-wide fidelity sweep at the pin: S regressed anchors 223 → 182.» — 223 is committed in `.ufo/waves/round-35/build/ExecFidelitySweep.md:1` (`regressed=223`), 182 appears only as prose; `.ufo/waves/round-35/final/cite.txt:4` names `src=/home/vgpnk/Projects/ufo-fsd-alpha (index 1212 files)`; `.ufo/reports/round-35/kumitate.md:44` «per-file cite-check errors 91 (master clone) → 30» and `:46` «no edited file rose» carry no command+output; routed by `corpus/lessons/round-35-verifier-spotcheck.md:174-181` (defect 2) and `:185-188` (defect 4) | non-author spot-check, not the lane | Round 36 routes both to ScoutCiteProvenance (re-run on the pinned clone only, commit command+output) and ProvCiteRuns (verify); claim-supporting cite runs must print `src-rev=` under PIN v1. Draft-time state: no re-run output in `.ufo/waves/round-36/build/` yet. |

## Gate

Admission bar: `corpus/QUALITY.md` Q1–Q15. Slots run from the lane root against the pin
`/fast/scratch/kumitate-r36/src` at `31c465f1`; no slot may write under `<src>`.

**C1 — operability.**

1. Pin assertion — `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → full
   `31c465f15669f744848bd9f5d56191c5085670f7`.
2. Pin negative arms — `node scripts/claims-check.mjs --src <repo at another revision>` →
   `SRC_REV_MISMATCH` exit 2; `--src <non-repo dir>` → `SRC_REV_UNVERIFIABLE` exit 2.
3. Surface live — `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` →
   `SURFACE_PROBE: CLEAN (… known=1 … src-rev=31c465f1566)` exit 0, with the upstream
   `VERB_UNDECLARED surface` finding printed as `KNOWN sighting/VERB_DISPATCH …`.
4. Known-staleness arm — the listed finding removed or renamed → `KNOWN_STALE` error, exit 1.
5. Fidelity live — `node scripts/claims-check.mjs --fidelity --fidelity-ratchet
   .ufo/pins/fidelity-ratchet.json` → per-note `FIDELITY note=… nonok=0`, `FIDELITY_TOTAL …
   nonok=0`, `FIDELITY: CLEAN (… src-rev=31c465f1566)` exit 0.
6. Fidelity fail-closed arms — malformed ratchet, stale `revision`, or a note above its
   ceiling → exit 2 (`RATCHET_MALFORMED` / `RATCHET_REV_STALE`) or exit 1 on an over-ceiling note.
7. Proxy live — `node scripts/proxy-check.mjs` → `PROXY: MATCH (… src-rev=31c465f1566)` exit 0,
   with `C2_total` at the landed note count and `## Axes` derived == declared.
8. Checklist — `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 14/14 pass`,
   `VERDICT: PASS` exit 0, every item carrying the pin (default or explicit).
9. Hermetic suites — `node scripts/surface-probe.mjs --selftest`,
   `node scripts/claims-check.mjs --selftest`, `node scripts/proxy-check.mjs --selftest` →
   `VERDICT: PASS` each (counts rise from the baseline 39/39 claims suite; quote the new totals).

**C2 — coverage:runtime-layer.**

10. Row gate — `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5
    --row R7 --strict` → `ROW R5 form=section … sections=4`, `ROW R7 form=section …
    sections=5`, `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)` (the wave simulation
    `.ufo/waves/round-36/evidence/c2-simulation.txt` already reads these counts).
11. Layer term — `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src` →
    `R=92/92 coverage:runtime-layer=10`; the same simulation prints `R raw 95 distinct 92`.
12. New-section fidelity — the C1 fidelity run's lines for
    `corpus/knowledge/native-admission-detail.md` and `corpus/knowledge/local-ship.md` read
    `nonok=0` (covers the 9 new member sections).

**Source rows opened this round** (drafted by ScribeSources in the frozen 11-column shape).

13. **S029** — own-work, the pinned-revision census behind C2: R5's 4 members and R7's 5
    members, with section counts, read through the private clone at `31c465f1`; anchor = the
    clone's `rev-parse HEAD` plus the member enumeration.
14. **S030** — pytest strict expected-failure semantics
    (`https://docs.pytest.org/en/stable/how-to/skip.html`, xfail strict / XPASS), teaching
    KNOWN v1: an expectation that stops firing must fail.
15. **S031** — `git rev-parse` revision-specification semantics
    (`https://git-scm.com/docs/git-rev-parse`), teaching PIN v1: name the revision scored and
    fail closed when it cannot be verified.
16. **S032** — conditional on ScoutSourceRepro: the reproducible-builds provenance page is
    admitted only with a supporting verbatim quote; otherwise the row stays REJECTED with its
    flip condition.

Not drafted here: the `## Falsify wave` paragraph — it lands after the falsify wave, and the
after-values above are targets from `.ufo/waves/round-36/claims.md`, not observed runs.
