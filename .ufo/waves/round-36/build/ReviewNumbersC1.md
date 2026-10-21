REVIEW numbers-c1 before="{fidelity:nonok=543,checklist:11/13,proxy:DRIFT,surface:DRIFT(errors=3)}" after="{fidelity:nonok=0,checklist:14/14,proxy:MATCH,surface:CLEAN(known=1)}"

# ReviewNumbersC1 — independent re-measurement of C1 before/after

Read-only; no lane file edited, no git/jj mutation. Origin read only from
`/fast/scratch/kumitate-r36/src` (chmod a-w; `git status` empty before/after every run).
Lane before `0614092e0804aaca06642cb3a263a05c1cacc98e`; after
`3d5760a8a4746a2fd18eb0f7bad1ec716d421987`, re-ran at `0b5dcfbe4b69f04fc4c9ab106ba207de8cb5e676`
(`git diff 3d5760a..0b5dcfb` touches only `.ufo/waves/round-36/build/*.md`; all four after
verdicts byte-identical at both). Origin revision for every run:
`31c465f15669f744848bd9f5d56191c5085670f7` (`src-rev=31c465f15669`); the before-arms predate PIN v1
and print no `src-rev=`. Measured HEAD artifacts: claims `5a03ad08…373a`, proxy `f9416d66…f1d9`,
surface `1361075d…78b5`, SCORECARD `b61f40c2…89e9`.

## (a) FIDELITY — pristine 0614092 corpus vs delivered corpus, same arm, same pin

Before stages the delivered `scripts/claims-check.mjs` (byte-identical to HEAD's) over a pristine
0614092 clone plus the three pins (`/tmp/r36-before-arm2`). 0614092's own script has no
`--fidelity` (same command there → usage, exit 64), so this is the authoritative same-arm before.

```
$ cd /tmp/r36-before-arm2 && node scripts/claims-check.mjs --fidelity --src /fast/scratch/kumitate-r36/src
FIDELITY_TOTAL anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543
FIDELITY: DRIFT (nonok=543 src-rev=31c465f15669)
EXIT=1
$ cd /tmp/r36-before-arm2 && node scripts/claims-check.mjs --fidelity \
    --fidelity-ratchet .ufo/pins/fidelity-ratchet.json --src /fast/scratch/kumitate-r36/src
FIDELITY: DRIFT (RATCHET_NOTE note=corpus/knowledge/cost-and-profile.md nonok=24 ceiling=0; …)
EXIT=1
```

```
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && \
  node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json
FIDELITY_TOTAL anchors=1574 ok=867 elsewhere=0 absent=0 dead=168 noid=539 nonok=0
FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)
EXIT=0
```

Per-note lines sum exactly to the totals (543 before, 0 after). Frozen prototype evidence is 588
(re-ran `baseline/fidelity-prototype-v1.txt`: 588 confirmed); the L1 reference is 577; the delivered
arm's own pristine run is 543 (unique-path anchor resolution; a shared-note section counted once).
Same-arm **543 → 0** — but see finding 1: a clause-guarded arm would put the before at 357.
## (b) CHECKLIST

```
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && UFO_STATE_DIR=/tmp/r36-cl-state.8sxlTL/ufo \
  UFO_PENDING_WORK_PATH=/tmp/r36-cl-state.8sxlTL/ufo/pending-work.json \
  node scripts/surface-probe.mjs --checklists            # lane HEAD = 0614092
CHECKLIST_SKIPPED: 0
CHECKLIST: 11/13 pass
VERDICT: FAIL
EXIT=1
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node scripts/surface-probe.mjs --checklists
CHECKLIST_SKIPPED: 0
CHECKLIST: 14/14 pass
VERDICT: PASS
EXIT=0
```

Before output is byte-identical to `baseline/checklists.txt` apart from its `EXIT=1` line; the temp
state root only stops the 0614092 probe attempting a write into the default source.
## (c) PROXY — at the pin, both sides

```
$ cd /tmp/r36-before && node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=79 computed=80 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=79 computed=80 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/sources-check.mjs)
EXIT=1
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node scripts/proxy-check.mjs
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=82/82 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0
```

`/tmp/r36-before` = `git archive 0614092 | tar -x`; that proxy has no `--pin` (usage/64), so the pin
is applied via `--src`; measured revision 31c465f1.
## (d) SURFACE_PROBE — at the pin, with the known manifest

```
$ cd /tmp/r36-before && node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r36/src
SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)
EXIT=1
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && \
  node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json
SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)
EXIT=0
```

0614092 cannot consume `--known` (verified: usage, exit 64), so the before line is the pin run
without it — identical to `baseline/surface-pin.txt`.
## Positively verified

- No rerouting: `--src /tmp/r36-before-repo` (repo at 0614092) → `SRC_REV_MISMATCH` exit 2 on all
  three gates; `GIT_DIR=<pin>/.git` + `--src corpus` still rejects; non-repo → `SRC_REV_UNVERIFIABLE`
  exit 2 (`scripts/claims-check.mjs:181`, proxy pin arm, `scripts/surface-probe.mjs:494`).
- No writes: `find src -printf '%p %T@ %s' | sort` identical across a fid+proxy+surface+claims
  sweep; `git -C src status` empty; lane sources clean. `readDispatcherStatus` and the shim's
  `NODE_COMPILE_CACHE` both use removed mkdtemp roots.
- KNOWN: `KNOWN_STALE` exit 1 (extra entry), `KNOWN_REV_MISMATCH` exit 2 (wrong revision);
  ratchet `RATCHET_REV_STALE` exit 2 (wrong revision).
## Findings (severity order)

1. **MEDIUM-HIGH — the recorded final rule and the delivered artifact are different arms.**
   `ExecClaimsFidelity.md:1-5` calls its run "FINAL-RULE BASELINE (L1 clause-guard pairing)…
   nonok=357", and `SCORECARD.md:1690`, `LOG.md:1686`, `corpus/lessons/round-36.md:20` plus commit
   subject `3d5760a` all describe clause-guarded pairing (right span refused when
   `) , ; . | — – →` separates it; both sides → `noid`). Committed code has no guard:
   `scripts/claims-check.mjs:300` `const pair = next ?? prev ?? null;` — plain right-first. The
   guarded arm exists only in `/fast/scratch/kumitate-r36/w/ExecClaimsFidelity.patch` (+183-201) and
   is not integrated (`git show HEAD:scripts/claims-check.mjs` has no `FIDELITY_RIGHT_BLOCK`).
   The frozen contract's rule is the unguarded one, so the code is contract-conformant but the lane
   record/commit/executor report are wrong, **and the before number is 543, not 357**. Reconcile:
   integrate the guarded arm (re-measure; after should stay 0 — guards only move anchors to ungated
   `noid`) or correct the prose and commit.
2. **MEDIUM — `SCORECARD.md:316` refutes its own score.** The `coverage:runtime-layer` row still
   reads `` `floor(10 × 11/11 × 83/92)` = **9** ... round 18 `` while its score cell is `10`,
   `SCORECARD.md:293` says `R_sections=92`, and `PROXY: MATCH` measured
   `R=92/92 coverage:runtime-layer=10`. C2's primary evidence pointer still says 9.
3. **LOW-MEDIUM — a zero-anchor note line is printed**, violating "one line per note with
   anchors > 0": `FIDELITY note=corpus/knowledge/native-judge-pipeline.md anchors=0 …` (after
   output line 8). Cause: the print loop iterates every note (`scripts/claims-check.mjs:344`).
