CRITIC axes operability=8 harms=0 coverage=10

`coverage=` is the retired aggregate, derived. At 02:42:26 the lane tree read `PROXY: MATCH … C2=82/82 coverage=10 … src-rev=31c465f15669`. From 02:34 to 02:41:38 it read **harms=1** (retired 10 → 9) because notes landed before their README rows (§2, H1). That harm cleared, but one landing is still pending.

# CriticAxes — round 36 build wave (read-only critic)

Source was read only through `/fast/scratch/kumitate-r36/src` @ `31c465f15669`. Trees measured:
- **P**: pristine master `0614092`, both as the lane before integration (~02:20) and as the clone `w/KumitateR36.ReviewClaimsArm/pristine`.
- **S**: the executor clones `w/*/lane`, 02:27–02:33, scored with the lane gates via `--self <clone>`.
- **I**: the lane working tree while the L1 integrates, snapshotted at 02:31, 02:34, 02:38, 02:39:58, 02:41:38 and 02:42:26.
  By 02:42 I already held all 15 re-anchored notes, pin-aware claims-check, the re-pins, the 9 R5/R7 sections, `pinned-evidence.md` and `lessons/round-36.md`.

There is no final tree yet: `knowledge/anchor-fidelity-gate.md` has not landed. The verdict line describes I at 02:42:26.

## 1. Operability: up only, integer held at 8
How the terms count:
- **A** counts files named `*.mjs|*.js|*.sh|*.py`. Only `.git` is pruned, so `.ufo/` and `.jj/` are walked (`scripts/proxy-check.mjs@0614092:325,499-503,752`; `SCORECARD.md:25-27`).
- **C** counts `SKILL.md` lines matching `/^\s*- \[/` (`proxy-check.mjs@0614092:326,753`; `SCORECARD.md:39-40`).

| tree | A | C | f_O = (A+C)/(A+C+3) | floor(10·f_O) |
|---|---|---|---|---|
| P | 7 | 13 | 20/23 = 0.8696 | 8 |
| I (every snapshot) | 7 | 14 | 21/24 = 0.8750 | **8** |

- **f_O rises 0.0054 and the integer holds at 8.** Reaching 9 needs A+C ≥ 27 (27/30), six more honest terms. C1 therefore moves f_O and the pass rate, not the integer.
- **C is honest.**
  - All 14 `- [` lines (`SKILL.md:627-640` in I) match the runner grammar `CHECKLIST_RE` (`scripts/surface-probe.mjs@0614092:182,799-803`). The proxy regex and the strict runner agree at 14/14.
  - SKILL.md has no other `- [` line; the scribes' `- [~]` boxes go to SHONEN.md and the report.
- **A is unchanged.**
  - None of the 11 patches in `w/` adds a runnable file or changes a mode. ExecPinFiles adds three 100644 JSON files.
  - `ExecProxyPin.patch` changes no derivation line: zero hits on its +/- lines for RE_RUNNABLE, RE_CHECKLIST, walkFiles, operabilityOf, coverageOf, TERM_KEYS, RE_README_ROW or CORPUS_DIRS.
  - The patched claims-check leaves the `probeSections` output that proxy-check imports unchanged (S 88/88 everywhere).
- **Exec-bit counting would also give 7, but a different set.** `kimi-census.mjs` is 0644 and `round-35/mutate-distinct.sh.txt` is 0755. Only the extension rule is frozen.

## 2. Coverage family
| score | previous (`SCORECARD.md:314-317`) | P | I 02:41:38 | I 02:42:26 |
|---|---|---|---|---|
| coverage (retired) floor(10·C1·C2) | 10 declared | **9** (19/19·79/80) | **9** (19/19·81/82) | 10 (19/19·82/82) |
| coverage:script-layer | 10 | 10 (8/8·88/88) | 10 | 10 (88/88) |
| coverage:runtime-layer | 9 | 9 (11/11·83/92) | 10 | 10 (92/92), the C2 claim |
| coverage:kimi-layer | 10 | 10 (5/5·51/51) | 10 | 10 (51/51) |

