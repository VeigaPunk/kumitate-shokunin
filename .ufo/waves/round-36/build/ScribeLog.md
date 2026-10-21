SCRIBE log pending lines=80 claims=2
---8<--- append-only draft for LOG.md (not applied; LOG.md untouched) ---8<---
- 2026-10-21 — round 36 (hyaku block 35–44, attempt 1; lane base master `0614092e0804aaca06642cb3a263a05c1cacc98e`,
  the round-35 verifier spot-check). Upstream source read only through a private clone at `/fast/scratch/kumitate-r36/src`,
  detached at `31c465f15669f744848bd9f5d56191c5085670f7` and `chmod a-w`; the operator checkout was never a measurement
  source (Q15; the committed pin carries a recreate one-liner that clones and detaches to the same revision). Fresh
  baseline before implementation (`.ufo/waves/round-36/baseline/`, 2026-10-21 00:57 −03), whole lines (Q7):
  `CHECKLIST: 11/13 pass` + `VERDICT: FAIL` (620 `Live sighting-surface conformance`, 625 `Proxy recompute`);
  `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)` at the pin (`SCRIPT_DIGEST_MISMATCH`,
  `VERB_UNDECLARED surface`, `SURFACE_UNREACHABLE dispatcher`; `errors=2` on the default src);
  `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=79 computed=80 delta=+1; AXES_DRIFT term=coverage declared=10
  computed=9; PIN_UNPINNED term=scripts/sources-check.mjs)`; `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`
  (warn `ROW_NO_SECTIONS` R5 and R7); FIDELITY prototype `TOTAL anchors=1530 ok=340 elsewhere=492 absent=96 dead=173
  noid=429 nonok=588`. Baseline selftests: claims 39/39, proxy 109/109, surface 42/42. Populations frozen before work
  (`.ufo/waves/round-36/frozen/`): R5 4 members, R7 5, R 88 runtime + 4 CLI, S 70 + 18, the 15 notes carrying non-ok
  anchors, and the sha256 set of 86 lane files. Two declared claims, causally separable, distinct axes:
  **Claim 1 — operability (lowest live axis, 8): every lane gate verdict names the revision it scored; the gates stop
  writing into the tree they read; anchor fidelity becomes a gate term and the lane's anchor debt burns down.**
  (a) `scripts/surface-probe.mjs` concatenates the manifest's declared `digestInputs` order (verified against
  `{shim, module} ∪ sorted lib/*.mjs` as a set) instead of re-sorting it: the declared order is `shim, module, base.mjs,
  argv.mjs, observe.mjs, surface.mjs`, declared-order `sha256:b36559d0…` equals `manifest.scriptDigest`, and the old
  sorted-order `sha256:f17d1547…` was the false `SCRIPT_DIGEST_MISMATCH`; `DIGEST_ORDER` stays a note (base before argv
  really differs from shim→module→sorted libs) and `DIGEST_INPUT_SET` stays a set test. (b) `readDispatcherStatus`
  spawns `node <src>/scripts/fleet-dispatcher.mjs status` with `cwd=<src>` and `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH`/
  `UFO_PROJECT_ROOT` in a `mkdtemp` removed afterwards; the pinned tree's before/after `find -printf '%p %s %T@'` listing
  diff is 0 lines, so `SURFACE_UNREACHABLE` dies without the probe creating `<src>/.ufo` (round 35's recorded cause).
  (c) `--known FILE` (KNOWN v1) pins the one upstream defect — `{surface:"sighting", kind:"VERB_UNDECLARED",
  check:"VERB_DISPATCH", subject:"surface"}` prints `KNOWN sighting/VERB_DISPATCH VERB_UNDECLARED surface` and leaves the
  error count; an expectation that stops firing is `KNOWN_STALE`; an unlisted finding stays an error; a differing
  revision is exit 2 `KNOWN_REV_MISMATCH`. (d) `--pin` (PIN v1) in `claims-check`, `proxy-check` and `surface-probe`
  resolves src from the pin clone, asserts `git -C <src> rev-parse HEAD` equals the pin (`SRC_REV_MISMATCH` exit 2;
  `SRC_REV_UNVERIFIABLE` exit 2) and prints `src-rev=<12 hex>`; with no pin file the gates behave as before.
  (e) `claims-check --fidelity` classifies each own-file member-section anchor against the adjacent backticked symbol
  (14-char window, right first); `nonok = elsewhere + absent` is the only gated quantity, `dead`/`noid` are printed
  diagnostics never gated or ratcheted; `--fidelity-ratchet` pins the revision and per-note ceilings, and a note absent
  from `notes` must read `nonok=0`. Before, on the pristine base under the contract's class definitions: 588 non-ok
  (per note: ops-watchers 189, remaining-scripts-census 177, sighting-wall 35, native-trial-launch 35,
  route-probe-cluster 31, cost-and-profile 25, failure-telemetry 22, runtime-support 14, loop-driver 11,
  runtime-remainder-census 11, swarm-wave-lifecycle 10, distill-and-l3 8, queue-and-claim 8, route-resolution 8,
  native-judge-pipeline 4); after: 0. (f) `SKILL.md`'s checklist grows one item (anchor fidelity, C 13 → 14). Claim 1
  is a gate walk, not an integer move: A=7 and C 13 → 14 give `f_O = 21/24 = 0.875 ⇒ 8` (20/23 before); 9 still needs
  A+C ≥ 27. ⟨FILL after falsify/integration: the four measured after-lines, each carrying `src-rev=31c465f1566` —
  `CHECKLIST: 14/14 pass`; `FIDELITY: CLEAN (… nonok=0 …)`; `PROXY: MATCH (… src-rev=31c465f1566 …)` (warn
  `PIN_UNPINNED scripts/sources-check.mjs` retained by round 34's decision); `SURFACE_PROBE: CLEAN (known=1 …)` — plus
  the new selftest counts, each mutation arm's kill result, and the claims-gate line at the pin (sections 175 + 9 new
  member sections; the R5/R7 `ROW_NO_SECTIONS` advisories retired).⟩
  **Claim 2 — coverage:runtime-layer (9 → 10 at the pin).** R5's 4 members get 4 internals-level `## ` sections in
  `corpus/knowledge/native-admission-detail.md` and R7's 5 get 5 in `corpus/knowledge/local-ship.md`, each with ≥1
  own-file anchor whose symbol sits on the cited line and ≥1 verbatim symbol. Before: R5/R7 `form=topic sections=0`,
  R 83/92, `floor(10 × 11/11 × 83/92)` = 9. After: R5 sections=4, R7 sections=5, adv=0, R distinct in-family 92/92
  (88 runtime + 4 CLI) ⇒ `floor(10 × 11/11 × 92/92)` = **10**; the C2 simulation
  (`.ufo/waves/round-36/evidence/c2-simulation.txt`) reads `R raw 95 distinct 92 score 10`. The 9 new sections are
  anchored at the pin and must read `nonok=0` under Claim 1's arm (`native-admission-detail` and `local-ship` are absent
  from the ratchet's `notes`, i.e. gated at 0). ⟨FILL: the measured `--row R5 --row R7 --strict` lines and the proxy R
  term.⟩
  **Fidelity repair per note (before → after, owner seat):** ops-watchers 189 → ⟨FILL⟩ (ExecFidOps);
  remaining-scripts-census 177 → ⟨FILL⟩ (ExecFidRemainder); sighting-wall 35 and native-trial-launch 35 → ⟨FILL⟩
  (ExecFidSighting); route-probe-cluster 31 → ⟨FILL⟩ (ExecFidRouteProbe); cost-and-profile 25, failure-telemetry 22,
  swarm-wave-lifecycle 10, distill-and-l3 8, queue-and-claim 8, route-resolution 8, native-judge-pipeline 4 → ⟨FILL⟩
  (ExecFidSmall); runtime-support 14, loop-driver 11, runtime-remainder-census 11 → ⟨FILL⟩ — no repair seat names these
  three in `.ufo/waves/round-36/build-spec.json` (36 anchors), so the L1 must assign them or record them as residue.
  Total 588 → ⟨FILL: ratchet total 0⟩.
  **Riders (uncounted):** the `corpus/README.md` coverage-map row for `lessons/round-35-verifier-spotcheck.md`
  (79 → 80 rows over 80 note files; the stanza reads `C=14`, `C2=80`, `C2_total=80`, `R_sections=92`,
  `coverage_runtime=10`); the `coverage:runtime-layer` `## Axes` row re-derived at 10; the three edited scripts'
  `pin.*` entries re-pinned after the final edits; the three committed pin files (`.ufo/pins/origin.json` per
  `kumitate-origin-pin-v1` — revision `31c465f15…`, clone `/fast/scratch/kumitate-r36/src`, `verified_at`
  2026-10-21 — `.ufo/pins/surface-known.json`, and `.ufo/pins/fidelity-ratchet.json`, the last listing exactly the
  15 non-ok notes at ceiling 0 and total 0).
  **Falsify wave** ⟨FILL: 81 seats planned (48 reviewer, 18 mutation-tester, 9 critic, 3 sentinel, 3 connector) over the
  10 attack families in `.ufo/waves/round-36/falsify-plan.md`; record verdict counts (holds/partial/refuted), every
  refuted or partial finding, and each correction applied before landing.⟩
  **Not fixed (recorded):** the upstream `surface` verb stays undeclared in the upstream manifest — the lane never
  patches the origin tree; KNOWN pins the defect, and once upstream declares the verb the expectation stops firing and
  `KNOWN_STALE` forces the pin's removal. Gates invoked without `--pin`/`--src` still resolve to `$UFO_SRC` or the lane
  checkout (portability, by design); `sources-check` remains outside the v1 pin set (round-34 decision) and its
  `PIN_UNPINNED` advisory is retained. The prototype's `dead` (173) and `noid` (429) anchors are outside the fidelity
  arm's claim: an anchor with no adjacent symbol or no math-checkable range is printed, never gated; liveness stays the
  registry gate's job, and a green anchor proves the paired symbol occurs on the cited line, not that the sentence is
  true (semantic re-reading is the falsify wave's job). The pin depends on a scratch clone under `/fast`; the committed
  recreate one-liner reproduces it from the operator repo's object store at the pinned revision. ⟨FILL: any build seat
  that dies, and the resolution of the three unassigned notes above.⟩
---8<--- end draft ---8<---
## Findings

1. **Dispatch gap: 36 non-ok anchors have no repair seat.** `runtime-support.md`
   (14), `loop-driver.md` (11) and `runtime-remainder-census.md` (11) appear
   only in the shared context blob of `.ufo/waves/round-36/build-spec.json`
   (`build-dispatch.json` offsets 34506/34526/34542), in no seat prompt. Assigned
   load is 552/588; `.ufo/pins/fidelity-ratchet.json` lists all 15 debt notes at
   ceiling 0, so `FIDELITY: CLEAN nonok=0` is unreachable until they are assigned.
2. **Two C2 notes have two editors.** `native-admission-detail.md` and `local-ship.md` are edited by
   `ExecFidSmall` (anchor repair) and by `ExecR5Sections`/`ExecR7Sections` (new sections); merge per
   file, and ExecFidSmall's before/after count for those two notes cannot be the final number.
3. **C2 needs no registry-row edit.** `scripts/claims-check.mjs:398-399` sets
   `form=section` from found sections; `SCORECARD.md:137,139` declare file counts
   (4/5) that 4/5 distinct sections satisfy. `evidence/c2-simulation.txt` shows
   the expected shape: `ROW R5 … sections=4`, `ROW R7 … sections=5`, `adv=0`.
4. **Ratchet has no slack.** The 15 keys in `.ufo/pins/fidelity-ratchet.json` are exactly the
   prototype's `nonok>0` notes; `gate-verdict`, `native-transcript-ledger-seats` and
   `test-inventories` read 0 and are unlisted, so the absent⇒0 rule leaves no room for new debt.
5. **Prototype v0 is not the contract's before.** `baseline/fidelity-prototype-v0.txt` reads
   `TOTAL anchors=993 ok=317 elsewhere=338 absent=46 no-id=122 dead=170 nonok=554`; the
   contract's reference is v1 (`baseline/fidelity-prototype-v1.txt:19`, nonok=588). The draft
   cites v1 only; the arm's own pristine-tree run is still unobserved.
6. **Integration was mid-flight at this write (02:28 −03).** `git status` now
   lists `M SCORECARD.md`, `M SKILL.md`, `M corpus/README.md`,
   `M corpus/knowledge/{live-surface-probe,local-ship,native-admission-detail}.md`,
   `M scripts/{proxy-check,surface-probe}.mjs`, `?? .ufo/pins/`; the pins are
   byte-identical to `ExecPinFiles`' scratch, `SKILL.md` carries 14 items (item
   14 = `--fidelity --fidelity-ratchet`), and `SCORECARD.md:286-302` reads
   `C=14 … R_sections=92 coverage_runtime=10`. But `grep -c fidelity
   scripts/claims-check.mjs` = 0, it has no `--pin`/`SRC_REV` either, and
   `scripts/surface-probe.mjs` has no `--known`/`SRC_REV`; checklist items 3 and
   14 cannot pass, and `sha256sum` gives `c298d168…`/`3f1b7c7b…` against the
   stanza pins `148cbf85…`/`5852fefd…`. No after-line is
   measured here; every one stays a fill slot.
7. **Digest ordering is verified.** `build/RevManifestDigest.md` shows the pinned list
   `base.mjs, argv.mjs, observe.mjs, surface.mjs`
   (`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs:13-18,36-45`) and the
   two hashes (declared `b36559d0…` = manifest, sorted `f17d1547…` = the baseline's value).
## Commands run (observed output)

```
git -C <lane> log -1 --format='%H%n%an <%ae>'  → 0614092e0804aaca06642cb3a263a05c1cacc98e / protocol-shokunin <protocol@shokunin.local>
baseline/checklists.txt                        → CHECKLIST: 11/13 pass; VERDICT: FAIL (620, 625 FAIL)
baseline/surface-pin.txt / surface-default.txt → SURFACE_PROBE: DRIFT errors=3 (pin) / errors=2 (default)
baseline/proxy-pin.txt                         → PROXY: DRIFT (C2_total 79 vs 80; AXES coverage 10 vs 9; PIN_UNPINNED)
baseline/claims-default.txt                    → CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6); ROW_NO_SECTIONS R5, R7
baseline/fidelity-prototype-v1.txt:19          → TOTAL anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588
node -e '<parse prototype>'                    → 18 notes with anchors, 15 with nonok>0, sum 588
node -e '<scan 96 build-spec prompts>'         → no seat names runtime-support/loop-driver/runtime-remainder-census
node -e '<README rows vs corpus files>'        → rows 79; corpus md files 83; only note missing a row: lessons/round-35-verifier-spotcheck.md
grep -c '^\s*- \[' SKILL.md                    → 14 (item 14 = anchor fidelity, SKILL.md:640)
evidence/c2-simulation.txt                     → R5 sections=4; R7 sections=5; adv=0; "R raw 95 distinct 92 score 10"
sed -n '398,399p' scripts/claims-check.mjs     → form becomes 'section' when sections exist
cmp .ufo/pins/*.json <ExecPinFiles scratch>    → all three byte-identical; origin.json revision = pin
grep -n "SRC_REV\|--pin\|fidelity\|ratchet" scripts/claims-check.mjs → no match; grep -c src-rev → 0
grep -c 'src-rev' scripts/proxy-check.mjs      → 14; surface-probe.mjs / claims-check.mjs → 0
sha256sum scripts/{surface,proxy,claims}-check.mjs → c298d168… / 3f1b7c7b… / e9a21b44… (only claims matches its stanza pin)
```

No files written outside this report; no git/jj mutation; pinned clone read
only. No tools installed or upgraded.
## Out of scope

`SCORECARD.md`, the round report, the lesson, `corpus/SOURCES.md` and filed-report
tracking are sibling scribe seats; `LOG.md` is not edited (the draft above is the
deliverable). The falsify wave has not run, so its verdict counts are unknown.
