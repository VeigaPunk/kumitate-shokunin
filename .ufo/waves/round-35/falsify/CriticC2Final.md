ATTACK C2 verdict=holds defects=3

# Attack on C2 — coverage:script-layer 9 → 10 (`S=88/88` at `31c465f1`)

## Replication (all measured on the pinned read-only clone)

- Pin: `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; `status --porcelain` 0 lines; `test -w …/scripts` → READONLY.
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)` (plus retained `PIN_UNPINNED sources-check` warn).
- `node scripts/claims-check.mjs --src …` → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`, errors=0.
- Set equality: `claims-check --json` → 88 distinct `inFamily` section files over S rows; `diff` vs `{ls src/scripts/*.mjs; find src/scripts -mindepth 2 -type f}` → SET_EQUAL. No padding, no omission; `S1–S7` sections = 28 distinct files, `28 + 60 = 88` checks out.
- `git diff --name-status 964f443e 31c465f1 -- scripts` → 2 A (`omp-route-grammar.mjs`, `ufo-swarm-registry.mjs`), 6 D (5 members + non-member `dev-verify.sh`), 61 M. 63→60 is a **measurement**, not a registry change: S8's definition (script-layer remainder) is unchanged; the pre-registration rule governs definition changes, not re-measurement. S021 owns the source.
- `grep -c '^## '` = 66 = 60 member sections + 6 prose heads; `## Departed members …` has no backticked path head → `RE_CHUNK_HEAD` skips it (departed five counted nowhere); no departed member retains a `## ` section in any corpus note.
- `--selftest` 107/107; pins `proxy-check`/`claims-check`/`kimi-census` match stanza; `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` = 79 = C2_total.
- My own re-derivation of the gate semantics over the S8 note: all 60 sections have ≥1 live own-file anchor and ≥1 verbatim symbol (gate definition). All 60 `(N L)` size claims match `wc -l` at the pin.

## Answered questions

**Honest 10?** Under the declared standard — yes, and the standard is quoted honestly: "≥1 anchor in the member's own file and ≥1 symbol verbatim in it". The gate does NOT check symbol-on-line fidelity; 624 non-ok anchors in S1–S7 notes are counted debt in LOG.md:1629-1633 and SCORECARD Limits (b). A counted section needs only ONE live anchor and ONE verbatim symbol — a section can be 90% dead anchors and still count. That is a disclosed tradeoff, not a hidden one; the canonical judge should weigh whether "named at internals level" requires more than this floor.

**63→60 measurement or registry change?** Measurement. Family grammar and remainder definition unchanged; the cell records the new census at the pin.

**Any section not describing its member at 31c465f1?** Yes — defect 1 below. It predates the range (was equally false at `964f443e`), so it is inherited debt the round carried, not new damage — but the claim's evidence line says changed members were re-verified and the in-note stale sections are not disclosed anywhere, unlike the S1–S7 count.

## Defect 1 — `fleet-ledger-rotate.test.mjs` section is materially false (counted anyway)

`corpus/knowledge/remaining-scripts-census.md:566-583` claims the suite "re-reads every rotated result through `loadLifecycleLedger` (`scripts/fleet-ledger-rotate.test.mjs:46`)", imports "`validateLifecycleEvent` (`:47`)", holds "43 `test()` cases", covers "the invalid-row preservation rule (`:2360`) and a four-case lock family ending at (`:2634`)". At `31c465f1` the file is 2325 L: `grep -n loadLifecycleLedger|validateLifecycleEvent scripts/fleet-ledger-rotate.test.mjs` → 0 hits (the symbol lives in `fleet-dispatcher.mjs`/`fleet-ledger-read.mjs`, not this file); `grep -c "test("` → 37, not 43; `:2360`/`:2634` are past EOF and `grep -n "lock"` finds no lock-family tests at the tail. False at `964f443e` too (`git show 964f443e:…|wc -l` = 2325, same absence). Section counts because other anchors/symbols hit. Minimal fix: delete the `loadLifecycleLedger`/`validateLifecycleEvent`/`:2360`/`:2634` clauses and correct 43→37 (or re-census the section).

## Defect 2 — 36 dead own-file anchors inside the S8 note, undisclosed

Replicating the gate's `RE_PATHISH`/`RE_BARE` logic over the note at the pin: 462 live own anchors, **36 dead own anchors** across 15 sections (past-EOF or blank-endpoint). Examples: `ufo-mission-lifecycle.mjs` `:278/:280/:282/:285` (file is 267 L — the refusal-sentence semantics survive at :253-265, anchors dead since before 964f443e); `local-helper.mjs` `:363`/`:366` (360 L); `ufo-state-retention.mjs` `:1664-1677` (end line blank; symbol at :1664); `ufo-mission-lifecycle.mjs` is the clearest false-pointer case. No `SECTION_DEAD_ANCHOR` fires because each section keeps ≥1 live anchor — the disclosed "gate checks only liveness" weakness applies inside the claimed artifact itself. LOG.md discloses 624 non-ok anchors for S1–S7 notes but no figure for the S8 note; the Axes row's "re-anchored … 36 S8 member sections" reads as if the note were clean. Minimal fix: record the in-note dead-anchor count in LOG.md round 35 (one line), or re-anchor the 36.

## Defect 3 — stale census-provenance sentences

~15 sections still say "re-censused 2026-10-14 against origin HEAD `964f443e`" while carrying new pin anchors and appending "re-anchored at 31c465f1" (e.g. `:501` check-hand-authored-sets, `:633` prepare-ephemeral-fleet, `:673` ufo-godspeed-inject.test, `:748` ufo-night-watchdog.test, `:762` ufo-state-census); `prepare-ephemeral-fleet.test` (:637) re-anchored with no rider; `land-fleet-run` (:596) fuses both revisions mid-sentence. Cosmetic provenance inconsistency. Minimal fix: uniform "re-censused at `31c465f1` (round 35)" wording.

## Out-of-scope observation

`fidelity.mjs` run on the integrated note reports the one residual R-layer regression: `loop-driver.md` cites `loop_driver.rs:110 CHECKPOINT_PROTOCOL_VERSION`, now declared at :111 (live-but-moved; gate-clean, fidelity-stale). Recorded for the R-layer reviewer.

## Bottom line for the judge

88/88 ⇒ 10 replicates exactly and is honest **as defined** (distinct in-family member files, each with ≥1 live own anchor + verbatim symbol; set equality proven). The attack could not move the number. What it found is thinner gate semantics than "describes its member" implies — defect 1 is a counted section with false clauses — plus undisclosed in-note anchor debt (defect 2) and provenance noise (defect 3). Fixable defects, not a reason to reject the integer; the fidelity floor is the standing tradeoff already recorded in Limits (b).

No tools installed. Lane tree untouched; all checks ran against the read-only pin.