**H1: transient harm, cleared; one landing pending.** Notes kept landing before their README rows:
- `knowledge/pinned-evidence.md` had no row from 02:34 to 02:39:58 (80/81).
- `lessons/round-36.md` had no row at 02:41:38 (81/82). floor(10·81/82) = 9, giving `C2_TOTAL_DRIFT` and `AXES_DRIFT coverage declared=10 computed=9`, so item 8 was red and the checklist read 13/14.
- Both rows had landed by 02:42:26.
- **Pending guard:** `anchor-fidelity-gate.md` must land in the same step as its row, with the stanza at `C2=83 C2_total=83`. A note without a row reads 82/83, which floors to 9.

**The premise "stays 10 at C2 80/80" is off.**
- It was already 9 at P. Integrator commit `0614092` landed `lessons/round-35-verifier-spotcheck.md` without a row (`baseline/proxy-pin.txt`). ExecReadmeRow repairs this; log it as a repair, not as a coverage gain.
- The end state is 83/83, not 80/80, if ScribeReadmeMap's three notes all land.
- This miss recurs: `corpus/README.md:93` records the same one for round 34 ("landed without one, `C2_TOTAL_DRIFT` 77→78"). [INFERENCE] The round-36 verifier spot-check will probably reopen `AXES_DRIFT` when round 37 opens.

**Script layer: held.**
- S is 88/88 in every slice and in I.
- Across the 20 modified notes, `git diff` shows 9 heading `+` lines (the R5/R7 headings) and **0** `-#` lines.
- `--row S8 --strict` on the S8 slice returns MATCH with sections=60 and adv=0.