4. **LOW — recorded proxy quotes are stale by one.** `SCORECARD.md:399`, `LOG.md:1692`,
   `corpus/lessons/round-36.md:38` quote `C2=81/81`; the stanza (`SCORECARD.md:288-289`) and a
   re-run read `C2=82/82` (two new note files with rows landed after the quote).
5. **LOW — pairability boundary.** `scripts/claims-check.mjs:302` accepts a symbol matching
   `/[A-Za-z_]/`; the contract only forbids spans that are *only* punctuation/digits, so a 3+-char
   underscore-only token pairs under the code but not the contract, and non-ASCII letters are
   refused. No impact observed on this corpus; boundary note, not a measured defect.
## Residual risk

- CLEAN gates only `elsewhere + absent`; the after run leaves `dead=168`, `noid=539`
  (ok=867/1574), both diagnostics by contract. CLEAN is not "every anchor verified".
- The fidelity walk is a second section parse (`scripts/claims-check.mjs:247-313`), not a reuse of
  `probeSections`; it agrees today (184 gate sections, 20 notes, 0 nonok) but can drift.
- `PROXY: MATCH` still carries `PIN_UNPINNED` (sources-check); cite-check, round-gate, kimi-census
  and sources-check verdicts carry no `src-rev=` — C1's lesson scopes the claim to the three pinned
  gates + sweep. No resume path exists (`counts.resume=0`), so `resume_continuity_v1` is N/A.

## Verification gaps

- I did not re-implement FIDELITY from the contract (falsify wave's job); before/after use the
  delivered arm. The 543-vs-588 prototype delta is class boundary (unique-path resolution; one
  shared-note section counted once), not per-anchor audited here.
- For (b)(c)(d) the before side uses the 0614092 arms — the new flags do not exist there (usage/64),
  so "same arm" symmetry is exact only for (a). The 168 dead ranges and 539 noid anchors were not
  inspected for liveness/pairing; out of this item's gated quantity.