**Runtime layer: up 1, which is the C2 claim, not a harm.**
- The R5 slice reads R 87 (+4), the R7 slice 88 (+5), and their union 92 (`laneC2` and I).
- R9's `local_ship_tests.rs` section is `SECTION_FILE_NOT_MEMBER`, and only `inFamily===true` counts (`proxy-check.mjs@0614092:600`). The new R7 section is therefore a new identity, so the count does not fall into a 91/92 trap.
- In I: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`. The fidelity sweep reads `local-ship` ok=42/42 and `native-admission-detail` ok=38/38, both nonok=0.

**Kimi layer: held.**
- K sections come only from `corpus/knowledge/kimi-*.md` (`proxy-check.mjs@0614092:337,700`). No round edit touches those notes, and none of the new notes match the pattern.
- K_members is read live from `~/.kimi-code` (51). Any drift there would be host drift, not round drift.

**C1 19/19: held.** No registry row changed. If the R5/R7 fourth cell is rewritten, it must still start with `yes` (`proxy-check.mjs@0614092:545`). Writing `**yes**` would cost C1 (retired score to 9) and C1r 10/11 (runtime score to 9).

## 3. Gate-script edits: other drift
- **Pins.** I shows `pins=6 match`. Re-pin again after any later byte change. `PIN_UNPINNED sources-check` is a warning by design (`SCORECARD.md:331-335`).
- **Verdict format.** The new verdict suffix ` src-rev=…)` keeps the checklist substrings matching as prefixes. `round-gate.mjs` parses no verdict text. The hermetic fixtures carry no pin, so the literals at `proxy-check.mjs@0614092:1560,1569` still hold.
- **Line identity shift.** The checklist moved from 618-630 to 627-640 when 9 prose lines were inserted above it. `claims.md:13` and the baseline cite items by line ("620, 625"), so pair before/after items by label, not by `SKILL.md:<n>`.
- **A-inflation guard.** The scratch roots hold helper `*.mjs` files (ExecFidRemainder `repair/propose/sides.mjs`, ExecFidOps `fidelity-measure.mjs` at 0755, ExecFidSighting `ref.mjs`).
  - Copying any of them into `.ufo/` makes A=8 and fires `A_DRIFT`. Re-declaring A=8 would be false provenance, so keep the `*.mjs.txt` precedent.
  - Do not commit `w/ExecFidRemainder/lane/corpus/knowledge/remaining-scripts-census.md.bak`.

## 4. Adjacent counterexamples (C1 claim scope, not axis harms)
**Item 1 still reads the operator checkout.**
- `SKILL.md:627` runs `node scripts/cite-check.mjs` with no `--src`, so it resolves `~/Projects/ufo-fsd-alpha` (`scripts/cite-check.mjs:106-119`).
- The prose at `SKILL.md:624`, "Item 1 (`cite-check`) still takes an explicit `--src`", is therefore false.
- Frozen falsifier `claims.md:24` fires, and the claim at `claims.md:19-20` ("every gate verdict line carries `src-rev=`") is unmet for `CITE_CHECK:`.
- Correction: give item 1 `--src /fast/scratch/kumitate-r36/src` and fix the prose, or disclose the falsifier as fired. A cite-check pin falls outside frozen move (d).

**Part of the fidelity burn-down is unpairing.**
- The authoritative before (the final arm run on the pristine clone) is `anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543`, not the prototype's 588.
- The after is `anchors=1574 ok=867 elsewhere=0 absent=0 dead=168 noid=539 nonok=0`.
- Of the 1494 pre-existing anchors, 470 non-ok anchors became ok, and **73 became ungated `noid`**: ops-watchers 86→137 (+51), remaining-scripts-census +11, route-probe-cluster +4, six other notes +7.
- That is 13% of the debt made uncheckable rather than repaired. Disclose `noid 466→539` beside `nonok=0`, or re-pair those 73 anchors.

**Nit.** `claims.md:19-20` quotes `src-rev=31c465f1566` (11 hex), while PIN v1 prints 12 (`31c465f15669`). The quoted string is a substring of the printed one, so it is compatible.

## 5. Smallest safe corrections (all fixable)
1. Land `anchor-fidelity-gate.md` together with its README row, set `C2=83 C2_total=83`, and re-run `node scripts/proxy-check.mjs`; it should return MATCH.
2. Fix item 1 (§4), or record its falsifier as fired.
3. Put `noid 466→539` into the C1 after-numbers.

**Tradeoff, not a defect.** Items 3, 8, 10 and 14 need `/fast/scratch/kumitate-r36/src` (persistent xfs, `findmnt`). If that clone is removed they exit 2 until the recreate line in `.ufo/pins/origin.json` is run.

## Commands (read-only; cwd = lane unless noted)
- **P, before the L1 began editing:** `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src --json` → `A=7 C=13 C1=19/19 C2=79/80 coverage=9 S=88/88 R=83/92 K=51/51`, findings C2_TOTAL_DRIFT, AXES_DRIFT, PIN_UNPINNED.
- **13 executor clones:** `node scripts/proxy-check.mjs --self <clone> --src <pin> --json`.
  - C=14 only in ExecChecklistRewrite, and C2 80/80 only in ExecReadmeRow.
  - R reads 87 (R5), 88 (R7) and 92 (laneC2). S 88 and A 7 everywhere.
- **I at 02:41:38:** `node scripts/proxy-check.mjs` → `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=81 computed=82 …; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED …; src-rev=31c465f15669)`.
- **I at 02:42:26:** `PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=82/82 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`.
- **Term counts:**
  - `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → 7.
  - `grep -c '^\s*- \[' SKILL.md` → 14.
  - The notes-vs-rows `diff` printed `< knowledge/pinned-evidence.md` (02:39:58), then `< lessons/round-36.md` (02:41:38). At 02:42:26 notes = rows = 82.
- **Checklist grammar:** a `node -e` CHECKLIST_RE loop over the integrated SKILL.md → `C(proxy RE)=14 parsed(CHECKLIST_RE)=14`.
- **Claims and fidelity:**
  - `node scripts/claims-check.mjs` → `CLAIMS: MATCH (… sections=184 adv=4 src-rev=31c465f15669)`.
  - `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`.
  - The same command with `--self <pristine clone>` → `FIDELITY: DRIFT (nonok=543 …)`.
- **Headings:** `git --no-optional-locks diff -- corpus/knowledge | grep -E '^[-+]#{1,6} '` → 9 `+`, 0 `-`.
- **Footprint:** no tools were installed or updated. Nothing was written except this report; no git or jj mutation.
